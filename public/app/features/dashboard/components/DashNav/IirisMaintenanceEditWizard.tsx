/**
 * This component is a modal wizard dialog that prompts the user to enter maintenance information
 * for creating a new maintenance or editing an existing one.
 */

import { DateTime } from 'luxon';
import moment from 'moment'; // eslint-disable-line no-restricted-imports
import React, { PureComponent } from 'react';

import 'moment/locale/fi';
import { AppEvents } from '@grafana/data';
import { Modal, ConfirmModal } from '@grafana/ui';
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

// Modal dialog shown currently
enum ShownDialog {
  None = 0,
  NewMaintenanceStarted,
  OngoingMaintenanceUpdated,
  FutureMaintenanceCreated,
  FutureMaintenanceUpdated,
}

// Monthly maintenance has two repeate modes
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
  wizardPhase: WizardPhase;
  shownDialog: ShownDialog;
  maintenanceType: MaintenanceType;
  everyNDays: number; // Daily maintanance: repeat every N days
  everyNWeeks: number; // Weekly maintenance: repeat every N weeks
  weeklyWeekdays: WeekdaySelection; // Weekly maintenance: selected weekdays
  months: MonthSelection; // Monthly maintenance: selected months
  dayOfMonthOrWeekSelected: MonthlyDayPeriodSelection; // Monthly maintenance: manner in which the maintenance is repeated
  dayOfMonth: number; // Monthly maintenance: Nth day of the month; only if dayOfMonthOrWeekSelected is Month
  monthlyWeekdays: WeekdaySelection; // Monthly maintenance: selected weekday if repeated on Nth weekday(s) of the month
  monthlyWeekNumberInput: number; // Monthly maintenance: the week of month (1 - first, 2 - second, ..., 5 - last); only if dayOfMonthOrWeekSelected is Week

  oneTimeStartTimestamp: DateTime; // One-time maintenance start timestamp
  periodicActiveSinceTimestamp: DateTime; // Periodic maintenance (daily, weekly or monthly): repeat start date
  periodicActiveTillTimestamp: DateTime; // Periodic maintenance (daily, weekly or monthly): repeat end date
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
    wizardPhase: WizardPhase.FirstDates,
    shownDialog: ShownDialog.None,
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
    periodicActiveSinceTimestamp: DateTime.now(),
    periodicActiveTillTimestamp: DateTime.now(),
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
        const maintenanceHostIds: number[] = m.hosts.map((host) => host.hostid);
        selectedHosts.map((host, index: number) => {
          if (maintenanceHostIds.indexOf(host.hostid) === -1) {
            selectedHosts[index].selected = false;
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

        description: m ? m.name : '',
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
    let periodicActiveSinceTimestamp = DateTime.now().startOf('day');
    let periodicActiveTillTimestamp = DateTime.now().plus({ days: 1 }).startOf('day');
    let periodicStartHour: number = DateTime.now().hour;
    let periodicStartMinute: number = DateTime.now().minute;
    if (m && type === MaintenanceType.OneTime) {
      oneTimeStartTimestamp = m.oneTimeStartTimestamp!;
    } else if (m) {
      // Periodic maintenance
      periodicActiveSinceTimestamp = m.periodicActiveSinceTimestamp!;
      periodicActiveTillTimestamp = m.periodicActiveTillTimestamp!;
      periodicStartHour = Math.floor(m.periodicStartTime! / 3600);
      periodicStartMinute = Math.floor((m.periodicStartTime! - periodicStartHour * 3600) / 60);
    }

    return {
      duration: duration,
      strictEndTimeSelected: strictEndTimeSelected,
      oneTimeStartTimestamp: oneTimeStartTimestamp,
      periodicActiveSinceTimestamp: periodicActiveSinceTimestamp,
      periodicActiveTillTimestamp: periodicActiveTillTimestamp,
      periodicStartHour: periodicStartHour,
      periodicStartMinute: periodicStartMinute,
    };
  }

  // Analyze the configured dates and generate top-10 list of upcoming maintenances to the state
  getMaintanenceDatesPreview = () => {
    const { maintenanceType } = this.state;

    let dates: MaintenanceInstanceDates[];
    if (maintenanceType === MaintenanceType.OneTime) {
      const endTime = this.state.oneTimeStartTimestamp.plus({ seconds: this.state.duration });
      dates = [
        {
          startTime: this.state.oneTimeStartTimestamp,
          endTime: endTime,
          ongoing: this.state.oneTimeStartTimestamp <= DateTime.now() && endTime >= DateTime.now(),
        },
      ];
    } else if (maintenanceType === MaintenanceType.Daily) {
      dates = getNextDailyMaintenances(
        this.state.periodicActiveSinceTimestamp,
        this.state.periodicActiveTillTimestamp,
        this.state.everyNDays,
        this.state.periodicStartHour * 3600 + this.state.periodicStartMinute * 60,
        this.state.duration
      );
    } else if (maintenanceType === MaintenanceType.Weekly) {
      dates = getNextWeeklyMaintenances(
        this.state.periodicActiveSinceTimestamp,
        this.state.periodicActiveTillTimestamp,
        this.state.everyNWeeks,
        this.state.weeklyWeekdays,
        this.state.periodicStartHour * 3600 + this.state.periodicStartMinute * 60,
        this.state.duration
      );
    } else {
      dates = getNextMonthlyMaintenances(
        this.state.periodicActiveSinceTimestamp,
        this.state.periodicActiveTillTimestamp,
        this.state.monthlyWeekNumberInput,
        this.state.monthlyWeekdays,
        this.state.dayOfMonth,
        this.state.months,
        this.state.periodicStartHour * 3600 + this.state.periodicStartMinute * 60,
        this.state.duration
      );
    }

    return dates;
  };

  /**
   * Save changes (either creating a new maintenance or editing an old one)
   */
  onSaveChanges = () => {
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
      durationString: '',
    };
    if (this.state.maintenanceType === MaintenanceType.OneTime) {
      m.oneTimeStartTimestamp = this.state.oneTimeStartTimestamp;
      m.oneTimeEndTimestamp = this.state.oneTimeStartTimestamp.plus({ seconds: this.state.duration });
    } else {
      // Periodic maintenance
      m.periodicActiveSinceTimestamp = this.state.periodicActiveSinceTimestamp.startOf('day');
      m.periodicActiveTillTimestamp = this.state.periodicActiveTillTimestamp.startOf('day');
      m.periodicStartTime = this.state.periodicStartHour * 3600 + this.state.periodicStartMinute * 60;
      if (this.state.maintenanceType === MaintenanceType.Daily) {
        m.every = this.state.everyNDays;
      } else if (this.state.maintenanceType === MaintenanceType.Weekly) {
        m.every = this.state.everyNWeeks;
        m.weekdays = this.state.weeklyWeekdays;
      } else {
        // Monthly maintenance, two possible modes
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
        // Prompt the user according to whether it was update or save and whether if affects the system
        // state immediately
        if (this.props.selectedMaintenance) {
          if (
            this.props.selectedMaintenance.ongoing ||
            this.getMaintanenceDatesPreview().some((dates) => dates.ongoing)
          ) {
            this.setState({ shownDialog: ShownDialog.OngoingMaintenanceUpdated });
          } else {
            this.setState({ shownDialog: ShownDialog.FutureMaintenanceUpdated });
          }
        } else {
          if (this.getMaintanenceDatesPreview().some((dates) => dates.ongoing)) {
            this.setState({ shownDialog: ShownDialog.NewMaintenanceStarted });
          } else {
            this.setState({ shownDialog: ShownDialog.FutureMaintenanceCreated });
          }
        }

        // Signal action panel to refresh its state once zabbix has updated
        // the maintenance status of the hosts in a few minutes
        setTimeout(() => {
          document.dispatchEvent(new Event('iiris-maintenance-update'));
        }, 2 * 60 * 1000);
      })
      .catch((err: any) => {
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
    return Array.from(Array(maxDay + 1).keys()).map((day) => day + 1);
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
    this.state.selectedHosts.forEach((host) => {
      host.selected = allSelected;
    });
  };

  // Check the validity of wizard phase 1 configuration;
  // returns error text or null if there are no errors
  checkWizardPhase1Errors(): string | null {
    const maintenanceType = this.state.maintenanceType;
    if (maintenanceType === MaintenanceType.Daily) {
      if (!this.state.everyNDays || !/^[0-9]*$/.test(this.state.everyNDays + '')) {
        return this.texts.dayFieldMustContainInteger;
      }
    } else if (maintenanceType === MaintenanceType.Weekly) {
      if (!this.state.everyNWeeks || !/^[0-9]*$/.test(this.state.everyNWeeks + '')) {
        return this.texts.weekFieldMustContainInteger;
      }
      let someWeekdaySelected = this.state.weeklyWeekdays.some((weekdaySelected) => weekdaySelected);
      if (!someWeekdaySelected) {
        return this.texts.oneWeekdayMustBeChosen;
      }
    } else if (maintenanceType === MaintenanceType.Monthly) {
      let someMonthSelected = this.state.months.some((monthSelected) => monthSelected);
      if (!someMonthSelected) {
        return this.texts.oneMonthMustBeChosen;
      }
      if (this.state.dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Month) {
        if (!this.state.dayOfMonth || !/^[0-9]*$/.test(this.state.dayOfMonth + '')) {
          return this.texts.monthFieldMustContainInteger;
        }
      } else if (this.state.dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Week) {
        let someWeekdaySelected = this.state.monthlyWeekdays.some((weekdaySelected) => weekdaySelected);
        if (!someWeekdaySelected) {
          return this.texts.oneWeekdayMustBeChosen;
        }
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
      if (this.state.periodicActiveTillTimestamp <= this.state.periodicActiveSinceTimestamp) {
        return this.texts.repeatMustEndAfterStartTime;
      } else if (this.state.periodicActiveSinceTimestamp < DateTime.now().startOf('day')) {
        return this.texts.repeatEndTimeCantBeInPast;
      }
      // Check if period continues over next DST change
      const curYear = new Date().getFullYear();
      const isCurrentlyDST = moment().isDST();
      let nextChange;
      if (isCurrentlyDST) {
        nextChange = moment(curYear + '-10-01')
          .endOf('month')
          .startOf('isoWeek')
          .subtract(1, 'day')
          .add(4, 'hour');
      } else {
        nextChange = moment(curYear + '-03-01')
          .endOf('month')
          .startOf('isoWeek')
          .subtract(1, 'day')
          .add(3, 'hour');

        // Increase year if current date has surpassed last DST change
        if (moment() >= nextChange) {
          nextChange.add(1, 'year');
        }
      }
      if (this.state.periodicActiveTillTimestamp.toMillis() > nextChange.valueOf()) {
        return this.texts.repeatEndTimeCantOverlapDaylight + ' ' + nextChange.format('DD.MM.YYYY HH:mm');
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
      summaryData.displayRepeatStartDate = this.state.periodicActiveSinceTimestamp.toFormat('dd.LL.yyyy');
      summaryData.displayRepeatStopDate = this.state.periodicActiveTillTimestamp.toFormat('dd.LL.yyyy');

      // Show time (without date) when the repeating maintenance starts
      var hourWithLeadingZeros = '00' + this.state.periodicStartHour;
      var minutesWithLeadingZeros = '00' + this.state.periodicStartMinute;
      summaryData.displayStartDate =
        hourWithLeadingZeros.substring(hourWithLeadingZeros.length - 2) +
        ':' +
        minutesWithLeadingZeros.substring(minutesWithLeadingZeros.length - 2);

      // Show time (without date) when the repeating maintenance ends
      const startTimeSeconds = this.state.periodicStartHour * 3600 + this.state.periodicStartMinute * 60;
      const endTimeSeconds = startTimeSeconds + this.state.duration;
      const endHour = Math.floor(endTimeSeconds / 3600);
      const endMinute = Math.floor((endTimeSeconds - endHour * 3600) / 60);
      hourWithLeadingZeros = '00' + endHour;
      minutesWithLeadingZeros = '00' + endMinute;
      summaryData.displayStopDate =
        hourWithLeadingZeros.substring(hourWithLeadingZeros.length - 2) +
        ':' +
        minutesWithLeadingZeros.substring(minutesWithLeadingZeros.length - 2);
    }

    summaryData.displayHosts = this.state.selectedHosts.map((host) => host.name).join(', ');
    summaryData.displayWeeklyDays = this.state.weeklyWeekdays
      .map((weekdaySelected, weekday) => {
        return this.weekdayNames[weekday];
      })
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
    summaryData.displayMonthlyWeekdayNames = this.state.monthlyWeekdays
      .map((weekdaySelected, weekday) => {
        return this.weekdayNames[weekday];
      })
      .join(', ');
    return summaryData;
  }

  /**
   * For repeating maintenances, render the selection of how often the maintenance repeats.
   * Daily maintenance: Every N days
   * Weekly maintenance: Every N weeks plus weekday(s) selection
   * Monthly maintenance: Month selection, Nth day of month or Nth weekday(s) of month
   */
  renderRepeateSelection() {
    if (this.state.maintenanceType === MaintenanceType.Daily) {
      // Daily maintenance: Every N days selection
      return (
        <div className="gf-form-group maintenance-row-container">
          <label className="gf-form-label">{this.texts.repeatEveryNDays}</label>
          <div>
            <input
              className="input-small gf-form-input iiris-fixed-width-select"
              type="number"
              value={this.state.everyNDays}
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
                value={this.state.everyNWeeks}
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
                    onChange={(e) =>
                      this.setState({
                        weeklyWeekdays: Object.assign([], this.state.weeklyWeekdays, { weekday: e.target.checked }),
                      })
                    }
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
                          onChange={(e) =>
                            this.setState({ months: Object.assign([], this.state.months, { month: e.target.checked }) })
                          }
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
                    onChange={(e) => this.setState({ dayOfMonthOrWeekSelected: e.target.valueAsNumber })}
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
                    onChange={(e) => this.setState({ dayOfMonthOrWeekSelected: e.target.valueAsNumber })}
                    value={MonthlyDayPeriodSelection.Week}
                    id="dayOfWeekSelected"
                  />
                  <label className="gf-form-label checkbox-label width-12" htmlFor="dayOfWeekSelected">
                    {this.texts.nthDayOfWeek}
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
                          onChange={(e) =>
                            this.setState({
                              monthlyWeekdays: Object.assign([], this.state.monthlyWeekdays, {
                                weekday: e.target.checked,
                              }),
                            })
                          }
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
        <label className="gf-form-label">{this.texts.maintenanceStartTime}</label>
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
                  value={this.state.periodicActiveSinceTimestamp.day}
                  onChange={(e) =>
                    this.setState({
                      periodicActiveSinceTimestamp: this.state.periodicActiveSinceTimestamp.set({
                        day: parseInt(e.target.value, 10),
                      }),
                    })
                  }
                >
                  {this.getDaysForDropdown(this.state.periodicActiveSinceTimestamp).map((day) => (
                    <option value={day} key={'start-repeate-day-' + day}>
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
                  value={this.state.periodicActiveSinceTimestamp.month}
                  onChange={(e) =>
                    this.setState({
                      periodicActiveSinceTimestamp: this.state.periodicActiveSinceTimestamp.set({
                        month: parseInt(e.target.value, 10),
                      }),
                    })
                  }
                >
                  {Array.from(Array(12).keys())
                    .map((month) => month + 1)
                    .map((month) => (
                      <option value={month} key={'start-repeate-month-' + month}>
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
                  value={this.state.periodicActiveSinceTimestamp.year}
                  onChange={(e) =>
                    this.setState({
                      periodicActiveSinceTimestamp: this.state.periodicActiveSinceTimestamp.set({
                        year: parseInt(e.target.value, 10),
                      }),
                    })
                  }
                >
                  {this.getYearsForDropdown(this.state.periodicActiveSinceTimestamp.year).map((year) => (
                    <option value={year} key={'start-repeate-year-' + year}>
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
                  value={this.state.periodicActiveTillTimestamp.day}
                  onChange={(e) =>
                    this.setState({
                      periodicActiveTillTimestamp: this.state.periodicActiveTillTimestamp.set({
                        day: parseInt(e.target.value, 10),
                      }),
                    })
                  }
                >
                  {this.getDaysForDropdown(this.state.periodicActiveTillTimestamp).map((day) => (
                    <option value={day} key={'end-repeate-day-' + day}>
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
                  value={this.state.periodicActiveTillTimestamp.month}
                  onChange={(e) =>
                    this.setState({
                      periodicActiveTillTimestamp: this.state.periodicActiveTillTimestamp.set({
                        month: parseInt(e.target.value, 10),
                      }),
                    })
                  }
                >
                  {Array.from(Array(12).keys())
                    .map((month) => month + 1)
                    .map((month) => (
                      <option value={month} key={'end-repeate-month-' + month}>
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
                  value={this.state.periodicActiveTillTimestamp.year}
                  onChange={(e) =>
                    this.setState({
                      periodicActiveTillTimestamp: this.state.periodicActiveTillTimestamp.set({
                        year: parseInt(e.target.value, 10),
                      }),
                    })
                  }
                >
                  {this.getYearsForDropdown(this.state.periodicActiveTillTimestamp.year).map((year) => (
                    <option value={year} key={'end-repeate-year-' + year}>
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
        <label className="gf-form-label">{this.texts.maintenanceEndTime}</label>
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
    const endTimeSeconds = startTimeSeconds + this.state.duration;
    const endHour = Math.floor(endTimeSeconds / 3600);
    const endMinute = Math.floor((endTimeSeconds - endHour * 3600) / 60);
    return (
      <>
        <div className="iiris-modal-column">
          <label className="gf-form-label">{this.texts.maintenanceStartTime}</label>
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
            <label className="gf-form-label">{this.texts.maintenanceEndTime}</label>
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
    const previewDates = this.getMaintanenceDatesPreview();
    const validationErrors = this.checkWizardPhase1Errors();
    return (
      <form>
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
            {this.state.maintenanceType !== MaintenanceType.OneTime ? this.renderRepeateSelection() : null}

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
          </div>

          {/* Upcoming maintenances summary */}
          <div className="maintenance-column-right maintenance-column-right-preview">
            <h4>{this.texts.upcomingMaintenances}</h4>
            <table>
              <thead>
                <tr>
                  <td>
                    <strong>{this.texts.startTime}</strong>
                  </td>
                  <td>
                    <strong>{this.texts.endTime}</strong>
                  </td>
                </tr>
              </thead>
              <tbody>
                {/* Show first 10 upcoming maintenance dates and times */}
                {previewDates.map(
                  (dates: any, index: number) =>
                    index < 11 && (
                      <React.Fragment key={index}>
                        <tr className={dates.ongoing ? 'iiris-colored-row' : ''}>
                          <td>{dates.startTime.toFormat('dd.LL.yyyy HH:mm')}</td>
                          <td>{dates.endTime.toFormat('dd.LL.yyyy HH:mm')}</td>
                        </tr>
                        {index === 10 && (
                          <tr>
                            <td colSpan={2} className="td-end">
                              ...
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                )}
              </tbody>
            </table>
          </div>
        </div>
      </form>
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
              <div className="iiris-maintenance-modal-text-label">{this.texts.maintenanceStartTime}</div>
              <div className="iiris-maintenance-modal-text-normal">{summary.displayStartDate}</div>
            </div>
            <div className="iiris-maintenance-modal-text-row">
              <div className="iiris-maintenance-modal-text-label">{this.texts.maintenanceEndTime}</div>
              <div className="iiris-maintenance-modal-text-normal">{summary.displayStopDate}</div>
            </div>
          </div>
        ) : null}

        {/* Daily maintenance: repeate every N days */}
        {this.state.maintenanceType === MaintenanceType.Daily ? (
          <div>
            <div className="iiris-maintenance-modal-text-row">
              <div className="iiris-maintenance-modal-text-label">{this.texts.repeatEveryNDays}</div>
              <div className="iiris-maintenance-modal-text-normal">{this.state.everyNDays}</div>
            </div>
          </div>
        ) : null}

        {/* Weekly maintenance: repeate every N weeks, on which weekdays */}
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

        {/* Monthly maintenance: repeate on which months and on Nth day / weekday(s) of the month */}
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
              <div className="iiris-maintenance-modal-text-label">{this.texts.maintenanceStartTime}</div>
              <div className="iiris-maintenance-modal-text-normal">{summary.displayStartDate}</div>
            </div>
            <div className="iiris-maintenance-modal-text-row">
              <div className="iiris-maintenance-modal-text-label">{this.texts.maintenanceEndTime}</div>
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
          <button className="btn btn-secondary" onClick={() => this.goToPrevious()}>
            {this.texts.back}
          </button>
          <button className="btn btn-secondary" onClick={() => this.props.onCloseMaintenanceEditWizard()}>
            {this.texts.cancel}
          </button>
          <button className="btn btn-primary" onClick={() => this.onSaveChanges()}>
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
        {/* Prompt the user that a new maintenance has been created and started */}
        <ConfirmModal
          isOpen={this.state.shownDialog === ShownDialog.NewMaintenanceStarted}
          title={this.texts.maintenanceSavedTitle}
          body={this.texts.newMaintenanceHasBeenStarted + '\n' + this.texts.systemStatusWillBeUpdated}
          confirmText=""
          onConfirm={() => {}}
          onDismiss={() => this.props.onCloseMaintenanceEditWizard()}
        />
        {/* Prompt the user that an ongoing maintenance has been updated */}
        <ConfirmModal
          isOpen={this.state.shownDialog === ShownDialog.OngoingMaintenanceUpdated}
          title={this.texts.maintenanceSavedTitle}
          body={this.texts.maintenanceHasBeenUpdated + '\n' + this.texts.systemStatusWillBeUpdated}
          confirmText=""
          onConfirm={() => {}}
          onDismiss={() => this.props.onCloseMaintenanceEditWizard()}
        />
        {/* Prompt the user that a new maintenance has been created (for the future) */}
        <ConfirmModal
          isOpen={this.state.shownDialog === ShownDialog.FutureMaintenanceCreated}
          title={this.texts.maintenanceSavedTitle}
          body={this.texts.newMaintenanceHasBeenCreated}
          confirmText=""
          onConfirm={() => {}}
          onDismiss={() => this.props.onCloseMaintenanceEditWizard()}
        />
        {/* Prompt the user that an existing maintenance has been updated (for the future) */}
        <ConfirmModal
          isOpen={this.state.shownDialog === ShownDialog.FutureMaintenanceUpdated}
          title={this.texts.maintenanceSavedTitle}
          body={this.texts.maintenanceHasBeenUpdated}
          confirmText=""
          onConfirm={() => {}}
          onDismiss={() => this.props.onCloseMaintenanceEditWizard()}
        />
      </>
    );
  }
}
