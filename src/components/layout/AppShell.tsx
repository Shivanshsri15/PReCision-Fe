import { Outlet } from 'react-router-dom';
import { useEventStream } from '../../features/events/useEventStream';
import { IndexProgressModal } from '../repositories/IndexProgressModal';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell() {
  useEventStream();

  return (
    <div className="min-h-full">
      <Sidebar />
      <div className="flex min-h-full flex-col lg:pl-60">
        <Topbar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
      <IndexProgressModal />
    </div>
  );
}
