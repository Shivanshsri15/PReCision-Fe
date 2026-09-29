import { reviewApi } from '../../services/reviewApi';

/**
 * Holds the in-flight analysis thunk so it can be cancelled from any page;
 * the analysis keeps running when the user navigates away.
 */
let activeAnalysis: { abort: (reason?: string) => void } | null = null;

export function trackAnalysis(promise: { abort: (reason?: string) => void }): void {
  activeAnalysis = promise;
}

/** Stops the run on the server (analyses outlive their stream) and detaches locally. */
export function cancelActiveAnalysis(runId?: string | null): void {
  if (runId) void reviewApi.cancelRun(runId).catch(() => undefined);
  activeAnalysis?.abort('cancelled');
  activeAnalysis = null;
}
