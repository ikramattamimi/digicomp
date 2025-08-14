import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from 'flowbite-react';

const ErrorModal = ({ 
  show, 
  onClose, 
  title = 'Error', 
  message, 
  buttonText = 'OK',
  buttonColor = 'red'
}) => (
  <Modal show={show} onClose={onClose} size="md">
    <ModalHeader>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path 
              fillRule="evenodd" 
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        </div>
        <span className="text-red-800">{title}</span>
      </div>
    </ModalHeader>
    <ModalBody>
      <p className="text-gray-700 dark:text-gray-300">{message}</p>
    </ModalBody>
    <ModalFooter>
      <Button color={buttonColor} onClick={onClose}>
        {buttonText}
      </Button>
    </ModalFooter>
  </Modal>
);

export default ErrorModal;