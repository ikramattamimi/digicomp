import React from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Label,
  TextInput,
  Select,
} from "flowbite-react";

const StaffModal = ({
  show,
  onClose,
  modalType,
  supervisorForm,
  staff,
  supervisor,
  subDirectorat,
  onChange,
  onSave,
  error,
}) => {
  // Function to get supervisor for current subdirectorate
  const getSubdirectorateSupervisor = () => {
    return supervisor.find(
      (sup) =>
        sup.position_type === "ATASAN" &&
        sup.subdirectorat_id === staff.subdirectorat_id
    );
  };

  const handlePositionTypeChange = (positionType) => {
    let updatedStaff = { ...staff, position_type: positionType };

    // Auto-assign supervisor for BAWAHAN in the same subdirectorate
    if (positionType === "BAWAHAN") {
      const subdirectorateSupervisor = getSubdirectorateSupervisor();
      if (subdirectorateSupervisor) {
        updatedStaff = {
          ...updatedStaff,
          supervisor_id: subdirectorateSupervisor.id,
        };
      }
    } else if (positionType === "ATASAN") {
      updatedStaff = { ...updatedStaff, supervisor_id: null };
    }

    onChange(updatedStaff);
  };

  return (
    <Modal show={show} onClose={onClose} size="4xl">
      <ModalHeader>
        {modalType === "add" ? "Tambah Personel Baru" : "Edit Personel"}
      </ModalHeader>
      <ModalBody>
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 rounded px-3 py-2">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Kolom Kiri */}
          <div className="space-y-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="name">Nama</Label>
              </div>
              <TextInput
                id="name"
                value={staff.name}
                onChange={(e) => onChange({ ...staff, name: e.target.value })}
                placeholder="Masukkan nama personel"
                required
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="password">Kata Sandi</Label>
              </div>
              <TextInput
                id="password"
                type="password"
                value={staff.password || ""}
                onChange={(e) => onChange({ ...staff, password: e.target.value })}
                placeholder={
                  modalType === "add" ? "Masukkan kata sandi" : "Masukkan kata sandi baru"
                }
                required
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="nrp">NRP</Label>
              </div>
              <TextInput
                id="nrp"
                value={staff.nrp || ""}
                onChange={(e) => onChange({ ...staff, nrp: e.target.value })}
                placeholder="Masukkan NRP"
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="rank">Pangkat</Label>
              </div>
              <TextInput
                id="rank"
                value={staff.rank || ""}
                onChange={(e) => onChange({ ...staff, rank: e.target.value })}
                placeholder="Masukkan pangkat"
              />
            </div>
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="position">Jabatan</Label>
              </div>
              <TextInput
                id="position"
                value={staff.position || ""}
                onChange={(e) => onChange({ ...staff, position: e.target.value })}
                placeholder="Masukkan jabatan"
              />
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="subdirectorat_id">Subsatker</Label>
              </div>
              <Select
                id="subdirectorat_id"
                value={staff.subdirectorat_id || ""}
                onChange={(e) =>
                  onChange({ ...staff, subdirectorat_id: e.target.value })
                }
                required
              >
                <option value={0}>Pilih subsatker</option>
                {subDirectorat.map((sup) => (
                  <option key={sup.id} value={sup.id}>{sup.name}</option>
                ))}
              </Select>
            </div>

            <div>
              <div className="mb-2 block">
                <Label htmlFor="position_type">Tipe Posisi</Label>
              </div>
              <Select
                id="position_type"
                value={staff.position_type || ""}
                onChange={(e) => handlePositionTypeChange(e.target.value)}
                required
              >
                <option value="">Pilih tipe posisi</option>
                <option value="ATASAN">ATASAN</option>
                <option value="BAWAHAN">BAWAHAN</option>
              </Select>
            </div>

            {/* Show supervisor info for BAWAHAN */}
            {staff.position_type === "BAWAHAN" && (
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Atasan akan otomatis diatur ke:{" "}
                  {getSubdirectorateSupervisor()?.name ||
                    "Belum ada ATASAN di subsatker ini"}
                </Label>
              </div>
            )}
          </div>
        </div>

        {/* Hidden supervisor selection - always hidden */}
        <div style={{ display: 'none' }}>
          <Select
            id="supervisor_id"
            value={staff.supervisor_id || ""}
            onChange={(e) =>
              onChange({ ...staff, supervisor_id: e.target.value })
            }
          >
            <option value={0}>Pilih atasan</option>
            {supervisor.map((sup) => {
              if (sup.position_type === "ATASAN") {
                return (
                  <option value={sup.id} key={sup.id}>
                    {sup.name}
                  </option>
                );
              }
            })}
          </Select>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button onClick={onSave}>
          {modalType === "add" ? "Tambah Personel" : "Update Personel"}
        </Button>
        <Button color="alternative" onClick={onClose}>
          Batal
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default StaffModal;
