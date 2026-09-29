import {
  API_URL,
  apiClient,
  authHeader,
  messageFromBody,
  notifyUnauthorized,
  type ApiError,
} from '../api/client';
import { endpoints } from '../api/endpoints';
import { readSse } from '../api/sse';
import type { AnalysisResult, PostedReview, ReviewRun } from '../types/review';

export interface RunsQuery {
  limit?: number;
  owner?: string;
  repo?: string;
}

export interface AnalyzeParams {
  owner: string;
  repo: string;
  number: number;
  postComments: boolean;
}

export interface AnalysisStartedEvent {
  title: string;
  files: number;
  baseBranch: string;
  headSha: string;
}

export interface AnalysisRunEvent {
  runId: string;
  startedAt?: string;
}

export interface AnalyzeStreamHandlers {
  onStarted: (event: AnalysisStartedEvent) => void;
  onRun: (event: AnalysisRunEvent) => void;
  onStep: (node: string) => void;
  onResult: (result: AnalysisResult) => void;
  onReview: (review: PostedReview) => void;
}

async function openStream(url: string, init: RequestInit, signal?: AbortSignal): Promise<ReadableStream<Uint8Array>> {
  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      headers: { Accept: 'text/event-stream', ...authHeader() },
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw { status: 0, message: 'Analysis cancelled' } satisfies ApiError;
    throw {
      status: 0,
      message: error instanceof Error ? error.message : 'Network error',
    } satisfies ApiError;
  }

  if (!response.ok || !response.body) {
    if (response.status === 401) notifyUnauthorized();
    const body = await response.json().catch(() => null);
    throw {
      status: response.status,
      message: messageFromBody(body, `Analysis failed (${response.status})`),
    } satisfies ApiError;
  }
  return response.body;
}

async function consumeAnalysis(
  body: ReadableStream<Uint8Array>,
  handlers: AnalyzeStreamHandlers,
  signal?: AbortSignal,
): Promise<AnalysisResult> {
  let result: AnalysisResult | null = null;
  try {
    for await (const { event, data } of readSse(body)) {
      switch (event) {
        case 'started':
          handlers.onStarted(data as AnalysisStartedEvent);
          break;
        case 'run':
          handlers.onRun(data as AnalysisRunEvent);
          break;
        case 'step':
          handlers.onStep((data as { node: string }).node);
          break;
        case 'result':
          result = data as AnalysisResult;
          handlers.onResult(result);
          break;
        case 'review':
          handlers.onReview(data as PostedReview);
          break;
        case 'error':
          throw data as ApiError;
      }
    }
  } catch (error) {
    if (signal?.aborted) throw { status: 0, message: 'Analysis cancelled' } satisfies ApiError;
    throw error;
  }

  if (!result) {
    throw { status: 0, message: 'The analysis stream ended without a result' } satisfies ApiError;
  }
  return result;
}

export const reviewApi = {
  async listRuns(query: RunsQuery = {}): Promise<ReviewRun[]> {
    const { data } = await apiClient.get<ReviewRun[]>(endpoints.codeReview.runs, { params: query });
    return data;
  },

  async getRun(runId: string): Promise<ReviewRun> {
    const { data } = await apiClient.get<ReviewRun>(endpoints.codeReview.run(runId));
    return data;
  },

  async markComplete(runId: string): Promise<ReviewRun> {
    const { data } = await apiClient.post<ReviewRun>(endpoints.codeReview.completeRun(runId));
    return data;
  },

  async listPullRequestRuns(owner: string, repo: string, number: number): Promise<ReviewRun[]> {
    const { data } = await apiClient.get<ReviewRun[]>(endpoints.codeReview.prRuns(owner, repo, number));
    return data;
  },

  async cancelRun(runId: string): Promise<{ cancelled: boolean }> {
    const { data } = await apiClient.post<{ cancelled: boolean }>(endpoints.codeReview.cancelRun(runId));
    return data;
  },

  /**
   * Starts (or joins) the PR's background analysis over SSE, forwarding
   * pipeline events to `handlers`. Aborting only detaches; the server keeps
   * running the analysis. Resolves with the final result; rejects with an ApiError.
   */
  async analyzeStream(
    { owner, repo, number, postComments }: AnalyzeParams,
    handlers: AnalyzeStreamHandlers,
    signal?: AbortSignal,
  ): Promise<AnalysisResult> {
    const url = `${API_URL}${endpoints.codeReview.analyzeStream(owner, repo, number)}?postComments=${postComments}`;
    const body = await openStream(url, { method: 'POST' }, signal);
    return consumeAnalysis(body, handlers, signal);
  },

  /** Re-attaches to a running (or recently finished) run, replaying its events so far. */
  async attachStream(runId: string, handlers: AnalyzeStreamHandlers, signal?: AbortSignal): Promise<AnalysisResult> {
    const body = await openStream(`${API_URL}${endpoints.codeReview.runStream(runId)}`, { method: 'GET' }, signal);
    return consumeAnalysis(body, handlers, signal);
  },
};
