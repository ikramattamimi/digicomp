// Assessment Table Component - Displays list of assessments in table format
// Features: sorting, actions, status badges, and responsive design

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
  Alert,
  Spinner,
} from "flowbite-react";
import {
  Calendar,
} from "lucide-react";
import AssessmentStatusBadge from "./AssessmentStatusBadge.jsx";
import AdminActionButtons from "./AssessmentActionButtons.jsx";
import { formatAssessmentPeriod } from "../../utils/assessmentUtils";
import { useUserContext } from "../../contexts/UserContext.js";

const AssessmentTable = ({
  assessments,
  loading,
  onDelete,
  onPublish,
  onComplete,
}) => {
  const [sortField, setSortField] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");

  const { position_type: role } = useUserContext();

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Sort assessments
  const sortedAssessments = [...assessments].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle date fields
    if (sortField.includes("date") || sortField === "created_at") {
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

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          Loading assessments...
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
              d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.712-3.714M14 40v-4a9.971 9.971 0 01.712-3.714M14 40v-4a9.971 9.971 0 01.712-3.714M34 40v-4a9.971 9.971 0 00-.712-3.714"
            />
          </svg>
        </div>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          Tidak ada penilaian ditemukan
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Untuk memulai, buat penilaian baru.
        </p>
        <div className="mt-6">
          <Link to="/penilaian/create">
            <Button color="blue">Buat Penilaian</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <Table hoverable>
        <TableHead>
          <TableRow className="bg-gray-400 border-b border-gray-600 dark:bg-gray-700">
            {/* Assessment Name */}
            <TableHeadCell
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
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

            {/* Status */}
            <TableHeadCell
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center">
                Status
                {sortField === "status" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </TableHeadCell>

            {/* Period */}
            <TableHeadCell>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                Periode
              </div>
            </TableHeadCell>

            {/* Created Date */}
            <TableHeadCell
              className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={() => handleSort("created_at")}
            >
              <div className="flex items-center">
                Tanggal Dibuat
                {sortField === "created_at" && (
                  <span className="ml-1">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </TableHeadCell>

            {/* Actions */}
            <TableHeadCell>Aksi</TableHeadCell>
          </TableRow>
        </TableHead>

        <TableBody className="divide-y">
          {sortedAssessments.map((assessment) => (
            <TableRow
              key={assessment.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200"
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
                </div>
              </TableCell>

              {/* Status */}
              <TableCell>
                <AssessmentStatusBadge size="sm" status={assessment.status} />
              </TableCell>

              {/* Period */}
              <TableCell>
                <div className="text-sm">
                  {formatAssessmentPeriod(
                    assessment.start_date,
                    assessment.end_date
                  )}
                </div>
              </TableCell>

              {/* Created Date */}
              <TableCell>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(assessment.created_at).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </TableCell>

              {/* Actions */}
              <TableCell>
                <div className="flex items-center gap-2">
                  {role === "ADMIN" && (
                    <AdminActionButtons
                      assessment={assessment}
                      onDelete={onDelete}
                      onPublish={onPublish}
                      onComplete={onComplete}
                    />
                  )}

                  {role === "BAWAHAN" && (
                    <SubordinateActionButtons
                      assessment={assessment}
                      onDelete={onDelete}
                      onComplete={onComplete}
                    />
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Table Footer with Summary */}
      {assessments.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Showing <span className="font-medium">{assessments.length}</span>{" "}
            assessments
          </div>

          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleTimeString("id-ID")}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssessmentTable;