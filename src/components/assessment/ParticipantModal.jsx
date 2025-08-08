import React, { useState, useEffect } from 'react';
import { Modal, Button, Label, Select, Alert, Spinner, TextInput, ModalFooter, ModalBody, ModalHeader } from 'flowbite-react';
import { User, Users, Search, AlertCircle } from 'lucide-react';
import ProfileService from '../../services/ProfileService';

export const ParticipantModal = ({ 
  participant = null, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    subject_profile_id: '',
    assessor_profile_id: ''
  });
  const [type, setType] = useState('self');
  const [profiles, setProfiles] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Load profiles when modal opens
  useEffect(() => {
    loadProfiles();
  }, []);

  // Set form data if editing existing participant
  useEffect(() => {
    if (participant) {
      setFormData({
        subject_profile_id: participant.subject_profile_id || '',
        assessor_profile_id: participant.assessor_profile_id || '',
        // type: participant.subject_profile_id === participant.assessor_profile_id ? 'self' : 'supervisor'
      });
    }
  }, [participant]);

  // Update assessor when type or subject changes
  useEffect(() => {
    if (type === 'self' && formData.subject_profile_id) {
      setFormData(prev => ({
        ...prev,
        assessor_profile_id: prev.subject_profile_id
      }));
    }
  }, [type, formData.subject_profile_id]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all active profiles
      const allProfiles = await ProfileService.getAll({ is_active: true });
      setProfiles(allProfiles);

      // Load supervisors (profiles with position_type ATASAN)
      const supervisorProfiles = allProfiles.filter(profile => 
        profile.position_type === 'ATASAN'
      );
      setSupervisors(supervisorProfiles);

    } catch (err) {
      console.error('Error loading profiles:', err);
      setError('Failed to load profiles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.subject_profile_id) {
      setError('Please select a subject.');
      return;
    }

    if (!formData.assessor_profile_id) {
      setError('Please select an assessor.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await onSave(formData);
      
    } catch (err) {
      console.error('Error saving participant:', err);
      setError(err.message || 'Failed to save participant. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleTypeChange = (type) => {
    setType(type);
    setFormData(prev => ({
      ...prev,
      type,
      assessor_profile_id: type === 'self' ? prev.subject_profile_id : ''
    }));
  };

  const filteredProfiles = profiles.filter(profile =>
    profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.nrp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.position?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAvailableAssessors = () => {
    if (type === 'self') {
      return profiles.filter(p => p.id === formData.subject_profile_id);
    }
    
    // For supervisor assessment, show supervisors
    // Optionally filter by organization hierarchy
    return supervisors;
  };

  return (
    <Modal show onClose={onClose} size="xl">
      <ModalHeader>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          {participant ? 'Edit Participant' : 'Add Participant'}
        </div>
      </ModalHeader>

      <ModalBody>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="lg" />
            <span className="ml-2">Loading profiles...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Alert */}
            {error && (
              <Alert color="failure" icon={AlertCircle}>
                {error}
              </Alert>
            )}

            {/* Assessment Type */}
            <div>
              <Label htmlFor="type" className="mb-2 block">Assessment Type</Label>
              <Select
                id="type"
                value={type}
                onChange={(e) => handleTypeChange(e.target.value)}
                required
              >
                <option value="self">Self Assessment</option>
                <option value="supervisor">Supervisor Assessment</option>
              </Select>
              <div className="mt-1 text-sm text-gray-500">
                {type === 'self' 
                  ? 'Employee will assess themselves (30% weight)' 
                  : 'Supervisor will assess the employee (70% weight)'
                }
              </div>
            </div>

            {/* Subject Selection */}
            <div>
              <Label htmlFor="subject" className="mb-2 block">Subject (Person being assessed)</Label>
              
              {/* Search */}
              <div className="mb-3">
                <TextInput
                  icon={Search}
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <Select
                id="subject"
                value={formData.subject_profile_id}
                onChange={(e) => setFormData(prev => ({ ...prev, subject_profile_id: e.target.value }))}
                required
              >
                <option value="">Select an employee...</option>
                {filteredProfiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name} ({profile.nrp}) - {profile.position}
                  </option>
                ))}
              </Select>
            </div>

            {/* Assessor Selection */}
            <div>
              <Label htmlFor="assessor" className="mb-2 block">Assessor (Person who will assess)</Label>

              <Select
                id="assessor"
                value={formData.assessor_profile_id}
                onChange={(e) => setFormData(prev => ({ ...prev, assessor_profile_id: e.target.value }))}
                required
                disabled={type === 'self'}
              >
                <option value="">
                  {type === 'self' ? 'Same as subject (self-assessment)' : 'Select a supervisor...'}
                </option>
                {getAvailableAssessors().map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name} ({profile.nrp}) - {profile.position}
                  </option>
                ))}
              </Select>

              {type === 'self' && (
                <div className="mt-1 text-sm text-gray-500">
                  For self-assessment, the subject and assessor are the same person.
                </div>
              )}
            </div>

            {/* Preview */}
            {formData.subject_profile_id && formData.assessor_profile_id && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Preview:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">Subject:</span>
                    <span>{profiles.find(p => p.id === formData.subject_profile_id)?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-green-600" />
                    <span className="font-medium">Assessor:</span>
                    <span>{profiles.find(p => p.id === formData.assessor_profile_id)?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Type:</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      type === 'self' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {type === 'self' ? 'Self Assessment (30%)' : 'Supervisor Assessment (70%)'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </form>
        )}
      </ModalBody>

      <ModalFooter>
        <div className="flex justify-end gap-2 w-full">
          <Button color="gray" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            color="blue" 
            onClick={handleSubmit}
            disabled={saving || loading}
          >
            {saving ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              participant ? 'Update Participant' : 'Add Participant'
            )}
          </Button>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default ParticipantModal;