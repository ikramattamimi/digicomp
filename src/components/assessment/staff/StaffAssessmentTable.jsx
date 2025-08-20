// Staff Assessment Table Component - Displays assessments for staff users
// Shows only assessments where they are participants with simplified view

import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Button,
  Badge,
  Spinner,
  Card,
} from "flowbite-react";
import {
  Calendar,
  Eye,
  Play,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  Filter,
  Search,
} from "lucide-react";
import AssessmentStatusBadge from "../AssessmentStatusBadge.jsx";
import { formatAssessmentPeriod } from "../../../utils/assessmentUtils";
import {
  ASSESSMENT_STATUS,
  USER_POSITION,
} from "../../../constants/assessmentConstants";
import { useUserContext } from "../../../contexts/UserContext.js";

const StaffAssessmentTable = ({ assessments, loading }) => {
  const [sortField, setSortField] = useState("start_date");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const user = useUserContext();

  // Handle screen size changes
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter assessments based on search
  const filteredAssessments = assessments.filter(assessment =>
    assessment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (assessment.description && assessment.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Sort assessments
  const sortedAssessments = [...filteredAssessments].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle date fields
    if (sortField.includes("date")) {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    // Handle string fields
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

  // Get assessment period status
  const getAssessmentPeriodStatus = (assessment) => {
    if (!assessment) return null;

    const now = new Date();
    const startDate = new Date(assessment.start_date);
    const endDate = new Date(assessment.end_date);

    if (now < startDate) {
      return { status: "upcoming", label: "Akan Dimulai", color: "warning" };
    } else if (now > endDate) {
      return { status: "ended", label: "Berakhir", color: "failure" };
    } else {
      return { status: "active", label: "Berlangsung", color: "success" };
    }
  };

  // Check if user can fill assessment
  const canFillAssessment = (assessment) => {
    if (!assessment) return false;

    const isActive = assessment.status === ASSESSMENT_STATUS.IN_PROGRESS;
    const now = new Date();
    const startDate = new Date(assessment.start_date);
    const endDate = new Date(assessment.end_date);
    const isInPeriod = now >= startDate && now <= endDate;

    // filter assessments participant bagi user saat ini
    const userParticipation = assessment?.assessment_participants.find(
      (participant) => participant.assessor_profile_id === user.id
    );

    const isSubmitted = userParticipation?.status === "submitted";

    return (
      isActive &&
      isInPeriod &&
      !isSubmitted &&
      user.position_type === USER_POSITION.BAWAHAN
    );
  };

  // Get participation status
  const getParticipationStatus = (assessment) => {
    // filter assessments participant bagi user saat ini
    const userParticipation = assessment?.assessment_participants.find(
      (participant) => participant.assessor_profile_id === user.id
    );

    if (userParticipation) {
      const self_completed = userParticipation.status;

      if (self_completed === "submitted") {
        return { status: "submitted", label: "Selesai", color: "success" };
      }

      if (self_completed === "draft") {
        return { status: "partial", label: "Draft", color: "yellow" };
      }
    }

    return { status: "not_started", label: "Belum Mengisi", color: "gray" };
  };

  // Mobile Card Component
  const MobileAssessmentCard = ({ assessment }) => {
    const periodStatus = getAssessmentPeriodStatus(assessment);
    const participationStatus = getParticipationStatus(assessment);
    const canFill = canFillAssessment(assessment);
    const daysLeft = Math.ceil(
      (new Date(assessment.end_date) - new Date()) / (1000 * 60 * 60 * 24)
    );

    return (
      <Card key={assessment.id} className="mb-4 ">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
              <Link
                to={`/penilaian/${assessment.id}`}
                className="text-lg font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 block truncate"
              >
                {assessment.name}
              </Link>
              {assessment.description && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                  {assessment.description}
                </p>
              )}
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            {periodStatus && (
              <Badge
                color={periodStatus.color}
                size="sm"
                className="flex items-center gap-1 w-fit"
              >
                {periodStatus.status === "active" && <Clock className="w-3 h-3" />}
                {periodStatus.status === "upcoming" && <AlertCircle className="w-3 h-3" />}
                {periodStatus.status === "ended" && <CheckCircle className="w-3 h-3" />}
                {periodStatus.label}
              </Badge>
            )}

            {user.position_type === USER_POSITION.BAWAHAN && (
              <Badge
                color={participationStatus.color}
                size="sm"
                className="flex items-center gap-1 w-fit"
              >
                {participationStatus.status === "submitted" && <CheckCircle className="w-3 h-3" />}
                {participationStatus.status === "partial" && <Clock className="w-3 h-3" />}
                {participationStatus.status === "not_started" && <Play className="w-3 h-3" />}
                {participationStatus.label}
              </Badge>
            )}
          </div>

          {/* Period Information */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <Calendar className="w-4 h-4 mr-2" />
              <div>
                <div className="font-medium">
                  {formatAssessmentPeriod(assessment.start_date, assessment.end_date)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {daysLeft > 0 ? `${daysLeft} hari tersisa` : 'Periode berakhir'}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <Link to={`/penilaian/${assessment.id}`} className="block">
              {canFill ? (
                <Button
                  className="w-full flex items-center justify-center gap-2"
                  color="blue"
                >
                  <Play className="w-4 h-4" />
                  Isi Penilaian
                </Button>
              ) : (
                <Button
                  className="w-full flex items-center justify-center gap-2"
                  color="gray"
                >
                  <Eye className="w-4 h-4" />
                  Lihat Detail
                </Button>
              )}
            </Link>
          </div>
        </div>
      </Card>
    );
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          Memuat penilaian...
        </span>
      </div>
    );
  }

  // Render empty state
  if (assessments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <svg
            fill="none"
            stroke="currentColor"
            viewBox="0 0 48 48"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5l7-7 7 7M9 20h6"
            />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          Tidak ada penilaian tersedia
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Anda belum memiliki penilaian yang perlu diisi saat ini.
        </p>
      </div>
    );
  }

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="mobile-assessment-container">
        {/* Mobile Header with Search and Filter */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
          {/* Results Count */}
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {sortedAssessments.length} penilaian ditemukan
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="space-y-4">
          {sortedAssessments.map((assessment) => (
            <MobileAssessmentCard key={assessment.id} assessment={assessment} />
          ))}
        </div>
      </div>
    );
  }

  // Desktop Table Layout
  return (
    <div className="table-container">
      {/* Desktop Search Bar */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari penilaian..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table hoverable>
          <TableHead>
            <TableRow className="bg-gray-50 dark:bg-gray-700">
              {/* Assessment Name */}
              <TableHeadCell
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 min-w-[250px]"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center">
                  Nama Penilaian
                  {sortField === "name" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableHeadCell>

              {/* Period */}
              <TableHeadCell
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 min-w-[180px]"
                onClick={() => handleSort("start_date")}
              >
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Periode
                  {sortField === "start_date" && (
                    <span className="ml-1">
                      {sortDirection === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </div>
              </TableHeadCell>

              {/* Period Status */}
              <TableHeadCell className="min-w-[120px]">Status</TableHeadCell>

              {/* Participation Status */}
              {user.position_type === USER_POSITION.BAWAHAN && (
                <TableHeadCell className="min-w-[150px]">Status Partisipasi</TableHeadCell>
              )}

              {/* Actions */}
              <TableHeadCell className="min-w-[100px]">Aksi</TableHeadCell>
            </TableRow>
          </TableHead>

          <TableBody className="divide-y">
            {sortedAssessments.map((assessment) => {
              const periodStatus = getAssessmentPeriodStatus(assessment);
              const participationStatus = getParticipationStatus(assessment);
              const canFill = canFillAssessment(assessment);

              return (
                <TableRow
                  key={assessment.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {/* Assessment Name */}
                  <TableCell className="font-medium text-gray-900 dark:text-white">
                    <div>
                      <Link
                        to={`/penilaian/${assessment.id}`}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {assessment.name}
                      </Link>
                      {assessment.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {assessment.description.length > 60
                            ? `${assessment.description.substring(0, 60)}...`
                            : assessment.description}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* Period */}
                  <TableCell>
                    <div className="text-sm">
                      {formatAssessmentPeriod(
                        assessment.start_date,
                        assessment.end_date
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {Math.ceil(
                        (new Date(assessment.end_date) - new Date()) /
                          (1000 * 60 * 60 * 24)
                      )}{" "}
                      hari tersisa
                    </div>
                  </TableCell>

                  {/* Period Status */}
                  <TableCell>
                    {periodStatus && (
                      <Badge
                        color={periodStatus.color}
                        size="sm"
                        className="flex items-center gap-1 w-fit"
                      >
                        {periodStatus.status === "active" && (
                          <Clock className="w-3 h-3" />
                        )}
                        {periodStatus.status === "upcoming" && (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {periodStatus.status === "ended" && (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {periodStatus.label}
                      </Badge>
                    )}
                  </TableCell>

                  {/* Participation Status */}
                  {user.position_type === USER_POSITION.BAWAHAN && (
                    <TableCell>
                      <Badge
                        color={participationStatus.color}
                        size="sm"
                        className="flex items-center gap-1 w-fit"
                      >
                        {participationStatus.status === "submitted" && (
                          <CheckCircle className="w-3 h-3" />
                        )}
                        {participationStatus.status === "partial" && (
                          <Clock className="w-3 h-3" />
                        )}
                        {participationStatus.status === "not_started" && (
                          <Play className="w-3 h-3" />
                        )}
                        {participationStatus.label}
                      </Badge>
                    </TableCell>
                  )}

                  {/* Actions */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link to={`/penilaian/${assessment.id}`}>
                        {canFill ? (
                          <Button
                            size="xs"
                            color="blue"
                            className="flex items-center gap-1"
                          >
                            <Play className="w-3 h-3" />
                            Isi
                          </Button>
                        ) : (
                          <Button
                            size="xs"
                            color="gray"
                            className="flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Detail
                          </Button>
                        )}
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Table Footer */}
      {sortedAssessments.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 gap-2">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Menampilkan{" "}
            <span className="font-medium">{sortedAssessments.length}</span> penilaian
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Terakhir diperbarui: {new Date().toLocaleTimeString("id-ID")}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffAssessmentTable;