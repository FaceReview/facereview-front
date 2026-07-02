import React, { ReactElement, useEffect } from 'react';
import ReactModal from 'react-modal';
import './modaldialog.scss';

type ModalDialogPropTypes = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  contentLabel?: string;
};

const ModalDialog = ({
  children,
  isOpen,
  onClose,
  contentLabel = '대화상자',
}: ModalDialogPropTypes): ReactElement => {
  // Bind react-modal to the app root so it can manage aria-hidden on the rest of the app.
  useEffect(() => {
    const el = document.getElementById('root');
    if (el) ReactModal.setAppElement(el);
  }, []);

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="modal-dialog"
      overlayClassName="modal-overlay"
      contentLabel={contentLabel}
      aria={{
        labelledby: undefined,
        describedby: undefined,
      }}>
      {children}
    </ReactModal>
  );
};

export default ModalDialog;
