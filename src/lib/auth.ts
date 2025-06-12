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
        console.log('🔍 Validating registration link token:', metadata.linkToken);
        const { data: isValid, error: validationError } = await supabase
          .rpc('validate_registration_link', { token_param: metadata.linkToken });

        if (validationError || !isValid) {
          console.error('❌ Registration link validation failed:', validationError);
          throw new Error('Netinkama arba nebegaliojanti registracijos nuoroda');
        }
        console.log('✅ Registration link validation passed');
      }

      if (!this.validatePassword(password)) {
        throw new Error('Password does not meet security requirements');
      }

      // Use standard Supabase auth signup - trigger will auto-confirm
      console.log('📝 Creating user account...');
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
      console.log('✅ User account created successfully:', data.user?.id);

      // If registration is successful and we have a link token, mark it as used
      if (metadata.linkToken && data.user) {
        console.log('🔗 Processing registration link for user:', data.user.id);
        
        try {
          // Mark link as used
          const { error: updateError } = await supabase
            .from('registration_links')
            .update({ 
              used_at: new Date().toISOString(),
              used_by: data.user.id
            })
            .eq('link_token', metadata.linkToken);
          
          if (updateError) {
            console.error('❌ Failed to mark link as used:', updateError);
            throw updateError;
          }
          console.log('✅ Link marked as used');

          // Get link details for points
          const { data: linkRow, error: linkError } = await supabase
            .from('registration_links')
            .select('id, points')
            .eq('link_token', metadata.linkToken)
            .single();
          
          if (linkError) {
            console.error('❌ Failed to fetch link details:', linkError);
            throw linkError;
          }
          console.log('📊 Link details:', linkRow);

          if (linkRow) {
            // Insert usage tracking
            const { error: usageInsertError } = await supabase
              .from('registration_link_usages')
              .insert({
                link_id: linkRow.id,
                user_id: data.user.id,
                used_at: new Date().toISOString(),
              });
            
            if (usageInsertError) {
              console.error('❌ Failed to insert registration_link_usages:', usageInsertError);
            } else {
              console.log('✅ Usage tracking recorded');
            }

            // Award bonus points if the link has points > 0
            if (linkRow.points > 0) {
              console.log('🎁 Awarding bonus points:', linkRow.points);
              const { error: bonusError } = await supabase
                .from('bonus_entries')
                .insert({
                  user_id: data.user.id,
                  user_name: metadata.name,
                  course_name: 'Registracija su pakvietimo nuoroda',
                  price: 0,
                  points_awarded: linkRow.points,
                });
              
              if (bonusError) {
                console.error('❌ Failed to award bonus points:', bonusError);
                throw bonusError;
              }
              console.log('✅ Bonus points awarded successfully');
            } else {
              console.log('ℹ️ No points to award (link has 0 points)');
            }
          }
        } catch (linkProcessingError) {
          console.error('❌ Error processing registration link:', linkProcessingError);
          // Don't throw here - user registration should still succeed even if bonus points fail
        }
      }

      return { data, error: null };

    } catch (error: any) {
      console.error('❌ Registration error:', error);
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