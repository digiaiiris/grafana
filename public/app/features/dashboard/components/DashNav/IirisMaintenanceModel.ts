/**
 * Maintenance related data model and zabbix api wrapper
 */
import { DateTime } from 'luxon';

import { getDataSourceSrv } from '@grafana/runtime';

// This corresponds to zabbix maintenance time period timeperiod_type property values
export enum MaintenanceType {
  OneTime = 0,
  Daily = 2,
  Weekly = 3,
  Monthly = 4,
}

// Used as a type for both weekly and monthly maintenances where weekday(s) can be selected
// Array index is weekday number 0-6; value is true/false indicating if the weekday is selected or not
export type WeekdaySelection = boolean[];

// Used as a type for and monthly maintenances where month(s) can be selected
// Array index is month number 0-11; value is true/false indicating if the month is selected or not
export type MonthSelection = boolean[];

// The basic type of fetched maintenances
export type Maintenance = {
  id: number; // zabbix maintenance maintenanceid property; 0 when creating a new maintenance
  name: string; // Maintenance name; zabbix maintenance name property
  description: string; // Description parsed from name
  createdBy?: string; // Maintenance creator parsed from name
  lastUpdatedTimestamp?: DateTime; // Last updated time parsed from name
  maintenanceType: MaintenanceType; // zabbix time period timeperiod_type property
  oneTimeStartTimestamp?: DateTime; // One-time maintenance start timestamp; max of active_since and period's start_date properties
  oneTimeEndTimestamp?: DateTime; // One-time maintenance end timestamp; min of active_till and start_date + period properties
  periodicActiveSinceTimestamp?: DateTime; // Periodic maintenance (daily, weekly or monthly): repeat start timestamp; active_since property (includes also time part)
  periodicActiveTillTimestamp?: DateTime; // Periodic maintenance (daily, weekly or monthly): repeat end timestamp; active_till property (includes also time part)
  periodicStartTime?: number; // Periodic maintenance (daily, weekly or monthly): time of day when maintenance starts in seconds; start_time property
  periodicStartTimeNotCompatibleWithCurrentTimeZone?: boolean; // True if periodic maintenance has been configured with another timezone so that start time cannot be represented with current timezone
  duration: number; // Maintenance duration in seconds; zabbix time period's period property
  every: number; // Periodic maintenance (daily, weekly or monthly): zabbix time period every property
  weekdays: WeekdaySelection; // Weekly and monthly maintenance: selected weekdays; zabbix time period dayofweek property
  day: number; // Monthly maintenance: zabbix time period day property
  months: MonthSelection; // Monthly maintenance: selected months; zabbix time period month property
  hosts: Array<{ hostid: number; name: string }>; // hosts assigned to the property; fetched with selectHosts parameter from zabbix api
  groups: Array<{ groupid: number; name: string }>; // host groups assigned to the property; fetched with selectHostGroups parameter from zabbix api
  ongoing: boolean; // Is the maintenance currently ongoing?

  startTimeString: string; // Maintenance start time formatted as string for the maintenance list
  endTimeString: string; // Maintenance end time formatted as string for the maintenance list
  repeatEndString?: string; // Periodic maintenance end date formatted as string for the maintenance list
};

// A single instance of periodic maintenance
export type MaintenanceInstanceDates = {
  startTime: DateTime; // When the maintenance starts
  endTime: DateTime; // When the maintenance ends
  ongoing: boolean; // If the maintenance is currently ongoing
};

/**
 * Get Zabbix datasource object from Grafana data source service
 * @returns {Promise}
 */
export function getZabbixDataSource(zabbixDataSourceName: string) {
  return new Promise<any>((resolve: any, reject: any) => {
    getDataSourceSrv()
      .get(zabbixDataSourceName)
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
  });
}

// Sort host list based on their names
function sortHostNames(hostA: any, hostB: any) {
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
export async function fetchHostsAndGroups(
  zabbixDataSource: string,
  hostGroup: string | undefined
): Promise<{
  hosts: Array<{ name: string; hostid: number }>;
  groupIds: number[];
}> {
  // Get Zabbix data source for Zabbix API queries
  return getZabbixDataSource(zabbixDataSource).then((zabbix: any) => {
    // Find out host group ids if not showing all hosts
    var p: Promise<any>;
    var groupIds: number[] | undefined;
    const hostGroupName = hostGroup; // Undefined if getting all hosts regardless of host group
    if (!hostGroupName) {
      groupIds = undefined;
      p = Promise.resolve();
    } else {
      p = getNestedHostGroups(hostGroupName, zabbix.zabbixAPI).then((fetchedGroupIds) => {
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
      return zabbix.zabbixAPI.request('host.get', hostQuery).then((hosts: Array<{ name: string; hostid: string }>) => {
        if (hostGroupName) {
          // Filter out hosts ending with -sla _sla .sla -SLA _SLA .SLA
          hosts = hosts.filter((host) => !/[-_.](sla|SLA)$/.test(host.name));
        }

        // Sort
        hosts = hosts.sort(sortHostNames);

        // Parse hostid numbers
        const hostsWithNumbers = hosts.map((host) => ({
          name: host.name,
          hostid: parseInt(host.hostid, 10),
        }));

        return {
          hosts: hostsWithNumbers,
          groupIds: groupIds,
        };
      });
    });
  });
}

// Find the host group and its nested groups from zabbix API; returns array of group ids
export async function getNestedHostGroups(hostGroupName: string, zabbixAPI: any) {
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

/**
 * Get all maintenances from Zabbix
 * @returns {Promise}
 */
export async function getMaintenances(
  hostIds: number[],
  groupIds: number[] | undefined,
  zabbixDatasource: string
): Promise<Maintenance[]> {
  return new Promise<Maintenance[]>((resolve: any, reject: any) => {
    getZabbixDataSource(zabbixDatasource)
      .then((zabbix: any) => {
        // Usually zabbix data source has caching enabled so that getMaintenances() results are cached for 1 minute
        // Invalidate the cache so that maintenances list will reflect the current situation
        // (it's important eg. when the user cancels a maintenance and the list is subsequently refreshed)
        delete zabbix.cachingProxy.cache['getMaintenances'];

        zabbix.zabbixAPI
          .getMaintenances(hostIds, groupIds)
          .then((maintenances: any) => {
            const allMaintenances = parseMaintenances(maintenances);
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
 * Parse maintenances received from Zabbix API based on the time period type:
 * 0 - One time period
 * 2 - Daily period
 * 3 - Weekly period
 * 4 - Monthly period
 * @param {any} maintenances fetched from Zabbix API
 * @returns {Maintenance[]} Handled aintenances
 *
 * Note that the method returns only one upcoming maintenance for daily/weekly/monthly periods.
 */
export function parseMaintenances(maintenances: any[]): Maintenance[] {
  const parsedMaintenances: Maintenance[] = [];
  maintenances.forEach((maintenance: any) => {
    // Maintenance can in theory have multiple time periods in Zabbix
    // even though when creating maintenances with Iiris maintenance dialog it creates only one time period for
    // each maintenance.
    maintenance.timeperiods.forEach((timeperiod: any) => {
      const activeSince = DateTime.fromSeconds(parseInt(maintenance.active_since, 10));
      const activeTill = DateTime.fromSeconds(parseInt(maintenance.active_till, 10));
      const periodStartDate = DateTime.fromSeconds(parseInt(timeperiod.start_date, 10));
      const duration = parseInt(timeperiod.period, 10);
      const periodicStartTimeSecondsUTC = parseInt(timeperiod.start_time, 10); // This is always UTC hours & minutes in Zabbix

      if (timeperiod.timeperiod_type === '0') {
        // One-time maintenance period

        // The maintenance time is limited both by the active still/till properties and the period's properties
        const startTimestamp = DateTime.max(activeSince, periodStartDate);
        const endTimestamp = DateTime.min(activeTill, periodStartDate.plus({ seconds: duration }));
        if (endTimestamp < DateTime.now()) {
          // The maintenance is in the past: ignore it
          return;
        }

        const parsedMaintenance = {
          ...parseBasicMaintenanceFields(maintenance, timeperiod),
          oneTimeStartTimestamp: startTimestamp,
          oneTimeEndTimestamp: endTimestamp,
          ongoing: startTimestamp <= DateTime.now(),
          startTimeString: startTimestamp.toFormat('dd.LL.yyyy HH:mm'),
          endTimeString: endTimestamp.toFormat('dd.LL.yyyy HH:mm'),
        };
        parsedMaintenances.push(parsedMaintenance);
      } else if (timeperiod.timeperiod_type === '2') {
        // Daily maintenance period

        const parsedMaintenance: Maintenance = {
          ...parseBasicMaintenanceFields(maintenance, timeperiod),
          periodicActiveSinceTimestamp: activeSince,
          periodicActiveTillTimestamp: activeTill,
          ongoing: false,
          startTimeString: '',
          endTimeString: '',
          repeatEndString: activeTill.minus({ seconds: duration }).toFormat('dd.LL.yyyy'),
        };

        // Convert periodic start time from UTC to local time
        var utcOffsetSeconds = DateTime.now().offset * 60;
        var periodicStartTimeSecondsLocal = periodicStartTimeSecondsUTC - utcOffsetSeconds;
        if (periodicStartTimeSecondsLocal < 0) {
          periodicStartTimeSecondsLocal += 24 * 3600;
        } else if (periodicStartTimeSecondsLocal >= 24 * 3600) {
          periodicStartTimeSecondsLocal -= 24 * 3600;
        }
        parseDailyPeriodicStartTime(parsedMaintenance, periodicStartTimeSecondsUTC);

        // Figure out the next (or ongoing) maintenance time
        const nextMaintenances = getNextDailyMaintenances(
          parsedMaintenance.periodicActiveSinceTimestamp!,
          parsedMaintenance.periodicActiveTillTimestamp!,
          parsedMaintenance.every,
          parsedMaintenance.periodicStartTime!,
          parsedMaintenance.duration
        );
        if (nextMaintenances.length === 0) {
          // The maintenance is in the past: ignore it
          return;
        }
        const next = nextMaintenances[0];
        parsedMaintenance.ongoing = next.ongoing;
        parsedMaintenance.startTimeString = next.startTime.toFormat('dd.LL.yyyy HH:mm');
        parsedMaintenance.endTimeString = next.endTime.toFormat('dd.LL.yyyy HH:mm');
        parsedMaintenances.push(parsedMaintenance);
      } else if (timeperiod.timeperiod_type === '3') {
        // Weekly maintenance period

        const parsedMaintenance: Maintenance = {
          ...parseBasicMaintenanceFields(maintenance, timeperiod),
          periodicActiveSinceTimestamp: activeSince,
          periodicActiveTillTimestamp: activeTill,
          ongoing: false,
          startTimeString: '',
          endTimeString: '',
          repeatEndString: activeTill.minus({ seconds: duration }).toFormat('dd.LL.yyyy'),
        };

        // Convert periodic start time from UTC to local time
        parseWeeklyPeriodicStartTime(parsedMaintenance, periodicStartTimeSecondsUTC);

        // Figure out the next (or ongoing) maintenance time
        const nextMaintenances = getNextWeeklyMaintenances(
          parsedMaintenance.periodicActiveSinceTimestamp!,
          parsedMaintenance.periodicActiveTillTimestamp!,
          parsedMaintenance.every,
          parsedMaintenance.weekdays,
          parsedMaintenance.periodicStartTime!,
          parsedMaintenance.duration
        );
        if (nextMaintenances.length === 0) {
          // The maintenance is in the past: ignore it
          return;
        }
        const next = nextMaintenances[0];
        parsedMaintenance.ongoing = next.ongoing;
        parsedMaintenance.startTimeString = next.startTime.toFormat('dd.LL.yyyy HH:mm');
        parsedMaintenance.endTimeString = next.endTime.toFormat('dd.LL.yyyy HH:mm');
        parsedMaintenances.push(parsedMaintenance);
      } else if (timeperiod.timeperiod_type === '4') {
        // Monthly maintenance period

        const parsedMaintenance: Maintenance = {
          ...parseBasicMaintenanceFields(maintenance, timeperiod),
          periodicActiveSinceTimestamp: activeSince,
          periodicActiveTillTimestamp: activeTill,
          ongoing: false,
          startTimeString: '',
          endTimeString: '',
          repeatEndString: activeTill.minus({ seconds: duration }).toFormat('dd.LL.yyyy'),
        };

        // Convert periodic start time from UTC to local time
        const weekdaySet = parsedMaintenance.weekdays.some((weekdaySelected) => weekdaySelected);
        if (weekdaySet) {
          // Maintenance occurs of the selected weekday(s) and on the defined week of the month
          parseWeeklyPeriodicStartTime(parsedMaintenance, periodicStartTimeSecondsUTC);
        } else {
          parseNthDayPerMonthPeriodicStartTime(parsedMaintenance, periodicStartTimeSecondsUTC);
        }

        // Figure out the next (or ongoing) maintenance time
        const nextMaintenances = getNextMonthlyMaintenances(
          parsedMaintenance.periodicActiveSinceTimestamp!,
          parsedMaintenance.periodicActiveTillTimestamp!,
          parsedMaintenance.every,
          parsedMaintenance.weekdays,
          parsedMaintenance.day,
          parsedMaintenance.months,
          parsedMaintenance.periodicStartTime!,
          parsedMaintenance.duration
        );
        if (nextMaintenances.length === 0) {
          // The maintenance is in the past: ignore it
          return;
        }
        const next = nextMaintenances[0];
        parsedMaintenance.ongoing = next.ongoing;
        parsedMaintenance.startTimeString = next.startTime.toFormat('dd.LL.yyyy HH:mm');
        parsedMaintenance.endTimeString = next.endTime.toFormat('dd.LL.yyyy HH:mm');
        parsedMaintenances.push(parsedMaintenance);
      }
    });
  });
  return parsedMaintenances;
}

/**
 * Parse description, createdBy and lastUpdatedTimestamp attributes from maintenance name field
 * Formatted like 'description|createdBy|updated epoch in seconds'
 * e.g. 'Some maintenance name|john@doe.com|1704372884'
 * @param {string} nameField
 */
export function parseMaintenanceName(nameField: string) {
  let description = '';
  let createdBy;
  let lastUpdatedTimestamp;
  const dividerAmount = (nameField.match(/\|/g) || []).length;
  if (dividerAmount < 2) {
    description = nameField;
  } else if (dividerAmount === 2) {
    description = nameField.split('|')[0];
    createdBy = nameField.split('|')[1];
  } else {
    const nameWithoutEpoch = nameField.substring(0, nameField.lastIndexOf('|'));
    const index = nameWithoutEpoch.lastIndexOf('|');
    createdBy = nameWithoutEpoch.substring(index + 1);
    description = nameWithoutEpoch.substring(0, index);
    lastUpdatedTimestamp = DateTime.fromSeconds(parseInt(nameField.substring(nameField.lastIndexOf('|') + 1), 10));
  }
  return {
    createdBy: createdBy,
    description: description,
    lastUpdatedTimestamp: lastUpdatedTimestamp,
  };
}

/**
 * Parse basic fields of Zabbix API maintenance object
 */
function parseBasicMaintenanceFields(maintenance: any, timeperiod: any) {
  const duration = parseInt(timeperiod.period, 10);

  // Selected weekdays of weekly or monthly maintenance
  // Turn dayofweek number to binary and then to array to get selected weekdays
  var weekdays: WeekdaySelection = [false, false, false, false, false, false, false];
  const daysBinary = parseInt(timeperiod.dayofweek, 10).toString(2).split('').reverse();
  for (let i = 0; i < 7; i++) {
    if (daysBinary[i] === '1') {
      weekdays[i] = true;
    }
  }

  // Selected months of monthly maintenance
  // Turn month number to binary and then to array to get selected months
  var months: MonthSelection = [false, false, false, false, false, false, false, false, false, false, false, false];
  const monthsBinary = parseInt(timeperiod.month, 10).toString(2).split('').reverse();
  for (let i = 0; i < 12; i++) {
    if (monthsBinary[i] === '1') {
      months[i] = true;
    }
  }

  return {
    name: maintenance.name,
    ...parseMaintenanceName(maintenance.name),
    hosts: maintenance.hosts.map((host: any) => ({
      hostid: parseInt(host.hostid, 10),
      name: host.name,
    })),
    groups: maintenance.groups.map((group: any) => ({
      groupid: parseInt(group.groupid, 10),
      group: group.name,
    })),
    id: parseInt(maintenance.maintenanceid, 10),
    maintenanceType: parseInt(timeperiod.timeperiod_type, 10),
    every: parseInt(timeperiod.every, 10),
    month: parseInt(timeperiod.month, 10),
    day: parseInt(timeperiod.day, 10),
    dayOfWeek: timeperiod.dayofweek,
    duration: duration,
    weekdays: weekdays,
    months: months,
  };
}

// Parse periodic start time in case of daily maintenance
function parseDailyPeriodicStartTime(m: Maintenance, periodicStartTimeSecondsUTC: number) {
  // Convert periodic start time from UTC to local time
  var utcOffsetSeconds = DateTime.now().offset * 60;
  var periodicStartTimeSecondsLocal = periodicStartTimeSecondsUTC + utcOffsetSeconds;
  if (periodicStartTimeSecondsLocal < 0) {
    // This may happen if the user configured maintenance in different local timezone then the one viewing it
    if (m.every !== 1) {
      // The maintenance occurs every Nth day;
      // however the first day of occurence varies on different timezones
      m.periodicStartTimeNotCompatibleWithCurrentTimeZone = true;
    }
    periodicStartTimeSecondsLocal += 24 * 3600;
  } else if (periodicStartTimeSecondsLocal >= 24 * 3600) {
    // This may happen if the user configured maintenance in different local timezone then the one viewing it
    if (m.every !== 1) {
      // The maintenance occurs every Nth day;
      // however the first day of occurence varies on different timezones
      m.periodicStartTimeNotCompatibleWithCurrentTimeZone = true;
    }
    periodicStartTimeSecondsLocal -= 24 * 3600;
  }
  m.periodicStartTime = periodicStartTimeSecondsLocal;
}

// Parse periodic start time in case of weekly maintenance
// or monthly maintenance with Nth weekday(s) of month
function parseWeeklyPeriodicStartTime(m: Maintenance, periodicStartTimeSecondsUTC: number) {
  // Convert periodic start time from UTC to local time
  var utcOffsetSeconds = DateTime.now().offset * 60;
  var periodicStartTimeSecondsLocal = periodicStartTimeSecondsUTC + utcOffsetSeconds;
  if (periodicStartTimeSecondsLocal < 0) {
    // This may happen if the user configured maintenance in different local timezone then the one viewing it
    // Previous weekday time; shift weekdays left (eg. if Wed is selected => Tue will be selected)
    if (m.every === 1) {
      m.weekdays = m.weekdays.map((weekdaySelected, weekday) => {
        var nextWeekdaySelected = m.weekdays[(weekday + 1) % 7];
        return nextWeekdaySelected;
      });
    } else {
      // The maintenance occurs every Nth week on the configured weekdays;
      // however the first week of occurence may vary on different timezones if weekdays are shifted
      m.periodicStartTimeNotCompatibleWithCurrentTimeZone = true;
    }
    periodicStartTimeSecondsLocal += 24 * 3600;
  } else if (periodicStartTimeSecondsLocal >= 24 * 3600) {
    // This may happen if the user configured maintenance in different local timezone then the one viewing it
    // Next weekday time; shift weekdays right (eg. if Tue is selected => Wed will be selected)
    if (m.every === 1) {
      m.weekdays = m.weekdays.map((weekdaySelected, weekday) => {
        var previousWeekdaySelected = m.weekdays[(weekday - 1 + 7) % 7];
        return previousWeekdaySelected;
      });
    } else {
      // The maintenance occurs every Nth week on the configured weekdays;
      // however the first week of occurence may vary on different timezones if weekdays were shifted
      m.periodicStartTimeNotCompatibleWithCurrentTimeZone = true;
    }
    periodicStartTimeSecondsLocal -= 24 * 3600;
  }
  m.periodicStartTime = periodicStartTimeSecondsLocal;
}

// Parse periodic start time in case of monthy maintenance with Nth day of month selected
function parseNthDayPerMonthPeriodicStartTime(m: Maintenance, periodicStartTimeSecondsUTC: number) {
  // Convert periodic start time from UTC to local time
  var utcOffsetSeconds = DateTime.now().offset * 60;
  var periodicStartTimeSecondsLocal = periodicStartTimeSecondsUTC + utcOffsetSeconds;
  if (periodicStartTimeSecondsLocal < 0) {
    // This may happen if the user configured maintenance in different local timezone then the one viewing it
    // Previous day; shift day left
    if (m.day > 1) {
      m.day--;
    } else {
      // Day would be zero; cannot be represented with the current local timezone
      m.periodicStartTimeNotCompatibleWithCurrentTimeZone = true;
    }
    periodicStartTimeSecondsLocal += 24 * 3600;
  } else if (periodicStartTimeSecondsLocal >= 24 * 3600) {
    // This may happen if the user configured maintenance in different local timezone then the one viewing it
    // Next day; shift day right
    if (m.day < 31) {
      m.day++;
    } else {
      // Day would be zero; cannot be represented with the current local timezone
      m.periodicStartTimeNotCompatibleWithCurrentTimeZone = true;
    }
    periodicStartTimeSecondsLocal -= 24 * 3600;
  }
  m.periodicStartTime = periodicStartTimeSecondsLocal;
}

// Calculate the next 10 maintenance periods of the given daily maintenance
// Including a possibly ongoing maintenance
export function getNextDailyMaintenances(
  periodicActiveSinceTimestamp: DateTime,
  periodicActiveTillTimestamp: DateTime,
  every: number, // Repeats every N days
  periodicStartTime: number, // Start time in seconds of the day
  duration: number // Duration in seconds
) {
  const repeatStartDate = periodicActiveSinceTimestamp.startOf('day');
  const now = DateTime.now();
  let repeatIndex = 0;
  const dates: MaintenanceInstanceDates[] = [];
  while (true) {
    let maintenanceStart = repeatStartDate.plus({ days: repeatIndex * every }).plus({ seconds: periodicStartTime });
    let maintenanceEnd = DateTime.min(periodicActiveTillTimestamp, maintenanceStart.plus({ seconds: duration }));
    maintenanceStart = DateTime.max(periodicActiveSinceTimestamp, maintenanceStart);
    if (maintenanceStart >= periodicActiveTillTimestamp) {
      break;
    }
    if (maintenanceEnd >= now) {
      // Maintenance is not in the past
      dates.push({
        startTime: maintenanceStart,
        endTime: maintenanceEnd,
        ongoing: maintenanceStart <= now,
      });
      if (dates.length === 10) {
        break;
      }
    }
    repeatIndex++;
  }
  return dates;
}

// Calculate the next 10 maintenance periods of the given weekly maintenance
// Including a possibly ongoing maintenance
export function getNextWeeklyMaintenances(
  periodicActiveSinceTimestamp: DateTime,
  periodicActiveTillTimestamp: DateTime,
  every: number, // Repeats every N weeks
  weekdays: WeekdaySelection, // Weekday(s) selected
  periodicStartTime: number, // Start time in seconds of the day
  duration: number // Duration in seconds
) {
  const repeatStartWeek = periodicActiveSinceTimestamp.startOf('week');
  const now = DateTime.now();
  let repeatIndex = 0;
  const dates: MaintenanceInstanceDates[] = [];
  let reachedEnd = false;
  while (!reachedEnd) {
    let weekStart = repeatStartWeek.plus({ weeks: repeatIndex * every });
    if (weekStart > periodicActiveTillTimestamp) {
      // A safety measure for a maintenance that has no weekdays selected (should not happen)
      break;
    }
    weekdays.forEach((selected, weekday) => {
      if (!selected || reachedEnd) {
        return;
      }
      let maintenanceStart = weekStart.plus({ days: weekday }).plus({ seconds: periodicStartTime });
      let maintenanceEnd = DateTime.min(periodicActiveTillTimestamp, maintenanceStart.plus({ seconds: duration }));
      maintenanceStart = DateTime.max(periodicActiveSinceTimestamp, maintenanceStart);
      if (maintenanceEnd <= periodicActiveSinceTimestamp) {
        // Since looping starts from beginning of active since week
        return;
      }
      if (maintenanceStart >= periodicActiveTillTimestamp) {
        reachedEnd = true;
        return;
      }
      if (maintenanceEnd >= now) {
        // Maintenance is not in the past
        dates.push({
          startTime: maintenanceStart,
          endTime: maintenanceEnd,
          ongoing: maintenanceStart <= now,
        });
        if (dates.length === 10) {
          reachedEnd = true;
        }
      }
    });
    repeatIndex++;
  }
  return dates;
}

// Calculate the next 10 maintenance periods of the given monthly maintenance
// Including a possibly ongoing maintenance
export function getNextMonthlyMaintenances(
  periodicActiveSinceTimestamp: DateTime,
  periodicActiveTillTimestamp: DateTime,
  every: number, // When weekday(s) are selected defines the week of the month: first, second, third, fourth or last
  weekdays: WeekdaySelection, // Weekday(s) selected
  day: number, // Repeats on Nth day of month
  months: MonthSelection, // Month(s) selected
  periodicStartTime: number, // Start time in seconds of the day
  duration: number // Duration in seconds
) {
  const repeatStartYear = periodicActiveSinceTimestamp.startOf('year');
  const now = DateTime.now();
  let repeatYearIndex = 0;
  const dates: MaintenanceInstanceDates[] = [];
  const weekdaySet = weekdays.some((weekdaySelected) => weekdaySelected);
  let reachedEnd = false;
  while (!reachedEnd) {
    let yearStart = repeatStartYear.plus({ years: repeatYearIndex });
    if (yearStart > periodicActiveTillTimestamp) {
      // A safety measure for a maintenance that has no months selected (should not happen)
      break;
    }
    months.forEach((monthSelected, month) => {
      if (!monthSelected || reachedEnd) {
        return;
      }
      let monthStart = yearStart.plus({ months: month });

      if (weekdaySet) {
        // Maintenance occurs of the selected weekday(s) and on the defined week of the month
        weekdays.forEach((weekSelected, weekday) => {
          if (!weekSelected || reachedEnd) {
            return;
          }
          // Move to the first weekday of the month
          var dayDifference = weekday - (monthStart.weekday - 1);
          if (dayDifference < 0) {
            dayDifference += 7;
          }
          let weekdayStart = monthStart.plus({ days: dayDifference });
          if (every >= 2 && every <= 4) {
            weekdayStart = weekdayStart.plus({ weeks: every - 1 });
          } else if (every === 5) {
            // Last week of the month which contains the weekday
            weekdayStart = weekdayStart.plus({ weeks: 3 });
            var nextWeek = weekdayStart.plus({ weeks: 1 });
            if (nextWeek.month === weekdayStart.month) {
              weekdayStart = nextWeek;
            }
          }
          let maintenanceStart = weekdayStart.plus({ seconds: periodicStartTime });
          let maintenanceEnd = DateTime.min(periodicActiveTillTimestamp, maintenanceStart.plus({ seconds: duration }));
          maintenanceStart = DateTime.max(periodicActiveSinceTimestamp, maintenanceStart);
          if (maintenanceEnd <= periodicActiveSinceTimestamp) {
            // Since looping starts from beginning of active since year
            return;
          }
          if (maintenanceStart >= periodicActiveTillTimestamp) {
            reachedEnd = true;
            return;
          }
          if (maintenanceEnd >= now) {
            // Maintenance is not in the past
            dates.push({
              startTime: maintenanceStart,
              endTime: maintenanceEnd,
              ongoing: maintenanceStart <= now,
            });
            if (dates.length === 10) {
              reachedEnd = true;
            }
          }
        });
      } else {
        // Maintenance occurs on the Nth day of the month
        let maintenanceStart = monthStart.plus({ days: day - 1 }).plus({ seconds: periodicStartTime });
        if (maintenanceStart.month !== monthStart.month) {
          // The month does not have enough days for the configured Nth day of the month
          return;
        }
        let maintenanceEnd = DateTime.min(periodicActiveTillTimestamp, maintenanceStart.plus({ seconds: duration }));
        maintenanceStart = DateTime.max(periodicActiveSinceTimestamp, maintenanceStart);
        if (maintenanceEnd <= periodicActiveSinceTimestamp) {
          // Since looping starts from beginning of active since year
          return;
        }
        if (maintenanceStart >= periodicActiveTillTimestamp) {
          reachedEnd = true;
          return;
        }
        if (maintenanceEnd >= now) {
          // Maintenance is not in the past
          dates.push({
            startTime: maintenanceStart,
            endTime: maintenanceEnd,
            ongoing: maintenanceStart <= now,
          });
          if (dates.length === 10) {
            reachedEnd = true;
          }
        }
      }
    });
    repeatYearIndex++;
  }

  // "Last weekdays" of month may generate dates in other than ascending order
  // (eg. if last Wednesday is before last Monday of the month)
  // That's why sort the dates
  function ascendingStartTimeOrder(a: MaintenanceInstanceDates, b: MaintenanceInstanceDates) {
    return a.startTime.toMillis() - b.startTime.toMillis();
  }
  return dates.sort(ascendingStartTimeOrder);
}

// Save maintenance into Zabbix
export async function saveMaintenance(m: Maintenance, zabbixDatasource: string) {
  return getZabbixDataSource(zabbixDatasource).then((zabbix: any) => {
    const maintenanceObj: any = {
      name: (m.description || '') + '|' + (m.createdBy || '') + '|' + m.lastUpdatedTimestamp?.toUnixInteger(),
      hostids: m.hosts.map((host) => host.hostid),
      timeperiods: [
        {
          timeperiod_type: m.maintenanceType,
          period: m.duration,
        },
      ],
    };
    const period = maintenanceObj.timeperiods[0];

    if (m.maintenanceType === MaintenanceType.OneTime) {
      maintenanceObj.active_since = m.oneTimeStartTimestamp!.toUnixInteger();
      maintenanceObj.active_till = m.oneTimeEndTimestamp!.toUnixInteger();
      period.start_date = m.oneTimeStartTimestamp!.toUnixInteger();
    } else {
      maintenanceObj.active_since = m.periodicActiveSinceTimestamp!.toUnixInteger();
      maintenanceObj.active_till = m.periodicActiveTillTimestamp!.toUnixInteger();

      const weekdaySet = m.weekdays.some((weekdaySelected) => weekdaySelected);

      if (m.maintenanceType === MaintenanceType.Daily) {
        // Daily maintenance
        encodeDailyStartTime(period, m.periodicStartTime!);
        period.every = m.every;
      } else if (
        m.maintenanceType === MaintenanceType.Weekly ||
        (m.maintenanceType === MaintenanceType.Monthly && weekdaySet)
      ) {
        // Weekly maintenance or monethly maintenance on Nth weekday(s) of month
        encodeWeekdaysStartTime(period, m.periodicStartTime!, m.weekdays);
        period.every = m.every;
      } else {
        // Monthly maintenance on Nth day of month
        encodeMonthDayStartTime(period, m.periodicStartTime!, m.day);
      }

      if (m.maintenanceType === MaintenanceType.Monthly) {
        // Encode selected month(s) into binary format
        let monthBinary = '';
        for (var month = 0; month < 12; month++) {
          if (m.months[month]) {
            monthBinary = '1' + monthBinary;
          } else {
            monthBinary = '0' + monthBinary;
          }
        }
        period.month = parseInt(monthBinary, 2);
      }
    }

    // Check if we are updating an existing maintenance
    let apiCommand = 'maintenance.create';
    if (m.id) {
      maintenanceObj['maintenanceid'] = m.id;
      apiCommand = 'maintenance.update';
    }

    return zabbix.zabbixAPI.request(apiCommand, maintenanceObj);
  });
}

// Encode the maintenance start time of daily maintenance for saving
function encodeDailyStartTime(period: any, startTimeLocal: number) {
  // Convert periodic start time from local time to UTC
  var utcOffsetSeconds = DateTime.now().offset * 60;
  var periodicStartTimeSecondsUTC = startTimeLocal - utcOffsetSeconds;
  if (periodicStartTimeSecondsUTC < 0) {
    // Eg. 01:00 local time would be 23:00 previous day UTC time with UTC+2 offset (Finland winter time)
    periodicStartTimeSecondsUTC += 24 * 3600;
  } else if (periodicStartTimeSecondsUTC >= 24 * 3600) {
    // Eg. 23:00 local time would be 04:00 next day with UTC-5 offset (New York)
    periodicStartTimeSecondsUTC -= 24 * 3600;
  }
  period.start_time = periodicStartTimeSecondsUTC;
}

// Encode the selected weekday(s) and maintenance start time for saving
function encodeWeekdaysStartTime(period: any, startTimeLocal: number, selectedWeekdays: WeekdaySelection) {
  var weekdays = [...selectedWeekdays];

  // Convert periodic start time from local time to UTC
  var utcOffsetSeconds = DateTime.now().offset * 60;
  var periodicStartTimeSecondsUTC = startTimeLocal - utcOffsetSeconds;
  if (periodicStartTimeSecondsUTC < 0) {
    // Eg. 01:00 local time would be 23:00 previous day UTC time with UTC+2 offset (Finland winter time)
    // Previous weekday time; shift weekdays left (eg. if Wed is selected => Tue will be selected)
    weekdays = weekdays.map((weekdaySelected, weekday) => {
      var nextWeekdaySelected = weekdays[(weekday + 1) % 7];
      return nextWeekdaySelected;
    });
    periodicStartTimeSecondsUTC += 24 * 3600;
  } else if (periodicStartTimeSecondsUTC >= 24 * 3600) {
    // Eg. 23:00 local time would be 04:00 next day with UTC-5 offset (New York)
    // Next weekday time; shift weekdays right (eg. if Tue is selected => Wed will be selected)
    weekdays = weekdays.map((weekdaySelected, weekday) => {
      var previousWeekdaySelected = weekdays[(weekday - 1 + 7) % 7];
      return previousWeekdaySelected;
    });
    periodicStartTimeSecondsUTC -= 24 * 3600;
  }
  period.start_time = periodicStartTimeSecondsUTC;

  // Encode selected weekday(s) into binary format
  let dayOfWeekBinary = '';
  for (var weekday = 0; weekday < 7; weekday++) {
    if (weekdays[weekday]) {
      dayOfWeekBinary = '1' + dayOfWeekBinary;
    } else {
      dayOfWeekBinary = '0' + dayOfWeekBinary;
    }
  }
  period.dayofweek = parseInt(dayOfWeekBinary, 2);
}

// Encode the selected month(s) and maintenance start time for saving
function encodeMonthDayStartTime(period: any, startTimeLocal: number, dayOfMonth: number) {
  // Convert periodic start time from local time to UTC
  var utcOffsetSeconds = DateTime.now().offset * 60;
  var periodicStartTimeSecondsUTC = startTimeLocal - utcOffsetSeconds;
  if (periodicStartTimeSecondsUTC < 0) {
    // Previous day; shift day left
    if (dayOfMonth > 1) {
      dayOfMonth--;
    } else {
      // This should be prevented in the UI
      throw new Error('Cannot convert start time and day of month from local to UTC');
    }
    periodicStartTimeSecondsUTC += 24 * 3600;
  } else if (periodicStartTimeSecondsUTC >= 24 * 3600) {
    // Next day; shift day right
    if (dayOfMonth < 31) {
      dayOfMonth++;
    } else {
      // This should be prevented in the UI
      throw new Error('Cannot convert start time and day of month from local to UTC');
    }
    periodicStartTimeSecondsUTC -= 24 * 3600;
  }
  period.start_time = periodicStartTimeSecondsUTC;
  period.day = dayOfMonth;
}
