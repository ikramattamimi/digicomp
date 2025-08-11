import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label, TextInput, Select } from 'flowbite-react';

const AdminModal = ({ show, onClose, modalType, admin, onChange, onSave, error }) => (
  <Modal show={show} onClose={onClose}>
    <ModalHeader>
      {modalType === 'add' ? 'Add New Admin' : 'Edit Admin'}
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
            <Label htmlFor="name" value="Name" />
          </div>
          <TextInput
            id="name"
            value={admin.name}
            onChange={e => onChange({ ...admin, name: e.target.value })}
            placeholder="Enter Admin name"
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="email" value="Email" />
          </div>
          <TextInput
            id="email"
            type="email"
            value={admin.email || ''}
            onChange={e => onChange({ ...admin, email: e.target.value })}
            placeholder="Enter email address"
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
            value={admin.password || ''}
            onChange={e => onChange({ ...admin, password: e.target.value })}
            placeholder={modalType === 'add' ? 'Enter Password' : 'Enter New Password'}
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="is_active" value="Active" />
          </div>
          <Select
            id="is_active"
            value={admin.is_active === false ? 'false' : 'true'}
            onChange={e => onChange({ ...admin, is_active: e.target.value === 'true' })}
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
        {modalType === 'add' ? 'Add Admin' : 'Update Admin'}
      </Button>
      <Button color="alternative" onClick={onClose}>
        Cancel
      </Button>
    </ModalFooter>
  </Modal>
);

export default AdminModal;
