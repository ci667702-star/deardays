import { Suspense } from 'react';
import { Route, Routes } from 'react-router';
import BootScreen from './components/layout/BootScreen.jsx';
import { ProtectedRoute, PublicOnlyRoute } from './components/layout/RouteGuards.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import { RoomProvider } from './context/RoomContext.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import DesktopLayout from './layouts/DesktopLayout.jsx';
import { Pages } from './pages/lazyPages.js';

const {
  CalendarPage,
  DashboardPage,
  DiaryDetailPage,
  DiaryEditorPage,
  LettersPage,
  LoginPage,
  MyPage,
  NotFoundPage,
  RegisterPage,
  RoomPage,
  SearchPage,
  TodoPage,
} = Pages;

export default function App() {
  return (
    <Suspense fallback={<BootScreen />}>
      <AppRoutes />
    </Suspense>
  );
}

function AppRoutes() {
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
