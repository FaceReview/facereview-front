import React, { ReactElement } from 'react';
import ReactModal from 'react-modal';
import './modaldialog.scss';

type ModalDialogPropTypes = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
};

const ModalDialog = ({
  children,
  isOpen,
  onClose,
}: ModalDialogPropTypes): ReactElement => {
  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-dialog"
      overlayClassName="modal-overlay">
      {children}
    </ReactModal>
  );
};

export default ModalDialog;
