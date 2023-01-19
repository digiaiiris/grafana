/* eslint-disable */
/* tslint:disable */
import React from 'react';
import { Modal } from '@grafana/ui';
import { IirisMaintenanceTable } from './IirisMaintenanceTable';
import { contextSrv } from 'app/core/core';

interface Props {
  show: boolean;
  onDismiss(): void;
  allMaintenances: any[];
  openMaintenanceModal(): void;
  onStopMaintenance(maintenanceId: string): void;
  onEditMaintenance(maintenanceId: string): void;
  ongoingMaintenanceIds: string[];
  selectedMaintenanceId?: string;
  confirmIsVisible: boolean;
  confirmText: string;
  confirmAction: any;
  onCloseConfirmation: () => void;
}

export function IirisMaintenanceListModal(props: Props) {
  const texts = contextSrv.getLocalizedTexts();
  const title = (<h2 className="modal-header modal-header-title">{texts.upcomingMaintenances}</h2>);
  const columns = [
    {
      Header: texts.type,
      accessor: 'maintenanceTypeString', 
    }, {
      Header: texts.description,
      accessor: 'description',
    }, {
      Header: texts.createdBy,
      accessor: 'caller',
    }, {
      Header: texts.startTime,
      accessor: 'startTimeString',
    }, {
      Header: texts.endTime,
      accessor: 'endTimeString',
    }, {
      Header: texts.duration,
      accessor: 'durationString',
    }, {
      Header: texts.repeatEnds,
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
                    ongoingMaintenanceIds={props.ongoingMaintenanceIds}
                  />
                </div>
              </div>
              <div className="gf-form-button-row">
                <a className="btn btn-primary" onClick={() => props.onDismiss()}>{texts.cancel}</a>
                <a className="btn btn-secondary" onClick={() => showMaintenanceModal()}>{texts.createNewMaintenance}</a>
              </div>
            </>
          ) : (
            <div>
              <div className="remove-maintenance-confirmation-text">{ props.confirmText }</div>
              <div className="gf-form-button-row">
                { props.confirmAction ? (
                  <a className="btn btn-secondary" onClick={() => props.onCloseConfirmation()}>{texts.cancel}</a>
                ) : null }
                <a className="btn btn-primary" onClick={() => onAcceptConfirmation()}>{texts.ok}</a>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
