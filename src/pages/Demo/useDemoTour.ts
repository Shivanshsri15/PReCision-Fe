import { useCallback, useMemo, useState } from 'react';

export const DEMO_STEPS = [
  'welcome',
  'repositories',
  'indexing',
  'pullRequest',
  'analyzing',
  'findings',
  'done',
] as const;

export type DemoStepId = (typeof DEMO_STEPS)[number];

export const DEMO_STEP_COPY: Record<DemoStepId, { title: string; body: string }> = {
  welcome: {
    title: 'Try PReCision in 1 minute',
    body: 'This is a practice run with sample code. You do not need GitHub or a Gemini key. You will index a repo, review a pull request, and see the findings.',
  },
  repositories: {
    title: 'Step 1 — Index a repository',
    body: 'Click “Index branch”. In the real app, this teaches PReCision about your codebase so reviews use related files, not only the diff.',
  },
  indexing: {
    title: 'Indexing in progress',
    body: 'Files are being prepared for search. This is a short simulation — a real index takes longer on big repos.',
  },
  pullRequest: {
    title: 'Step 2 — Review a pull request',
    body: 'Turn on “Post comments to GitHub” if you want findings written on the PR as review comments. Then click Analyze.',
  },
  analyzing: {
    title: 'Agents are reviewing',
    body: 'Four specialists check quality, security, performance, and bugs at the same time. Results appear when this finishes.',
  },
  findings: {
    title: 'Step 3 — Read the results',
    body: 'Use filters to narrow findings. Click one to open the Diff tab on that line. Toggle comments on or off to see how posting to GitHub looks.',
  },
  done: {
    title: 'Ready for your own code?',
    body: 'Sign in with GitHub to connect your repos. You will add your own Gemini key; reviews use that key and stay on your account.',
  },
};

export function useDemoTour(initial: DemoStepId = 'welcome') {
  const [step, setStep] = useState<DemoStepId>(initial);
  const index = DEMO_STEPS.indexOf(step);

  const goNext = useCallback(() => {
    setStep((current) => {
      const i = DEMO_STEPS.indexOf(current);
      return DEMO_STEPS[Math.min(i + 1, DEMO_STEPS.length - 1)]!;
    });
  }, []);

  const goTo = useCallback((id: DemoStepId) => setStep(id), []);

  const copy = useMemo(() => DEMO_STEP_COPY[step], [step]);
  const isLast = step === 'done';

  return { step, index, total: DEMO_STEPS.length, copy, goNext, goTo, isLast };
}
