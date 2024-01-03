import React, { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import { AppEvents } from '@grafana/data';
import { getTemplateSrv, getDataSourceSrv } from '@grafana/runtime';
import { ToolbarButton } from '@grafana/ui';
import appEvents from 'app/core/app_events';
import { contextSrv } from 'app/core/core';
import { updateTimeZoneForSession } from 'app/features/profile/state/reducers';

import { DashboardModel } from '../../state';

import { IirisMaintenanceConfirmModal } from './IirisMaintenanceConfirmModal';
import { IirisMaintenanceListModal } from './IirisMaintenanceListModal';
import { IirisMaintenanceModal } from './IirisMaintenanceModal';
import { replaceTemplateVars, getZabbix, getMaintenances, getOngoingMaintenances } from './common_tools';

const mapDispatchToProps = {
  updateTimeZoneForSession,
};

const connector = connect(null, mapDispatchToProps);

export interface OwnProps {
  dashboard: DashboardModel;
  key: string;
}

interface State {
  allMaintenances: any;
  showMaintenanceModal: boolean;
  showMaintenanceListModal: boolean;
  showMaintenanceConfirmModal: boolean;
  hosts: any[];
  selectedMaintenance: any;
  confirmIsVisible: boolean;
  confirmText: string;
  confirmAction: any;
  ongoingMaintenanceIds: string[];
}

type Props = OwnProps & ConnectedProps<typeof connector>;

class IirisMaintenance extends PureComponent<Props, State> {
  /* eslint-disable */
  /* tslint:disable */
  hosts: any;
  availableDatasources: any;
  datasourceSrv: any;
  modalScope: any;
  listModalScope: any;
  groupIds: number[] | undefined;
  hostIds: any;
  ongoingMaintenances: any;
  error: any;
  user: any;
  allMaintenances: any;
  selectedMaintenanceId: any;
  maintenanceIconStyle: any;
  stoppingOngoingMaintenance: any;
  confirmModalScope: any;
  texts: any = {};

  sortHostNames = (hostA: any, hostB: any) => {
    const nameA = hostA.text.toLowerCase();
    const nameB = hostB.text.toLowerCase();
    if (nameA < nameB) {
      return -1;
    } else if (nameA > nameB) {
      return 1;
    }
    return 0;
  };

  // Find the host group and its nested groups from zabbix API; returns array of group ids
  getNestedHostGroups = async (hostGroupName: string, zabbixAPI: any) => {
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
        // It is possible that there is not group with the actual configure name; only nested groups => length may be zero
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
  };

  onOpenMaintenanceDialog = (loadAllHosts?: boolean, givenHostGroup?: string, givenDataSources?: string[]) => {
    const { dashboard } = this.props;
    const templateSrv = getTemplateSrv();
    this.datasourceSrv = getDataSourceSrv();
    this.ongoingMaintenances = [];
    this.error = false;
    this.user = contextSrv.user.email;
    this.selectedMaintenanceId = '';
    this.maintenanceIconStyle = '';
    if (givenDataSources && givenDataSources.length > 0) {
      this.availableDatasources = givenDataSources;
    } else if (dashboard.selectedDatasource) {
      this.availableDatasources = [dashboard.selectedDatasource];
    } else {
      this.availableDatasources = this.datasourceSrv
        .getMetricSources()
        .filter((datasource: any) => datasource.meta.id.indexOf('zabbix-datasource') > -1 && datasource.value)
        .map((ds: any) => ds.name);
    }
    var hostGroupName: string;
    if (!loadAllHosts) {
      if (givenHostGroup) {
        // Host group name comes from action panel configuration (user clicked the maintenance icon of the action panel)
        hostGroupName = givenHostGroup;
      } else {
        // Host group name comes from dashboard configuration (user clicked the maintenance icon on the dashboard nav bar)
        hostGroupName = dashboard.maintenanceHostGroup;
      }
      hostGroupName = replaceTemplateVars(hostGroupName, templateSrv);
    }
    this.hosts = {
      selected: {},
      options: [],
      allSelected: true,
    };

    // Get Zabbix data source for Zabbix API queries
    getZabbix(this.availableDatasources, this.datasourceSrv)
      .then((zabbix: any) => {
        // Find out host group ids if not showing all hosts
        var p: Promise<any>;
        var groupIds: number[] | undefined;
        if (loadAllHosts) {
          groupIds = undefined;
          p = Promise.resolve();
        } else {
          p = this.getNestedHostGroups(hostGroupName, zabbix.zabbixAPI).then((fetchedGroupIds) => {
            if (fetchedGroupIds.length == 0) {
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
          if (!loadAllHosts) {
            hostQuery.groupids = groupIds;
          }
          return zabbix.zabbixAPI.request('host.get', hostQuery).then((hosts: any[]) => {
            if (!loadAllHosts) {
              // Filter out hosts ending with -sla _sla .sla -SLA _SLA .SLA
              hosts = hosts.filter((host: any) => !/[-_.](sla|SLA)$/.test(host.name));
            }

            // Sort
            this.hosts.options = hosts
              .map((host: any) => ({ text: host.name, value: host.hostid }))
              .sort(this.sortHostNames);

            this.setState({ hosts: this.hosts.options });
            this.hostIds = hosts.map((host: any) => host.hostid);
            this.groupIds = groupIds;
            this.getMaintenanceList(this.hostIds, groupIds);
            this.clearHostSelection();

            // Everything has been loaded, show the modal screen
            this.openAllMaintenancesModal();
          });
        });
      })
      .catch((err: any) => {
        this.handleError(err);
      });
  };

  /**
   * Parse given Date object to string
   * @param {Date} newDate
   * @returns {string}
   */
  parseDateToString = (newDate: Date) => {
    const leadingZero = newDate.getMinutes() < 10 ? '0' : '';
    return (
      newDate.getDate() +
      '.' +
      (newDate.getMonth() + 1) +
      '.' +
      newDate.getFullYear() +
      ' ' +
      newDate.getHours() +
      ':' +
      leadingZero +
      newDate.getMinutes()
    );
  };

  /**
   * Clear selection for hosts and set all selected by default
   */
  clearHostSelection = () => {
    this.hosts.allSelected = true;
    if (this.hosts.options.length > 0) {
      this.hosts.options.forEach((option: any, index: number) => {
        this.hosts.selected[option.value] = this.hosts.allSelected;
        this.hosts.options[index].checked = this.hosts.allSelected;
      });
    }
  };

  /**
   * Handling for errors
   * @param {any} error
   */
  handleError = (error: any) => {
    console.log(error);
    if (typeof error === 'object' && Object.keys(error).length > 0) {
      appEvents.emit(AppEvents.alertError, [JSON.stringify(error)]);
    }
  };

  /**
   * Get all maintenances from Zabbix
   * @param {string} groupid Get maintenances from specified group
   */
  getMaintenanceList = (hostIds: string[], groupIds?: number[]) => {
    const showOnlyOneUpcomingPerPeriod = true;
    getMaintenances(hostIds, groupIds, this.availableDatasources, this.datasourceSrv, showOnlyOneUpcomingPerPeriod)
      .then((maintenances: any) => {
        if (maintenances.length > 0) {
          this.ongoingMaintenances = getOngoingMaintenances(maintenances);
          this.allMaintenances = [];
          maintenances.map((maintenance: any) => {
            if (maintenance.maintenanceType === 0) {
              maintenance.maintenanceTypeString = this.texts.oneTimeAbbr;
              maintenance.maintenanceTypeStringFull = this.texts.oneTime + ' ' + this.texts.maintenance;
            } else if (maintenance.maintenanceType === 2) {
              maintenance.maintenanceTypeString = this.texts.dailyAbbr;
              maintenance.maintenanceTypeStringFull = this.texts.daily + ' ' + this.texts.maintenance;
            } else if (maintenance.maintenanceType === 3) {
              maintenance.maintenanceTypeString = this.texts.weeklyAbbr;
              maintenance.maintenanceTypeStringFull = this.texts.weekly + ' ' + this.texts.maintenance;
            } else if (maintenance.maintenanceType === 4) {
              maintenance.maintenanceTypeString = this.texts.monthlyAbbr;
              maintenance.maintenanceTypeStringFull = this.texts.monthly + ' ' + this.texts.maintenance;
            } else {
              maintenance.maintenanceTypeString = '';
            }
            this.allMaintenances.push(maintenance);
          });
          const curTime = new Date().getTime() / 1000;
          this.allMaintenances = this.allMaintenances.filter(
            (maintenance: any) => maintenance.endTime > curTime && maintenance.activeTill > curTime
          );
          if (this.ongoingMaintenances.length > 0) {
            this.maintenanceIconStyle = 'on-going';
          } else {
            this.maintenanceIconStyle = '';
          }
        } else {
          this.ongoingMaintenances = [];
          this.maintenanceIconStyle = '';
          this.allMaintenances = [];
        }
        // this.listModalScope.allMaintenances = this.allMaintenances;
        const ongoingMaintenanceIds = this.ongoingMaintenances.map((item: any) => item.internalId);
        this.setState({ allMaintenances: this.allMaintenances, ongoingMaintenanceIds });
      })
      .catch((err: any) => {
        this.handleError(err);
      });
  };

  /**
   * Get current time as Unix epoch
   * @returns {number}
   */
  getCurrentTimeEpoch = (currentTime?: Date) => {
    if (!currentTime) {
      currentTime = new Date();
    }
    return (
      Date.UTC(
        currentTime.getUTCFullYear(),
        currentTime.getUTCMonth(),
        currentTime.getUTCDate(),
        currentTime.getUTCHours(),
        currentTime.getUTCMinutes(),
        currentTime.getUTCSeconds()
      ) / 1000
    );
  };

  /**
   * Callback for clicking stop maintenance button
   * @param {string} maintenanceID
   */
  onStopMaintenance = (maintenanceID: string) => {
    let selectedMaintenance = this.ongoingMaintenances.find((item: any) => item.id === maintenanceID);
    let isOngoing = false;
    const curTime = this.getCurrentTimeEpoch();
    this.stoppingOngoingMaintenance = false;
    if (selectedMaintenance) {
      isOngoing = true;
      this.stoppingOngoingMaintenance = true;
    } else {
      selectedMaintenance = this.allMaintenances.find((item: any) => item.id === maintenanceID);
    }
    let confirmIsVisible = true;
    let confirmText = '';
    let confirmAction: any;
    if (isOngoing && !selectedMaintenance.maintenanceType) {
      // In case of ongoing single maintenance we just set the end time
      confirmText = this.texts.areYouSureWantToCancelMaintenance;
      confirmAction = this.onUpdateMaintenanceEndTime;
    } else {
      // Handle all other maintenances
      if (!selectedMaintenance.maintenanceType) {
        // Single maintenance
        confirmText = this.texts.areYouSureWantToDeleteMaintenance;
      } else {
        // Periodic maintenances
        if (isOngoing) {
          confirmText = this.texts.cantCancelStartedPeriodicMaintenance + '\n';
          confirmText += this.texts.selectedActionWillDeleteAllMaintenancesInSeries + '\n';
          confirmText += this.texts.areYouSureWantToContinue;
        } else {
          confirmText = this.texts.areYouSureWantToDeletePeriodicMaintenance + '\n';
          confirmText += this.texts.allMaintenancesInSeriesWillBeDeleted;
        }
      }
      if (selectedMaintenance.activeSince > curTime) {
        // Maintenance period hasn't started yet so it can be safely removed
        // NOTE: This is temporarily commented because 'maintenance.delete' causes error
        // this.listModalScope.confirmAction = this.onRemoveMaintenance.bind(this);
        confirmAction = this.onUpdateMaintenanceEndTime;
      } else {
        // Period has already started so we can just set the end time of period
        confirmAction = this.onUpdateMaintenanceEndTime;
      }
    }
    this.setState({ selectedMaintenance, confirmIsVisible, confirmText, confirmAction });
  };

  setMaintenanceUpdateTimeOut = (infoText: string, showModal: boolean) => {
    if (showModal) {
      this.openConfirmMaintenanceModal(infoText);
    } else {
      setTimeout(() => {
        this.getMaintenanceList(this.hostIds, this.groupIds);
        appEvents.emit(AppEvents.alertSuccess, [infoText]);
      }, 1000);
    }
    setTimeout(() => {
      document.dispatchEvent(new Event('iiris-maintenance-update'));
    }, 2 * 60 * 1000);
  };

  /**
   * Callback for clicking edit maintenance button
   * @param {string} maintenanceID
   */
  onEditMaintenance = (maintenanceID: string) => {
    this.openMaintenanceModal(maintenanceID);
  };

  /**
   * Callback for clicking stop maintenance button
   * @param {string} maintenanceID
   * @param {number} endTime epoch
   */
  onUpdateMaintenanceEndTime = (maintenanceID: string, endTime?: number) => {
    const curTime = this.getCurrentTimeEpoch();
    if (!endTime) {
      endTime = curTime;
    }
    let selectedMaintenance = this.ongoingMaintenances.find((item: any) => item.id === maintenanceID);
    if (!selectedMaintenance) {
      selectedMaintenance = this.allMaintenances.find((item: any) => item.id === maintenanceID);
    }
    if (selectedMaintenance) {
      getZabbix(this.availableDatasources, this.datasourceSrv)
        .then((zabbix: any) => {
          // Set the active_till of selected maintenance to given end time
          const options: any = {
            maintenanceid: maintenanceID,
            active_till: endTime,
          };
          // Check if maintenance period has started yet
          if (selectedMaintenance.activeSince > curTime) {
            options['active_since'] = endTime;
            selectedMaintenance.activeSince = endTime;
          }
          // In case of single maintenances we need to also set the period end time
          if (!selectedMaintenance.maintenanceType) {
            options['timeperiods'] = [
              {
                timeperiod_type: 0,
                period: (endTime || 0) - selectedMaintenance.activeSince,
                start_date: selectedMaintenance.activeSince,
              },
            ];
          }
          zabbix.zabbixAPI
            .request('maintenance.update', options)
            .then((answer: any) => {
              let showModal = true;
              let infoText = this.texts.maintenanceHasBeenDeleted;
              if (this.stoppingOngoingMaintenance) {
                infoText = this.texts.maintenancehasBeenCanceled + ' ' + this.texts.systemStatusWillBeUpdated;
              }
              this.setMaintenanceUpdateTimeOut(infoText, showModal);
            })
            .catch((err: any) => {
              this.handleError(err);
            });
        })
        .catch((err: any) => {
          this.handleError(err);
        });
    }
  };

  /**
   * Callback for clicking stop maintenance button
   * @param {string} maintenanceID
   */
  onRemoveMaintenance = (maintenanceID: string) => {
    const selectedMaintenance = this.allMaintenances.find((item: any) => item.id === maintenanceID);
    if (selectedMaintenance) {
      getZabbix(this.availableDatasources, this.datasourceSrv)
        .then((zabbix: any) => {
          // Set the time period of selected maintenance to end now
          zabbix.zabbixAPI
            .request('maintenance.delete', [maintenanceID])
            .then((answer: any) => {
              this.setMaintenanceUpdateTimeOut(this.texts.maintenanceHasBeenDeleted, true);
            })
            .catch((err: any) => {
              this.handleError(err);
            });
        })
        .catch((err: any) => {
          this.handleError(err);
        });
    }
  };

  /**
   * Callback for creating a new maintenance from dialog
   * @param {number} maintenanceType
   * @param {string} description
   * @param {number} duration  in seconds
   * @param {string[]} hostIds
   * @param {any} options
   * @param {Date} startDate
   * @param {Date} stopDate
   * @param {string} maintenanceId  optional
   */
  onCreateMaintenance = (
    maintenanceType: number,
    description: string,
    duration: number,
    hostIds: string[],
    options: any,
    startDate: Date,
    stopDate: Date,
    maintenanceId?: string
  ) => {
    getZabbix(this.availableDatasources, this.datasourceSrv)
      .then((zabbix: any) => {
        const curTime = this.getCurrentTimeEpoch(startDate);
        let stopTime = curTime + duration;
        if (maintenanceType === 2 || maintenanceType === 3 || maintenanceType === 4) {
          stopTime = Math.floor(stopDate.getTime() / 1000);
        }
        const maintenanceObj: any = {
          name: description,
          active_since: curTime,
          active_till: stopTime,
          hostids: hostIds,
          timeperiods: [
            {
              timeperiod_type: maintenanceType,
              period: duration,
              start_date: curTime,
            },
          ],
        };
        Object.keys(options).map((optionKey) => {
          maintenanceObj['timeperiods'][0][optionKey] = options[optionKey];
        });
        let apiCommand = 'maintenance.create';
        // Check if we are updating an existing maintenance
        if (maintenanceId) {
          maintenanceObj['maintenanceid'] = maintenanceId;
          apiCommand = 'maintenance.update';
        }
        zabbix.zabbixAPI
          .request(apiCommand, maintenanceObj)
          .then((answer: any) => {
            let infoText = this.texts.newMaintenanceHasBeenStarted + ' ' + this.texts.systemStatusWillBeUpdated;
            if (maintenanceId) {
              infoText = this.texts.maintenanceHasBeenUpdated + ' ' + this.texts.systemStatusWillBeUpdated;
            }
            let showModal = true;
            // Show only info popup if maintenance is in future
            if (this.getCurrentTimeEpoch(startDate) > this.getCurrentTimeEpoch()) {
              if (maintenanceId) {
                infoText = this.texts.maintenanceHasBeenUpdated;
              } else {
                infoText = this.texts.newMaintenanceHasBeenCreated;
              }
            }
            this.setMaintenanceUpdateTimeOut(infoText, showModal);
          })
          .catch((err: any) => {
            this.handleError(err);
          });
      })
      .catch((err: any) => {
        this.handleError(err);
      });
  };

  /**
   * Open create maintenance modal
   * @param {string} maintenanceID (optional)
   */
  openMaintenanceModal = (maintenanceID = '') => {
    this.selectedMaintenanceId = maintenanceID;
    const selectedMaintenance = this.state.allMaintenances.find((item: any) => item.id === this.selectedMaintenanceId);
    this.setState({
      showMaintenanceModal: true,
      selectedMaintenance,
      showMaintenanceListModal: false,
      showMaintenanceConfirmModal: false,
    });
  };

  /**
   * Open create maintenance modal
   */
  openAllMaintenancesModal = () => {
    this.setState({ showMaintenanceListModal: true, showMaintenanceModal: false, showMaintenanceConfirmModal: false });
  };

  /**
   * Open maintenance confirmation modal
   */
  openConfirmMaintenanceModal = (confirmText: string) => {
    this.setState({
      showMaintenanceConfirmModal: true,
      confirmText,
      showMaintenanceListModal: false,
      showMaintenanceModal: false,
    });
  };
  /* tslint:enable */

  constructor(props: Props) {
    super(props);
    this.state = {
      allMaintenances: [],
      showMaintenanceModal: false,
      showMaintenanceListModal: false,
      showMaintenanceConfirmModal: false,
      hosts: [],
      selectedMaintenance: undefined,
      confirmIsVisible: false,
      confirmText: '',
      confirmAction: undefined,
      ongoingMaintenanceIds: [],
    };
    this.texts = contextSrv.getLocalizedTexts();
  }

  componentDidMount() {
    // Listen to event from iiris action panel
    // The panel has configuration of the maintenance will be maintained in the detail argument of the event
    document.addEventListener(
      'iiris-maintenance-dialog-open',
      (e: any) =>
        this.onOpenMaintenanceDialog(e.detail.loadAllHosts, e.detail.hostGroup, e.detail.availableDatasources),
      false
    );
  }

  componentWillUnmount() {
    document.removeEventListener(
      'iiris-maintenance-dialog-open',
      (e: any) =>
        this.onOpenMaintenanceDialog(e.detail.loadAllHosts, e.detail.hostGroup, e.detail.availableDatasources),
      false
    );
  }

  findMaintenanceButton = (element: HTMLElement): HTMLElement | null => {
    if (element.id === 'maintenance_button') {
      return element;
    } else if (element.parentElement) {
      return this.findMaintenanceButton(element.parentElement);
    } else {
      return null;
    }
  };

  hideMaintenanceModal = () => {
    this.setState({ showMaintenanceModal: false });
  };

  hideMaintenanceListModal = () => {
    this.setState({ showMaintenanceListModal: false });
  };

  render() {
    return (
      <>
        <ToolbarButton
          key="manage_maintenances"
          tooltip="Manage Maintenances"
          id="maintenance_button"
          onClick={(e: any) => {
            this.findMaintenanceButton(e.target as any)?.blur();
            this.onOpenMaintenanceDialog();
          }}
        >
          <div style={{ width: '24px', height: '24px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 100 100" fill="#ffffff">
              <path
                d="M84.4,29.6L74.2,39.8L65,37l-2.1-8.6l10-10c-5.5-2-11.4-1-16,3.5c-4.5,4.5-5.6,9.7-3.8,14.8L21,69
                c-3.3,3.3-3.3,8.7,0,12h0c3.3,3.3,8.7,3.3,12,0l32-32c5.7,2.7,11.3,1.7,16.1-3C85.7,41.4,86.6,35.2,84.4,29.6z M27,78
                c-1.7,0-3-1.3-3-3s1.3-3,3-3s3,1.3,3,3S28.7,78,27,78z"
              />
              <polygon points="19,17 30,23 33,31 42,40 36,46 27,37 18,34 13,23 " />
              <path d="M78.3,70.7l-13-13L54.7,68.3l13,13c2.9,2.9,7.7,2.9,10.6,0S81.2,73.6,78.3,70.7z" />
            </svg>
          </div>
        </ToolbarButton>
        <IirisMaintenanceModal
          show={this.state.showMaintenanceModal}
          onDismiss={this.hideMaintenanceModal}
          openAllMaintenancesModal={this.openAllMaintenancesModal}
          hosts={this.state.hosts}
          selectedMaintenance={this.state.selectedMaintenance}
          user={contextSrv.user.email || ''}
          onCreateMaintenance={this.onCreateMaintenance}
          allMaintenances={this.state.allMaintenances}
        />
        <IirisMaintenanceListModal
          show={this.state.showMaintenanceListModal}
          allMaintenances={this.state.allMaintenances}
          openMaintenanceModal={this.openMaintenanceModal}
          onDismiss={this.hideMaintenanceListModal}
          onEditMaintenance={this.onEditMaintenance}
          onStopMaintenance={this.onStopMaintenance}
          confirmIsVisible={this.state.confirmIsVisible}
          confirmText={this.state.confirmText}
          confirmAction={this.state.confirmAction}
          selectedMaintenanceId={this.state.selectedMaintenance?.id}
          onCloseConfirmation={() => this.setState({ confirmIsVisible: false })}
          ongoingMaintenanceIds={this.state.ongoingMaintenanceIds}
        />
        <IirisMaintenanceConfirmModal
          show={this.state.showMaintenanceConfirmModal}
          onDismiss={() => this.setState({ showMaintenanceConfirmModal: false })}
          confirmText={this.state.confirmText}
          confirmTitle={this.texts.maintenance}
        />
      </>
    );
  }
}

export default connector(IirisMaintenance);
