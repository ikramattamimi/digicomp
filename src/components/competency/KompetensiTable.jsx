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
import { Search, Plus, Pencil, Trash2, UserCheck, RefreshCw, Building, Target, Award } from "lucide-react";
import CompetencyService from "../../services/CompetencyService";
import KompetensiModal from "./KompetensiModal";
import ErrorModal from "./ErrorModal";

const KompetensiTable = forwardRef((props, ref) => {
  // Expose handlers to parent via ref
  useImperativeHandle(ref, () => ({
    handleAdd,
    handleRefresh,
  }));
  const [kompetensi, setKompetensi] = useState([]);
  const [filteredSupervisors, setFilteredKompetensi] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // 'add' or 'edit'
  const [currentKompetensi, setCurrentKompetensi] = useState({
    name: "",
    status: "",
  });
  const [modalError, setModalError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchSubDirectorat = async () => {
      try {
        const data = await CompetencyService.getAll();
        setKompetensi(data);
        setFilteredKompetensi(data);
      } catch (err) {
        console.error("Failed to fetch kompetensi:", err);
        setErrorMessage(err?.message || "Failed to load kompetensi");
        setShowErrorModal(true);
      }
    };
    fetchSubDirectorat();
  }, []);

  // Fungsi refresh supervisor
  const handleRefresh = async () => {
    try {
      const data = await CompetencyService.getAll();
      setKompetensi(data);
      setFilteredKompetensi(data);
      setErrorMessage("");
      setShowErrorModal(false);
    } catch (err) {
      setErrorMessage(err?.message || "Failed to load kompetensi");
      setShowErrorModal(true);
    }
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = kompetensi;

    if (searchTerm) {
      filtered = filtered.filter(
        (sup) =>
          sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sup.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredKompetensi(filtered);
  }, [kompetensi, searchTerm]);

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
    setCurrentKompetensi({
      name: "",
      status: "",
    });
    setShowModal(true);
  };

  const handleEdit = (kompetensi) => {
    setModalType("edit");
    setCurrentKompetensi(kompetensi);
    setShowModal(true);
  };

  const handleDelete = async (id, status) => {
    try {
      if (status != true) {
        await CompetencyService.delete(id, status);
        handleRefresh()
      } else {
        setErrorMessage("Set status to inactive for delete");
        setShowErrorModal(true);
      }

    } catch (err) {
      console.error("Failed to delete kompetensi:", err);
      setErrorMessage(err?.message || "Failed to delete kompetensi");
      setShowErrorModal(true);
    }
  };

  const handleModalChange = (updated) => {
    setCurrentKompetensi(updated);
  };

  const handleSave = async () => {
    setModalError("");
    try {
      if (modalType === "add") {
        await CompetencyService.create({
          name: currentKompetensi.name,
          description: currentKompetensi.description,
          is_active: "true",
        });
        const data = await CompetencyService.getAll();
        setKompetensi(data);
        setFilteredKompetensi(data);
      } else {
        await CompetencyService.update(currentKompetensi.id, {
          name: currentKompetensi.name,
          description: currentKompetensi.description,
          is_active: currentKompetensi.is_active,
        });
        const data = await CompetencyService.getAll();
        setKompetensi(data);
        setFilteredKompetensi(data);
      }
      setShowModal(false);
    } catch (err) {
      setModalError(err?.message || "Failed to save kompetensi");
      setShowModal(true);
    }
  };

  return (
    <div className="space-y-5 mt-5">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <div className="flex-1">
          <TextInput
            icon={Search}
            placeholder="Search by name..."
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
              <TableHeadCell>Description</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
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
                <TableCell>{sup.description}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${sup.is_active
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

        {filteredSupervisors.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No kompetensi found.
          </div>
        )}
      </div>

      {/* Modal for Add/Edit */}
      <KompetensiModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setModalError("");
        }}
        modalType={modalType}
        kompetensi={currentKompetensi}
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

export default KompetensiTable;
