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
import SubdirectoratService from "../../services/SubdirectoratsService";

import AuthService from "../../services/AuthService";
import AccountModal from "./AccountModal";
import ErrorModal from "./ErrorModal";

const AccountTable = () => {
  const [account, setAccount] = useState([]);
  const [subDirektorat, setSubDirektorat] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [supervisorsDetail, setSupervisorsDetail] = useState("show");

  const [showModal, setShowModal] = useState(false);
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
        const data = await AuthService.checkUser();
        setAccount(data);

        if (data.position_type == "ATASAN") {
          setSupervisorsDetail("hidden");
        }

        const dataSubDirektorat = await SubdirectoratService.getActive();
        setSubDirektorat(dataSubDirektorat);

        const dataSupervisors = await ProfileService.getStaff();
        setSupervisors(dataSupervisors);
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
      setErrorMessage("");
      setShowErrorModal(false);
    } catch (err) {
      setErrorMessage(err?.message || "Failed to load supervisors");
      setShowErrorModal(true);
    }
  };

  // Set ID to Competency Name
  const setToNameSubdirectorate = (id) => {
    const bobObject = subDirektorat.find((obj) => obj.id === id);
    const bobId = bobObject ? bobObject.name : undefined;

    return bobId;
  };

  const setToNameSupervisor = (id) => {
    const bobObject = supervisors.find((obj) => obj.id === id);
    const bobId = bobObject ? bobObject.name : undefined;

    return bobId;
  };

  const handleEdit = (supervisor) => {
    setCurrentSupervisor(supervisor);
    setShowModal(true);
  };

  const handleModalChange = (updated) => {
    setCurrentSupervisor(updated);
  };

  const handleSave = async () => {
    setModalError("");
    try {
      await AuthService.updatePassword(currentSupervisor.password);
      const data = await ProfileService.getStaff();
      setSupervisors(data);
      setShowModal(false);
    } catch (err) {
      setModalError(err?.message || "Failed to edit password");
      setShowModal(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
          <UserCheck className="mr-3 text-blue-600 dark:text-blue-400" />
          My Account
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
        </div>
      </div>
      <div className="m-10">
        <p className="font-medium text-gray-900 dark:text-white">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </p>
      </div>
      <div className="flex flex-col mx-13 my-5">
        <div className="flex flex-col mb-3">
          <p className="font-medium text-gray-900 dark:text-white">Name</p>
          <p className="font-medium text-gray-600 dark:text-white">
            {account.name}
          </p>
        </div>
        <div className="flex flex-col mb-3">
          <p className="font-medium text-gray-900 dark:text-white">NRP</p>
          <p className="font-medium text-gray-600 dark:text-white">
            {account.nrp}
          </p>
        </div>
        <div className="flex flex-col mb-3">
          <p className="font-medium text-gray-900 dark:text-white">Pangkat</p>
          <p className="font-medium text-gray-600 dark:text-white">
            {account.rank}
          </p>
        </div>
        <div className="flex flex-col mb-3">
          <p className="font-medium text-gray-900 dark:text-white">Jabatan</p>
          <p className="font-medium text-gray-600 dark:text-white">
            {account.position}
          </p>
        </div>
        <div className="flex flex-col mb-3">
          <p className="font-medium text-gray-900 dark:text-white">Position</p>
          <p className="font-medium text-gray-600 dark:text-white">
            {account.position_type}
          </p>
        </div>
        <div className="flex flex-col mb-3">
          <p className="font-medium text-gray-900 dark:text-white">
            Subdirectorate
          </p>
          <p className="font-medium text-gray-600 dark:text-white">
            {setToNameSubdirectorate(account.subdirectorat_id)}
          </p>
        </div>
        <div
          id="supervisorDetail"
          className={supervisorsDetail + " flex flex-col"}
        >
          <p className="font-medium text-gray-900 dark:text-white">
            Supervisors
          </p>
          <p className="font-medium text-gray-600 dark:text-white">
            {setToNameSupervisor(account.supervisor_id)}
          </p>
        </div>
      </div>

      <Button
        size="xs"
        color="light"
        onClick={() => handleEdit(account)}
        className="flex items-center gap-1 m-10"
      >
        <Pencil className="w-3 h-3" />
        Edit Password
      </Button>

      {/* Modal for Add/Edit */}
      <AccountModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setModalError("");
        }}
        staff={currentSupervisor}
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

export default AccountTable;
