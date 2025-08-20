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
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  UserCheck,
  RefreshCw,
} from "lucide-react";
import ProfileService from "../../services/ProfileService";
import AuthService from "../../services/AuthService";
import AdminModal from "./AdminModal";
import ErrorModal from "./ErrorModal";

const AdminTable = () => {
  const [Admins, setAdmins] = useState([]);
  const [filteredAdmins, setFilteredAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // 'add' or 'edit'
  const [currentAdmin, setCurrentAdmin] = useState({
    name: "",
    email: "",
  });
  const [modalError, setModalError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const myDomain = "@scprcjt.web.app";

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const data = await ProfileService.getAdmin();
        setAdmins(data);
        setFilteredAdmins(data);
      } catch (err) {
        console.error("Failed to fetch admins:", err);
        setErrorMessage(err?.message || "Failed to load admins");
        setShowErrorModal(true);
      }
    };
    fetchAdmins();
  }, []);

  // Fungsi refresh admin
  const handleRefresh = async () => {
    try {
      const data = await ProfileService.getAdmin();
      setAdmins(data);
      setFilteredAdmins(data);
      setErrorMessage("");
      setShowErrorModal(false);
    } catch (err) {
      setErrorMessage(err?.message || "Failed to load admins");
      setShowErrorModal(true);
    }
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = Admins;

    if (searchTerm) {
      filtered = filtered.filter(
        (sup) =>
          sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sup.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAdmins(filtered);
  }, [Admins, searchTerm]);

  // Handle row selection
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(filteredAdmins.map((sup) => sup.id));
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
    setCurrentAdmin({
      name: "",
      email: "",
      department: "",
      status: "Active",
      password: "",
    });
    setShowModal(true);
  };

  const handleEdit = (admin) => {
    setModalType("edit");
    setCurrentAdmin(admin);
    setShowModal(true);
  };

  const handleDelete = async (id, status) => {
    try {
      if (status != true) {
        await ProfileService.delete(id);
        handleRefresh();
      } else {
        setErrorMessage("Set status to inactive for delete");
        setShowErrorModal(true);
      }
    } catch (err) {
      console.error("Failed to delete admin:", err);
      setErrorMessage(err?.message || "Failed to delete admin");
      setShowErrorModal(true);
    }
  };

  const handleModalChange = (updated) => {
    setCurrentAdmin(updated);
  };

  const handleSave = async () => {
    setModalError("");
    try {
      if (modalType === "add") {
        await AuthService.registerStaff({
          email: setNameToUsername(currentAdmin.name) + myDomain,
          password: currentAdmin.password,
          profile: {
            name: currentAdmin.name,
            position_type: "ADMIN",
            is_active: "true",
          },
        });
        const data = await ProfileService.getAdmin();
        setAdmins(data);
        setFilteredAdmins(data);
      } else {
        if (currentAdmin.password != "") {
          await AuthService.changeUserPasswordAsAdmin(
            currentAdmin.id,
            currentAdmin.password
          );
        }
        await ProfileService.update(currentAdmin.id, {
          name: currentAdmin.name,
          email: currentAdmin.email,
          position_type: "ADMIN",
          is_active: currentAdmin.is_active,
        });
        const data = await ProfileService.getAdmin();
        setAdmins(data);
        setFilteredAdmins(data);
      }
      setShowModal(false);
    } catch (err) {
      setModalError(err?.message || "Failed to save admin");
      setShowModal(true);
    }
  };

  // Hide Email domain
  const setEmailToUsername = (email) => {
    const mDomain = "scprcjt.web.app";

    const words = email.split("@");
    if (words[1] == mDomain) {
      return words[0];
    } else {
      return email;
    }
  };

  const setNameToUsername = (name) => {
    const words = name.split(" ");
    if (words.length > 1) {
      const words1 = words[0] + words[1];
      const words2 = words1.replace(",", "");
      return words2.toLowerCase();
    } else {
      const words1 = words[0];
      const words2 = words1.replace(",", "");
      return words2.toLowerCase();
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <UserCheck className="mr-3 text-blue-600 dark:text-blue-400" />
          Admin
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
            Add Admin
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
      </div>

      {/* Selected Items Actions */}
      {selectedRows.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            {selectedRows.length} item(s) selected
          </span>
          <Button size="xs" color="red">
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
                    selectedRows.length === filteredAdmins.length &&
                    filteredAdmins.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableHeadCell>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Username</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {filteredAdmins.map((sup) => (
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
                <TableCell>{setEmailToUsername(sup.email)}</TableCell>
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
                      onClick={() => handleDelete(sup.id, sup.is_active)}
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

        {filteredAdmins.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No admins found.
          </div>
        )}
      </div>

      {/* Modal for Add/Edit */}
      <AdminModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setModalError("");
        }}
        modalType={modalType}
        admin={currentAdmin}
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

export default AdminTable;
