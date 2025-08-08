import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Alert, Spinner } from 'flowbite-react';
import { ArrowLeft, Users, UserPlus, Upload, Download, Settings, Home, FileText } from 'lucide-react';
import ParticipantTable from '../components/assessment/ParticipantTable';
import ParticipantModal from '../components/assessment/ParticipantModal';
import BulkParticipantSelector from '../components/assessment/BulkParticipantSelector';
import AssessmentService from '../services/assessmentService';
import AssessmentParticipantService from '../services/AssessmentParticipantService';
import ErrorAlert from '../components/common/ErrorAlert';
import AssessmentHeader from '../components/assessment/AssessmentHeader';
import { formatAssessmentPeriod } from '../utils/assessmentUtils';

const AssessmentParticipantPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [assessment, setAssessment] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [showBulkSelector, setShowBulkSelector] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    selfAssessment: 0,
    supervisorAssessment: 0,
    completed: 0,
    pending: 0
  });

  // Load assessment and participants
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load assessment details
        const assessmentData = await AssessmentService.getById(assessmentId);
        setAssessment(assessmentData);

        // Load participants
        const participantsData = await AssessmentParticipantService.getByAssessmentId(assessmentId);
        setParticipants(participantsData);

        // Calculate stats
        calculateStats(participantsData);

      } catch (err) {
        console.error('Error loading assessment data:', err);
        setError('Failed to load assessment data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [assessmentId]);

  const loadAssessmentData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load assessment details
      const assessmentData = await AssessmentService.getById(assessmentId);
      setAssessment(assessmentData);

      // Load participants
      const participantsData = await AssessmentParticipantService.getByAssessmentId(assessmentId);
      setParticipants(participantsData);

      // Calculate stats
      calculateStats(participantsData);

    } catch (err) {
      console.error('Error loading assessment data:', err);
      setError('Failed to load assessment data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (participantsData) => {
    const selfAssessments = participantsData.filter(p => p.subject_profile_id === p.assessor_profile_id);
    const supervisorAssessments = participantsData.filter(p => p.subject_profile_id !== p.assessor_profile_id);
    
    // This would need actual response data to calculate completed vs pending
    const completed = participantsData.filter(p => p.status === 'completed').length;
    const pending = participantsData.filter(p => p.status === 'pending').length;

    setStats({
      total: participantsData.length,
      selfAssessment: selfAssessments.length,
      supervisorAssessment: supervisorAssessments.length,
      completed,
      pending
    });
  };

  const handleAddParticipant = () => {
    setSelectedParticipant(null);
    setShowParticipantModal(true);
  };

  const handleEditParticipant = (participant) => {
    setSelectedParticipant(participant);
    setShowParticipantModal(true);
  };

  const handleDeleteParticipant = async (participant) => {
    if (!window.confirm('Are you sure you want to remove this participant?')) {
      return;
    }

    try {
      if (participant?.self_assessment?.id) {
        await AssessmentParticipantService.delete(participant.self_assessment.id);
      }
      if (participant?.supervisor_assessment?.id) {
        await AssessmentParticipantService.delete(participant.supervisor_assessment.id);
      }
      await loadAssessmentData(); // Reload data
    } catch (err) {
      console.error('Error deleting participant:', err);
      setError('Failed to remove participant. Please try again.');
    }
  };

  const handleSaveParticipant = async (participantData) => {
    try {
      if (selectedParticipant) {
        // Update existing participant
        await AssessmentParticipantService.update(selectedParticipant.id, participantData);
      } else {
        // Create new participant
        await AssessmentParticipantService.create({
          ...participantData,
          assessment_id: assessmentId
        });
      }
      
      setShowParticipantModal(false);
      setSelectedParticipant(null);
      await loadAssessmentData(); // Reload data
    } catch (err) {
      console.error('Error saving participant:', err);
      throw new Error('Failed to save participant. Please try again.');
    }
  };

  const handleBulkAdd = async (selectedUsers) => {
    try {
      setLoading(true);

      // Create participants for selected users
      const promises = selectedUsers.map(user => 
        AssessmentParticipantService.create({
          assessment_id: assessmentId,
          subject_profile_id: user.subject_profile_id,
          assessor_profile_id: user.assessor_profile_id
        })
      );

      await Promise.all(promises);
      setShowBulkSelector(false);
      await loadAssessmentData(); // Reload data
    } catch (err) {
      console.error('Error adding bulk participants:', err);
      setError('Failed to add participants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportParticipants = () => {
    // Export participants to CSV/Excel
    const csvData = participants.map(p => ({
      'Subject Name': p.subject_name,
      'Assessor Name': p.assessor_name,
      'Type': p.subject_profile_id === p.assessor_profile_id ? 'Self Assessment' : 'Supervisor Assessment',
      'Status': p.status || 'Pending',
      'Created At': new Date(p.created_at).toLocaleDateString('id-ID')
    }));

    // Simple CSV export (you might want to use a library like papa-parse)
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assessment-${assessmentId}-participants.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading && !assessment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="page">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Page Header */}
        <div className="mb-6">
          <AssessmentHeader
            breadcrumbs={[
              { label: 'Dashboard', href: '/', icon: Home },
              { label: 'Penilaian', href: '/penilaian', icon: FileText },
              { 
                label: assessment?.name || 'Detail Penilaian', 
                href: `/penilaian/${assessmentId}`, 
                icon: Settings 
              },
              { label: 'Peserta', icon: Users }
            ]}
            title={assessment?.name || 'Peserta Penilaian'}
            subtitle={assessment ? 
              `${formatAssessmentPeriod(assessment.start_date, assessment.end_date)}` : 
              'Kelola peserta penilaian dan pantau progres mereka'
            }
            showExportButton={true}
            exportLabel="Ekspor Peserta"
            onExportClick={handleExportParticipants}
            customActions={[
              {
                type: 'button',
                label: 'Tambah Peserta',
                icon: UserPlus,
                color: 'blue',
                onClick: () => setShowBulkSelector(true)
              },
              // {
              //   type: 'button',
              //   label: 'Tambah Peserta (Manual)',
              //   icon: UserPlus,
              //   color: 'blue',
              //   onClick: handleAddParticipant
              // }
            ]}
            stats={[
              // {
              //   label: 'Total Peserta',
              //   value: stats.total,
              //   icon: Users,
              //   bgColor: 'bg-blue-50 dark:bg-blue-900/20',
              //   borderColor: 'border-blue-200 dark:border-blue-800',
              //   iconColor: 'text-blue-600 dark:text-blue-400',
              //   labelColor: 'text-blue-600 dark:text-blue-400',
              //   valueColor: 'text-blue-900 dark:text-blue-300'
              // },
              // {
              //   label: 'Penilaian Diri',
              //   value: stats.selfAssessment,
              //   icon: Users,
              //   bgColor: 'bg-green-50 dark:bg-green-900/20',
              //   borderColor: 'border-green-200 dark:border-green-800',
              //   iconColor: 'text-green-600 dark:text-green-400',
              //   labelColor: 'text-green-600 dark:text-green-400',
              //   valueColor: 'text-green-900 dark:text-green-300'
              // },
              // {
              //   label: 'Penilaian Atasan',
              //   value: stats.supervisorAssessment,
              //   icon: Users,
              //   bgColor: 'bg-purple-50 dark:bg-purple-900/20',
              //   borderColor: 'border-purple-200 dark:border-purple-800',
              //   iconColor: 'text-purple-600 dark:text-purple-400',
              //   labelColor: 'text-purple-600 dark:text-purple-400',
              //   valueColor: 'text-purple-900 dark:text-purple-300'
              // },
              // {
              //   label: 'Selesai',
              //   value: stats.completed,
              //   icon: Users,
              //   bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
              //   borderColor: 'border-yellow-200 dark:border-yellow-800',
              //   iconColor: 'text-yellow-600 dark:text-yellow-400',
              //   labelColor: 'text-yellow-600 dark:text-yellow-400',
              //   valueColor: 'text-yellow-900 dark:text-yellow-300'
              // },
              // {
              //   label: 'Belum Selesai',
              //   value: stats.pending,
              //   icon: Users,
              //   bgColor: 'bg-red-50 dark:bg-red-900/20',
              //   borderColor: 'border-red-200 dark:border-red-800',
              //   iconColor: 'text-red-600 dark:text-red-400',
              //   labelColor: 'text-red-600 dark:text-red-400',
              //   valueColor: 'text-red-900 dark:text-red-300'
              // }
            ]}
            loading={loading}
          />
        </div>

        {/* Error Alert */}
        {error && (
          <ErrorAlert 
            message={error.replace('Failed to load assessment data. Please try again.', 'Gagal memuat data penilaian. Silakan coba lagi.')
              .replace('Failed to remove participant. Please try again.', 'Gagal menghapus peserta. Silakan coba lagi.')
              .replace('Failed to add participants. Please try again.', 'Gagal menambahkan peserta. Silakan coba lagi.')
            }
            onClose={() => setError(null)}
            className="mb-6"
          />
        )}

        {/* Participants Table */}
        <ParticipantTable
          participants={participants}
          loading={loading}
          onEdit={handleEditParticipant}
          onDelete={handleDeleteParticipant}
          onRefresh={loadAssessmentData}
        />

        {/* Participant Modal */}
        {showParticipantModal && (
          <ParticipantModal
            participant={selectedParticipant}
            onClose={() => {
              setShowParticipantModal(false);
              setSelectedParticipant(null);
            }}
            onSave={handleSaveParticipant}
          />
        )}

        {/* Bulk Participant Selector */}
        {showBulkSelector && (
          <BulkParticipantSelector
            assessmentId={assessmentId}
            existingParticipants={participants}
            onClose={() => setShowBulkSelector(false)}
            onSave={handleBulkAdd}
          />
        )}
      </div>
    </div>
  );
};

export default AssessmentParticipantPage;
