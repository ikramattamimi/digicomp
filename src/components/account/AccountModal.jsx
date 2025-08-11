import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label, TextInput, Select } from 'flowbite-react';

const AccountModal = ({ show, onClose, staff, onChange, onSave, error }) => (
  <Modal show={show} onClose={onClose}>
    <ModalHeader>
      Edit password
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
            <Label htmlFor="password" value="password" />
          </div>
          <TextInput
            id="password"
            type="password"
            value={staff.password || ''}
            onChange={e => onChange({ ...staff, password: e.target.value })}
            placeholder="Enter new password"
            required
          />
        </div>
        
      </div>
    </ModalBody>
    <ModalFooter>
      <Button onClick={onSave}>
        Update password
      </Button>
      <Button color="alternative" onClick={onClose}>
        Cancel
      </Button>
    </ModalFooter>
  </Modal>
);

export default AccountModal;
