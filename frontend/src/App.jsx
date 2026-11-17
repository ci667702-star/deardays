import { Route, Routes } from 'react-router';
import { ProtectedRoute, PublicOnlyRoute } from './components/layout/RouteGuards.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { RoomProvider } from './context/RoomContext.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import DesktopLayout from './layouts/DesktopLayout.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import DiaryDetailPage from './pages/DiaryDetailPage.jsx';
import DiaryEditorPage from './pages/DiaryEditorPage.jsx';
import LettersPage from './pages/LettersPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import MyPage from './pages/MyPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import RoomPage from './pages/RoomPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import TodoPage from './pages/TodoPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <RoomProvider>
              <NotificationProvider>
                <DesktopLayout />
              </NotificationProvider>
            </RoomProvider>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="/room" element={<RoomPage />} />
          <Route path="/diaries/new" element={<DiaryEditorPage />} />
          <Route path="/diaries/:id" element={<DiaryDetailPage />} />
          <Route path="/diaries/:id/edit" element={<DiaryEditorPage />} />
          <Route path="/todos" element={<TodoPage />} />
          <Route path="/letters" element={<LettersPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/me" element={<MyPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
