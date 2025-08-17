import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Alert,
  Spinner,
} from "flowbite-react";
import {
  UserCheck,
  RefreshCw,
  Edit,
  User,
  Shield,
  Building,
  Users,
} from "lucide-react";
import ProfileService from "../../services/ProfileService";
import SubdirectoratService from "../../services/SubdirectoratsService";
import AuthService from "../../services/AuthService";
import AccountModal from "./AccountModal";
import ErrorModal from "./ErrorModal";
import PageHeader from "../common/PageHeader";

const AccountTable = () => {
  const [account, setAccount] = useState({});
  const [subDirektorat, setSubDirektorat] = useState([]);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [currentSupervisor, setCurrentSupervisor] = useState({
    name: "",
    email: "",
  });
  const [modalError, setModalError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    loadAccountData();
  }, []);

  const loadAccountData = async () => {
    try {
      setLoading(true);
      const data = await AuthService.checkUser();
      setAccount(data);

      const dataSubDirektorat = await SubdirectoratService.getActive();
      setSubDirektorat(dataSubDirektorat);

      const dataSupervisors = await ProfileService.getStaff();
      setSupervisors(dataSupervisors);
    } catch (err) {
      console.error("Failed to fetch account data:", err);
      setErrorMessage(err?.message || "Failed to load account data");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await loadAccountData();
  };

  const setToNameSubdirectorate = (id) => {
    const bobObject = subDirektorat.find((obj) => obj.id === id);
    return bobObject ? bobObject.name : "-";
  };

  const setToNameSupervisor = (id) => {
    const bobObject = supervisors.find((obj) => obj.id === id);
    return bobObject ? bobObject.name : "-";
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
      setShowModal(false);
      // Optionally refresh data
      await loadAccountData();
    } catch (err) {
      setModalError(err?.message || "Failed to edit password");
    }
  };

  const InfoItem = ({ icon: Icon, label, value, className = "" }) => (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
        <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-base text-gray-900 dark:text-white mt-1">{value || "-"}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
          <span className="ml-3 text-base">Memuat data akun...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        breadcrumbs={[
          { label: "Dashboard", href: "/", icon: User },
          { label: "Akun Saya", icon: UserCheck }
        ]}
        title="Akun Saya"
        subtitle="Kelola informasi akun dan keamanan profil Anda"
        customActions={[
          {
            type: 'button',
            label: 'Refresh',
            icon: RefreshCw,
            color: 'gray',
            onClick: handleRefresh,
          },
        ]}
        showCreateButton={false}
        showExportButton={false}
      />

      {/* Error Alert */}
      {errorMessage && (
        <Alert color="failure" onDismiss={() => setErrorMessage("")}>
          <span className="font-medium">Error!</span> {errorMessage}
        </Alert>
      )}

      {/* Account Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <Card className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Informasi Personal
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem
              icon={User}
              label="Nama Lengkap"
              value={account.name}
            />
            <InfoItem
              icon={Shield}
              label="NRP"
              value={account.nrp}
            />
            <InfoItem
              icon={UserCheck}
              label="Pangkat"
              value={account.rank}
            />
            <InfoItem
              icon={Building}
              label="Jabatan"
              value={account.position}
            />
          </div>
        </Card>

        {/* Organizational Information */}
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Building className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Informasi Organisasi
            </h3>
          </div>

          <div className="space-y-4">
            <InfoItem
              icon={Shield}
              label="Tipe Posisi"
              value={account.position_type}
            />
            <InfoItem
              icon={Building}
              label="Sub Direktorat"
              value={setToNameSubdirectorate(account.subdirectorat_id)}
            />
            {account.position_type !== "ATASAN" && (
              <InfoItem
                icon={Users}
                label="Atasan"
                value={setToNameSupervisor(account.supervisor_id)}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Account Actions */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
            <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Keamanan Akun
          </h3>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
              Ubah password untuk menjaga keamanan akun Anda. Pastikan menggunakan 
              password yang kuat dengan kombinasi huruf, angka, dan karakter khusus.
            </p>
            <Button
              color="blue"
              onClick={() => handleEdit(account)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Ubah Password
            </Button>
          </div>
        </div>
      </Card>

      {/* Account Modal */}
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

      {/* Error Modal */}
      <ErrorModal
        show={showErrorModal}
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
};

export default AccountTable;