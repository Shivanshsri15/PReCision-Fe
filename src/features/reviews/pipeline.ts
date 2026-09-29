export type PipelineStepId =
  | 'fetch'
  | 'inputGuard'
  | 'retriever'
  | 'qualityReview'
  | 'securityReview'
  | 'performanceReview'
  | 'joinNode'
  | 'bugDetection'
  | 'assembler';

export type StepStatus = 'idle' | 'running' | 'done' | 'failed';

export interface PipelineStep {
  id: PipelineStepId;
  label: string;
  description: string;
  dependsOn: PipelineStepId[];
  /** Internal graph nodes that are tracked but not rendered. */
  hidden?: boolean;
}

/** Mirrors the backend LangGraph topology so progress can be inferred from finished nodes. */
export const PIPELINE_STEPS: PipelineStep[] = [
  { id: 'fetch', label: 'Fetch Pull Request', description: 'Load the diff and base files from GitHub', dependsOn: [] },
  { id: 'inputGuard', label: 'Input Guard', description: 'Validate input and sanitize PR data', dependsOn: ['fetch'] },
  { id: 'retriever', label: 'RAG Retriever', description: 'Retrieve relevant codebase context', dependsOn: ['inputGuard'] },
  { id: 'qualityReview', label: 'Quality Agent', description: 'Readability and maintainability', dependsOn: ['retriever'] },
  { id: 'securityReview', label: 'Security Agent', description: 'Vulnerabilities and secrets', dependsOn: ['retriever'] },
  { id: 'performanceReview', label: 'Performance Agent', description: 'Complexity and resource usage', dependsOn: ['retriever'] },
  { id: 'bugDetection', label: 'Bug Detection Agent', description: 'Correctness and edge cases', dependsOn: ['retriever'] },
  {
    id: 'joinNode',
    label: 'Join',
    description: 'Merge parallel reviews',
    dependsOn: ['qualityReview', 'securityReview', 'performanceReview', 'bugDetection'],
    hidden: true,
  },
  { id: 'assembler', label: 'Report Assembler', description: 'Generate the final report', dependsOn: ['joinNode'] },
];

export const PARALLEL_AGENT_IDS: PipelineStepId[] = ['qualityReview', 'securityReview', 'performanceReview', 'bugDetection'];

export const isPipelineStepId = (value: string): value is PipelineStepId =>
  PIPELINE_STEPS.some((step) => step.id === value);
