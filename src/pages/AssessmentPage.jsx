import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  TextInput, 
  Select, 
  Badge,
  Spinner,
  Alert
} from 'flowbite-react';
import { 
  ClipboardCheck, 
  Plus, 
  Search, 
  Filter, 
  RefreshCw,
  Users,
  Calendar,
  Edit,
  Eye
} from 'lucide-react';
import AssessmentService from '../services/AssessmentService';
import { AssessmentListHeader, StaffAssessmentListHeader } from '../components/common/PageHeader';
import AssessmentTable from '../components/assessment/AssessmentTable';
import AssessmentStatusBadge from '../components/assessment/AssessmentStatusBadge';
import { ASSESSMENT_STATUS, USER_POSITION } from '../constants/assessmentConstants';
import { LoadingSpinner, ErrorAlert } from '../components/common';
import { useUserContext } from '../contexts/UserContext';
import StaffAssessmentTable from '../components/assessment/staff/StaffAssessmentTable';

const AssessmentListPage = () => {
  // Navigation
  const navigate = useNavigate();

  const user = useUserContext();

  // State management
  const [assessments, setAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    participants: 0,
    dueSoon: 0
  });

  // Filter assessments based on search term and status
  const filterAssessments = useCallback(() => {
    let filtered = [...assessments];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(assessment =>
        assessment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assessment.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(assessment => assessment.status === statusFilter);
    }

    setFilteredAssessments(filtered);
  }, [assessments, searchTerm, statusFilter]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Load assessments on component mount
  useEffect(() => {
    loadAssessments();
    loadStatistics();
  }, []);

  // Filter assessments when search term or status filter changes
  useEffect(() => {
    filterAssessments();
  }, [filterAssessments]);

  // Load assessments from service
  const loadAssessments = async () => {
    try {
      setLoading(true);
      setError(null);
      let data = null;

      if (user.position_type === USER_POSITION.ADMIN) {
        data = await AssessmentService.getAll(true); // Include inactive
      } else if (user.position_type === USER_POSITION.ATASAN || user.position_type === USER_POSITION.BAWAHAN) {
        data = await AssessmentService.getByParticipant(user.id);
      }

      setAssessments(data);
    } catch (err) {
      console.error('Failed to load assessments:', err);
      setError(err.message || 'Failed to load assessments');
    } finally {
      setLoading(false);
    }
  };

  // Load assessment statistics
  const loadStatistics = async () => {
    try {
      let statistics;
      if (user.position_type === USER_POSITION.ADMIN) {
        statistics = await AssessmentService.getStatistics();
      } else {
        statistics = await AssessmentService.getMyStatistics(); // New method for staff stats
      }
      setStats(statistics);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    }
  };

  // Handle publish action
  const handlePublish = async (assessment) => {
    const confirmMessage = `Yakin ingin mempublikasikan assessment "${assessment.name}"?\n\nSetelah dipublikasikan, assessment akan aktif dan peserta dapat mulai mengisi penilaian.`;
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Publish assessment using service
      await AssessmentService.publish(assessment.id);
      
      // Update local state to reflect the change
      setAssessments(prev => 
        prev.map(a => 
          a.id === assessment.id 
            ? { ...a, status: ASSESSMENT_STATUS.IN_PROGRESS }
            : a
        )
      );
      
      // Refresh statistics
      await loadStatistics();
      
    } catch (err) {
      console.error('Failed to publish assessment:', err);
      setError(err.message || 'Gagal mempublikasikan assessment');
    } finally {
      setLoading(false);
    }
  };

  // Handle complete action
  const handleComplete = async (assessment) => {
    const confirmMessage = `Yakin ingin menyelesaikan assessment "${assessment.name}"?\n\nSetelah diselesaikan, assessment tidak dapat diubah lagi dan peserta tidak dapat mengisi penilaian.`;
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Complete assessment using service
      await AssessmentService.complete(assessment.id);
      
      // Update local state to reflect the change
      setAssessments(prev => 
        prev.map(a => 
          a.id === assessment.id 
            ? { ...a, status: ASSESSMENT_STATUS.DONE }
            : a
        )
      );
      
      // Refresh statistics
      await loadStatistics();
      
    } catch (err) {
      console.error('Failed to complete assessment:', err);
      setError(err.message || 'Gagal menyelesaikan assessment');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete action
  const handleDelete = async (assessment) => {
    if (!window.confirm(`Yakin ingin menghapus assessment "${assessment.name}"?`)) return;
    try {
      setLoading(true);
      setError(null);
      await AssessmentService.delete(assessment.id);
      // Hapus dari state
      setAssessments(prev => prev.filter(a => a.id !== assessment.id));
      
      // Refresh statistics
      await loadStatistics();
    } catch (err) {
      setError(err.message || 'Gagal menghapus assessment');
    } finally {
      setLoading(false);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className="page">
        <div className="max-w-7xl mx-auto">
          <AssessmentListHeader 
            loading={true}
            totalAssessments={0}
            activeAssessments={0}
            totalParticipants={0}
            dueSoon={0}
          />
          <LoadingSpinner message="Loading assessments..." />
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Statistics */}
        {user.position_type === USER_POSITION.ADMIN ? (
          <AssessmentListHeader 
            totalAssessments={stats.total}
            activeAssessments={stats.active}
            totalParticipants={stats.participants}
            dueSoon={stats.dueSoon}
            onCreateClick={() => navigate('/penilaian/create')}
            onFilterClick={() => setStatusFilter(statusFilter === 'all' ? 'draft' : 'all')}
            onExportClick={() => console.log('Export clicked')}
            loading={loading}
          />
        ) : (
          <StaffAssessmentListHeader 
            totalAssessments={stats.total}
            activeAssessments={stats.active}
            completedAssessments={stats.completed}
            dueSoon={stats.dueSoon}
            onFilterClick={() => setStatusFilter(statusFilter === 'all' ? ASSESSMENT_STATUS.IN_PROGRESS : 'all')}
            loading={loading}
          />
        )}

        {/* Error Alert */}
        {error && (
          <ErrorAlert 
            message={error} 
            onClose={() => setError(null)} 
            className="mb-6"
            variant="flowbite"
          />
        )}

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 my-5">
          <div className="flex-1">
            <TextInput
              icon={Search}
              placeholder={
                user.position_type === USER_POSITION.ADMIN 
                  ? "Search assessments by name or description..." 
                  : "Cari penilaian berdasarkan nama..."
              }
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="w-full sm:w-48">
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              icon={Filter}
            >
              {user.position_type === USER_POSITION.ADMIN ? (
                <>
                  <option value="all">All Status</option>
                  <option value={ASSESSMENT_STATUS.DRAFT}>Draft</option>
                  <option value={ASSESSMENT_STATUS.IN_PROGRESS}>In Progress</option>
                  <option value={ASSESSMENT_STATUS.DONE}>Done</option>
                </>
              ) : (
                <>
                  <option value="all">Semua Status</option>
                  <option value={ASSESSMENT_STATUS.IN_PROGRESS}>Aktif</option>
                  <option value={ASSESSMENT_STATUS.DONE}>Selesai</option>
                  <option value="my_completed">Saya Selesai</option>
                  <option value="my_pending">Belum Selesai</option>
                </>
              )}
            </Select>
          </div>
        </div>

        {/* Assessment Table */}
        {user.position_type === USER_POSITION.ADMIN ? (
          <AssessmentTable 
            assessments={filteredAssessments}
            onView={(assessment) => navigate(`/penilaian/${assessment.id}`)}
            onEdit={(assessment) => navigate(`/penilaian/${assessment.id}/edit`)}
            onDelete={handleDelete}
            onPublish={handlePublish}
            onComplete={handleComplete}
            onDuplicate={(assessment) => console.log('Duplicate:', assessment)}
            loading={loading}
          />
        ) : (
          <StaffAssessmentTable 
            assessments={filteredAssessments}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default AssessmentListPage;