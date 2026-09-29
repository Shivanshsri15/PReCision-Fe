import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { store } from './app/store';
import { ServerGate } from './components/server/ServerGate';
import { ToastViewport } from './components/ui/Toast';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <ServerGate>
        <RouterProvider router={router} />
      </ServerGate>
      <ToastViewport />
    </Provider>
  </StrictMode>,
);
