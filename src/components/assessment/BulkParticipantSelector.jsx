import React, { useState, useEffect } from 'react';
import { Modal, Button, Label, TextInput, Checkbox, Alert, Spinner, Select, Badge, ModalHeader, ModalBody, ModalFooter } from 'flowbite-react';
import { Users, Search, AlertCircle, UserPlus, Filter } from 'lucide-react';
import ProfileService from '../../services/ProfileService';
import AssessmentParticipantService from '../../services/AssessmentParticipantService';

export const BulkParticipantSelector = ({ 
  assessmentId, 
  existingParticipants = [], 
  onClose, 
  onSave 
}) => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState(new Map());
  const [positionFilter, setPositionFilter] = useState('all');
  const [subdirectorateFilter, setSubdirectorateFilter] = useState('all');
  const [addBothTypes, setAddBothTypes] = useState(true);

  // Load profiles when modal opens
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load all active profiles
        const allProfiles = await ProfileService.getAll({ position_type: 'BAWAHAN', is_active: true });
        
        // Exclude users who are already participants
        const existingSubjectIds = new Set(existingParticipants.map(p => p.subject_profile_id));
        const availableProfiles = allProfiles.filter(profile => !existingSubjectIds.has(profile.id));
        
        setProfiles(availableProfiles);

      } catch (err) {
        console.error('Error loading profiles:', err);
        setError('Gagal memuat profil. Silakan coba lagi.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [existingParticipants]);

  const handleUserSelection = (userId, selected) => {
    const newSelected = new Map(selectedUsers);
    if (selected) {
      const user = profiles.find(p => p.id === userId);
      newSelected.set(userId, {
        id: userId,
        name: user.name,
        nrp: user.nrp,
        position: user.position,
        supervisor_id: user.supervisor_id,
        types: addBothTypes ? ['self', 'supervisor'] : ['self']
      });
    } else {
      newSelected.delete(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleSelectAll = (selected) => {
    if (selected) {
      const newSelected = new Map();
      filteredProfiles.forEach(user => {
        newSelected.set(user.id, {
          id: user.id,
          name: user.name,
          nrp: user.nrp,
          position: user.position,
          supervisor_id: user.supervisor_id,
          types: addBothTypes ? ['self', 'supervisor'] : ['self']
        });
      });
      setSelectedUsers(newSelected);
    } else {
      setSelectedUsers(new Map());
    }
  };

  const handleTypeToggle = (userId, type) => {
    const newSelected = new Map(selectedUsers);
    const user = newSelected.get(userId);
    if (user) {
      const newTypes = user.types.includes(type)
        ? user.types.filter(t => t !== type)
        : [...user.types, type];
      
      if (newTypes.length === 0) {
        newSelected.delete(userId);
      } else {
        newSelected.set(userId, { ...user, types: newTypes });
      }
      setSelectedUsers(newSelected);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = searchTerm === '' || 
      profile.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.nrp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.position?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPosition = positionFilter === 'all' || 
      profile.position_type === positionFilter;

    const matchesSubdirectorate = subdirectorateFilter === 'all' || 
      profile.subdirectorat_id?.toString() === subdirectorateFilter;

    return matchesSearch && matchesPosition && matchesSubdirectorate;
  });

  const handleSubmit = async () => {
    if (selectedUsers.size === 0) {
      setError('Silakan pilih setidaknya satu pengguna.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Convert selected users to participant entries
      const participantsToCreate = [];
      
      selectedUsers.forEach(user => {
        user.types.forEach(type => {
          participantsToCreate.push({
            assessment_id: assessmentId,
            subject_profile_id: user.id,
            assessor_profile_id: type === 'self' ? user.id : user.supervisor_id
          });
        });
      });

      // Filter out entries where supervisor_id is null for supervisor assessments
      const validParticipants = participantsToCreate.filter(p => 
        p.subject_profile_id === p.assessor_profile_id || p.assessor_profile_id
      );

      if (validParticipants.length === 0) {
        setError('Tidak ada peserta valid yang dapat dibuat. Silakan periksa penugasan atasan.');
        return;
      }

      await onSave(validParticipants);
      
    } catch (err) {
      console.error('Error saving participants:', err);
      setError(err.message || 'Gagal menambahkan peserta. Silakan coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  const getSelectionSummary = () => {
    let selfCount = 0;
    let supervisorCount = 0;
    
    selectedUsers.forEach(user => {
      if (user.types.includes('self')) selfCount++;
      if (user.types.includes('supervisor')) supervisorCount++;
    });

    return { selfCount, supervisorCount, totalUsers: selectedUsers.size };
  };

  const summary = getSelectionSummary();

  return (
    <Modal show onClose={onClose} size="4xl">
      <ModalHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" />
          Tambah Beberapa Peserta
        </div>
      </ModalHeader>

      <ModalBody>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="lg" />
            <span className="ml-2">Memuat pengguna...</span>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Error Alert */}
            {error && (
              <Alert color="failure" icon={AlertCircle}>
                {error}
              </Alert>
            )}

            {/* Options */}
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center gap-4">
                <Checkbox
                  id="addBothTypes"
                  checked={addBothTypes}
                  onChange={(e) => setAddBothTypes(e.target.checked)}
                />
                <Label htmlFor="addBothTypes">
                  Tambahkan penilaian diri dan atasan untuk pengguna yang dipilih
                </Label>
              </div>
              <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Jika diaktifkan, setiap pengguna yang dipilih akan memiliki entri penilaian diri dan penilaian atasan.
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label htmlFor="search" value="Cari" className="mb-2 block" />
                <TextInput
                  id="search"
                  icon={Search}
                  placeholder="Cari berdasarkan nama, NRP, atau posisi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* <div>
                <Label htmlFor="position" value="Position Type" className="mb-2 block" />
                <Select
                  id="position"
                  value={positionFilter}
                  onChange={(e) => setPositionFilter(e.target.value)}
                >
                  <option value="all">All Positions</option>
                  <option value="ATASAN">Atasan</option>
                  <option value="BAWAHAN">Bawahan</option>
                  <option value="ADMIN">Admin</option>
                </Select>
              </div> */}

              <div>
                <Label htmlFor="subdirectorate" value="Subdirektorat" className="mb-2 block" />
                <Select
                  id="subdirectorate"
                  value={subdirectorateFilter}
                  onChange={(e) => setSubdirectorateFilter(e.target.value)}
                >
                  <option value="all">Semua Subdirektorat</option>
                  {/* This would need to be populated from actual subdirectorate data */}
                </Select>
              </div>
            </div>

            {/* Selection Summary */}
            {selectedUsers.size > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    Dipilih: {summary.totalUsers} pengguna
                  </span>
                  <Badge color="blue">{summary.selfCount} Penilaian Diri</Badge>
                  <Badge color="green">{summary.supervisorCount} Penilaian Atasan</Badge>
                </div>
              </div>
            )}

            {/* User List */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label value="Pilih Pengguna" className="text-base font-medium" />
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedUsers.size === filteredProfiles.length && filteredProfiles.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                  <span className="text-sm text-gray-600">Pilih Semua ({filteredProfiles.length})</span>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                {filteredProfiles.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
                  >
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={selectedUsers.has(user.id)}
                        onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                      />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.nrp} • {user.position} • {user.position_type}
                        </div>
                      </div>
                    </div>

                    {selectedUsers.has(user.id) && (
                      <div className="flex gap-2">
                        <Button
                          size="xs"
                          color={selectedUsers.get(user.id)?.types.includes('self') ? 'blue' : 'gray'}
                          onClick={() => handleTypeToggle(user.id, 'self')}
                        >
                          Diri
                        </Button>
                        <Button
                          size="xs"
                          color={selectedUsers.get(user.id)?.types.includes('supervisor') ? 'green' : 'gray'}
                          onClick={() => handleTypeToggle(user.id, 'supervisor')}
                          disabled={!user.supervisor_id}
                        >
                          Atasan
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                {filteredProfiles.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      Pengguna tidak ditemukan
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Coba sesuaikan kriteria pencarian atau filter Anda.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </ModalBody>

      <ModalFooter>
        <div className="flex justify-between items-center w-full">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {summary.totalUsers > 0 && (
              <span>
                Akan membuat {summary.selfCount + summary.supervisorCount} entri peserta
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button color="gray" onClick={onClose}>
              Batal
            </Button>
            <Button 
              color="blue" 
              onClick={handleSubmit}
              disabled={saving || selectedUsers.size === 0}
            >
              {saving ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Menambahkan...
                </>
              ) : (
                `Tambah ${summary.totalUsers} Peserta`
              )}
            </Button>
          </div>
        </div>
      </ModalFooter>
    </Modal>
  );
};

export default BulkParticipantSelector;