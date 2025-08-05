import { supabase } from './SupabaseClient'

class ProfileService {
  async getAll() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, subdirectorats(name)')
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('name', { ascending: true })
    if (error) throw error
    return data
  }

  async getBySubDirectorat(subdirectorat) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('subdirectorat_id', subdirectorat)
    if (error) throw error
    return data
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  }

  async create(payload) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([payload])
      .select()
    if (error) throw error
    return data[0]
  }

  async update(id, payload) {
    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  }

  async delete(id) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  }
}

export default new ProfileService()
