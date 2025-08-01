import { supabase } from './SupabaseClient'

class AssessmentResponseService {
  async getAll() {
    const { data, error } = await supabase
      .from('assessment_responses')
      .select('*')
      .is('deleted_at', null)
    if (error) throw error
    return data
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  }

  async create(payload) {
    const { data, error } = await supabase
      .from('assessment_responses')
      .insert([payload])
      .select()
    if (error) throw error
    return data[0]
  }

  async update(id, payload) {
    const { data, error } = await supabase
      .from('assessment_responses')
      .update(payload)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  }

  async delete(id) {
    const { data, error } = await supabase
      .from('assessment_responses')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  }
}

export default new AssessmentResponseService()
