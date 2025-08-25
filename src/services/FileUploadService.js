import { supabase } from './SupabaseClient'

class FileUploadService {
  // Initialize bucket if not exists
  async initializeBucket() {
    try {
      const bucketName = 'digicomp'
      
      // Check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.find(bucket => bucket.name === bucketName)
      
      if (!bucketExists) {
        // Create bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: [
            'application/pdf',
            'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          ],
          fileSizeLimit: 10485760 // 10MB in bytes
        })
        
        if (createError) {
          console.warn('Could not create bucket:', createError)
          throw new Error('Gagal membuat storage bucket. Hubungi administrator.')
        }
        
        console.log('Bucket created successfully')
      }
      
      return true
    } catch (error) {
      console.error('Error initializing bucket:', error)
      throw error
    }
  }

  async uploadFile(file, folder = 'documents') {
    try {
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      console.log('Uploading file:', filePath)

      const { data, error } = await supabase.storage
        .from('digicomp')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        throw error
      }

      console.log('Upload successful:', data)

      const { data: { publicUrl } } = supabase.storage
        .from('digicomp')
        .getPublicUrl(filePath)

      return {
        path: filePath,
        url: publicUrl,
        name: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      
      // More specific error messages
      if (error.message?.includes('Bucket not found')) {
        throw new Error('Storage bucket tidak ditemukan. Hubungi administrator.')
      } else if (error.message?.includes('Row Level Security')) {
        throw new Error('Anda tidak memiliki izin untuk mengupload file.')
      } else if (error.message?.includes('File size')) {
        throw new Error('File terlalu besar. Maksimal 10MB.')
      }
      
      throw new Error(error.message || 'Gagal mengupload file')
    }
  }

  async deleteFile(filePath) {
    try {
      const { error } = await supabase.storage
        .from('digicomp')
        .remove([filePath])

      if (error) {
        console.error('Delete error:', error)
        throw error
      }
      
      return { success: true }
    } catch (error) {
      console.error('Error deleting file:', error)
      throw new Error('Gagal menghapus file')
    }
  }

  validateFile(file, options = {}) {
    const {
      maxSize = 10 * 1024 * 1024, // 10MB
      allowedTypes = [
        'application/pdf',
        'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ],
      allowedExtensions = ['pdf', 'doc', 'docx', 'txt', 'csv', 'xls', 'xlsx']
    } = options

    // Check file size
    if (file.size > maxSize) {
      throw new Error(`File terlalu besar. Maksimal ${maxSize / (1024 * 1024)}MB`)
    }

    // Check file type
    const fileExt = file.name.split('.').pop()?.toLowerCase()
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExt)) {
      throw new Error(`Tipe file tidak didukung. Hanya mendukung: ${allowedExtensions.join(', ')}`)
    }

    return true
  }

  // Check if bucket exists
  async checkBucket() {
    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      return buckets?.find(bucket => bucket.name === 'digicomp') ? true : false
    } catch (error) {
      console.error('Error checking bucket:', error)
      return false
    }
  }
}

export default new FileUploadService()