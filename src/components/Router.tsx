import WatchPage from 'pages/watch/WatchPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthPage from '../pages/auth/AuthPage';
import MainPage from '../pages/main/MainPage';
import ScreenContainer from './ScreenContainer/ScreenContainer';
import MyPage from '../pages/my/MyPage';
import EditPage from '../pages/edit/EditPage';
import TutorialPage from 'pages/tutorial/TutorialPage';
import AdminPage from 'pages/admin/AdminPage';

const Router = () => {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route element={<ScreenContainer headerShown={true} />}>
          <Route path="/main" element={<MainPage />} />
          <Route path="/watch/:id" element={<WatchPage />} />
          <Route path="*" element={<MainPage />} />
        </Route>
        <Route element={<ScreenContainer headerShown={false} />}>
          <Route path="/auth/:step" element={<AuthPage />} />
        </Route>
        <Route element={<ScreenContainer isAdmin={true} headerShown={true} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
        <Route element={<ScreenContainer isSignIn={true} headerShown={true} />}>
          <Route path="/my" element={<MyPage />} />
          <Route path="/edit" element={<EditPage />} />
        </Route>
        <Route path="/tutorial/:step" element={<TutorialPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
