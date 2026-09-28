import { Bug, Gauge, ShieldAlert, Sparkles, type LucideIcon } from 'lucide-react';
import type { DomainKey } from '../types/review';

export const DOMAIN_ORDER: DomainKey[] = ['quality', 'security', 'performance', 'bugDetection'];

export const DOMAIN_META: Record<DomainKey, { label: string; icon: LucideIcon; tone: string; badge: string }> = {
  quality: {
    label: 'Quality',
    icon: Sparkles,
    tone: 'bg-indigo-50 text-indigo-600',
    badge: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  },
  security: {
    label: 'Security',
    icon: ShieldAlert,
    tone: 'bg-rose-50 text-rose-600',
    badge: 'bg-rose-50 text-rose-700 ring-rose-200',
  },
  performance: {
    label: 'Performance',
    icon: Gauge,
    tone: 'bg-emerald-50 text-emerald-600',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  },
  bugDetection: {
    label: 'Bug Detection',
    icon: Bug,
    tone: 'bg-violet-50 text-violet-600',
    badge: 'bg-violet-50 text-violet-700 ring-violet-200',
  },
};
