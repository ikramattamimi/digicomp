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
}) => (
  <Modal show={show} onClose={onClose}>
    <ModalHeader>
      {modalType === "add" ? "Add New Personel" : "Edit Personel"}
    </ModalHeader>
    <ModalBody>
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-100 rounded px-3 py-2">
          {error}
        </div>
      )}
      <div className="space-y-6">
        <div>
          <div className="mb-2 block">
            <Label htmlFor="name">Name</Label>
          </div>
          <TextInput
            id="name"
            value={staff.name}
            onChange={(e) => onChange({ ...staff, name: e.target.value })}
            placeholder="Enter Personel name"
            required
          />
        </div>

        <div>
          <div className="mb-2 block">
            <Label htmlFor="password" value="password" />
          </div>
          <TextInput
            id="password"
            type="password"
            value={staff.password || ""}
            onChange={(e) => onChange({ ...staff, password: e.target.value })}
            placeholder={
              modalType === "add" ? "Enter Password" : "Enter New Password"
            }
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="nrp" value="NRP" />
          </div>
          <TextInput
            id="nrp"
            value={staff.nrp || ""}
            onChange={(e) => onChange({ ...staff, nrp: e.target.value })}
            placeholder="Enter NRP"
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="nrp" value="NRP" />
          </div>
          <TextInput
            id="rank"
            value={staff.rank || ""}
            onChange={(e) => onChange({ ...staff, rank: e.target.value })}
            placeholder="Enter Pangkat"
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="position">Position</Label>
          </div>
          <TextInput
            id="position"
            value={staff.position || ""}
            onChange={(e) => onChange({ ...staff, position: e.target.value })}
            placeholder="Enter position"
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="is_active" value="Active" />
          </div>
          <Select
            id="subdirectorat_id"
            value={staff.subdirectorat_id || ""}
            onChange={(e) =>
              onChange({ ...staff, subdirectorat_id: e.target.value })
            }
            required
          >
            <option value={0}>Select subsatker</option>
            {subDirectorat.map((sup) => (
              <option value={sup.id}>{sup.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="position_type" value="Position Type" />
          </div>
          <Select
            id="position_type"
            value={staff.position_type || ""}
            onChange={(e) =>
              onChange(
                { ...staff, position_type: e.target.value },
                document.getElementById("form_supervisorid")
              )
            }
            required
          >
            <option value="">Select Type</option>
            <option value="ATASAN">ATASAN</option>
            <option value="BAWAHAN">BAWAHAN</option>
          </Select>
        </div>
        <div id="form_supervisorid" class={supervisorForm}>
          <div className="mb-2 block">
            <Label htmlFor="is_active" value="Active" />
          </div>
          <Select
            id="supervisor_id"
            value={staff.supervisor_id || ""}
            onChange={(e) =>
              onChange({ ...staff, supervisor_id: e.target.value })
            }
            required
          >
            <option value={0}>Select supervisor</option>
            {supervisor.map((sup) => {
              if (sup.position_type == "ATASAN") {
                return <option value={sup.id}>{sup.name}</option>;
              }
            })}
          </Select>
        </div>
      </div>
    </ModalBody>
    <ModalFooter>
      <Button onClick={onSave}>
        {modalType === "add" ? "Add Personel" : "Update Personel"}
      </Button>
      <Button color="alternative" onClick={onClose}>
        Cancel
      </Button>
    </ModalFooter>
  </Modal>
);

export default StaffModal;
