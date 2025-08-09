import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label, TextInput, Select } from 'flowbite-react';

const  SubDirektoratModal = ({ show, onClose, modalType, subDirektorat, onChange, onSave, error }) => (
  <Modal show={show} onClose={onClose}>
    <ModalHeader>
      {modalType === 'add' ? 'Add New Sub Direktorat' : 'Edit Sub Direktorat'}
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
            value={subDirektorat.name}
            onChange={e => onChange({ ...subDirektorat, name: e.target.value })}
            placeholder="Enter sub direktorat name"
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="is_active">Active</Label>
          </div>
          <Select
            id="is_active"
            value={subDirektorat.is_active === false ? 'false' : 'true'}
            onChange={e => onChange({ ...subDirektorat, is_active: e.target.value === 'true' })}
            required
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
        </div>
      </div>
    </ModalBody>
    <ModalFooter>
      <Button onClick={onSave}>
        {modalType === 'add' ? 'Add sub direktorat' : 'Update sub direktorat'}
      </Button>
      <Button color="alternative" onClick={onClose}>
        Cancel
      </Button>
    </ModalFooter>
  </Modal>
);

export default SubDirektoratModal;
