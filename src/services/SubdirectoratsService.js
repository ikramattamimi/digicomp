import { supabase } from './SupabaseClient'

class SubDirectoratService {
  // Get all active subdirectorats
  async getAll() {
    const { data, error } = await supabase
      .from('subdirectorats')
      .select('*')
      .is('deleted_at', null)
    if (error) throw error
    return data
  }

  async getActive() {
    const { data, error } = await supabase
      .from('subdirectorats')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
    if (error) throw error
    return data
  }

  // Get subdirectorat by id
  async getById(id) {
    const { data, error } = await supabase
      .from('subdirectorats')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  }

  // Create new subdirectorat
  async create(payload) {
    const { data, error } = await supabase
      .from('subdirectorats')
      .insert([payload])
      .select()
    if (error) throw error
    return data[0]
  }

  // Update subdirectorat
  async update(id, payload) {
    const { data, error } = await supabase
      .from('subdirectorats')
      .update(payload)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  }

  // Soft delete subdirectorat
  async delete(id) {
    const { data, error } = await supabase
      .from('subdirectorats')
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  }
}

export default new SubDirectoratService()
