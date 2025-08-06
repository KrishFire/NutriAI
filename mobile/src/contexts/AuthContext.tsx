import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
  useCallback,
} from 'react';
import { View, ActivityIndicator } from 'react-native';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';
import {
  signUp,
  signIn,
  signOut,
  resetPassword,
  getCurrentUser,
  signInWithGoogle,
  signInWithApple,
  AuthError,
  SignupData,
  LoginData,
} from '../services/auth';
import {
  UserPreferences,
  UserPreferencesInput,
  getOrCreateUserPreferences,
  updateUserPreferences,
  PreferencesError,
  DEFAULT_PREFERENCES,
} from '../services/userPreferences';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  preferences: UserPreferences | null;
  loading: boolean;
  preferencesLoading: boolean;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;
  isLoading: boolean;
  signUp: (
    data: SignupData
  ) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (
    data: LoginData
  ) => Promise<{ user: User | null; error: AuthError | null }>;
  signInWithGoogle: () => Promise<{
    user: User | null;
    error: AuthError | null;
  }>;
  signInWithApple: () => Promise<{
    user: User | null;
    error: AuthError | null;
  }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePreferences: (
    preferences: UserPreferencesInput
  ) => Promise<{ error: PreferencesError | null }>;
  refreshPreferences: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferencesLoading, setPreferencesLoading] = useState(false);

  // Helper function to load user preferences
  const loadUserPreferences = async (userId: string) => {
    setPreferencesLoading(true);
    try {
      const result = await getOrCreateUserPreferences(userId);
      if (result.error) {
        console.error('Error loading user preferences:', result.error);
        // Use default preferences if there's an error
        setPreferences({
          ...DEFAULT_PREFERENCES,
          id: '',
          user_id: userId,
        } as UserPreferences);
      } else {
        setPreferences(result.data);
      }
    } catch (err) {
      console.error('Unexpected error loading preferences:', err);
      // Use default preferences on error
      setPreferences({
        ...DEFAULT_PREFERENCES,
        id: '',
        user_id: userId,
      } as UserPreferences);
    } finally {
      setPreferencesLoading(false);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Error getting initial session:', error);
        } else {
          setSession(session);
          setUser(session?.user ?? null);

          // Load preferences if user is authenticated
          if (session?.user) {
            await loadUserPreferences(session.user.id);
          }
        }
      } catch (err) {
        console.error('Unexpected error getting initial session:', err);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for authentication state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);

      setSession(session);
      setUser(session?.user ?? null);

      // Handle preferences based on auth event
      if (session?.user) {
        // Load preferences on sign in
        await loadUserPreferences(session.user.id);
      } else {
        // Clear preferences on sign out
        setPreferences(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update user preferences
  const updatePrefs = async (
    newPreferences: UserPreferencesInput
  ): Promise<{ error: PreferencesError | null }> => {
    if (!user) {
      return { error: { message: 'No user logged in' } };
    }

    setPreferencesLoading(true);
    try {
      const result = await updateUserPreferences(user.id, newPreferences);
      if (result.error) {
        console.error('Error updating preferences:', result.error);
        return { error: result.error };
      }

      setPreferences(result.data);
      return { error: null };
    } catch (err) {
      console.error('Unexpected error updating preferences:', err);
      return { error: { message: 'Failed to update preferences' } };
    } finally {
      setPreferencesLoading(false);
    }
  };

  // Refresh preferences from database
  const refreshPreferences = async () => {
    if (!user) return;
    await loadUserPreferences(user.id);
  };

  const completeOnboarding = useCallback(async () => {
    if (!user) return;

    try {
      await updatePrefs({ has_completed_onboarding: true });
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }, [user, updatePrefs]);

  // Social sign-in methods - using auth service implementations
  const handleSignInWithGoogle = useCallback(async () => {
    const result = await signInWithGoogle();
    if (result.error) {
      console.log('Google sign-in:', result.error.message);
    }
    return result;
  }, []);

  const handleSignInWithApple = useCallback(async () => {
    const result = await signInWithApple();
    if (result.error) {
      console.log('Apple sign-in:', result.error.message);
    }
    return result;
  }, []);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      preferences,
      loading,
      preferencesLoading,
      isAuthenticated: !!session,
      hasCompletedOnboarding: preferences?.has_completed_onboarding ?? false,
      isLoading: loading,
      signUp,
      signIn,
      signInWithGoogle: handleSignInWithGoogle,
      signInWithApple: handleSignInWithApple,
      signOut,
      resetPassword,
      updatePreferences: updatePrefs,
      refreshPreferences,
      completeOnboarding,
    }),
    [
      user,
      session,
      preferences,
      loading,
      preferencesLoading,
      updatePrefs,
      refreshPreferences,
      completeOnboarding,
      handleSignInWithGoogle,
      handleSignInWithApple,
    ]
  );

  // Show loading indicator while initializing auth state
  if (loading && !session && !user) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#10B981" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
