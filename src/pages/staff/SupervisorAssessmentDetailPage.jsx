import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Card, Button, Badge, Alert, Tabs } from "flowbite-react";
import {
  ClipboardCheck,
  ArrowLeft,
  Users,
  Award,
  Calendar,
  Play,
  CheckCircle,
  Eye,
  FileText,
  Clock,
  Home,
  Settings,
  RefreshCw,
  Edit
} from "lucide-react";
import AssessmentService from "../../services/AssessmentService";
import AssessmentParticipantService from "../../services/AssessmentParticipantService";
import AssessmentStatusBadge from "../../components/assessment/AssessmentStatusBadge";
import { formatAssessmentPeriod } from "../../utils/assessmentUtils";
import { ASSESSMENT_STATUS } from "../../constants/assessmentConstants";
import { LoadingSpinner, ErrorAlert } from "../../components/common";
import PageHeader from "../../components/common/PageHeader";
import AssessmentResponseService from "../../services/AssessmentResponseService";
import { useUserContext } from "../../contexts/UserContext";
import SubordinateTable from "../../components/assessment/SubordinateTable";

const SupervisorAssessmentDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // State management
  const [assessment, setAssessment] = useState(null);
  const [participantData, setParticipantData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const user = useUserContext();

  // Load assessment data
  const loadAssessmentData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load assessment details
      const assessmentData = await AssessmentService.getById(id);
      setAssessment(assessmentData);

      // Load participant data for current user
      try {
        const participantInfo = await AssessmentResponseService.getByAssessmentAndAssessor({
          assessmentId: id,
          subjectProfileId: user.id,
          mode: 'self'
        });
        setParticipantData(participantInfo);
      } catch (err) {
        // User might not be a participant yet
        console.log("User not participating in this assessment:", err);
      }
    } catch (err) {
      console.error("Failed to load assessment data:", err);
      setError(err.message || "Failed to load assessment data");
    } finally {
      setLoading(false);
    }
  }, [id, user.id]);

  // Load data on mount
  useEffect(() => {
    if (id && user.id) {
      loadAssessmentData();
    }
  }, [id, loadAssessmentData]);

  // Navigation handlers
  const handleBack = () => {
    navigate("/dashboard");
  };

  // Refresh handler
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    loadAssessmentData();
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
            <Button onClick={handleBack}>Kembali ke Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="max-w-7xl mx-auto">
        {/* Page Header with Breadcrumbs */}
        <PageHeader
          breadcrumbs={[
            { label: 'Dashboard', href: '/', icon: Home },
            { label: 'Penilaian Saya', href: '/penilaian', icon: FileText },
            { label: assessment?.name || 'Detail Penilaian', icon: Settings }
          ]}
          title={assessment?.name || 'Detail Penilaian'}
          subtitle="Kelola penilaian bawahan dan lihat status pengisian"
          customActions={[
            {
              type: 'button',
              label: 'Refresh',
              icon: RefreshCw,
              color: 'gray',
              onClick: handleRefresh,
            }
          ]}
          showExportButton={false}
          loading={loading}
        />

        {error && (
          <ErrorAlert
            message={error}
            onClose={() => setError(null)}
            variant="flowbite"
          />
        )}

        {/* Assessment Info Card */}
        {assessment && (
          <Card className="my-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Status Penilaian
                </h3>
                <div className="mt-1">
                  <AssessmentStatusBadge status={assessment.status} />
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Periode Penilaian
                </h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {formatAssessmentPeriod(assessment.start_date, assessment.end_date)}
                </p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Kompetensi
                </h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {assessment.assessment_competencies?.length || 0} Kompetensi
                </p>
              </div>
            </div>
            
            {assessment.description && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Deskripsi
                </h3>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">
                  {assessment.description}
                </p>
              </div>
            )}
          </Card>
        )}

        <div className="mt-6">
          <div className="mt-4">
            <SubordinateTable
              assessmentId={id}
              supervisorId={user.id}
              onRefresh={refreshKey}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default SupervisorAssessmentDetailPage;