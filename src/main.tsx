import { lazy, StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter } from 'react-router';
import { RouterProvider } from 'react-router/dom';
import { LazyLoad } from './components/LazyLoad';

import './main.css';
import { redirect } from 'react-router';
import ErrorBoundary from './components/ErrorBoundary';

const AdminEntry = lazy(() => import('./domains/admin'));
const HomeEntry = lazy(() => import('./domains/home'));
const RedeemEntry = lazy(() => import('./domains/redeem'));
const QueryEntry = lazy(() => import('./domains/query'));

const router = createBrowserRouter([
  import.meta.env.PROD
    ? {
        path: '/',
        element: (
          <div>
            <div>Hello, World!</div>
          </div>
        ),
      }
    : {
        path: '/',
        loader: async () => redirect('/home-8j0vm'),
      },
  {
    path: '/home-8j0vm',
    element: LazyLoad(HomeEntry),
  },
  {
    path: '/admin-1an3m',
    element: LazyLoad(AdminEntry),
    errorElement: <ErrorBoundary />,
  },
  {
    path: '/redeem/:product',
    element: LazyLoad(RedeemEntry),
  },
  {
    path: '/public/query-cdk',
    element: LazyLoad(QueryEntry),
  },
  {
    path: '/*',
    element: <div>404</div>,
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
