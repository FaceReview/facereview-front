import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AuthState {
  is_sign_in: boolean;
  is_admin: boolean;
  user_id: string;
  user_name: string;
  user_profile: number;
  user_tutorial: number;
  user_announced: boolean;
  user_favorite_genres: string[];
  access_token: string;
  refresh_token: string;
  setToken: ({
    access_token,
    refresh_token,
  }: {
    access_token: string;
    refresh_token: string;
  }) => void;
  setUserInfo: ({
    is_admin,
    is_sign_in,
    access_token,
    refresh_token,
    user_id,
    user_name,
    user_profile,
    user_tutorial,
    user_favorite_genres,
  }: {
    is_admin: boolean;
    is_sign_in: boolean;
    access_token: string;
    refresh_token: string;
    user_id: string;
    user_name: string;
    user_profile: number;
    user_tutorial: number;
    user_favorite_genres: string[];
  }) => void;
  setUserAnnounced: ({ user_announced }: { user_announced: boolean }) => void;
  setUserName: ({ user_name }: { user_name: string }) => void;
  setUserProfile: ({ user_profile }: { user_profile: number }) => void;
  setUserFavoriteGenres: ({
    user_favorite_genres,
  }: {
    user_favorite_genres: string[];
  }) => void;
  setTempToken: ({ access_token }: { access_token: string }) => void;
}

export const useAuthStorage = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        is_admin: false,
        is_sign_in: false,
        user_id: '',
        user_name: '',
        user_profile: 0,
        user_tutorial: 0,
        user_announced: false,
        user_favorite_genres: [],
        access_token: '',
        refresh_token: '',
        setToken: ({ access_token, refresh_token }) =>
          set(() => ({
            access_token: access_token,
            refresh_token: refresh_token,
          })),
        setUserInfo: ({
          is_admin,

          is_sign_in,
          access_token,
          refresh_token,
          user_id,
          user_name,
          user_profile,
          user_tutorial,
          user_favorite_genres,
        }) =>
          set(() => ({
            is_admin: is_admin,
            is_sign_in: true,
            access_token,
            refresh_token,
            user_id,
            user_name,
            user_profile,
            user_tutorial,
            user_favorite_genres,
          })),
        setUserAnnounced: ({ user_announced }) =>
          set(() => ({
            user_announced,
          })),
        setUserName: ({ user_name }) =>
          set(() => ({
            user_name,
          })),
        setUserProfile: ({ user_profile }) =>
          set(() => ({
            user_profile,
          })),
        setUserFavoriteGenres: ({ user_favorite_genres }) =>
          set(() => ({
            user_favorite_genres,
          })),
        setTempToken: ({ access_token }) =>
          set(() => ({
            is_admin: false,
            is_sign_in: false,
            user_id: '',
            user_name: '',
            user_profile: 0,
            user_tutorial: 0,
            access_token: access_token,
          })),
      }),

      {
        name: 'auth-storage',
      }
    )
  )
);
