import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
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
  Tabs,
  TabItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
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
  const [subDirektoratS, setSubDirektoratS] = useState(0);
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const myDomain = "@scprcjt.web.app";

  useEffect(() => {
    const fetchSupervisors = async () => {
      try {
        const dataSubDirektorat = await SubdirectoratService.getActive();
        setSubDirektorat(dataSubDirektorat);

        const data = await ProfileService.getStaff();
        
        // Sort data immediately after fetching
        const rankOrder = [
          "AKBP",
          "Kompol",
          "AKP",
          "IPTU",
          "IPDA",
          "AIPTU",
          "AIPDA"
        ];

        const sortedData = data.sort((a, b) => {
          if (a.position_type === "ATASAN" && b.position_type !== "ATASAN") {
            return -1; // a comes first
          }
          if (a.position_type !== "ATASAN" && b.position_type === "ATASAN") {
            return 1; // b comes first
          }
          // Urutkan berdasarkan pangkat jika bukan ATASAN
          const rankA = rankOrder.indexOf(a.rank);
          const rankB = rankOrder.indexOf(b.rank);
          if (rankA !== rankB) {
            return rankA - rankB;
          }
          // Jika pangkat sama, urutkan berdasarkan nama
          return a.name.localeCompare(b.name);
        });
        
        setSupervisors(sortedData);
        setFilteredSupervisors(sortedData);
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
      
      // Sort data immediately
      const rankOrder = [
        "AKBP",
        "Kompol",
        "AKP",
        "IPTU",
        "IPDA",
        "AIPTU",
        "AIPDA"
      ];

      const sortedData = data.sort((a, b) => {
        if (a.position_type === "ATASAN" && b.position_type !== "ATASAN") {
          return -1;
        }
        if (a.position_type !== "ATASAN" && b.position_type === "ATASAN") {
          return 1;
        }
        // Urutkan berdasarkan pangkat jika bukan ATASAN
        const rankA = rankOrder.indexOf(a.rank);
        const rankB = rankOrder.indexOf(b.rank);
        if (rankA !== rankB) {
          return rankA - rankB;
        }
        // Jika pangkat sama, urutkan berdasarkan nama
        return a.name.localeCompare(b.name);
      });
      
      setSupervisors(sortedData);
      setFilteredSupervisors(sortedData);
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
        
        // Sort data immediately
        const rankOrder = [
          "AKBP",
          "Kompol",
          "AKP",
          "IPTU",
          "IPDA",
          "AIPTU",
          "AIPDA"
        ];

        const sortedData = data.sort((a, b) => {
          if (a.position_type === "ATASAN" && b.position_type !== "ATASAN") {
            return -1;
          }
          if (a.position_type !== "ATASAN" && b.position_type === "ATASAN") {
            return 1;
          }
          // Urutkan berdasarkan pangkat jika bukan ATASAN
          const rankA = rankOrder.indexOf(a.rank);
          const rankB = rankOrder.indexOf(b.rank);
          if (rankA !== rankB) {
            return rankA - rankB;
          }
          // Jika pangkat sama, urutkan berdasarkan nama
          return a.name.localeCompare(b.name);
        });
        
        setSupervisors(sortedData);
        setFilteredSupervisors(sortedData);
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
    const rankOrder = [
      "AKBP",
      "Kompol",
      "AKP",
      "IPTU",
      "IPDA",
      "AIPTU",
      "AIPDA"
    ];

    let filtered = supervisors;

    if (searchTerm) {
      filtered = filtered.filter(
        (sup) =>
          sup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sup.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort: ATASAN first, lalu urut pangkat, lalu nama
    filtered = filtered.sort((a, b) => {
      if (a.position_type === "ATASAN" && b.position_type !== "ATASAN") {
        return -1;
      }
      if (a.position_type !== "ATASAN" && b.position_type === "ATASAN") {
        return 1;
      }
      // Urutkan berdasarkan pangkat
      const rankA = rankOrder.indexOf(a.rank);
      const rankB = rankOrder.indexOf(b.rank);
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      // Jika pangkat sama, urutkan berdasarkan nama
      return a.name.localeCompare(b.name);
    });

    setFilteredSupervisors(filtered);
  }, [supervisors, searchTerm]);

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
      subdirectorat_id: subDirektorat[subDirektoratS].id,
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

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await handleDelete(deleteId);
      setDeleteId(null);
      setShowDeleteModal(false);
    }
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

  const cancelDelete = () => {
    setDeleteId(null);
    setShowDeleteModal(false);
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
          email: currentSupervisor.nrp + myDomain,
          password: currentSupervisor.password,
          profile: {
            name: currentSupervisor.name,
            nrp: currentSupervisor.nrp,
            rank: currentSupervisor.rank,
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
          rank: currentSupervisor.rank,
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
    <div className="space-y-5 mt-5">
      {/* Main Form */}
      <form className="my-5 flex flex-row">
        <div className="grid w-full">
          {/* Left Column - Tabs for Assessment Info & Competencies */}
          <div className="lg:col-span-3">
            <Tabs
              aria-label="Tabs Assessment"
              onActiveTabChange={(tab) => setSubDirektoratS(tab)}
              theme={{
                base: " border border-gray-200 rounded-lg bg-white shadow-sm",
                tablist: {
                  base: "gap-0",
                },
                tabitemcontainer: {
                  base: "px-5 pb-3",
                },
                tabItem: {
                  variant: {
                    default: {
                      base: "rounded-t-lg",
                      active: {
                        on: "bg-blue-800 text-primary-600 dark:bg-gray-800 dark:text-primary-500",
                        off: "text-gray-500 hover:bg-gray-50 hover:text-gray-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300",
                      },
                    },
                  },
                },
                // tabpanel: "p-0"
              }}
            >
              {subDirektorat.map((sub) => {
                return (
                  <TabItem title={sub.name}>
                    {/* Search and Filter Bar */}
                    <div className="flex flex-col sm:flex-row gap-4 rounded-lg mb-4">
                      <div className="flex-1">
                        <TextInput
                          icon={Search}
                          placeholder="Cari berdasarkan nama atau email..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Selected Items Actions */}
                    {selectedRows.length > 0 && (
                      <div className="flex items-center gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className="text-sm text-blue-700 dark:text-blue-300">
                          {selectedRows.length} item dipilih
                        </span>
                        <Button size="xs" color="failure">
                          Hapus Yang Dipilih
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
                                  selectedRows.length ===
                                    filteredSupervisors.length &&
                                  filteredSupervisors.length > 0
                                }
                                onChange={(e) =>
                                  handleSelectAll(e.target.checked)
                                }
                              />
                            </TableHeadCell>
                            <TableHeadCell>Nama</TableHeadCell>
                            <TableHeadCell>NRP</TableHeadCell>
                            <TableHeadCell>Pangkat</TableHeadCell>
                            <TableHeadCell>Jabatan</TableHeadCell>
                            <TableHeadCell>Tipe Posisi</TableHeadCell>
                            <TableHeadCell>Aksi</TableHeadCell>
                          </TableRow>
                        </TableHead>
                        <TableBody className="divide-y">
                          {filteredSupervisors.map((sup) => {
                            if (sup.subdirectorat_id == sub.id) {
                              return (
                                <TableRow
                                  key={sup.id}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                  <TableCell>
                                    <Checkbox
                                      checked={selectedRows.includes(sup.id)}
                                      onChange={(e) =>
                                        handleSelectRow(
                                          sup.id,
                                          e.target.checked
                                        )
                                      }
                                    />
                                  </TableCell>
                                  <TableCell className="font-medium text-gray-900 dark:text-white">
                                    {sup.name}
                                  </TableCell>
                                  <TableCell>{sup.nrp}</TableCell>
                                  <TableCell>{sup.rank}</TableCell>
                                  <TableCell>{sup.position}</TableCell>
                                  <TableCell>{sup.position_type}</TableCell>
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
                                        onClick={() => handleDeleteClick(sup.id)}
                                        className="flex items-center gap-1"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                        Hapus
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              );
                            }
                          })}
                        </TableBody>
                      </Table>

                      {filteredSupervisors.length === 0 && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                          Tidak ada personel ditemukan.
                        </div>
                      )}
                    </div>
                  </TabItem>
                );
              })}
            </Tabs>
          </div>
        </div>
      </form>

      <div className="w-full sm:w-48 flex flex-row gap-4 m-5"></div>

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
      {/* Modal Konfirmasi Hapus */}
      <Modal show={showDeleteModal} onClose={cancelDelete}>
        <ModalHeader>Konfirmasi Hapus</ModalHeader>
        <ModalBody>
          <div className="space-y-6">
            <p>Apakah Anda yakin ingin menghapus personel ini?</p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="red" onClick={confirmDelete}>
            Hapus
          </Button>
          <Button color="gray" onClick={cancelDelete}>
            Batal
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
});

export default StaffTable;
