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

export interface AnalyzeStreamHandlers {
  onStarted: (event: AnalysisStartedEvent) => void;
  onStep: (node: string) => void;
  onResult: (result: AnalysisResult) => void;
  onReview: (review: PostedReview) => void;
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

  /**
   * Runs the analysis over the SSE endpoint, forwarding pipeline events to
   * `handlers`. Resolves with the final result; rejects with an ApiError.
   */
  async analyzeStream(
    { owner, repo, number, postComments }: AnalyzeParams,
    handlers: AnalyzeStreamHandlers,
    signal?: AbortSignal,
  ): Promise<AnalysisResult> {
    const url = `${API_URL}${endpoints.codeReview.analyzeStream(owner, repo, number)}?postComments=${postComments}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
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

    let result: AnalysisResult | null = null;
    for await (const { event, data } of readSse(response.body)) {
      switch (event) {
        case 'started':
          handlers.onStarted(data as AnalysisStartedEvent);
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

    if (!result) {
      throw { status: 0, message: 'The analysis stream ended without a result' } satisfies ApiError;
    }
    return result;
  },
};
