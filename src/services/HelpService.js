import { supabase } from './SupabaseClient' // Sesuaikan dengan path yang benar

class HelpService {
  // Dokumen CRUD
  async getDocuments() {
    const { data, error } = await supabase
      .from('help_documents')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  async createDocument(document) {
    const { data, error } = await supabase
      .from('help_documents')
      .insert([{
        title: document.title,
        description: document.description,
        file_url: document.file_url,
        file_path: document.file_path,
        file_name: document.file_name,
        file_size: document.file_size,
        file_type: document.file_type,
        created_by: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
    
    if (error) throw error
    return data[0]
  }

  async updateDocument(id, document) {
    const { data, error } = await supabase
      .from('help_documents')
      .update({
        title: document.title,
        description: document.description,
        file_url: document.file_url,
        file_path: document.file_path,
        file_name: document.file_name,
        file_size: document.file_size,
        file_type: document.file_type,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  }

  async deleteDocument(id) {
    const { error } = await supabase
      .from('help_documents')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }

  // Video CRUD
  async getVideos() {
    const { data, error } = await supabase
      .from('help_videos')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  async createVideo(video) {
    const { data, error } = await supabase
      .from('help_videos')
      .insert([{
        title: video.title,
        description: video.description,
        video_url: video.video_url,
        thumbnail_url: video.thumbnail_url,
        duration: video.duration,
        created_by: (await supabase.auth.getUser()).data.user?.id
      }])
      .select()
    
    if (error) throw error
    return data[0]
  }

  async updateVideo(id, video) {
    const { data, error } = await supabase
      .from('help_videos')
      .update({
        title: video.title,
        description: video.description,
        video_url: video.video_url,
        thumbnail_url: video.thumbnail_url,
        duration: video.duration,
        updated_at: new Date()
      })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  }

  async deleteVideo(id) {
    const { error } = await supabase
      .from('help_videos')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

export default new HelpService()