// Assessment-related constants for the application
// This file contains all static values used across assessment features

// Assessment workflow status options
export const ASSESSMENT_STATUS = {
  DRAFT: 'draft',           // Assessment masih dalam tahap pembuatan
  IN_PROGRESS: 'in_progress', // Assessment aktif dan bisa diisi
  DONE: 'done'              // Assessment sudah selesai
};

// User position type
export const USER_POSITION = {
  ADMIN: 'ADMIN',
  ATASAN: 'ATASAN',
  BAWAHAN: 'BAWAHAN',
  TOP_MANAGEMENT: 'TOP_MANAGEMENT'
};

// Response type untuk membedakan self vs supervisor assessment
export const RESPONSE_TYPE = {
  SELF: 'self',             // Self assessment (subject_id = assessor_id)
  SUPERVISOR: 'supervisor'   // Supervisor assessment (subject_id ≠ assessor_id)
};

// 6-point Likert scale untuk rating indikator
export const RATING_SCALE = [
  { value: 1, label: 'Sangat Tidak Setuju', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-800' },
  { value: 2, label: 'Tidak Setuju', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-800' },
  { value: 3, label: 'Kurang Setuju', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-800' },
  { value: 4, label: 'Cukup Setuju', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-800' },
  { value: 5, label: 'Setuju', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-800' },
  { value: 6, label: 'Sangat Setuju', color: 'emerald', bgColor: 'bg-emerald-100', textColor: 'text-emerald-800' }
];


  // Rating scale options
  export const RATING_TYPE = [
    {
      value: "likert_5",
      label: "Skala Likert 5 Poin",
      description: "1 = Sangat Tidak Setuju, 2 = Tidak Setuju, 3 = Cukup Setuju, 4 = Setuju, 5 = Sangat Setuju",
    },
    {
      value: "likert_6",
      label: "Skala Likert 6 Poin",
      description: "1 = Sangat Tidak Setuju, 2 = Tidak Setuju, 3 = Kurang Setuju, 4 = Cukup Setuju, 5 = Setuju, 6 = Sangat Setuju",
    },
    {
      value: "percentage",
      label: "Skala Persentase",
      description: "0% - 100%",
    },
    {
      value: "numeric_10",
      label: "Skala Numerik 10 Poin",
      description: "1 - 10",
    },
    {
      value: "competency_level",
      label: "Level Kompetensi",
      description: "1 = Novice, 2 = Advanced Beginner, 3 = Competent, 4 = Proficient, 5 = Expert",
    },
  ];


// Bobot untuk perhitungan skor akhir
export const ASSESSMENT_WEIGHTS = {
  SELF: 0.3,      // Self assessment: 30%
  SUPERVISOR: 0.7  // Supervisor assessment: 70%
};

// User roles untuk permission control
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  ATASAN: 'ATASAN',
  BAWAHAN: 'BAWAHAN'
};

// Status badge styling berdasarkan assessment status
export const STATUS_STYLES = {
  [ASSESSMENT_STATUS.DRAFT]: {
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    label: 'Draft'
  },
  [ASSESSMENT_STATUS.IN_PROGRESS]: {
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-800',
    label: 'In Progress'
  },
  [ASSESSMENT_STATUS.DONE]: {
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    label: 'Done'
  }
};

// Default pagination settings
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50]
};
