import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../../context/AuthContext.jsx';
import BootScreen from './BootScreen.jsx';

/** 로그인한 사용자만 들어올 수 있다. 아니면 로그인 화면으로 보내고, 로그인 후 원래 페이지로 돌아온다. */
export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <BootScreen />;
  if (status !== 'authenticated') return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

/** 이미 로그인했다면 로그인·회원가입 화면 대신 원래 가려던 곳으로 */
export function PublicOnlyRoute() {
  const { status } = useAuth();
  const location = useLocation();
  if (status === 'loading') return <BootScreen />;
  if (status === 'authenticated') {
    const from = location.state?.from;
    const target = from ? `${from.pathname}${from.search ?? ''}` : '/';
    return <Navigate to={target} replace />;
  }
  return <Outlet />;
}
