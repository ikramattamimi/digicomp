// Enhanced Assessment Competency Service
// Manages the relationship between assessments and competencies

import { supabase } from './SupabaseClient'

class AssessmentCompetencyService {
  
  // Get all assessment competencies with competency details
  async getAll() {
    const { data, error } = await supabase
      .from('assessment_competencies')
      .select(`
        *,
        competencies (
          id,
          name,
          description,
          is_active
        ),
        assessments (
          id,
          name,
          status
        )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // Get competencies for specific assessment
  async getByAssessmentId(assessmentId) {
    const { data, error } = await supabase
      .from('assessment_competencies')
      .select(`
        *,
        competencies (
          id,
          name,
          description,
          is_active,
          indicators (
            id,
            name,
            description,
            statement_text,
            is_active
          )
        )
      `)
      .eq('assessment_id', assessmentId)
      .is('deleted_at', null)
      .order('competency_id');
    
    if (error) throw error;
    return data;
  }

  // Get assessments that use specific competency
  async getByCompetencyId(competencyId) {
    const { data, error } = await supabase
      .from('assessment_competencies')
      .select(`
        *,
        assessments (
          id,
          name,
          description,
          status,
          start_date,
          end_date
        )
      `)
      .eq('competency_id', competencyId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // Get assessment competency by ID with full details
  async getById(id) {
    const { data, error } = await supabase
      .from('assessment_competencies')
      .select(`
        *,
        competencies (
          id,
          name,
          description,
          is_active,
          indicators (
            id,
            name,
            description,
            statement_text,
            is_active
          )
        ),
        assessments (
          id,
          name,
          description,
          status
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  // Add competency to assessment
  async create(payload) {
    const { data, error } = await supabase
      .from('assessment_competencies')
      .insert([payload])
      .select(`
        *,
        competencies (
          id,
          name,
          description,
          indicators (
            id,
            name,
            description,
            statement_text
          )
        )
      `);
    
    if (error) throw error;
    return data[0];
  }

  // Add multiple competencies to assessment
  async createMultiple(assessmentId, competencyIds) {
    const payload = competencyIds.map(competencyId => ({
      assessment_id: assessmentId,
      competency_id: competencyId
    }));
    
    const { data, error } = await supabase
      .from('assessment_competencies')
      .insert(payload)
      .select(`
        *,
        competencies (
          id,
          name,
          description,
          indicators (
            id,
            name,
            description,
            statement_text
          )
        )
      `);
    
    if (error) throw error;
    return data;
  }

  // Update assessment competency (though rarely needed)
  async update(id, payload) {
    const { data, error } = await supabase
      .from('assessment_competencies')
      .update(payload)
      .eq('id', id)
      .select(`
        *,
        competencies (
          id,
          name,
          description
        )
      `);
    
    if (error) throw error;
    return data[0];
  }

  // Remove competency from assessment (soft delete)
  async delete(id) {
    const { data, error } = await supabase
      .from('assessment_competencies')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // Remove all competencies from assessment
  async deleteByAssessmentId(assessmentId) {
    const { data, error } = await supabase
      .from('assessment_competencies')
      .update({ deleted_at: new Date().toISOString() })
      .eq('assessment_id', assessmentId)
      .select();
    
    if (error) throw error;
    return data;
  }

  // Check if competency is already assigned to assessment
  async isCompetencyAssigned(assessmentId, competencyId) {
    const { data, error } = await supabase
      .from('assessment_competencies')
      .select('id')
      .eq('assessment_id', assessmentId)
      .eq('competency_id', competencyId)
      .is('deleted_at', null);
    
    if (error) throw error;
    return data.length > 0;
  }

  // Replace all competencies for an assessment
  async replaceAssessmentCompetencies(assessmentId, competencyIds) {
    // First, soft delete existing competencies
    await this.deleteByAssessmentId(assessmentId);
    
    // Then, add new competencies
    if (competencyIds.length > 0) {
      return this.createMultiple(assessmentId, competencyIds);
    }
    
    return [];
  }
}

export default new AssessmentCompetencyService()
