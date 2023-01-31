/* eslint-disable */
/* tslint:disable */
// Libraries
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import {
  replaceTemplateVars,
  getZabbix,
  getHostGroups,
  getHostsFromGroup,
  getMaintenances,
  getOngoingMaintenances,
} from './common_tools';

// Components
import { AppEvents } from '@grafana/data';

// Types
import { DashboardModel } from '../../state';
import { getTemplateSrv, getDataSourceSrv } from '@grafana/runtime';

import appEvents from 'app/core/app_events';
import { contextSrv } from 'app/core/core';

import { IirisMaintenanceListModal } from './IirisMaintenanceListModal';
import { IirisMaintenanceModal } from './IirisMaintenanceModal';
import { IirisMaintenanceConfirmModal } from './IirisMaintenanceConfirmModal';

export interface OwnProps {
  dashboard: DashboardModel;
}

const IirisMaintenance = forwardRef((props: OwnProps, ref: any) => {
  useImperativeHandle(ref, () => ({
    log() {
      console.log('IirisMaintenance', onOpenMaintenanceDialog());
    },
  }));

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
  //texts = contextSrv.getLocalizedTexts();
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
        // listModalScope.allMaintenances = allMaintenances;
        setOngoingMaintenanceIds(ongoingMaintenances.map((item: any) => item.internalId));
        setAllMaintenancesState(allMaintenancesClass);
      })
      .catch((err: any) => {
        handleError(err);
      });
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
        // listModalScope.confirmAction = onRemoveMaintenance.bind(this);
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

  /*
  componentDidMount() {
    document.addEventListener(
      'iiris-maintenance-dialog-open',
      (e: any) => onOpenMaintenanceDialog(e.detail.loadAllHosts, e.detail.hostGroup, e.detail.availableDatasources),
      false
    );
  }

  componentWillUnmount() {
    document.removeEventListener(
      'iiris-maintenance-dialog-open',
      (e: any) => onOpenMaintenanceDialog(e.detail.loadAllHosts, e.detail.hostGroup, e.detail.availableDatasources),
      false
    );
  }
  */

  const findMaintenanceButton = (element: HTMLElement): HTMLElement | null => {
    if (element.id === 'maintenance_button') {
      return element;
    } else if (element.parentElement) {
      return findMaintenanceButton(element.parentElement);
    } else {
      return null;
    }
  };

  const hideMaintenanceModal = () => {
    setShowMaintenanceModal(false);
  };

  const hideMaintenanceListModal = () => {
    setShowMaintenanceListModal(false);
  };

  return (
    <>
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
    </>
  );
});

IirisMaintenance.displayName = 'IirisMaintenance';

export default IirisMaintenance;
