import { supabase } from './supabase';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15; // minutes

interface SignUpMetadata {
  name: string;
  phone?: string;
  linkToken?: string;
}

export const AuthService = {
  async signIn(email: string, password: string) {
    try {
      // Proceed with login directly
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        data: null,
        error: error.message || 'An error occurred during login'
      };
    }
  },

  async signUp(email: string, password: string, metadata: SignUpMetadata) {
    try {
      // First validate the registration link if provided
      if (metadata.linkToken) {
        const { data: isValid, error: validationError } = await supabase
          .rpc('validate_registration_link', { token_param: metadata.linkToken });

        if (validationError || !isValid) {
          throw new Error('Netinkama arba nebegaliojanti registracijos nuoroda');
        }
      }

      if (!this.validatePassword(password)) {
        throw new Error('Password does not meet security requirements');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata.name,
            phone: metadata.phone,
            role: 'user',
          },
        },
      });

      if (error) throw error;

      // If registration is successful and we have a link token, mark it as used
      if (metadata.linkToken) {
        await supabase
          .from('registration_links')
          .update({ 
            used_at: new Date().toISOString(),
            used_by: data.user?.id
          })
          .eq('link_token', metadata.linkToken);
      }

      return { data, error: null };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        data: null,
        error: error.message || 'An error occurred during registration'
      };
    }
  },

  validatePassword(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  },

  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error('Password reset error:', error);
      return {
        error: error.message || 'An error occurred during password reset'
      };
    }
  },

  async updatePassword(newPassword: string) {
    try {
      if (!this.validatePassword(newPassword)) {
        throw new Error('New password does not meet security requirements');
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      console.error('Password update error:', error);
      return {
        error: error.message || 'An error occurred while updating password'
      };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      console.error('Signout error:', error);
      return {
        error: error.message || 'An error occurred during sign out'
      };
    }
  }
}; 