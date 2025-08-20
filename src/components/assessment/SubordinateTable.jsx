import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Button,
  Badge,
  Avatar,
  TextInput,
  Select,
  Card,
} from "flowbite-react";
import { 
  Search, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye,
  Edit
} from "lucide-react";
import { Link } from "react-router-dom";
import ProfileService from "../../services/ProfileService";
import AssessmentParticipantService from "../../services/AssessmentParticipantService";

const SubordinateTable = ({ assessmentId, supervisorId, onRefresh }) => {
  const [subordinates, setSubordinates] = useState([]);
  const [filteredSubordinates, setFilteredSubordinates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load subordinates data
  useEffect(() => {
    const loadSubordinates = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get subordinates for this supervisor
        const subordinatesData = await ProfileService.getSubordinates(supervisorId);

        // console.log('Subordinates Data:', subordinatesData);
        // Get assessment participation status for each subordinate
        const subordinatesWithStatus = await Promise.all(
          subordinatesData.map(async (subordinate) => {
            try {
              const selfStatusResult = await AssessmentParticipantService.getAssessmentStatus(
                assessmentId, 
                subordinate.id, 
                subordinate.id
              );
              const selfParticipantStatus = selfStatusResult?.status || null;

              const supervisorStatusResult = await AssessmentParticipantService.getAssessmentStatus(
                assessmentId, 
                subordinate.id, 
                supervisorId
              );
              const supervisorParticipantStatus = supervisorStatusResult?.status || null;

              return {
                ...subordinate,
                selfAssessment: selfParticipantStatus || null,
                supervisorAssessment: supervisorParticipantStatus || null,
                overallStatus: getOverallStatus(selfParticipantStatus, supervisorParticipantStatus)
              };
            } catch (err) {
              return {
                ...subordinate,
                selfAssessment: null,
                supervisorAssessment: null,
                overallStatus: 'not_started'
              };
            }
          })
        );

        setSubordinates(subordinatesWithStatus);
        setFilteredSubordinates(subordinatesWithStatus);
      } catch (err) {
        console.error("Failed to load subordinates:", err);
        setError(err.message || "Failed to load subordinates");
      } finally {
        setLoading(false);
      }
    };

    if (assessmentId && supervisorId) {
      loadSubordinates();
    }
  }, [assessmentId, supervisorId, onRefresh]);

  // Filter subordinates based on search and status
  useEffect(() => {
    let filtered = subordinates;

    if (searchTerm) {
      filtered = filtered.filter(
        (sub) =>
          sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.nrp?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((sub) => sub.overallStatus === statusFilter);
    }

    setFilteredSubordinates(filtered);
  }, [subordinates, searchTerm, statusFilter]);

  // Get overall status for a subordinate
  const getOverallStatus = (selfParticipantStatus, supervisorParticipantStatus) => {
    if (!selfParticipantStatus && !supervisorParticipantStatus) return 'not_started';

    const selfCompleted = selfParticipantStatus || false;
    const supervisorCompleted = supervisorParticipantStatus || false;

    if (selfCompleted && supervisorCompleted) {
      return 'submitted';
    } else if (selfCompleted || supervisorCompleted) {
      return 'in_progress';
    } else {
      return 'not_started';
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      not_started: {
        color: "gray",
        icon: XCircle,
        label: "Belum Mulai",
      },
      in_progress: {
        color: "yellow", 
        icon: Clock,
        label: "Sedang Berjalan",
      },
      submitted: {
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

  // Get assessment status badge
  const getAssessmentStatusBadge = (assessmentStatus, type) => {
    if (!assessmentStatus) {
      return (
        <Badge color="gray" size="sm" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Belum Ada
        </Badge>
      );
    }

    if (assessmentStatus == 'submitted') {
      return (
        <div className="space-y-1">
          <Badge color="green" size="sm" className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Selesai
          </Badge>
          {/* {assessmentData.submission_date && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(assessmentData.submission_date).toLocaleDateString('id-ID')}
            </div>
          )} */}
        </div>
      );
    } else {
      return (
        <Badge color="gray" size="sm" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Belum Selesai
        </Badge>
      );
    }
  };

  // Mobile Card Component - Show all data without expand/collapse
  const MobileCard = ({ subordinate }) => {
    return (
      <Card className="mb-3">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-1">
              <Avatar
                img={subordinate.avatar}
                alt={subordinate.name}
                size="sm"
                className="mr-3"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">
                  {subordinate.name}
                </div>
                <div className="text-xs text-gray-500">
                  {subordinate.nrp || 'No NRP'}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              {getStatusBadge(subordinate.overallStatus)}
            </div>
          </div>

          {/* Position */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Posisi</p>
            <p className="text-sm">{subordinate.position || '-'}</p>
            {subordinate.subdirectorats?.name && (
              <p className="text-xs text-gray-500">{subordinate.subdirectorats.name}</p>
            )}
          </div>

          {/* Assessment Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Penilaian Diri
              </p>
              {getAssessmentStatusBadge(subordinate.selfAssessment, 'self')}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                Penilaian Atasan
              </p>
              {getAssessmentStatusBadge(subordinate.supervisorAssessment, 'supervisor')}
            </div>
          </div>

          {/* Action */}
          <div className="flex justify-end">
            <Link
              to={`/penilaian/${assessmentId}/${subordinate.id}`}
              className="w-full"
            >
              {!subordinate.supervisorAssessment ? (
                <Button size="sm" color="blue" className="w-full">
                  <Edit className="w-4 h-4 mr-2" />
                  Nilai
                </Button>
              ) : (                            
                <Button size="sm" color="gray" className="w-full">
                  <Eye className="w-4 h-4 mr-2" />
                  Lihat
                </Button>
              )}
            </Link>
          </div>
        </div>
      </Card>
    );
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
      {/* Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-2 lg:p-3 rounded-lg">
          <div className="flex items-center">
            <Users className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600 dark:text-blue-400 mr-1 lg:mr-2" />
            <div>
              <p className="text-xs lg:text-sm text-blue-600 dark:text-blue-400">Total</p>
              <p className="text-sm lg:text-lg font-semibold text-blue-900 dark:text-blue-300">
                {subordinates.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-2 lg:p-3 rounded-lg">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 lg:w-5 lg:h-5 text-green-600 dark:text-green-400 mr-1 lg:mr-2" />
            <div>
              <p className="text-xs lg:text-sm text-green-600 dark:text-green-400">
                Selesai
              </p>
              <p className="text-sm lg:text-lg font-semibold text-green-900 dark:text-green-300">
                {subordinates.filter(sub => sub.overallStatus === "submitted").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 lg:p-3 rounded-lg">
          <div className="flex items-center">
            <Clock className="w-4 h-4 lg:w-5 lg:h-5 text-yellow-600 dark:text-yellow-400 mr-1 lg:mr-2" />
            <div>
              <p className="text-xs lg:text-sm text-yellow-600 dark:text-yellow-400">
                Berjalan
              </p>
              <p className="text-sm lg:text-lg font-semibold text-yellow-900 dark:text-yellow-300">
                {subordinates.filter(sub => sub.overallStatus === "in_progress").length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-2 lg:p-3 rounded-lg">
          <div className="flex items-center">
            <XCircle className="w-4 h-4 lg:w-5 lg:h-5 text-red-600 dark:text-red-400 mr-1 lg:mr-2" />
            <div>
              <p className="text-xs lg:text-sm text-red-600 dark:text-red-400">
                Belum
              </p>
              <p className="text-sm lg:text-lg font-semibold text-red-900 dark:text-red-300">
                {subordinates.filter(sub => sub.overallStatus === "not_started").length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="space-y-3 lg:space-y-0 lg:flex lg:gap-4 lg:items-center">
        <div className="flex-1">
          <TextInput
            icon={Search}
            placeholder="Cari bawahan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sizing="sm"
          />
        </div>

        <div className="lg:flex-none">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sizing="sm"
          >
            <option value="all">Semua Status</option>
            <option value="not_started">Belum Mulai</option>
            <option value="in_progress">Sedang Berjalan</option>
            <option value="submitted">Selesai</option>
          </Select>
        </div>
      </div>

      {/* Content - Mobile Cards or Desktop Table */}
      {isMobile ? (
        // Mobile Card View - Show all data directly
        <div className="space-y-3">
          {filteredSubordinates.length === 0 ? (
            <Card>
              <div className="flex flex-col items-center text-gray-500 dark:text-gray-400 py-8">
                <Users className="w-8 h-8 mb-2 opacity-50" />
                <p>Tidak ada bawahan ditemukan</p>
                {searchTerm && (
                  <p className="text-sm text-center mt-1">
                    Coba ubah kriteria pencarian
                  </p>
                )}
              </div>
            </Card>
          ) : (
            filteredSubordinates.map((subordinate) => (
              <MobileCard key={subordinate.id} subordinate={subordinate} />
            ))
          )}
        </div>
      ) : (
        // Desktop Table View
        <div className="table-container overflow-x-auto">
          <Table hoverable>
            <TableHead>
              <TableHeadCell>Nama Bawahan</TableHeadCell>
              <TableHeadCell>NRP</TableHeadCell>
              <TableHeadCell>Posisi</TableHeadCell>
              <TableHeadCell>Status Keseluruhan</TableHeadCell>
              <TableHeadCell>Penilaian Diri</TableHeadCell>
              <TableHeadCell>Penilaian Atasan</TableHeadCell>
              <TableHeadCell>Aksi</TableHeadCell>
            </TableHead>
            <TableBody className="divide-y">
              {filteredSubordinates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
                      <Users className="w-8 h-8 mb-2 opacity-50" />
                      <p>Tidak ada bawahan ditemukan</p>
                      {searchTerm && (
                        <p className="text-sm">
                          Coba ubah kriteria pencarian Anda
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSubordinates.map((subordinate) => (
                  <TableRow
                    key={subordinate.id}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <TableCell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center">
                        {/* <Avatar
                          img={subordinate.avatar}
                          alt={subordinate.name}
                          size="sm"
                          className="mr-3"
                        /> */}
                        <div>
                          <div className="font-medium">
                            {subordinate.name}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {subordinate.nrp || '-'}
                    </TableCell>

                    <TableCell>
                      <div>
                        <div className="font-medium">{subordinate.position || '-'}</div>
                        <div className="text-sm text-gray-500">{subordinate.subdirectorats?.name || '-'}</div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {getStatusBadge(subordinate.overallStatus)}
                    </TableCell>

                    <TableCell>
                      {getAssessmentStatusBadge(subordinate.selfAssessment, 'self')}
                    </TableCell>

                    <TableCell>
                      {getAssessmentStatusBadge(subordinate.supervisorAssessment, 'supervisor')}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/penilaian/${assessmentId}/${subordinate.id}`}
                        >
                          {!subordinate.supervisorAssessment ? (
                            <Button size="xs" color="blue">
                              <Edit className="w-3 h-3 mr-1" />
                              Nilai
                            </Button>
                          ) : (                            
                            <Button size="xs" color="gray">
                              <Eye className="w-3 h-3 mr-1" />
                              Lihat
                            </Button>
                          )}
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Results Summary */}
      {filteredSubordinates.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Menampilkan {filteredSubordinates.length} dari {subordinates.length} bawahan
        </div>
      )}
    </div>
  );
};

export default SubordinateTable;