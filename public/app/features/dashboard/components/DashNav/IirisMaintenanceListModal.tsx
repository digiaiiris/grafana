/**
 * Maintenance list modal dialog that shows all the maintenances and allows
 * the user to create a new maintenance, edit an existing one or stop an ongoing maintenance.
 */

import { DateTime } from 'luxon';
import React from 'react';

import { AppEvents } from '@grafana/data';
import { ConfirmModal, Modal } from '@grafana/ui';
import appEvents from 'app/core/app_events';
import { contextSrv } from 'app/core/core';

import { IirisMaintenanceEditWizard } from './IirisMaintenanceEditWizard';
import {
  getZabbixDataSource,
  getMaintenances,
  Maintenance,
  MaintenanceType,
  fetchHostsAndGroups,
} from './IirisMaintenanceModel';
import { IirisMaintenanceTable } from './IirisMaintenanceTable';

// Modal dialog shown currently
enum ShownDialog {
  None = 0,
  MaintenanceEditWizard,
  CancelOneTimeOngoingMaintenance,
  DeleteOneTimeMaintenance,
  CancelPeriodicOngoingMaintenance,
  DeletePeriodicMaintenance,
}

interface Props {
  show: boolean; // Show the maintenance list modal dialog or not
  onDismiss(): void; // Hide the dialog
  hostGroup: string | undefined; // Configured host group; if not defined fetch all maintenances regardless of hosts
  zabbixDataSource: string; // Zabbix data source
}

interface State {
  allMaintenances: Maintenance[]; // All ongoing and future maintenances
  isLoading: boolean;
  shownDialog: ShownDialog;
  selectedMaintenance: Maintenance | undefined; // Maintenance being edited, cancelled or removed
  hosts: Array<{ name: string; hostid: number }>; // Hosts of the configured group so that they can be shown in the create/edit maintenance wizard
}

export class IirisMaintenanceListModal extends React.PureComponent<Props, State> {
  // Initial state
  state: State = {
    allMaintenances: [],
    isLoading: false,
    shownDialog: ShownDialog.None,
    selectedMaintenance: undefined,
    hosts: [],
  };

  // Component props/state update callback
  componentDidUpdate(prevProps: Props, prevState: State): void {
    if (!prevProps.show && this.props.show) {
      // Dialog was opened, clear previous maintenance data
      this.setState({
        allMaintenances: [],
        isLoading: true,
        selectedMaintenance: undefined,
        hosts: [],
      });
      // Dialog was opened => start fetching data in the background
      this.fetchMaintenanceList();
    }
  }

  // Fetch maintenance list for the table
  async fetchMaintenanceList() {
    return fetchHostsAndGroups(this.props.zabbixDataSource, this.props.hostGroup)
      .then((hostsAndGroupIds) => {
        // Save hosts list for create/edit maintenance wizard where the user may select host(s)
        this.setState({ hosts: hostsAndGroupIds.hosts });

        return getMaintenances(
          hostsAndGroupIds.hosts.map((host) => host.hostid),
          hostsAndGroupIds.groupIds,
          this.props.zabbixDataSource
        );
      })
      .then((maintenances: Maintenance[]) => {
        this.setState({ isLoading: false, allMaintenances: maintenances });
      })
      .catch((err: any) => {
        appEvents.emit(AppEvents.alertError, ['Failed to fetch hosts for maintenance management', err.toString()]);
      });
  }

  // User has clicked stop for an ongoing maintenance
  onStopMaintenance(maintenanceID: number) {
    let selectedMaintenance = this.state.allMaintenances.find((m) => m.id === maintenanceID);
    if (!selectedMaintenance) {
      // Should not happen
      return;
    }

    // Show correct confirmation depending on maintenance type and if it's ongoing or not
    var shownDialog;
    if (selectedMaintenance.maintenanceType === MaintenanceType.OneTime) {
      if (selectedMaintenance.ongoing) {
        shownDialog = ShownDialog.CancelOneTimeOngoingMaintenance;
      } else {
        shownDialog = ShownDialog.DeleteOneTimeMaintenance;
      }
    } else {
      // Periodic maintenance
      if (selectedMaintenance.ongoing) {
        shownDialog = ShownDialog.CancelPeriodicOngoingMaintenance;
      } else {
        shownDialog = ShownDialog.DeletePeriodicMaintenance;
      }
    }
    this.setState({
      shownDialog: shownDialog,
      selectedMaintenance: selectedMaintenance,
    });
  }

  // User has confirm to cancel or delete a maintenance
  onUpdateMaintenanceEndTime() {
    if (!this.state.selectedMaintenance) {
      // Should not happen
      return;
    }
    getZabbixDataSource(this.props.zabbixDataSource)
      .then((zabbix: any) => {
        // Set the active_till of selected maintenance to current time
        // That effectively prevents the maintenance from activating any more in the future
        const now = DateTime.now();
        const options: any = {
          maintenanceid: this.state.selectedMaintenance!.id,
          active_till: now.toUnixInteger(),
        };
        if (
          (this.state.selectedMaintenance!.oneTimeStartTimestamp &&
            this.state.selectedMaintenance!.maintenanceType === MaintenanceType.OneTime &&
            this.state.selectedMaintenance!.oneTimeStartTimestamp > now) ||
          (this.state.selectedMaintenance!.periodicActiveSinceTimestamp &&
            this.state.selectedMaintenance!.maintenanceType !== MaintenanceType.OneTime &&
            this.state.selectedMaintenance!.periodicActiveSinceTimestamp > now)
        ) {
          // Maintenance starts in the future (active_since is in the future)
          // Note that the future maintenances could be safely deleted altogether but
          // zabbix data source issue https://github.com/grafana/grafana-zabbix/issues/1178 prevents it.
          // As a workaround, change active_since as well because active_till cannot be less than active_since
          options.active_since = now.toUnixInteger();
        }
        return zabbix.zabbixAPI.request('maintenance.update', options).then((answer: any) => {
          // Prompt user that the maintenance has been deleted or canceled
          const texts = contextSrv.getLocalizedTexts();
          if (this.state.selectedMaintenance!.ongoing) {
            appEvents.emit(AppEvents.alertSuccess, [
              texts.maintenancehasBeenCanceled + '\n' + texts.systemStatusWillBeUpdated,
            ]);

            // Signal action panel to refresh its state once zabbix has updated
            // the maintenance status of the hosts in a few minutes
            setTimeout(() => {
              document.dispatchEvent(new Event('iiris-maintenance-update'));
            }, 2 * 60 * 1000);
          } else {
            appEvents.emit(AppEvents.alertSuccess, [texts.maintenanceHasBeenDeleted]);
          }

          // Update the maintenance list
          this.fetchMaintenanceList().then(() => {
            // Close confirm dialog once maintenance list has been reloaded
            this.setState({ shownDialog: ShownDialog.None });
          });
        });
      })
      .catch((err: any) => {
        appEvents.emit(AppEvents.alertError, ['Failed to delete or cancel a maintenance', err.toString()]);
      });
  }

  // User has clicked Edit button for an existing maintenance
  onEditMaintenance(maintenanceId: number) {
    this.setState({
      shownDialog: ShownDialog.MaintenanceEditWizard,
      selectedMaintenance: this.state.allMaintenances.find((m) => m.id === maintenanceId),
    });
  }

  // User has clicked Create new maintenance button
  showCreateNewMaintenanceWizard() {
    this.setState({
      shownDialog: ShownDialog.MaintenanceEditWizard,
      selectedMaintenance: undefined,
    });
  }

  // Close maintenance create/edit wizard and reload maintenances to the list
  onCloseMaintenanceEditWizard() {
    this.fetchMaintenanceList().then(() => {
      // Close wizard dialog once maintenance list has been reloaded
      this.setState({ shownDialog: ShownDialog.None });
    });
  }

  // Render component
  render() {
    const texts = contextSrv.getLocalizedTexts();
    const title = <h2 className="modal-header modal-header-title">{texts.upcomingMaintenances}</h2>;
    return (
      <>
        {/* The actual maintenances list modal dialog */}
        <Modal
          isOpen={this.props.show}
          title={title}
          onDismiss={() => this.props.onDismiss()}
          className="modal modal-body"
        >
          <div className="modal-content">
            <div className="iiris-maintenance-table">
              {this.state.isLoading ? (
                <div className="iiris-loader"></div>
              ) : (
                <IirisMaintenanceTable
                  data={this.state.allMaintenances}
                  onEditMaintenance={(maintenanceId) => this.onEditMaintenance(maintenanceId)}
                  onStopMaintenance={(maintenanceId) => this.onStopMaintenance(maintenanceId)}
                />
              )}
            </div>
            <div className="gf-form-button-row">
              <a className="btn btn-secondary" onClick={() => this.props.onDismiss()}>
                {texts.close}
              </a>
              <a className="btn btn-secondary" onClick={() => this.showCreateNewMaintenanceWizard()}>
                {texts.createNewMaintenance}
              </a>
            </div>
          </div>
        </Modal>
        {/* Confirm user if they really want to delete a one-time maintenance */}
        <ConfirmModal
          isOpen={this.state.shownDialog === ShownDialog.DeleteOneTimeMaintenance}
          title={texts.deleteMaintenanceConfirmTitle}
          body={texts.areYouSureWantToDeleteMaintenance}
          confirmText={texts.deleteMaintenanceConfirmButtonText}
          onConfirm={() => this.onUpdateMaintenanceEndTime()}
          onDismiss={() => this.setState({ shownDialog: ShownDialog.None })}
        />
        {/* Confirm user if they really want to cancel an ongoing one-time maintenance */}
        <ConfirmModal
          isOpen={this.state.shownDialog === ShownDialog.CancelOneTimeOngoingMaintenance}
          title={texts.cancelMaintenanceConfirmTitle}
          body={texts.areYouSureWantToCancelMaintenance}
          confirmText={texts.cancelMaintenanceConfirmButtonText}
          onConfirm={() => this.onUpdateMaintenanceEndTime()}
          onDismiss={() => this.setState({ shownDialog: ShownDialog.None })}
        />
        {/* Confirm user if they really want to delete a periodic maintenance */}
        <ConfirmModal
          isOpen={this.state.shownDialog === ShownDialog.DeletePeriodicMaintenance}
          title={texts.deleteMaintenanceConfirmTitle}
          body={texts.areYouSureWantToDeletePeriodicMaintenance + '\n' + texts.allMaintenancesInSeriesWillBeDeleted}
          confirmText={texts.deleteMaintenanceConfirmButtonText}
          onConfirm={() => this.onUpdateMaintenanceEndTime()}
          onDismiss={() => this.setState({ shownDialog: ShownDialog.None })}
        />
        {/* Confirm user if they really want to cancel an ongoing periodic maintenance */}
        <ConfirmModal
          isOpen={this.state.shownDialog === ShownDialog.CancelPeriodicOngoingMaintenance}
          title={texts.cancelMaintenanceConfirmTitle}
          body={
            texts.cantCancelStartedPeriodicMaintenance +
            '\n' +
            texts.selectedActionWillDeleteAllMaintenancesInSeries +
            '\n' +
            texts.areYouSureWantToContinue
          }
          confirmText={texts.deleteMaintenanceConfirmButtonText}
          onConfirm={() => this.onUpdateMaintenanceEndTime()}
          onDismiss={() => this.setState({ shownDialog: ShownDialog.None })}
        />
        {/* Edit an existing maintenance or create a new one */}
        <IirisMaintenanceEditWizard
          show={this.state.shownDialog === ShownDialog.MaintenanceEditWizard}
          onCloseMaintenanceEditWizard={() => this.onCloseMaintenanceEditWizard()}
          hosts={this.state.hosts}
          selectedMaintenance={this.state.selectedMaintenance}
          zabbixDataSource={this.props.zabbixDataSource}
        />
      </>
    );
  }
}
