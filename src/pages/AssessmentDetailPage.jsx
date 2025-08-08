// Assessment Detail Page - View assessment details and manage participants
// Shows assessment info, competencies, participants, and actions

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, Button, Badge, Tabs, Alert, TabItem } from "flowbite-react";
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
} from "lucide-react";
import AssessmentService from "../services/assessmentService";
import AssessmentParticipantService from "../services/AssessmentParticipantService";
import AssessmentStatusBadge from "../components/assessment/AssessmentStatusBadge";
import ParticipantTable from "../components/assessment/ParticipantTable";
import { formatAssessmentPeriod } from "../utils/assessmentUtils";
import { ASSESSMENT_STATUS } from "../constants/assessmentConstants";
import { LoadingSpinner, ErrorAlert } from "../components/common";
import { AssessmentDetailHeader } from "../components/assessment/AssessmentHeader";

const AssessmentDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

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
    try {
      await AssessmentService.publish(id);
      await loadAssessmentData(); // Refresh data
    } catch (err) {
      setError(err.message || "Failed to publish assessment");
    }
  };

  const handleComplete = async () => {
    try {
      await AssessmentService.complete(id);
      await loadAssessmentData(); // Refresh data
    } catch (err) {
      setError(err.message || "Failed to complete assessment");
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
      assessment.status === ASSESSMENT_STATUS.DRAFT &&
      participants.length > 0
    );
  };

  const canComplete = () => {
    return assessment && assessment.status === ASSESSMENT_STATUS.IN_PROGRESS;
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
        {/* Page Header - using AssessmentDetailHeader */}
        <AssessmentDetailHeader
          assessmentTitle={assessment?.name}
          status={assessment?.status}
          statusConfig={assessment?.statusConfig}
          onEdit={handleEdit}
          customActions={[
            ...(canEdit()
              ? [
                  {
                    type: "button",
                    label: "Ubah",
                    icon: Edit,
                    onClick: handleEdit,
                    color: "gray",
                  },
                ]
              : []),
            {
              type: "button",
              label: "Peserta",
              icon: Users,
              onClick: handleManageParticipants,
              color: "gray",
            },
            ...(canPublish()
              ? [
                  {
                    type: "button",
                    label: "Publikasikan",
                    icon: Play,
                    onClick: handlePublish,
                    color: "blue",
                  },
                ]
              : []),
            ...(canComplete()
              ? [
                  {
                    type: "button",
                    label: "Selesaikan",
                    icon: CheckCircle,
                    onClick: handleComplete,
                    color: "green",
                  },
                ]
              : []),
            ...(assessment?.status === ASSESSMENT_STATUS.DONE
              ? [
                  {
                    type: "button",
                    label: "Laporan",
                    icon: FileText,
                    onClick: handleViewReports,
                    color: "blue",
                  },
                ]
              : []),
          ]}
        ></AssessmentDetailHeader>

        {error && (
          <ErrorAlert
            message={error}
            onClose={() => setError(null)}
            variant="flowbite"
          />
        )}

        {/* Content Tabs */}
        <Tabs
          aria-label="Tab detail penilaian"
          onActiveTabChange={(tab) => setActiveTab(tab)}
          theme={{
            base: "mt-5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm",
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
                    on: "bg-blue-800 text-primary-600 dark:bg-gray-800 dark:text-primary-500",
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Informasi Penilaian */}
              <div className="lg:col-span-2">
                <Card className="bg-gray-50 dark:bg-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <ClipboardCheck className="mr-2 text-blue-600 dark:text-blue-400" />
                    Informasi Penilaian
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nama:
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {assessment?.name}
                      </p>
                    </div>

                    {assessment?.description && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Deskripsi:
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {assessment.description}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tanggal Mulai:
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(assessment?.start_date).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tanggal Selesai:
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {new Date(assessment?.end_date).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Bobot Penilaian */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Bobot Penilaian:
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                        <div className="text-gray-900 dark:text-white">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Mandiri:{" "}
                          </span>
                          {((assessment?.self_weight || 0.3) * 100).toFixed(0)}%
                        </div>
                        <div className="text-gray-900 dark:text-white">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Atasan:{" "}
                          </span>
                          {(
                            (assessment?.supervisor_weight || 0.7) * 100
                          ).toFixed(0)}
                          %
                        </div>
                      </div>
                    </div>

                    {assessment?.configuration && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Konfigurasi:
                        </label>
                        <pre className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded border">
                          {assessment.configuration}
                        </pre>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Statistik */}
              <div>
                <Card className="bg-gray-50 dark:bg-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Users className="mr-2 text-blue-600 dark:text-blue-400" />
                    Statistik Peserta
                  </h3>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        Total Peserta:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {participantStats.totalParticipants || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        Subjek Unik:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {participantStats.uniqueSubjects || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        Penilaian Mandiri:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {participantStats.selfAssessments || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-700 dark:text-gray-300">
                        Penilaian Atasan:
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {participantStats.supervisorAssessments || 0}
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Aksi Cepat */}
                <Card className="mt-4 bg-gray-50 dark:bg-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Settings className="mr-2 text-blue-600 dark:text-blue-400" />
                    Aksi Cepat
                  </h3>

                  <div className="space-y-2">
                    <Button
                      color="gray"
                      onClick={handleManageParticipants}
                      className="w-full justify-start"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Kelola Peserta
                    </Button>

                    {canEdit() && (
                      <Button
                        color="gray"
                        onClick={handleEdit}
                        className="w-full justify-start"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Ubah Penilaian
                      </Button>
                    )}

                    {assessment?.status === ASSESSMENT_STATUS.DONE && (
                      <Button
                        color="blue"
                        onClick={handleViewReports}
                        className="w-full justify-start"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Lihat Laporan
                      </Button>
                    )}
                  </div>
                </Card>
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
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {ac.competencies.name}
                          </h4>
                          {ac.competencies.description && (
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              {ac.competencies.description}
                            </p>
                          )}

                          {ac.competencies.indicators &&
                            ac.competencies.indicators.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                  Indikator (
                                  {ac.competencies.indicators.length}):
                                </p>
                                <ul className="space-y-1">
                                  {ac.competencies.indicators.map(
                                    (indicator) => (
                                      <li
                                        key={indicator.id}
                                        className="text-sm text-gray-600 dark:text-gray-400"
                                      >
                                        • {indicator.name}
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
