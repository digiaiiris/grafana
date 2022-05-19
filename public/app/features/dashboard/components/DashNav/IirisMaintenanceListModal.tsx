import React from 'react';
import { Modal } from '@grafana/ui';

interface Props {
  onDismiss(): void;
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
}

interface State {}

export class IirisMaintenanceListModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
  }

  onDismiss = () => {
    this.props.onDismiss();
  };

  renderTitle() {
    return <div className="iiris-modal-title-text">{'Tulevat huollot'}</div>;
  }

  render() {
    const { allMaintenances } = this.props;
    return (
      <Modal isOpen={true} title={this.renderTitle()} onDismiss={this.onDismiss} className="iiris-modal-box">
        <div className="iiris-modal-content">
          {allMaintenances && allMaintenances.length > 0 ? (
            allMaintenances.map((maintenance: any, index: number) => {
              return (
                <div className="iiris-modal-text-block" key={'modalblock' + index}>
                  <div className="iiris-modal-text-row">
                    <div className="iiris-modal-text-label">{'Kuvaus:'}</div>
                    <div className="iiris-modal-text-normal">{maintenance.description}</div>
                  </div>
                  <div className="iiris-modal-text-row">
                    <div className="iiris-modal-text-label">{'Käynnistäjä:'}</div>
                    <div className="iiris-modal-text-normal">{maintenance.caller}</div>
                  </div>
                  <div className="iiris-modal-text-row">
                    <div className="iiris-modal-text-label">{'Alkoi:'}</div>
                    <div className="iiris-modal-text-normal">{maintenance.startTime}</div>
                  </div>
                  <div className="iiris-modal-text-row">
                    <div className="iiris-modal-text-label">{'Päättyy:'}</div>
                    <div className="iiris-modal-text-normal">{maintenance.endTime}</div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="iiris-modal-text-block">
              <div className="iiris-modal-sub-title">Ei tietoja</div>
            </div>
          )}
        </div>
      </Modal>
    );
  }
}
