import { supabase } from './SupabaseClient'

class ProfileService {
  async getAll(filters = {}) {
    let query = supabase
      .from('profiles')
      .select('*, subdirectorats(name)')
      .order('name', { ascending: true });

    // Apply filters
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active);
    } else {
      query = query.eq('is_active', true);
    }

    if (filters.position_type) {
      query = query.eq('position_type', filters.position_type);
    }

    if (filters.subdirectorat_id) {
      query = query.eq('subdirectorat_id', filters.subdirectorat_id);
    }

    // Always exclude soft deleted
    query = query.is('deleted_at', null);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async getBySubDirectorat(subdirectorat) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('subdirectorat_id', subdirectorat)
    if (error) throw error
    return data
  }

  async getAdmin() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, subdirectorats(name)')
      .eq('position_type', "ADMIN")
      .is('deleted_at', null)
      .order('name', { ascending: true })
    if (error) throw error
    return data
  }

  async getMyAccount(uuid) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, subdirectorats(name)')
      .eq('id', uuid)
      .is('deleted_at', null)
      .single()
    if (error) throw error
    return data
  }

  async getSupervisor(profileId) {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        supervisor:supervisor_id (
          id,
          name,
          email,
          position_type,
          subdirectorat_id,
          subdirectorats(name)
        )
      `)
      .eq('id', profileId)
      .is('deleted_at', null)
      .single()
    if (error) throw error
    return data?.supervisor || null
  }

  async getSubordinates(supervisorId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, subdirectorats(name)')
      .eq('supervisor_id', supervisorId)
      .is('deleted_at', null)
      .order('name', { ascending: true })
    if (error) throw error
    return data
  }

  async getSubordinatesWithAssessment(supervisorId, assessmentId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, subdirectorats(name), assessment_participants(assessment_id, response_submitted)')
      .or(`assessment_id.eq.${assessmentId}`, {foreignTable: 'assessment_participants'})
      .eq('supervisor_id', supervisorId)
      .is('deleted_at', null)
      .order('name', { ascending: true })
    if (error) throw error
    return data
  }


  async getStaff() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, subdirectorats(name)')
      .or('position_type.eq.BAWAHAN, position_type.eq.ATASAN')
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
      .select('*, subdirectorats(name)')
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
