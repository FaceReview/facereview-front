import React, { ReactElement } from 'react';
import ReactModal from 'react-modal';
import './modaldialog.scss';
import './modaldialogchildren.scss';
import Button from 'components/Button/Button';
const Modal = ReactModal;

type ModalDialogPropTypes = {
  children: React.ReactNode;
  type: 'one-button' | 'two-button';
  name: string;
  isOpen: boolean;
  onClose: () => void;
  onCheck?: () => void;
};

const ModalDialog = ({
  children,
  type,
  name,
  isOpen,
  onClose,
  onCheck,
}: ModalDialogPropTypes): ReactElement => {
  const renderButtons = () => {
    if (type === 'one-button') {
      return (
        <div className={`modal-button-wrapper ${type} ${name}`}>
          <Button
            label={'확인'}
            type={'cta-full'}
            onClick={() => {
              onClose();
              if (onCheck) onCheck();
            }}
          />
        </div>
      );
    } else if (type === 'two-button') {
      return (
        <div className={`modal-button-wrapper ${type} ${name}`}>
          <Button
            label={'취소'}
            type={'cta-fixed-secondary'}
            style={{ marginRight: '12px', background: '#5D5D6D' }}
            onClick={onClose}
          />
          <Button label={'확인'} type={'cta-fixed'} onClick={onCheck} />
        </div>
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className={`modal-content ${type} ${name}`}
      overlayClassName="modal-overlay">
      <div className={`modal-contents-container ${type} ${name}`}>
        {children}
      </div>
      {renderButtons()}
    </Modal>
  );
};

export default ModalDialog;
