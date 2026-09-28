import type { Severity } from '../../types/review';
import { SEVERITY_META } from '../../utils/severity';
import { Badge } from './Badge';

export function SeverityBadge({ severity }: { severity: Severity }) {
  const meta = SEVERITY_META[severity];
  return (
    <Badge colorClassName={meta.badge} dot>
      {meta.label}
    </Badge>
  );
}
