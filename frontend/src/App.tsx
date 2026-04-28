/**
 * 최상위 레이아웃 컴포넌트. 라우터의 <Outlet />을 통해 페이지가 렌더링된다.
 *
 * @author Huichan Jeong
 */
import { Outlet } from 'react-router-dom';

export default function App() {
  return (
    <div className="app">
      <Outlet />
    </div>
  );
}
