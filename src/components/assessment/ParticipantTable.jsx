import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  Table,
  Button,
  Badge,
  Dropdown,
  TextInput,
  Select,
  Tooltip,
  Avatar,
  TableHead,
  TableHeadCell,
  DropdownItem,
  DropdownDivider,
  TableCell,
  TableBody,
  TableRow,
  Card,
} from "flowbite-react";
import {
  Search,
  MoreVertical,
  User,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash,
  Mail,
  Calendar,
  Users,
  Target,
  Award,
  FileText,
} from "lucide-react";
import { ASSESSMENT_STATUS } from "../../constants/assessmentConstants";
import AssessmentStatusBadge from "./AssessmentStatusBadge";
import { Link } from 'react-router-dom';
import ProfileService from "../../services/ProfileService";
import AssessmentParticipantService from "../../services/AssessmentParticipantService";

const ParticipantTable = ({
  onView,
  onEdit,
  onDelete,
  onSendReminder,
  loading: externalLoading = false,
  canEdit = true,
  canDelete = true,
  showAssessmentInfo = true,
  assessmentId,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortField, setSortField] = useState("subject_name");
  const [sortDirection, setSortDirection] = useState("asc");
  
  // Internal state for participants
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all active profiles and their assessment status
  useEffect(() => {
    const loadParticipants = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all active profiles (bawahan)
        const allProfiles = await ProfileService.getAll({ 
          position_type: 'BAWAHAN', 
          is_active: true 
        });

        // Get assessment participation status for each profile
        const participantsWithStatus = await Promise.all(
          allProfiles.map(async (profile) => {
            try {
              // Check self assessment status
              const selfStatusResult = await AssessmentParticipantService.getAssessmentStatus(
                assessmentId, 
                profile.id, 
                profile.id
              );
              const selfStatus = selfStatusResult?.status || null;

              // Check supervisor assessment status  
              const supervisorStatusResult = profile.supervisor_id 
                ? await AssessmentParticipantService.getAssessmentStatus(
                    assessmentId, 
                    profile.id, 
                    profile.supervisor_id
                  )
                : null;
              const supervisorStatus = supervisorStatusResult?.status || null;

              return {
                id: profile.id,
                subject_profile_id: profile.id,
                subject_name: profile.name,
                subject_email: profile.email,
                subject_avatar: profile.avatar,
                subject_nrp: profile.nrp,
                subject_position: profile.position,
                supervisor_id: profile.supervisor_id,
                supervisor_name: profile.supervisor?.name || null,
                supervisor_email: profile.supervisor?.email || null,
                supervisor_avatar: profile.supervisor?.avatar || null,
                subdirectorate_name: profile.subdirectorats?.name || null,
                self_assessment: selfStatus ? {
                  status: selfStatus,
                  response_submitted: selfStatus === 'submitted'
                } : null,
                supervisor_assessment: supervisorStatus ? {
                  status: supervisorStatus, 
                  response_submitted: supervisorStatus === 'submitted'
                } : null,
                overall_status: getOverallStatus(selfStatus, supervisorStatus)
              };
            } catch (err) {
              return {
                id: profile.id,
                subject_profile_id: profile.id,
                subject_name: profile.name,
                subject_email: profile.email,
                subject_avatar: profile.avatar,
                subject_nrp: profile.nrp,
                subject_position: profile.position,
                supervisor_id: profile.supervisor_id,
                supervisor_name: profile.supervisor?.name || null,
                supervisor_email: profile.supervisor?.email || null,
                supervisor_avatar: profile.supervisor?.avatar || null,
                subdirectorate_name: profile.subdirectorats?.name || null,
                self_assessment: null,
                supervisor_assessment: null,
                overall_status: 'not_started'
              };
            }
          })
        );

        setParticipants(participantsWithStatus);
      } catch (err) {
        console.error("Failed to load participants:", err);
        setError(err.message || "Failed to load participants");
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId) {
      loadParticipants();
    }
  }, [assessmentId, onRefresh]);

  // Get overall status for a participant
  const getOverallStatus = (selfStatus, supervisorStatus) => {
    if (!selfStatus && !supervisorStatus) return 'not_started';

    const selfCompleted = selfStatus === 'submitted';
    const supervisorCompleted = supervisorStatus === 'submitted';
    const selfDraft = selfStatus === 'draft';
    const supervisorDraft = supervisorStatus === 'draft';

    if (selfCompleted && supervisorCompleted) {
      return 'completed';
    } else if (selfDraft || supervisorDraft || selfCompleted || supervisorCompleted) {
      return 'in_progress';
    } else {
      return 'not_started';
    }
  };

  // Participant status mapping
  const getParticipantStatus = useCallback((participant) => {
    return participant.overall_status;
  }, []);

  // Status badge configuration
  const getStatusBadge = (status) => {
    const statusConfig = {
      not_started: {
        color: "gray",
        icon: Clock,
        label: "Belum Mulai",
      },
      in_progress: {
        color: "yellow",
        icon: User,
        label: "Sedang Berjalan",
      },
      completed: {
        color: "green",
        icon: CheckCircle,
        label: "Selesai",
      },
    };

    const config = statusConfig[status] || statusConfig.not_started;
    const IconComponent = config.icon;

    return (
      <Badge color={config.color} className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  // Filter and sort participants
  const filteredAndSortedParticipants = useMemo(() => {
    let filtered = participants.filter((participant) => {
      const matchesSearch =
        participant.subject_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        participant.subject_email
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        participant.subject_nrp
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        participant.supervisor_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());

      const participantStatus = getParticipantStatus(participant);
      const matchesStatus =
        statusFilter === "all" || participantStatus === statusFilter;

      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "with_self" && participant.self_assessment?.response_submitted) ||
        (typeFilter === "with_supervisor" && participant.supervisor_assessment?.response_submitted) ||
        (typeFilter === "no_response" &&
          !participant.self_assessment?.response_submitted &&
          !participant.supervisor_assessment?.response_submitted);

      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort participants
    filtered.sort((a, b) => {
      let aValue = a[sortField] || "";
      let bValue = b[sortField] || "";

      if (sortField === "status") {
        aValue = getParticipantStatus(a);
        bValue = getParticipantStatus(b);
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [
    participants,
    searchTerm,
    statusFilter,
    typeFilter,
    sortField,
    sortDirection,
    getParticipantStatus,
  ]);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  // Calculate completion percentage
  const getCompletionPercentage = (participant) => {
    let completed = 0;
    if (participant.self_assessment?.response_submitted) completed += 1;
    if (participant.supervisor_assessment?.response_submitted) completed += 1;
    return (completed / 2) * 100;
  };

  // Get assessment status badge
  const getAssessmentStatusBadge = (assessment, type) => {
    if (!assessment) {
      return (
        <Badge color="gray" size="sm" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Belum Ada
        </Badge>
      );
    }

    if (assessment.response_submitted) {
      return (
        <div className="space-y-1">
          <Badge color="green" size="sm" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Selesai
          </Badge>
        </div>
      );
    } else if (assessment.status === 'draft') {
      return (
        <Badge color="yellow" size="sm" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Draft
        </Badge>
      );
    } else {
      return (
        <Badge color="gray" size="sm" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Belum Mulai
        </Badge>
      );
    }
  };

  // Handle loading state
  if (loading || externalLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 bg-gray-200 dark:bg-gray-700 rounded"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 dark:text-red-400 mb-2">{error}</div>
        <Button size="sm" onClick={() => window.location.reload()}>
          Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Statistik */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-center">
            <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Total Peserta</p>
              <p className="text-lg font-semibold text-blue-900 dark:text-blue-300">
                {participants.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">
                Selesai
              </p>
              <p className="text-lg font-semibold text-green-900 dark:text-green-300">
                {
                  participants.filter(
                    (p) => getParticipantStatus(p) === "completed"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
          <div className="flex items-center">
            <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Sedang Berjalan
              </p>
              <p className="text-lg font-semibold text-yellow-900 dark:text-yellow-300">
                {
                  participants.filter(
                    (p) => getParticipantStatus(p) === "in_progress"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <div className="flex items-center">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <div>
              <p className="text-sm text-red-600 dark:text-red-400">
                Belum Mulai
              </p>
              <p className="text-lg font-semibold text-red-900 dark:text-red-300">
                {
                  participants.filter(
                    (p) => getParticipantStatus(p) === "not_started"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
        <div className="flex-1">
          <TextInput
            icon={Search}
            placeholder="Cari peserta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Semua Status</option>
            <option value="not_started">Belum Mulai</option>
            <option value="in_progress">Sedang Berjalan</option>
            <option value="completed">Selesai</option>
          </Select>

          <Select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Semua Tipe</option>
            <option value="with_self">Dengan Penilaian Diri</option>
            <option value="with_supervisor">Dengan Penilaian Atasan</option>
            <option value="no_response">Belum Ada Respon</option>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <Table hoverable>
          <TableHead>
            {/* Nama Peserta */}
            <TableHeadCell
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => handleSort("subject_name")}
            >
              <div className="flex items-center">
                Nama Peserta {getSortIcon("subject_name")}
              </div>
            </TableHeadCell>

            {/* NRP */}
            <TableHeadCell>NRP</TableHeadCell>

            {/* Supervisor */}
            <TableHeadCell
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => handleSort("supervisor_name")}
            >
              <div className="flex items-center">
                Atasan {getSortIcon("supervisor_name")}
              </div>
            </TableHeadCell>

            {/* Status */}
            <TableHeadCell
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center">
                Status {getSortIcon("status")}
              </div>
            </TableHeadCell>

            {/* Self Assessment */}
            <TableHeadCell>Penilaian Diri</TableHeadCell>

            {/* Supervisor Assessment */}
            <TableHeadCell>Penilaian Atasan</TableHeadCell>

            {/* Progress */}
            <TableHeadCell>Progress</TableHeadCell>

            {/* Actions */}
            <TableHeadCell>
              <span className="sr-only">Actions</span>
            </TableHeadCell>
          </TableHead>

          <TableBody className="divide-y">
            {filteredAndSortedParticipants.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8"
                >
                  <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                    <Users className="w-8 h-8 mb-2 opacity-50" />
                    <p>Tidak ada peserta ditemukan</p>
                    {searchTerm && (
                      <p className="text-sm">
                        Coba ubah kriteria pencarian Anda
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedParticipants.map((participant) => (
                <TableRow
                  key={participant.id}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  {/* Nama Peserta */}
                  <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <Avatar
                        img={participant.subject_avatar}
                        alt={participant.subject_name}
                        size="sm"
                        className="mr-3"
                      />
                      <div>
                        <div className="font-medium">
                          {participant.subject_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {participant.subject_email}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* NRP */}
                  <TableCell>
                    {participant.subject_nrp || '-'}
                  </TableCell>

                  {/* Supervisor Info */}
                  <TableCell>
                    {participant.supervisor_name ? (
                      <div className="flex items-center">
                        <Avatar
                          img={participant.supervisor_avatar}
                          alt={participant.supervisor_name}
                          size="sm"
                          className="mr-3"
                        />
                        <div>
                          <div className="font-medium">
                            {participant.supervisor_name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {participant.supervisor_email}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm italic">
                        Belum ditentukan
                      </span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    {getStatusBadge(getParticipantStatus(participant))}
                  </TableCell>

                  {/* Self Assessment */}
                  <TableCell>
                    {getAssessmentStatusBadge(participant.self_assessment, 'self')}
                  </TableCell>

                  {/* Supervisor Assessment */}
                  <TableCell>
                    {getAssessmentStatusBadge(participant.supervisor_assessment, 'supervisor')}
                  </TableCell>

                  {/* Progress */}
                  <TableCell>
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {getCompletionPercentage(participant)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${getCompletionPercentage(participant)}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* Hapus tombol "Nilai" untuk admin, hanya tampilkan tombol "Lihat" */}
                      <Link to={`/penilaian/${assessmentId}/hasil?subject=${participant.id}`}>
                        <Button size="xs" color="blue" className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          Lihat Hasil
                        </Button>
                      </Link>
                      
                      {/* Opsional: Tambah tombol lihat detail profil */}
                      <Link to={`/profil/${participant.id}`}>
                        <Button size="xs" color="gray" className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Profil
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results Summary */}
      {filteredAndSortedParticipants.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Menampilkan {filteredAndSortedParticipants.length} dari {participants.length} peserta
        </div>
      )}
    </div>
  );
};

export default ParticipantTable;