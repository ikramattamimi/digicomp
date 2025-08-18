import React, { useState } from "react";
import {
  Card,
  Button,
  Modal,
  ModalBody,
  ModalHeader,
} from "flowbite-react";
import {
  Home,
  BookOpen,
  FileText,
  Video,
  Download,
  ExternalLink,
  Play,
  HelpCircle,
  FileVideo,
  Users,
} from "lucide-react";
import ReactPlayer from "react-player";
import PageHeader from "../components/common/PageHeader";

const HelpPage = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const documentationLinks = [
    {
      title: "Buku Panduan",
      description: "Buku panduan penggunaan aplikasi profesi berbasis web",
      file: "/docs/panduan.pdf",
      type: "PDF",
    },
  ];

  const videoTutorials = [
    {
      title: "Pengenalan Dashboard",
      description: "Overview fitur-fitur utama aplikasi",
      videoUrl: "https://www.youtube.com/watch?v=7sDY4m8KNLc",
      duration: "5:30",
      thumbnail: "/images/thumb-dashboard.jpg",
    },
  ];

  const handlePlayVideo = (video) => {
    setSelectedVideo(video);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

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

        {/* Documentation Section */}
        <div className="my-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              File Panduan & Dokumentasi
            </h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documentationLinks.map((doc, index) => (
              <Card key={index} className="hover:shadow-lg transition-all duration-200">
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
                    <span className="inline-block px-3 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                      {doc.type}
                    </span>
                  </div>
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
                    download
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
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg">
              <FileVideo className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Video Tutorial
            </h2>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {videoTutorials.map((video, index) => (
              <Card
                key={index}
                className="overflow-hidden hover:shadow-lg transition-all duration-200"
              >
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
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs font-medium">
                    {video.duration}
                  </div>
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

        {/* Video Modal */}
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
                  <span className="flex items-center gap-1">
                    ⏱️ Durasi: {selectedVideo.duration}
                  </span>
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