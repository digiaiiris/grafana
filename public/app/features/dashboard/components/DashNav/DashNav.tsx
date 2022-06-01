// tslint:disable
// Libaries
import React, { PureComponent, FC, ReactNode } from 'react';
import {
  replaceTemplateVars,
  getZabbix,
  getHostGroups,
  getHostsFromGroup,
  getMaintenances,
  getOngoingMaintenances,
} from './common_tools';
import { connect, ConnectedProps } from 'react-redux';
// Utils & Services
import { playlistSrv } from 'app/features/playlist/PlaylistSrv';
// Components
import { DashNavButton } from './DashNavButton';
import { DashNavTimeControls } from './DashNavTimeControls';
import { ButtonGroup, ModalsController, ToolbarButton, PageToolbar } from '@grafana/ui';
import { locationUtil, textUtil, AppEvents } from '@grafana/data';
// State
import { updateTimeZoneForSession } from 'app/features/profile/state/reducers';
// Types
import { DashboardModel } from '../../state';
import { KioskMode } from 'app/types';
import { ShareModal } from 'app/features/dashboard/components/ShareModal';
import { SaveDashboardModalProxy } from 'app/features/dashboard/components/SaveDashboard/SaveDashboardModalProxy';
import { locationService, getTemplateSrv, getDataSourceSrv } from '@grafana/runtime';
import { toggleKioskMode } from 'app/core/navigation/kiosk';
import { getDashboardSrv } from '../../services/DashboardSrv';
import appEvents from 'app/core/app_events';
import { contextSrv } from 'app/core/core';
import { IirisMaintenanceListModal } from './IirisMaintenanceListModal';
import { IirisMaintenanceModal } from './IirisMaintenanceModal';

const mapDispatchToProps = {
  updateTimeZoneForSession,
};

const connector = connect(null, mapDispatchToProps);

export interface OwnProps {
  dashboard: DashboardModel;
  isFullscreen: boolean;
  kioskMode: KioskMode;
  hideTimePicker: boolean;
  folderTitle?: string;
  title: string;
  onAddPanel: () => void;
}

interface State {
  allMaintenances: any;
  showMaintenanceModal: boolean;
  showMaintenanceListModal: boolean;
  hosts: any[];
}

interface DashNavButtonModel {
  show: (props: Props) => boolean;
  component: FC<Partial<Props>>;
  index?: number | 'end';
}

const customLeftActions: DashNavButtonModel[] = [];
const customRightActions: DashNavButtonModel[] = [];

export function addCustomLeftAction(content: DashNavButtonModel) {
  customLeftActions.push(content);
}

export function addCustomRightAction(content: DashNavButtonModel) {
  customRightActions.push(content);
}

type Props = OwnProps & ConnectedProps<typeof connector>;

class DashNav extends PureComponent<Props, State> {
  /* eslint-disable */
  /* tslint:disable */
  hosts: any;
  hostGroup: any;
  groupId: any;
  availableDatasources: any;
  datasourceSrv: any;
  modalScope: any;
  listModalScope: any;
  hostIds: any;
  ongoingMaintenances: any;
  error: any;
  user: any;
  allMaintenances: any;
  selectedMaintenanceId: any;
  maintenanceIconStyle: any;
  allHostsTitle = 'Kaikki palvelimet';
  stoppingOngoingMaintenance: any;
  confirmModalScope: any;

  onOpenMaintenanceDialog = () => {
    console.log('Open maintenance dialog');
    const { dashboard } = this.props;
    const templateSrv = getTemplateSrv();
    this.datasourceSrv = getDataSourceSrv();
    this.ongoingMaintenances = [];
    this.error = false;
    this.user = contextSrv.user.email;
    this.selectedMaintenanceId = '';
    this.maintenanceIconStyle = '';
    if (dashboard.selectedDatasource) {
      this.availableDatasources = [dashboard.selectedDatasource];
    } else {
      this.availableDatasources = this.datasourceSrv
        .getMetricSources()
        .filter((datasource: any) => datasource.meta.id.indexOf('zabbix-datasource') > -1 && datasource.value)
        .map((ds: any) => ds.name);
    }
    this.hosts = {
      selected: {},
      options: [],
      allSelected: true,
    };
    this.hostGroup = replaceTemplateVars(dashboard.maintenanceHostGroup, templateSrv);
    console.log('get hostsgroups');
    getHostGroups(this.hostGroup, this.availableDatasources, this.datasourceSrv)
      .then((groupId: string) => {
        this.groupId = groupId;
        console.log(groupId);
        getHostsFromGroup(this.groupId, this.availableDatasources, this.datasourceSrv).then((hosts: any[]) => {
          console.log(hosts);
          // Filter out hosts ending with -sla _sla .sla -SLA _SLA .SLA
          this.hosts.options = hosts
            .filter((host: any) => !/[-_.](sla|SLA)$/.test(host.name) && host.status === '0')
            .map((host: any) => ({ text: host.name, value: host.hostid }))
            .sort((hostA: any, hostB: any) => {
              const nameA = hostA.text.toLowerCase();
              const nameB = hostB.text.toLowerCase();
              if (nameA < nameB) {
                return -1;
              } else if (nameA > nameB) {
                return 1;
              }
              return 0;
            });
          this.setState({ hosts: this.hosts.options });
          this.hostIds = hosts.map((host: any) => host.hostid);
          this.getMaintenanceList(this.hostIds, groupId);
          this.clearHostSelection();
        });
      })
      .catch((err: any) => {
        this.handleError(err);
      });
    this.openAllMaintenancesModal();
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
  getMaintenanceList = (hostIds: string[], groupId: string) => {
    const showOnlyOneUpcomingPerPeriod = true;
    getMaintenances(hostIds, [groupId], this.availableDatasources, this.datasourceSrv, showOnlyOneUpcomingPerPeriod)
      .then((maintenances: any) => {
        if (maintenances.length > 0) {
          this.ongoingMaintenances = getOngoingMaintenances(maintenances);
          this.allMaintenances = [];
          maintenances.map((maintenance: any) => {
            if (maintenance.maintenanceType === 0) {
              maintenance.maintenanceTypeString = 'yksi';
              maintenance.maintenanceTypeStringFull = 'Yksittäinen huolto';
            } else if (maintenance.maintenanceType === 2) {
              maintenance.maintenanceTypeString = 'pvä';
              maintenance.maintenanceTypeStringFull = 'Päivittäinen huolto';
            } else if (maintenance.maintenanceType === 3) {
              maintenance.maintenanceTypeString = 'vko';
              maintenance.maintenanceTypeStringFull = 'Viikottainen huolto';
            } else if (maintenance.maintenanceType === 4) {
              maintenance.maintenanceTypeString = 'kk';
              maintenance.maintenanceTypeStringFull = 'Kuukausittainen huolto';
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
        this.setState({ allMaintenances: this.allMaintenances });
        console.log('all maintenances');
        console.log(this.allMaintenances);
        // this.listModalScope.ongoingMaintenanceIds = this.ongoingMaintenances.map((item: any) => item.internalId);
        // this.listModalScope.$apply();
      }).catch((err: any) => {
        this.handleError(err);
      });
  };

  /**
   * Callback for clicking wiki icon
   */
  onOpenWikiPage = () => {
    const { dashboard } = this.props;
    if (dashboard.serviceInfoWikiUrlIsExternal) {
      // Navigate directly to given URL
      window.open(dashboard.serviceInfoWikiUrl, '_blank');
    } else {
      // Tell parent window to navigate to given URL
      const messageObj = {
        relaytarget: 'wiki',
        relayparams: dashboard.serviceInfoWikiUrl,
      };
      // eslint-disable-next-line
      window.top?.postMessage(messageObj, '*');
    }
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
    this.listModalScope.confirmIsVisible = true;
    this.listModalScope.selectedMaintenanceId = maintenanceID;
    if (isOngoing && !selectedMaintenance.maintenanceType) {
      // In case of ongoing single maintenance we just set the end time
      this.listModalScope.confirmText = 'Haluatko varmasti keskeyttää huollon?';
      this.listModalScope.confirmAction = this.onUpdateMaintenanceEndTime.bind(this);
    } else {
      // Handle all other maintenances
      if (!selectedMaintenance.maintenanceType) {
        // Single maintenance
        this.listModalScope.confirmText = 'Haluatko varmasti poistaa huollon?';
      } else {
        // Periodic maintenances
        if (isOngoing) {
          this.listModalScope.confirmText = 'Käynnissä olevaa ajastettua huoltoa ei voi keskeyttää.\n';
          this.listModalScope.confirmText += 'Valitsemasi toiminto poistaa kaikki samaan sarjaan kuuluvat huollot.\n';
          this.listModalScope.confirmText += 'Haluatko varmasti jatkaa?';
        } else {
          this.listModalScope.confirmText = 'Haluatko varmasti poistaa ajastetun huollon?\n';
          this.listModalScope.confirmText += 'Kaikki samaan sarjaan kuuluvat tulevat huollot poistetaan.';
        }
      }
      if (selectedMaintenance.activeSince > curTime) {
        // Maintenance period hasn't started yet so it can be safely removed
        // NOTE: This is temporarily commented because 'maintenance.delete' causes error
        // this.listModalScope.confirmAction = this.onRemoveMaintenance.bind(this);
        this.listModalScope.confirmAction = this.onUpdateMaintenanceEndTime.bind(this);
      } else {
        // Period has already started so we can just set the end time of period
        this.listModalScope.confirmAction = this.onUpdateMaintenanceEndTime.bind(this);
      }
    }
    this.listModalScope.$apply();
  };

  setMaintenanceUpdateTimeOut = (infoText: string, showModal: boolean) => {
    if (showModal) {
      this.openConfirmMaintenanceModal(infoText);
    } else {
      setTimeout(() => {
        this.getMaintenanceList(this.hostIds, this.groupId);
        appEvents.emit(AppEvents.alertSuccess, [infoText]);
      }, 1000);
    }
    setTimeout(() => {
      document.dispatchEvent(new Event('iiris-maintenance-update'));
    }, 2 * 60 * 1000);
  }

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
              let infoText = 'Huolto on poistettu onnistuneesti.';
              if (this.stoppingOngoingMaintenance) {
                infoText = 'Huolto on keskeytetty. Järjestelmän tila päivittyy 1-2 minuutissa.';
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
              this.setMaintenanceUpdateTimeOut('Huolto on poistettu onnistuneesti.', true);
            }).catch((err: any) => {
              this.handleError(err);
            });
        }).catch((err: any) => {
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
        Object.keys(options).map(optionKey => {
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
            let infoText = 'Uusi huolto on käynnistetty onnistuneesti. Järjestelmän tila päivittyy 1-2 minuutissa.';
            if (maintenanceId) {
              infoText = 'Huolto on päivitetty onnistuneesti. Järjestelmän tila päivittyy 1-2 minuutissa.';
            }
            let showModal = true;
            // Show only info popup if maintenance is in future
            if (this.getCurrentTimeEpoch(startDate) > this.getCurrentTimeEpoch()) {
              if (maintenanceId) {
                infoText = 'Huolto on päivitetty onnistuneesti.';
              } else {
                infoText = 'Uusi huolto luotu onnistuneesti.';
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
  openMaintenanceModal = (maintenanceID?: string) => {
    console.log('Open maintenance modal');
    this.selectedMaintenanceId = maintenanceID;
    this.setState({ showMaintenanceModal: true });
    /* this.clearHostSelection();
    this.modalScope = {};
    this.modalScope.onCreateMaintenance = this.onCreateMaintenance.bind(this);
    this.modalScope.getCurrentTimeEpoch = this.getCurrentTimeEpoch.bind(this);
    this.modalScope.hosts = this.hosts;
    this.modalScope.user = this.user;
    this.modalScope.openAllMaintenancesModal = this.openAllMaintenancesModal.bind(this);
    if (maintenanceID) {
      this.modalScope.selectedMaintenance = this.allMaintenances.find((item: any) => item.id === maintenanceID);
    }
    const template =
      '<iiris-maintenance-modal hosts="hosts" on-create-maintenance="onCreateMaintenance" ' +
      'selected-maintenance="selectedMaintenance" user="user" ' +
      'get-current-time-epoch="getCurrentTimeEpoch" open-all-maintenances-modal="openAllMaintenancesModal"' +
      '></iiris-maintenance-modal>';
    appEvents.emit('show-modal', {
      templateHtml: template,
      model: this.modalScope,
      backdrop: true,
    }); */
  };

  /**
   * Open create maintenance modal
   */
  openAllMaintenancesModal = () => {
    this.setState({ showMaintenanceListModal: true });
    /* this.clearHostSelection();
    this.listModalScope = {};
    this.listModalScope.onCreateMaintenance = this.onCreateMaintenance.bind(this);
    this.listModalScope.allMaintenances = this.allMaintenances;
    this.listModalScope.openMaintenanceModal = this.openMaintenanceModal.bind(this);
    this.listModalScope.onStopMaintenance = this.onStopMaintenance.bind(this);
    this.listModalScope.onEditMaintenance = this.onEditMaintenance.bind(this);
    this.listModalScope.ongoingMaintenanceIds = this.ongoingMaintenances.map((item: any) => item.internalId);
    this.listModalScope.selectedMaintenanceId = this.selectedMaintenanceId;
    this.listModalScope.confirmIsVisible = false;
    this.listModalScope.confirmText = '';
    this.listModalScope.confirmAction = null;
    const template =
      '<iiris-maintenance-list-modal on-create-maintenance="onCreateMaintenance" ' +
      'all-maintenances="allMaintenances" open-maintenance-modal="openMaintenanceModal" ' +
      'on-stop-maintenance="onStopMaintenance" on-edit-maintenance="onEditMaintenance" ' +
      'ongoing-maintenance-ids="ongoingMaintenanceIds" selected-maintenance-id="selectedMaintenanceId" ' +
      'confirm-is-visible="confirmIsVisible" confirm-action="confirmAction" ' +
      'confirm-text="confirmText"></iiris-maintenance-list-modal>';
    appEvents.emit('show-modal', {
      templateHtml: template,
      model: this.listModalScope,
      backdrop: true,
    }); */
  };

  /**
   * Open maintenance confirmation modal
   */
   openConfirmMaintenanceModal = (confirmText: string) => {
    this.confirmModalScope = {};
    this.confirmModalScope.confirmText = confirmText;
    const template = '<iiris-maintenance-confirm-modal confirm-text="confirmText"></iiris-maintenance-confirm-modal>';
    appEvents.emit('show-modal', {
      templateHtml: template,
      model: this.confirmModalScope,
      backdrop: true,
    });
  };
  /* tslint:enable */

  constructor(props: Props) {
    super(props);
    this.state = {
      allMaintenances: [],
      showMaintenanceModal: false,
      showMaintenanceListModal: false,
      hosts: [],
    }
  }

  onClose = () => {
    locationService.partial({ viewPanel: null });
  };

  onToggleTVMode = () => {
    toggleKioskMode();
  };

  onOpenSettings = () => {
    locationService.partial({ editview: 'settings' });
  };

  onStarDashboard = () => {
    const { dashboard } = this.props;
    const dashboardSrv = getDashboardSrv();

    dashboardSrv.starDashboard(dashboard.id, dashboard.meta.isStarred).then((newState: any) => {
      dashboard.meta.isStarred = newState;
      this.forceUpdate();
    });
  };

  onPlaylistPrev = () => {
    playlistSrv.prev();
  };

  onPlaylistNext = () => {
    playlistSrv.next();
  };

  onPlaylistStop = () => {
    playlistSrv.stop();
    this.forceUpdate();
  };

  addCustomContent(actions: DashNavButtonModel[], buttons: ReactNode[]) {
    actions.map((action, index) => {
      const Component = action.component;
      const element = <Component {...this.props} key={`button-custom-${index}`} />;
      typeof action.index === 'number' ? buttons.splice(action.index, 0, element) : buttons.push(element);
    });
  }

  isPlaylistRunning() {
    return playlistSrv.isPlaying;
  }

  renderLeftActionsButton() {
    const { dashboard, kioskMode } = this.props;
    const { canStar, canShare, isStarred } = dashboard.meta;
    const buttons: ReactNode[] = [];
    const isLightTheme = contextSrv.user.lightTheme;

    if (kioskMode !== KioskMode.Off || this.isPlaylistRunning()) {
      return [];
    }

    if (canStar && !isLightTheme) {
      let desc = isStarred ? 'Unmark as favorite' : 'Mark as favorite';
      buttons.push(
        <DashNavButton
          tooltip={desc}
          icon={isStarred ? 'favorite' : 'star'}
          iconType={isStarred ? 'mono' : 'default'}
          iconSize="lg"
          onClick={this.onStarDashboard}
          key="button-star"
        />
      );
    }

    if (canShare && !isLightTheme) {
      let desc = 'Share dashboard or panel';
      buttons.push(
        <ModalsController key="button-share">
          {({ showModal, hideModal }) => (
            <DashNavButton
              tooltip={desc}
              icon="share-alt"
              iconSize="lg"
              onClick={() => {
                showModal(ShareModal, {
                  dashboard,
                  onDismiss: hideModal,
                });
              }}
            />
          )}
        </ModalsController>
      );
    }

    this.addCustomContent(customLeftActions, buttons);
    return buttons;
  }

  renderPlaylistControls() {
    return (
      <ButtonGroup key="playlist-buttons">
        <ToolbarButton tooltip="Go to previous dashboard" icon="backward" onClick={this.onPlaylistPrev} narrow />
        <ToolbarButton onClick={this.onPlaylistStop}>Stop playlist</ToolbarButton>
        <ToolbarButton tooltip="Go to next dashboard" icon="forward" onClick={this.onPlaylistNext} narrow />
      </ButtonGroup>
    );
  }

  renderTimeControls() {
    const { dashboard, updateTimeZoneForSession, hideTimePicker } = this.props;

    if (hideTimePicker) {
      return null;
    }

    return (
      <DashNavTimeControls dashboard={dashboard} onChangeTimeZone={updateTimeZoneForSession} key="time-controls" />
    );
  }

  findMaintenanceButton = (element: HTMLElement): HTMLElement|null => {
    if (element.id === "maintenance_button") {
        return element;
    } else if (element.parentElement) {
        return this.findMaintenanceButton(element.parentElement);
    } else {
        return null;
    }
};

  renderRightActionsButton() {
    const { dashboard, onAddPanel, isFullscreen, kioskMode } = this.props;
    const { canEdit, showSettings } = dashboard.meta;
    const { snapshot } = dashboard;
    const snapshotUrl = snapshot && snapshot.originalUrl;
    const buttons: ReactNode[] = [];
    const isLightTheme = contextSrv.user.lightTheme;
    const tvButton = (
      <ToolbarButton tooltip="Cycle view mode" icon="monitor" onClick={this.onToggleTVMode} key="tv-button" />
    );

    if (this.isPlaylistRunning()) {
      return [this.renderPlaylistControls(), this.renderTimeControls()];
    }

    if (kioskMode === KioskMode.TV) {
      return [this.renderTimeControls(), tvButton];
    }

    if (canEdit && !isFullscreen && !isLightTheme) {
      buttons.push(<ToolbarButton tooltip="Add panel" icon="panel-add" onClick={onAddPanel} key="button-panel-add" />);
      buttons.push(
        <ModalsController key="button-save">
          {({ showModal, hideModal }) => (
            <ToolbarButton
              tooltip="Save dashboard"
              icon="save"
              onClick={() => {
                showModal(SaveDashboardModalProxy, {
                  dashboard,
                  onDismiss: hideModal,
                });
              }}
            />
          )}
        </ModalsController>
      );
    }

    if (this.props.dashboard.maintenanceHostGroup) {
      buttons.push(
        <ToolbarButton key="manage_maintenances" tooltip="Manage Maintenances" id="maintenance_button" onClick={(e) => {
          this.findMaintenanceButton(e.target as any)?.blur();
          this.onOpenMaintenanceDialog();
        }}>
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
      );
    }
    if (this.props.dashboard.serviceInfoWikiUrl) {
      buttons.push(
        <ToolbarButton key="open_wiki" tooltip="Go To Wiki" onClick={() => this.onOpenWikiPage()}>
          <div style={{ width: '20px', height: '20px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 140 140" fill="#ffffff">
              <path d="M86.7,10h-6.3H80H24v120h92V46v-0.3v-6.3L86.7,10z M88,22.7L103.3,38H88V22.7z M108,122H32V18h48v28h28V122z" />
              <rect x="48" y="57" width="45" height="8" />
              <rect x="48" y="75" width="45" height="8" />
              <rect x="48" y="93" width="45" height="8" />
            </svg>
          </div>
        </ToolbarButton>
      );
    }

    if (snapshotUrl) {
      buttons.push(
        <ToolbarButton
          tooltip="Open original dashboard"
          onClick={() => this.gotoSnapshotOrigin(snapshotUrl)}
          icon="link"
          key="button-snapshot"
        />
      );
    }

    if (showSettings && !isLightTheme) {
      buttons.push(
        <ToolbarButton tooltip="Dashboard settings" icon="cog" onClick={this.onOpenSettings} key="button-settings" />
      );
    }

    this.addCustomContent(customRightActions, buttons);

    buttons.push(this.renderTimeControls());
    if (!isLightTheme) {
      buttons.push(tvButton);
    }
    return buttons;
  }

  gotoSnapshotOrigin(snapshotUrl: string) {
    window.location.href = textUtil.sanitizeUrl(snapshotUrl);
  }

  hideMaintenanceModal = () => {
    this.setState({ showMaintenanceModal: false });
  };

  hideMaintenanceListModal = () => {
    this.setState({ showMaintenanceListModal: false });
  };

  render() {
    const { isFullscreen, title, folderTitle } = this.props;
    const onGoBack = isFullscreen ? this.onClose : undefined;
    const folderTitleByTheme = contextSrv.user.lightTheme ? '' : folderTitle;

    const titleHref = locationUtil.updateSearchParams(window.location.href, '?search=open');
    const parentHref = locationUtil.updateSearchParams(window.location.href, '?search=open&folder=current');

    const selectedMaintenance = this.state.allMaintenances.find((item: any) => item.id === this.selectedMaintenanceId);

    return (
      <div className="iiris-custom-toolbar">
        {this.props.dashboard.dashboardLogo ? (
          <div className="iiris-customer-logo">
            <img src={this.props.dashboard.dashboardLogo} />
          </div>
        ) : null}
        <PageToolbar
          pageIcon={isFullscreen ? undefined : 'apps'}
          title={title}
          parent={folderTitleByTheme}
          titleHref={titleHref}
          parentHref={parentHref}
          onGoBack={onGoBack}
          leftItems={this.renderLeftActionsButton()}
        >
          {this.renderRightActionsButton()}
        </PageToolbar>
        <IirisMaintenanceModal
          show={this.state.showMaintenanceModal}
          onDismiss={this.hideMaintenanceModal}
          openAllMaintenancesModal={this.openAllMaintenancesModal}
          hosts={this.state.hosts}
          selectedMaintenance={selectedMaintenance}
        />
        <IirisMaintenanceListModal
          show={this.state.showMaintenanceListModal}
          allMaintenances={this.state.allMaintenances}
          openMaintenanceModal={this.openMaintenanceModal}
          onDismiss={this.hideMaintenanceListModal}
          onEditMaintenance={this.onEditMaintenance}
          onStopMaintenance={this.onStopMaintenance}
        />
      </div>
    );
  }
}

export default connector(DashNav);
