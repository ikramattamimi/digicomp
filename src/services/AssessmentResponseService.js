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
      .select('id')
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

    return {
      participantId: data[0].id,
      assessorProfileId: data[0].assessor_profile_id
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
  async saveDraft({ assessmentId, subjectProfileId, mode, responses }) {
    const t0 = Date.now()
    console.log('[AssessmentResponseService.saveDraft] Mulai', {
      assessmentId,
      subjectProfileId,
      mode,
      jumlahIndikator: Object.keys(responses || {}).length,
      kunciResponses: Object.keys(responses || {})
    })

    try {
      const { assessorProfileId } = await this._resolveAssessorProfileId({
        assessmentId,
        subjectProfileId,
        mode
      })
      console.log('[AssessmentResponseService.saveDraft] Assessor ter-resolve', {
        assessorProfileId
      })

      if (!assessorProfileId) {
        console.warn('[AssessmentResponseService.saveDraft] Peserta untuk mode ini tidak ditemukan pada assessment', {
          assessmentId,
          subjectProfileId,
          mode
        })
        throw new Error('Peserta untuk mode ini tidak ditemukan pada assessment')
      }

      const now = new Date().toISOString()
      console.log('[AssessmentResponseService.saveDraft] Normalisasi responses', { now })

      // Normalisasi payload responses
      // Contoh dukungan:
      // - responses[12] = 4
      // - responses[12] = { value: 4, text: "catatan" }
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

      console.log('[AssessmentResponseService.saveDraft] Normalisasi selesai', {
        rowsCount: rows.length,
        indikator: rows.map(r => r.indicator_id),
        ringkas: rows.map(r => ({
          indicator_id: r.indicator_id,
          value: r.response_value,
          hasText: !!r.response_text
        }))
      })

      if (rows.length === 0) {
        console.log('[AssessmentResponseService.saveDraft] Tidak ada baris untuk disimpan, keluar lebih awal')
        return []
      }

      const indicatorIds = rows.map(r => r.indicator_id)
      console.log('[AssessmentResponseService.saveDraft] Soft-delete jawaban lama (jika ada)', {
        assessmentId,
        subjectProfileId,
        assessorProfileId,
        indicatorIds
      })

      // Soft-delete jawaban lama untuk indikator yang sama (agar tidak duplikasi)
      const { error: delErr } = await supabase
        .from('assessment_responses')
        .update({ deleted_at: now, updated_at: now })
        .eq('assessment_id', assessmentId)
        .eq('subject_profile_id', subjectProfileId)
        .eq('assessor_profile_id', assessorProfileId)
        .in('indicator_id', indicatorIds)
        .is('deleted_at', null)

      if (delErr) {
        console.error('[AssessmentResponseService.saveDraft] Gagal soft-delete jawaban lama', delErr)
        throw delErr
      }

      console.log('[AssessmentResponseService.saveDraft] Soft-delete selesai, lanjut insert', {
        rowsCount: rows.length
      })

      // Insert batch jawaban baru
      const { data: inserted, error: insErr } = await supabase
        .from('assessment_responses')
        .insert(rows)
        .select()

      if (insErr) {
        console.error('[AssessmentResponseService.saveDraft] Gagal insert jawaban baru', insErr)
        throw insErr
      }

      console.log('[AssessmentResponseService.saveDraft] Insert selesai', {
        insertedCount: (inserted || []).length,
        durasiMs: Date.now() - t0
      })

      return inserted
    } catch (err) {
      console.error('[AssessmentResponseService.saveDraft] Error', {
        message: err?.message,
        stack: err?.stack
      })
      throw err
    } finally {
      console.log('[AssessmentResponseService.saveDraft] Selesai', { durasiTotalMs: Date.now() - t0 })
    }
  },

  // Submit: sama seperti saveDraft (tidak ada kolom status submit di tabel)
  async submit({ assessmentId, subjectProfileId, mode, responses }) {
    const inserted = await this.saveDraft({ assessmentId, subjectProfileId, mode, responses })
    return { success: true, count: inserted.length }
  },
};

export default AssessmentResponseService;
