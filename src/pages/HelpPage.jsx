import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  TextInput,
  Label,
  Textarea,
  Select,
  Alert,
  FileInput,
  Progress,
} from "flowbite-react";
import {
  Home,
  BookOpen,
  FileText,
  Video,
  Download,
  ExternalLink,
  Play,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Upload,
  File,
} from "lucide-react";
import ReactPlayer from "react-player";
import PageHeader from "../components/common/PageHeader";
import AuthService from "../services/AuthService";
import FileUploadService from "../services/FileUploadService";
import HelpService from "../services/HelpService"; // Import HelpService

const HelpPage = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [documentationLinks, setDocumentationLinks] = useState([]);
  const [videoTutorials, setVideoTutorials] = useState([]);

  const [currentItem, setCurrentItem] = useState({
    type: "document",
    title: "",
    description: "",
    file: "",
    fileObject: null,
    filePath: "",
    videoUrl: "",
    duration: "",
    thumbnail: "",
  });

  const [itemToDelete, setItemToDelete] = useState(null);

  // Load data from database
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Check admin privileges
        const user = await AuthService.checkUser();
        setIsAdmin(user?.position_type === "ADMIN" || user?.position_type === "TOP MANAGEMENT");

        // Load documents and videos
        const [documents, videos] = await Promise.all([
          HelpService.getDocuments(),
          HelpService.getVideos()
        ]);

        // Transform data to match existing format
        const transformedDocs = documents.map(doc => ({
          id: doc.id,
          title: doc.title,
          description: doc.description,
          file: doc.file_url,
          filePath: doc.file_path,
          fileName: doc.file_name,
          fileSize: doc.file_size,
          type: doc.file_type || "PDF"
        }));

        const transformedVideos = videos.map(video => ({
          id: video.id,
          title: video.title,
          description: video.description,
          videoUrl: video.video_url,
          thumbnail: video.thumbnail_url,
          duration: video.duration
        }));

        setDocumentationLinks(transformedDocs);
        setVideoTutorials(transformedVideos);

      } catch (err) {
        console.error("Failed to load data:", err);
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const resetForm = () => {
    setCurrentItem({
      type: "document",
      title: "",
      description: "",
      file: "",
      fileObject: null,
      filePath: "",
      videoUrl: "",
      duration: "",
      thumbnail: "",
    });
    setError("");
    setUploadProgress(0);
  };

  const handleAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleEdit = (item, type) => {
    setCurrentItem({
      ...item,
      type,
      file: item.file || "",
      filePath: item.filePath || "",
      videoUrl: item.videoUrl || "",
      duration: item.duration || "",
      thumbnail: item.thumbnail || "",
      fileObject: null,
    });
    setShowEditModal(true);
  };

  const handleDeleteConfirm = (item, type) => {
    setItemToDelete({ ...item, type });
    setShowDeleteModal(true);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        FileUploadService.validateFile(file);
        setCurrentItem(prev => ({
          ...prev,
          fileObject: file
        }));
        setError("");
      } catch (err) {
        setError(err.message);
        e.target.value = "";
      }
    }
  };

  // Upload file to Supabase
  const uploadFile = async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);

      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const uploadResult = await FileUploadService.uploadFile(file, 'documents');
      
      clearInterval(uploadInterval);
      setUploadProgress(100);
      
      return uploadResult;
    } catch (error) {
      setUploading(false);
      setUploadProgress(0);
      throw error;
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  const validateForm = () => {
    if (!currentItem.title || !currentItem.description) {
      setError("Judul dan deskripsi harus diisi");
      return false;
    }

    if (currentItem.type === "document") {
      if (!currentItem.fileObject && !currentItem.file) {
        setError("File dokumen harus dipilih atau link file harus diisi");
        return false;
      }
    }

    if (currentItem.type === "video" && !currentItem.videoUrl) {
      setError("Link video harus diisi");
      return false;
    }

    setError("");
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setUploading(true);

      if (currentItem.type === "document") {
        let fileUrl = currentItem.file;
        let filePath = "";
        let fileName = "";
        let fileSize = 0;
        let fileType = "PDF";

        // If file is uploaded, use uploaded file URL
        if (currentItem.fileObject) {
          const uploadResult = await uploadFile(currentItem.fileObject);
          fileUrl = uploadResult.url;
          filePath = uploadResult.path;
          fileName = uploadResult.originalName;
          fileSize = uploadResult.size;
          fileType = currentItem.fileObject.name.split('.').pop().toUpperCase();
        }

        // Save to database
        const savedDoc = await HelpService.createDocument({
          title: currentItem.title,
          description: currentItem.description,
          file_url: fileUrl,
          file_path: filePath,
          file_name: fileName,
          file_size: fileSize,
          file_type: fileType
        });

        // Add to local state
        setDocumentationLinks(prev => [...prev, {
          id: savedDoc.id,
          title: savedDoc.title,
          description: savedDoc.description,
          file: savedDoc.file_url,
          filePath: savedDoc.file_path,
          fileName: savedDoc.file_name,
          fileSize: savedDoc.file_size,
          type: savedDoc.file_type
        }]);

      } else {
        // Save video to database
        const savedVideo = await HelpService.createVideo({
          title: currentItem.title,
          description: currentItem.description,
          video_url: currentItem.videoUrl,
          thumbnail_url: currentItem.thumbnail,
          duration: currentItem.duration
        });

        // Add to local state
        setVideoTutorials(prev => [...prev, {
          id: savedVideo.id,
          title: savedVideo.title,
          description: savedVideo.description,
          videoUrl: savedVideo.video_url,
          thumbnail: savedVideo.thumbnail_url,
          duration: savedVideo.duration
        }]);
      }

      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error('Error saving item:', err);
      setError(err.message || 'Gagal menyimpan item');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;

    try {
      setUploading(true);

      if (currentItem.type === "document") {
        let fileUrl = currentItem.file;
        let filePath = currentItem.filePath;
        let fileName = currentItem.fileName;
        let fileSize = currentItem.fileSize;
        let fileType = currentItem.type;

        if (currentItem.fileObject) {
          // Delete old file if exists
          if (currentItem.filePath) {
            try {
              await FileUploadService.deleteFile(currentItem.filePath);
            } catch (err) {
              console.warn('Failed to delete old file:', err);
            }
          }

          // Upload new file
          const uploadResult = await uploadFile(currentItem.fileObject);
          fileUrl = uploadResult.url;
          filePath = uploadResult.path;
          fileName = uploadResult.originalName;
          fileSize = uploadResult.size;
          fileType = currentItem.fileObject.name.split('.').pop().toUpperCase();
        }

        // Update in database
        const updatedDoc = await HelpService.updateDocument(currentItem.id, {
          title: currentItem.title,
          description: currentItem.description,
          file_url: fileUrl,
          file_path: filePath,
          file_name: fileName,
          file_size: fileSize,
          file_type: fileType
        });

        // Update local state
        setDocumentationLinks(prev =>
          prev.map(item =>
            item.id === currentItem.id
              ? {
                  ...item,
                  title: updatedDoc.title,
                  description: updatedDoc.description,
                  file: updatedDoc.file_url,
                  filePath: updatedDoc.file_path,
                  fileName: updatedDoc.file_name,
                  fileSize: updatedDoc.file_size,
                  type: updatedDoc.file_type
                }
              : item
          )
        );
      } else {
        // Update video in database
        const updatedVideo = await HelpService.updateVideo(currentItem.id, {
          title: currentItem.title,
          description: currentItem.description,
          video_url: currentItem.videoUrl,
          thumbnail_url: currentItem.thumbnail,
          duration: currentItem.duration
        });

        // Update local state
        setVideoTutorials(prev =>
          prev.map(item =>
            item.id === currentItem.id
              ? {
                  ...item,
                  title: updatedVideo.title,
                  description: updatedVideo.description,
                  videoUrl: updatedVideo.video_url,
                  thumbnail: updatedVideo.thumbnail_url,
                  duration: updatedVideo.duration
                }
              : item
          )
        );
      }

      setShowEditModal(false);
      resetForm();
    } catch (err) {
      console.error('Error updating item:', err);
      setError(err.message || 'Gagal memperbarui item');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    try {
      // Delete from database
      if (itemToDelete.type === "document") {
        await HelpService.deleteDocument(itemToDelete.id);
        
        // Delete file from Supabase if it's uploaded file
        if (itemToDelete.filePath) {
          try {
            await FileUploadService.deleteFile(itemToDelete.filePath);
          } catch (err) {
            console.warn('Failed to delete file from storage:', err);
          }
        }

        // Update local state
        setDocumentationLinks(prev => prev.filter(item => item.id !== itemToDelete.id));
      } else {
        await HelpService.deleteVideo(itemToDelete.id);
        setVideoTutorials(prev => prev.filter(item => item.id !== itemToDelete.id));
      }

      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Gagal menghapus item');
    }
  };

  const handlePlayVideo = (video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="page">
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          breadcrumbs={[
            { label: "Dashboard", href: "/", icon: Home },
            { label: "Panduan Penggunaan", icon: BookOpen },
          ]}
          title="Panduan Penggunaan"
          subtitle="Panduan lengkap menggunakan aplikasi Profesi Ditpamobvit"
          showExportButton={false}
        />

        {error && (
          <Alert color="failure" icon={AlertCircle} className="mb-4">
            {error}
          </Alert>
        )}

        {/* Rest of the JSX remains the same... */}
        {/* Documentation Section */}
        <div className="my-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                File Panduan & Dokumentasi
              </h2>
            </div>
            {isAdmin && (
              <Button
                onClick={() => {
                  setCurrentItem(prev => ({ ...prev, type: "document" }));
                  handleAdd();
                }}
                size="sm"
                color="blue"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Dokumen
              </Button>
            )}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documentationLinks.map((doc, index) => (
              <Card key={doc.id || index} className="hover:shadow-lg transition-all duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {doc.title}
                      </h5>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
                      {doc.description}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-block px-3 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                        {doc.type}
                      </span>
                      {doc.fileSize && (
                        <span className="text-xs text-gray-500">
                          {formatFileSize(doc.fileSize)}
                        </span>
                      )}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex flex-col gap-1 ml-2">
                      <Button
                        size="xs"
                        outline
                        color="gray"
                        onClick={() => handleEdit(doc, "document")}
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="xs"
                        outline
                        color="red"
                        onClick={() => handleDeleteConfirm(doc, "document")}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    as="a"
                    href={doc.file}
                    target="_blank"
                    size="sm"
                    color="blue"
                    className="flex-1"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Buka
                  </Button>
                  <Button
                    as="a"
                    href={doc.file}
                    download={doc.fileName || `${doc.title}.pdf`}
                    size="sm"
                    outline
                    color="gray"
                    className="flex-1"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Unduh
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Video Tutorials Section */}
        <div className="my-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg">
                <Video className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Video Tutorial
              </h2>
            </div>
            {isAdmin && (
              <Button
                onClick={() => {
                  setCurrentItem(prev => ({ ...prev, type: "video" }));
                  handleAdd();
                }}
                size="sm"
                color="green"
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Video
              </Button>
            )}
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videoTutorials.map((video, index) => (
              <Card
                key={video.id || index}
                className="overflow-hidden hover:shadow-lg transition-all duration-200"
              >
                <div className="relative">
                  <div
                    className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 relative group cursor-pointer overflow-hidden"
                    onClick={() => handlePlayVideo(video)}
                  >
                    {video.thumbnail ? (
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover rounded-lg transition-transform duration-200 group-hover:scale-105"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-400 to-green-600" style={{ display: video.thumbnail ? 'none' : 'flex' }}>
                      <Video className="w-12 h-12 text-white" />
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-lg">
                      <div className="bg-green-600 hover:bg-green-700 rounded-full p-4 transform transition-all duration-200 group-hover:scale-110 shadow-lg">
                        <Play className="w-6 h-6 text-white fill-current ml-1" />
                      </div>
                    </div>

                    {/* Duration Badge */}
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                        {video.duration}
                      </div>
                    )}
                  </div>

                  {/* Admin Actions */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="xs"
                        outline
                        color="gray"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(video, "video");
                        }}
                        className="bg-white/90 backdrop-blur-sm"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        size="xs"
                        outline
                        color="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConfirm(video, "video");
                        }}
                        className="bg-white/90 backdrop-blur-sm"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <Video className="w-4 h-4 text-green-600" />
                  <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {video.title}
                  </h5>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                  {video.description}
                </p>

                <Button
                  onClick={() => handlePlayVideo(video)}
                  color="green"
                  className="w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Tonton Video
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* Modals remain the same... */}
        {/* Add/Edit Modal */}
        <Modal
          show={showAddModal || showEditModal}
          onClose={() => {
            if (!uploading) {
              setShowAddModal(false);
              setShowEditModal(false);
              resetForm();
            }
          }}
          size="lg"
        >
          <ModalHeader>
            {showAddModal ? "Tambah" : "Edit"} {currentItem.type === "document" ? "Dokumen" : "Video"}
          </ModalHeader>
          <ModalBody>
            {error && (
              <Alert color="failure" icon={AlertCircle} className="mb-4">
                {error}
              </Alert>
            )}

            <div className="space-y-4">
              {showAddModal && (
                <div>
                  <Label htmlFor="type">Tipe</Label>
                  <Select
                    id="type"
                    value={currentItem.type}
                    onChange={(e) => setCurrentItem(prev => ({ ...prev, type: e.target.value }))}
                    disabled={uploading}
                  >
                    <option value="document">Dokumen</option>
                    <option value="video">Video</option>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="title">Judul *</Label>
                <TextInput
                  id="title"
                  value={currentItem.title}
                  onChange={(e) => setCurrentItem(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Masukkan judul"
                  disabled={uploading}
                />
              </div>

              <div>
                <Label htmlFor="description">Deskripsi *</Label>
                <Textarea
                  id="description"
                  rows={3}
                  value={currentItem.description}
                  onChange={(e) => setCurrentItem(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Masukkan deskripsi"
                  disabled={uploading}
                />
              </div>

              {currentItem.type === "document" ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file">Upload File</Label>
                    <FileInput
                      id="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={handleFileChange}
                      disabled={uploading}
                      helperText="Format yang didukung: PDF, DOC, DOCX, TXT (Maksimal 10MB)"
                    />
                    {currentItem.fileObject && (
                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                            {currentItem.fileObject.name}
                          </span>
                          <span className="text-xs text-blue-600 dark:text-blue-400">
                            ({formatFileSize(currentItem.fileObject.size)})
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-center text-sm text-gray-500">atau</div>

                  <div>
                    <Label htmlFor="fileLink">Link File Manual</Label>
                    <TextInput
                      id="fileLink"
                      value={currentItem.file}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, file: e.target.value }))}
                      placeholder="https://example.com/file.pdf"
                      disabled={uploading}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <Label htmlFor="videoUrl">Link Video *</Label>
                    <TextInput
                      id="videoUrl"
                      value={currentItem.videoUrl}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, videoUrl: e.target.value }))}
                      placeholder="https://www.youtube.com/watch?v=..."
                      disabled={uploading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="duration">Durasi</Label>
                    <TextInput
                      id="duration"
                      value={currentItem.duration}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, duration: e.target.value }))}
                      placeholder="5:30"
                      disabled={uploading}
                    />
                  </div>

                  <div>
                    <Label htmlFor="thumbnail">Link Thumbnail</Label>
                    <TextInput
                      id="thumbnail"
                      value={currentItem.thumbnail}
                      onChange={(e) => setCurrentItem(prev => ({ ...prev, thumbnail: e.target.value }))}
                      placeholder="https://example.com/thumbnail.jpg"
                      disabled={uploading}
                    />
                  </div>
                </>
              )}

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Mengupload...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress progress={uploadProgress} color="blue" />
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              onClick={showAddModal ? handleSave : handleUpdate}
              color="blue"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  {uploadProgress < 100 ? "Mengupload..." : "Menyimpan..."}
                </>
              ) : (
                showAddModal ? "Simpan" : "Update"
              )}
            </Button>
            <Button
              color="gray"
              onClick={() => {
                if (!uploading) {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }
              }}
              disabled={uploading}
            >
              Batal
            </Button>
          </ModalFooter>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          show={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setItemToDelete(null);
          }}
          size="md"
        >
          <ModalHeader>
            Konfirmasi Hapus
          </ModalHeader>
          <ModalBody>
            <div className="text-center">
              <AlertCircle className="mx-auto mb-4 h-14 w-14 text-red-500" />
              <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                Yakin ingin menghapus "{itemToDelete?.title}"?
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Tindakan ini tidak dapat dibatalkan.
              </p>
              {itemToDelete?.filePath && (
                <p className="text-sm text-red-500">
                  File yang diupload juga akan dihapus dari server.
                </p>
              )}
            </div>
          </ModalBody>
          <ModalFooter className="justify-center">
            <Button color="failure" onClick={handleDelete}>
              Ya, Hapus
            </Button>
            <Button
              color="gray"
              onClick={() => {
                setShowDeleteModal(false);
                setItemToDelete(null);
              }}
            >
              Batal
            </Button>
          </ModalFooter>
        </Modal>

        {/* Video Player Modal */}
        <Modal
          show={showVideoModal}
          onClose={closeVideoModal}
          size="5xl"
          className="z-50"
        >
          <ModalHeader className="border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedVideo?.title}
              </h3>
            </div>
          </ModalHeader>

          <ModalBody className="p-0">
            {selectedVideo && (
              <div className="aspect-video bg-black">
                <ReactPlayer
                  src={selectedVideo.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                  playing={showVideoModal}
                  config={{
                    youtube: {
                      playerVars: { showinfo: 1 },
                    },
                    vimeo: {
                      playerOptions: { color: "3B82F6" },
                    },
                  }}
                />
              </div>
            )}

            {selectedVideo && (
              <div className="p-6 bg-gray-50 dark:bg-gray-800">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Tentang Video Ini
                </h4>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {selectedVideo.description}
                </p>
                <div className="flex items-center gap-6 mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {selectedVideo.duration && (
                    <span className="flex items-center gap-1">
                      ⏱️ Durasi: {selectedVideo.duration}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    📹 Tutorial Video
                  </span>
                </div>
              </div>
            )}
          </ModalBody>
        </Modal>
      </div>
    </div>
  );
};

export default HelpPage;