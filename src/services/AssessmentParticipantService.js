// Enhanced Assessment Participant Service
// Manages participants in assessments (both subjects and assessors)

import { supabase } from './SupabaseClient'
import { getResponseType } from '../utils/assessmentUtils'

class AssessmentParticipantService {
  
  // Get all participants with profile details
  async getAll() {
    const { data, error } = await supabase
      .from('assessment_participants')
      .select(`
        *,
        subject_profile:profiles!subject_profile_id (
          id,
          name,
          nrp,
          position,
          position_type,
          subdirectorats (
            id,
            name
          )
        ),
        assessor_profile:profiles!assessor_profile_id (
          id,
          name,
          nrp,
          position,
          position_type
        ),
        assessments (
          id,
          name,
          status,
          start_date,
          end_date
        )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // Get participants for specific assessment
  async getByAssessmentId(assessmentId) {
    const { data, error } = await supabase
      .from('assessment_participants')
      .select(`
        *,
        subject_profile:profiles!subject_profile_id (
          id,
          name,
          nrp,
          position,
          position_type,
          supervisor_id,
          subdirectorats (
            id,
            name
          )
        ),
        assessor_profile:profiles!assessor_profile_id (
          id,
          name,
          nrp,
          position,
          position_type
        )
      `)
      .eq('assessment_id', assessmentId)
      .is('deleted_at', null)
      .order('subject_profile_id');
    
    if (error) throw error;
    
    // Add response_type to each participant
    return data.map(participant => ({
      ...participant,
      response_type: getResponseType(participant.subject_profile_id, participant.assessor_profile_id)
    }));
  }

  // Get unique subjects for an assessment
  async getSubjectsByAssessmentId(assessmentId) {
    const { data, error } = await supabase
      .from('assessment_participants')
      .select(`
        subject_profile_id,
        subject_profile:profiles!subject_profile_id (
          id,
          name,
          nrp,
          position,
          position_type,
          supervisor_id,
          subdirectorats (
            id,
            name
          )
        )
      `)
      .eq('assessment_id', assessmentId)
      .is('deleted_at', null);
    
    if (error) throw error;
    
    // Remove duplicates based on subject_profile_id
    const uniqueSubjects = data.reduce((acc, current) => {
      const existing = acc.find(item => item.subject_profile_id === current.subject_profile_id);
      if (!existing) {
        acc.push(current);
      }
      return acc;
    }, []);
    
    return uniqueSubjects;
  }

  // Get assessments where user is a participant
  async getByUserId(userId) {
    const { data, error } = await supabase
      .from('assessment_participants')
      .select(`
        *,
        assessments (
          id,
          name,
          description,
          status,
          start_date,
          end_date
        ),
        subject_profile:profiles!subject_profile_id (
          id,
          name,
          nrp
        ),
        assessor_profile:profiles!assessor_profile_id (
          id,
          name,
          nrp
        )
      `)
      .or(`subject_profile_id.eq.${userId},assessor_profile_id.eq.${userId}`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Add response_type and user_role to each participation
    return data.map(participant => ({
      ...participant,
      response_type: getResponseType(participant.subject_profile_id, participant.assessor_profile_id),
      user_role: participant.subject_profile_id === userId ? 'subject' : 'assessor'
    }));
  }

  // Get participant by ID with full details
  async getById(id) {
    const { data, error } = await supabase
      .from('assessment_participants')
      .select(`
        *,
        subject_profile:profiles!subject_profile_id (
          id,
          name,
          nrp,
          position,
          position_type,
          subdirectorats (
            id,
            name
          )
        ),
        assessor_profile:profiles!assessor_profile_id (
          id,
          name,
          nrp,
          position,
          position_type
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
    
    return {
      ...data,
      response_type: getResponseType(data.subject_profile_id, data.assessor_profile_id)
    };
  }

  // Add single participant
  async create(payload) {
    const { data, error } = await supabase
      .from('assessment_participants')
      .insert([payload])
      .select(`
        *,
        subject_profile:profiles!subject_profile_id (
          id,
          name,
          nrp,
          position
        ),
        assessor_profile:profiles!assessor_profile_id (
          id,
          name,
          nrp,
          position
        )
      `);
    
    if (error) throw error;
    return data[0];
  }

  // Add participants for a subject (both self and supervisor assessment)
  async createForSubject(assessmentId, subjectProfileId, supervisorProfileId) {
    const participants = [];
    
    // Self assessment participant
    participants.push({
      assessment_id: assessmentId,
      subject_profile_id: subjectProfileId,
      assessor_profile_id: subjectProfileId
    });
    
    // Supervisor assessment participant (if supervisor exists)
    if (supervisorProfileId && supervisorProfileId !== subjectProfileId) {
      participants.push({
        assessment_id: assessmentId,
        subject_profile_id: subjectProfileId,
        assessor_profile_id: supervisorProfileId
      });
    }
    
    const { data, error } = await supabase
      .from('assessment_participants')
      .insert(participants)
      .select(`
        *,
        subject_profile:profiles!subject_profile_id (
          id,
          name,
          nrp
        ),
        assessor_profile:profiles!assessor_profile_id (
          id,
          name,
          nrp
        )
      `);
    
    if (error) throw error;
    return data;
  }

  // Add multiple participants at once
  async createMultiple(participants) {
    const { data, error } = await supabase
      .from('assessment_participants')
      .insert(participants)
      .select(`
        *,
        subject_profile:profiles!subject_profile_id (
          id,
          name,
          nrp,
          position
        ),
        assessor_profile:profiles!assessor_profile_id (
          id,
          name,
          nrp,
          position
        )
      `);
    
    if (error) throw error;
    return data;
  }

  // Update participant (rarely needed)
  async update(id, payload) {
    const { data, error } = await supabase
      .from('assessment_participants')
      .update(payload)
      .eq('id', id)
      .select(`
        *,
        subject_profile:profiles!subject_profile_id (
          id,
          name,
          nrp
        ),
        assessor_profile:profiles!assessor_profile_id (
          id,
          name,
          nrp
        )
      `);
    
    if (error) throw error;
    return data[0];
  }

  // Remove participant (soft delete)
  async delete(id) {
    const { data, error } = await supabase
      .from('assessment_participants')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // Remove all participants from assessment
  async deleteByAssessmentId(assessmentId) {
    const { data, error } = await supabase
      .from('assessment_participants')
      .update({ deleted_at: new Date().toISOString() })
      .eq('assessment_id', assessmentId)
      .select();
    
    if (error) throw error;
    return data;
  }

  // Check if user is participant in assessment
  async isUserParticipant(assessmentId, userId) {
    const { data, error } = await supabase
      .from('assessment_participants')
      .select('id')
      .eq('assessment_id', assessmentId)
      .or(`subject_profile_id.eq.${userId},assessor_profile_id.eq.${userId}`)
      .is('deleted_at', null);
    
    if (error) throw error;
    return data.length > 0;
  }

  // Get participant statistics for assessment
  async getParticipantStats(assessmentId) {
    const { data, error } = await supabase
      .from('assessment_participants')
      .select('subject_profile_id, assessor_profile_id')
      .eq('assessment_id', assessmentId)
      .is('deleted_at', null);
    
    if (error) throw error;
    
    const uniqueSubjects = new Set(data.map(p => p.subject_profile_id));
    const selfAssessments = data.filter(p => p.subject_profile_id === p.assessor_profile_id);
    const supervisorAssessments = data.filter(p => p.subject_profile_id !== p.assessor_profile_id);
    
    return {
      totalParticipants: data.length,
      uniqueSubjects: uniqueSubjects.size,
      selfAssessments: selfAssessments.length,
      supervisorAssessments: supervisorAssessments.length
    };
  }
}

export default new AssessmentParticipantService()
