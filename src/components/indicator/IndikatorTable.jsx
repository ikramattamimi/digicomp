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
import IndicatorService from "../../services/IndicatorService";
import CompetencyService from "../../services/CompetencyService";
import IndikatorModal from "./IndikatorModal";
import ErrorModal from "./ErrorModal";

const IndikatorTable = forwardRef((props, ref) => {
  const [kompetensi, setKompetensi] = useState([]);
  const [indikator, setIndikator] = useState([]);
  const [filteredIndikator, setFilteredIndikator] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // 'add' or 'edit'
  const [currentIndikator, setCurrentIndikator] = useState({
    name: "",
    status: "",
  });
  const [modalError, setModalError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchSubDirectorat = async () => {
      try {
        const dataKompetensi = await CompetencyService.getActive();
        setKompetensi(dataKompetensi)
        
        const data = await IndicatorService.getAll();
        setIndikator(data);
        setFilteredIndikator(data);
      } catch (err) {
        console.error("Failed to fetch Indikator:", err);
        setErrorMessage(err?.message || "Failed to load Indikator");
        setShowErrorModal(true);
      }
    };
    fetchSubDirectorat();
  }, []);

  // Fungsi refresh supervisor
  const handleRefresh = async () => {
    try {
      const data = await IndicatorService.getAll();
      setIndikator(data);
      setFilteredIndikator(data);
      setErrorMessage("");
      setShowErrorModal(false);
    } catch (err) {
      setErrorMessage(err?.message || "Failed to load Indikator");
      setShowErrorModal(true);
    }
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = indikator;

    if (searchTerm) {
      filtered = filtered.filter(
        (sup) =>
          sup.name.toLowerCase().includes(searchTerm.toLowerCase())||
          sup.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredIndikator(filtered);
  }, [indikator, searchTerm]);

  // Handle row selection
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedRows(filteredIndikator.map((sup) => sup.id));
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
    setCurrentIndikator({
      name: "",
      status: "",
    });
    setShowModal(true);
  };

  // Set ID to Competency Name
  const setToName = (id) => {
    const bobObject = kompetensi.find(obj => obj.id === id);
    const bobId = bobObject ? bobObject.name : undefined;

    return(
      bobId
    )
  };

  const handleEdit = (supervisor) => {
    setModalType("edit");
    setCurrentIndikator(supervisor);
    setShowModal(true);
  };

  const handleDelete = async (id, status) => {
    try {
      if(status != true){
        await IndicatorService.delete(id, status);
        handleRefresh()
      }else{
        setErrorMessage("Set status to inactive for delete");
        setShowErrorModal(true);
      }
      
    } catch (err) {
      console.error("Failed to delete Indikator:", err);
      setErrorMessage(err?.message || "Failed to delete Indikator");
      setShowErrorModal(true);
    }
  };

  const handleModalChange = (updated) => {
    setCurrentIndikator(updated);
  };

  const handleSave = async () => {
    setModalError("");
    try {
      if (modalType === "add") {
        await IndicatorService.create({
          name: currentIndikator.name,
          description: currentIndikator.description,
          statement_text: currentIndikator.statement_text,
          competency_id: currentIndikator.competency_id,
          is_active: "true",
        });
        const data = await IndicatorService.getAll();
        setIndikator(data);
        setFilteredIndikator(data);
      } else {
        await IndicatorService.update(currentIndikator.id, {
          name: currentIndikator.name,
          description: currentIndikator.description,
          statement_text: currentIndikator.statement_text,
          competency_id: currentIndikator.competency_id,
          is_active: currentIndikator.is_active,
        });
        const data = await IndicatorService.getAll();
        setIndikator(data);
        setFilteredIndikator(data);
      }
      setShowModal(false);
    } catch (err) {
      setModalError(err?.message || "Failed to save Indikator");
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
                    selectedRows.length === filteredIndikator.length &&
                    filteredIndikator.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableHeadCell>
              <TableHeadCell>Name</TableHeadCell>
              <TableHeadCell>Description</TableHeadCell>
              <TableHeadCell>Statement</TableHeadCell>
              <TableHeadCell>Competency</TableHeadCell>
              <TableHeadCell>Status</TableHeadCell>
              <TableHeadCell>Actions</TableHeadCell>
            </TableRow>
          </TableHead>
          <TableBody className="divide-y">
            {filteredIndikator.map((sup) => (
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
                <TableCell>{sup.statement_text}</TableCell>
                <TableCell>{setToName(sup.competency_id)}</TableCell>
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

        {filteredIndikator.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400"> 
            No Indikator found.
          </div>
        )}
      </div>

      {/* Modal for Add/Edit */}
      <IndikatorModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setModalError("");
        }}
        modalType={modalType}
        indikator={currentIndikator}
        kompetensi={kompetensi}
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

export default IndikatorTable;
