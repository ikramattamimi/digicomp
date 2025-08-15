// Enhanced Assessment Service for comprehensive assessment management
// Handles all CRUD operations and complex queries for assessments

import { supabase } from './SupabaseClient'
import { ASSESSMENT_STATUS } from '../constants/assessmentConstants'

class AssessmentService {
  
  // Get all assessments with optional filtering
  async getAll(includeInactive = false) {
    let query = supabase
      .from('assessments')
      .select(`
        *,
        assessment_competencies (
          id,
          competency_id,
          competencies (
            id,
            name,
            description
          )
        )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    // Filter by active status if needed
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Get assessments by status
  async getByStatus(status) {
    const { data, error } = await supabase
      .from('assessments')
      .select(`
        *,
        assessment_competencies (
          id,
          competency_id,
          competencies (
            id,
            name,
            description
          )
        )
      `)
      .eq('status', status)
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // Get assessment by ID with full details
  async getById(id) {
    const { data, error } = await supabase
      .from('assessments')
      .select(`
        *,
        assessment_competencies (
          id,
          competency_id,
          competencies!inner (
            id,
            name,
            description,
            indicators!inner (
              id,
              name,
              description,
              statement_text
            )
          )
        ),
        assessment_participants (
          id,
          subject_profile_id,
          assessor_profile_id,
          subject_profile:profiles!subject_profile_id (
            id,
            name,
            nrp,
            position,
            position_type
          ),
          assessor_profile:profiles!assessor_profile_id (
            id,
            name,
            nrp,
            position,
            position_type
          )
        )
      `)
      .eq('assessment_competencies.competencies.indicators.is_active', true)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Get assessments for specific user (as participant)
  async getByParticipant(userId) {
  const { data, error } = await supabase
    .from('assessments')
    .select(`
      *,
      assessment_participants (
        id,
        subject_profile_id,
        assessor_profile_id,
        status
      )
    `)
    .or(`subject_profile_id.eq.${userId},assessor_profile_id.eq.${userId}`, { foreignTable: 'assessment_participants' })
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

  // Create new assessment
  async create(payload) {
    const { data, error } = await supabase
      .from('assessments')
      .insert([{
        ...payload,
        status: payload.status || ASSESSMENT_STATUS.DRAFT
      }])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // Update assessment
  async update(id, payload) {
    const { data, error } = await supabase
      .from('assessments')
      .update({
        ...payload,
        // updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // Update assessment status
  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('assessments')
      .update({ 
        status,
        // updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // Soft delete assessment
  async delete(id) {
    const { data, error } = await supabase
      .from('assessments')
      .update({ 
        deleted_at: new Date().toISOString(), 
        is_active: false 
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // Get assessment statistics
  async getStatistics() {
    const { data, error } = await supabase
      .from('assessments')
      .select('status')
      .eq('is_active', true)
      .is('deleted_at', null);
    
    if (error) throw error;
    
    // Count by status
    const stats = {
      total: data.length,
      draft: data.filter(a => a.status === ASSESSMENT_STATUS.DRAFT).length,
      in_progress: data.filter(a => a.status === ASSESSMENT_STATUS.IN_PROGRESS).length,
      done: data.filter(a => a.status === ASSESSMENT_STATUS.DONE).length
    };
    
    return stats;
  }

  // Check if assessment can be modified (only draft status)
  async canModify(id) {
    const { data, error } = await supabase
      .from('assessments')
      .select('status')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data.status === ASSESSMENT_STATUS.DRAFT;
  }

  // Publish assessment (change from draft to in_progress)
  async publish(id) {
    return this.updateStatus(id, ASSESSMENT_STATUS.IN_PROGRESS);
  }

  // Complete assessment (change to done)
  async complete(id) {
    return this.updateStatus(id, ASSESSMENT_STATUS.DONE);
  }

  // Pause assessment (set status back to draft)
  async pause(assessmentId) {
    const { data, error } = await supabase
      .from('assessments')
      .update({ 
        status: ASSESSMENT_STATUS.DRAFT,
        // updated_at: new Date().toISOString()
      })
      .eq('id', assessmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export default new AssessmentService()
