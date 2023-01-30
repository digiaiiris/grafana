import React, { FC, ReactNode, useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { locationUtil, textUtil, AppEvents } from '@grafana/data';
import { locationService, getTemplateSrv, getDataSourceSrv } from '@grafana/runtime';
import { ButtonGroup, ModalsController, ToolbarButton, PageToolbar, useForceUpdate } from '@grafana/ui';
import appEvents from 'app/core/app_events';
import config from 'app/core/config';
import { contextSrv } from 'app/core/core';
import { toggleKioskMode } from 'app/core/navigation/kiosk';
import { DashboardCommentsModal } from 'app/features/dashboard/components/DashboardComments/DashboardCommentsModal';
import { SaveDashboardProxy } from 'app/features/dashboard/components/SaveDashboard/SaveDashboardProxy';
import { ShareModal } from 'app/features/dashboard/components/ShareModal';
import { playlistSrv } from 'app/features/playlist/PlaylistSrv';
import { updateTimeZoneForSession } from 'app/features/profile/state/reducers';
import { KioskMode } from 'app/types';

import { getDashboardSrv } from '../../services/DashboardSrv';
import { DashboardModel } from '../../state';

import { DashNavButton } from './DashNavButton';
import { DashNavTimeControls } from './DashNavTimeControls';
import { IirisMaintenanceConfirmModal } from './IirisMaintenanceConfirmModal';
import { IirisMaintenanceListModal } from './IirisMaintenanceListModal';
import { IirisMaintenanceModal } from './IirisMaintenanceModal';
import {
  replaceTemplateVars,
  getZabbix,
  getHostGroups,
  getHostsFromGroup,
  getMaintenances,
  getOngoingMaintenances,
} from './common_tools';

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

export const DashNav = React.memo<Props>((props) => {
  // Previous state variables
  const [allMaintenancesState, setAllMaintenancesState] = useState<any[]>([]);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState<boolean>(false);
  const [showMaintenanceListModal, setShowMaintenanceListModal] = useState<boolean>(false);
  const [showMaintenanceConfirmModal, setShowMaintenanceConfirmModal] = useState<boolean>(false);
  const [hostsState, setHostsState] = useState<object[]>([]);
  const [selectedMaintenance, setSelectedMaintenance] = useState<any>(undefined);
  const [confirmIsVisible, setConfirmIsVisible] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>('');
  const [confirmAction, setConfirmAction] = useState<any>(undefined);
  const [ongoingMaintenanceIds, setOngoingMaintenanceIds] = useState<string[]>([]);

  // Previous class variables
  const [hostOptions, setHostOptions] = useState<object[]>([]);
  const [hostSelected, setHostSelected] = useState<object>({});
  const [hostGroup, setHostGroup] = useState<any>({});
  const [groupId, setGroupId] = useState<any>({});
  const [availableDatasources, setAvailableDatasources] = useState<any>({});
  const [datasourceSrv, setDatasourceSrv] = useState<any>({});
  const [hostIds, setHostIds] = useState<any>({});
  const [ongoingMaintenances, setOngoingMaintenances] = useState<any>({});
  const [allMaintenancesClass, setAllMaintenancesClass] = useState<object[]>([]);
  const [selectedMaintenanceId, setSelectedMaintenanceId] = useState<any>({});
  const [stoppingOngoingMaintenance, setStoppingOngoingMaintenance] = useState<any>({});
  const [texts, setTexts] = useState<any>({});
  const [language, setLanguage] = useState<string>('fi');

  // Uudet muuttujat
  const [allSelected, setAllSelected] = useState<boolean>(true);
  console.log(hostSelected, allSelected);

  // Iiris language
  //this.texts = contextSrv.getLocalizedTexts();
  setLanguage(localStorage.getItem('iiris_language') || 'fi');
  useEffect(() => {
    setTexts(language);
  }, [language]);

  const sortHostNames = (hostA: any, hostB: any) => {
    const nameA = hostA.text.toLowerCase();
    const nameB = hostB.text.toLowerCase();
    if (nameA < nameB) {
      return -1;
    } else if (nameA > nameB) {
      return 1;
    }
    return 0;
  };

  const onOpenMaintenanceDialog = (loadAllHosts?: boolean, givenHostGroup?: string, givenDataSources?: string[]) => {
    const { dashboard } = props;
    const templateSrv = getTemplateSrv();
    setDatasourceSrv(getDataSourceSrv());
    setOngoingMaintenances([]);
    setSelectedMaintenanceId('');
    if (givenDataSources && givenDataSources.length > 0) {
      setAvailableDatasources(givenDataSources);
    } else if (dashboard.selectedDatasource) {
      setAvailableDatasources([dashboard.selectedDatasource]);
    } else {
      setAvailableDatasources(
        datasourceSrv
          .getMetricSources()
          .filter((datasource: any) => datasource.meta.id.indexOf('zabbix-datasource') > -1 && datasource.value)
          .map((ds: any) => ds.name)
      );
    }
    if (givenHostGroup) {
      setHostGroup(givenHostGroup);
    } else {
      setHostGroup(dashboard.maintenanceHostGroup);
    }
    setHostOptions([]);
    setHostSelected({});
    setAllSelected(true);
    setHostGroup(replaceTemplateVars(hostGroup, templateSrv));
    getHostGroups(hostGroup, availableDatasources, datasourceSrv)
      .then((groupId: string) => {
        setGroupId(groupId);
        if (loadAllHosts) {
          getZabbix(availableDatasources, datasourceSrv).then((zabbix: any) => {
            zabbix.zabbixAPI.request('host.get', { output: ['host', 'hostid', 'name'] }).then((hosts: any) => {
              setHostOptions(
                hosts.map((hostItem: any) => ({ text: hostItem.host, value: hostItem.hostid })).sort(sortHostNames)
              );
              setHostsState(hostOptions);
              setHostIds(hosts.map((host: any) => host.hostid));
              getMaintenanceList(hostIds);
              clearHostSelection();
            });
          });
        } else {
          getHostsFromGroup(groupId, availableDatasources, datasourceSrv).then((hosts: any[]) => {
            // Filter out hosts ending with -sla _sla .sla -SLA _SLA .SLA
            setHostOptions(
              hosts
                .filter((host: any) => !/[-_.](sla|SLA)$/.test(host.name) && host.status === '0')
                .map((host: any) => ({ text: host.name, value: host.hostid }))
                .sort(sortHostNames)
            );
            setHostsState(hostOptions);
            setHostIds(hosts.map((host: any) => host.hostid));
            getMaintenanceList(hostIds, groupId);
            clearHostSelection();
          });
        }
      })
      .catch((err: any) => {
        handleError(err);
      });
    openAllMaintenancesModal();
  };

  /**
   * Parse given Date object to string
   * @param {Date} newDate
   * @returns {string}
   */
  /*
  const parseDateToString = (newDate: Date) => {
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
  */

  /**
   * Clear selection for hosts and set all selected by default
   */
  const clearHostSelection = () => {
    setAllSelected(true);
    if (hostOptions.length > 0) {
      hostOptions.forEach((option: any, index: number) => {
        console.log('clearHostSelection:', option, index);
      });
    }
  };

  /**
   * Handling for errors
   * @param {any} error
   */
  const handleError = (error: any) => {
    console.log(error);
    if (typeof error === 'object' && Object.keys(error).length > 0) {
      appEvents.emit(AppEvents.alertError, [JSON.stringify(error)]);
    }
  };

  /**
   * Get all maintenances from Zabbix
   * @param {string} groupid Get maintenances from specified group
   */
  const getMaintenanceList = (hostIds: string[], groupId?: string) => {
    const showOnlyOneUpcomingPerPeriod = true;
    let groupIds: any = null;
    if (groupId) {
      groupIds = [groupId];
    }
    getMaintenances(hostIds, groupIds, availableDatasources, datasourceSrv, showOnlyOneUpcomingPerPeriod)
      .then((maintenances: any) => {
        if (maintenances.length > 0) {
          setOngoingMaintenances(getOngoingMaintenances(maintenances));
          setAllMaintenancesClass([]);
          maintenances.map((maintenance: any) => {
            if (maintenance.maintenanceType === 0) {
              maintenance.maintenanceTypeString = texts.oneTimeAbbr;
              maintenance.maintenanceTypeStringFull = `${texts.oneTime} ${texts.maintenance}`;
            } else if (maintenance.maintenanceType === 2) {
              maintenance.maintenanceTypeString = texts.dailyAbbr;
              maintenance.maintenanceTypeStringFull = `${texts.daily} ${texts.maintenance}`;
            } else if (maintenance.maintenanceType === 3) {
              maintenance.maintenanceTypeString = texts.weeklyAbbr;
              maintenance.maintenanceTypeStringFull = `${texts.weekly} ${texts.maintenance}`;
            } else if (maintenance.maintenanceType === 4) {
              maintenance.maintenanceTypeString = texts.monthlyAbbr;
              maintenance.maintenanceTypeStringFull = `${texts.monthly} ${texts.maintenance}`;
            } else {
              maintenance.maintenanceTypeString = '';
            }
            setAllMaintenancesClass((allMaintenancesClass) => [...allMaintenancesClass, maintenance]);
          });
          const curTime = new Date().getTime() / 1000;
          setAllMaintenancesClass(
            allMaintenancesClass.filter(
              (maintenance: any) => maintenance.endTime > curTime && maintenance.activeTill > curTime
            )
          );
        } else {
          setOngoingMaintenances([]);
          setAllMaintenancesClass([]);
        }
        // this.listModalScope.allMaintenances = this.allMaintenances;
        setOngoingMaintenanceIds(ongoingMaintenances.map((item: any) => item.internalId));
        setAllMaintenancesState(allMaintenancesClass);
      })
      .catch((err: any) => {
        handleError(err);
      });
  };

  /**
   * Callback for clicking wiki icon
   */
  const onOpenWikiPage = () => {
    const { dashboard } = props;
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
  const getCurrentTimeEpoch = (currentTime?: Date) => {
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
  const onStopMaintenance = (maintenanceID: string) => {
    let selectedMaintenance = ongoingMaintenances.find((item: any) => item.id === maintenanceID);
    let isOngoing = false;
    const curTime = getCurrentTimeEpoch();
    setStoppingOngoingMaintenance(false);
    if (selectedMaintenance) {
      isOngoing = true;
      setStoppingOngoingMaintenance(true);
    } else {
      selectedMaintenance = allMaintenancesClass.find((item: any) => item.id === maintenanceID);
    }
    let confirmIsVisible = true;
    let confirmText = '';
    let confirmAction: any;
    if (isOngoing && !selectedMaintenance.maintenanceType) {
      // In case of ongoing single maintenance we just set the end time
      confirmText = texts.areYouSureWantToCancelMaintenance;
      confirmAction = onUpdateMaintenanceEndTime;
    } else {
      // Handle all other maintenances
      if (!selectedMaintenance.maintenanceType) {
        // Single maintenance
        confirmText = texts.areYouSureWantToDeleteMaintenance;
      } else {
        // Periodic maintenances
        if (isOngoing) {
          confirmText = texts.cantCancelStartedPeriodicMaintenance + '\n';
          confirmText += texts.selectedActionWillDeleteAllMaintenancesInSeries + '\n';
          confirmText += texts.areYouSureWantToContinue;
        } else {
          confirmText = texts.areYouSureWantToDeletePeriodicMaintenance + '\n';
          confirmText += texts.allMaintenancesInSeriesWillBeDeleted;
        }
      }
      if (selectedMaintenance.activeSince > curTime) {
        // Maintenance period hasn't started yet so it can be safely removed
        // NOTE: This is temporarily commented because 'maintenance.delete' causes error
        // this.listModalScope.confirmAction = this.onRemoveMaintenance.bind(this);
        confirmAction = onUpdateMaintenanceEndTime;
      } else {
        // Period has already started so we can just set the end time of period
        confirmAction = onUpdateMaintenanceEndTime;
      }
    }
    setSelectedMaintenance(selectedMaintenance);
    setConfirmIsVisible(confirmIsVisible);
    setConfirmText(confirmText);
    setConfirmAction(confirmAction);
  };

  const setMaintenanceUpdateTimeOut = (infoText: string, showModal: boolean) => {
    if (showModal) {
      openConfirmMaintenanceModal(infoText);
    } else {
      setTimeout(() => {
        getMaintenanceList(hostIds, groupId);
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
  const onEditMaintenance = (maintenanceID: string) => {
    openMaintenanceModal(maintenanceID);
  };

  /**
   * Callback for clicking stop maintenance button
   * @param {string} maintenanceID
   * @param {number} endTime epoch
   */
  const onUpdateMaintenanceEndTime = (maintenanceID: string, endTime?: number) => {
    const curTime = getCurrentTimeEpoch();
    if (!endTime) {
      endTime = curTime;
    }
    let selectedMaintenance = ongoingMaintenances.find((item: any) => item.id === maintenanceID);
    if (!selectedMaintenance) {
      selectedMaintenance = allMaintenancesClass.find((item: any) => item.id === maintenanceID);
    }
    if (selectedMaintenance) {
      getZabbix(availableDatasources, datasourceSrv)
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
              let infoText = texts.maintenanceHasBeenDeleted;
              if (stoppingOngoingMaintenance) {
                infoText = texts.maintenancehasBeenCanceled + ' ' + texts.systemStatusWillBeUpdated;
              }
              setMaintenanceUpdateTimeOut(infoText, showModal);
            })
            .catch((err: any) => {
              handleError(err);
            });
        })
        .catch((err: any) => {
          handleError(err);
        });
    }
  };

  /**
   * Callback for clicking stop maintenance button
   * @param {string} maintenanceID
   */
  /*
  const onRemoveMaintenance = (maintenanceID: string) => {
    const selectedMaintenance = allMaintenancesClass.find((item: any) => item.id === maintenanceID);
    if (selectedMaintenance) {
      getZabbix(availableDatasources, datasourceSrv)
        .then((zabbix: any) => {
          // Set the time period of selected maintenance to end now
          zabbix.zabbixAPI
            .request('maintenance.delete', [maintenanceID])
            .then((answer: any) => {
              setMaintenanceUpdateTimeOut(texts.maintenanceHasBeenDeleted, true);
            })
            .catch((err: any) => {
              handleError(err);
            });
        })
        .catch((err: any) => {
          handleError(err);
        });
    }
  };
  */

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
  const onCreateMaintenance = (
    maintenanceType: number,
    description: string,
    duration: number,
    hostIds: string[],
    options: any,
    startDate: Date,
    stopDate: Date,
    maintenanceId?: string
  ) => {
    getZabbix(availableDatasources, datasourceSrv)
      .then((zabbix: any) => {
        const curTime = getCurrentTimeEpoch(startDate);
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
            let infoText = texts.newMaintenanceHasBeenStarted + ' ' + texts.systemStatusWillBeUpdated;
            if (maintenanceId) {
              infoText = texts.maintenanceHasBeenUpdated + ' ' + texts.systemStatusWillBeUpdated;
            }
            let showModal = true;
            // Show only info popup if maintenance is in future
            if (getCurrentTimeEpoch(startDate) > getCurrentTimeEpoch()) {
              if (maintenanceId) {
                infoText = texts.maintenanceHasBeenUpdated;
              } else {
                infoText = texts.newMaintenanceHasBeenCreated;
              }
            }
            setMaintenanceUpdateTimeOut(infoText, showModal);
          })
          .catch((err: any) => {
            handleError(err);
          });
      })
      .catch((err: any) => {
        handleError(err);
      });
  };

  /**
   * Open create maintenance modal
   * @param {string} maintenanceID (optional)
   */
  const openMaintenanceModal = (maintenanceID = '') => {
    setSelectedMaintenanceId(maintenanceID);
    const selectedMaintenance = allMaintenancesState.find((item: any) => item.id === selectedMaintenanceId);
    setSelectedMaintenance(selectedMaintenance);
    setShowMaintenanceModal(true);
    setShowMaintenanceListModal(false);
    setShowMaintenanceConfirmModal(false);
  };

  /**
   * Open create maintenance modal
   */
  const openAllMaintenancesModal = () => {
    setShowMaintenanceListModal(true);
    setShowMaintenanceModal(false);
    setShowMaintenanceConfirmModal(false);
  };

  /**
   * Open maintenance confirmation modal
   */
  const openConfirmMaintenanceModal = (confirmText: string) => {
    setConfirmText(confirmText);
    setShowMaintenanceConfirmModal(true);
    setShowMaintenanceListModal(false);
    setShowMaintenanceModal(false);
  };
  /* tslint:enable */

  const forceUpdate = useForceUpdate();

  const onStarDashboard = () => {
    const dashboardSrv = getDashboardSrv();
    const { dashboard } = props;

    dashboardSrv.starDashboard(dashboard.id, dashboard.meta.isStarred).then((newState: any) => {
      dashboard.meta.isStarred = newState;
      forceUpdate();
    });
  };

  const onClose = () => {
    locationService.partial({ viewPanel: null });
  };

  const onToggleTVMode = () => {
    toggleKioskMode();
  };

  const onOpenSettings = () => {
    locationService.partial({ editview: 'settings' });
  };

  const onPlaylistPrev = () => {
    playlistSrv.prev();
  };

  const onPlaylistNext = () => {
    playlistSrv.next();
  };

  const onPlaylistStop = () => {
    playlistSrv.stop();
    forceUpdate();
  };

  const addCustomContent = (actions: DashNavButtonModel[], buttons: ReactNode[]) => {
    actions.map((action, index) => {
      const Component = action.component;
      const element = <Component {...props} key={`button-custom-${index}`} />;
      typeof action.index === 'number' ? buttons.splice(action.index, 0, element) : buttons.push(element);
    });
  };

  const isPlaylistRunning = () => {
    return playlistSrv.isPlaying;
  };

  const renderLeftActionsButton = () => {
    const { dashboard, kioskMode } = props;
    const { canStar, canShare, isStarred } = dashboard.meta;
    const buttons: ReactNode[] = [];
    const isLightTheme = contextSrv.user.lightTheme;

    if (kioskMode !== KioskMode.Off || isPlaylistRunning()) {
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
          onClick={onStarDashboard}
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

    if (dashboard.uid && config.featureToggles.dashboardComments) {
      buttons.push(
        <ModalsController key="button-dashboard-comments">
          {({ showModal, hideModal }) => (
            <DashNavButton
              tooltip="Show dashboard comments"
              icon="comment-alt-message"
              iconSize="lg"
              onClick={() => {
                showModal(DashboardCommentsModal, {
                  dashboard,
                  onDismiss: hideModal,
                });
              }}
            />
          )}
        </ModalsController>
      );
    }

    addCustomContent(customLeftActions, buttons);
    return buttons;
  };

  const renderPlaylistControls = () => {
    return (
      <ButtonGroup key="playlist-buttons">
        <ToolbarButton tooltip="Go to previous dashboard" icon="backward" onClick={onPlaylistPrev} narrow />
        <ToolbarButton onClick={onPlaylistStop}>Stop playlist</ToolbarButton>
        <ToolbarButton tooltip="Go to next dashboard" icon="forward" onClick={onPlaylistNext} narrow />
      </ButtonGroup>
    );
  };

  const renderTimeControls = () => {
    const { dashboard, updateTimeZoneForSession, hideTimePicker } = props;

    if (hideTimePicker) {
      return null;
    }

    return (
      <DashNavTimeControls dashboard={dashboard} onChangeTimeZone={updateTimeZoneForSession} key="time-controls" />
    );
  };

  const findMaintenanceButton = (element: HTMLElement): HTMLElement | null => {
    if (element.id === 'maintenance_button') {
      return element;
    } else if (element.parentElement) {
      return findMaintenanceButton(element.parentElement);
    } else {
      return null;
    }
  };

  const renderRightActionsButton = () => {
    const { dashboard, onAddPanel, isFullscreen, kioskMode } = props;
    const { canSave, canEdit, showSettings } = dashboard.meta;
    const { snapshot } = dashboard;
    const snapshotUrl = snapshot && snapshot.originalUrl;
    const buttons: ReactNode[] = [];
    const isLightTheme = contextSrv.user.lightTheme;
    const tvButton = (
      <ToolbarButton tooltip="Cycle view mode" icon="monitor" onClick={onToggleTVMode} key="tv-button" />
    );

    if (isPlaylistRunning()) {
      return [renderPlaylistControls(), renderTimeControls()];
    }

    if (kioskMode === KioskMode.TV) {
      return [renderTimeControls(), tvButton];
    }

    if (canEdit && !isFullscreen && !isLightTheme) {
      buttons.push(<ToolbarButton tooltip="Add panel" icon="panel-add" onClick={onAddPanel} key="button-panel-add" />);
    }

    if (canSave && !isFullscreen) {
      buttons.push(
        <ModalsController key="button-save">
          {({ showModal, hideModal }) => (
            <ToolbarButton
              tooltip="Save dashboard"
              icon="save"
              onClick={() => {
                showModal(SaveDashboardProxy, {
                  dashboard,
                  onDismiss: hideModal,
                });
              }}
            />
          )}
        </ModalsController>
      );
    }

    if (props.dashboard.maintenanceHostGroup) {
      buttons.push(
        <ToolbarButton
          key="manage_maintenances"
          tooltip="Manage Maintenances"
          id="maintenance_button"
          onClick={(e) => {
            findMaintenanceButton(e.target as any)?.blur();
            onOpenMaintenanceDialog();
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
      );
    }
    if (props.dashboard.serviceInfoWikiUrl) {
      buttons.push(
        <ToolbarButton key="open_wiki" tooltip="Go To Wiki" onClick={() => onOpenWikiPage()}>
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
          onClick={() => gotoSnapshotOrigin(snapshotUrl)}
          icon="link"
          key="button-snapshot"
        />
      );
    }

    if (showSettings && !isLightTheme) {
      buttons.push(
        <ToolbarButton tooltip="Dashboard settings" icon="cog" onClick={onOpenSettings} key="button-settings" />
      );
    }

    addCustomContent(customRightActions, buttons);

    buttons.push(renderTimeControls());
    if (!isLightTheme) {
      buttons.push(tvButton);
    }
    return buttons;
  };

  const gotoSnapshotOrigin = (snapshotUrl: string) => {
    window.location.href = textUtil.sanitizeUrl(snapshotUrl);
  };

  const hideMaintenanceModal = () => {
    setShowMaintenanceModal(false);
  };

  const hideMaintenanceListModal = () => {
    setShowMaintenanceListModal(false);
  };

  const { isFullscreen, title, folderTitle } = props;
  // this ensures the component rerenders when the location changes
  const location = useLocation();
  const titleHref = locationUtil.getUrlForPartial(location, { search: 'open' });
  const parentHref = locationUtil.getUrlForPartial(location, { search: 'open', folder: 'current' });
  const onGoBack = isFullscreen ? onClose : undefined;
  const folderTitleByTheme = contextSrv.user.lightTheme ? '' : folderTitle;

  return (
    <div className="iiris-custom-toolbar">
      {props.dashboard.dashboardLogo ? (
        <div className="iiris-customer-logo">
          <img src={props.dashboard.dashboardLogo} />
        </div>
      ) : null}
      <PageToolbar
        pageIcon={isFullscreen ? undefined : 'apps'}
        title={title}
        parent={folderTitleByTheme}
        titleHref={titleHref}
        parentHref={parentHref}
        onGoBack={onGoBack}
        leftItems={renderLeftActionsButton()}
      >
        {renderRightActionsButton()}
      </PageToolbar>
      <IirisMaintenanceModal
        show={showMaintenanceModal}
        onDismiss={hideMaintenanceModal}
        openAllMaintenancesModal={openAllMaintenancesModal}
        hosts={hostsState}
        selectedMaintenance={selectedMaintenance}
        user={contextSrv.user.email || ''}
        onCreateMaintenance={onCreateMaintenance}
      />
      <IirisMaintenanceListModal
        show={showMaintenanceListModal}
        allMaintenances={allMaintenancesState}
        openMaintenanceModal={openMaintenanceModal}
        onDismiss={hideMaintenanceListModal}
        onEditMaintenance={onEditMaintenance}
        onStopMaintenance={onStopMaintenance}
        confirmIsVisible={confirmIsVisible}
        confirmText={confirmText}
        confirmAction={confirmAction}
        selectedMaintenanceId={selectedMaintenance?.id}
        onCloseConfirmation={() => setConfirmIsVisible(false)}
        ongoingMaintenanceIds={ongoingMaintenanceIds}
      />
      <IirisMaintenanceConfirmModal
        show={showMaintenanceConfirmModal}
        onDismiss={() => setShowMaintenanceConfirmModal(false)}
        confirmText={confirmText}
        confirmTitle={texts.maintenance}
      />
    </div>
  );
});

DashNav.displayName = 'DashNav';

export default connector(DashNav);
