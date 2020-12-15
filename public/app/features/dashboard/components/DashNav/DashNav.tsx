// Libaries
import React, { PureComponent, FC, ReactNode } from 'react';
import { replaceTemplateVars, getZabbix, getHostGroups, getHosts, getMaintenances } from './common_tools';
import { connect, MapDispatchToProps } from 'react-redux';
import { css } from 'emotion';
// Utils & Services
import { appEvents } from 'app/core/app_events';
import { PlaylistSrv } from 'app/features/playlist/playlist_srv';
// Components
import { DashNavButton } from './DashNavButton';
import { DashNavTimeControls } from './DashNavTimeControls';
import { Icon, ModalsController } from '@grafana/ui';
import { textUtil } from '@grafana/data';
import { BackButton } from 'app/core/components/BackButton/BackButton';
// State
import { updateLocation } from 'app/core/actions';
import { updateTimeZoneForSession } from 'app/features/profile/state/reducers';
// Types
import { DashboardModel } from '../../state';
import { CoreEvents, StoreState } from 'app/types';
import { ShareModal } from 'app/features/dashboard/components/ShareModal';
import { SaveDashboardModalProxy } from 'app/features/dashboard/components/SaveDashboard/SaveDashboardModalProxy';

export interface OwnProps {
  dashboard: DashboardModel;
  isFullscreen: boolean;
  $injector: any;
  onAddPanel: () => void;
}

interface DispatchProps {
  updateTimeZoneForSession: typeof updateTimeZoneForSession;
  updateLocation: typeof updateLocation;
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

export interface StateProps {
  location: any;
}

type Props = StateProps & OwnProps & DispatchProps;

class DashNav extends PureComponent<Props> {
  /* eslint-disable */
  /* tslint:disable */
  hosts: any;
  hostGroup: string;
  groupId: string;
  availableDatasources: any[];
  datasourceSrv: any;
  modalScope: any;
  listModalScope: any;
  rootScope: any;
  hostIds: string[];
  ongoingMaintenances: any[];
  error: boolean;
  user: string;
  allMaintenances: any[];
  selectedMaintenanceId: string;
  maintenanceIconStyle: string;
  allHostsTitle = 'Kaikki palvelimet';

  onOpenMaintenanceDialog = () => {
    const { $injector, dashboard } = this.props;
    const templateSrv = $injector.get('templateSrv');
    const contextSrv = $injector.get('contextSrv');
    this.datasourceSrv = $injector.get('datasourceSrv');
    this.rootScope = $injector.get('$rootScope');
    this.ongoingMaintenances = [];
    this.error = false;
    this.user = contextSrv.user.name;
    this.selectedMaintenanceId = '';
    this.maintenanceIconStyle = '';
    this.availableDatasources = this.datasourceSrv
      .getMetricSources()
      .filter((datasource: any) => datasource.meta.id.indexOf('zabbix-datasource') > -1 && datasource.value)
      .map((ds: any) => ds.name);
    this.hosts = {
      selected: [],
      options: [],
      allSelected: true,
    };
    this.hostGroup = replaceTemplateVars(dashboard.maintenanceHostGroup, templateSrv);
    getHostGroups(this.hostGroup, this.availableDatasources, this.datasourceSrv)
      .then((groupId: string) => {
        this.groupId = groupId;
        getHosts(this.hostGroup, this.availableDatasources, this.datasourceSrv).then((hosts: any[]) => {
          // Filter out hosts ending with -sla _sla .sla -SLA _SLA .SLA
          this.hosts.options = hosts.filter((hostItem: any) => !/[-_.](sla|SLA)$/.test(hostItem.text));
          this.hostIds = hosts.map((host: any) => host.value);
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
   * Is maintenance ongoing
   * @param {any} maintenance
   * @returns {boolean}
   */
  isOngoingMaintenance = (maintenance: any) => {
    let isOngoing = false;
    if (maintenance) {
      if (maintenance.startTime) {
        const curTime = new Date().getTime() / 1000;
        if (
          curTime >= maintenance.startTime &&
          curTime <= maintenance.endTime &&
          curTime >= maintenance.activeSince &&
          curTime <= maintenance.activeTill
        ) {
          isOngoing = true;
        }
      }
    }
    return isOngoing;
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
      for (let i = 0; i < this.hosts.options.length; i++) {
        this.hosts.selected[i] = this.hosts.allSelected;
        this.hosts.options[i].checked = this.hosts.allSelected;
      }
    }
  };

  /**
   * Handling for errors
   * @param {any} error
   */
  handleError = (error: any) => {
    console.log(error);
    if (typeof error === 'object' && Object.keys(error).length > 0) {
      appEvents.emit('alert-error', [JSON.stringify(error)]);
    }
  };

  /**
   * Get all maintenances from Zabbix
   * @param {string} groupid Get maintenances from specified group
   */
  getMaintenanceList = (hostIds: string[], groupId: string) => {
    getMaintenances(hostIds, [groupId], this.availableDatasources, this.datasourceSrv)
      .then((maintenances: any) => {
        if (maintenances.length > 0) {
          this.ongoingMaintenances = [];
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
            if (this.isOngoingMaintenance(maintenance)) {
              const endTime = new Date(maintenance.endTime * 1000);
              const maintenanceEnds = this.parseDateToString(endTime);
              let hosts = '';
              if (maintenance.hosts && maintenance.hosts.length > 0) {
                maintenance.hosts.map((host: any, index: number) => {
                  hosts += host.name + (index < maintenance.hosts.length - 1 ? ', ' : '');
                });
              } else {
                hosts = this.allHostsTitle;
              }
              this.ongoingMaintenances.push({
                description: maintenance.name.split('|')[0],
                caller: maintenance.name.split('|').length > 1 ? maintenance.name.split('|')[1] : '',
                endtime: maintenanceEnds,
                active_since: maintenance.startTime,
                active_till: maintenance.endTime,
                id: maintenance.id,
                internalId: maintenance.internalId,
                hosts,
                periodicMaintenance: maintenance.maintenanceType !== 0 ? true : false,
                maintenanceType: maintenance.maintenanceType,
              });
            }
          });
          const curTime = new Date().getTime() / 1000;
          this.allMaintenances = this.allMaintenances.filter(
            maintenance => maintenance.endTime > curTime && maintenance.activeTill > curTime
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
        this.listModalScope.allMaintenances = this.allMaintenances;
        this.listModalScope.ongoingMaintenanceIds = this.ongoingMaintenances.map(item => item.internalId);
        this.listModalScope.$apply();
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
      window.top.location.href = dashboard.serviceInfoWikiUrl;
    } else {
      // Tell parent window to navigate to given URL
      const messageObj = {
        relaytarget: 'wiki',
        relayparams: dashboard.serviceInfoWikiUrl,
      };
      window.top.postMessage(messageObj, '*');
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
    if (selectedMaintenance) {
      isOngoing = true;
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
        this.listModalScope.confirmAction = this.onRemoveMaintenance.bind(this);
      } else {
        // Period has already started so we can just set the end time of period
        this.listModalScope.confirmAction = this.onUpdateMaintenanceEndTime.bind(this);
      }
    }
    this.listModalScope.$apply();
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
    if (!endTime) {
      endTime = this.getCurrentTimeEpoch();
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
          // In case of single maintenances we need to also set the period end time
          if (!selectedMaintenance.maintenanceType) {
            options['timeperiods'] = [
              {
                timeperiod_type: 0,
                period: (endTime || 0) - selectedMaintenance.active_since,
                start_date: selectedMaintenance.active_since,
              },
            ];
          }
          zabbix.zabbixAPI
            .request('maintenance.update', options)
            .then((answer: any) => {
              setTimeout(() => {
                this.getMaintenanceList(this.hostIds, this.groupId);
                document.dispatchEvent(new Event('iiris-maintenance-update'));
              }, 1000);
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
              setTimeout(() => {
                this.getMaintenanceList(this.hostIds, this.groupId);
                document.dispatchEvent(new Event('iiris-maintenance-update'));
              }, 1000);
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
        // Check if we are updagting an existing maintenance
        if (maintenanceId) {
          maintenanceObj['maintenanceid'] = maintenanceId;
          apiCommand = 'maintenance.update';
        }
        zabbix.zabbixAPI
          .request(apiCommand, maintenanceObj)
          .then((answer: any) => {
            setTimeout(() => {
              this.getMaintenanceList(this.hostIds, this.groupId);
              document.dispatchEvent(new Event('iiris-maintenance-update'));
            }, 1000);
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
    this.clearHostSelection();
    this.modalScope = this.rootScope.$new();
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
      scope: this.modalScope,
      backdrop: 'static',
    });
  };

  /**
   * Open create maintenance modal
   */
  openAllMaintenancesModal = () => {
    this.clearHostSelection();
    this.listModalScope = this.rootScope.$new();
    this.listModalScope.onCreateMaintenance = this.onCreateMaintenance.bind(this);
    this.listModalScope.allMaintenances = this.allMaintenances;
    this.listModalScope.openMaintenanceModal = this.openMaintenanceModal.bind(this);
    this.listModalScope.onStopMaintenance = this.onStopMaintenance.bind(this);
    this.listModalScope.onEditMaintenance = this.onEditMaintenance.bind(this);
    this.listModalScope.ongoingMaintenanceIds = this.ongoingMaintenances.map(item => item.internalId);
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
      scope: this.listModalScope,
      backdrop: 'static',
    });
  };
  /* tslint:enable */

  playlistSrv: PlaylistSrv;

  constructor(props: Props) {
    super(props);
    this.playlistSrv = this.props.$injector.get('playlistSrv');
  }

  onFolderNameClick = () => {
    this.props.updateLocation({
      query: { search: 'open', folder: 'current' },
      partial: true,
    });
  };

  onClose = () => {
    this.props.updateLocation({
      query: { viewPanel: null },
      partial: true,
    });
  };

  onToggleTVMode = () => {
    appEvents.emit(CoreEvents.toggleKioskMode);
  };

  onOpenSettings = () => {
    this.props.updateLocation({
      query: { editview: 'settings' },
      partial: true,
    });
  };

  onStarDashboard = () => {
    const { dashboard, $injector } = this.props;
    const dashboardSrv = $injector.get('dashboardSrv');

    dashboardSrv.starDashboard(dashboard.id, dashboard.meta.isStarred).then((newState: any) => {
      dashboard.meta.isStarred = newState;
      this.forceUpdate();
    });
  };

  onPlaylistPrev = () => {
    this.playlistSrv.prev();
  };

  onPlaylistNext = () => {
    this.playlistSrv.next();
  };

  onPlaylistStop = () => {
    this.playlistSrv.stop();
    this.forceUpdate();
  };

  onDashboardNameClick = () => {
    this.props.updateLocation({
      query: { search: 'open' },
      partial: true,
    });
  };

  addCustomContent(actions: DashNavButtonModel[], buttons: ReactNode[]) {
    actions.map((action, index) => {
      const Component = action.component;
      const element = <Component {...this.props} key={`button-custom-${index}`} />;
      typeof action.index === 'number' ? buttons.splice(action.index, 0, element) : buttons.push(element);
    });
  }

  renderLeftActionsButton() {
    const { dashboard } = this.props;
    const { canStar, canShare, isStarred } = dashboard.meta;

    const buttons: ReactNode[] = [];
    if (canStar) {
      buttons.push(
        <DashNavButton
          tooltip="Mark as favorite"
          classSuffix="star"
          icon={isStarred ? 'favorite' : 'star'}
          iconType={isStarred ? 'mono' : 'default'}
          iconSize="lg"
          noBorder={true}
          onClick={this.onStarDashboard}
          key="button-star"
        />
      );
    }

    if (canShare) {
      buttons.push(
        <ModalsController key="button-share">
          {({ showModal, hideModal }) => (
            <DashNavButton
              tooltip="Share dashboard"
              classSuffix="share"
              icon="share-alt"
              iconSize="lg"
              noBorder={true}
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

  renderDashboardTitleSearchButton() {
    const { dashboard, isFullscreen } = this.props;

    const folderSymbol = css`
      margin-right: 0 4px;
    `;
    const mainIconClassName = css`
      margin-right: 8px;
      margin-bottom: 3px;
    `;

    const folderTitle = dashboard.meta.folderTitle;
    const haveFolder = (dashboard.meta.folderId ?? 0) > 0;

    return (
      <>
        <div>
          <div className="navbar-page-btn">
            {!isFullscreen && <Icon name="apps" size="lg" className={mainIconClassName} />}
            {haveFolder && (
              <>
                <a className="navbar-page-btn__folder" onClick={this.onFolderNameClick}>
                  {folderTitle} <span className={folderSymbol}>/</span>
                </a>
              </>
            )}
            <a onClick={this.onDashboardNameClick}>{dashboard.title}</a>
          </div>
        </div>
        <div className="navbar-buttons navbar-buttons--actions">{this.renderLeftActionsButton()}</div>
        <div className="navbar__spacer" />
      </>
    );
  }

  renderBackButton() {
    return (
      <div className="navbar-edit">
        <BackButton surface="dashboard" onClick={this.onClose} />
      </div>
    );
  }

  renderRightActionsButton() {
    const { dashboard, onAddPanel } = this.props;
    const { canSave, showSettings } = dashboard.meta;
    const { snapshot } = dashboard;
    const snapshotUrl = snapshot && snapshot.originalUrl;

    const buttons: ReactNode[] = [];
    if (canSave) {
      buttons.push(
        <DashNavButton
          classSuffix="save"
          tooltip="Add panel"
          icon="panel-add"
          onClick={onAddPanel}
          iconType="mono"
          iconSize="xl"
          key="button-panel-add"
        />
      );
      buttons.push(
        <ModalsController key="button-save">
          {({ showModal, hideModal }) => (
            <DashNavButton
              tooltip="Save dashboard"
              classSuffix="save"
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

    if (snapshotUrl) {
      buttons.push(
        <DashNavButton
          tooltip="Open original dashboard"
          classSuffix="snapshot-origin"
          href={textUtil.sanitizeUrl(snapshotUrl)}
          icon="link"
          key="button-snapshot"
        />
      );
    }

    if (showSettings) {
      buttons.push(
        <DashNavButton
          tooltip="Dashboard settings"
          classSuffix="settings"
          icon="cog"
          onClick={this.onOpenSettings}
          key="button-settings"
        />
      );
    }

    this.addCustomContent(customRightActions, buttons);
    return buttons;
  }

  render() {
    const { dashboard, location, isFullscreen, updateTimeZoneForSession } = this.props;

    return (
      <div className="navbar">
        {isFullscreen && this.renderBackButton()}
        {this.renderDashboardTitleSearchButton()}

        {this.playlistSrv.isPlaying && (
          <div className="navbar-buttons navbar-buttons--playlist">
            <DashNavButton
              tooltip="Go to previous dashboard"
              classSuffix="tight"
              icon="step-backward"
              onClick={this.onPlaylistPrev}
            />
            <DashNavButton
              tooltip="Stop playlist"
              classSuffix="tight"
              icon="square-shape"
              onClick={this.onPlaylistStop}
            />
            <DashNavButton
              tooltip="Go to next dashboard"
              classSuffix="tight"
              icon="forward"
              onClick={this.onPlaylistNext}
            />
          </div>
        )}

        <div className="navbar-buttons navbar-buttons--actions">{this.renderRightActionsButton()}</div>

        <div className="navbar-buttons navbar-buttons--tv">
          <DashNavButton tooltip="Cycle view mode" classSuffix="tv" icon="monitor" onClick={this.onToggleTVMode} />
        </div>

        {!dashboard.timepicker.hidden && (
          <div className="navbar-buttons">
            {this.props.dashboard.maintenanceHostGroup ? (
              <DashNavButton
                tooltip="Manage Maintenances"
                classSuffix="manage-maintenances"
                onClick={this.onOpenMaintenanceDialog}
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
              </DashNavButton>
            ) : null}
            {this.props.dashboard.serviceInfoWikiUrl ? (
              <DashNavButton tooltip="Go To Wiki" classSuffix="open-wiki" onClick={this.onOpenWikiPage}>
                <div style={{ width: '20px', height: '20px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 140 140" fill="#ffffff">
                    <path d="M86.7,10h-6.3H80H24v120h92V46v-0.3v-6.3L86.7,10z M88,22.7L103.3,38H88V22.7z M108,122H32V18h48v28h28V122z" />
                    <rect x="48" y="57" width="45" height="8" />
                    <rect x="48" y="75" width="45" height="8" />
                    <rect x="48" y="93" width="45" height="8" />
                  </svg>
                </div>
              </DashNavButton>
            ) : null}

            <DashNavTimeControls
              dashboard={dashboard}
              location={location}
              onChangeTimeZone={updateTimeZoneForSession}
            />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: StoreState) => ({
  location: state.location,
});

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = {
  updateLocation,
  updateTimeZoneForSession,
};

export default connect(mapStateToProps, mapDispatchToProps)(DashNav);
