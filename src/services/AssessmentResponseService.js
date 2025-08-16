import { supabase } from "./SupabaseClient";

class AssessmentResponseService {
  async getAll() {
    const { data, error } = await supabase
      .from("assessment_responses")
      .select("*")
      .is("deleted_at", null);
    if (error) throw error;
    return data;
  }

  async getById(id) {
    const { data, error } = await supabase
      .from("assessment_responses")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  }

  async create(payload) {
    const { data, error } = await supabase
      .from("assessment_responses")
      .insert([payload])
      .select();
    if (error) throw error;
    return data[0];
  }

  async update(id, payload) {
    const { data, error } = await supabase
      .from("assessment_responses")
      .update(payload)
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0];
  }

  async delete(id) {
    const { data, error } = await supabase
      .from("assessment_responses")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id)
      .select();
    if (error) throw error;
    return data[0];
  }

  async getKompetensi(subjectid, assid) {
    const { data, error } = await supabase
      .from("assessment_responses")
      .select("*,indicator_id(competency_id(name)),assessment_id(self_weight,supervisor_weight)")
      .eq("assessment_id", assid)
      .eq("subject_profile_id", subjectid);
    if (error) throw error;
    return data;
  }

  async getKompetensiSubsatker(assid) {
    const { data, error } = await supabase
      .from("assessment_responses")
      .select("*, subject_profile_id(subdirectorat_id,id)")
      .eq("assessment_id", assid);
    if (error) throw error;
    return data;
  }

  async getAssesment() {
    const { data, error } = await supabase
      .from("assessment_responses")
      .select(
        "*, subject_profile_id(subdirectorat_id,id), assessment_id(id,name,self_weight,supervisor_weight)"
      );
    if (error) throw error;
    return data;
  }

  async getMyResponse(id) {
    const { data, error } = await supabase
      .from("assessment_responses")
      .select("*")
      .eq("subject_profile_id", id);
    if (error) throw error;
    return data;
  }

  async getMentorId(subjectid, assid) {
    const { data, error } = await supabase
      .from("assessment_responses")
      .select("*")
      .eq("assessment_id", assid)
      .eq("subject_profile_id", subjectid)
      .neq("assessor_profile_id", subjectid);
    if (error) throw error;
    return data;
  }
  async getMentorIdasAdmin(assid) {
    const { data, error } = await supabase
      .from("assessment_responses")
      .select("*, assessor_profile_id(subdirectorat_id,id)")
      .eq("assessment_id", assid)
    if (error) throw error;
    return data;
  }
}

export default new AssessmentResponseService();
