import { supabase } from './SupabaseClient'

class AuthService {
  async register({ email, password, profile }) {
    // Register user in Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })
    if (signUpError) throw signUpError
    const userId = signUpData.user?.id
    if (!userId) throw new Error('User ID not found after registration')
    // Insert profile data into profiles table
    const profilePayload = { ...profile, id: userId, email, is_active: true, deleted_at: null }
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([profilePayload])
      .select()
    if (profileError) throw profileError
    return { user: signUpData.user, profile: profileData[0] }
  }

  async login({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }

  async registerStaff({ email, password, profile }) {
    // Register staff user
    return await this.register({ email, password, profile })
  }
}

export default new AuthService()
