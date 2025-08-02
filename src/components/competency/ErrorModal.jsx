import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'flowbite-react';
import { XCircle } from 'lucide-react';

const ErrorModal = ({ show, message, onClose }) => (
  <Modal show={show} onClose={onClose} size="md" popup>
    <ModalHeader />
        <ModalBody>
          <div className="text-center">
            <XCircle className="mx-auto mb-4 h-14 w-14 text-red-500 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              {message}
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="red" onClick={() => onClose()}>
                Close
              </Button>
            </div>
          </div>
        </ModalBody>
  </Modal>
);

export default ErrorModal;
