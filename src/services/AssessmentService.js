import { supabase } from './SupabaseClient'

class AssessmentService {
  async getAll() {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('is_active', true)
      .is('deleted_at', null)
    if (error) throw error
    return data
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  }

  async create(payload) {
    const { data, error } = await supabase
      .from('assessments')
      .insert([payload])
      .select()
    if (error) throw error
    return data[0]
  }

  async update(id, payload) {
    const { data, error } = await supabase
      .from('assessments')
      .update(payload)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  }

  async delete(id) {
    const { data, error } = await supabase
      .from('assessments')
      .update({ deleted_at: new Date().toISOString(), is_active: false })
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  }
}

export default new AssessmentService()
