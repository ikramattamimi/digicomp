import React from 'react';
import { Modal, ModalBody, Spinner } from 'flowbite-react';

const LoadingModal = ({ show, message = 'Memproses...', subtitle = 'Mohon tunggu sebentar...' }) => (
  <Modal show={show} size="sm" popup={true}>
    <ModalBody className="text-center py-8">
      <div className="flex flex-col items-center space-y-4">
        <Spinner size="xl" />
        <div className="text-lg font-medium text-gray-900 dark:text-white">
          {message}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {subtitle}
        </div>
      </div>
    </ModalBody>
  </Modal>
);

export default LoadingModal;