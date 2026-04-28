/**
 * 애플리케이션 라우팅 설정.
 *
 * @author Huichan Jeong
 */
import { createBrowserRouter } from 'react-router-dom';
import App from '@/App';
import HomePage from '@/pages/HomePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [{ index: true, element: <HomePage /> }],
  },
]);
