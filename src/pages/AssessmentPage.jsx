// Assessment List Page - Main page for viewing and managing assessments
// Shows all assessments with filtering, search, and management actions

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
import { AssessmentListHeader } from '../components/assessment/AssessmentHeader';
import AssessmentTable from '../components/assessment/AssessmentTable';
import AssessmentStatusBadge from '../components/assessment/AssessmentStatusBadge';
import { ASSESSMENT_STATUS } from '../constants/assessmentConstants';
import { LoadingSpinner, ErrorAlert } from '../components/common';

const AssessmentListPage = () => {
  // Navigation
  const navigate = useNavigate();

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
      const data = await AssessmentService.getAll(true); // Include inactive
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
      const statistics = await AssessmentService.getStatistics();
      setStats(statistics);
    } catch (err) {
      console.error('Failed to load statistics:', err);
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
        {/* <Card className="mb-6 bg-white dark:bg-gray-800"> */}
          <div className="flex flex-col sm:flex-row gap-4 my-5">
            <div className="flex-1">
              <TextInput
                icon={Search}
                placeholder="Search assessments by name or description..."
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
                <option value="all">All Status</option>
                <option value={ASSESSMENT_STATUS.DRAFT}>Draft</option>
                <option value={ASSESSMENT_STATUS.IN_PROGRESS}>In Progress</option>
                <option value={ASSESSMENT_STATUS.DONE}>Done</option>
              </Select>
            </div>
          </div>
        {/* </Card> */}

        {/* Assessment Table */}
        {/* <Card className="bg-transparent" theme={{root: {children: "p-1"}}}> */}
          <AssessmentTable 
            assessments={filteredAssessments}
            onView={(assessment) => navigate(`/penilaian/${assessment.id}`)}
            onEdit={(assessment) => navigate(`/penilaian/${assessment.id}/edit`)}
            onDelete={handleDelete}
            onDuplicate={(assessment) => console.log('Duplicate:', assessment)}
            loading={loading}
          />
        {/* </Card> */}
      </div>
    </div>
  );
};

export default AssessmentListPage;
