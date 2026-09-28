import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/ui/EmptyState';

export function NotFoundPage() {
  return (
    <EmptyState
      className="min-h-[60vh]"
      icon={Compass}
      title="Page not found"
      description="The page you are looking for does not exist."
      action={
        <Link to="/" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          Back to overview
        </Link>
      }
    />
  );
}
