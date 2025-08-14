import React, { useEffect, useMemo, useState } from 'react';
import { Card, Button, Spinner, Alert } from 'flowbite-react';
import AssessmentProgress from './AssessmentProgress';
import CompetencySection from './CompetencySection';
import LoadingModal from '../../common/LoadingModal';
import SuccessModal from '../../common/SuccessModal';
import ErrorModal from '../../common/ErrorModal';
import AssessmentService from '../../../services/AssessmentService';
import AssessmentCompetencyService from '../../../services/AssessmentCompetencyService';
import AssessmentResponseService from '../../../services/AssessmentResponseService';
import AuthService from '../../../services/AuthService';
import { ASSESSMENT_WEIGHTS } from '../../../constants/assessmentConstants';

const AssessmentFormContainer = ({ assessmentId, mode = 'self', subjectProfileId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [competencies, setCompetencies] = useState([]);
  const [responses, setResponses] = useState({});
  
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

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user
        const currentUser = await AuthService.checkUser();
        if (!currentUser) {
          throw new Error('User not authenticated');
        }
        setUser(currentUser);
        
        // Load assessment
        const a = await AssessmentService.getById(assessmentId);
        setAssessment(a);

        // Load competencies
        const ac = await AssessmentCompetencyService.getByAssessmentId(assessmentId);
        const comps = (ac || [])
          .map((x) => x.competencies)
          .filter(Boolean);
        setCompetencies(comps);

        // Resolve subject id (fallback ke user aktif)
        const resolvedSubjectId = subjectProfileId || currentUser.id;

        // Load existing draft responses if any
        const existing = await AssessmentResponseService.getByAssessmentAndAssessor({
          assessmentId,
          subjectProfileId: resolvedSubjectId,
          mode
        });

        // existing.responses berbentuk { [indicatorId]: { id, value, text, updated_at } }
        if (existing?.responses) setResponses(existing.responses);
      } catch (err) {
        setError(err?.message || 'Gagal memuat form assessment');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [assessmentId, mode, subjectProfileId]);

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
      showSuccess('Draft berhasil disimpan');
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
      
      const sid = subjectProfileId;
      await AssessmentResponseService.submit({
        assessmentId,
        assessmentStatus: 'submitted',
        subjectProfileId: sid,
        assessorProfileId: user?.id,
        responses
      });
      
      hideLoading();
      showSuccess('Assessment berhasil disubmit');
    } catch (err) {
      hideLoading();
      showFlowbiteErrorModal(err?.message || 'Gagal submit assessment');
    } finally {
      setSaving(false);
    }
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

      <Card>
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">
            {assessment?.name} • {isSelf ? 'Self Assessment' : 'Supervisor Assessment'}
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Bobot: {Math.round((assessorTypeWeight || 0) * 100)}%
          </div>
          <AssessmentProgress total={totalIndicators} filled={filledIndicators} />
        </div>
      </Card>

      <div className="space-y-4">
        {competencies.map((c) => (
          <CompetencySection
            key={c.id}
            competency={c}
            responses={responses}
            onChange={handleChange}
            disabled={saving}
          />
        ))}
      </div>

      <div className="flex gap-2 justify-end">
        <Button color="gray" onClick={handleSaveDraft} disabled={saving}>
          {saving ? <Spinner size="sm" /> : 'Simpan Draft'}
        </Button>
        <Button color="blue" onClick={handleSubmit} disabled={saving || totalIndicators === 0}>
          {saving ? <Spinner size="sm" /> : 'Submit Assessment'}
        </Button>
      </div>

      {/* Modals */}
      <LoadingModal
        show={showLoadingModal}
        message={loadingMessage}
      />

      <SuccessModal
        show={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
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