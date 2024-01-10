/**
 * Maintenance list modal dialog that shows all the maintenances and allows
 * the user to create a new maintenance, edit an existing one or stop an ongoing maintenance.
 */

import React from 'react';

import { AppEvents } from '@grafana/data';
import { ConfirmModal, Modal } from '@grafana/ui';
import appEvents from 'app/core/app_events';
import { contextSrv } from 'app/core/core';

import { IirisMaintenanceEditWizard } from './IirisMaintenanceEditWizard';
import { getZabbixDataSource, getMaintenances, Maintenance, MaintenanceType } from './IirisMaintenanceModel';
import { IirisMaintenanceTable } from './IirisMaintenanceTable';

// Modal dialog shown currently
enum ShownDialog {
  None = 0,
  MaintenanceEditWizard,
  CancelOneTimeOngoingMaintenance,
  DeleteOneTimeMaintenance,
  CancelPeriodicOngoingMaintenance,
  DeletePeriodicMaintenance,
  MaintenanceHasBeenDeleted,
  MaintenanceHasBeenCanceled,
}

interface Props {
  show: boolean; // Show the maintenance list modal dialog or not
  onDismiss(): void; // Hide the dialog
  hostGroup: string | undefined; // Configured host group; if not defined fetch all maintenances regardless of hosts
  zabbixDataSource: string; // Zabbix data source
}

interface State {
  allMaintenances: Maintenance[]; // All ongoing and future maintenances
  shownDialog: ShownDialog;
  selectedMaintenance: Maintenance | undefined; // Maintenance being edited, cancelled or removed
  hosts: Array<{ name: string; hostid: number }>; // Hosts of the configured group so that they can be shown in the create/edit maintenance wizard
}

export class IirisMaintenanceListModal extends React.PureComponent<Props, State> {
  // Initial state
  state: State = {
    allMaintenances: [],
    shownDialog: ShownDialog.None,
    selectedMaintenance: undefined,
    hosts: [],
  };

  // Component props/state update callback
  componentDidUpdate(prevProps: Props, prevState: State): void {
    if (!prevProps.show && this.props.show) {
      // Dialog was opened => start fetching data in the background
      this.fetchMaintenanceList();
    }
  }

  // Fetch maintenance list for the table
  async fetchMaintenanceList() {
    return this.fetchHostsAndGroups()
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
        // Decorate with localized texts of maintenance type for the table
        var allMaintenances: Maintenance[] = [];
        const texts = contextSrv.getLocalizedTexts();
        maintenances.forEach((maintenance) => {
          if (maintenance.maintenanceType === MaintenanceType.OneTime) {
            maintenance.maintenanceTypeString = texts.oneTimeAbbr;
            maintenance.maintenanceTypeStringFull = texts.oneTime + ' ' + texts.maintenance;
          } else if (maintenance.maintenanceType === MaintenanceType.Daily) {
            maintenance.maintenanceTypeString = texts.dailyAbbr;
            maintenance.maintenanceTypeStringFull = texts.daily + ' ' + texts.maintenance;
          } else if (maintenance.maintenanceType === MaintenanceType.Weekly) {
            maintenance.maintenanceTypeString = texts.weeklyAbbr;
            maintenance.maintenanceTypeStringFull = texts.weekly + ' ' + texts.maintenance;
          } else if (maintenance.maintenanceType === MaintenanceType.Monthly) {
            maintenance.maintenanceTypeString = texts.monthlyAbbr;
            maintenance.maintenanceTypeStringFull = texts.monthly + ' ' + texts.maintenance;
          } else {
            maintenance.maintenanceTypeString = '';
          }
          allMaintenances.push(maintenance);
        });
        this.setState({ allMaintenances: allMaintenances });
      })
      .catch((err: any) => {
        appEvents.emit(AppEvents.alertError, ['Failed to fetch hosts for maintanence management', err.toString()]);
      });
  }

  // Sort host list based on their names
  sortHostNames(hostA: any, hostB: any) {
    const nameA = hostA.name.toLowerCase();
    const nameB = hostB.name.toLowerCase();
    if (nameA < nameB) {
      return -1;
    } else if (nameA > nameB) {
      return 1;
    }
    return 0;
  }

  // Fetch host and group ids so that maintenances can be fetched for the configured host group
  async fetchHostsAndGroups(): Promise<{
    hosts: Array<{ name: string; hostid: number }>;
    groupIds: number[];
  }> {
    // Get Zabbix data source for Zabbix API queries
    return getZabbixDataSource(this.props.zabbixDataSource).then((zabbix: any) => {
      // Find out host group ids if not showing all hosts
      var p: Promise<any>;
      var groupIds: number[] | undefined;
      const hostGroupName = this.props.hostGroup; // Undefined if getting all hosts regardless of host group
      if (!hostGroupName) {
        groupIds = undefined;
        p = Promise.resolve();
      } else {
        p = this.getNestedHostGroups(hostGroupName, zabbix.zabbixAPI).then((fetchedGroupIds) => {
          if (fetchedGroupIds.length === 0) {
            throw new Error('Configuration error: No host groups found with name: ' + hostGroupName);
          }
          groupIds = fetchedGroupIds;
        });
      }
      return p.then(() => {
        // Find the hosts
        var hostQuery: any = {
          output: ['hostid', 'name'],
          filter: {
            status: 0, // Only enabled hosts
          },
        };
        if (hostGroupName) {
          // Limit host query with the given host group
          hostQuery.groupids = groupIds;
        }
        return zabbix.zabbixAPI
          .request('host.get', hostQuery)
          .then((hosts: Array<{ name: string; hostid: number }>) => {
            if (hostGroupName) {
              // Filter out hosts ending with -sla _sla .sla -SLA _SLA .SLA
              hosts = hosts.filter((host) => !/[-_.](sla|SLA)$/.test(host.name));
            }

            // Sort
            hosts = hosts.sort(this.sortHostNames);

            return {
              hosts: hosts,
              groupIds: groupIds,
            };
          });
      });
    });
  }

  // Find the host group and its nested groups from zabbix API; returns array of group ids
  async getNestedHostGroups(hostGroupName: string, zabbixAPI: any) {
    // Find find all the host groups that either match the name directly or are nested groups of it
    // This must be done with two subsequent queries since Zabbix API does not support searching for them with one query
    var ids: number[] = [];
    return zabbixAPI
      .request('hostgroup.get', {
        filter: {
          name: hostGroupName,
        },
      })
      .then((groupData: any) => {
        // It is possible that there is no group with the actual configure name; only nested groups => length may be zero
        if (groupData.length > 0) {
          ids.push(groupData[0].groupid);
        }

        return zabbixAPI
          .request('hostgroup.get', {
            search: {
              name: hostGroupName + '/*',
            },
            searchWildcardsEnabled: true,
          })
          .then((nestedGroups: any) => {
            for (var idx = 0; idx < nestedGroups.length; idx++) {
              ids.push(nestedGroups[idx].groupid);
            }
            return ids;
          });
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
        const options: any = {
          maintenanceid: this.state.selectedMaintenance!.id,
          active_till: Date.now() / 1000,
        };
        return zabbix.zabbixAPI.request('maintenance.update', options).then((answer: any) => {
          // Prompt user that the maintenance has been deleted or canceled
          if (this.state.selectedMaintenance!.ongoing) {
            this.setState({ shownDialog: ShownDialog.MaintenanceHasBeenCanceled });

            // Signal action panel to refresh its state once zabbix has updated
            // the maintenance status of the hosts in a few minutes
            setTimeout(() => {
              document.dispatchEvent(new Event('iiris-maintenance-update'));
            }, 2 * 60 * 1000);
          } else {
            this.setState({ shownDialog: ShownDialog.MaintenanceHasBeenDeleted });
          }
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
    //props.onDismiss();
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
            <div className="iiris-table-container">
              <div className="iiris-event-table">
                <IirisMaintenanceTable
                  data={this.state.allMaintenances}
                  onEditMaintenance={(maintenanceId) => this.onEditMaintenance(maintenanceId)}
                  onStopMaintenance={(maintenanceId) => this.onStopMaintenance(maintenanceId)}
                />
              </div>
            </div>
            <div className="gf-form-button-row">
              <a className="btn btn-primary" onClick={() => this.props.onDismiss()}>
                {texts.cancel}
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
        {/* Prompt the user that a maintenance has been deleted */}
        <ConfirmModal
          isOpen={this.state.shownDialog === ShownDialog.MaintenanceHasBeenDeleted}
          title={texts.deleteMaintenanceConfirmTitle}
          body={texts.maintenanceHasBeenDeleted}
          confirmText=""
          onConfirm={() => {}}
          onDismiss={() => this.setState({ shownDialog: ShownDialog.None })}
        />
        {/* Prompt the user that a maintenance has been canceled */}
        <ConfirmModal
          isOpen={this.state.shownDialog === ShownDialog.MaintenanceHasBeenCanceled}
          title={texts.cancelMaintenanceConfirmTitle}
          body={texts.maintenancehasBeenCanceled + '\n' + texts.systemStatusWillBeUpdated}
          confirmText=""
          onConfirm={() => {}}
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
