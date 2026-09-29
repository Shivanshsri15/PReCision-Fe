import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import type { AnalyzeParams } from '../../services/reviewApi';
import { prPath } from '../../utils/keys';
import { trackAnalysis } from './analysisController';
import { analyzePr, resumeAnalysis } from './reviewsThunks';

/** Starts a streamed analysis and opens the live pipeline page. */
export function useStartAnalysis() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return useCallback(
    (params: AnalyzeParams) => {
      trackAnalysis(dispatch(analyzePr(params)));
      navigate(`${prPath(params.owner, params.repo, params.number)}/analyze`);
    },
    [dispatch, navigate],
  );
}

/** Re-attaches to a run still in progress on the server and opens the live pipeline page. */
export function useResumeAnalysis() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return useCallback(
    (params: AnalyzeParams, runId: string) => {
      trackAnalysis(dispatch(resumeAnalysis({ params, runId })));
      navigate(`${prPath(params.owner, params.repo, params.number)}/analyze`);
    },
    [dispatch, navigate],
  );
}
