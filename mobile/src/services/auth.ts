import { supabase } from '../config/supabase';
import {
  AuthChangeEvent,
  AuthError as SupabaseAuthError,
  Session,
  User,
} from '@supabase/supabase-js';
import { Platform } from 'react-native';

export type AuthError = SupabaseAuthError;

export interface SignupData {
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

/**
 * Sign up a new user
 */
export async function signUp({
  email,
  password,
  fullName,
}: SignupData): Promise<{
  user: User | null;
  error: AuthError | null;
}> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      return { user: null, error };
    }

    return { user: data.user, error: null };
  } catch (err) {
    console.error('Signup error:', err);
    return {
      user: null,
      error: new Error('An unexpected error occurred during signup') as any,
    };
  }
}

/**
 * Sign in an existing user
 */
export async function signIn({ email, password }: LoginData): Promise<{
  user: User | null;
  error: AuthError | null;
}> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error };
    }

    // For existing users, ensure they have completed onboarding
    if (data.user) {
      try {
        // Check if user has preferences
        const { data: prefs, error: prefsError } = await supabase
          .from('user_preferences')
          .select('has_completed_onboarding')
          .eq('user_id', data.user.id)
          .single();

        // Handle preferences error (e.g., no row found)
        if (prefsError && prefsError.code !== 'PGRST116') {
          // PGRST116 is "no rows found", which is expected for new users
          console.error('Error fetching user preferences:', prefsError);
        }

        // If user has no preferences or hasn't completed onboarding, create/update them
        if (!prefs || !prefs.has_completed_onboarding) {
          const { error: upsertError } = await supabase
            .from('user_preferences')
            .upsert(
              {
                user_id: data.user.id,
                has_completed_onboarding: true,
                updated_at: new Date().toISOString(),
              },
              {
                onConflict: 'user_id',
              }
            );

          if (upsertError) {
            console.error('Error updating user preferences:', upsertError);
            // Don't fail the login if preferences update fails
            // The user can still proceed and preferences can be updated later
          }
        }
      } catch (prefError) {
        // Log preference errors but don't fail the signin
        console.error('Error handling user preferences:', prefError);
      }
    }

    return { user: data.user, error: null };
  } catch (err) {
    console.error('Signin error:', err);
    return {
      user: null,
      error: new Error('An unexpected error occurred during signin') as any,
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error };
    }
    return { error: null };
  } catch (err) {
    console.error('Signout error:', err);
    return {
      error: new Error('An unexpected error occurred during signout') as any,
    };
  }
}

/**
 * Send a password reset email
 */
export async function resetPassword(email: string): Promise<{
  error: AuthError | null;
}> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.EXPO_PUBLIC_APP_URL}/reset-password`,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (err) {
    console.error('Password reset error:', err);
    return {
      error: new Error(
        'An unexpected error occurred during password reset'
      ) as any,
    };
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (err) {
    console.error('Get current user error:', err);
    return null;
  }
}

/**
 * Get the current session
 */
export async function getSession(): Promise<Session | null> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return session;
  } catch (err) {
    console.error('Get session error:', err);
    return null;
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange(callback);
}

/**
 * Update user metadata
 */
export async function updateUser(attributes: {
  email?: string;
  password?: string;
  data?: Record<string, any>;
}): Promise<{ user: User | null; error: AuthError | null }> {
  try {
    const { data, error } = await supabase.auth.updateUser(attributes);

    if (error) {
      return { user: null, error };
    }

    return { user: data.user, error: null };
  } catch (err) {
    console.error('Update user error:', err);
    return {
      user: null,
      error: new Error(
        'An unexpected error occurred during user update'
      ) as any,
    };
  }
}

/**
 * Social Auth Configurations
 */
// Social auth configuration commented out until expo-auth-session is properly configured
// const redirectUri = 'nutriai://auth/callback';

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<{
  user: User | null;
  error: AuthError | null;
}> {
  try {
    // For now, return an error as social auth needs to be configured
    return {
      user: null,
      error: new Error(
        'Google sign-in is not yet configured. Please use email/password for now.'
      ) as any,
    };
  } catch (err) {
    console.error('Google sign-in error:', err);
    return {
      user: null,
      error: new Error('Failed to authenticate with Google') as any,
    };
  }
}

/**
 * Sign in with Apple
 */
export async function signInWithApple(): Promise<{
  user: User | null;
  error: AuthError | null;
}> {
  try {
    // For now, return an error as social auth needs to be configured
    return {
      user: null,
      error: new Error(
        'Apple sign-in is not yet configured. Please use email/password for now.'
      ) as any,
    };
  } catch (err) {
    console.error('Apple sign-in error:', err);
    return {
      user: null,
      error: new Error('Failed to authenticate with Apple') as any,
    };
  }
}

/**
 * Delete user account
 */
export async function deleteAccount(): Promise<{ error: AuthError | null }> {
  try {
    // First, get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        error: new Error('No user logged in') as any,
      };
    }

    // Delete user data from database tables
    // This should trigger cascading deletes if foreign keys are set up properly
    const { error: deleteError } = await supabase.rpc('delete_user_data', {
      user_id: user.id,
    });

    if (deleteError) {
      console.error('Error deleting user data:', deleteError);
      return {
        error: new Error('Failed to delete user data') as any,
      };
    }

    // Sign out the user
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      return { error: signOutError };
    }

    return { error: null };
  } catch (err) {
    console.error('Delete account error:', err);
    return {
      error: new Error(
        'An unexpected error occurred while deleting account'
      ) as any,
    };
  }
}
