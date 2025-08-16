// Assessment Detail Page - View assessment details and manage participants
// Shows assessment info, competencies, participants, and actions

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, Button, Badge, Tabs, Alert, TabItem, Dropdown, DropdownItem, DropdownDivider } from "flowbite-react";
import {
  ClipboardCheck,
  ArrowLeft,
  Edit,
  Users,
  Award,
  Calendar,
  Play,
  CheckCircle,
  Settings,
  Eye,
  FileText,
  MoreHorizontal,
  Home,
  Trash2,
  Pause, // Add Pause icon
} from "lucide-react";
import AssessmentService from "../services/AssessmentService";
import AssessmentParticipantService from "../services/AssessmentParticipantService";
import AssessmentStatusBadge from "../components/assessment/AssessmentStatusBadge";
import ParticipantTable from "../components/assessment/ParticipantTable";
import { formatAssessmentPeriod } from "../utils/assessmentUtils";
import { ASSESSMENT_STATUS } from "../constants/assessmentConstants";
import { LoadingSpinner, ErrorAlert } from "../components/common";
import { PageHeader } from "../components/common";
import { useUserContext } from "../contexts/UserContext";
import { USER_POSITION } from "../constants/assessmentConstants";

const AssessmentDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useUserContext();

  // State management
  const [assessment, setAssessment] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [participantStats, setParticipantStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  // Load all assessment related data
  const loadAssessmentData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load assessment details
      const assessmentData = await AssessmentService.getById(id);
      setAssessment(assessmentData);

      // Load participants
      const participantData =
        await AssessmentParticipantService.getByAssessmentId(id);
      setParticipants(participantData);

      // Load participant statistics
      const stats = await AssessmentParticipantService.getParticipantStats(id);
      setParticipantStats(stats);
    } catch (err) {
      console.error("Failed to load assessment data:", err);
      setError(err.message || "Failed to load assessment data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load data on mount
  useEffect(() => {
    if (id) {
      loadAssessmentData();
    }
  }, [id, loadAssessmentData]);

  // Handle assessment workflow actions
  const handlePublish = async () => {
    const confirmMessage = `Yakin ingin mempublikasikan assessment "${assessment.name}"?\n\nSetelah dipublikasikan, assessment akan aktif dan peserta dapat mulai mengisi penilaian.`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      await AssessmentService.publish(id);
      await loadAssessmentData(); // Refresh data
    } catch (err) {
      setError(err.message || "Failed to publish assessment");
    }
  };

  const handlePause = async () => {
    const confirmMessage = `Yakin ingin menjedakan assessment "${assessment.name}"?\n\nSetelah dijeda, peserta tidak dapat mengisi atau melanjutkan penilaian sampai assessment dipublikasikan kembali.`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      await AssessmentService.pause(id);
      await loadAssessmentData(); // Refresh data
    } catch (err) {
      setError(err.message || "Failed to pause assessment");
    }
  };

  const handleComplete = async () => {
    const confirmMessage = `Yakin ingin menyelesaikan assessment "${assessment.name}"?\n\nSetelah diselesaikan, assessment tidak dapat diubah lagi dan peserta tidak dapat mengisi penilaian.`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      await AssessmentService.complete(id);
      await loadAssessmentData(); // Refresh data
    } catch (err) {
      setError(err.message || "Failed to complete assessment");
    }
  };

  const handleDelete = async () => {
    const confirmMessage = `Yakin ingin menghapus assessment "${assessment.name}"?\n\nTindakan ini tidak dapat dibatalkan.`;
    
    if (!window.confirm(confirmMessage)) return;

    try {
      await AssessmentService.delete(id);
      navigate("/penilaian");
    } catch (err) {
      setError(err.message || "Failed to delete assessment");
    }
  };

  // Navigation handlers
  const handleBack = () => {
    navigate("/penilaian");
  };

  const handleEdit = () => {
    navigate(`/penilaian/${id}/edit`);
  };

  const handleManageParticipants = () => {
    navigate(`/penilaian/${id}/participants`);
  };

  const handleViewReports = () => {
    navigate(`/penilaian/${id}/reports`);
  };

  // Check permissions for actions
  const canEdit = () => {
    return assessment && assessment.status === ASSESSMENT_STATUS.DRAFT;
  };

  const canPublish = () => {
    return (
      assessment &&
      assessment.status === ASSESSMENT_STATUS.DRAFT
    );
  };

  const canPause = () => {
    return assessment && assessment.status === ASSESSMENT_STATUS.IN_PROGRESS;
  };

  const canComplete = () => {
    console.log('can complete', assessment, assessment?.status === ASSESSMENT_STATUS.IN_PROGRESS);
    return assessment && assessment.status === ASSESSMENT_STATUS.IN_PROGRESS;
  };

  const isAdmin = () => {
    return user?.position_type === USER_POSITION.ADMIN;
  };

  // Render loading state
  if (loading) {
    return (
      <div className="page">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner message="Memuat detail penilaian..." />
        </div>
      </div>
    );
  }

  // Render error state
  if (error && !assessment) {
    return (
      <div className="page">
        <div className="max-w-7xl mx-auto">
          <ErrorAlert message={error} />
          <div className="mt-4">
            <Button onClick={handleBack}>Kembali ke Daftar Penilaian</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="max-w-7xl mx-auto">
        {/* Page Header with breadcrumbs */}
        <PageHeader
          breadcrumbs={[
            { label: 'Dashboard', href: '/', icon: Home },
            { label: 'Penilaian', href: '/penilaian', icon: ClipboardCheck },
            { label: assessment?.name || 'Detail Penilaian', icon: Settings }
          ]}
          // title={assessment?.name || 'Detail Penilaian'}
          // subtitle={assessment ? formatAssessmentPeriod(assessment.start_date, assessment.end_date) : 'Informasi detail penilaian'}
          showExportButton={false}
        />

        {error && (
          <ErrorAlert
            message={error}
            onClose={() => setError(null)}
            variant="flowbite"
          />
        )}

        {/* Assessment Header Info with Actions */}
        <Card className="mb-6 bg-white dark:bg-gray-800">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Assessment Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {assessment?.name}
                </h1>
                <AssessmentStatusBadge status={assessment?.status} />
              </div>
              
              {assessment?.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  {assessment.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatAssessmentPeriod(assessment?.start_date, assessment?.end_date)}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {participantStats.totalParticipants || 0} Peserta
                </div>
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  {assessment?.assessment_competencies?.length || 0} Kompetensi
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Primary Actions */}
              <Link to={`/penilaian/${id}`}>
                <Button
                  size="sm"
                  color="gray"
                  className="flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Detail
                </Button>
              </Link>
              
              {canEdit() && (
                <Link to={`/penilaian/${id}/edit`}>
                  <Button
                    size="sm"
                    color="blue"
                    className="flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                </Link>
              )}

              <Link to={`/penilaian/${id}/participants`}>
                <Button
                  size="sm"
                  color="gray"
                  className="flex items-center gap-1"
                >
                  <Users className="w-4 h-4" />
                  Peserta
                </Button>
              </Link>

              {/* Dropdown Menu for Additional Actions */}
              {isAdmin() && (
                <Dropdown
                  label=""
                  dismissOnClick={false}
                  renderTrigger={() => (
                    <Button
                      size="sm"
                      color="gray"
                      className="flex items-center gap-1"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  )}
                >
                  {canPublish() && (
                    <DropdownItem
                      icon={Play}
                      onClick={handlePublish}
                    >
                      Publikasikan Assessment
                    </DropdownItem>
                  )}

                  {canPause() && (
                    <DropdownItem
                      icon={Pause}
                      onClick={handlePause}
                    >
                      Jeda Assessment
                    </DropdownItem>
                  )}

                  {canComplete() && (
                    <DropdownItem
                      icon={CheckCircle}
                      onClick={handleComplete}
                    >
                      Selesaikan Assessment
                    </DropdownItem>
                  )}

                  {assessment?.status === ASSESSMENT_STATUS.DONE && (
                    <DropdownItem icon={FileText}>
                      <Link to={`/penilaian/${id}/reports`}>
                        Lihat Laporan
                      </Link>
                    </DropdownItem>
                  )}

                  <DropdownDivider />

                  <DropdownItem
                    icon={Trash2}
                    className="text-red-600 dark:text-red-400"
                    onClick={handleDelete}
                  >
                    Hapus Assessment
                  </DropdownItem>
                </Dropdown>
              )}
            </div>
          </div>
        </Card>

        {/* Quick Links for Staff */}
        {!isAdmin() && (
          <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to={`/penilaian/${id}/self`} className="flex-1">
                <Button color="blue" className="w-full">
                  <Play className="w-4 h-4 mr-2" />
                  Isi Penilaian Diri
                </Button>
              </Link>
              
              {user?.position_type === USER_POSITION.ATASAN && (
                <Link to={`/penilaian/${id}/supervisor`} className="flex-1">
                  <Button color="gray" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Penilaian Bawahan
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        )}

        {/* Content Tabs */}
        <Tabs
          aria-label="Tab detail penilaian"
          onActiveTabChange={(tab) => setActiveTab(tab)}
          theme={{
            base: "border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm",
            tablist: {
              base: "gap-0",
            },
            tabitemcontainer: {
              base: "px-5 pb-3",
            },
            tabItem: {
              variant: {
                default: {
                  base: "rounded-t-lg",
                  active: {
                    on: "bg-blue-50 text-blue-600 dark:bg-gray-800 dark:text-blue-400",
                    off: "text-gray-500 hover:bg-gray-50 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300",
                  },
                },
              },
            },
          }}
        >
          {/* Overview Tab */}
          <TabItem
            active={activeTab === "overview"}
            title="Ringkasan"
            icon={Eye}
          >
            <div className="space-y-6">
              {/* Status & Progress Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4" hidden>
                {/* Total Participants */}
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-200 dark:border-blue-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Total Peserta
                      </p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                        {participantStats.totalParticipants || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-500 rounded-full">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </Card>

                {/* Unique Subjects */}
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-200 dark:border-purple-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        Subjek Unik
                      </p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {participantStats.uniqueSubjects || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-500 rounded-full">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </Card>

                {/* Self Assessments */}
                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 border-green-200 dark:border-green-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        Penilaian Diri
                      </p>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                        {participantStats.selfAssessments || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-green-500 rounded-full">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </Card>

                {/* Supervisor Assessments */}
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 border-orange-200 dark:border-orange-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                        Penilaian Atasan
                      </p>
                      <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                        {participantStats.supervisorAssessments || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-500 rounded-full">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </Card>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Assessment Information */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Info Card */}
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <ClipboardCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Informasi Assessment
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            Tanggal Mulai
                          </label>
                          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <p className="text-gray-900 dark:text-white font-medium">
                              {new Date(assessment?.start_date).toLocaleDateString("id-ID", {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            Status Assessment
                          </label>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <AssessmentStatusBadge status={assessment?.status} size="lg" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            Tanggal Selesai
                          </label>
                          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <p className="text-gray-900 dark:text-white font-medium">
                              {new Date(assessment?.end_date).toLocaleDateString("id-ID", {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            Total Kompetensi
                          </label>
                          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <Award className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            <p className="text-gray-900 dark:text-white font-medium">
                              {assessment?.assessment_competencies?.length || 0} Kompetensi
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {assessment?.description && (
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          Deskripsi
                        </label>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {assessment.description}
                          </p>
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Weight Configuration Card */}
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <Settings className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Konfigurasi Bobot
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <div className="bg-gradient-to-r from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 p-4 rounded-lg border border-green-200 dark:border-green-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                              Penilaian Diri
                            </span>
                            <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-green-900 dark:text-green-100">
                              {((assessment?.self_weight || 0.3) * 100).toFixed(0)}
                            </span>
                            <span className="text-lg text-green-700 dark:text-green-300">%</span>
                          </div>
                          <div className="mt-3 bg-green-200 dark:bg-green-800 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${((assessment?.self_weight || 0.3) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>

                      <div className="relative">
                        <div className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                              Penilaian Atasan
                            </span>
                            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                              {((assessment?.supervisor_weight || 0.7) * 100).toFixed(0)}
                            </span>
                            <span className="text-lg text-blue-700 dark:text-blue-300">%</span>
                          </div>
                          <div className="mt-3 bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${((assessment?.supervisor_weight || 0.7) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {assessment?.configuration && (
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600" hidden>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                          Konfigurasi Teknis
                        </label>
                        <div className="p-4 bg-gray-900 dark:bg-gray-800 rounded-lg border">
                          <code className="text-sm text-green-400 font-mono">
                            {assessment.configuration}
                          </code>
                        </div>
                      </div>
                    )}
                  </Card>
                </div>

                {/* Progress & Analytics */}
                <div className="space-y-6">
                  {/* Progress Card */}
                  <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Progress Penilaian
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {/* Self Assessment Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Penilaian Diri
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {participantStats.selfAssessments || 0} / {participantStats.uniqueSubjects || 0}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${participantStats.uniqueSubjects > 0 
                                ? ((participantStats.selfAssessments || 0) / participantStats.uniqueSubjects * 100) 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {participantStats.uniqueSubjects > 0 
                            ? `${(((participantStats.selfAssessments || 0) / participantStats.uniqueSubjects) * 100).toFixed(1)}% selesai`
                            : 'Belum ada peserta'
                          }
                        </p>
                      </div>

                      {/* Supervisor Assessment Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Penilaian Atasan
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {participantStats.supervisorAssessments || 0} / {participantStats.uniqueSubjects || 0}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${participantStats.uniqueSubjects > 0 
                                ? ((participantStats.supervisorAssessments || 0) / participantStats.uniqueSubjects * 100) 
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {participantStats.uniqueSubjects > 0 
                            ? `${(((participantStats.supervisorAssessments || 0) / participantStats.uniqueSubjects) * 100).toFixed(1)}% selesai`
                            : 'Belum ada peserta'
                          }
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Quick Actions Card */}
                  <Card className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <Play className="mr-2 text-gray-600 dark:text-gray-400" />
                      Aksi Cepat
                    </h3>

                    <div className="space-y-3">
                      <Link to={`/penilaian/${id}/participants`} className="block">
                        <Button color="gray" className="w-full justify-start">
                          <Users className="w-4 h-4 mr-2" />
                          Kelola Peserta
                        </Button>
                      </Link>

                      {assessment?.status === ASSESSMENT_STATUS.DONE && (
                        <Link to={`/penilaian/${id}/reports`} className="block">
                          <Button color="blue" className="w-full justify-start">
                            <FileText className="w-4 h-4 mr-2" />
                            Lihat Laporan
                          </Button>
                        </Link>
                      )}

                      {canEdit() && (
                        <Link to={`/penilaian/${id}/edit`} className="block">
                          <Button color="yellow" className="w-full justify-start">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Assessment
                          </Button>
                        </Link>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </TabItem>

          {/* Kompetensi Tab */}
          <TabItem title="Kompetensi" icon={Award}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Kompetensi Penilaian
                </h3>
                <Badge color="blue">
                  {assessment?.assessment_competencies?.length || 0} Kompetensi
                </Badge>
              </div>

              {assessment?.assessment_competencies &&
              assessment.assessment_competencies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assessment.assessment_competencies.map(
                    (ac) =>
                      ac.competencies && (
                        <Card
                          key={ac.id}
                          className="bg-gray-50 dark:bg-gray-700"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {ac.competencies.name}
                            </h4>
                            <Badge color="gray" size="sm">
                              {ac.competencies.indicators?.length || 0} Indikator
                            </Badge>
                          </div>
                          
                          {ac.competencies.description && (
                            <p className="text-gray-600 dark:text-gray-400 mb-3 text-sm">
                              {ac.competencies.description}
                            </p>
                          )}

                          {ac.competencies.indicators &&
                            ac.competencies.indicators.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                  Indikator:
                                </p>
                                <ul className="space-y-1 max-h-32 overflow-y-auto">
                                  {ac.competencies.indicators.map(
                                    (indicator) => (
                                      <li
                                        key={indicator.id}
                                        className="text-sm text-gray-600 dark:text-gray-400 pl-2 border-l-2 border-gray-200 dark:border-gray-600"
                                      >
                                        {indicator.name}
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </Card>
                      )
                  )}
                </div>
              ) : (
                <Alert color="warning">
                  <span className="font-medium">Belum ada kompetensi!</span>
                  Penilaian ini belum memiliki kompetensi. Silakan ubah penilaian untuk menambah kompetensi.
                </Alert>
              )}
            </div>
          </TabItem>

          {/* Peserta Tab */}
          <TabItem title="Peserta" icon={Users}>
            <ParticipantTable
              participants={participants}
              assessmentId={id}
              onRefresh={loadAssessmentData}
            />
          </TabItem>
        </Tabs>
      </div>
    </div>
  );
};

export default AssessmentDetailPage;