import { supabase } from './SupabaseClient'

// Simple service skeleton for responses (adjust endpoints to your API)
const AssessmentResponseService = {
  async getAll() {
    const { data, error } = await supabase
      .from('assessment_responses')
      .select('*')
      .is('deleted_at', null)
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('assessment_responses')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  async create(payload) {
    const { data, error } = await supabase
      .from('assessment_responses')
      .insert([payload])
      .select()
    if (error) throw error
    return data[0]
  },

  async update(id, payload) {
    const { data, error } = await supabase
      .from('assessment_responses')
      .update(payload)
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  async delete(id) {
    const { data, error } = await supabase
      .from('assessment_responses')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
    if (error) throw error
    return data[0]
  },

  // Resolve assessor_profile_id untuk mode 'self' atau 'supervisor' pada assessment + subject tertentu
  async _resolveAssessorProfileId({ assessmentId, subjectProfileId, mode = 'self' }) {
    let query = supabase
      .from('profiles')
      .select('id, supervisor_id')
      .eq('id', subjectProfileId)
      .is('deleted_at', null)

    // if (mode === 'self') {
    //   query = query.eq('assessor_profile_id', subjectProfileId)
    // } else {
    //   query = query.neq('assessor_profile_id', subjectProfileId)
    // }

    const { data, error } = await query.limit(1)
    if (error) throw error
    if (!data || data.length === 0) return { participantId: null, assessorProfileId: null }

    const assessorId = mode === 'self' ? data[0].id : data[0].supervisor_id

    return {
      participantId: data[0].id,
      assessorProfileId: assessorId
    }
  },

  // Ambil semua response untuk assessment + subject + mode
  async getByAssessmentAndAssessor({ assessmentId, subjectProfileId, mode }) {
    const { assessorProfileId, participantId } = await this._resolveAssessorProfileId({
      assessmentId,
      subjectProfileId,
      mode
    })

    if (!assessorProfileId) {
      return { participantId: null, assessorProfileId: null, responses: {}, responsesArray: [] }
    }

    const { data, error } = await supabase
      .from('assessment_responses')
      .select('id, indicator_id, response_value, response_text, updated_at')
      .eq('assessment_id', assessmentId)
      .eq('subject_profile_id', subjectProfileId)
      .eq('assessor_profile_id', assessorProfileId)
      .is('deleted_at', null)

    if (error) throw error

    // Map by indicator_id untuk memudahkan pengisian form
    const responses = {}
    for (const row of data) {
      responses[row.indicator_id] = {
        id: row.id,
        value: row.response_value,
        text: row.response_text,
        updated_at: row.updated_at
      }
    }

    return {
      participantId,
      assessorProfileId,
      responses,
      responsesArray: data
    }
  },

  // Simpan draft: soft-delete jawaban lama untuk indikator yang dikirim, lalu insert batch jawaban baru
  // payload: { assessmentId, subjectProfileId, mode, responses }
  // responses bisa berupa: { [indicatorId]: number | { value?: number, text?: string } }
  async saveDraft({ assessmentId, subjectProfileId, assessorProfileId, assessmentStatus, responses }) {
    // const { assessorProfileId } = await this._resolveAssessorProfileId({
    //   assessmentId,
    //   subjectProfileId,
    //   mode
    // })

    if (!assessorProfileId) {
      throw new Error('Peserta untuk mode ini tidak ditemukan pada assessment')
    }

    const now = new Date().toISOString()

    const rows = Object.entries(responses || {}).map(([indicatorId, val]) => {
      let value = null
      let text = null
      if (typeof val === 'number') value = val
      else if (val && typeof val === 'object') {
        if (typeof val.value === 'number') value = val.value
        if (typeof val.text === 'string') text = val.text
      }

      return {
        assessment_id: assessmentId,
        indicator_id: Number(indicatorId),
        subject_profile_id: subjectProfileId,
        assessor_profile_id: assessorProfileId,
        response_value: value,
        response_text: text,
        updated_at: now
      }
    })

    if (rows.length === 0) {
      return []
    }

    const indicatorIds = rows.map(r => r.indicator_id)

    const { error: delErr } = await supabase
      .from('assessment_responses')
      .delete()
      .eq('assessment_id', assessmentId)
      .eq('subject_profile_id', subjectProfileId)
      .eq('assessor_profile_id', assessorProfileId)
      .in('indicator_id', indicatorIds)

    if (delErr) {
      throw delErr
    }

    // Insert new responses
    const { data: inserted, error: insErr } = await supabase
      .from('assessment_responses')
      .insert(rows)
      .select()

    if (insErr) {
      throw insErr
    }

    // Set participant status to submitted
    await this.setAssessmentParticipantStatus({
      assessmentId,
      subjectProfileId,
      assessorProfileId,
      status: assessmentStatus
    })

    return inserted
  },

  // Submit: sama seperti saveDraft (tidak ada kolom status submit di tabel)
  async submit({ assessmentId, subjectProfileId, assessorProfileId, assessmentStatus, responses }) {
    const inserted = await this.saveDraft({ assessmentId, subjectProfileId, assessorProfileId, assessmentStatus, responses })
    return { success: true, count: inserted.length }
  },

  // Assessor Participant
  async setAssessmentParticipantStatus({ assessmentId, subjectProfileId, assessorProfileId, status }) {
    // Check if assessment_participants record exists
    const { data: existingParticipant, error: checkError } = await supabase
      .from('assessment_participants')
      .select('id, status')
      .eq('assessment_id', assessmentId)
      .eq('subject_profile_id', subjectProfileId)
      .eq('assessor_profile_id', assessorProfileId)
      .is('deleted_at', null)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existingParticipant) {
      // Update existing participant status to submitted
      const { error: updateError } = await supabase
      .from('assessment_participants')
      .update({ status: status, updated_at: new Date().toISOString() })
      .eq('id', existingParticipant.id)

      if (updateError) throw updateError
    } else {
      // Create new participant record with submitted status
      const { error: insertError } = await supabase
      .from('assessment_participants')
      .insert([{
        assessment_id: assessmentId,
        subject_profile_id: subjectProfileId,
        assessor_profile_id: assessorProfileId,
        status: status,
      }])

      if (insertError) throw insertError
    }
  }
};

export default AssessmentResponseService;
