/**
 * Holds the in-flight analysis thunk so it can be cancelled from any page;
 * the analysis keeps running when the user navigates away.
 */
let activeAnalysis: { abort: (reason?: string) => void } | null = null;

export function trackAnalysis(promise: { abort: (reason?: string) => void }): void {
  activeAnalysis = promise;
}

export function cancelActiveAnalysis(): void {
  activeAnalysis?.abort('cancelled');
  activeAnalysis = null;
}
