import clsx from 'clsx';
import { scoreTone } from '../../utils/severity';

interface ScoreRingProps {
  score: number;
  max?: number;
  size?: number;
  caption?: string;
}

export function ScoreRing({ score, max = 5, size = 112, caption }: ScoreRingProps) {
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(1, Math.max(0, score / max));
  const tone = scoreTone(score);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} className="fill-none stroke-slate-100" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          className={clsx('fill-none transition-[stroke-dashoffset] duration-700', tone.stroke)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={clsx('text-2xl font-bold', tone.text)}>
          {score.toFixed(1)}
          <span className="text-sm font-medium text-slate-400">/{max}</span>
        </span>
        <span className="text-[11px] text-slate-500">{caption ?? tone.label}</span>
      </div>
    </div>
  );
}
