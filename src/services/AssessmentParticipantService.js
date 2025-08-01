import { supabase } from './SupabaseClient'

class AssessmentParticipantService {
  async getAll() {
    const { data, error } = await supabase
      .from('assessment_participants')
      .select('*')
      .is('deleted_at', null)
    if (error) throw error
    return data
  }

  async getById(id) {
    const { data, error } = await supabase
      .from('assessment_participants')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  }

  async create(payload) {
    const { data, error } = await supabase
      .from('assessment_participants')
      .insert([payload])
      .select()
    if (error) throw error
    return data[0]
  }

  async update(id, payload) {
    const { data, error } = await supabase
      .from('assessment_participants')
      .update(payload)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  }

  async delete(id) {
    const { data, error } = await supabase
      .from('assessment_participants')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  }
}

export default new AssessmentParticipantService()
