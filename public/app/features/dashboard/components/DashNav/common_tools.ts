/* eslint-disable */
/* tslint:disable */
import _ from 'lodash';
import moment from 'moment'; // eslint-disable-line no-restricted-imports

export const MACRO_RESOLVE_LEVELS = 3;

// This corresponds to zabbix maintenance time period timeperiod_type property values
export enum MaintenanceType {
  OneTime = 0,
  Daily = 2,
  Weekly = 3,
  Monthly = 4,
}

// The basic type of fetched maintenances
export type Maintenance = {
  name: string; // Maintenance name; zabbix maintenance name property
  startTime: number; // Epoch in seconds; zabbix time period start_date property; valid only for one-time maintenances
  startTimeString: string; // startTime formatted as string
  endTime: number; // Epoch in seconds; zabbix time period start_date + period; valid only for one-time maintenances
  endTimeString: string; // endTime formatted as string
  duration: number; // Duration in seconds; zabbix time period period property
  durationString: string; // Duration formatted as string
  activeSince: number; // Epoch in seconds; zabbix maintenance active_since property
  activeTill: number; // Epoch in seconds; zabbix maintenance active_till property
  activeTillString: string; // activeTill formatted as string
  id: number; // zabbix maintenance maintenanceid property
  internalId: number; // 1-based index number of handled maintenances
  every: number; // zabbix time period every property
  month: number; // zabbix time period month property
  day: number; // zabbix time period day property
  dayOfWeek: number; // zabbix time period dayofweek property
  timeOfDay: number; // zabbix time period start_time property
  hosts: { hostid: number; name: string }[]; // hosts assigned to the property; fetched with selectHosts parameter from zabbix api
  groups: { groupid: number; name: string }[]; // host groups assigned to the property; fetched with selectHostGroups parameter from zabbix api
  periodicMaintenance: boolean; // true if maintenance is one-time; false if it's periodic (daily, weekly or monthly)
  maintenanceType: MaintenanceType; // zabbix time period timeperiod_type property
  maintenanceTypeString: string;
  maintenanceTypeStringFull: string;
};

// Code copied from Zabbix-triggers panel
export function escapeRegex(value: string) {
  return value.replace(/[\\^$*+?()|[\]{}\/]/g, '\\$&');
}

export const regexPattern = /^\/(.*)\/([gmi]*)$/m;

// Test string for RegEx
export function isRegex(str: any) {
  return regexPattern.test(str);
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
    if (fieldText.indexOf('$' + variableName) > -1 || fieldText.indexOf('${' + variableName + '}') > -1) {
      variablesFound = true;
    }
  });
  return variablesFound;
}

/**
 * Expand all template variables in given string and check for nested variables
 * @param {string} fieldText
 * @param {any} templateSrv Grafana's template service
 * @returns {string} replacedText
 */
export function getExpandedTemplateVariables(fieldText: string, templateSrv: any, scopedVars: any = {}) {
  if (!fieldText) {
    return fieldText;
  }
  let replacedText = fieldText.slice(0);
  if (templateSrv) {
    templateSrv.getVariables().map((variable: any) => {
      if (!scopedVars[variable.name as any]) {
        scopedVars[variable.name as any] = variable.current;
      }
    });
  }
  let variablesFound = checkForTemplateVariables(replacedText, scopedVars);
  let macroResolveCounter = 0;
  // Checking for nested variables; variable inside variable
  while (variablesFound) {
    replacedText = templateSrv.replace(replacedText.slice(0), scopedVars, zabbixTemplateFormat);
    // Nested variables place '\' escape in front of the variable, that must be removed
    replacedText = replacedText.replace(/\\$|\\\$/g, '$');
    variablesFound = checkForTemplateVariables(replacedText, scopedVars);
    macroResolveCounter++;
    // If maximum amount of recursion is reached then exit to prevent eternal loop
    if (macroResolveCounter === MACRO_RESOLVE_LEVELS) {
      variablesFound = false;
    }
  }
  return replacedText;
}

// Expand all template variables in given URL link
export function getExpandedUrlLink(
  fieldText: string,
  templateSrv: any,
  urlUtil: any,
  DataLinkBuiltInVars: any,
  scopedVars: any = {}
) {
  const vars = Object.assign({}, scopedVars);
  const allVariablesParams = getAllVariableValuesForUrl(vars, templateSrv.getVariables());
  const variablesQuery = urlUtil.toUrlParams(allVariablesParams);
  const allVariables = Object.assign(vars, {
    [DataLinkBuiltInVars.includeVars]: {
      text: variablesQuery,
      value: variablesQuery,
    },
  });
  let replacedText = getExpandedTemplateVariables(fieldText, templateSrv, allVariables);
  // Remove '\' escape in front of slash '\/'
  replacedText = replacedText.replace(/\\\//g, '/');
  // Remove '\' escape in front of question mark '\?'
  replacedText = replacedText.replace('\\?', '?');
  // Replace '\' with '/' in url
  replacedText = replacedText.replace(/\\/g, '/');
  return replacedText;
}

// Generate params object (key/value pairs) with "var-" prefixes
export function getAllVariableValuesForUrl(scopedVars: any, variables: any) {
  const params: Record<string, string | string[]> = {};
  for (let i = 0; i < variables.length; i++) {
    const variable = variables[i];
    if (scopedVars && scopedVars[variable.name] !== void 0) {
      if (scopedVars[variable.name].skipUrlSync) {
        continue;
      }
      params['var-' + variable.name] = scopedVars[variable.name].value;
    } else {
      // @ts-ignore
      if (variable.skipUrlSync) {
        continue;
      }
      params['var-' + variable.name] = variable.current.value;
    }
  }
  return params;
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
 * Get all maintenances from Zabbix
 * @returns {Promise}
 */
export function getMaintenances(
  hostIds: string[],
  groupIds: number[] | undefined,
  availableDatasources: string[],
  datasourceSrv: any
): Promise<Maintenance[]> {
  return new Promise<Maintenance[]>((resolve: any, reject: any) => {
    getZabbix(availableDatasources, datasourceSrv)
      .then((zabbix: any) => {
        zabbix.zabbixAPI
          .getMaintenances(hostIds, groupIds)
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
 * Handle/parse maintenances based on maintenance type
 * 0 - One time period
 * 2 - Daily period
 * 3 - Weekly period
 * 4 - Monthly period
 * @param {any} maintenances fetched from Zabbix API
 * @returns {Maintenance[]} maintenances
 *
 * Not that the method returns only one upcoming maintenance for daily/weekly/monthly periods.
 */
export function handleMaintenances(maintenances: any[]): Maintenance[] {
  const handledMaintenances: Maintenance[] = [];
  maintenances.map((maintenance: any) => {
    maintenance.timeperiods.map((timeperiod: any) => {
      const activeSince = parseInt(maintenance.active_since, 10) * 1000;
      const activeTill = parseInt(maintenance.active_till, 10) * 1000;
      const activeSinceDate = new Date(activeSince);
      const startTimeOfDay = parseInt(timeperiod.start_time, 10) * 1000;
      const dayLengthMS = 60 * 60 * 24 * 1000;
      const duration = parseInt(timeperiod.period, 10);
      const currentTime = new Date().valueOf();
      let beginningOfPeriod: number;
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
        beginningOfPeriod = moment.utc(activeSinceDate).startOf('day').add(startTimeOfDay, 'millisecond').valueOf();
        if (beginningOfPeriod < activeSince) {
          beginningOfPeriod = moment(beginningOfPeriod).add(1, 'day').valueOf();
        }
        const dayInterval = parseInt(timeperiod.every, 10);
        for (let i = 0; beginningOfPeriod + i * dayLengthMS <= activeTill; i += dayInterval) {
          const startTime = Math.floor(moment(beginningOfPeriod).add(i, 'day').valueOf() / 1000);
          addMaintenanceToList(
            startTime,
            duration,
            maintenance,
            handledMaintenances,
            timeperiod,
            activeTill,
            activeSince
          );
          if (beginningOfPeriod + i * dayLengthMS > currentTime) {
            break;
          }
        }
      } else if (timeperiod.timeperiod_type === '3') {
        // WEEKLY PERIOD
        beginningOfPeriod = moment.utc(activeSinceDate).locale('fi').startOf('week').valueOf();
        // Weekdays are stored in binary format from right to left
        // eg. 4 equals 100 in binary, which means third weekday is selected
        const weekdays = parseInt(timeperiod.dayofweek, 10).toString(2);
        const weekInterval = parseInt(timeperiod.every, 10);
        let oneMaintenanceAdded = false;
        for (let i = 0; beginningOfPeriod + i * dayLengthMS * 7 <= activeTill; i += weekInterval) {
          for (let j = weekdays.length - 1; j > -1; j--) {
            if (weekdays[j] === '1') {
              const weekday = weekdays.length - j - 1;
              let startTime = moment(beginningOfPeriod)
                .add(i, 'week')
                .add(weekday, 'day')
                .add(startTimeOfDay, 'millisecond')
                .valueOf();
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
                if (startTime * 1000 > currentTime) {
                  oneMaintenanceAdded = true;
                  break;
                }
              }
            }
          }
          if (oneMaintenanceAdded) {
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
                const startTimeMS = monthCounter
                  .add(day - 1, 'day')
                  .add(startTimeOfDay, 'millisecond')
                  .valueOf();
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
                  if (startTimeMS > currentTime) {
                    oneMaintenanceAdded = true;
                    break;
                  }
                }
              } else if (timeperiod.dayofweek && timeperiod.dayofweek !== '0') {
                // Monthly maintenance based on weekdays
                const week = parseInt(timeperiod.every, 10);
                let subtractWeek = 0;
                const startTimeValue = monthCounter.valueOf();
                const startTime = moment(monthCounter).locale('fi').startOf('week');
                if (startTimeValue === startTime.valueOf()) {
                  subtractWeek = 1;
                }
                startTime.add(week - subtractWeek, 'week');
                const weekdays = parseInt(timeperiod.dayofweek, 10).toString(2);
                for (let k = weekdays.length - 1; k > -1; k--) {
                  if (weekdays[k] === '1') {
                    const weekday = weekdays.length - k - 1;
                    const startTimeObj = moment(startTime).add(weekday, 'day').add(startTimeOfDay, 'millisecond');
                    // If adding weeks and days has moved maintenance out of this month then reduce a week
                    if (week === 5) {
                      while (startTimeObj.month() > monthNumber) {
                        startTimeObj.subtract(1, 'week');
                      }
                    }
                    const startTimeMS = startTimeObj.valueOf();
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
                      if (startTimeMS > currentTime) {
                        oneMaintenanceAdded = true;
                        break;
                      }
                    }
                  }
                }
              }
            }
            if (oneMaintenanceAdded) {
              break;
            }
          }
          yearCounter = yearCounter.add(1, 'year');
          if (oneMaintenanceAdded) {
            break;
          }
        }
      }
    });
  });
  return handledMaintenances;
}

/**
 * Set 'description' and 'caller' attributes to given object from maintenance name field
 * Formatted like 'description|caller|id'
 * e.g. 'Some maintenance name|john@doe.com|1234567'
 * @param {any} maintenanceObj
 * @param {string} nameField
 */
export function setMaintenanceDescriptionAndCaller(maintenanceObj: any, nameField: string) {
  let description = '';
  let caller = '';
  const dividerAmount = (nameField.match(/\|/g) || []).length;
  if (dividerAmount < 2) {
    description = nameField;
  } else if (dividerAmount === 2) {
    description = nameField.split('|')[0];
    caller = nameField.split('|')[1];
  } else {
    const nameWithoutId = nameField.substring(0, nameField.lastIndexOf('|'));
    const index = nameWithoutId.lastIndexOf('|');
    caller = nameWithoutId.substring(index + 1);
    description = nameWithoutId.substring(0, index);
  }
  maintenanceObj.caller = caller;
  maintenanceObj.description = description;
}

/**
 * Add new maintenance to maintenances list
 */
export function addMaintenanceToList(
  startTime: number,
  duration: number,
  maintenance: any,
  handledMaintenances: Maintenance[],
  timeperiod: any,
  activeTill: number,
  activeSince: number
) {
  const newItem: Maintenance = {} as Maintenance;
  newItem.name = maintenance.name;
  setMaintenanceDescriptionAndCaller(newItem, maintenance.name);
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
  newItem.activeTillString = moment(new Date(activeTill)).format('DD.MM.YYYY HH:mm');
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
 */
export function isOngoingMaintenance(maintenance: Maintenance): boolean {
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
}

/**
 * Parse given Date object to string
 * @param {Date} newDate
 * @returns {string}
 */
export function parseDateToString(newDate: Date) {
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
}

/**
 * Get ongoing maintenances
 */
export function getOngoingMaintenances(maintenances: Maintenance[]): any[] {
  const ongoingMaintenances: any[] = [];
  maintenances.map((maintenance: Maintenance) => {
    if (isOngoingMaintenance(maintenance)) {
      const endTime = new Date(maintenance.endTime * 1000);
      const maintenanceEnds = parseDateToString(endTime);
      const startTime = new Date(maintenance.startTime * 1000);
      const maintenanceStarts = parseDateToString(startTime);
      const newItem = {
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
      };
      setMaintenanceDescriptionAndCaller(newItem, maintenance.name);
      ongoingMaintenances.push(newItem);
    }
  });
  return ongoingMaintenances;
}

// Figure tooltip position for status panels
export function getTooltipXPos(tooltipWidth: any, pageX: number) {
  const totalWidth = pageX + tooltipWidth;
  const xpos = totalWidth > window.innerWidth ? window.innerWidth - tooltipWidth : pageX;
  return xpos;
}

/**
 * Validate string for CSV:
 * Replace doublequote (") with two doublequotes ("")
 * Quote fields that have CR, LF, " or ;
 * @param {string} fieldData
 * @returns {string}
 */
export function validateStringForCSV(fieldData: string) {
  let result = fieldData === null || typeof fieldData === 'undefined' ? '' : fieldData.toString();
  result = result.replace(/"/g, '""');
  if (result.search(/("|;|\n|\r)/g) >= 0) {
    result = '"' + result + '"';
  }
  return result;
}

/**
 * Export table data to CSV file
 * @param {any[]} selectedEvents
 * @param {string[]} titles used for CSV columns
 * @param {string[]} attributes used for event-objects
 * @param {string} sortBy used as sorting attribute name
 * @param {string} filename localized
 */
export function exportCSV(
  selectedEvents: any[],
  titles: string[],
  attributes: string[],
  sortBy: string,
  filename: string
) {
  const delimiter = ';';
  const rowChange = '\r\n';
  const universalBOM = '\uFEFF';
  let csvContent = '';
  titles.map((title: string, index: number) => {
    if (index < titles.length - 1) {
      csvContent += title + delimiter;
    } else {
      csvContent += title + rowChange;
    }
  });
  const sortedEvents = _.sortBy(selectedEvents, sortBy);
  sortedEvents.reverse();
  sortedEvents.forEach((row: any) => {
    csvContent +=
      attributes
        .map((attribute: string) => row[attribute])
        .map((field: any) => validateStringForCSV(field))
        .join(delimiter) + rowChange;
  });
  const blob = new Blob([universalBOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    var url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
