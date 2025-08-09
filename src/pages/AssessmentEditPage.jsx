// Assessment Edit Page - Edit existing assessment (only Draft status)
// Allows modification of assessment details and competencies

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Card, 
  Button, 
  TextInput, 
  Textarea,
  Label,
  Alert,
  Spinner,
  Tabs,
  TabItem,
  Select
} from 'flowbite-react';
import { 
  ClipboardCheck, 
  Save, 
  ArrowLeft,
  Calendar,
  Award,
  Lock,
  Users
} from 'lucide-react';
import AssessmentService from '../services/AssessmentService';
import CompetencyService from '../services/CompetencyService';
import AssessmentCompetencyService from '../services/AssessmentCompetencyService';
import CompetencySelector from '../components/assessment/CompetencySelector';
import AssessmentStatusBadge from '../components/assessment/AssessmentStatusBadge';
import { validateAssessmentDates, validateAssessmentWeights } from '../utils/assessmentUtils';
import { 
  ASSESSMENT_STATUS, 
  ASSESSMENT_WEIGHTS,
  RATING_TYPE
} from '../constants/assessmentConstants';
import { LoadingSpinner, ErrorAlert } from '../components/common';
import { AssessmentEditHeader } from '../components/common/PageHeader';

const AssessmentEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Assessment data
  const [assessment, setAssessment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    configuration: '',
    self_weight: ASSESSMENT_WEIGHTS.SELF,
    supervisor_weight: ASSESSMENT_WEIGHTS.SUPERVISOR
  });

  // Competencies state
  const [availableCompetencies, setAvailableCompetencies] = useState([]);
  const [selectedCompetencies, setSelectedCompetencies] = useState([]);
  const [loadingCompetencies, setLoadingCompetencies] = useState(true);

  // UI state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Tab state
  const [activeTab, setActiveTab] = useState("info");

  // Load assessment details
  const loadAssessment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await AssessmentService.getById(id);
      setAssessment(data);
      
      // Populate form data
      setFormData({
        name: data.name || '',
        description: data.description || '',
        start_date: data.start_date ? data.start_date.split('T')[0] : '',
        end_date: data.end_date ? data.end_date.split('T')[0] : '',
        configuration: data.configuration || '',
        self_weight: data.self_weight || ASSESSMENT_WEIGHTS.SELF,
        supervisor_weight: data.supervisor_weight || ASSESSMENT_WEIGHTS.SUPERVISOR
      });

      // Set selected competencies
      if (data.assessment_competencies) {
        const selectedComps = data.assessment_competencies
          .filter(ac => ac.competencies)
          .map(ac => ac.competencies);
        setSelectedCompetencies(selectedComps);
      }

    } catch (err) {
      console.error('Failed to load assessment:', err);
      setError(err.message || 'Failed to load assessment');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Load available competencies
  const loadCompetencies = async () => {
    try {
      setLoadingCompetencies(true);
      const data = await CompetencyService.getActive();
      setAvailableCompetencies(data);
    } catch (err) {
      console.error('Failed to load competencies:', err);
    } finally {
      setLoadingCompetencies(false);
    }
  };

  // Load assessment data on mount
  useEffect(() => {
    if (id) {
      loadAssessment();
      loadCompetencies();
    }
  }, [id, loadAssessment]);

  // Check if assessment can be modified
  const canModify = () => {
    return assessment && assessment.status === ASSESSMENT_STATUS.DRAFT;
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Handle competency selection change
  const handleCompetencyChange = (competencies) => {
    setSelectedCompetencies(competencies);
    
    // Clear competency validation error
    if (validationErrors.competencies) {
      setValidationErrors(prev => ({
        ...prev,
        competencies: null
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    // Required fields validation
    if (!formData.name.trim()) {
      errors.name = 'Nama assessment wajib diisi';
    }

    if (!formData.start_date) {
      errors.start_date = 'Tanggal mulai wajib diisi';
    }

    if (!formData.end_date) {
      errors.end_date = 'Tanggal selesai wajib diisi';
    }

    if (!formData.configuration) {
      errors.configuration = 'Skema penilaian wajib dipilih';
    }

    // Date validation
    if (formData.start_date && formData.end_date) {
      const dateValidation = validateAssessmentDates(formData.start_date, formData.end_date);
      if (!dateValidation.isValid) {
        errors.dates = 'Tanggal mulai harus sebelum tanggal selesai';
      }
    }

    // Competencies validation
    if (selectedCompetencies.length === 0) {
      errors.competencies = 'Pilih minimal satu kompetensi';
    }

    // Weight validation
    const weightValidation = validateAssessmentWeights(formData.self_weight, formData.supervisor_weight);
    if (!weightValidation.isValid) {
      errors.weights = 'Total bobot harus sama dengan 1.0';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!canModify()) {
      setError('Tidak dapat mengubah assessment yang bukan berstatus Draft');
      return;
    }

    if (!validateForm()) {
      setError('Silakan perbaiki kesalahan validasi di bawah ini');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Update assessment
      await AssessmentService.update(id, formData);

      // Update competencies
      await AssessmentCompetencyService.replaceAssessmentCompetencies(
        id,
        selectedCompetencies.map(c => c.id)
      );

      // Navigate back to assessment detail
      navigate(`/penilaian/${id}`);
      
    } catch (err) {
      console.error('Failed to update assessment:', err);
      setError(err.message || 'Gagal memperbarui assessment');
    } finally {
      setSaving(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(`/penilaian/${id}`);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="page">
        <div className="max-w-7xl mx-auto">
          <LoadingSpinner message="Memuat assessment..." />
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
            <Button onClick={() => navigate('/penilaian')}>
              Kembali ke Penilaian
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <AssessmentEditHeader 
          assessmentTitle={assessment?.name}
          status={assessment?.status}
        />

        {/* Error Alert */}
        {error && (
          <Alert color="failure" className="mb-6">
            <span className="font-medium">Kesalahan!</span> {error}
          </Alert>
        )}

        {/* Read Only Warning */}
        {!canModify() && (
          <Alert color="warning" className="mb-6">
            <span className="font-medium">Peringatan!</span> Assessment ini tidak dapat diubah 
            karena tidak berstatus Draft. Hanya assessment Draft yang dapat diedit.
          </Alert>
        )}

        {/* Main Form */}
        <form className="my-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Tabs for Assessment Info & Competencies */}
            <div className="lg:col-span-3">
              <Tabs
                aria-label="Tabs Assessment"
                onActiveTabChange={(tab) => setActiveTab(tab)}
                theme={{
                  base: " border border-gray-200 rounded-lg bg-white shadow-sm",
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
                <TabItem
                  title="Informasi Penilaian"
                  active={activeTab === "info"}
                  tabIndex={0}
                >
                  <div className="space-y-4">
                    {/* Assessment Name */}
                    <div className="mb-4">
                      <Label htmlFor="name">
                        Nama Penilaian <span className="text-red-600">*</span>
                      </Label>
                      <TextInput
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama assessment"
                        color={validationErrors.name ? "failure" : "gray"}
                        helperText={validationErrors.name}
                        className="mt-1"
                        disabled={!canModify()}
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <Label htmlFor="description">Deskripsi</Label>
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Masukkan deskripsi dan tujuan assessment..."
                        rows={3}
                        className="mt-1"
                        disabled={!canModify()}
                      />
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label htmlFor="start_date">
                          Tanggal Mulai <span className="text-red-600">*</span>
                        </Label>
                        <TextInput
                          id="start_date"
                          name="start_date"
                          type="date"
                          value={formData.start_date}
                          onChange={handleInputChange}
                          color={validationErrors.start_date ? "failure" : "gray"}
                          helperText={validationErrors.start_date}
                          className="mt-1"
                          disabled={!canModify()}
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <Label htmlFor="end_date">
                          Tanggal Selesai <span className="text-red-600">*</span>
                        </Label>
                        <TextInput
                          id="end_date"
                          name="end_date"
                          type="date"
                          value={formData.end_date}
                          onChange={handleInputChange}
                          color={validationErrors.end_date ? "failure" : "gray"}
                          helperText={validationErrors.end_date}
                          className="mt-1"
                          disabled={!canModify()}
                          required
                        />
                      </div>
                    </div>

                    {/* Date Validation Error */}
                    {validationErrors.dates && (
                      <Alert color="failure" className="mt-2">
                        {validationErrors.dates}
                      </Alert>
                    )}

                    {/* Assessment Weights */}
                    <div className="mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="self_weight">
                            Bobot Penilaian Mandiri <span className="text-red-600">*</span>
                          </Label>
                          <TextInput
                            id="self_weight"
                            name="self_weight"
                            type="number"
                            step="0.1"
                            min="0"
                            max="1"
                            value={formData.self_weight}
                            onChange={handleInputChange}
                            color={
                              validationErrors.self_weight ? "failure" : "gray"
                            }
                            helperText={validationErrors.self_weight}
                            className="mt-1"
                            disabled={!canModify()}
                            required
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Bobot untuk penilaian mandiri (0.0 - 1.0)
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="supervisor_weight">
                            Bobot Penilaian Atasan <span className="text-red-600">*</span>
                          </Label>
                          <TextInput
                            id="supervisor_weight"
                            name="supervisor_weight"
                            type="number"
                            step="0.1"
                            min="0"
                            max="1"
                            value={formData.supervisor_weight}
                            onChange={handleInputChange}
                            color={
                              validationErrors.supervisor_weight
                                ? "failure"
                                : "gray"
                            }
                            helperText={validationErrors.supervisor_weight}
                            className="mt-1"
                            disabled={!canModify()}
                            required
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Bobot untuk penilaian atasan (0.0 - 1.0)
                          </p>
                        </div>
                      </div>

                      {/* Weight Validation Error */}
                      {validationErrors.weights && (
                        <Alert color="failure" className="mt-2">
                          {validationErrors.weights}
                        </Alert>
                      )}

                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Total Saat Ini:</strong>{" "}
                          {(
                            parseFloat(formData.self_weight || 0) +
                            parseFloat(formData.supervisor_weight || 0)
                          ).toFixed(1)}{" "}
                          (Harus sama dengan 1.0)
                        </p>
                      </div>
                    </div>

                    {/* Rating Scale Selection */}
                    <div className="mb-4">
                      <Label htmlFor="configuration">
                        Skema Penilaian <span className="text-red-600">*</span>
                      </Label>
                      <Select
                        id="configuration"
                        name="configuration"
                        value={formData.configuration}
                        onChange={handleInputChange}
                        color={validationErrors.configuration ? "failure" : "gray"}
                        className="mt-1"
                        disabled={!canModify()}
                      >
                        <option value="">Pilih Skema Penilaian</option>
                        {RATING_TYPE.map((scale) => (
                          <option key={scale.value} value={scale.value}>
                            {scale.label}
                          </option>
                        ))}
                      </Select>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {RATING_TYPE.find((s) => s.value === formData.configuration)
                          ?.description}
                      </p>
                      {validationErrors.configuration && (
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                          {validationErrors.configuration}
                        </p>
                      )}
                    </div>
                  </div>
                </TabItem>
                <TabItem
                  title="Kompetensi"
                  active={activeTab === "competencies"}
                  tabIndex={1}
                >
                  {loadingCompetencies ? (
                    <div className="flex items-center justify-center py-8">
                      <Spinner size="lg" />
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        Memuat kompetensi...
                      </span>
                    </div>
                  ) : (
                    <>
                      <CompetencySelector
                        availableCompetencies={availableCompetencies}
                        selectedCompetencies={selectedCompetencies}
                        onChange={handleCompetencyChange}
                        error={validationErrors.competencies}
                        disabled={!canModify()}
                        required
                      />
                      {validationErrors.competencies && (
                        <Alert color="failure" className="mt-2">
                          {validationErrors.competencies}
                        </Alert>
                      )}
                    </>
                  )}
                </TabItem>
              </Tabs>
            </div>

            {/* Right Column - Actions */}
            <div className="lg:col-span-1 sticky top-18 self-start z-10">
              <Card className="bg-white dark:bg-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Users className="mr-2 text-blue-600 dark:text-blue-400" />
                  Aksi
                </h2>

                <div className="space-y-3">
                  {canModify() ? (
                    <Button
                      type="submit"
                      color="blue"
                      disabled={saving}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <Spinner size="sm" />
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Simpan Perubahan
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      color="gray"
                      disabled
                      className="w-full"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Tidak Dapat Diedit
                    </Button>
                  )}

                  <Button
                    type="button"
                    color="gray"
                    onClick={handleBack}
                    disabled={saving}
                    className="w-full"
                  >
                    Kembali ke Detail
                  </Button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Catatan:</strong> Perubahan akan disimpan dan 
                    assessment tetap dalam status Draft.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssessmentEditPage;
