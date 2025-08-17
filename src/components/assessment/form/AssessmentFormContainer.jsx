import React, { useEffect, useMemo, useState } from 'react';
import { Card, Button, Spinner, Alert } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import AssessmentProgress from './AssessmentProgress';
import CompetencySection from './CompetencySection';
import { LoadingModal, ErrorModal, SuccessModal } from '../../common';
import AssessmentService from '../../../services/AssessmentService';
import AssessmentCompetencyService from '../../../services/AssessmentCompetencyService';
import AssessmentResponseService from '../../../services/AssessmentResponseService';
import AuthService from '../../../services/AuthService';
import { ASSESSMENT_WEIGHTS } from '../../../constants/assessmentConstants';
import AssessmentParticipantService from '../../../services/AssessmentParticipantService';
import { useUserContext } from '../../../contexts/UserContext';

const AssessmentFormContainer = ({ assessmentId, mode = 'self', subjectProfileId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [competencies, setCompetencies] = useState([]);
  const [responses, setResponses] = useState({});
  const [supervisorResponses, setSupervisorResponses] = useState({});
  const [participantStatus, setParticipantStatus] = useState(null);

  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');

  const isSelf = mode === 'self';
  const assessorTypeWeight = isSelf ? ASSESSMENT_WEIGHTS.SELF : ASSESSMENT_WEIGHTS.SUPERVISOR;

  // Helper functions for modal
  const showSuccess = (message, title = 'Berhasil') => {
    setModalTitle(title);
    setModalMessage(message);
    setShowSuccessModal(true);
  };

  const showFlowbiteErrorModal = (message, title = 'Error') => {
    setModalTitle(title);
    setModalMessage(message);
    setShowErrorModal(true);
  };

  const showLoading = (message = 'Memproses...') => {
    setLoadingMessage(message);
    setShowLoadingModal(true);
  };

  const hideLoading = () => {
    setShowLoadingModal(false);
    setLoadingMessage('');
  };
  
  const user = useUserContext();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Load assessment
        const a = await AssessmentService.getById(assessmentId);
        setAssessment(a);

        // Load competencies
        const ac = await AssessmentCompetencyService.getByAssessmentId(assessmentId);
        const comps = (ac || [])
          .map((x) => x.competencies)
          .filter(Boolean);
        setCompetencies(comps);

        // Resolve subject id (fallback ke user aktif untuk self assessment)
        const resolvedSubjectId = subjectProfileId || user.id;

        // Load participant data
        const participantStatus = await AssessmentParticipantService.getAssessmentStatus(assessmentId, resolvedSubjectId, user?.id);
        setParticipantStatus(participantStatus);

        // Load existing responses based on mode
        if (mode === 'self') {
          // For self assessment, load user's own responses
          const existingSelfAssessment = await AssessmentResponseService.getByAssessmentAndAssessor({
            assessmentId,
            subjectProfileId: resolvedSubjectId,
            mode: 'self'
          });
          
          // Also load supervisor responses for comparison (read-only)
          const existingSupervisorAssessment = await AssessmentResponseService.getByAssessmentAndAssessor({
            assessmentId,
            subjectProfileId: resolvedSubjectId,
            mode: 'supervisor'
          });

          if (existingSelfAssessment?.responses) setResponses(existingSelfAssessment.responses);
          if (existingSupervisorAssessment?.responses) setSupervisorResponses(existingSupervisorAssessment.responses);
          
        } else if (mode === 'supervisor') {
          // For supervisor assessment, load supervisor's responses for the subject
          const existingSupervisorAssessment = await AssessmentResponseService.getByAssessmentAndAssessor({
            assessmentId,
            subjectProfileId: resolvedSubjectId,
            mode: 'supervisor'
          });
          
          // Also load self assessment responses for comparison (read-only)
          const existingSelfAssessment = await AssessmentResponseService.getByAssessmentAndAssessor({
            assessmentId,
            subjectProfileId: resolvedSubjectId,
            mode: 'self'
          });

          if (existingSupervisorAssessment?.responses) setResponses(existingSupervisorAssessment.responses);
          if (existingSelfAssessment?.responses) setSupervisorResponses(existingSelfAssessment.responses);
        }

      } catch (err) {
        setError(err?.message || 'Gagal memuat form assessment');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assessmentId, mode, subjectProfileId, user]);

  const totalIndicators = useMemo(() => {
    return competencies.reduce((sum, c) => sum + (c.indicators?.length || 0), 0);
  }, [competencies]);

  // Helper ambil angka value dari berbagai bentuk state (number | { value } | { score })
  const getResponseValue = (r) => {
    if (typeof r === 'number') return r;
    if (r && typeof r === 'object') {
      if (typeof r.value === 'number') return r.value;
      if (typeof r.score === 'number') return r.score;
    }
    return null;
  };

  const filledIndicators = useMemo(() => {
    return Object.values(responses).filter((r) => typeof getResponseValue(r) === 'number').length;
  }, [responses]);

  // Normalisasi input perubahan agar selalu ke { value, text? }
  const handleChange = (indicatorId, val) => {
    let normalized = null;
    if (typeof val === 'number') {
      normalized = { value: val };
    } else if (val && typeof val === 'object') {
      const v = typeof val.value === 'number'
        ? val.value
        : (typeof val.score === 'number' ? val.score : undefined);
      normalized = {
        value: v,
        text: typeof val.text === 'string' ? val.text : undefined,
      };
    }
    setResponses((prev) => ({ ...prev, [indicatorId]: normalized }));
  };

  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      setError(null);
      showLoading('Menyimpan draft...');
      
      const sid = subjectProfileId || user?.id;
      await AssessmentResponseService.saveDraft({
        assessmentId,
        assessmentStatus: 'draft',
        subjectProfileId: sid,
        assessorProfileId: user?.id,
        responses
      });

      hideLoading();
      showSuccess('Draft berhasil disimpan. Anda akan diarahkan ke halaman penilaian...');
      
      // Navigate back to penilaian page after 2 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate(-1);
      }, 2000);

    } catch (err) {
      hideLoading();
      showFlowbiteErrorModal(err?.message || 'Gagal menyimpan draft');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (filledIndicators < totalIndicators) {
      showFlowbiteErrorModal('Lengkapi semua indikator sebelum submit', 'Validasi Error');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      showLoading('Mengirim assessment...');
      
      const sid = subjectProfileId || user?.id;
      await AssessmentResponseService.submit({
        assessmentId,
        assessmentStatus: 'submitted',
        subjectProfileId: sid,
        assessorProfileId: user?.id,
        responses
      });
      
      hideLoading();
      showSuccess('Assessment berhasil disubmit. Anda akan diarahkan ke halaman penilaian...');
      
      // Navigate back to penilaian page after 2 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/penilaian');
      }, 2000);

    } catch (err) {
      hideLoading();
      showFlowbiteErrorModal(err?.message || 'Gagal submit assessment');
    } finally {
      setSaving(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // If modal was closed manually, still navigate to penilaian page
    navigate('/penilaian');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
        <span className="ml-2">Memuat form...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert color="failure" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      <div className="lg:col-span-1 sticky top-32 self-start z-10">
        <Card>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">
              {assessment?.name} • {isSelf ? 'Penilaian Diri' : 'Penilaian Atasan'}
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Bobot: {Math.round((assessorTypeWeight || 0) * 100)}%
            </div>
            <AssessmentProgress total={totalIndicators} filled={filledIndicators} />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {competencies.map((c) => (
          <CompetencySection
            key={c.id}
            competency={c}
            responses={responses}
            supervisorResponses={supervisorResponses}
            onChange={handleChange}
            mode={mode}
            disabled={saving || participantStatus?.status === 'submitted'}
          />
        ))}
      </div>

      {participantStatus?.status !== 'submitted' && (
        <div className="flex gap-2 justify-end">
          <Button color="gray" onClick={handleSaveDraft} disabled={saving}>
            {saving ? <Spinner size="sm" /> : 'Simpan Draft'}
          </Button>
          <Button color="blue" onClick={handleSubmit} disabled={saving || totalIndicators === 0}>
            {saving ? <Spinner size="sm" /> : 'Submit Assessment'}
          </Button>
        </div>
      )}

      {/* Modals */}
      <LoadingModal
        show={showLoadingModal}
        message={loadingMessage}
      />

      <SuccessModal
        show={showSuccessModal}
        onClose={handleSuccessModalClose}
        title={modalTitle}
        message={modalMessage}
      />

      <ErrorModal
        show={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={modalTitle}
        message={modalMessage}
      />
    </div>
  );
};

export default AssessmentFormContainer;