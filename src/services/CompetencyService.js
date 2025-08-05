import { supabase } from './SupabaseClient'

class CompetencyService {
  async getActive() {
    const { data, error } = await supabase
      .from('competencies')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
    if (error) throw error
    return data
  }

  async getAll() {
    const { data, error } = await supabase
      .from('competencies')
      .select('*')
      .is('deleted_at', null)
    if (error) throw error
    return data
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('competencies')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  }

  async create(payload) {
    const { data, error } = await supabase
      .from('competencies')
      .insert([payload])
      .select()
    if (error) throw error
    return data[0]
  }

  async update(id, payload) {
    const { data, error } = await supabase
      .from('competencies')
      .update(payload)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  }

  async delete(id) {
    const { data, error } = await supabase
      .from('competencies')
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  }
}

export default new CompetencyService()
