// Utility functions for assessment-related operations
// These are pure functions that handle common assessment calculations and validations

import { RESPONSE_TYPE, ASSESSMENT_WEIGHTS, RATING_SCALE } from '../constants/assessmentConstants';

/**
 * Determines the response type based on subject and assessor IDs
 * @param {string} subjectProfileId - ID of the person being assessed
 * @param {string} assessorProfileId - ID of the person doing the assessment
 * @returns {string} 'self' if same person, 'supervisor' if different
 */
export const getResponseType = (subjectProfileId, assessorProfileId) => {
  return subjectProfileId === assessorProfileId ? RESPONSE_TYPE.SELF : RESPONSE_TYPE.SUPERVISOR;
};

/**
 * Calculates weighted final score (30% self + 70% supervisor)
 * @param {number} selfScore - Average score from self assessment
 * @param {number} supervisorScore - Average score from supervisor assessment
 * @returns {number} Weighted final score rounded to 2 decimal places
 */
export const calculateWeightedScore = (selfScore, supervisorScore) => {
  if (selfScore === null || selfScore === undefined) selfScore = 0;
  if (supervisorScore === null || supervisorScore === undefined) supervisorScore = 0;
  
  const weighted = (selfScore * ASSESSMENT_WEIGHTS.SELF) + (supervisorScore * ASSESSMENT_WEIGHTS.SUPERVISOR);
  return Math.round(weighted * 100) / 100; // Round to 2 decimal places
};

/**
 * Calculates average score from an array of responses
 * @param {Array} responses - Array of response objects with response_value
 * @returns {number} Average score rounded to 2 decimal places
 */
export const calculateAverageScore = (responses) => {
  if (!responses || responses.length === 0) return 0;
  
  const validResponses = responses.filter(r => r.response_value !== null && r.response_value !== undefined);
  if (validResponses.length === 0) return 0;
  
  const sum = validResponses.reduce((acc, response) => acc + response.response_value, 0);
  const average = sum / validResponses.length;
  return Math.round(average * 100) / 100;
};

/**
 * Groups responses by response type (self vs supervisor)
 * @param {Array} responses - Array of response objects
 * @returns {Object} Object with 'self' and 'supervisor' arrays
 */
export const groupResponsesByType = (responses) => {
  const grouped = {
    self: [],
    supervisor: []
  };
  
  responses.forEach(response => {
    const type = getResponseType(response.subject_profile_id, response.assessor_profile_id);
    grouped[type].push(response);
  });
  
  return grouped;
};

/**
 * Gets rating label and styling based on numeric value
 * @param {number} value - Rating value (1-6)
 * @returns {Object} Object with label, color, bgColor, textColor
 */
export const getRatingDetails = (value) => {
  const rating = RATING_SCALE.find(r => r.value === value);
  return rating || { label: 'Unknown', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
};

/**
 * Calculates assessment completion percentage
 * @param {number} completedIndicators - Number of completed indicators
 * @param {number} totalIndicators - Total number of indicators
 * @returns {number} Completion percentage (0-100)
 */
export const calculateCompletionPercentage = (completedIndicators, totalIndicators) => {
  if (totalIndicators === 0) return 0;
  return Math.round((completedIndicators / totalIndicators) * 100);
};

/**
 * Validates if assessment dates are valid
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {Object} Validation result with isValid and errorMessage
 */
export const validateAssessmentDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();
  
  if (start >= end) {
    return { isValid: false, errorMessage: 'End date must be after start date' };
  }
  
  if (end <= now) {
    return { isValid: false, errorMessage: 'End date must be in the future' };
  }
  
  return { isValid: true, errorMessage: null };
};

/**
 * Formats assessment period for display
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {string} Formatted period string
 */
export const formatAssessmentPeriod = (startDate, endDate) => {
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  return `${start} - ${end}`;
};

/**
 * Checks if current user can assess a specific subject
 * @param {string} currentUserId - Current user's ID
 * @param {string} subjectId - Subject's ID
 * @param {string} supervisorId - Subject's supervisor ID
 * @param {string} userRole - Current user's role
 * @returns {boolean} True if user can assess the subject
 */
export const canUserAssessSubject = (currentUserId, subjectId, supervisorId, userRole) => {
  // Self assessment: user can always assess themselves
  if (currentUserId === subjectId) return true;
  
  // Supervisor assessment: only direct supervisor can assess
  if (currentUserId === supervisorId && userRole === 'ATASAN') return true;
  
  // Admin can assess anyone (if needed)
  if (userRole === 'ADMIN') return true;
  
  return false;
};

/**
 * Filters assessment list based on user role and permissions
 * @param {Array} assessments - List of assessments
 * @param {string} userId - Current user ID
 * @param {string} userRole - Current user role
 * @returns {Array} Filtered assessments the user can access
 */
export const filterAssessmentsByPermission = (assessments, userId, userRole) => {
  if (userRole === 'ADMIN') {
    return assessments; // Admin can see all assessments
  }
  
  // Non-admin users only see assessments they participate in
  return assessments.filter(assessment => 
    assessment.participants?.some(p => 
      p.subject_profile_id === userId || p.assessor_profile_id === userId
    )
  );
};

/**
 * Validates assessment weight values
 * @param {number} selfWeight - Self assessment weight (0-1)
 * @param {number} supervisorWeight - Supervisor assessment weight (0-1)
 * @returns {Object} Validation result with isValid boolean and errorMessage string
 */
export const validateAssessmentWeights = (selfWeight, supervisorWeight) => {
  const self = parseFloat(selfWeight);
  const supervisor = parseFloat(supervisorWeight);
  
  if (isNaN(self) || self < 0 || self > 1) {
    return {
      isValid: false,
      errorMessage: 'Self weight must be between 0 and 1'
    };
  }
  
  if (isNaN(supervisor) || supervisor < 0 || supervisor > 1) {
    return {
      isValid: false,
      errorMessage: 'Supervisor weight must be between 0 and 1'
    };
  }
  
  const total = self + supervisor;
  if (Math.abs(total - 1.0) > 0.001) {
    return {
      isValid: false,
      errorMessage: `Total weight must equal 1.0 (100%). Current total: ${total.toFixed(3)}`
    };
  }
  
  return {
    isValid: true,
    errorMessage: null
  };
};

/**
 * Calculates weighted final score using custom weights
 * @param {number} selfScore - Average score from self assessment
 * @param {number} supervisorScore - Average score from supervisor assessment
 * @param {number} selfWeight - Weight for self assessment (default: 0.3)
 * @param {number} supervisorWeight - Weight for supervisor assessment (default: 0.7)
 * @returns {number} Weighted final score rounded to 2 decimal places
 */
export const calculateCustomWeightedScore = (
  selfScore, 
  supervisorScore, 
  selfWeight = ASSESSMENT_WEIGHTS.SELF, 
  supervisorWeight = ASSESSMENT_WEIGHTS.SUPERVISOR
) => {
  if (selfScore === null || selfScore === undefined) selfScore = 0;
  if (supervisorScore === null || supervisorScore === undefined) supervisorScore = 0;
  
  const weighted = (selfScore * selfWeight) + (supervisorScore * supervisorWeight);
  return Math.round(weighted * 100) / 100; // Round to 2 decimal places
};

/**
 * Formats weight values for display
 * @param {number} weight - Weight value (0-1)
 * @returns {string} Formatted weight as percentage
 */
export const formatWeight = (weight) => {
  return `${((weight || 0) * 100).toFixed(0)}%`;
};
