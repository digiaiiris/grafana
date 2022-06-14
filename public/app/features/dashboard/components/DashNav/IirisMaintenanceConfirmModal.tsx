/* eslint-disable */
/* tslint:disable */
import React from 'react';
import { Modal } from '@grafana/ui';

interface Props {
  show: boolean;
  onDismiss(): void;
  confirmText: string;
}

export function IirisMaintenanceConfirmModal(props: Props) {
  return (
    <>
      <Modal isOpen={props.show} title='' onDismiss={props.onDismiss} className="modal modal-body">
        <div className="modal-content">
          <div className="remove-maintenance-confirmation-text">{ props.confirmText }</div>
          <div className="gf-form-button-row">
            <a className="btn btn-primary" onClick={() => props.onDismiss()}>OK</a>
          </div>
        </div>
      </Modal>
    </>
  );
}
