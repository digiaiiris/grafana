/* eslint-disable */
/* tslint:disable */
import React from 'react';
import { Modal } from '@grafana/ui';

interface Props {
  show: boolean;
  onDismiss(): void;
  confirmText: string;
  confirmTitle: string;
}

export function IirisMaintenanceConfirmModal(props: Props) {
  const title = (<h2 className="modal-header modal-header-title">{props.confirmTitle}</h2>);
  return (
    <>
      <Modal isOpen={props.show} title={title} onDismiss={props.onDismiss} className="modal modal-body">
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
