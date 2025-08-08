// Assessment Create Page - Form for creating new assessments
// Allows admin to create assessment with competencies selection

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Select,
} from "flowbite-react";
import {
  ClipboardCheck,
  Save,
  ArrowLeft,
  Calendar,
  Users,
  Award,
} from "lucide-react";
import AssessmentService from "../services/assessmentService";
import CompetencyService from "../services/CompetencyService";
import AssessmentCompetencyService from "../services/AssessmentCompetencyService";
import CompetencySelector from "../components/assessment/CompetencySelector";
import {
  validateAssessmentDates,
  validateAssessmentWeights,
} from "../utils/assessmentUtils";
import {
  ASSESSMENT_STATUS,
  ASSESSMENT_WEIGHTS,
  RATING_TYPE
} from "../constants/assessmentConstants";
import { AssessmentCreateHeader } from "../components/assessment/AssessmentHeader";

const AssessmentCreatePage = () => {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    configuration: "likert_5", // Default rating scale
    self_weight: ASSESSMENT_WEIGHTS.SELF,
    supervisor_weight: ASSESSMENT_WEIGHTS.SUPERVISOR,
  });

  // Available competencies and selected ones
  const [availableCompetencies, setAvailableCompetencies] = useState([]);
  const [selectedCompetencies, setSelectedCompetencies] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingCompetencies, setLoadingCompetencies] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Tab state
  const [activeTab, setActiveTab] = useState("info");

  // Load available competencies on mount
  useEffect(() => {
    loadCompetencies();
  }, []);

  // Load all active competencies
  const loadCompetencies = async () => {
    try {
      setLoadingCompetencies(true);
      const data = await CompetencyService.getActive();
      setAvailableCompetencies(data);
    } catch (err) {
      console.error("Failed to load competencies:", err);
      setError("Failed to load competencies");
    } finally {
      setLoadingCompetencies(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle competency selection change
  const handleCompetencyChange = (competencies) => {
    setSelectedCompetencies(competencies);

    // Clear competency validation error
    if (validationErrors.competencies) {
      setValidationErrors((prev) => ({
        ...prev,
        competencies: null,
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    // Required fields validation
    if (!formData.name.trim()) {
      errors.name = "Nama assessment wajib diisi";
    }

    if (!formData.start_date) {
      errors.start_date = "Tanggal mulai wajib diisi";
    }

    if (!formData.end_date) {
      errors.end_date = "Tanggal selesai wajib diisi";
    }

    if (!formData.configuration) {
      errors.configuration = "Skema penilaian wajib dipilih";
    }

    // Date validation
    if (formData.start_date && formData.end_date) {
      const dateValidation = validateAssessmentDates(
        formData.start_date,
        formData.end_date
      );
      if (!dateValidation.isValid) {
        errors.dates = "Tanggal mulai harus sebelum tanggal selesai";
      }
    }

    // Competencies validation
    if (selectedCompetencies.length === 0) {
      errors.competencies = "Pilih minimal satu kompetensi";
    }

    // Weight validation
    const weightValidation = validateAssessmentWeights(
      formData.self_weight,
      formData.supervisor_weight
    );
    if (!weightValidation.isValid) {
      errors.weights = "Total bobot harus sama dengan 1.0";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Silakan perbaiki kesalahan validasi di bawah ini");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Create assessment
      const assessmentData = {
        ...formData,
        status: ASSESSMENT_STATUS.DRAFT,
        is_active: true,
      };

      const newAssessment = await AssessmentService.create(assessmentData);

      // Add selected competencies to assessment
      if (selectedCompetencies.length > 0) {
        await AssessmentCompetencyService.createMultiple(
          newAssessment.id,
          selectedCompetencies.map((c) => c.id)
        );
      }

      // Navigate to assessment detail page
      navigate(`/penilaian/${newAssessment.id}`);
    } catch (err) {
      console.error("Failed to create assessment:", err);
      setError(err.message || "Gagal membuat assessment");
    } finally {
      setLoading(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate("/penilaian");
  };

  return (
    <div className="page">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <AssessmentCreateHeader />

        {/* Error Alert */}
        {error && (
          <Alert color="failure" className="mb-6">
            <span className="font-medium">Kesalahan!</span> {error}
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
                  // tabpanel: "p-0"
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
            <div>
              <Card className="bg-white dark:bg-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Users className="mr-2 text-blue-600 dark:text-blue-400" />
                  Aksi
                </h2>

                <div className="space-y-3">
                  <Button
                    type="submit"
                    color="blue"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Spinner size="sm" />
                        Membuat...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Buat Penilaian
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    color="gray"
                    onClick={handleBack}
                    disabled={loading}
                    className="w-full"
                  >
                    Batal
                  </Button>
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Catatan:</strong> Penilaian akan dibuat dalam
                    status Draft. Anda dapat menambah peserta dan
                    mempublikasikannya nanti.
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

export default AssessmentCreatePage;
