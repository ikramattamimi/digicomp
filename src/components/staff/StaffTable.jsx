import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
  Button,
  TextInput,
  Select,
  Checkbox,
} from "flowbite-react";
import { Search, Plus, Pencil, Trash2, UserCheck, RefreshCw } from "lucide-react";
import ProfileService from "../../services/ProfileService";
import AuthService from "../../services/AuthService";
import StaffModal from "./StaffModal";
import ErrorModal from "./ErrorModal";

const StaffTable = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [filteredSupervisors, setFilteredSupervisors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // 'add' or 'edit'
  const [currentSupervisor, setCurrentSupervisor] = useState({
    name: "",
    email: "",
  });
  const [modalError, setModalError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const data = await ProfileService.getAll();
        setSupervisors(data);
        setFilteredSupervisors(data);
      } catch (err) {
        console.error("Failed to fetch supervisors:", err);
        setErrorMessage(err?.message || "Failed to load supervisors");
        setShowErrorModal(true);
      }
    };
    fetchSupervisors();
  }, []);

  // Fungsi refresh supervisor
  const handleRefresh = async () => {
    try {
      const data = await ProfileService.getAll();
      setSupervisors(data);
      setFilteredSupervisors(data);
      setErrorMessage("");
      setShowErrorModal(false);
    } catch (err) {
      setErrorMessage(err?.message || "Failed to load supervisors");
      setShowErrorModal(true);
    }
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = supervisors;

    if (searchTerm) {
      filtered = filtered.filter(
        (sup) =>
          sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sup.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSupervisors(filtered);
  }, [supervisors, searchTerm]);

  // Handle row selection
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(filteredSupervisors.map((sup) => sup.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id, checked) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  // Modal handlers
  const handleAdd = () => {
    setModalType("add");
    setCurrentSupervisor({
      name: "",
      email: "",
      department: "",
      status: "Active",
      password: "",
    });
    setShowModal(true);
  };

  const handleEdit = (supervisor) => {
    setModalType("edit");
    setCurrentSupervisor(supervisor);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await ProfileService.delete(id);
      setSupervisors(supervisors.filter((sup) => sup.id !== id));
    } catch (err) {
      console.error("Failed to delete supervisor:", err);
      setErrorMessage(err?.message || "Failed to delete supervisor");
      setShowErrorModal(true);
    }
  };

  const handleModalChange = (updated) => {
    setCurrentSupervisor(updated);
  };

  const handleSave = async () => {
    setModalError("");
    try {
      if (modalType === "add") {
        await AuthService.registerStaff({
          email: currentSupervisor.email,
          password: currentSupervisor.password || "defaultPassword123",
          profile: {
            name: currentSupervisor.name,
            nrp: currentSupervisor.nrp,
            position: currentSupervisor.position,
            position_type: currentSupervisor.position_type,
            subdirectorat_id: currentSupervisor.subdirectorat_id,
            supervisor_id: currentSupervisor.supervisor_id,
            is_active: currentSupervisor.is_active,
          },
        });
        const data = await ProfileService.getAll();
        setSupervisors(data);
        setFilteredSupervisors(data);
      } else {
        await ProfileService.update(currentSupervisor.id, {
          name: currentSupervisor.name,
          nrp: currentSupervisor.nrp,
          email: currentSupervisor.email,
          position: currentSupervisor.position,
          position_type: currentSupervisor.position_type,
          subdirectorat_id: currentSupervisor.subdirectorat_id,
          supervisor_id: currentSupervisor.supervisor_id,
          is_active: currentSupervisor.is_active,
        });
        const data = await ProfileService.getAll();
        setSupervisors(data);
        setFilteredSupervisors(data);
      }
      setShowModal(false);
    } catch (err) {
      setModalError(err?.message || "Failed to save supervisor");
      setShowModal(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <UserCheck className="mr-3 text-blue-600 dark:text-blue-400" />
          Staff Atasan
        </h1>
        <div className="flex gap-3">
          <Button
            color="gray"
            onClick={handleRefresh}
            className="flex items-center gap-2"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            onClick={handleAdd}
            color="blue"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Supervisor
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex-1">
          <TextInput
            icon={Search}
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select>
            <option value="">All Departments</option>
            <option value="IT">IT</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
          </Select>
        </div>
      </div>

      {/* Selected Items Actions */}
      {selectedRows.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            {selectedRows.length} item(s) selected
          </span>
          <Button size="xs" color="failure">
            Delete Selected
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow">
        <Table>
          <TableHead>
            <TableRow className="bg-gray-50 dark:bg-gray-700">
              <TableHeadCell className="w-4">
                <Checkbox
                  checked={
                    selectedRows.length === filteredSupervisors.length &&
                    filteredSupervisors.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableHeadCell>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Email</TableHeadCell>
              <TableHeadCell>NRP</TableHeadCell>
              <TableHeadCell>Position</TableHeadCell>
              <TableHeadCell>Position Type</TableHeadCell>
              <TableHeadCell>Subdirectorate ID</TableHeadCell>
              <TableHeadCell>Supervisor ID</TableHeadCell>
              <TableHeadCell>Active</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {filteredSupervisors.map((sup) => (
              <TableRow
                key={sup.id}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <TableCell>
                  <Checkbox
                    checked={selectedRows.includes(sup.id)}
                    onChange={(e) => handleSelectRow(sup.id, e.target.checked)}
                  />
                </TableCell>
                <TableCell className="font-medium text-gray-900 dark:text-white">
                  {sup.name}
                </TableCell>
                <TableCell>{sup.email}</TableCell>
                <TableCell>{sup.nrp}</TableCell>
                <TableCell>{sup.position}</TableCell>
                <TableCell>{sup.position_type}</TableCell>
                <TableCell>{sup.subdirectorat_id}</TableCell>
                <TableCell>{sup.supervisor_id}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      sup.is_active
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {sup.is_active ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      size="xs"
                      color="light"
                      onClick={() => handleEdit(sup)}
                      className="flex items-center gap-1"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </Button>
                    <Button
                      size="xs"
                      color="red"
                      onClick={() => handleDelete(sup.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredSupervisors.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No supervisors found.
          </div>
        )}
      </div>

      {/* Modal for Add/Edit */}
      <StaffModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setModalError("");
        }}
        modalType={modalType}
        supervisor={currentSupervisor}
        onChange={handleModalChange}
        onSave={handleSave}
        error={modalError}
      />
      <ErrorModal
        show={showErrorModal}
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
};

export default StaffTable;
