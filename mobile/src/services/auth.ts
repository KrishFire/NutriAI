import { supabase } from '../config/supabase';
import { User } from '@supabase/supabase-js';

export interface AuthError {
  message: string;
  code?: string;
}

export interface SignupData {
  email: string;
  password: string;
  fullName?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResult {
  user: User | null;
  error: AuthError | null;
}

/**
 * Sign up a new user with email and password
 */
export const signUp = async ({
  email,
  password,
  fullName,
}: SignupData): Promise<AuthResult> => {
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
      return {
        user: null,
        error: {
          message: error.message,
          code: error.message,
        },
      };
    }

    return {
      user: data.user,
      error: null,
    };
  } catch (err) {
    return {
      user: null,
      error: {
        message: 'An unexpected error occurred during signup',
      },
    };
  }
};

/**
 * Sign in an existing user with email and password
 */
export const signIn = async ({
  email,
  password,
}: LoginData): Promise<AuthResult> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return {
        user: null,
        error: {
          message: error.message,
          code: error.message,
        },
      };
    }

    return {
      user: data.user,
      error: null,
    };
  } catch (err) {
    return {
      user: null,
      error: {
        message: 'An unexpected error occurred during login',
      },
    };
  }
};

/**
 * Sign out the current user
 */
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        error: {
          message: error.message,
          code: error.message,
        },
      };
    }

    return { error: null };
  } catch (err) {
    return {
      error: {
        message: 'An unexpected error occurred during logout',
      },
    };
  }
};

/**
 * Get the current session
 */
export const getCurrentSession = async () => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error('Error getting session:', error);
      return null;
    }

    return session;
  } catch (err) {
    console.error('Unexpected error getting session:', err);
    return null;
  }
};

/**
 * Get the current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error('Error getting user:', error);
      return null;
    }

    return user;
  } catch (err) {
    console.error('Unexpected error getting user:', err);
    return null;
  }
};

/**
 * Reset password for a user
 */
export const resetPassword = async (
  email: string
): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'nutriai://reset-password',
    });

    if (error) {
      return {
        error: {
          message: error.message,
          code: error.message,
        },
      };
    }

    return { error: null };
  } catch (err) {
    return {
      error: {
        message: 'An unexpected error occurred during password reset',
      },
    };
  }
};
