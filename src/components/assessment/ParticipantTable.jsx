// Participant Table Component - Display and manage assessment participants
// Features: dual participants (self + supervisor), status tracking, actions

import React, { useState, useMemo, useCallback } from "react";
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

const ParticipantTable = ({
  participants = [],
  onView,
  onEdit,
  onDelete,
  onSendReminder,
  loading = false,
  canEdit = true,
  canDelete = true,
  showAssessmentInfo = true,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortField, setSortField] = useState("subject_name");
  const [sortDirection, setSortDirection] = useState("asc");

  // Group participants by subject (combine self and supervisor assessments)
  const groupedParticipants = useMemo(() => {
    const grouped = {};
    
    participants.forEach(participant => {
      const subjectId = participant.subject_profile_id;
      
      if (!grouped[subjectId]) {
        grouped[subjectId] = {
          id: subjectId,
          subject_name: participant.subject_name,
          subject_email: participant.subject_email,
          subject_avatar: participant.subject_avatar,
          assessment_id: participant.assessment_id,
          assessment_title: participant.assessment_title,
          assessment_status: participant.assessment_status,
          assessment_due_date: participant.assessment_due_date,
          self_assessment: null,
          supervisor_assessment: null,
          supervisor_name: null,
          supervisor_email: null,
          supervisor_avatar: null
        };
      }
      
      // Check if this is self or supervisor assessment
      if (participant.subject_profile_id === participant.assessor_profile_id) {
        // Self assessment
        grouped[subjectId].self_assessment = {
          id: participant.id,
          status: participant.status,
          response_submitted: participant.response_submitted,
          submission_date: participant.submission_date,
          completion_percentage: participant.completion_percentage
        };
      } else {
        // Supervisor assessment
        grouped[subjectId].supervisor_assessment = {
          id: participant.id,
          status: participant.status,
          response_submitted: participant.response_submitted,
          submission_date: participant.submission_date,
          completion_percentage: participant.completion_percentage
        };
        grouped[subjectId].supervisor_name = participant.assessor_name;
        grouped[subjectId].supervisor_email = participant.assessor_email;
        grouped[subjectId].supervisor_avatar = participant.assessor_avatar;
      }
    });
    
    return Object.values(grouped);
  }, [participants]);

  // Participant status mapping for grouped data
  const getParticipantStatus = useCallback((groupedParticipant) => {
    const selfCompleted = groupedParticipant.self_assessment?.response_submitted || false;
    const supervisorCompleted = groupedParticipant.supervisor_assessment?.response_submitted || false;
    
    if (!selfCompleted && !supervisorCompleted) {
      return "not_started";
    } else if (selfCompleted && supervisorCompleted) {
      return "completed";
    } else {
      return "in_progress";
    }
  }, []);

  // Status badge configuration
  const getStatusBadge = (status) => {
    const statusConfig = {
      not_started: {
        color: "gray",
        icon: Clock,
        label: "Not Started",
      },
      in_progress: {
        color: "yellow",
        icon: User,
        label: "In Progress",
      },
      completed: {
        color: "green",
        icon: CheckCircle,
        label: "Completed",
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
    let filtered = groupedParticipants.filter((participant) => {
      const matchesSearch =
        participant.subject_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        participant.subject_email
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
    groupedParticipants,
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

  // Calculate completion percentage for grouped data
  const getCompletionPercentage = (groupedParticipant) => {
    let completed = 0;
    if (groupedParticipant.self_assessment?.response_submitted) completed += 1;
    if (groupedParticipant.supervisor_assessment?.response_submitted) completed += 1;
    return (completed / 2) * 100;
  };

  // Get assessment status badge
  const getAssessmentStatusBadge = (status, submissionDate) => {
    if (status === "completed") {
      return (
        <div className="space-y-1">
          <Badge color="green" size="sm" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Selesai
          </Badge>
          {submissionDate && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(submissionDate).toLocaleDateString('id-ID')}
            </div>
          )}
        </div>
      );
    } else if (status === "in_progress") {
      return (
        <Badge color="yellow" size="sm" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Sedang Berjalan
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

  if (loading) {
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
                {groupedParticipants.length}
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
                  groupedParticipants.filter(
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
                  groupedParticipants.filter(
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
                  groupedParticipants.filter(
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

            {/* Supervisor */}
            <TableHeadCell
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => handleSort("supervisor_name")}
            >
              <div className="flex items-center">
                Supervisor {getSortIcon("supervisor_name")}
              </div>
            </TableHeadCell>
            
            {/* Assessment Info */}
            {showAssessmentInfo && (
              <TableHeadCell>Info Penilaian</TableHeadCell>
            )}

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
                  colSpan={showAssessmentInfo ? 8 : 7}
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

                  {/* Assessment Info */}
                  {showAssessmentInfo && (
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm font-medium">
                          {participant.assessment_title}
                        </div>
                        <AssessmentStatusBadge
                          status={participant.assessment_status}
                        />
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(
                            participant.assessment_due_date
                          ).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </TableCell>
                  )}

                  {/* Status */}
                  <TableCell>
                    {getStatusBadge(getParticipantStatus(participant))}
                  </TableCell>

                  {/* Self Assessment */}
                  <TableCell>
                    {participant.self_assessment ? (
                      getAssessmentStatusBadge(
                        participant.self_assessment.response_submitted ? "completed" : "not_started",
                        participant.self_assessment.submission_date
                      )
                    ) : (
                      <Badge color="gray" size="sm" className="flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Tidak Ada
                      </Badge>
                    )}
                  </TableCell>

                  {/* Supervisor Assessment */}
                  <TableCell>
                    {participant.supervisor_assessment ? (
                      getAssessmentStatusBadge(
                        participant.supervisor_assessment.response_submitted ? "completed" : "not_started",
                        participant.supervisor_assessment.submission_date
                      )
                    ) : (
                      <Badge color="gray" size="sm" className="flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Tidak Ada
                      </Badge>
                    )}
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
                    <Dropdown
                      arrowIcon={false}
                      inline
                      label={
                        <Button color="gray" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      }
                    >
                      <DropdownItem
                        icon={Eye}
                        onClick={() => onView?.(participant)}
                      >
                        View Details
                      </DropdownItem>

                      {canEdit && (
                        <DropdownItem
                          icon={Edit}
                          onClick={() => onEdit?.(participant)}
                        >
                          Edit Participant
                        </DropdownItem>
                      )}

                      <DropdownItem
                        icon={Mail}
                        onClick={() => onSendReminder?.(participant)}
                      >
                        Send Reminder
                      </DropdownItem>

                      <DropdownDivider />

                      {canDelete && (
                        <DropdownItem
                          icon={Trash}
                          onClick={() => onDelete?.(participant)}
                          className="text-red-600 dark:text-red-400"
                        >
                          Remove Participant
                        </DropdownItem>
                      )}
                    </Dropdown>
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
          Menampilkan {filteredAndSortedParticipants.length} dari {groupedParticipants.length} peserta
        </div>
      )}
    </div>
  );
};

export default ParticipantTable;
