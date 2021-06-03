/* eslint-disable */
/* tslint:disable */
import _ from 'lodash';
import moment from 'moment'; // eslint-disable-line no-restricted-imports

const GLOBAL = 'global';
const daysWithNoAlertsText = 'Ei häiriötä ${days} päivään';
const alertHasBeenActiveText = 'Häiriö on kestänyt ${time}';
const daysWithNoAlertsTextEnglish = 'No incidents for ${days} days';
const alertHasBeenActiveTextEnglish = 'Incident active for ${time}';

export const MACRO_RESOLVE_LEVELS = 3;
export const STATUS_CRITICAL = 5;
export const STATUS_MAJOR = 4;
export const STATUS_AVERAGE = 3;
export const STATUS_MINOR = 2;
export const STATUS_INFO = 1;
export const STATUS_OK = 0;
export const STATUS_MAINTENANCE = -1;
export const STATUS_UNKNOWN = -2;

export const statusValueMap: any[] = [
  { value: STATUS_CRITICAL, text: 'Kriittinen häiriö', englishText: 'Critical Incident', id: 'critical' },
  { value: STATUS_MAJOR, text: 'Vakava häiriö', englishText: 'Major Incident', id: 'major' },
  { value: STATUS_AVERAGE, text: 'Keskitason häiriö', englishText: 'Average Incident', id: 'average' },
  { value: STATUS_MINOR, text: 'Matala häiriö', englishText: 'Minor Incident', id: 'minor' },
  { value: STATUS_INFO, text: 'Info', englishText: 'Information', id: 'info' },
  { value: STATUS_OK, text: 'OK', englishText: 'OK', id: 'ok' },
  { value: STATUS_MAINTENANCE, text: 'Huoltotila', englishText: 'Maintenance', id: 'maintenance' },
  { value: STATUS_UNKNOWN, text: 'Tuntematon', englishText: 'Not Classified', id: 'unknown' },
  { value: -3, text: '', id: '' },
];

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
  if (templateSrv) {
    templateSrv.getVariables().map((variable: any) => {
      scopedVars[variable.name as any] = variable.current;
    });
    return templateSrv.replace(target, scopedVars, zabbixTemplateFormat);
  } else {
    return target;
  }
}

/**
 * Check for template variable in given string
 * @param {string} fieldText
 * @param {any} scopedVars Template variables
 * @returns {boolean} variablesFound
 */
export function checkForTemplateVariables(fieldText: string, scopedVars: any) {
  let variablesFound = false;
  Object.keys(scopedVars).map((variableName: string) => {
    if (fieldText.indexOf('$' + variableName) > -1 || fieldText.indexOf('${' + variableName + '}') > -1) {
      variablesFound = true;
    }
  });
  return variablesFound;
}

/**
 * Exapand all template variables in given string and check for nested variables
 * @param {string} fieldText
 * @param {any} templateSrv Grafana's template service
 * @returns {string} replacedText
 */
export function getExpandedTemplateVariables(fieldText: string, templateSrv: any, scopedVars: any = {}) {
  let replacedText = fieldText.slice(0);
  if (templateSrv) {
    templateSrv.getVariables().map((variable: any) => {
      scopedVars[variable.name as any] = variable.current;
    });
  }
  let variablesFound = checkForTemplateVariables(replacedText, scopedVars);
  let macroResolveCounter = 0;
  // Checking for nested variables; variable inside variable
  while (variablesFound) {
    replacedText = templateSrv.replace(replacedText.slice(0), scopedVars, zabbixTemplateFormat);
    // Nested variables place '\' escape in front of the variable, that must be removed
    replacedText = replacedText.replace('\\$', '$');
    variablesFound = checkForTemplateVariables(replacedText, scopedVars);
    macroResolveCounter++;
    // If maximum amount of recursion is reached then exit to prevent eternal loop
    if (macroResolveCounter === MACRO_RESOLVE_LEVELS) {
      variablesFound = false;
    }
  }
  return replacedText;
}

export function getExpandedUrlLink(fieldText: string, templateSrv: any, urlUtil: any, DataLinkBuiltInVars: any) {
  const params = urlUtil.getUrlSearchParams();
  templateSrv.fillVariableValuesForUrl(params);
  const variablesQuery = urlUtil.toUrlParams(params);
  const allVariables = {
    [DataLinkBuiltInVars.includeVars]: {
      text: variablesQuery,
      value: variablesQuery,
    }
  };
  return getExpandedTemplateVariables(fieldText, templateSrv, allVariables);
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
 * Get Zabbix Host Group data
 * @returns {Promise}
 */
 export function getHostGroupData(availableDatasources: string[], datasourceSrv: any) {
  // Use random limit between 1000-2000 to get past cache proxy
  const randomLimit = Math.floor(Math.random() * 1000) + 1000;
  return new Promise<any>((resolve: any, reject: any) => {
    getZabbix(availableDatasources, datasourceSrv).then((zabbix: any) => {
      zabbix.zabbixAPI
        .request('hostgroup.get', {
          selectHosts: ['hostid', 'name', 'maintenance_status'],
          output: ['groupid', 'name'],
          limit: randomLimit,
        })
        .then((groups: any) => {
          resolve(groups);
        })
        .catch((err: any) => {
          reject(err);
        });
    });
  });
}

/**
 * Get all Zabbix Host Groups
 * @returns {any}
 */
export function getAllHostGroups(availableDatasources: string[], datasourceSrv: any, onlySlaItems?: boolean) {
  return new Promise<any>((resolve: any, reject: any) => {
    getZabbix(availableDatasources, datasourceSrv).then((zabbix: any) => {
      zabbix.getAllGroups().then((groups: any) => {
        const allHostGroups = groups.map((group: any) => group.name);
        const allHostGroupIds = groups.map((group: any) => group.groupid);
        // Get All Hosts
        zabbix.getAllHosts('/./').then((hosts: any) => {
          const allHosts: string[] = [];
          hosts.map((host: any) => {
            if (allHosts.indexOf(host.name) === -1) {
              allHosts.push(host.name);
            }
          });
          // Get All Applications
          zabbix.getAllApps('/./', '/./').then((apps: any) => {
            const allApplications: string[] = [];
            apps.map((app: any) => {
              if (allApplications.indexOf(app.name) === -1) {
                allApplications.push(app.name);
              }
            });
            // Get All Items
            const obj: any = {
              groupids: allHostGroupIds,
              output: ['itemid', 'name'],
            };
            if (onlySlaItems) {
              obj.search = { name: ['*.sla'] };
              obj.searchWildcardsEnabled = 1;
            }
            zabbix.zabbixAPI
              .request('item.get', obj)
              .then((items: any) => {
                const allItems: string[] = [];
                items.map((item: any) => {
                  if (allItems.indexOf(item.name) === -1) {
                    allItems.push(item.name);
                  }
                });
                resolve({ allHostGroups, allHosts, allApplications, allItems });
              });
          });
        });
      });
    })
    .catch((err: any) => {
      reject(err);
    });
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
 * Get all host names and ids in a group from Zabbix
 * @returns {Promise}
 */
 export function getHostsFromGroup(groupId: string, availableDatasources: string[], datasourceSrv: any) {
  return new Promise<any>((resolve: any, reject: any) => {
    getZabbix(availableDatasources, datasourceSrv)
      .then((zabbix: any) => {
        // Get all host ids
        zabbix.zabbixAPI
          .request('host.get', {
            groupids: [groupId],
            output: ['hostid', 'name', 'status'],
          })
          .then((hosts: any) => {
           resolve(hosts);
          })
          .catch((err: any) => {
            reject(err);
          });
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
            output: ['macro', 'value', 'hostid'],
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
                output: ['macro', 'value', 'hostid'],
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
      if (expandedUrl && userMacros && attributeKey) {
        userMacros.map((macroItem: any) => {
          if (String(macroItem.hostId) === String(event.hostId) || macroItem.hostId === GLOBAL) {
            const macroRegExp = new RegExp(_.escapeRegExp(macroItem.macro), 'g');
            expandedUrl = expandedUrl.replace(macroRegExp, macroItem.value);
          }
        });
        eventList[index][attributeKey] = expandedUrl;
      }
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
  datasourceSrv: any,
  oneUpcomingMaintenance?: boolean
) {
  const obj: any = {
    hostids: hostIds,
    output: ['active_since', 'active_till', 'name', 'maintenanceid'],
    selectGroups: ['groupid', 'name'],
    selectHosts: ['hostid', 'name'],
    selectTimeperiods: ['start_time', 'period', 'timeperiod_type', 'start_date', 'every', 'dayofweek', 'month', 'day'],
  }
  if (groupIds) {
    obj['groupids'] = groupIds;
  }
  return new Promise<any>((resolve: any, reject: any) => {
    getZabbix(availableDatasources, datasourceSrv)
      .then((zabbix: any) => {
        zabbix.zabbixAPI
          .request('maintenance.get', obj)
          .then((maintenances: any) => {
            const allMaintenances = handleMaintenances(maintenances, oneUpcomingMaintenance);
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
 * @param {boolean} oneUpcomingMaintenance  Show only one upcoming maintenance for daily/weekly/monthly periods
 * @returns {any[]} maintenances
 */
export function handleMaintenances(maintenances: any, oneUpcomingMaintenance?: boolean) {
  const handledMaintenances: any[] = [];
  maintenances.map((maintenance: any) => {
    maintenance.timeperiods.map((timeperiod: any) => {
      const activeSince = parseInt(maintenance.active_since, 10) * 1000;
      const activeTill = parseInt(maintenance.active_till, 10) * 1000;
      const activeSinceDate = new Date(activeSince);
      const startTimeOfDay = parseInt(timeperiod.start_time, 10) * 1000;
      const dayLengthMS = 60 * 60 * 24 * 1000;
      const duration = parseInt(timeperiod.period, 10);
      const currentTime = new Date().valueOf();
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
          if (oneUpcomingMaintenance && i > currentTime) {
            break;
          }
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
        let oneMaintenanceAdded = false;
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
                if (oneUpcomingMaintenance && startTime * 1000 > currentTime) {
                  oneMaintenanceAdded = true;
                  break;
                }
              }
            }
          }
          if (oneUpcomingMaintenance && oneMaintenanceAdded) {
            break;
          }
        }
      } else if (timeperiod.timeperiod_type === '4') {
        // MONTHLY PERIOD
        // Months are stored in binary format from right to left
        // eg. 4 equals 100 in binary, which means third month is selected
        const months = parseInt(timeperiod.month, 10).toString(2);
        const day = parseInt(timeperiod.day, 10);
        let yearCounter = moment.utc(activeSinceDate).startOf('year');
        let oneMaintenanceAdded = false;
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
                  if (oneUpcomingMaintenance && startTimeMS > currentTime) {
                    oneMaintenanceAdded = true;
                    break;
                  }
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
                      if (oneUpcomingMaintenance && startTimeMS > currentTime) {
                        oneMaintenanceAdded = true;
                        break;
                      }
                    }
                  }
                }
              }
            }
          }
          yearCounter = yearCounter.add(1, 'year');
          if (oneUpcomingMaintenance && oneMaintenanceAdded) {
            break;
          }
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

/**
 * Get ongoing maintenances
 * @param {any[]} maintenances
 * @returns {any[]}
 */
export function getOngoingMaintenances(maintenances: any[]) {
  const ongoingMaintenances: any[] = [];
  maintenances.map((maintenance: any) => {
    if (isOngoingMaintenance(maintenance)) {
      const endTime = new Date(maintenance.endTime * 1000);
      const maintenanceEnds = parseDateToString(endTime);
      const startTime = new Date(maintenance.startTime * 1000);
      const maintenanceStarts = parseDateToString(startTime);
      ongoingMaintenances.push({
        description: maintenance.name.split('|')[0],
        caller: maintenance.name.split('|').length > 1 ? maintenance.name.split('|')[1] : '',
        startTime: maintenanceStarts,
        endTime: maintenanceEnds,
        activeSince: maintenance.startTime,
        activeTill: maintenance.endTime,
        id: maintenance.id,
        internalId: maintenance.internalId,
        hosts: maintenance.hosts,
        groups: maintenance.groups,
        periodicMaintenance: maintenance.maintenanceType !== 0 ? true : false,
        maintenanceType: maintenance.maintenanceType,
      });
    }
  });
  return ongoingMaintenances;
}

/**
 * Define value for 'elapsed time from last alert' item and its corresponding text presentation
 * @param {number} elapsedValue
 * @returns {string}
 */
export function elapsedHandler(elapsedValue: number, abbreviated?: boolean, isEnglish?: boolean) {
  let elapsedText = '';
  let elapsedPopupText = '';
  if (elapsedValue === 0) {
    // No history data available
    elapsedText = '';
  } else if (elapsedValue < 0) {
    // There has been no alert for n days
    const days = Math.abs(Math.round(elapsedValue / 60 / 60 / 24));
    if (days === 0) {
      if (isEnglish) {
        elapsedText = 'Less than 24h';
        elapsedPopupText = 'Incidents occurred in the last 24 hours';
      } else {
        elapsedText = 'Alle 24h';
        elapsedPopupText = 'Häiriöitä esiintynyt viimeisen vuorokauden aikana';
      }
    } else {
      if (isEnglish) {
        elapsedText = days + (days === 1 ? ' day' : ' days');
        elapsedPopupText = daysWithNoAlertsTextEnglish.replace('${days}', days.toString());
      } else {
        elapsedText = abbreviated ? days + 'pv' : days + (days === 1 ? ' päivä' : ' päivää');
        elapsedPopupText = daysWithNoAlertsText.replace('${days}', days.toString());
      }
    }
  } else {
    // Alert has been active for n hours
    const days = Math.round(elapsedValue / 60 / 60 / 24);
    const hours = Math.round(elapsedValue / 60 / 60);
    const minutes = Math.round(elapsedValue / 60);
    if (hours >= 48) {
      if (isEnglish) {
        elapsedText = days + (days === 1 ? ' day' : ' days');
        elapsedPopupText =
          alertHasBeenActiveTextEnglish.replace('${time}', days.toString()) + (days === 1 ? ' day' : ' days');
      } else {
        elapsedText = abbreviated ? days + 'pv' : days + (days === 1 ? ' päivä' : ' päivää');
        elapsedPopupText =
          alertHasBeenActiveText.replace('${time}', days.toString()) + (days === 1 ? ' päivän' : ' päivää');
      }
    } else if (hours >= 1 && hours < 48) {
      if (isEnglish) {
        elapsedText = abbreviated ? hours + 'h' : hours + (hours === 1 ? ' hour' : ' hours');
        elapsedPopupText =
          alertHasBeenActiveTextEnglish.replace('${time}', hours.toString()) + (hours === 1 ? ' hour' : ' hours');
      } else {
        elapsedText = abbreviated ? hours + 't' : hours + (hours === 1 ? ' tunti' : ' tuntia');
        elapsedPopupText =
          alertHasBeenActiveText.replace('${time}', hours.toString()) + (hours === 1 ? ' tunnin' : ' tuntia');
      }
    } else {
      if (minutes === 0) {
        if (isEnglish) {
          elapsedText = 'Less than a minute';
          elapsedPopupText = 'Incident active less than a minute';
        } else {
          elapsedText = 'Alle minuutti';
          elapsedPopupText = 'Häiriö on kestänyt alle minuutin';
        }
      } else {
        if (isEnglish) {
          elapsedText = abbreviated ? minutes + 'min' : minutes + (minutes === 1 ? ' minute' : ' minutes');
          elapsedPopupText = alertHasBeenActiveTextEnglish.replace('${time}', minutes.toString()) +
            (minutes === 1 ? ' minute' : ' minutes');
        } else {
          elapsedText = abbreviated ? minutes + 'min' : minutes + (minutes === 1 ? ' minuutti' : ' minuuttia');
          elapsedPopupText = alertHasBeenActiveText.replace('${time}', minutes.toString()) +
            (minutes === 1 ? ' minuutin' : ' minuuttia');
        }
      }
    }
  }
  return { elapsedText, elapsedPopupText };
}

/**
 * Copied from Grafana
 */
export const round_interval = (interval: number) => {
  switch (true) {
    // 0.015s
    case interval < 15:
      return 10; // 0.01s
    // 0.035s
    case interval < 35:
      return 20; // 0.02s
    // 0.075s
    case interval < 75:
      return 50; // 0.05s
    // 0.15s
    case interval < 150:
      return 100; // 0.1s
    // 0.35s
    case interval < 350:
      return 200; // 0.2s
    // 0.75s
    case interval < 750:
      return 500; // 0.5s
    // 1.5s
    case interval < 1500:
      return 1000; // 1s
    // 3.5s
    case interval < 3500:
      return 2000; // 2s
    // 7.5s
    case interval < 7500:
      return 5000; // 5s
    // 12.5s
    case interval < 12500:
      return 10000; // 10s
    // 17.5s
    case interval < 17500:
      return 15000; // 15s
    // 25s
    case interval < 25000:
      return 20000; // 20s
    // 45s
    case interval < 45000:
      return 30000; // 30s
    // 1.5m
    case interval < 90000:
      return 60000; // 1m
    // 3.5m
    case interval < 210000:
      return 120000; // 2m
    // 7.5m
    case interval < 450000:
      return 300000; // 5m
    // 12.5m
    case interval < 750000:
      return 600000; // 10m
    // 12.5m
    case interval < 1050000:
      return 900000; // 15m
    // 25m
    case interval < 1500000:
      return 1200000; // 20m
    // 45m
    case interval < 2700000:
      return 1800000; // 30m
    // 1.5h
    case interval < 5400000:
      return 3600000; // 1h
    // 2.5h
    case interval < 9000000:
      return 7200000; // 2h
    // 4.5h
    case interval < 16200000:
      return 10800000; // 3h
    // 9h
    case interval < 32400000:
      return 21600000; // 6h
    // 1d
    case interval < 86400000:
      return 43200000; // 12h
    // 1w
    case interval < 604800000:
      return 86400000; // 1d
    // 3w
    case interval < 1814400000:
      return 604800000; // 1w
    // 6w
    case interval < 3628800000:
      return 2592000000; // 30d
    default:
      return 31536000000; // 1y
  }
};

/**
 * Copied from Grafana
 */
export const secondsToHms = (seconds: number) => {
  const numyears = Math.floor(seconds / 31536000);
  if (numyears) {
    return numyears + 'y';
  }
  const numdays = Math.floor((seconds % 31536000) / 86400);
  if (numdays) {
    return numdays + 'd';
  }
  const numhours = Math.floor(((seconds % 31536000) % 86400) / 3600);
  if (numhours) {
    return numhours + 'h';
  }
  const numminutes = Math.floor((((seconds % 31536000) % 86400) % 3600) / 60);
  if (numminutes) {
    return numminutes + 'm';
  }
  const numseconds = Math.floor((((seconds % 31536000) % 86400) % 3600) % 60);
  if (numseconds) {
    return numseconds + 's';
  }
  const nummilliseconds = Math.floor(seconds * 1000.0);
  if (nummilliseconds) {
    return nummilliseconds + 'ms';
  }

  return 'less than a millisecond'; //'just now' //or other string you like;
};

/**
 * Make SQL queries for status items and incident age
 */
export function fetchStatusData(
  availableMysqlDatasource: any,
  datasourceSrv: any,
  mainHostGroup: string,
  mainHost: string,
  mainApplication: string,
  tileData?: any[]
) {
  return new Promise<any>((resolve: any, reject: any) => {
    if (availableMysqlDatasource) {
      // These values are not really used when running a SQL procedure, but handler expects to find them
      const range: any = {};
      const currentMoment = moment();
      range.to = currentMoment;
      range.from = moment(currentMoment).subtract(5, 'minute');
      range.raw = { from: 'now-5m', to: 'now' };
      const maxDataPoints = 600;
      const intervalMs = 500;
      // Collect targets
      const targets = [];
      if (mainHostGroup) {
        targets.push(getSqlTarget(mainHostGroup, mainHost, mainApplication, 'A'));
      }
      if (tileData) {
        tileData.map((tile: any, index: number) => {
          if (tile.itemHostGroup) {
            // Create reference id's for tiles starting from char 'B'
            const refId = String.fromCharCode(66 + index); // 66 - char code 'B'
            targets.push(getSqlTarget(tile.itemHostGroup, tile.itemHost, tile.itemApplication, refId));
          }
        });
      }
      // Create SQL options object for query
      const sqlOptions: any = {
        targets,
        intervalMs,
        maxDataPoints,
        range,
      };
      datasourceSrv
        .get(availableMysqlDatasource)
        .then((datasource: any) => {
          datasource
            .query(sqlOptions)
            .toPromise()
            .then((result: any) => {
              // Map SQL results to status data object
              // Result contains only a single row, so map row data to matching columns in object
              // e.g. { A: { status: 2, duration: 12456 }, B: { status: 0, severity: 5, time_since_last: 2345 } }
              //
              // Result contains different columns based on status:
              // status  root_cause_duration  root_cause_description  root_cause_comments  root_cause_severity
              // -1 	   7460                 testi                   null                 4
              // status  duration
              // 5       1001
              // status  severity  time_since_last
              // 0       null      null
              // status  severity  time_since_last
              // 0       5         3570
              // status  error
              // -2      description of the error
              const statusData: any = {};
              result.data.map((item: any) => {
                const statusItem: any = {};
                item.columns.map((column: any, index: number) => {
                  statusItem[column.text] = item.rows[0][index];
                });
                statusData[item.refId] = statusItem;
              });
              resolve(statusData);
            })
            .catch((err: any) => {
              reject(err);
            });
        })
        .catch((err: any) => {
          reject(err);
        });
    } else {
      reject();
    }
  });
}

/**
 * Get SQL query target based on given params
 */
export function getSqlTarget(group: string, host: string, application: string, refId: string) {
  return {
    rawSql:
      'CALL get_incident_info("' +
      group +
      '", ' +
      (host ? '"' + host + '"' : 'NULL') +
      ', ' +
      (application ? '"' + application + '"' : 'NULL') +
      ');',
    refId,
    format: 'table',
    rawQuery: true,
  };
}

/**
 * Issue queries to get history data using grafana-zabbix datasource
 */
export function fetchSLAData(
  availableZabbixDatasource: any,
  datasourceSrv: any,
  timeRange: any,
  SLAItemIds: any[],
  allHostGroupItems: any[],
  dashboard: any,
  panel: any
) {
  return new Promise<any>((resolve: any, reject: any) => {
    if (availableZabbixDatasource && datasourceSrv) {
      datasourceSrv.get(availableZabbixDatasource).then((datasource: any) => {
        if (SLAItemIds.length > 0) {
          // Make query for fetching SLA value from dashboard's timerange
          // Using only 1 datapoint so that mean/average is counted from the whole timerange
          const maxDataPoints = 1;
          const intervalMs = round_interval((timeRange.to.valueOf() - timeRange.from.valueOf()) / maxDataPoints);
          const interval = secondsToHms(intervalMs / 1000);
          const SLAInterval = {
            interval,
            intervalMs,
          };
          const SLAScopedVars = Object.assign({}, panel.scopedVars, {
            __interval: { text: SLAInterval.interval, value: SLAInterval.interval },
            __interval_ms: { text: SLAInterval.intervalMs, value: SLAInterval.intervalMs },
          });
          // Add SLA specific changes to items query
          const SLAMetricsQuery = {
            timezone: dashboard.getTimezone(),
            panelId: panel.id,
            dashboardId: dashboard.id,
            range: timeRange,
            rangeRaw: timeRange.raw,
            interval: SLAInterval.interval,
            intervalMs: SLAInterval.intervalMs,
            targets: [{ mode: 3, itemids: SLAItemIds + '' }],
            maxDataPoints: maxDataPoints,
            scopedVars: SLAScopedVars,
            cacheTimeout: panel.cacheTimeout,
          };
          // Create query for SLA value and add it to promises array
          datasource
            .query(SLAMetricsQuery)
            .then((result: any) => {
              const SLAData: any = {};
              // Create SLAData object based on results
              if (result && result.data && result.data.length > 0) {
                result.data.forEach((dataItem: any) => {
                  const items = allHostGroupItems.filter((item: any) => dataItem.target.indexOf(item.name) > -1);
                  let zabbixItem;
                  // If there are multiple items with same name, need to find the correct one
                  if (items.length > 1) {
                    // Data target should contain host name if there are multiple items with same name
                    zabbixItem = items.find(
                      (item: any) => item.hosts.findIndex((host: any) => dataItem.target.indexOf(host.name) > -1) > -1
                    );
                  } else if (items.length === 1) {
                    zabbixItem = items[0];
                  }
                  // Add latest value to SLAData
                  if (zabbixItem && dataItem.datapoints.length > 0) {
                    SLAData[zabbixItem.itemid] = dataItem.datapoints.map((item: any) => {
                      return { value: item[0], clock: item[1] };
                    });
                  }
                });
              }
              resolve(SLAData);
            })
            .catch((err: any) => {
              reject(err);
            });
        }
      })
      .catch((err: any) => {
        reject(err);
      });
    } else {
      reject();
    }
  });
}

export function getStatusValue(statusItem: any, hostGroupName: string, isLoading: boolean) {
  let statusValue = -3;
  // Status -1 means that current status is unknown because of some other root cause
  if (statusItem && statusItem.status !== -1) {
    statusValue = statusItem.status;
  } else if (hostGroupName && !isLoading) {
    statusValue = STATUS_UNKNOWN;
  }
  return statusValue;
}

export function getSLAValue(SLAData: any[], SLAItem: any) {
  let SLAValue = 100;
  // Count average for received timespan
  const allSLAValues = SLAData[SLAItem.itemid].map((item: any) => parseFloat(item.value));
  const filteredDatapoints = allSLAValues.filter((item: number) => !_.isNil(item) && !isNaN(item));
  const SLAAverage = _.meanBy(filteredDatapoints, (item: number) => item);
  SLAValue = _.round(SLAAverage * 100, 1);
  return SLAValue;
}

export function getIncidentValue(statusValue: number, statusItem: any) {
  let incidentValue = 0;
  if (statusValue === STATUS_OK) {
    // Time Since Last Event is counted as negative integer
    incidentValue = statusItem.time_since_last * -1;
  } else if (statusValue > STATUS_OK) {
    // Alert duration is counted as is
    incidentValue = statusItem.duration;
  }
  return incidentValue;
}

export function getMaintenanceStatus(
  allHosts: any[],
  maintenanceHostGroup: any,
  applicationItem: string,
  applicationHosts: any[]
) {
  // Check for ongoing maintenances based on specific host groups
  let oneHostInMaintenance = false;
  let allHostsInMaintenance = true;
  const hostIdsInMaintenance: string[] = [];
  allHosts.map((host: any) => {
    if (host.maintenance_status === '1' && hostIdsInMaintenance.indexOf(host.hostid) === -1) {
      hostIdsInMaintenance.push(host.hostid);
    }
  });
  if (maintenanceHostGroup && maintenanceHostGroup.hosts && maintenanceHostGroup.hosts.length > 0) {
    // Check if hosts of main group are in maintenance
    // If any one host is in maintenance then show maintenance button but normal status
    // If all hosts are in maintenance then panel must show maintenance status
    const filteredHosts = maintenanceHostGroup.hosts
      // Filter out hosts ending with (-sla _sla .sla -SLA _SLA .SLA)
      .filter((host: any) => !/[-_.](sla|SLA)$/.test(host.name))
      // If application is defined, we need to filter the host list with application, otherwise no filtering
      .filter((host: any) => {
        if (applicationItem) {
          const hostData = applicationHosts.find((aHost: any) => aHost.hostid === host.hostid);
          if (hostData && hostData.applications) {
            if (hostData.applications.findIndex((app: any) => app.name === applicationItem) > -1) {
              return true;
            } else {
              return false;
            }
          } else {
            return true;
          }
        } else {
          return true;
        }
      })
      .map((host: any) => {
        if (hostIdsInMaintenance.indexOf(host.hostid) > -1) {
          // If any one host is in maintenance then show maintenance button but normal status
          oneHostInMaintenance = true;
        } else {
          // If any one host is NOT in maintenance then allHostsInMaintenance can't be true
          allHostsInMaintenance = false;
        }
      });
    if (filteredHosts.length === 0) {
      allHostsInMaintenance = false;
    }
  } else {
    allHostsInMaintenance = false;
  }
  return { oneHostInMaintenance, allHostsInMaintenance };
}

export function getTooltipXPos(tooltipWidth: any, pageX: number) {
  const totalWidth = pageX + tooltipWidth;
  const xpos = totalWidth > window.innerWidth ? window.innerWidth - tooltipWidth : pageX;
  return xpos;
}