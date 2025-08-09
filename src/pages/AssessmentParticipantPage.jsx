import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Alert, Spinner } from 'flowbite-react';
import { ArrowLeft, Users, UserPlus, Upload, Download, Settings, Home, FileText } from 'lucide-react';
import ParticipantTable from '../components/assessment/ParticipantTable';
import ParticipantModal from '../components/assessment/ParticipantModal';
import BulkParticipantSelector from '../components/assessment/BulkParticipantSelector';
import AssessmentService from '../services/AssessmentService';
import AssessmentParticipantService from '../services/AssessmentParticipantService';
import ErrorAlert from '../components/common/ErrorAlert';
import PageHeader from '../components/common/PageHeader';
import { formatAssessmentPeriod } from '../utils/assessmentUtils';

const AssessmentParticipantPage = () => {
  const { assessmentId } = useParams();
  
  // State management
  const [assessment, setAssessment] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [showBulkSelector, setShowBulkSelector] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);


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

    } catch (err) {
      console.error('Error loading assessment data:', err);
      setError('Failed to load assessment data. Please try again.');
    } finally {
      setLoading(false);
    }
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
      <div className="max-w-7xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-6">
          <PageHeader
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
            showExportButton={false}
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
