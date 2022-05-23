/* eslint-disable */
/* tslint:disable */
import React, { useCallback, useState } from 'react';
import { Modal } from '@grafana/ui';
import { IirisMaintenanceTable } from './IirisMaintenanceTable';

interface Props {
  show: boolean;
  onDismiss?(): void;
  onCreateMaintenance?(): void;
  allMaintenances: any[];
  openMaintenanceModal?(): void;
  onStopMaintenance?(): void;
  onEditMaintenance?(): void;
  ongoingMaintenanceIds?: any[];
  selectedMaintenanceId?: string[];
  confirmIsVisible?: boolean;
  confirmText?: string;
  confirmAction?: string;
  children: (api: any) => JSX.Element;
}

export function IirisMaintenanceListModal(props: Props) {
  const [show, setShow] = useState(props.show);
  const showModal = useCallback(() => setShow(true), [setShow]);
  const onClose = useCallback(() => setShow(false), [setShow]);
  const title = (<h2 className="modal-header">Tulevat huollot</h2>);
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
  ]

  return (
    <>
      <Modal isOpen={show} title={title} onDismiss={onClose} className="modal modal-body">
        <div className="modal-content">
          <IirisMaintenanceTable data={props.allMaintenances} columns={columns} />
        </div>
      </Modal>
      {props.children({ showModal })}
    </>
  );
}
