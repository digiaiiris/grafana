/**
 * This component is a modal wizard dialog that prompts the user to enter maintenance information
 * for creating a new maintenance or editing an existing one.
 */

import { DateTime } from 'luxon';
import React, { PureComponent } from 'react';

import { AppEvents } from '@grafana/data';
import { Modal } from '@grafana/ui';
import appEvents from 'app/core/app_events';
import { contextSrv } from 'app/core/core';

import {
  Maintenance,
  MaintenanceType,
  getNextDailyMaintenances,
  getNextWeeklyMaintenances,
  getNextMonthlyMaintenances,
  WeekdaySelection,
  MonthSelection,
  saveMaintenance,
  MaintenanceInstanceDates,
} from './IirisMaintenanceModel';

// The wizard consists of three phases
enum WizardPhase {
  FirstDates = 1,
  SecondDescriptionAndHosts = 2,
  ThirdSummary = 3,
}

// Monthly maintenance has two repeat modes
enum MonthlyDayPeriodSelection {
  Week = 1, // The maintenance is repeated on Nth weekday(s) of the month
  Month = 2, // The maintenance is repeated on Nth day of the month
}

interface Props {
  show: boolean; // Show modal dialog
  onCloseMaintenanceEditWizard(): void;
  hosts: Array<{ name: string; hostid: number }>; // All hosts of the configured host group
  selectedMaintenance?: Maintenance; // Undefined if creating a new maintenance
  zabbixDataSource: string; // Zabbix data source
}

interface State {
  isLoading: boolean; // When true, wizard buttons are disabled. Used when saving maintenance to Zabbix.
  wizardPhase: WizardPhase;
  maintenanceType: MaintenanceType;
  everyNDays: number; // Daily maintenance: repeat every N days; NaN if input field is empty
  everyNWeeks: number; // Weekly maintenance: repeat every N weeks; NaN if input field is empty
  weeklyWeekdays: WeekdaySelection; // Weekly maintenance: selected weekdays
  months: MonthSelection; // Monthly maintenance: selected months
  dayOfMonthOrWeekSelected: MonthlyDayPeriodSelection; // Monthly maintenance: manner in which the maintenance is repeated
  dayOfMonth: number; // Monthly maintenance: Nth day of the month; only if dayOfMonthOrWeekSelected is Month
  monthlyWeekdays: WeekdaySelection; // Monthly maintenance: selected weekday if repeated on Nth weekday(s) of the month
  monthlyWeekNumberInput: number; // Monthly maintenance: the week of month (1 - first, 2 - second, ..., 5 - last); only if dayOfMonthOrWeekSelected is Week

  oneTimeStartTimestamp: DateTime; // One-time maintenance start timestamp
  periodicRepeatStartDate: DateTime; // Periodic maintenance (daily, weekly or monthly): first date on which maintenance starts (if it fills other repeat conditions); only date part is significant
  periodicRepeatEndDate: DateTime; // Periodic maintenance (daily, weekly or monthly): last date on which maintenance starts (if it fills other repeat conditions); only date part is significant
  periodicStartHour: number; // Periodic maintenance (daily, weekly or monthly): hour of day when maintenance starts in seconds
  periodicStartMinute: number; // Periodic maintenance (daily, weekly or monthly): minute when maintenance starts in seconds

  // Duration of the maintenance in seconds
  duration: number;

  // True if end time (ie. duration) is entered manually, false if duration is selected from a dropdown
  strictEndTimeSelected: boolean;

  // Maintenance description
  description: string;

  // Search filter for hosts selection
  searchText: string;

  // This contains all the hosts and selected flag
  selectedHosts: Array<{ name: string; hostid: number; selected: boolean }>;
}

export class IirisMaintenanceEditWizard extends PureComponent<Props, State> {
  // Initial state
  state: State = {
    isLoading: false,
    wizardPhase: WizardPhase.FirstDates,
    maintenanceType: MaintenanceType.OneTime,
    everyNDays: 1,
    everyNWeeks: 1,
    weeklyWeekdays: [false, false, false, false, false, false, false],
    months: [false, false, false, false, false, false, false, false, false, false, false, false],
    dayOfMonthOrWeekSelected: MonthlyDayPeriodSelection.Month,
    dayOfMonth: 1,
    monthlyWeekdays: [false, false, false, false, false, false, false],
    monthlyWeekNumberInput: 1,
    oneTimeStartTimestamp: DateTime.now(),
    periodicRepeatStartDate: DateTime.now(),
    periodicRepeatEndDate: DateTime.now(),
    periodicStartHour: 0,
    periodicStartMinute: 0,
    duration: 0,
    strictEndTimeSelected: false,
    description: '',
    searchText: '',
    selectedHosts: [],
  };

  // Pre-set duration dropdown options
  durationOptions: Array<{ text: string; value: number }>;

  // Maintenance type dropdown options
  mTypeInputOptions: Array<{ label: string; value: MaintenanceType }>;

  // Monthly maintenance: Nth day of month or Nth weekday(s) of month selection
  monthlyWeekNumberInputOptions: Array<{ label: string; value: number }>;

  weekdayNames: string[] = []; // Mon-Sun 0-7
  monthNames: string[] = []; // Jan-Dec 0-11
  texts: any;

  // Class constructor
  constructor(props: Props) {
    super(props);
    this.texts = contextSrv.getLocalizedTexts();

    for (var weekday = 0; weekday < 7; weekday++) {
      this.weekdayNames[weekday] = this.texts['weekday' + weekday];
    }
    for (var month = 0; month < 12; month++) {
      this.monthNames[month] = this.texts['month' + month];
    }
    this.durationOptions = [
      { text: '1h', value: 3600 },
      { text: '2h', value: 7200 },
      { text: '4h', value: 14400 },
      { text: '8h', value: 28800 },
      { text: '12h', value: 43200 },
      { text: '24h', value: 86400 },
      { text: '2d', value: 172800 },
      { text: '3d', value: 259200 },
      { text: '5d', value: 432000 },
    ];
    this.mTypeInputOptions = [
      { label: this.texts.oneTime, value: MaintenanceType.OneTime },
      { label: this.texts.daily, value: MaintenanceType.Daily },
      { label: this.texts.weekly, value: MaintenanceType.Weekly },
      { label: this.texts.monthly, value: MaintenanceType.Monthly },
    ];
    this.monthlyWeekNumberInputOptions = [
      { label: this.texts.first, value: 1 },
      { label: this.texts.second, value: 2 },
      { label: this.texts.third, value: 3 },
      { label: this.texts.fourth, value: 4 },
      { label: this.texts.last, value: 5 },
    ];
  }

  // Component's props have updated
  componentDidUpdate(prevProps: any) {
    if (this.props.show && this.props.show !== prevProps.show) {
      // The dialog is shown; initialize its state based on the given props
      const m = this.props.selectedMaintenance; // Set if we're editing a maintenance; undefined if creating a new one
      let type = MaintenanceType.OneTime; // Default when creating a new maintenance
      if (m) {
        type = m.maintenanceType;
      }

      // Initialize state variables related to weekly and monthly maintenances
      var stateWeeklyMonthlyProperties = this.initializeWeeklyMonthlyState(type, m);

      // Initialize state variables related to when maintenance starts and ends
      var stateDateProperties = this.initializeDatesToState(type, m);

      const selectedHosts = this.props.hosts.map((host) => ({ ...host, selected: true }));
      if (m) {
        // Set host selection based on selected maintenance
        selectedHosts.forEach((host) => {
          if (!m.hosts.some((mHost) => mHost.hostid === host.hostid)) {
            host.selected = false;
          }
        });
      }

      this.setState({
        wizardPhase: WizardPhase.FirstDates,
        maintenanceType: type,
        everyNDays: m && type === MaintenanceType.Daily ? m.every : 1,
        everyNWeeks: m && type === MaintenanceType.Weekly ? m.every : 1,
        ...stateWeeklyMonthlyProperties,
        ...stateDateProperties,

        description: m ? m.description : '',
        searchText: '',

        selectedHosts: selectedHosts,
      });
    }
  }

  // Initialize weekly and monthly maintenance related state variables when the dialog is shown
  initializeWeeklyMonthlyState(type: MaintenanceType, m?: Maintenance) {
    // Selected weekdays of weekly maintenance
    var weeklyWeekdays = [false, false, false, false, false, false, false];
    if (m && type === MaintenanceType.Weekly) {
      weeklyWeekdays = m.weekdays;
    }

    // Selected months of monthly maintenance
    var months = [false, false, false, false, false, false, false, false, false, false, false, false];
    if (m && type === MaintenanceType.Monthly) {
      months = m.months;
    }

    // Monthly maintenance: Is it repeated Nth day of month of Nth weekday(s) of month
    let dayOfMonthOrWeekSelected: MonthlyDayPeriodSelection = MonthlyDayPeriodSelection.Month;
    if (m && type === MaintenanceType.Monthly && !m.day) {
      dayOfMonthOrWeekSelected = MonthlyDayPeriodSelection.Week;
    }

    // Selected weekdays of monthly maintenance when Nth weekday(s) of the month option is selected
    var monthlyWeekdays = [false, false, false, false, false, false, false];
    if (m && type === MaintenanceType.Monthly && dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Week) {
      monthlyWeekdays = m.weekdays;
    }

    return {
      weeklyWeekdays: weeklyWeekdays,
      dayOfMonthOrWeekSelected: dayOfMonthOrWeekSelected,
      dayOfMonth:
        m && type === MaintenanceType.Monthly && dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Month
          ? m.day
          : 1,
      months: months,
      monthlyWeekdays: monthlyWeekdays,
      monthlyWeekNumberInput:
        m && type === MaintenanceType.Monthly && dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Week
          ? m.every
          : 1,
    };
  }

  // Initialize date properties to state when the dialog is shown
  initializeDatesToState(type: MaintenanceType, m?: Maintenance) {
    let duration = 3600;
    if (m) {
      duration = m.duration;
    }

    // Check if selected maintenances duration is one of the presets
    let strictEndTimeSelected = false;
    if (!this.durationOptions.some((item) => item.value === duration)) {
      strictEndTimeSelected = true;
    }

    let oneTimeStartTimestamp = DateTime.now();
    let periodicRepeatStartDate = DateTime.now();
    let periodicRepeatEndDate = DateTime.now();
    let periodicStartHour: number = DateTime.now().hour;
    let periodicStartMinute: number = DateTime.now().minute;
    if (m && type === MaintenanceType.OneTime) {
      oneTimeStartTimestamp = m.oneTimeStartTimestamp!;
    } else if (m) {
      // Periodic maintenance
      // Note that here active since/till timestamps are taken but only their date parts are significant and managed
      // Generally it works except if someone created manually a maintenance in Zabbix so that active since & till
      // don't correspond to day beginning and end times.
      periodicRepeatStartDate = m.periodicActiveSinceTimestamp!;
      periodicRepeatEndDate = m.periodicActiveTillTimestamp!.minus({ seconds: duration }); // Since the user configures the last day when maintenance period _starts_
      periodicStartHour = Math.floor(m.periodicStartTime! / 3600);
      periodicStartMinute = Math.floor((m.periodicStartTime! - periodicStartHour * 3600) / 60);
    }

    return {
      duration: duration,
      strictEndTimeSelected: strictEndTimeSelected,
      oneTimeStartTimestamp: oneTimeStartTimestamp,
      periodicRepeatStartDate: periodicRepeatStartDate,
      periodicRepeatEndDate: periodicRepeatEndDate,
      periodicStartHour: periodicStartHour,
      periodicStartMinute: periodicStartMinute,
    };
  }

  // Analyze the configured dates and generate top-10 list of upcoming maintenances to the state
  getMaintenanceDatesPreview(): MaintenanceInstanceDates[] {
    const { maintenanceType } = this.state;

    if (maintenanceType === MaintenanceType.OneTime) {
      const endTime = this.state.oneTimeStartTimestamp.plus({ seconds: this.state.duration });
      return [
        {
          startTime: this.state.oneTimeStartTimestamp,
          endTime: endTime,
          ongoing: this.state.oneTimeStartTimestamp <= DateTime.now() && endTime >= DateTime.now(),
        },
      ];
    } else if (maintenanceType === MaintenanceType.Daily) {
      if (!this.state.everyNDays) {
        // Empty input field
        return [];
      }
      return getNextDailyMaintenances(
        this.state.periodicRepeatStartDate.set({
          hour: this.state.periodicStartHour,
          minute: this.state.periodicStartMinute,
          second: 0,
          millisecond: 0,
        }),
        this.state.periodicRepeatEndDate
          .set({
            hour: this.state.periodicStartHour,
            minute: this.state.periodicStartMinute,
            second: 0,
            millisecond: 0,
          })
          .plus({ seconds: this.state.duration }),
        this.state.everyNDays,
        this.state.periodicStartHour * 3600 + this.state.periodicStartMinute * 60,
        this.state.duration
      );
    } else if (maintenanceType === MaintenanceType.Weekly) {
      if (!this.state.everyNWeeks) {
        // Empty input field
        return [];
      }
      return getNextWeeklyMaintenances(
        this.state.periodicRepeatStartDate.set({
          hour: this.state.periodicStartHour,
          minute: this.state.periodicStartMinute,
          second: 0,
          millisecond: 0,
        }),
        this.state.periodicRepeatEndDate
          .set({
            hour: this.state.periodicStartHour,
            minute: this.state.periodicStartMinute,
            second: 0,
            millisecond: 0,
          })
          .plus({ seconds: this.state.duration }),
        this.state.everyNWeeks,
        this.state.weeklyWeekdays,
        this.state.periodicStartHour * 3600 + this.state.periodicStartMinute * 60,
        this.state.duration
      );
    } else {
      if (!this.state.dayOfMonth) {
        // Empty input field
        return [];
      }
      return getNextMonthlyMaintenances(
        this.state.periodicRepeatStartDate.set({
          hour: this.state.periodicStartHour,
          minute: this.state.periodicStartMinute,
          second: 0,
          millisecond: 0,
        }),
        this.state.periodicRepeatEndDate
          .set({
            hour: this.state.periodicStartHour,
            minute: this.state.periodicStartMinute,
            second: 0,
            millisecond: 0,
          })
          .plus({ seconds: this.state.duration }),
        this.state.monthlyWeekNumberInput,
        this.state.monthlyWeekdays,
        this.state.dayOfMonth,
        this.state.months,
        this.state.periodicStartHour * 3600 + this.state.periodicStartMinute * 60,
        this.state.duration
      );
    }
  }

  /**
   * Save changes (either creating a new maintenance or editing an old one)
   */
  onSaveChanges = () => {
    // Disable the wizards buttons
    this.setState({ isLoading: true });

    // Create a new Maintenance object (even if we're editing an existing maintenance)
    // to make sure it gets 100% correct
    let m: Maintenance = {
      id: this.props.selectedMaintenance ? this.props.selectedMaintenance.id : 0,
      name: '',
      description: this.state.description,
      createdBy: contextSrv.user.email,
      lastUpdatedTimestamp: DateTime.now(),
      hosts: this.state.selectedHosts.filter((host) => host.selected),
      maintenanceType: this.state.maintenanceType,
      duration: this.state.duration,
      every: 0,
      day: 0,
      months: [false, false, false, false, false, false, false, false, false, false, false, false],
      weekdays: [false, false, false, false, false, false, false],
      ongoing: false,
      groups: [],
      startTimeString: '',
      endTimeString: '',
    };
    if (this.state.maintenanceType === MaintenanceType.OneTime) {
      m.oneTimeStartTimestamp = this.state.oneTimeStartTimestamp;
      m.oneTimeEndTimestamp = this.state.oneTimeStartTimestamp.plus({ seconds: this.state.duration });
    } else {
      // Periodic maintenance
      m.periodicActiveSinceTimestamp = this.state.periodicRepeatStartDate.set({
        hour: this.state.periodicStartHour,
        minute: this.state.periodicStartMinute,
        second: 0,
        millisecond: 0,
      });
      m.periodicActiveTillTimestamp = this.state.periodicRepeatEndDate
        .set({ hour: this.state.periodicStartHour, minute: this.state.periodicStartMinute, second: 0, millisecond: 0 })
        .plus({ seconds: this.state.duration });
      m.periodicStartTime = this.state.periodicStartHour * 3600 + this.state.periodicStartMinute * 60;
      if (this.state.maintenanceType === MaintenanceType.Daily) {
        m.every = this.state.everyNDays;
      } else if (this.state.maintenanceType === MaintenanceType.Weekly) {
        m.every = this.state.everyNWeeks;
        m.weekdays = this.state.weeklyWeekdays;
      } else {
        // Monthly maintenance, two possible modes
        m.months = this.state.months;
        if (this.state.dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Week) {
          m.every = this.state.monthlyWeekNumberInput;
          m.weekdays = this.state.monthlyWeekdays;
        } else {
          m.day = this.state.dayOfMonth;
          m.weekdays = [];
        }
      }
    }

    saveMaintenance(m, this.props.zabbixDataSource)
      .then(() => {
        // Inform the user according to whether it was update or save and whether if affects the system
        // state immediately
        var text;
        if (this.props.selectedMaintenance) {
          if (
            this.props.selectedMaintenance.ongoing ||
            this.getMaintenanceDatesPreview().some((dates) => dates.ongoing)
          ) {
            text = this.texts.maintenanceHasBeenUpdated + '\n' + this.texts.systemStatusWillBeUpdated;
          } else {
            text = this.texts.maintenanceHasBeenUpdated;
          }
        } else {
          if (this.getMaintenanceDatesPreview().some((dates) => dates.ongoing)) {
            text = this.texts.newMaintenanceHasBeenStarted + '\n' + this.texts.systemStatusWillBeUpdated;
          } else {
            text = this.texts.newMaintenanceHasBeenCreated;
          }
        }
        appEvents.emit(AppEvents.alertSuccess, [text]);

        // Signal action panel to refresh its state once zabbix has updated
        // the maintenance status of the hosts in a few minutes
        setTimeout(() => {
          document.dispatchEvent(new Event('iiris-maintenance-update'));
        }, 2 * 60 * 1000);

        // Enable the wizards buttons again
        this.setState({ isLoading: false });

        // Close wizard dialog
        this.props.onCloseMaintenanceEditWizard();
      })
      .catch((err: any) => {
        this.setState({ isLoading: false }); // Enable the wizards buttons again
        appEvents.emit(AppEvents.alertError, ['Failed to save a maintenance', err.toString()]);
      });
  };

  // Years for dropdown regaring the selected year the must be selectable
  getYearsForDropdown = (selectedYear: number) => {
    var years = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i < currentYear + 2; i++) {
      years.push(i);
    }
    if (!years.some((year) => year === selectedYear)) {
      years.push(selectedYear);
    }
    return years;
  };

  // Days for dropdown for the month of the given date
  getDaysForDropdown = (date: DateTime) => {
    var maxDay = date.endOf('month').day;
    return Array.from(Array(maxDay).keys()).map((day) => day + 1);
  };

  // When the user has changed day, month, year, hour, or minute of when the maintenance ends
  // calculate the new maintenance duration
  calculateNewDurationForOnetimeMaintenance(changedComponent: string, newValue: number) {
    const maintenanceStarts = this.state.oneTimeStartTimestamp;
    const oldDuration = this.state.duration;
    const oldMaintenanceEnds = maintenanceStarts.plus({ seconds: oldDuration });
    var dateTimeChange: any = {};
    dateTimeChange[changedComponent] = newValue;
    const newMaintenanceEnds = oldMaintenanceEnds.set(dateTimeChange);
    const newDuration = newMaintenanceEnds.diff(maintenanceStarts, 'seconds').seconds;
    return newDuration;
  }

  // When the user has changed hour or minute of when the maintenance ends
  // calculate the new maintenance duration
  calculateNewDurationForPeriodicMaintenance(startTimeSeconds: number, newEndHour: number, newEndMinute: number) {
    var endTimeSeconds = newEndHour * 3600 + newEndMinute * 60;

    if (endTimeSeconds < startTimeSeconds) {
      // Maintenance goes over to the next day
      endTimeSeconds += 24 * 3600;
    }
    const newDuration = endTimeSeconds - startTimeSeconds;
    return newDuration;
  }

  /**
   * Callback for selecting all hosts
   */
  selectAllHosts = (allSelected: boolean) => {
    this.setState({
      selectedHosts: this.state.selectedHosts.map((host) => ({
        ...host,
        selected: allSelected,
      })),
    });
  };

  // Check the validity of wizard phase 1 configuration;
  // returns error text or null if there are no errors
  checkWizardPhase1Errors(): string | null {
    const maintenanceType = this.state.maintenanceType;
    if (maintenanceType === MaintenanceType.Daily) {
      // Number inputs allow the user to enter decimal separator; ensure that it's a valid integer
      if (!this.state.everyNDays || !/^[0-9]*$/.test(this.state.everyNDays + '')) {
        return this.texts.dayFieldMustContainInteger;
      }

      if (this.state.everyNDays !== 1) {
        // Check that period start time does not go into another day in UTC time
        // Because otherwise the first occurance of daily maintenance is different than what the user has configured in local timezone
        const startTimeError = this.checkPeriodicStartTimeConfigurationError();
        if (startTimeError) {
          return startTimeError;
        }
      }
    } else if (maintenanceType === MaintenanceType.Weekly) {
      // Number inputs allow the user to enter decimal separator; ensure that it's a valid integer
      if (!this.state.everyNWeeks || !/^[0-9]*$/.test(this.state.everyNWeeks + '')) {
        return this.texts.weekFieldMustContainInteger;
      }
      let someWeekdaySelected = this.state.weeklyWeekdays.some((weekdaySelected) => weekdaySelected);
      if (!someWeekdaySelected) {
        return this.texts.oneWeekdayMustBeChosen;
      }

      if (this.state.everyNWeeks !== 1) {
        // Check that period start time does not go into another day in UTC time
        // Because otherwise the first occurance of daily maintenance is different than what the user has configured in local timezone
        const startTimeError = this.checkPeriodicStartTimeConfigurationError();
        if (startTimeError) {
          return startTimeError;
        }
      }
    } else if (maintenanceType === MaintenanceType.Monthly) {
      let someMonthSelected = this.state.months.some((monthSelected) => monthSelected);
      if (!someMonthSelected) {
        return this.texts.oneMonthMustBeChosen;
      }
      if (this.state.dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Month) {
        // Number inputs allow the user to enter decimal separator; ensure that it's a valid integer
        if (!this.state.dayOfMonth || !/^[0-9]*$/.test(this.state.dayOfMonth + '')) {
          return this.texts.monthFieldMustContainInteger;
        }
      } else if (this.state.dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Week) {
        let someWeekdaySelected = this.state.monthlyWeekdays.some((weekdaySelected) => weekdaySelected);
        if (!someWeekdaySelected) {
          return this.texts.oneWeekdayMustBeChosen;
        }
      }

      // Check that period start time does not go into another day in UTC time
      // Because otherwise the first occurance of daily maintenance is different than what the user has configured in local timezone
      const startTimeError = this.checkPeriodicStartTimeConfigurationError();
      if (startTimeError) {
        return startTimeError;
      }
    }

    // Duration must be positive
    if (this.state.duration <= 0) {
      return this.texts.maintenanceEndMustBeAfterStart;
    }

    // Periodical maintenance
    if (
      maintenanceType === MaintenanceType.Daily ||
      maintenanceType === MaintenanceType.Weekly ||
      maintenanceType === MaintenanceType.Monthly
    ) {
      if (this.state.periodicRepeatEndDate < this.state.periodicRepeatStartDate) {
        return this.texts.repeatMustEndAfterStartTime;
      } else if (this.state.periodicRepeatEndDate < DateTime.now().startOf('day')) {
        return this.texts.repeatEndDateCantBeInPast;
      }
    }
    if (
      maintenanceType === MaintenanceType.OneTime &&
      this.state.oneTimeStartTimestamp.plus({ seconds: this.state.duration }) < DateTime.now()
    ) {
      return this.texts.maintenanceEndCantBeInPast;
    }
    return null;
  }

  // Check that the start time won't go into a different day when converted from local time to UTC
  // Returns error string or null if there are no configuration errors
  checkPeriodicStartTimeConfigurationError() {
    var utcOffsetSeconds = DateTime.now().offset * 60;
    var periodicStartTimeSecondsLocal = this.state.periodicStartHour * 3600 + this.state.periodicStartMinute * 60;
    var periodicStartTimeSecondsUTC = periodicStartTimeSecondsLocal - utcOffsetSeconds;
    var errorLine1;
    if (periodicStartTimeSecondsUTC < 0) {
      // Eg. 01:00 local time would be 23:00 previous day UTC time with UTC+2 offset (Finland winter time)
      if (
        this.state.maintenanceType === MaintenanceType.Monthly &&
        this.state.dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Month &&
        this.state.dayOfMonth > 1
      ) {
        // This case is ok; maintenance just moves one day earlier in UTC
        return null;
      }
      const minStartTimeSecondsLocal = utcOffsetSeconds;
      errorLine1 = this.texts.startTimeBeforeError.replace(
        '$$',
        this.formatStartTimeSecondsAsString(minStartTimeSecondsLocal)
      );
    } else if (periodicStartTimeSecondsUTC >= 24 * 3600) {
      // Eg. 23:00 local time would be 04:00 next day with UTC-5 offset (New York)
      if (
        this.state.maintenanceType === MaintenanceType.Monthly &&
        this.state.dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Month &&
        this.state.dayOfMonth < 31
      ) {
        // This case is ok; maintenance just moves one day later in UTC
        return null;
      }
      const maxStartTimeSecondsLocal = 24 * 3600 + utcOffsetSeconds;
      errorLine1 = this.texts.startTimeAfterError.replace(
        '$$',
        this.formatStartTimeSecondsAsString(maxStartTimeSecondsLocal)
      );
    }

    if (errorLine1) {
      if (this.state.maintenanceType === MaintenanceType.Daily) {
        return errorLine1 + '\n' + this.texts.startTimeFixDaily;
      }
      if (this.state.maintenanceType === MaintenanceType.Weekly) {
        return errorLine1 + '\n' + this.texts.startTimeFixWeekly;
      }
      if (
        this.state.maintenanceType === MaintenanceType.Monthly &&
        this.state.dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Week
      ) {
        return errorLine1 + '\n' + this.texts.startTimeFixMonthlyNthWeekday;
      }
      if (
        this.state.maintenanceType === MaintenanceType.Monthly &&
        this.state.dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Month
      ) {
        return errorLine1 + '\n' + this.texts.startTimeFixMonthlyNthDayOfMonth;
      }
    }
    return null;
  }

  // Format start time which is seconds from midnight to HH:mm format
  formatStartTimeSecondsAsString(startTimeSeconds: number) {
    const hour = Math.floor(startTimeSeconds / 3600);
    const minute = Math.floor((startTimeSeconds - hour * 3600) / 60);
    const hourWithLeadingZeros = '00' + hour;
    const minutesWithLeadingZeros = '00' + minute;
    const HHmm =
      hourWithLeadingZeros.substring(hourWithLeadingZeros.length - 2) +
      ':' +
      minutesWithLeadingZeros.substring(minutesWithLeadingZeros.length - 2);
    return HHmm;
  }

  // Check the validity of wizard phase 2 configuration;
  // returns error text or null if there are no errors
  checkWizardPhase2Errors(): string | null {
    let anyHostSelected = this.state.selectedHosts.some((hostSelected) => hostSelected);
    const maintenanceName =
      (this.state.description || '') + '|' + contextSrv.user.email + '|' + DateTime.now().toUnixInteger();
    if (!anyHostSelected) {
      return this.texts.atLeastOneHostMustBeSelected;
    } else if (maintenanceName.length > 128) {
      const excessLength = maintenanceName.length - 128;
      return this.texts.maintenanceDescriptionIs + ' ' + excessLength + ' ' + this.texts.charsTooLong;
    }
    return null;
  }

  /**
   * Callback for go next button
   */
  goToNext = () => {
    if (this.state.wizardPhase === WizardPhase.FirstDates) {
      var errors = this.checkWizardPhase1Errors();
      if (errors !== null) {
        return;
      }

      this.setState({ wizardPhase: WizardPhase.SecondDescriptionAndHosts });
    } else {
      errors = this.checkWizardPhase2Errors();
      if (errors !== null) {
        return;
      }

      this.setState({ wizardPhase: WizardPhase.ThirdSummary });
    }
  };

  /**
   * Callback for go previous button
   */
  goToPrevious = () => {
    this.setState({ wizardPhase: this.state.wizardPhase - 1 });
  };

  // Format data shown in the summary phase
  formatSummaryDisplayData() {
    const maintenanceType = this.state.maintenanceType;
    var summaryData = {
      displayStartDate: '',
      displayStopDate: '',
      displayRepeatStartDate: '',
      displayRepeatStopDate: '',
      displayHosts: '',
      displayWeeklyDays: '',
      displayMonths: '',
      displayMonthlyWeekdayNumber: '',
      displayMonthlyWeekdayNames: '',
    };

    // Format maintenance dates for the summary phase
    if (maintenanceType === MaintenanceType.OneTime) {
      summaryData.displayStartDate = this.state.oneTimeStartTimestamp.toFormat('dd.LL.yyyy HH:mm');
      summaryData.displayStopDate = this.state.oneTimeStartTimestamp
        .plus({ seconds: this.state.duration })
        .toFormat('dd.LL.yyyy HH:mm');
    } else {
      // Repeat start and end dates don't have hours or minutes
      summaryData.displayRepeatStartDate = this.state.periodicRepeatStartDate.toFormat('dd.LL.yyyy');
      summaryData.displayRepeatStopDate = this.state.periodicRepeatEndDate.toFormat('dd.LL.yyyy');

      // Show time (without date) when the repeating maintenance starts
      var hourWithLeadingZeros = '00' + this.state.periodicStartHour;
      var minutesWithLeadingZeros = '00' + this.state.periodicStartMinute;
      summaryData.displayStartDate =
        hourWithLeadingZeros.substring(hourWithLeadingZeros.length - 2) +
        ':' +
        minutesWithLeadingZeros.substring(minutesWithLeadingZeros.length - 2);

      // Show time (without date) when the repeating maintenance ends
      const startTimeSeconds = this.state.periodicStartHour * 3600 + this.state.periodicStartMinute * 60;
      let endTimeSeconds = startTimeSeconds + this.state.duration;
      if (endTimeSeconds >= 24 * 3600) {
        // End time is on the next day
        endTimeSeconds -= 24 * 3600;
      }
      const endHour = Math.floor(endTimeSeconds / 3600);
      const endMinute = Math.floor((endTimeSeconds - endHour * 3600) / 60);
      hourWithLeadingZeros = '00' + endHour;
      minutesWithLeadingZeros = '00' + endMinute;
      summaryData.displayStopDate =
        hourWithLeadingZeros.substring(hourWithLeadingZeros.length - 2) +
        ':' +
        minutesWithLeadingZeros.substring(minutesWithLeadingZeros.length - 2);
    }

    summaryData.displayHosts = this.state.selectedHosts
      .filter((host) => host.selected)
      .map((host) => host.name)
      .join(', ');
    summaryData.displayWeeklyDays = this.weekdayNames
      .filter((value, index) => this.state.weeklyWeekdays[index])
      .join(', ');
    summaryData.displayMonths = this.state.months
      .map((monthSelected, month) => {
        return this.monthNames[month];
      })
      .join(', ');
    const monthlyWeekNumberInputOption = this.monthlyWeekNumberInputOptions.find(
      (option) => option.value === this.state.monthlyWeekNumberInput
    );
    summaryData.displayMonthlyWeekdayNumber = monthlyWeekNumberInputOption ? monthlyWeekNumberInputOption.label : '';
    summaryData.displayMonthlyWeekdayNames = this.weekdayNames
      .filter((value, index) => this.state.monthlyWeekdays[index])
      .join(', ');
    return summaryData;
  }

  /**
   * For repeating maintenances, render the selection of how often the maintenance repeats.
   * Daily maintenance: Every N days
   * Weekly maintenance: Every N weeks plus weekday(s) selection
   * Monthly maintenance: Month selection, Nth day of month or Nth weekday(s) of month
   */
  renderRepeatSelection() {
    if (this.state.maintenanceType === MaintenanceType.Daily) {
      // Daily maintenance: Every N days selection
      return (
        <div className="gf-form-group maintenance-row-container">
          <label className="gf-form-label">{this.texts.repeatEveryNDays}</label>
          <div>
            <input
              className="input-small gf-form-input iiris-fixed-width-select"
              type="number"
              value={this.state.everyNDays || ''}
              onChange={(e) => this.setState({ everyNDays: e.target.valueAsNumber })}
              min="1"
              step="1"
            />
          </div>
        </div>
      );
    }

    if (this.state.maintenanceType === MaintenanceType.Weekly) {
      // Weekly maintenance: Every N weeks selection and weekday selection
      return (
        <>
          {/* Every N weeks selection */}
          <div className="gf-form-group maintenance-row-container">
            <label className="gf-form-label">{this.texts.repeatEveryNWeeks}</label>
            <div>
              <input
                className="input-small gf-form-input iiris-fixed-width-select"
                type="number"
                value={this.state.everyNWeeks || ''}
                onChange={(e) => this.setState({ everyNWeeks: e.target.valueAsNumber })}
                min="1"
                step="1"
              />
            </div>
          </div>

          {/* Weekday selection */}
          <div className="gf-form-group maintenance-row-container">
            <label className="gf-form-label">{this.texts.repeatOnWeekday}</label>
            <div className="checkbox-block">
              {Array.from(Array(7).keys()).map((weekday) => (
                <div className="checkbox-container" key={'weekday-selection' + weekday}>
                  <input
                    className="action-panel-cb"
                    type="checkbox"
                    checked={this.state.weeklyWeekdays[weekday]}
                    onChange={(e) => {
                      var newSelection = [...this.state.weeklyWeekdays];
                      newSelection[weekday] = e.target.checked;
                      this.setState({ weeklyWeekdays: newSelection });
                    }}
                    id={'weekday-selection' + weekday}
                  />
                  <label className="gf-form-label checkbox-label" htmlFor={'weekday-selection' + weekday}>
                    {this.weekdayNames[weekday]}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </>
      );
    }

    if (this.state.maintenanceType === MaintenanceType.Monthly) {
      // Monthly maintenance: Month selection, Nth day of month or Nth weekday(s) of month
      return (
        <>
          {/* Month selection */}
          <div className="gf-form-group maintenance-row-container">
            <label className="gf-form-label">{this.texts.repeatOnMonth}</label>
            <div className="checkbox-block">
              {[0, 3, 6, 9].map((index) => (
                <div className="checkbox-column" key={'col' + index}>
                  {Array.from(Array(12).keys())
                    .slice(index, index + 3)
                    .map((month) => (
                      <div className="checkbox-container" key={'month-selection-' + month}>
                        <input
                          className="action-panel-cb"
                          type="checkbox"
                          checked={this.state.months[month]}
                          onChange={(e) => {
                            var newSelection = [...this.state.months];
                            newSelection[month] = e.target.checked;
                            this.setState({ months: newSelection });
                          }}
                          id={'month-selection-' + month}
                        />
                        <label className="gf-form-label checkbox-label" htmlFor={'month-selection-' + month}>
                          {this.monthNames[month]}
                        </label>
                      </div>
                    ))}
                </div>
              ))}
              <div className="checkbox-column">
                <div className="checkbox-container">
                  <input
                    className="action-panel-cb"
                    type="checkbox"
                    checked={this.state.months.every((monthSelection) => monthSelection)}
                    id="all"
                    onChange={(e) =>
                      this.setState({ months: this.state.months.map((monthSelected) => e.target.checked) })
                    }
                  />
                  <label className="gf-form-label checkbox-label width-8" htmlFor="all">
                    {this.texts.selectAll}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Is it repeated Nth day of month or Nth weekday of month? */}
          <div className="gf-form-group maintenance-row-container iiris-modal-column-container">
            <div className="iiris-modal-column">
              <label className="gf-form-label iiris-radio-button-block">
                {this.texts.repeatOn}
                <div className="checkbox-container">
                  <input
                    className="action-panel-cb"
                    type="radio"
                    name="monthtype"
                    checked={this.state.dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Month}
                    onChange={(e) => this.setState({ dayOfMonthOrWeekSelected: parseInt(e.target.value, 10) })}
                    value={MonthlyDayPeriodSelection.Month}
                    id="dayOfMonthSelected"
                  />
                  <label className="gf-form-label checkbox-label width-12" htmlFor="dayOfMonthSelected">
                    {this.texts.nthDayOfMonth}
                  </label>
                </div>
                <div className="checkbox-container">
                  <input
                    className="action-panel-cb"
                    type="radio"
                    name="monthtype"
                    checked={this.state.dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Week}
                    onChange={(e) => this.setState({ dayOfMonthOrWeekSelected: parseInt(e.target.value, 10) })}
                    value={MonthlyDayPeriodSelection.Week}
                    id="weekdayOfMonthSelected"
                  />
                  <label className="gf-form-label checkbox-label width-12" htmlFor="weekdayOfMonthSelected">
                    {this.texts.nthWeekdayOfMonth}
                  </label>
                </div>
              </label>
            </div>
          </div>

          <div className="gf-form-group maintenance-row-container iiris-modal-column-container">
            <div className="iiris-modal-column">
              {/* Nth day of month selection */}
              {this.state.dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Month ? (
                <div className="gf-form-group">
                  <label className="gf-form-label">{this.texts.repeatOnDayOfMonth}</label>
                  <div>
                    <input
                      className="input-small gf-form-input iiris-fixed-width-select"
                      type="number"
                      value={this.state.dayOfMonth}
                      onChange={(e) => this.setState({ dayOfMonth: e.target.valueAsNumber })}
                      min="1"
                      step="1"
                    />
                  </div>
                </div>
              ) : null}

              {/* Nth weekday(s) of month selection */}
              {this.state.dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Week ? (
                <div className="gf-form-group">
                  <label className="gf-form-label">
                    {this.texts.repeatOnDayOfWeek + ' ' + this.texts.secondTuesdayOfApril}
                  </label>
                  <div className="gf-form-select-wrapper">
                    <select
                      className="gf-form-input"
                      value={this.state.monthlyWeekNumberInput}
                      onChange={(e) => this.setState({ monthlyWeekNumberInput: parseInt(e.target.value, 10) })}
                    >
                      {this.monthlyWeekNumberInputOptions.map((option) => (
                        <option value={option.value} key={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="checkbox-block checkbox-top-spacer">
                    {Array.from(Array(7).keys()).map((weekday) => (
                      <div className="checkbox-container" key={'monthly-weekday-selection-' + weekday}>
                        <input
                          className="action-panel-cb"
                          type="checkbox"
                          checked={this.state.monthlyWeekdays[weekday]}
                          onChange={(e) => {
                            var newSelection = [...this.state.monthlyWeekdays];
                            newSelection[weekday] = e.target.checked;
                            this.setState({ monthlyWeekdays: newSelection });
                          }}
                          id={'monthly-weekday-selection-' + weekday}
                        />
                        <label
                          className="gf-form-label checkbox-label"
                          htmlFor={'monthly-weekday-selection-' + weekday}
                        >
                          {this.weekdayNames[weekday]}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </>
      );
    }

    return null;
  }

  /**
   * Render maintenance start date & time for single (non-repeating) maintenances
   */
  renderSingleMaintenanceStartDateTime() {
    return (
      <div className="iiris-modal-column">
        <label className="gf-form-label">{this.texts.maintenanceFormStartTime}</label>
        <div className="date-selection-row">
          <div className="date-selection-container">
            <div>{this.texts.day}</div>
            <div className="gf-form-select-wrapper">
              <select
                className="gf-form-input"
                value={this.state.oneTimeStartTimestamp.day}
                onChange={(e) =>
                  this.setState({
                    oneTimeStartTimestamp: this.state.oneTimeStartTimestamp.set({ day: parseInt(e.target.value, 10) }),
                  })
                }
              >
                {this.getDaysForDropdown(this.state.oneTimeStartTimestamp).map((day) => (
                  <option value={day} key={'one-time-start-day-' + day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="date-selection-container">
            <div>{this.texts.month}</div>
            <div className="gf-form-select-wrapper">
              <select
                className="gf-form-input"
                value={this.state.oneTimeStartTimestamp.month}
                onChange={(e) =>
                  this.setState({
                    oneTimeStartTimestamp: this.state.oneTimeStartTimestamp.set({
                      month: parseInt(e.target.value, 10),
                    }),
                  })
                }
              >
                {Array.from(Array(12).keys())
                  .map((month) => month + 1)
                  .map((month) => (
                    <option value={month} key={'one-time-start-month-' + month}>
                      {month}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="date-selection-container">
            <div>{this.texts.year}</div>
            <div className="gf-form-select-wrapper">
              <select
                className="gf-form-input"
                value={this.state.oneTimeStartTimestamp.year}
                onChange={(e) =>
                  this.setState({
                    oneTimeStartTimestamp: this.state.oneTimeStartTimestamp.set({ year: parseInt(e.target.value, 10) }),
                  })
                }
              >
                {this.getYearsForDropdown(this.state.oneTimeStartTimestamp.year).map((year) => (
                  <option value={year} key={'one-time-start-year-' + year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="date-selection-container hour-input">
            <div>{this.texts.hour}</div>
            <div className="gf-form-select-wrapper">
              <select
                className="gf-form-input"
                value={this.state.oneTimeStartTimestamp.hour}
                onChange={(e) =>
                  this.setState({
                    oneTimeStartTimestamp: this.state.oneTimeStartTimestamp.set({ hour: parseInt(e.target.value, 10) }),
                  })
                }
              >
                {Array.from(Array(24).keys()).map((hour) => (
                  <option value={hour} key={'one-time-start-hour-' + hour}>
                    {hour}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="date-selection-container">
            <div>{this.texts.minute}</div>
            <div className="gf-form-select-wrapper">
              <select
                className="gf-form-input"
                value={this.state.oneTimeStartTimestamp.minute}
                onChange={(e) =>
                  this.setState({
                    oneTimeStartTimestamp: this.state.oneTimeStartTimestamp.set({
                      minute: parseInt(e.target.value, 10),
                    }),
                  })
                }
              >
                {Array.from(Array(60).keys()).map((minute) => (
                  <option value={minute} key={'one-time-start-minute-' + minute}>
                    {minute}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render maintenance start and stop dates repeating maintenances.
   * This is the dates between which the maintenance will be repeated.
   */
  renderRepeatingMaintenanceStartAndStopDates() {
    return (
      <>
        <div className="iiris-modal-column">
          <label className="gf-form-label">{this.texts.startRepeat}</label>
          <div className="date-selection-row">
            <div className="date-selection-container">
              <div>{this.texts.day}</div>
              <div className="gf-form-select-wrapper">
                <select
                  className="gf-form-input"
                  value={this.state.periodicRepeatStartDate.day}
                  onChange={(e) =>
                    this.setState({
                      periodicRepeatStartDate: this.state.periodicRepeatStartDate.set({
                        day: parseInt(e.target.value, 10),
                      }),
                    })
                  }
                >
                  {this.getDaysForDropdown(this.state.periodicRepeatStartDate).map((day) => (
                    <option value={day} key={'start-repeat-day-' + day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="date-selection-container">
              <div>{this.texts.month}</div>
              <div className="gf-form-select-wrapper">
                <select
                  className="gf-form-input"
                  value={this.state.periodicRepeatStartDate.month}
                  onChange={(e) =>
                    this.setState({
                      periodicRepeatStartDate: this.state.periodicRepeatStartDate.set({
                        month: parseInt(e.target.value, 10),
                      }),
                    })
                  }
                >
                  {Array.from(Array(12).keys())
                    .map((month) => month + 1)
                    .map((month) => (
                      <option value={month} key={'start-repeat-month-' + month}>
                        {month}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="date-selection-container">
              <div>{this.texts.year}</div>
              <div className="gf-form-select-wrapper">
                <select
                  className="gf-form-input"
                  value={this.state.periodicRepeatStartDate.year}
                  onChange={(e) =>
                    this.setState({
                      periodicRepeatStartDate: this.state.periodicRepeatStartDate.set({
                        year: parseInt(e.target.value, 10),
                      }),
                    })
                  }
                >
                  {this.getYearsForDropdown(this.state.periodicRepeatStartDate.year).map((year) => (
                    <option value={year} key={'start-repeat-year-' + year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="iiris-modal-column">
          <label className="gf-form-label">{this.texts.endRepeat}</label>
          <div className="date-selection-row">
            <div className="date-selection-container">
              <div>{this.texts.day}</div>
              <div className="gf-form-select-wrapper">
                <select
                  className="gf-form-input"
                  value={this.state.periodicRepeatEndDate.day}
                  onChange={(e) =>
                    this.setState({
                      periodicRepeatEndDate: this.state.periodicRepeatEndDate.set({
                        day: parseInt(e.target.value, 10),
                      }),
                    })
                  }
                >
                  {this.getDaysForDropdown(this.state.periodicRepeatEndDate).map((day) => (
                    <option value={day} key={'end-repeat-day-' + day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="date-selection-container">
              <div>{this.texts.month}</div>
              <div className="gf-form-select-wrapper">
                <select
                  className="gf-form-input"
                  value={this.state.periodicRepeatEndDate.month}
                  onChange={(e) =>
                    this.setState({
                      periodicRepeatEndDate: this.state.periodicRepeatEndDate.set({
                        month: parseInt(e.target.value, 10),
                      }),
                    })
                  }
                >
                  {Array.from(Array(12).keys())
                    .map((month) => month + 1)
                    .map((month) => (
                      <option value={month} key={'end-repeat-month-' + month}>
                        {month}
                      </option>
                    ))}
                </select>
              </div>
            </div>
            <div className="date-selection-container">
              <div>{this.texts.year}</div>
              <div className="gf-form-select-wrapper">
                <select
                  className="gf-form-input"
                  value={this.state.periodicRepeatEndDate.year}
                  onChange={(e) =>
                    this.setState({
                      periodicRepeatEndDate: this.state.periodicRepeatEndDate.set({
                        year: parseInt(e.target.value, 10),
                      }),
                    })
                  }
                >
                  {this.getYearsForDropdown(this.state.periodicRepeatEndDate.year).map((year) => (
                    <option value={year} key={'end-repeat-year-' + year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /**
   * Render maintenance duration for single (non-repeating) maintenances
   */
  renderSingleMaintenanceDuration() {
    if (!this.state.strictEndTimeSelected) {
      // Maintenance duration is selected from a dropdown list
      return (
        <>
          <label className="gf-form-label">{this.texts.maintenanceDuration}</label>
          <div className="gf-form-select-wrapper iiris-fixed-width-select">
            <select
              className="gf-form-input"
              value={this.state.duration}
              onChange={(e) => this.setState({ duration: parseInt(e.target.value, 10) })}
            >
              {this.durationOptions.map((option) => (
                <option value={option.value} key={'onetime-maintenance-duration-' + option.value}>
                  {option.text}
                </option>
              ))}
            </select>
          </div>
        </>
      );
    }

    // Manually entered end date & time of the maintenance
    const maintenanceEnds = this.state.oneTimeStartTimestamp.plus({ seconds: this.state.duration });
    return (
      <>
        <label className="gf-form-label">{this.texts.maintenanceFormEndTime}</label>
        <div className="date-selection-row">
          <div className="date-selection-container">
            <div>{this.texts.day}</div>
            <div className="gf-form-select-wrapper">
              <select
                className="gf-form-input"
                value={maintenanceEnds.day}
                onChange={(e) =>
                  this.setState({
                    duration: this.calculateNewDurationForOnetimeMaintenance('day', parseInt(e.target.value, 10)),
                  })
                }
              >
                {this.getDaysForDropdown(maintenanceEnds).map((day) => (
                  <option value={day} key={'one-time-end-day-' + day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="date-selection-container">
            <div>{this.texts.month}</div>
            <div className="gf-form-select-wrapper">
              <select
                className="gf-form-input"
                value={maintenanceEnds.month}
                onChange={(e) =>
                  this.setState({
                    duration: this.calculateNewDurationForOnetimeMaintenance('month', parseInt(e.target.value, 10)),
                  })
                }
              >
                {Array.from(Array(12).keys())
                  .map((month) => month + 1)
                  .map((month) => (
                    <option value={month} key={'one-time-end-month-' + month}>
                      {month}
                    </option>
                  ))}
              </select>
            </div>
          </div>
          <div className="date-selection-container">
            <div>{this.texts.year}</div>
            <div className="gf-form-select-wrapper">
              <select
                className="gf-form-input"
                value={maintenanceEnds.year}
                onChange={(e) =>
                  this.setState({
                    duration: this.calculateNewDurationForOnetimeMaintenance('year', parseInt(e.target.value, 10)),
                  })
                }
              >
                {this.getYearsForDropdown(maintenanceEnds.year).map((year) => (
                  <option value={year} key={'one-time-end-year-' + year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="date-selection-container hour-input">
            <div>{this.texts.hour}</div>
            <div className="gf-form-select-wrapper">
              <select
                className="gf-form-input"
                value={maintenanceEnds.hour}
                onChange={(e) =>
                  this.setState({
                    duration: this.calculateNewDurationForOnetimeMaintenance('hour', parseInt(e.target.value, 10)),
                  })
                }
              >
                {Array.from(Array(24).keys()).map((hour) => (
                  <option value={hour} key={'one-time-end-hour-' + hour}>
                    {hour}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="date-selection-container">
            <div>{this.texts.minute}</div>
            <div className="gf-form-select-wrapper">
              <select
                className="gf-form-input"
                value={maintenanceEnds.minute}
                onChange={(e) =>
                  this.setState({
                    duration: this.calculateNewDurationForOnetimeMaintenance('minute', parseInt(e.target.value, 10)),
                  })
                }
              >
                {Array.from(Array(60).keys()).map((minute) => (
                  <option value={minute} key={'one-time-end-minute-' + minute}>
                    {minute}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </>
    );
  }

  /**
   * Render maintenance start time and duration for repeating maintenances
   */
  renderRepeatingMaintenanceStartTimeAndDuration() {
    const startTimeSeconds = this.state.periodicStartHour * 3600 + this.state.periodicStartMinute * 60;
    let endTimeSeconds = startTimeSeconds + this.state.duration;
    if (endTimeSeconds >= 24 * 3600) {
      // End time is on the next day
      endTimeSeconds -= 24 * 3600;
    }
    const endHour = Math.floor(endTimeSeconds / 3600);
    const endMinute = Math.floor((endTimeSeconds - endHour * 3600) / 60);
    return (
      <>
        <div className="iiris-modal-column">
          <label className="gf-form-label">{this.texts.maintenanceFormStartTime}</label>
          <div className="date-selection-row">
            {/* Hour input */}
            <div className="date-selection-container">
              <div>{this.texts.hour}</div>
              <div className="gf-form-select-wrapper">
                <select
                  className="gf-form-input"
                  value={this.state.periodicStartHour}
                  onChange={(e) => this.setState({ periodicStartHour: parseInt(e.target.value, 10) })}
                >
                  {Array.from(Array(24).keys()).map((hour) => (
                    <option value={hour} key={'periodic-start-hour-' + hour}>
                      {hour}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Minute input */}
            <div className="date-selection-container">
              <div>{this.texts.minute}</div>
              <div className="gf-form-select-wrapper">
                <select
                  className="gf-form-input"
                  value={this.state.periodicStartMinute}
                  onChange={(e) => this.setState({ periodicStartMinute: parseInt(e.target.value, 10) })}
                >
                  {Array.from(Array(60).keys()).map((minute) => (
                    <option value={minute} key={'periodic-start-minute-' + minute}>
                      {minute}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance duration in hours */}
        {!this.state.strictEndTimeSelected && (
          <div className="iiris-modal-column">
            <label className="gf-form-label">{this.texts.maintenanceDuration}</label>
            {/* date-selection-row and date-selection-container are used to vertically align duration with maintenance start time */}
            <div className="date-selection-row">
              <div className="date-selection-container">
                <div>&nbsp;</div>
                <div className="gf-form-select-wrapper iiris-fixed-width-select">
                  <select
                    className="gf-form-input"
                    value={this.state.duration}
                    onChange={(e) => this.setState({ duration: parseInt(e.target.value, 10) })}
                  >
                    {this.durationOptions.map((option) => (
                      <option value={option.value} key={'periodic-maintenance-duration-' + option.value}>
                        {option.text}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Maintenance strict end time */}
        {this.state.strictEndTimeSelected && (
          <div className="iiris-modal-column">
            <label className="gf-form-label">{this.texts.maintenanceFormEndTime}</label>
            <div className="date-selection-row">
              <div className="date-selection-container">
                <div>{this.texts.hour}</div>
                <div className="gf-form-select-wrapper">
                  <select
                    className="gf-form-input"
                    value={endHour}
                    onChange={(e) =>
                      this.setState({
                        duration: this.calculateNewDurationForPeriodicMaintenance(
                          startTimeSeconds,
                          parseInt(e.target.value, 10),
                          endMinute
                        ),
                      })
                    }
                  >
                    {Array.from(Array(24).keys()).map((hour) => (
                      <option value={hour} key={'periodic-end-hour-' + hour}>
                        {hour}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="date-selection-container">
                <div>{this.texts.minute}</div>
                <div className="gf-form-select-wrapper">
                  <select
                    className="gf-form-input"
                    value={endMinute}
                    onChange={(e) =>
                      this.setState({
                        duration: this.calculateNewDurationForPeriodicMaintenance(
                          startTimeSeconds,
                          endHour,
                          parseInt(e.target.value, 10)
                        ),
                      })
                    }
                  >
                    {Array.from(Array(60).keys()).map((minute) => (
                      <option value={minute} key={'periodic-end-minute-' + minute}>
                        {minute}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Render maintenance create/edit wizard phase 1: Maintenance dates
  renderWizardPhase1() {
    const previewDates = this.getMaintenanceDatesPreview();
    const validationErrors = this.checkWizardPhase1Errors();
    return (
      <>
        <div className="maintenance-column-wrapper">
          <div className="maintenance-column-left">
            {/* Maintenance type */}
            <div className="gf-form-group maintenance-row-container">
              <label className="gf-form-label">{this.texts.maintenanceType}</label>
              <div className="gf-form-select-wrapper iiris-fixed-width-select">
                <select
                  className="gf-form-input"
                  value={this.state.maintenanceType}
                  onChange={(e) => this.setState({ maintenanceType: parseInt(e.target.value, 10) })}
                >
                  {this.mTypeInputOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Repeating maintenance: how often the maintenance repeats */}
            {this.state.maintenanceType !== MaintenanceType.OneTime ? this.renderRepeatSelection() : null}

            {/* Maintenance start date & time or repeating maintenance start & stop dates */}
            <div className="gf-form-group maintenance-row-container iiris-modal-column-container">
              {this.state.maintenanceType === MaintenanceType.OneTime
                ? this.renderSingleMaintenanceStartDateTime()
                : this.renderRepeatingMaintenanceStartAndStopDates()}
            </div>

            {/* Maintenance duration (or strict end time) */}
            {this.state.maintenanceType === MaintenanceType.OneTime ? (
              <div className="gf-form-group maintenance-row-container">{this.renderSingleMaintenanceDuration()}</div>
            ) : (
              <div className="gf-form-group maintenance-row-container iiris-modal-column-container">
                {this.renderRepeatingMaintenanceStartTimeAndDuration()}
              </div>
            )}

            {/* Selection of whether the end time is manually defined instead of selecting duration from a dropdown */}
            <div className="gf-form-group maintenance-row-container">
              <div className="iiris-checkbox">
                <input
                  id="strict_end_time"
                  type="checkbox"
                  checked={this.state.strictEndTimeSelected}
                  onChange={(e) => this.setState({ strictEndTimeSelected: e.target.checked })}
                />
                <label className="checkbox-label" htmlFor="strict_end_time">
                  {this.texts.setPreciseEndTime}
                </label>
              </div>
            </div>
          </div>

          {/* Upcoming maintenances summary */}
          <div className="maintenance-column-right maintenance-column-right-preview">
            <h4>{this.texts.upcomingMaintenances}</h4>
            <table>
              <thead>
                <tr>
                  <td>
                    <strong>{this.texts.maintenanceListStartTime}</strong>
                  </td>
                  <td>
                    <strong>{this.texts.maintenanceListEndTime}</strong>
                  </td>
                </tr>
              </thead>
              <tbody>
                {/* Show first 10 upcoming maintenance dates and times */}
                {previewDates.slice(0, 10).map((dates: any, index: number) => (
                  <tr key={'preview-' + index} className={dates.ongoing ? 'iiris-ongoing-maintenance' : ''}>
                    <td>{dates.startTime.toFormat('dd.LL.yyyy HH:mm')}</td>
                    <td>{dates.endTime.toFormat('dd.LL.yyyy HH:mm')}</td>
                  </tr>
                ))}
                {previewDates.length === 10 && (
                  <tr key="preview-more-rows">
                    <td colSpan={2} className="td-end">
                      ...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Wizard buttons */}
        <div className="gf-form-button-row">
          <button className="btn btn-secondary" onClick={() => this.props.onCloseMaintenanceEditWizard()}>
            {this.texts.cancel}
          </button>
          <button className="btn btn-primary" disabled={validationErrors !== null} onClick={() => this.goToNext()}>
            {this.texts.next}
          </button>

          {/* Configuration error text */}
          <div className="maintenance-config-error-text">{validationErrors}</div>
        </div>
      </>
    );
  }

  // Render maintenance create/edit wizard phase 2: Description and selected hosts
  renderWizardPhase2() {
    const validationErrors = this.checkWizardPhase2Errors();
    return (
      <>
        {/* Maintenance description */}
        <div className="gf-form-group maintenance-row-container">
          <label className="gf-form-label">{this.texts.maintenanceDescription}</label>
          <textarea
            className="gf-form-input"
            value={this.state.description}
            onChange={(e) => this.setState({ description: e.target.value })}
            rows={3}
            maxLength={128}
          ></textarea>
        </div>

        <label className="gf-form-label">{this.texts.selectHosts}</label>

        {/* Search hosts */}
        <div className="iiris-text-search-container">
          <span className="iiris-search-icon fa fa-search"></span>
          <input
            className="input-small gf-form-input iiris-fixed-width-select"
            type="text"
            value={this.state.searchText}
            onChange={(e) => this.setState({ searchText: e.target.value })}
            placeholder={this.texts.searchWithName}
          />
        </div>
        <div className="gf-form-group maintenance-host-list">
          {/* All hosts selection */}
          {!this.state.searchText ? (
            <div className="iiris-checkbox">
              <input
                id="select_all"
                type="checkbox"
                checked={this.state.selectedHosts.every((host) => host.selected)}
                onChange={(e) => this.selectAllHosts(e.target.checked)}
              />
              <label className="checkbox-label" htmlFor="select_all">
                {this.texts.allHosts}
              </label>
            </div>
          ) : null}

          {/* Hosts list */}
          {this.state.selectedHosts
            .filter(
              (fHost) =>
                !this.state.searchText || fHost.name.toLowerCase().indexOf(this.state.searchText.toLowerCase()) > -1
            )
            .map((host) => (
              <div className="iiris-checkbox" key={'cb' + host.hostid}>
                <input
                  id={'cb' + host.hostid}
                  type="checkbox"
                  checked={host.selected}
                  onChange={(e) =>
                    this.setState({
                      selectedHosts: this.state.selectedHosts.map((sh) => {
                        if (sh === host) {
                          return {
                            ...sh,
                            selected: e.target.checked,
                          };
                        } else {
                          return sh;
                        }
                      }),
                    })
                  }
                />
                <label className="checkbox-label" htmlFor={'cb' + host.hostid}>
                  {host.name}
                </label>
              </div>
            ))}
        </div>

        {/* Wizard buttons */}
        <div className="gf-form-button-row">
          <button className="btn btn-secondary" onClick={(e) => this.goToPrevious()}>
            {this.texts.back}
          </button>
          <button className="btn btn-secondary" onClick={() => this.props.onCloseMaintenanceEditWizard()}>
            {this.texts.cancel}
          </button>
          <button className="btn btn-primary" disabled={validationErrors !== null} onClick={(e) => this.goToNext()}>
            {this.texts.next}
          </button>

          {/* Configuration error text */}
          <div className="maintenance-config-error-text">{validationErrors}</div>
        </div>
      </>
    );
  }

  // Render maintenance create/edit wizard phase 3: Summary
  renderWizardPhase3() {
    const summary = this.formatSummaryDisplayData();
    return (
      <>
        {/* Maintenance description */}
        <div className="iiris-maintenance-modal-text-row">
          <div className="iiris-maintenance-modal-text-label">{this.texts.description}</div>
          <div className="iiris-maintenance-modal-text-normal">{this.state.description}</div>
        </div>

        {/* Selected hosts (comma-separated list) */}
        <div className="iiris-maintenance-modal-text-row">
          <div className="iiris-maintenance-modal-text-label">{this.texts.hosts}</div>
          <div className="iiris-maintenance-modal-text-normal">{summary.displayHosts}</div>
        </div>

        {/* Maintenance type: single, daily, weekly, or monthly */}
        <div className="iiris-maintenance-modal-text-row">
          <div className="iiris-maintenance-modal-text-label">{this.texts.maintenanceType}</div>
          <div className="iiris-maintenance-modal-text-normal">
            {(this.mTypeInputOptions.find((item) => item.value === this.state.maintenanceType) || { label: '' }).label}
          </div>
        </div>

        {/* One-time maintenance start and end times */}
        {this.state.maintenanceType === MaintenanceType.OneTime ? (
          <div>
            <div className="iiris-maintenance-modal-text-row">
              <div className="iiris-maintenance-modal-text-label">{this.texts.maintenanceFormStartTime}</div>
              <div className="iiris-maintenance-modal-text-normal">{summary.displayStartDate}</div>
            </div>
            <div className="iiris-maintenance-modal-text-row">
              <div className="iiris-maintenance-modal-text-label">{this.texts.maintenanceFormEndTime}</div>
              <div className="iiris-maintenance-modal-text-normal">{summary.displayStopDate}</div>
            </div>
          </div>
        ) : null}

        {/* Daily maintenance: repeat every N days */}
        {this.state.maintenanceType === MaintenanceType.Daily ? (
          <div>
            <div className="iiris-maintenance-modal-text-row">
              <div className="iiris-maintenance-modal-text-label">{this.texts.repeatEveryNDays}</div>
              <div className="iiris-maintenance-modal-text-normal">{this.state.everyNDays}</div>
            </div>
          </div>
        ) : null}

        {/* Weekly maintenance: repeat every N weeks, on which weekdays */}
        {this.state.maintenanceType === MaintenanceType.Weekly ? (
          <div>
            <div className="iiris-maintenance-modal-text-row">
              <div className="iiris-maintenance-modal-text-label">{this.texts.repeatEveryNWeeks}</div>
              <div className="iiris-maintenance-modal-text-normal">{this.state.everyNWeeks}</div>
            </div>
            <div className="iiris-maintenance-modal-text-row">
              <div className="iiris-maintenance-modal-text-label">{this.texts.repeatOnWeekday}</div>
              <div className="iiris-maintenance-modal-text-normal">{summary.displayWeeklyDays}</div>
            </div>
          </div>
        ) : null}

        {/* Monthly maintenance: repeat on which months and on Nth day / weekday(s) of the month */}
        {this.state.maintenanceType === MaintenanceType.Monthly ? (
          <div>
            <div className="iiris-maintenance-modal-text-row">
              <div className="iiris-maintenance-modal-text-label">{this.texts.repeatOnMonth}</div>
              <div className="iiris-maintenance-modal-text-normal">{summary.displayMonths}</div>
            </div>
            {this.state.dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Month ? (
              <div>
                <div className="iiris-maintenance-modal-text-row">
                  <div className="iiris-maintenance-modal-text-label">{this.texts.repeatOnDayOfMonth}</div>
                  <div className="iiris-maintenance-modal-text-normal">{this.state.dayOfMonth}</div>
                </div>
              </div>
            ) : (
              <div>
                <div className="iiris-maintenance-modal-text-row">
                  <div className="iiris-maintenance-modal-text-label">{this.texts.repeatOnDayOfWeek}</div>
                  <div className="iiris-maintenance-modal-text-normal">
                    {summary.displayMonthlyWeekdayNumber + ' ' + summary.displayMonthlyWeekdayNames}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Repeating maintenance: start and end times */}
        {this.state.maintenanceType > 0 ? (
          <div>
            <div className="iiris-maintenance-modal-text-row">
              <div className="iiris-maintenance-modal-text-label">{this.texts.maintenanceFormStartTime}</div>
              <div className="iiris-maintenance-modal-text-normal">{summary.displayStartDate}</div>
            </div>
            <div className="iiris-maintenance-modal-text-row">
              <div className="iiris-maintenance-modal-text-label">{this.texts.maintenanceFormEndTime}</div>
              <div className="iiris-maintenance-modal-text-normal">{summary.displayStopDate}</div>
            </div>
            <div className="iiris-maintenance-modal-text-row">
              <div className="iiris-maintenance-modal-text-label">{this.texts.repeatStarts}</div>
              <div className="iiris-maintenance-modal-text-normal">{summary.displayRepeatStartDate}</div>
            </div>
            <div className="iiris-maintenance-modal-text-row">
              <div className="iiris-maintenance-modal-text-label">{this.texts.repeatEnds}</div>
              <div className="iiris-maintenance-modal-text-normal">{summary.displayRepeatStopDate}</div>
            </div>
          </div>
        ) : null}

        {/* Wizard buttons */}
        <div className="gf-form-button-row">
          <button className="btn btn-secondary" disabled={this.state.isLoading} onClick={() => this.goToPrevious()}>
            {this.texts.back}
          </button>
          <button
            className="btn btn-secondary"
            disabled={this.state.isLoading}
            onClick={() => this.props.onCloseMaintenanceEditWizard()}
          >
            {this.texts.cancel}
          </button>
          <button className="btn btn-primary" disabled={this.state.isLoading} onClick={() => this.onSaveChanges()}>
            {this.props.selectedMaintenance ? this.texts.saveChanges : this.texts.createMaintenance}
          </button>
        </div>
      </>
    );
  }

  // Render component
  render() {
    const title = (
      <h2 className="modal-header modal-header-title">
        {this.props.selectedMaintenance ? this.texts.modifyMaintenance : this.texts.createNewMaintenance}
      </h2>
    );

    return (
      <>
        {/* This actual model dialog */}
        <Modal
          isOpen={this.props.show}
          title={title}
          onDismiss={() => this.props.onCloseMaintenanceEditWizard()}
          className="modal modal-body"
        >
          <div>
            <div className="modal-content">
              {/* Wizard phase 1: Maintenance dates */}
              {this.state.wizardPhase === WizardPhase.FirstDates ? this.renderWizardPhase1() : null}

              {/* Wizard phase 2: Description and selected hosts */}
              {this.state.wizardPhase === WizardPhase.SecondDescriptionAndHosts ? this.renderWizardPhase2() : null}

              {/* Wizard phase 3: Summary */}
              {this.state.wizardPhase === WizardPhase.ThirdSummary ? this.renderWizardPhase3() : null}
            </div>
          </div>
        </Modal>
      </>
    );
  }
}
