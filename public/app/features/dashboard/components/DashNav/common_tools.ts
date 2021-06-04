/* eslint-disable */
/* tslint:disable */
import _ from 'lodash';
import moment from 'moment'; // eslint-disable-line no-restricted-imports

const GLOBAL = 'global';

// Code copied from Zabbix-triggers panel
export function escapeRegex(value: string) {
  return value.replace(/[\\^$*+?()|[\]{}\/]/g, '\\$&');
}

export function zabbixTemplateFormat(value: any) {
  if (typeof value === 'string') {
    return escapeRegex(value);
  }
  const escapedValues = _.map(value, escapeRegex);
  return '(' + escapedValues.join('|') + ')';
}
// Zabbix-triggers panel code ends

/**
 * Check given string for template variables and replace them with actual values
 * This function was copied from Zabbix-triggers panel
 * @param {string} target
 * @param {any} templateSrv Grafana's template service
 * @returns {string} replacedTarget
 */
export function replaceTemplateVars(target: string, templateSrv: any) {
  const scopedVars: any = {};
  templateSrv.variables.map((variable: any) => {
    scopedVars[variable.name as any] = variable.current;
  });
  return templateSrv.replace(target, scopedVars, zabbixTemplateFormat);
}

/**
 * Get Zabbix datasource
 * @returns {Promise}
 */
export function getZabbix(availableDatasources: string[], datasourceSrv: any) {
  return new Promise<any>((resolve: any, reject: any) => {
    if (availableDatasources.length > 0) {
      datasourceSrv
        .get(availableDatasources[0])
        .then((datasource: any) => {
          if (datasource.zabbix) {
            resolve(datasource.zabbix);
          } else {
            reject('');
          }
        })
        .catch((err: any) => {
          reject(err);
        });
    } else {
      reject('');
    }
  });
}

/**
 * Get all host group names and ids from Zabbix
 * @returns {Promise}
 */
export function getHostGroups(hostGroup: string, availableDatasources: string[], datasourceSrv: any) {
  return new Promise<any>((resolve: any, reject: any) => {
    getZabbix(availableDatasources, datasourceSrv)
      .then((zabbix: any) => {
        // Get all host group ids
        zabbix
          .getAllGroups()
          .then((groups: any) => {
            // Find id with host name
            const groupInfo = _.find(groups, { name: hostGroup }) as any;
            if (groupInfo) {
              const groupId = groupInfo.groupid;
              resolve(groupId);
            } else {
              reject('');
            }
          })
          .catch((err: any) => {
            reject(err);
          });
      })
      .catch((err: any) => {
        reject(err);
      });
  });
}

/**
 * Get all host names and ids in a group from Zabbix
 * @returns {Promise}
 */
export function getHosts(hostGroup: string, availableDatasources: string[], datasourceSrv: any) {
  return new Promise<any>((resolve: any, reject: any) => {
    getZabbix(availableDatasources, datasourceSrv)
      .then((zabbix: any) => {
        // Get all host ids
        zabbix
          .getAllHosts(hostGroup)
          .then((hosts: any) => {
            const parsedHosts: any[] = [];
            hosts.map((host: any) => {
              parsedHosts.push({
                text: host.name,
                value: host.hostid,
              });
            });
            resolve(parsedHosts);
          })
          .catch((err: any) => {
            reject(err);
          });
      })
      .catch((err: any) => {
        reject(err);
      });
  });
}

/**
 * Fetch user macros from Zabbix
 * @returns {Promise}
 */
export function getUserMacros(groupId: string, availableDatasources: string[], datasourceSrv: any) {
  return new Promise<any>((resolve: any, reject: any) => {
    getZabbix(availableDatasources, datasourceSrv)
      .then((zabbix: any) => {
        zabbix.zabbixAPI
          .request('usermacro.get', {
            groupids: [groupId],
            output: 'extend',
          })
          .then((macros: any) => {
            const userMacros: any[] = [];
            macros.map((item: any) => {
              userMacros.push({
                macro: item.macro,
                value: item.value,
                hostId: item.hostid,
              });
            });
            zabbix.zabbixAPI
              .request('usermacro.get', {
                globalmacro: true,
                output: 'extend',
              })
              .then((globalmacros: any) => {
                globalmacros.map((item: any) => {
                  userMacros.push({
                    macro: item.macro,
                    value: item.value,
                    hostId: GLOBAL,
                  });
                });
                resolve(userMacros);
              });
          });
      })
      .catch((err: any) => {
        reject(err);
      });
  });
}

/**
 * Replace possible macros in event urls
 */
export function replaceMacros(eventList: any, userMacros: any, attributeKey: string) {
  if (eventList.length > 0) {
    eventList.map((event: any, index: number) => {
      let expandedUrl = event[attributeKey];
      userMacros.map((macroItem: any) => {
        if (String(macroItem.hostId) === String(event.hostId) || macroItem.hostId === GLOBAL) {
          const macroRegExp = new RegExp(_.escapeRegExp(macroItem.macro), 'g');
          expandedUrl = expandedUrl.replace(macroRegExp, macroItem.value);
        }
      });
      eventList[index][attributeKey] = expandedUrl;
    });
  }
}

/**
 * Get all maintenances from Zabbix
 * @returns {Promise}
 */
export function getMaintenances(
  hostIds: string[],
  groupIds: string[],
  availableDatasources: string[],
  datasourceSrv: any
) {
  return new Promise<any>((resolve: any, reject: any) => {
    getZabbix(availableDatasources, datasourceSrv)
      .then((zabbix: any) => {
        zabbix.zabbixAPI
          .request('maintenance.get', {
            hostids: hostIds,
            groupids: groupIds,
            output: 'extend',
            selectGroups: 'extend',
            selectHosts: 'extend',
            selectTimeperiods: 'extend',
          })
          .then((maintenances: any) => {
            const allMaintenances = handleMaintenances(maintenances);
            resolve(allMaintenances);
          })
          .catch((err: any) => {
            reject(err);
          });
      })
      .catch((err: any) => {
        reject(err);
      });
  });
}

/**
 * Handle maintenances based on maintenance type
 * 0 - One time period
 * 2 - Daily period
 * 3 - Weekly period
 * 4 - Monthly period
 * @param {any} maintenances
 * @param {number} typeObjIndex
 * @returns {any[]} maintenances
 */
export function handleMaintenances(maintenances: any) {
  const handledMaintenances: any[] = [];
  maintenances.map((maintenance: any) => {
    maintenance.timeperiods.map((timeperiod: any) => {
      const activeSince = parseInt(maintenance.active_since, 10) * 1000;
      const activeTill = parseInt(maintenance.active_till, 10) * 1000;
      const activeSinceDate = new Date(activeSince);
      const startTimeOfDay = parseInt(timeperiod.start_time, 10) * 1000;
      const dayLengthMS = 60 * 60 * 24 * 1000;
      const duration = parseInt(timeperiod.period, 10);
      let beginningOfPeriod: any;
      if (timeperiod.timeperiod_type === '0') {
        // ONE TIME PERIOD
        const startTime = parseInt(timeperiod.start_date, 10);
        addMaintenanceToList(
          startTime,
          duration,
          maintenance,
          handledMaintenances,
          timeperiod,
          activeTill,
          activeSince
        );
      } else if (timeperiod.timeperiod_type === '2') {
        // DAILY PERIOD
        beginningOfPeriod = moment
          .utc(activeSinceDate)
          .startOf('day')
          .add(startTimeOfDay, 'millisecond');
        if (beginningOfPeriod.valueOf() < activeSince) {
          beginningOfPeriod = beginningOfPeriod.add(1, 'day').valueOf();
        }
        const dayInterval = parseInt(timeperiod.every, 10) * dayLengthMS;
        for (let i = beginningOfPeriod; i <= activeTill; i += dayInterval) {
          const startTime = Math.floor(i / 1000);
          addMaintenanceToList(
            startTime,
            duration,
            maintenance,
            handledMaintenances,
            timeperiod,
            activeTill,
            activeSince
          );
        }
      } else if (timeperiod.timeperiod_type === '3') {
        // WEEKLY PERIOD
        beginningOfPeriod = moment
          .utc(activeSinceDate)
          .locale('fi')
          .startOf('week')
          .valueOf();
        // Weekdays are stored in binary format from right to left
        // eg. 4 equals 100 in binary, which means third weekday is selected
        const weekdays = parseInt(timeperiod.dayofweek, 10).toString(2);
        const weekInterval = parseInt(timeperiod.every, 10) * dayLengthMS * 7;
        for (let i = beginningOfPeriod; i <= activeTill; i += weekInterval) {
          for (let j = weekdays.length - 1; j > -1; j--) {
            if (weekdays[j] === '1') {
              const weekday = weekdays.length - j - 1;
              let startTime = i + weekday * dayLengthMS + startTimeOfDay;
              if (startTime >= activeSince) {
                startTime = Math.floor(startTime / 1000);
                addMaintenanceToList(
                  startTime,
                  duration,
                  maintenance,
                  handledMaintenances,
                  timeperiod,
                  activeTill,
                  activeSince
                );
              }
            }
          }
        }
      } else if (timeperiod.timeperiod_type === '4') {
        // MONTHLY PERIOD
        // Months are stored in binary format from right to left
        // eg. 4 equals 100 in binary, which means third month is selected
        const months = parseInt(timeperiod.month, 10).toString(2);
        const day = parseInt(timeperiod.day, 10);
        let yearCounter = moment.utc(activeSinceDate).startOf('year');
        while (yearCounter.valueOf() < activeTill) {
          for (let j = months.length - 1; j > -1; j--) {
            if (months[j] === '1') {
              const monthNumber = months.length - j - 1;
              const monthCounter = moment(yearCounter).add(monthNumber, 'month');
              if (day > 0) {
                // Monthly maintenance based on day number
                const startTimeMS = monthCounter.add((day - 1) * dayLengthMS + startTimeOfDay, 'millisecond').valueOf();
                if (startTimeMS >= activeSince && startTimeMS <= activeTill) {
                  const startTimeSec = Math.floor(startTimeMS / 1000);
                  addMaintenanceToList(
                    startTimeSec,
                    duration,
                    maintenance,
                    handledMaintenances,
                    timeperiod,
                    activeTill,
                    activeSince
                  );
                }
              } else if (timeperiod.dayofweek && timeperiod.dayofweek !== '0') {
                // Monthly maintenance based on weekdays
                const week = parseInt(timeperiod.every, 10);
                let subtractWeek = 0;
                const startTimeValue = monthCounter.valueOf();
                const startTime = moment(monthCounter)
                  .locale('fi')
                  .startOf('week');
                if (startTimeValue === startTime.valueOf()) {
                  subtractWeek = 1;
                }
                startTime.add(week - subtractWeek, 'week');
                const weekdays = parseInt(timeperiod.dayofweek, 10).toString(2);
                for (let k = weekdays.length - 1; k > -1; k--) {
                  if (weekdays[k] === '1') {
                    const weekday = weekdays.length - k - 1;
                    const startTimeObj = moment(startTime).add(weekday * dayLengthMS + startTimeOfDay, 'millisecond');
                    // If adding weeks and days has moved maintenance out of this month then reduce a week
                    if (week === 5) {
                      while (startTimeObj.month() > monthNumber) {
                        startTimeObj.subtract(1, 'week');
                      }
                    }
                    const startTimeMS = moment(startTimeObj).valueOf();
                    if (startTimeMS >= activeSince && startTimeMS <= activeTill) {
                      const startTimeSec = Math.floor(startTimeMS / 1000);
                      addMaintenanceToList(
                        startTimeSec,
                        duration,
                        maintenance,
                        handledMaintenances,
                        timeperiod,
                        activeTill,
                        activeSince
                      );
                    }
                  }
                }
              }
            }
          }
          yearCounter = yearCounter.add(1, 'year');
        }
      }
    });
  });
  return handledMaintenances;
}

/**
 * Add new maintenance to maintenances list
 * @param {number} startTime
 * @param {number} duration
 * @param {string} name
 * @param {number} typeObjIndex
 */
export function addMaintenanceToList(
  startTime: number,
  duration: number,
  maintenance: any,
  handledMaintenances: any[],
  timeperiod: any,
  activeTill: number,
  activeSince: number
) {
  const newItem: any = {};
  newItem.name = maintenance.name;
  newItem.description = maintenance.name.split('|')[0];
  newItem.caller = maintenance.name.split('|').length > 1 ? maintenance.name.split('|')[1] : '';
  newItem.startTime = startTime;
  newItem.endTime = startTime + duration;
  newItem.duration = duration;
  newItem.startTimeString = moment(new Date(startTime * 1000)).format('DD.MM.YYYY HH:mm');
  newItem.endTimeString = moment(new Date(newItem.endTime * 1000)).format('DD.MM.YYYY HH:mm');
  newItem.durationString = getDurationString(duration);
  newItem.hosts = maintenance.hosts;
  newItem.groups = maintenance.groups;
  newItem.id = maintenance.maintenanceid;
  newItem.maintenanceType = parseInt(timeperiod.timeperiod_type, 10);
  newItem.internalId = handledMaintenances.length + 1;
  newItem.every = parseInt(timeperiod.every, 10);
  newItem.month = timeperiod.month;
  newItem.day = parseInt(timeperiod.day, 10);
  newItem.dayOfWeek = timeperiod.dayofweek;
  newItem.timeOfDay = parseInt(timeperiod.start_time, 10);
  newItem.activeTill = Math.floor(activeTill / 1000);
  newItem.activeSince = Math.floor(activeSince / 1000);
  handledMaintenances.push(newItem);
}

/**
 * Parse duration string from number of seconds
 * @param {number} duration
 * @returns {string}
 */
export function getDurationString(duration: number) {
  let durationDays,
    durationHours,
    durationMinutes,
    durationSeconds = 0;
  let durationString = '';
  if (duration >= 24 * 60 * 60) {
    durationDays = Math.floor(duration / 60 / 60 / 24);
    durationHours = Math.floor((duration - durationDays * 24 * 60 * 60) / 60 / 60);
    durationString = durationDays + 'd ' + (durationHours > 0 ? durationHours + 'h' : '');
  } else if (duration < 24 * 60 * 60 && duration >= 60 * 60) {
    durationHours = Math.floor(duration / 60 / 60);
    durationMinutes = Math.floor((duration - durationHours * 60 * 60) / 60);
    durationString = durationHours + 'h ' + (durationMinutes > 0 ? durationMinutes + 'min' : '');
  } else if (duration < 60 * 60 && duration > 60) {
    durationMinutes = Math.floor(duration / 60);
    durationString = durationMinutes + 'min';
  } else {
    durationSeconds = duration;
    durationString = durationSeconds + 's';
  }
  return durationString;
}

/**
 * Is maintenance ongoing
 * @param {any} maintenance
 * @returns {boolean}
 */
export function isOngoingMaintenance(maintenance: any) {
  let isOngoing = false;
  if (maintenance) {
    if (maintenance.startTime) {
      const curTime = (new Date()).getTime() / 1000;
      if (curTime >= maintenance.startTime && curTime <= maintenance.endTime &&
        curTime >= maintenance.activeSince && curTime <= maintenance.activeTill) {
        isOngoing = true;
      }
    }
  }
  return isOngoing;
}

/**
 * Parse given Date object to string
 * @param {Date} newDate
 * @returns {string}
 */
export function parseDateToString(newDate: Date) {
  const leadingZero = newDate.getMinutes() < 10 ? '0' : '';
  return (newDate.getDate() + '.' + (newDate.getMonth() + 1) + '.' + newDate.getFullYear() +
    ' ' + newDate.getHours() + ':' + leadingZero + newDate.getMinutes());
}
