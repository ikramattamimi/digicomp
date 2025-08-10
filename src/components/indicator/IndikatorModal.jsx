import React from 'react';

import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Label, TextInput, Select } from 'flowbite-react';

const  IndikatorModal = ({ show, onClose, modalType, indikator, kompetensi, onChange, onSave, error }) => (
  <Modal show={show} onClose={onClose}>
    <ModalHeader>
      {modalType === 'add' ? 'Add New Sub Dimensi' : 'Edit Sub Dimensi'}
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
            value={indikator.name}
            onChange={e => onChange({ ...indikator, name: e.target.value })}
            placeholder="Enter Sub Dimensi name"
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="description" value="Description" />
          </div>
          <TextInput
            id="description"
            value={indikator.description}
            onChange={e => onChange({ ...indikator, description: e.target.value })}
            placeholder="Enter Sub Dimensi description"
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="description" value="Description" />
          </div>
          <TextInput
            id="statement"
            value={indikator.statement_text}
            onChange={e => onChange({ ...indikator, statement_text: e.target.value })}
            placeholder="Enter indicator statement"
            required
          />
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="is_active" value="Active" />
          </div>
          <Select
            id="competency"
            value={indikator.competency_id}
            onChange={e => onChange({ ...indikator, competency_id: e.target.value })}
            required
          >
            <option value={0}>Select competency</option>
            {kompetensi.map((sup) => (
              <option value={sup.id}>{sup.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <div className="mb-2 block">
            <Label htmlFor="is_active" value="Active" />
          </div>
          <Select
            id="is_active"
            value={indikator.is_active === false ? 'false' : 'true'}
            onChange={e => onChange({ ...indikator, is_active: e.target.value === 'true' })}
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
        {modalType === 'add' ? 'Add Sub Dimensi' : 'Update Sub Dimensi'}
      </Button>
      <Button color="alternative" onClick={onClose}>
        Cancel
      </Button>
    </ModalFooter>
  </Modal>
);

export default IndikatorModal;
