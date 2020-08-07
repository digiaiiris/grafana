// Libaries
import React, { PureComponent } from 'react';
import { replaceTemplateVars, getZabbix, getHostGroups, getHosts, getMaintenances } from './common_tools';
import { connect } from 'react-redux';
import { e2e } from '@grafana/e2e';
// Utils & Services
import { appEvents } from 'app/core/app_events';
import { PlaylistSrv } from 'app/features/playlist/playlist_srv';
// Components
import { DashNavButton } from './DashNavButton';
import { DashNavTimeControls } from './DashNavTimeControls';
import { ModalsController } from '@grafana/ui';
import { BackButton } from 'app/core/components/BackButton/BackButton';
// State
import { updateLocation } from 'app/core/actions';
// Types
import { DashboardModel } from '../../state';
import { CoreEvents, StoreState } from 'app/types';
import { ShareModal } from 'app/features/dashboard/components/ShareModal';
import { SaveDashboardModalProxy } from 'app/features/dashboard/components/SaveDashboard/SaveDashboardModalProxy';
import { sanitizeUrl } from 'app/core/utils/text';

export interface OwnProps {
  dashboard: DashboardModel;
  editview: string;
  isEditing: boolean;
  isFullscreen: boolean;
  $injector: any;
  updateLocation: typeof updateLocation;
  onAddPanel: () => void;
}

export interface StateProps {
  location: any;
}

type Props = StateProps & OwnProps;

export class DashNav extends PureComponent<Props> {
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
    document.dispatchEvent(new Event('iiris-maintenance-update'));
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
    getMaintenances(hostIds, groupId, this.availableDatasources, this.datasourceSrv)
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
                period: endTime - selectedMaintenance.active_since,
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
    if (maintenanceID) {
      this.modalScope.selectedMaintenance = this.allMaintenances.find((item: any) => item.id === maintenanceID);
    }
    const template =
      '<iiris-maintenance-modal hosts="hosts" on-create-maintenance="onCreateMaintenance" ' +
      'selected-maintenance="selectedMaintenance" user="user" ' +
      'get-current-time-epoch="getCurrentTimeEpoch"></iiris-maintenance-modal>';
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

  onDahboardNameClick = () => {
    appEvents.emit(CoreEvents.showDashSearch);
  };

  onFolderNameClick = () => {
    appEvents.emit(CoreEvents.showDashSearch, {
      query: 'folder:current',
    });
  };

  onClose = () => {
    if (this.props.editview) {
      this.props.updateLocation({
        query: { editview: null },
        partial: true,
      });
    } else {
      this.props.updateLocation({
        query: { panelId: null, edit: null, fullscreen: null, tab: null },
        partial: true,
      });
    }
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

  renderDashboardTitleSearchButton() {
    const { dashboard } = this.props;

    const folderTitle = dashboard.meta.folderTitle;
    const haveFolder = dashboard.meta.folderId > 0;

    return (
      <>
        <div>
          <div className="navbar-page-btn">
            {!this.isInFullscreenOrSettings && <i className="gicon gicon-dashboard" />}
            {haveFolder && (
              <>
                <a className="navbar-page-btn__folder" onClick={this.onFolderNameClick}>
                  {folderTitle}
                </a>
                <i className="fa fa-chevron-right navbar-page-btn__folder-icon" />
              </>
            )}
            <a onClick={this.onDahboardNameClick}>
              {dashboard.title} <i className="fa fa-caret-down navbar-page-btn__search" />
            </a>
          </div>
        </div>
        {this.isSettings && <span className="navbar-settings-title">&nbsp;/ Settings</span>}
        <div className="navbar__spacer" />
      </>
    );
  }

  get isInFullscreenOrSettings() {
    return this.props.editview || this.props.isFullscreen;
  }

  get isSettings() {
    return this.props.editview;
  }

  renderBackButton() {
    return (
      <div className="navbar-edit">
        <BackButton onClick={this.onClose} aria-label={e2e.pages.Dashboard.Toolbar.selectors.backArrow} />
      </div>
    );
  }

  render() {
    const { dashboard, onAddPanel, location } = this.props;
    const { canStar, canSave, canShare, showSettings, isStarred } = dashboard.meta;
    const { snapshot } = dashboard;
    const snapshotUrl = snapshot && snapshot.originalUrl;

    return (
      <div className="navbar">
        {this.isInFullscreenOrSettings && this.renderBackButton()}
        {this.renderDashboardTitleSearchButton()}

        {this.playlistSrv.isPlaying && (
          <div className="navbar-buttons navbar-buttons--playlist">
            <DashNavButton
              tooltip="Go to previous dashboard"
              classSuffix="tight"
              icon="fa fa-step-backward"
              onClick={this.onPlaylistPrev}
            />
            <DashNavButton
              tooltip="Stop playlist"
              classSuffix="tight"
              icon="fa fa-stop"
              onClick={this.onPlaylistStop}
            />
            <DashNavButton
              tooltip="Go to next dashboard"
              classSuffix="tight"
              icon="fa fa-forward"
              onClick={this.onPlaylistNext}
            />
          </div>
        )}

        <div className="navbar-buttons navbar-buttons--actions">
          {canSave && (
            <DashNavButton
              tooltip="Add panel"
              classSuffix="add-panel"
              icon="gicon gicon-add-panel"
              onClick={onAddPanel}
            />
          )}

          {canStar && (
            <DashNavButton
              tooltip="Mark as favorite"
              classSuffix="star"
              icon={`${isStarred ? 'fa fa-star' : 'fa fa-star-o'}`}
              onClick={this.onStarDashboard}
            />
          )}

          {canShare && (
            <ModalsController>
              {({ showModal, hideModal }) => (
                <DashNavButton
                  tooltip="Share dashboard"
                  classSuffix="share"
                  icon="fa fa-share-square-o"
                  onClick={() => {
                    showModal(ShareModal, {
                      dashboard,
                      onDismiss: hideModal,
                    });
                  }}
                />
              )}
            </ModalsController>
          )}

          {canSave && (
            <ModalsController>
              {({ showModal, hideModal }) => (
                <DashNavButton
                  tooltip="Save dashboard"
                  classSuffix="save"
                  icon="fa fa-save"
                  onClick={() => {
                    showModal(SaveDashboardModalProxy, {
                      dashboard,
                      onDismiss: hideModal,
                    });
                  }}
                />
              )}
            </ModalsController>
          )}

          {snapshotUrl && (
            <DashNavButton
              tooltip="Open original dashboard"
              classSuffix="snapshot-origin"
              icon="gicon gicon-link"
              href={sanitizeUrl(snapshotUrl)}
            />
          )}

          {showSettings && (
            <DashNavButton
              tooltip="Dashboard settings"
              classSuffix="settings"
              icon="gicon gicon-cog"
              onClick={this.onOpenSettings}
            />
          )}
        </div>

        <div className="navbar-buttons navbar-buttons--tv">
          <DashNavButton
            tooltip="Cycle view mode"
            classSuffix="tv"
            icon="fa fa-desktop"
            onClick={this.onToggleTVMode}
          />
        </div>

        {!dashboard.timepicker.hidden && (
          <div className="navbar-buttons">
            {this.props.dashboard.maintenanceHostGroup ? (
              <DashNavButton
                icon="fa fa-wrench"
                tooltip="Manage Maintenances"
                classSuffix="manage-maintenances"
                onClick={this.onOpenMaintenanceDialog}
              />
            ) : null} {this.props.dashboard.serviceInfoWikiUrl ? (
              <DashNavButton
                icon="fa fa-file-text-o"
                tooltip="Go To Wiki"
                classSuffix="open-wiki"
                onClick={this.onOpenWikiPage}
              />
            ) : null}

            <DashNavTimeControls dashboard={dashboard} location={location} updateLocation={updateLocation} />
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: StoreState) => ({
  location: state.location,
});

const mapDispatchToProps = {
  updateLocation,
};

export default connect(mapStateToProps, mapDispatchToProps)(DashNav);
