/* eslint-disable */
/* tslint:disable */
import React from 'react';
import { Modal } from '@grafana/ui';
import { IirisMaintenanceTable } from './IirisMaintenanceTable';

interface Props {
  show: boolean;
  onDismiss(): void;
  allMaintenances: any[];
  openMaintenanceModal(): void;
  onStopMaintenance(maintenanceId: string): void;
  onEditMaintenance(maintenanceId: string): void;
  ongoingMaintenanceIds?: any[];
  selectedMaintenanceId?: string;
  confirmIsVisible: boolean;
  confirmText: string;
  confirmAction: any;
  onCloseConfirmation: () => void;
}

export function IirisMaintenanceListModal(props: Props) {
  const title = (<h2 className="modal-header modal-header-title">Tulevat huollot</h2>);
  const columns = [
    {
      Header: 'Tyyppi',
      accessor: 'maintenanceTypeString', 
    }, {
      Header: 'Kuvaus',
      accessor: 'description',
    }, {
      Header: 'Käynnistäjä',
      accessor: 'caller',
    }, {
      Header: 'Aloitusaika',
      accessor: 'startTimeString',
    }, {
      Header: 'Päätösaika',
      accessor: 'endTimeString',
    }, {
      Header: 'Kesto',
      accessor: 'durationString',
    }, {
      Header: 'Toisto päättyy',
      accessor: 'activeTillString',
    }
  ];
  const showMaintenanceModal = () => {
    props.onDismiss();
    props.openMaintenanceModal();
  };
  const onAcceptConfirmation = () => {
    props.confirmAction(props.selectedMaintenanceId);
    props.onCloseConfirmation();
  };

  return (
    <>
      <Modal isOpen={props.show} title={title} onDismiss={props.onDismiss} className="modal modal-body">
        <div className="modal-content">
          { !props.confirmIsVisible ? (
            <>
              <div className="iiris-table-container">
                <div className="iiris-event-table">
                  <IirisMaintenanceTable
                    data={props.allMaintenances}
                    columns={columns}
                    onEditMaintenance={props.onEditMaintenance}
                    onStopMaintenance={props.onStopMaintenance}
                  />
                </div>
              </div>
              <div className="gf-form-button-row">
                <a className="btn btn-primary" onClick={() => props.onDismiss()}>Peruuta</a>
                <a className="btn btn-secondary" onClick={() => showMaintenanceModal()}>Luo uusi huolto</a>
              </div>
            </>
          ) : (
            <div>
              <div className="remove-maintenance-confirmation-text">{ props.confirmText }</div>
              <div className="gf-form-button-row">
                { props.confirmAction ? (
                  <a className="btn btn-secondary" onClick={() => props.onCloseConfirmation()}>Peruuta</a>
                ) : null }
                <a className="btn btn-primary" onClick={() => onAcceptConfirmation()}>OK</a>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
