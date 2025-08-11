import React, { useEffect, useState, forwardRef, useImperativeHandle } from "react";
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
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import ProfileService from "../../services/ProfileService";
import SubdirectoratService from "../../services/SubdirectoratsService";

import AuthService from "../../services/AuthService";
import StaffModal from "./StaffModal";
import ErrorModal from "./ErrorModal";

const StaffTable = forwardRef((props, ref) => {
  const [subDirektoratA, setSubDirektoratA] = useState("");
  const [subDirektorat, setSubDirektorat] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [filteredSupervisors, setFilteredSupervisors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSupervisorForm, setShowSupervisorForm] = useState("hidden");
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
        const dataSubDirektorat = await SubdirectoratService.getActive();
        setSubDirektorat(dataSubDirektorat);

        const data = await ProfileService.getStaff();
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
      const data = await ProfileService.getStaff();
      setSupervisors(data);
      setFilteredSupervisors(data);
      setErrorMessage("");
      setShowErrorModal(false);
    } catch (err) {
      setErrorMessage(err?.message || "Failed to load supervisors");
      setShowErrorModal(true);
    }
  };

  // Fungsi filter by sub directorat
  const handleFilterSubdirectorat = async (id) => {
    try {
      if (id != "*") {
        const data = await ProfileService.getBySubDirectorat(id);
        setSubDirektoratA(id)
        setSupervisors(data);
        setFilteredSupervisors(data);
        setErrorMessage("");
        setShowErrorModal(false);
      } else {
        handleRefresh();
      }
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

  // Set ID to Competency Name
  const setToName = (id) => {
    const bobObject = subDirektorat.find((obj) => obj.id === id);
    const bobId = bobObject ? bobObject.name : undefined;

    return bobId;
  };

  const setToNameSupervisor = (id) => {
    const bobObject = supervisors.find((obj) => obj.id === id);
    const bobId = bobObject ? bobObject.name : undefined;

    return bobId;
  };

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
    if (supervisor.position_type == "BAWAHAN") {
      setShowSupervisorForm("show");
    } else {
      setShowSupervisorForm("hidden");
    }
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

  const handleModalChange = (updated, element) => {
    setCurrentSupervisor(updated);
    if (updated.position_type == "BAWAHAN" && element != null) {
      element.style.display = "block";
    } else if (updated.position_type == "ATASAN" && element != null) {
      const newsupervisorid = { ...updated, supervisor_id: null };
      setCurrentSupervisor(newsupervisorid);
      element.style.display = "none";
    }
  };

  const handleSave = async () => {
    setModalError("");
    try {
      if (modalType === "add") {
        await AuthService.registerStaff({
          email: currentSupervisor.email,
          password: currentSupervisor.password,
          profile: {
            name: currentSupervisor.name,
            nrp: currentSupervisor.nrp,
            position: currentSupervisor.position,
            position_type: currentSupervisor.position_type,
            subdirectorat_id: currentSupervisor.subdirectorat_id,
            supervisor_id: currentSupervisor.supervisor_id,
          },
        });
        const data = await ProfileService.getStaff();
        setSupervisors(data);
        setFilteredSupervisors(data);
      } else {
        if (currentSupervisor.password != "") {
          await AuthService.changeUserPasswordAsAdmin(
            currentSupervisor.id,
            currentSupervisor.password
          );
        }
        await ProfileService.update(currentSupervisor.id, {
          name: currentSupervisor.name,
          nrp: currentSupervisor.nrp,
          email: currentSupervisor.email,
          position: currentSupervisor.position,
          position_type: currentSupervisor.position_type,
          subdirectorat_id: currentSupervisor.subdirectorat_id,
          supervisor_id: currentSupervisor.supervisor_id,
        });
        const data = await ProfileService.getStaff();
        setSupervisors(data);
        setFilteredSupervisors(data);
      }
      setShowModal(false);
    } catch (err) {
      setModalError(err?.message || "Failed to save supervisor");
      setShowModal(true);
    }
  };

  // Expose handlers to parent via ref
  useImperativeHandle(ref, () => ({
    handleAdd,
    handleRefresh,
  }));

  return (
    <div className="space-y-5 mt-5">

      <div className="w-full sm:w-48 flex flex-row gap-4 m-5">
        {subDirektorat.map((sup) => (
          <Button
            id={sup.id}
            color={subDirektoratA === sup.id ? 'blue' : 'gray'}
            className="flex items-center gap-2"
            onClick={() => handleFilterSubdirectorat(sup.id)}
            value={sup.id}
          >
            <p class="whitespace-nowrap">
              {sup.name}
            </p>
          </Button>
        ))}
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 rounded-lg">
        <div className="flex-1">
          <TextInput
            icon={Search}
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
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
      <div className="table-container">
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
              <TableHeadCell>Supervisor</TableHeadCell>
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
                <TableCell>{setToNameSupervisor(sup.supervisor_id)}</TableCell>
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
        supervisorForm={showSupervisorForm}
        staff={currentSupervisor}
        supervisor={supervisors}
        subDirectorat={subDirektorat}
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
});

export default StaffTable;
