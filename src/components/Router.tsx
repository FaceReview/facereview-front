import { Suspense, lazy } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ScreenContainer from './ScreenContainer/ScreenContainer';
import AnimatedLogo from './AnimatedLogo/AnimatedLogo';

const WatchPage = lazy(() => import('pages/watch/WatchPage'));
const AuthPage = lazy(() => import('../pages/auth/AuthPage'));
const MainPage = lazy(() => import('../pages/main/MainPage'));
const MyPage = lazy(() => import('../pages/my/MyPage'));
const PasswordChangePage = lazy(() => import('../pages/my/PasswordChangePage'));
const EditPage = lazy(() => import('../pages/edit/EditPage'));
const TutorialPage = lazy(() => import('pages/tutorial/TutorialPage'));
const AdminPage = lazy(() => import('pages/admin/AdminPage'));

const Fallback = () => (
  <div
    style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#15151d',
    }}>
    <AnimatedLogo
      animationType="infinite"
      animatedWrapperWidth={100}
      gap={8}
      style={{ height: '60px' }}
    />
  </div>
);

const Router = () => {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route element={<ScreenContainer headerShown={true} />}>
            <Route path="/main" element={<MainPage />} />
            <Route path="/watch/:id" element={<WatchPage />} />
          </Route>
          <Route path="/auth/:step" element={<AuthPage />} />
          <Route
            element={<ScreenContainer isAdmin={true} headerShown={true} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          <Route
            element={<ScreenContainer isSignIn={true} headerShown={true} />}>
            <Route path="/my" element={<MyPage />} />
            <Route
              path="/my/password-change"
              element={<PasswordChangePage />}
            />
            <Route path="/edit" element={<EditPage />} />
          </Route>
          <Route path="/tutorial/:step" element={<TutorialPage />} />
          <Route element={<ScreenContainer headerShown={true} />}>
            <Route path="*" element={<MainPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default Router;
