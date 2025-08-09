import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label, TextInput, Select } from 'flowbite-react';

const StaffModal = ({ show, onClose, modalType, supervisor, subDirectorat, onChange, onSave, error }) => (
  <Modal show={show} onClose={onClose}>
    <ModalHeader>
      {modalType === 'add' ? 'Add New Supervisor' : 'Edit Supervisor'}
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
            value={supervisor.name}
            onChange={e => onChange({ ...supervisor, name: e.target.value })}
            placeholder="Enter supervisor name"
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="email">Email</Label>
          </div>
          <TextInput
            id="email"
            type="email"
            value={supervisor.email || ''}
            onChange={e => onChange({ ...supervisor, email: e.target.value })}
            placeholder="Enter email address"
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="nrp">NRP</Label>
          </div>
          <TextInput
            id="nrp"
            value={supervisor.nrp || ''}
            onChange={e => onChange({ ...supervisor, nrp: e.target.value })}
            placeholder="Enter NRP"
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="position">Position</Label>
          </div>
          <TextInput
            id="position"
            value={supervisor.position || ''}
            onChange={e => onChange({ ...supervisor, position: e.target.value })}
            placeholder="Enter position"
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="position_type">Position Type</Label>
          </div>
          <Select
            id="position_type"
            value={supervisor.position_type || ''}
            onChange={e => onChange({ ...supervisor, position_type: e.target.value })}
            required
          >
            <option value="">Select Type</option>
            <option value="ATASAN">ATASAN</option>
            <option value="BAWAHAN">BAWAHAN</option>
          </Select>
        </div>

        <div>
          <div className="mb-2 block">
            <Label htmlFor="is_active">Active</Label>
          </div>
            <Select
              id="subdirectorat_id"
              value={supervisor.subdirectorat_id || ''}
              onChange={e => onChange({ ...supervisor, subdirectorat_id: e.target.value })}
              required
              >
              <option value={0}>Select sub directorate</option>
              {subDirectorat.map((sup) => (
              <option value={sup.id}>{sup.name}</option>
              ))}
            </Select>
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="supervisor_id">Supervisor ID</Label>
          </div>
          <TextInput
            id="supervisor_id"
            value={supervisor.supervisor_id || ''}
            onChange={e => onChange({ ...supervisor, supervisor_id: e.target.value })}
            placeholder="Enter supervisor ID"
          />
        </div>
      </div>
    </ModalBody>
    <ModalFooter>
      <Button onClick={onSave}>
        {modalType === 'add' ? 'Add Supervisor' : 'Update Supervisor'}
      </Button>
      <Button color="alternative" onClick={onClose}>
        Cancel
      </Button>
    </ModalFooter>
  </Modal>
);

export default StaffModal;
