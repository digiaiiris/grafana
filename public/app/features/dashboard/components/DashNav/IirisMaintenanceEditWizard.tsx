/**
 * This component is a modal wizard dialog that prompts the user to enter maintenance information
 * for creating a new maintenance or editing an existing one.
 */

//import { DateTime } from 'luxon';
import moment from 'moment'; // eslint-disable-line no-restricted-imports
import React, { PureComponent } from 'react';

import 'moment/locale/fi';
import { Modal } from '@grafana/ui';
import { contextSrv } from 'app/core/core';

import { OnCreateOrUpdateMaintenanceCallback } from './IirisMaintenance';
import { Maintenance, MaintenanceType } from './common_tools';

enum WizardPhase {
  FirstDates = 1,
  SecondDescriptionAndHosts = 2,
  ThirdSummary = 3,
}

// Used as a type for both weekly and monthly maintenances where weekday(s) can be selected
interface WeekdaySelection {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

// Type for this.weekdayNames
interface WeekdayNames {
  monday: string;
  tuesday: string;
  wednesday: string;
  thursday: string;
  friday: string;
  saturday: string;
  sunday: string;
}

// Used as a type for month selection for monthly maintenances
interface MonthSelection {
  january: boolean;
  february: boolean;
  march: boolean;
  april: boolean;
  may: boolean;
  june: boolean;
  july: boolean;
  august: boolean;
  september: boolean;
  october: boolean;
  november: boolean;
  december: boolean;
  all: boolean;
}

// Type for this.monthNames
interface MonthNames {
  january: string;
  february: string;
  march: string;
  april: string;
  may: string;
  june: string;
  july: string;
  august: string;
  september: string;
  october: string;
  november: string;
  december: string;
}

enum MonthlyDayPeriodSelection {
  Week = 1, // The maintenance is repeated on Nth weekday(s) of the month
  Month = 2, // The maintenance is repeated on Nth day of the month
}

// Options type for dropdowns
interface Options {
  text: string;
  value: number;
}

interface Props {
  show: boolean; // Show modal dialog
  onDismiss(): void;
  onCreateOrUpdateMaintenance: OnCreateOrUpdateMaintenanceCallback;
  selectedMaintenance?: Maintenance;
  openAllMaintenancesModal(): void;
  hosts: Array<{ text: string; value: number }>;
  user: string;
  allMaintenances: Maintenance[];
}

interface State {
  wizardPhase: WizardPhase;
  maintenanceType: MaintenanceType;
  everyNDays: number; // Daily maintanance: repeat every N days
  everyNWeeks: number; // Weekly maintenance: repeat every N weeks
  weeklyWeekdays: WeekdaySelection; // Weekly maintenance: selected weekdays
  months: MonthSelection; // Monthly maintenance: selected months
  dayOfMonthOrWeekSelected: MonthlyDayPeriodSelection; // Monthly maintenance: manner in which the maintenance is repeated
  dayOfMonth: number; // Monthly maintenance: Nth day of the month; only if dayOfMonthOrWeekSelected is Month
  monthlyWeekdays: WeekdaySelection; // Monthly maintenance: selected weekday if repeated on Nth weekday(s) of the month
  everyDayOfWeekInput: number; // Monthly maintenance: the week of month (1 - first, 2 - second, ..., 5 - last); only if dayOfMonthOrWeekSelected is Week

  // For single maintenance: maintenance start date
  // For repeating maintenance: repeat start date
  dayInput: number;
  monthInput: number;
  yearInput: number;

  // Maintenance start time (either for the single maintenance or the repeating maintenance)
  hourInput: number;
  minuteInput: number;

  // For single maintenance: maintenance end date
  // For repeating maintenance: repeate end date
  dayStopInput: number;
  monthStopInput: number;
  yearStopInput: number;

  // For single maintenance: Maintenance end date
  // For repeating maintenance: N/A
  strictEndDayInput: number;
  strictEndMonthInput: number;
  strictEndYearInput: number;

  // Maintenance end time (either for the single maintenance or the repeating maintenance)
  // If strictEndTimeSelected is false and the duration is given with durationInput
  // these fields are set automatically according to the configured duration.
  strictEndHourInput: number;
  strictEndMinuteInput: number;

  // True if end time is selected manually, false if duration is selected
  strictEndTimeSelected: boolean;

  // Duration of the maintenance in seconds; valid if strictEndTimeSelected is false
  durationInput: number;

  description: string;
  searchText: string;
  allHostsSelected: boolean;
  selectedHosts: Array<{ text: string; value: number; selected: boolean }>;
}

export class IirisMaintenanceEditWizard extends PureComponent<Props, State> {
  durationInput: {
    options: Array<{ text: string; value: number }>;
  };
  mTypeInput: {
    options: Array<{ label: string; value: MaintenanceType }>;
  };
  everyDayOfWeekInputOptions: Array<{ label: string; value: number }>;
  weekdayNames: WeekdayNames;
  monthNames: MonthNames;
  texts: any;

  constructor(props: Props) {
    super(props);
    this.texts = contextSrv.getLocalizedTexts();
    this.weekdayNames = {
      monday: this.texts.monday,
      tuesday: this.texts.tuesday,
      wednesday: this.texts.wednesday,
      thursday: this.texts.thursday,
      friday: this.texts.friday,
      saturday: this.texts.saturday,
      sunday: this.texts.sunday,
    };
    this.monthNames = {
      january: this.texts.january,
      february: this.texts.february,
      march: this.texts.march,
      april: this.texts.april,
      may: this.texts.may,
      june: this.texts.june,
      july: this.texts.july,
      august: this.texts.august,
      september: this.texts.september,
      october: this.texts.october,
      november: this.texts.november,
      december: this.texts.december,
    };
    this.durationInput = {
      options: [
        { text: '1h', value: 3600 },
        { text: '2h', value: 7200 },
        { text: '4h', value: 14400 },
        { text: '8h', value: 28800 },
        { text: '12h', value: 43200 },
        { text: '24h', value: 86400 },
        { text: '2d', value: 172800 },
        { text: '3d', value: 259200 },
        { text: '5d', value: 432000 },
      ],
    };
    this.mTypeInput = {
      options: [
        { label: this.texts.oneTime, value: MaintenanceType.OneTime },
        { label: this.texts.daily, value: MaintenanceType.Daily },
        { label: this.texts.weekly, value: MaintenanceType.Weekly },
        { label: this.texts.monthly, value: MaintenanceType.Monthly },
      ],
    };
    this.everyDayOfWeekInputOptions = [
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

      // TBD: This is current a legacy way
      var stateDateProperties = this.initializeDatesToState(type, m);

      const selectedHosts = this.props.hosts.map((host) => ({ ...host, selected: true }));
      var allHostsSelected = true;
      if (m) {
        // Set host selection based on selected maintenance
        const maintenanceHostIds: number[] = m.hosts.map((host) => host.hostid);
        selectedHosts.map((host, index: number) => {
          if (maintenanceHostIds.indexOf(host.value) === -1) {
            selectedHosts[index].selected = false;
            allHostsSelected = false;
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
        allHostsSelected: allHostsSelected,
      });
    }
  }

  // Initialize weekly and monthly maintenance related state variables when the dialog is shown
  initializeWeeklyMonthlyState(type: MaintenanceType, m?: Maintenance) {
    // Selected weekdays of weekly maintenance
    var weeklyWeekdays: WeekdaySelection = {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    };
    if (m && type === MaintenanceType.Weekly) {
      // Turn dayOfWeek number to binary and then to array to get selected weekdays
      const daysBinary = m.dayOfWeek.toString(2).split('').reverse();
      for (let i = 0; i < daysBinary.length; i++) {
        if (daysBinary[i] === '1') {
          const dayTitles = Object.keys(weeklyWeekdays) as Array<keyof WeekdaySelection>;
          weeklyWeekdays[dayTitles[i]] = true;
        }
      }
    }

    // Selected months of monthly maintenance
    var months: MonthSelection = {
      january: false,
      february: false,
      march: false,
      april: false,
      may: false,
      june: false,
      july: false,
      august: false,
      september: false,
      october: false,
      november: false,
      december: false,
      all: false,
    };
    if (m && type === MaintenanceType.Monthly) {
      // Turn month number to binary and then to array to get selected months
      const monthBinary = m.month.toString(2).split('').reverse();
      let monthAmount = 0;
      for (let i = 0; i < monthBinary.length; i++) {
        if (monthBinary[i] === '1') {
          const monthTitles = Object.keys(months) as Array<keyof MonthSelection>;
          months[monthTitles[i]] = true;
          monthAmount++;
        }
      }
      if (monthAmount === 12) {
        months.all = true;
      }
    }

    // Monthly maintenance: Is it repeated Nth day of month of Nth weekday(s) of month
    let dayOfMonthOrWeekSelected: MonthlyDayPeriodSelection = MonthlyDayPeriodSelection.Month;
    if (m && type === MaintenanceType.Monthly && !m.day) {
      dayOfMonthOrWeekSelected = MonthlyDayPeriodSelection.Week;
    }

    // Selected weekdays of monthly maintenance when Nth weekday(s) of the month option is selected
    var monthlyWeekdays: WeekdaySelection = {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    };
    if (m && type === MaintenanceType.Monthly && dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Week) {
      // Turn dayOfWeek number to binary and then to array to get selected weekdays
      const daysBinary = m.dayOfWeek.toString(2).split('').reverse();
      for (let i = 0; i < daysBinary.length; i++) {
        if (daysBinary[i] === '1') {
          const dayTitles = Object.keys(monthlyWeekdays) as Array<keyof WeekdaySelection>;
          monthlyWeekdays[dayTitles[i]] = true;
        }
      }
    }

    return {
      weeklyWeekdays: weeklyWeekdays,
      dayOfMonthOrWeekSelected: dayOfMonthOrWeekSelected,
      dayOfMonth:
        m && type === MaintenanceType.Monthly && dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Month
          ? m.day
          : 1,
      monthlyWeekdays: monthlyWeekdays,
      everyDayOfWeekInput:
        m && type === MaintenanceType.Monthly && dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Week
          ? m.every
          : 1,
    };
  }

  // Initialize date properties to state when the dialog is shown
  // TBD: This is the old and messy way of doing things that needs to be blown up
  initializeDatesToState(type: MaintenanceType, m?: Maintenance) {
    let currentDate = new Date();
    let currentHours = currentDate.getHours();
    let currentMinutes = currentDate.getMinutes();
    if (m) {
      const currentStartTime = new Date(m.startTime * 1000);
      currentHours = currentStartTime.getHours();
      currentMinutes = currentStartTime.getMinutes();
      if (m.maintenanceType > 0) {
        currentDate = moment(m.activeSince * 1000)
          .startOf('day')
          .add(currentHours, 'hour')
          .add(currentMinutes, 'minute')
          .toDate();
      } else {
        currentDate = new Date(m.startTime * 1000);
      }
    }
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();

    // Stop repeat date selector
    let stopDate = moment(currentDate).add(1, 'day').toDate();
    if (m) {
      if (m.maintenanceType > 0) {
        stopDate = new Date(m.activeTill * 1000);
      } else {
        stopDate = new Date(m.endTime * 1000);
      }
    }
    const stopYear = stopDate.getFullYear();
    const stopMonth = stopDate.getMonth() + 1;
    const stopDay = stopDate.getDate();

    // Set strict end time selector
    const duration = m ? m.duration : 3600;
    let strictEndTimeDate = moment(currentDate).add(duration, 'second').toDate();

    const strictEndTimeHours = strictEndTimeDate.getHours();
    const strictEndTimeMinutes = strictEndTimeDate.getMinutes();
    const strictEndTimeYear = strictEndTimeDate.getFullYear();
    const strictEndTimeMonth = strictEndTimeDate.getMonth() + 1;
    const strictEndTimeDay = strictEndTimeDate.getDate();

    // Check if selected maintenances duration is one of the presets
    let strictEndTimeSelected = false;
    if (!this.durationInput.options.some((item) => item.value === duration)) {
      strictEndTimeSelected = true;
    }

    return {
      yearInput: currentYear,
      monthInput: currentMonth,
      dayInput: currentDay,
      hourInput: currentHours,
      minuteInput: currentMinutes,
      yearStopInput: stopYear,
      monthStopInput: stopMonth,
      dayStopInput: stopDay,
      strictEndYearInput: strictEndTimeYear,
      strictEndMonthInput: strictEndTimeMonth,
      strictEndDayInput: strictEndTimeDay,
      strictEndHourInput: strictEndTimeHours,
      strictEndMinuteInput: strictEndTimeMinutes,
      strictEndTimeSelected: strictEndTimeSelected,
      durationInput: duration,
    };
  }

  /* TBD
  handleFormChange = () => {
    this.setState({ preview: null }, () => {
      this.updatePreview();

      const currentDate = new Date(
        this.state.yearInput,
        this.state.monthInput - 1,
        this.state.dayInput,
        this.state.hourInput,
        this.state.minuteInput
      );

      const currentStrictDate = new Date(
        this.state.strictEndYearInput,
        this.state.strictEndMonthInput - 1,
        this.state.strictEndDayInput,
        this.state.strictEndHourInput,
        this.state.strictEndMinuteInput
      );

      // Adjust end time if strict end time is not selected or strict time is less than
      // current date
      if (this.state.strictEndTimeSelected === false || currentStrictDate < currentDate) {
        const strictEndTimeDate = moment(currentDate).add(1, 'hours').toDate();

        this.onStrictEndMinuteValueChanged(strictEndTimeDate.getMinutes());
        this.onStrictEndHourValueChanged(strictEndTimeDate.getHours());
        this.onStrictEndDayValueChanged(strictEndTimeDate.getDate());
        this.onStrictEndMonthValueChanged(strictEndTimeDate.getMonth() + 1);
        this.onStrictEndYearValueChanged(strictEndTimeDate.getFullYear());

        this.setStrictEndTimeDate(strictEndTimeDate);
      }
    });
  }; **/

  // Analyze the configured dates and generate top-10 list of upcoming maintenances to the state
  getMaintanenceDatesPreview = () => {
    const { maintenanceType } = this.state;

    const startDate = new Date(
      this.state.yearInput,
      this.state.monthInput - 1,
      this.state.dayInput,
      this.state.hourInput,
      this.state.minuteInput
    );

    const stopDate = moment(
      new Date(this.state.yearStopInput, this.state.monthStopInput - 1, this.state.dayStopInput, 0, 0)
    )
      .endOf('day')
      .toDate();

    const duration = this.state.strictEndTimeSelected ? this.getStrictEndTimeDuration() : this.state.durationInput;
    const stopDateTime = moment(startDate).add(duration, 'second').toDate();
    const diffDays = moment(stopDate).diff(startDate, 'days');
    const diffWeeks = moment(stopDate).diff(startDate, 'weeks');

    let dates: any = [];

    if (maintenanceType === MaintenanceType.Daily) {
      for (let i = 0; i < diffDays + 1; i++) {
        // Only allow days that are every [N] days
        if (i % this.state.everyNDays === 0) {
          let date = moment(startDate).add(i, 'day').toDate();

          // Check that dates are after start date and before stop date
          if (
            moment(date).isAfter(moment(startDate).subtract(1, 'days')) &&
            moment(date).isBefore(moment(stopDate).add(1, 'days'))
          ) {
            dates.push({
              startTime: moment(date).unix(),
              endTime: moment(date).add(duration, 'second').unix(),
              new: true,
            });
          }
        }
      }
    } else if (maintenanceType === MaintenanceType.Weekly) {
      for (let i = 0; i < diffWeeks + 1; i++) {
        // Only allow days that are every [N] weeks
        if (i % this.state.everyNWeeks === 0) {
          // Get weekdays as weekday name as key and included as value
          for (const [key, value] of Object.entries(this.state.weeklyWeekdays)) {
            if (value === true) {
              // Add a week each iteration
              let date = moment(startDate)
                .add(i, 'week')
                .isoWeekday(Object.keys(this.state.weeklyWeekdays).indexOf(key) + 1)
                .toDate();

              if (
                moment(date).isSameOrAfter(moment(startDate)) &&
                moment(date).add(duration, 'second').isBefore(moment(stopDate))
              ) {
                dates.push({
                  startTime: moment(date).unix(),
                  endTime: moment(date).add(duration, 'second').unix(),
                  new: true,
                });
              }
            }
          }
        }
      }
    } else if (maintenanceType === MaintenanceType.Monthly) {
      if (this.state.dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Month) {
        // Start with looping though months with difference between months as stop
        // condition adding the amount of months to it
        for (let i = moment(startDate).month(); i < moment(startDate).month() + moment(stopDate).month(); i++) {
          // Make a new object and remove "all" entry
          let months: any = {};
          Object.assign(months, this.state.months);
          delete months['all'];

          // Loop through month entries...
          for (const [month, includeMonth] of Object.entries(months)) {
            // ...and see if month is included
            if (Object.keys(months).indexOf(month) === i && includeMonth === true) {
              let date = moment(startDate).date(this.state.dayOfMonth).month(i).toDate();

              if (
                moment(date).isAfter(moment(startDate)) &&
                moment(date).isAfter() &&
                moment(date).add(duration, 'second').isBefore(moment(stopDate))
              ) {
                dates.push({
                  startTime: moment(date).unix(),
                  endTime: moment(date).add(duration, 'second').unix(),
                  new: true,
                });
              }
            }
          }
        }
      } else if (this.state.dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Week) {
        // Start with looping though months with difference between months as stop
        // condition adding the amount of months to it
        for (let i = moment(startDate).month(); i < moment(startDate).month() + moment(stopDate).month(); i++) {
          // Make a new object and remove "all" entry
          const months: any = {};
          Object.assign(months, this.state.months);
          delete months['all'];

          // Loop through month entries...
          for (const [month, includeMonth] of Object.entries(months)) {
            // ...and see if month is included
            if (Object.keys(months).indexOf(month) === i && includeMonth === true) {
              // Loop through days in current month
              for (let j = 0; j < moment(startDate).add(i, 'months').daysInMonth(); j++) {
                // Check if week is included and if weekday is included in the form
                // and that date is between start and stop date
                if (
                  this.state.everyDayOfWeekInput === Math.ceil(j / 7) &&
                  this.state.monthlyWeekdays[
                    moment(startDate).month(i).date(j).format('dddd').toString().toLowerCase() as keyof WeekdaySelection
                  ] === true &&
                  moment(startDate).month(i).date(j).isAfter() &&
                  moment(startDate).month(i).date(j).isAfter(moment(startDate)) &&
                  moment(startDate).month(i).date(j).add(duration, 'second').isBefore(moment(stopDate))
                ) {
                  dates.push({
                    startTime: moment(startDate).month(i).date(j).unix(),
                    endTime: moment(startDate).month(i).date(j).add(duration, 'second').unix(),
                    new: true,
                  });
                }
              }
            }
          }
        }
      }
    } else {
      dates.push({
        startTime: moment(startDate).unix(),
        endTime: moment(stopDateTime).unix(),
        new: true,
      });
    }

    return dates;

    // TODO: Enable list of current maintenances
    /*
    let fullDatesList = this.props.allMaintenances.concat(dates);

    fullDatesList.sort(function (a, b) {
      let keyA = a.startTime,
        keyB = b.startTime;

      if (keyA < keyB) {
        return -1;
      }

      if (keyA > keyB) {
        return 1;
      }

      return 0;
    });

    this.setState({ preview: fullDatesList });
    */
  };

  setStrictEndTimeDate = (strictEndTimeDate: Date) => {
    const strictEndTimeHours = strictEndTimeDate.getHours();
    const strictEndTimeMinutes = strictEndTimeDate.getMinutes();
    const strictEndTimeYear = strictEndTimeDate.getFullYear();
    const strictEndTimeMonth = strictEndTimeDate.getMonth() + 1;
    const strictEndTimeDay = strictEndTimeDate.getDate();
    this.setState({
      strictEndYearInput: strictEndTimeYear,
      strictEndMonthInput: strictEndTimeMonth,
      strictEndDayInput: strictEndTimeDay,
      strictEndHourInput: strictEndTimeHours,
      strictEndMinuteInput: strictEndTimeMinutes,
    });
  };

  /**
   * Save changes (either creating a new maintenance or editing an old one)
   */
  onSaveChanges = () => {
    const maintenanceType = this.state.maintenanceType;
    const options: any = {};
    if (maintenanceType === MaintenanceType.Daily) {
      options.every = this.state.everyNDays;
    } else if (maintenanceType === MaintenanceType.Weekly) {
      options.every = this.state.everyNWeeks;
      let dayOfWeekBinary = '';
      (Object.keys(this.state.weeklyWeekdays) as Array<keyof WeekdaySelection>).map((weekday) => {
        if (this.state.weeklyWeekdays[weekday]) {
          dayOfWeekBinary = '1' + dayOfWeekBinary;
        } else {
          dayOfWeekBinary = '0' + dayOfWeekBinary;
        }
      });
      options.dayofweek = parseInt(dayOfWeekBinary, 2);
    } else if (maintenanceType === MaintenanceType.Monthly) {
      // Monthly maintenance
      let monthBinary = '';
      (Object.keys(this.state.months) as Array<keyof MonthSelection>).map((month) => {
        if (this.state.months[month] && month !== 'all') {
          monthBinary = '1' + monthBinary;
        } else {
          monthBinary = '0' + monthBinary;
        }
      });
      options.month = parseInt(monthBinary, 2);
      if (this.state.dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Month) {
        options.day = this.state.dayOfMonth;
      } else if (this.state.dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Week) {
        options.every = this.state.everyDayOfWeekInput;
        let dayOfWeekBinary = '';
        (Object.keys(this.state.monthlyWeekdays) as Array<keyof WeekdaySelection>).map((weekday) => {
          if (this.state.monthlyWeekdays[weekday]) {
            dayOfWeekBinary = '1' + dayOfWeekBinary;
          } else {
            dayOfWeekBinary = '0' + dayOfWeekBinary;
          }
        });
        options.dayofweek = parseInt(dayOfWeekBinary, 2);
      }
    }
    const startDate = new Date(
      this.state.yearInput,
      this.state.monthInput - 1,
      this.state.dayInput,
      this.state.hourInput,
      this.state.minuteInput
    );
    let stopDate = new Date(this.state.yearStopInput, this.state.monthStopInput - 1, this.state.dayStopInput);
    stopDate = moment(stopDate).endOf('day').toDate();
    if (
      maintenanceType === MaintenanceType.Daily ||
      maintenanceType === MaintenanceType.Weekly ||
      maintenanceType === MaintenanceType.Monthly
    ) {
      options.start_time = moment.utc(startDate).hour() * 60 * 60 + moment.utc(startDate).minute() * 60;
    }
    const hostIds: number[] = this.state.selectedHosts.filter((host) => host.selected).map((host) => host.value);
    const maintenanceName = (this.state.description || '') + '|' + this.props.user + '|' + this.getCurrentTimeEpoch();
    const duration = this.state.strictEndTimeSelected ? this.getStrictEndTimeDuration() : this.state.durationInput;
    this.props.onCreateOrUpdateMaintenance(
      maintenanceType,
      maintenanceName,
      duration,
      hostIds,
      options,
      startDate,
      stopDate,
      this.props.selectedMaintenance ? this.props.selectedMaintenance.id : undefined
    );
    this.onDismiss();
  };

  onDismiss = () => {
    this.props.onDismiss();
  };

  /**
   * Callback for select value changed
   */
  onDurationValueChanged = (value: number) => {
    this.setState({ durationInput: value });
    if (value > 0) {
      this.onHourValueChanged(); // WHY ???
    }
  };

  // Year options for dropdown
  getYearOptions = (selectedYear: number) => {
    var years: Options[] = [];
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i < currentYear + 2; i++) {
      years.push({
        text: '' + i,
        value: i,
      });
    }
    if (!years.some((option) => option.value === selectedYear)) {
      years.push({
        text: '' + selectedYear,
        value: selectedYear,
      });
    }
    return years;
  };

  // Month options for dropdown
  getMonthOptions = () => {
    var months: Options[] = [];
    for (let i = 1; i < 13; i++) {
      months.push({
        text: '' + i,
        value: i,
      });
    }
    return months;
  };

  // Day options for dropdown
  getDayOptions = (y: number, m: number) => {
    var days: Options[] = [];
    var maxAmount = this.getMaxDay(y, m);
    for (let i = 1; i <= maxAmount; i++) {
      days.push({
        text: '' + i,
        value: i,
      });
    }
    return days;
  };

  // Get maximum day value of the given year and month
  getMaxDay(y: number, m: number) {
    let maxAmount = 0;
    if (m === 1 || m === 3 || m === 5 || m === 7 || m === 8 || m === 10 || m === 12) {
      maxAmount = 31;
    } else if (m === 4 || m === 6 || m === 9 || m === 11) {
      maxAmount = 30;
    } else {
      maxAmount = 28;
    }
    if (((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) && m === 2) {
      maxAmount = 29;
    }
    return maxAmount;
  }

  // Hour options for dropdown
  getHourOptions = () => {
    var hours: Options[] = [];
    for (let i = 0; i < 24; i++) {
      hours.push({
        text: '' + i,
        value: i,
      });
    }
    return hours;
  };

  // Minute options for downdown
  getMinuteOptions = () => {
    var minutes: Options[] = [];
    for (let i = 0; i < 60; i++) {
      minutes.push({
        text: '' + i,
        value: i,
      });
    }
    return minutes;
  };

  getStrictEndTimeDate = () => {
    return new Date(
      this.state.strictEndYearInput,
      this.state.strictEndMonthInput - 1,
      this.state.strictEndDayInput,
      this.state.strictEndHourInput,
      this.state.strictEndMinuteInput
    );
  };

  /**
   * Count maintenance duration if strict end time is selected
   */
  getStrictEndTimeDuration = () => {
    const startDate = new Date(
      this.state.yearInput,
      this.state.monthInput - 1,
      this.state.dayInput,
      this.state.hourInput,
      this.state.minuteInput
    );
    const stopDate = this.getStrictEndTimeDate();
    const duration = Math.round((stopDate.getTime() - startDate.getTime()) / 1000);
    return duration;
  };

  onDayValueChanged = (value: number) => {
    this.setState({ dayInput: value, dayStopInput: value });
    // Adjust end time if strict end time is not selected
    if (this.state.strictEndTimeSelected === false) {
      this.setState({ strictEndDayInput: value });
    }
  };

  onHourValueChanged = (value?: number) => {
    if (value || value === 0) {
      this.setState({ hourInput: value });
    }
    // Adjust end time if strict end time is not selected
    if (this.state.strictEndTimeSelected === false) {
      const currentDate = new Date(
        this.state.yearInput,
        this.state.monthInput - 1,
        this.state.dayInput,
        this.state.hourInput,
        this.state.minuteInput
      );
      let strictEndTimeDate = moment(currentDate).add(this.state.durationInput, 'second').toDate();
      this.setStrictEndTimeDate(strictEndTimeDate);
    }
  };

  onMinuteValueChanged = (value: number) => {
    this.setState({ minuteInput: value });

    // Adjust end time if strict end time is not selected
    if (this.state.strictEndTimeSelected === false) {
      this.setState({ strictEndMinuteInput: value });
    }
  };

  /**
   * Callback for select month
   */
  onMonthValueChanged = (value: number) => {
    this.setState({ monthInput: value, monthStopInput: value });

    // Day options vary per month
    var maxDay = this.getMaxDay(this.state.yearInput, this.state.monthInput);
    if (this.state.dayInput > maxDay) {
      this.setState({ dayInput: maxDay });
    }
    maxDay = this.getMaxDay(this.state.yearStopInput, this.state.monthStopInput);
    if (this.state.dayStopInput > maxDay) {
      this.setState({ dayStopInput: maxDay });
    }

    // Adjust end time if strict end time is not selected
    if (this.state.strictEndTimeSelected === false) {
      this.setState({ strictEndMonthInput: value });

      maxDay = this.getMaxDay(this.state.strictEndYearInput, this.state.strictEndMonthInput);
      if (this.state.strictEndDayInput > maxDay) {
        this.setState({ strictEndDayInput: maxDay });
      }
    }
  };

  /**
   * Callback for select year
   */
  onYearValueChanged = (value: number) => {
    this.setState({ yearInput: value, yearStopInput: value });

    // Day options vary per year
    var maxDay = this.getMaxDay(this.state.yearInput, this.state.monthInput);
    if (this.state.dayInput > maxDay) {
      this.setState({ dayInput: maxDay });
    }
    maxDay = this.getMaxDay(this.state.yearStopInput, this.state.monthStopInput);
    if (this.state.dayStopInput > maxDay) {
      this.setState({ dayStopInput: maxDay });
    }

    // Adjust end time if strict end time is not selected
    if (this.state.strictEndTimeSelected === false) {
      this.setState({ strictEndYearInput: value });

      maxDay = this.getMaxDay(this.state.strictEndYearInput, this.state.strictEndMonthInput);
      if (this.state.strictEndDayInput > maxDay) {
        this.setState({ strictEndDayInput: maxDay });
      }
    }
  };

  onDayStopValueChanged = (value: number) => {
    this.setState({ dayStopInput: value });
  };

  /**
   * Callback for select month
   */
  onMonthStopValueChanged = (value: number) => {
    this.setState({ monthStopInput: value });

    var maxDay = this.getMaxDay(this.state.yearStopInput, this.state.monthStopInput);
    if (this.state.dayStopInput > maxDay) {
      this.setState({ dayStopInput: maxDay });
    }
  };

  /**
   * Callback for select year
   */
  onYearStopValueChanged = (value: number) => {
    this.setState({ yearStopInput: value });

    var maxDay = this.getMaxDay(this.state.yearStopInput, this.state.monthStopInput);
    if (this.state.dayStopInput > maxDay) {
      this.setState({ dayStopInput: maxDay });
    }
  };

  onStrictEndDayToggle = (value: boolean) => {
    const currentDate = new Date(
      this.state.yearInput,
      this.state.monthInput,
      this.state.dayInput,
      this.state.hourInput,
      this.state.minuteInput
    );

    const strictEndTimeDate = moment(currentDate).add(1, 'hours').toDate();

    this.onStrictEndMinuteValueChanged(strictEndTimeDate.getMinutes());
    this.onStrictEndHourValueChanged(strictEndTimeDate.getHours());
    this.onStrictEndDayValueChanged(strictEndTimeDate.getDate());
    this.onStrictEndMonthValueChanged(strictEndTimeDate.getMonth());
    this.onStrictEndYearValueChanged(strictEndTimeDate.getFullYear());

    this.setState({ strictEndTimeSelected: value });
  };

  onStrictEndMinuteValueChanged = (value: number) => {
    this.setState({ strictEndMinuteInput: value });
  };

  onStrictEndHourValueChanged = (value: number) => {
    this.setState({ strictEndHourInput: value });
  };

  onStrictEndDayValueChanged = (value: number) => {
    this.setState({ strictEndDayInput: value });
  };

  /**
   * Callback for select strict end month
   */
  onStrictEndMonthValueChanged = (value: number) => {
    this.setState({ strictEndMonthInput: value });

    var maxDay = this.getMaxDay(this.state.strictEndYearInput, this.state.strictEndMonthInput);
    if (this.state.strictEndDayInput > maxDay) {
      this.setState({ strictEndDayInput: maxDay });
    }
  };

  /**
   * Callback for select strict year
   */
  onStrictEndYearValueChanged = (value: number) => {
    this.setState({ strictEndYearInput: value });

    var maxDay = this.getMaxDay(this.state.strictEndYearInput, this.state.strictEndMonthInput);
    if (this.state.strictEndDayInput > maxDay) {
      this.setState({ strictEndDayInput: maxDay });
    }
  };

  /**
   * Callback for selecting all hosts
   */
  selectAllHosts = (allSelected: boolean) => {
    const selectedHosts = [...this.state.selectedHosts];
    selectedHosts.forEach((host) => {
      host.selected = allSelected;
    });
    this.setState({ allHostsSelected: allSelected, selectedHosts });
  };

  /**
   * Callback for selecting host
   */
  selectHost = (id: number, checked: boolean) => {
    const selectedHosts = [...this.state.selectedHosts];
    const index = selectedHosts.findIndex((host) => host.value === id);
    if (index > -1) {
      selectedHosts[index].selected = checked;
    }
    const allHostsSelected = !selectedHosts.some((item) => !item.selected);
    this.setState({ selectedHosts, allHostsSelected });
  };

  /**
   * Callback for selecting a month; check if all are selected
   */
  toggleMonthSelection = (month: keyof MonthSelection, selected: boolean) => {
    const months = { ...this.state.months };
    months[month] = selected;
    let allSelected = true;
    (Object.keys(months) as Array<keyof MonthSelection>).map((monthName) => {
      if (!months[monthName] && monthName !== 'all') {
        allSelected = false;
      }
    });
    months.all = allSelected;
    this.setState({ months });
  };

  /**
   * Callback for toggling all months on/off
   */
  toggleAllMonthsSelection = (selected: boolean) => {
    const months = { ...this.state.months };
    (Object.keys(months) as Array<keyof MonthSelection>).map((month) => {
      if (selected) {
        months[month] = true;
      } else {
        months[month] = false;
      }
    });
    this.setState({ months });
  };

  /**
   * Callback for changing maintenance
   */
  onMaintenanceTypeChanged = (value: MaintenanceType) => {
    this.setState({ maintenanceType: value });
  };

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
      let someWeekdaySelected = false;
      (Object.keys(this.state.weeklyWeekdays) as Array<keyof WeekdaySelection>).map((weekday) => {
        if (this.state.weeklyWeekdays[weekday]) {
          someWeekdaySelected = true;
        }
      });
      if (!someWeekdaySelected) {
        return this.texts.oneWeekdayMustBeChosen;
      }
    } else if (maintenanceType === MaintenanceType.Monthly) {
      let someMonthSelected = false;
      (Object.keys(this.state.months) as Array<keyof MonthSelection>).map((month) => {
        if (this.state.months[month]) {
          someMonthSelected = true;
        }
      });
      if (!someMonthSelected) {
        return this.texts.oneMonthMustBeChosen;
      }
      if (this.state.dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Month) {
        if (!this.state.dayOfMonth || !/^[0-9]*$/.test(this.state.dayOfMonth + '')) {
          return this.texts.monthFieldMustContainInteger;
        }
      } else if (this.state.dayOfMonthOrWeekSelected === MonthlyDayPeriodSelection.Week) {
        let someWeekdaySelected = false;
        (Object.keys(this.state.monthlyWeekdays) as Array<keyof WeekdaySelection>).map((weekday) => {
          if (this.state.monthlyWeekdays[weekday]) {
            someWeekdaySelected = true;
          }
        });
        if (!someWeekdaySelected) {
          return this.texts.oneWeekdayMustBeChosen;
        }
      }
    }
    const startDate = new Date(
      this.state.yearInput,
      this.state.monthInput - 1,
      this.state.dayInput,
      this.state.hourInput,
      this.state.minuteInput
    );
    const stopPeriodDate = moment(
      new Date(this.state.yearStopInput, this.state.monthStopInput - 1, this.state.dayStopInput)
    )
      .endOf('day')
      .toDate();
    const currentDate = new Date();
    const duration = this.state.strictEndTimeSelected ? this.getStrictEndTimeDuration() : this.state.durationInput;
    const stopDateTime = moment(startDate).add(duration, 'second').toDate();

    // Periodical maintenance
    if (
      maintenanceType === MaintenanceType.Daily ||
      maintenanceType === MaintenanceType.Weekly ||
      maintenanceType === MaintenanceType.Monthly
    ) {
      if (stopPeriodDate <= startDate) {
        return this.texts.repeatMustEndAfterStartTime;
      } else if (stopPeriodDate < currentDate) {
        return this.texts.repeatEndTimeCantBeInPast;
      } else if (this.state.strictEndTimeSelected && this.getStrictEndTimeDuration() <= 0) {
        return this.texts.maintenanceEndMustBeAfterStart;
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
      if (moment(stopPeriodDate).valueOf() > nextChange.valueOf()) {
        return this.texts.repeatEndTimeCantOverlapDaylight + ' ' + nextChange.format('DD.MM.YYYY HH:mm');
      }
    }
    if (
      maintenanceType === MaintenanceType.OneTime &&
      this.state.strictEndTimeSelected &&
      this.getStrictEndTimeDuration() <= 0
    ) {
      return this.texts.maintenanceEndMustBeAfterStart;
    }
    if (maintenanceType === MaintenanceType.OneTime && stopDateTime < currentDate) {
      return this.texts.maintenanceEndCantBeInPast;
    }
    return null;
  }

  // Check the validity of wizard phase 2 configuration;
  // returns error text or null if there are no errors
  checkWizardPhase2Errors(): string | null {
    let anyHostSelected = false;
    this.state.selectedHosts.forEach((option) => {
      if (option.selected) {
        anyHostSelected = true;
      }
    });
    const maintenanceName = (this.state.description || '') + '|' + this.props.user + '|' + this.getCurrentTimeEpoch();
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
      summaryData.displayStartDate = moment(
        new Date(
          this.state.yearInput,
          this.state.monthInput - 1,
          this.state.dayInput,
          this.state.hourInput,
          this.state.minuteInput
        )
      ).format('DD.MM.YYYY HH:mm');
      summaryData.displayStopDate = moment(this.getStrictEndTimeDate()).format('DD.MM.YYYY HH:mm');
    } else {
      // Repeat start and end dates don't have hours or minutes
      summaryData.displayRepeatStartDate = moment(
        new Date(this.state.yearInput, this.state.monthInput - 1, this.state.dayStopInput)
      ).format('DD.MM.YYYY');
      summaryData.displayRepeatStopDate = moment(
        new Date(this.state.yearStopInput, this.state.monthStopInput - 1, this.state.dayStopInput)
      ).format('DD.MM.YYYY');

      // Show time (without date) when the repeating maintenance starts
      var hourWithLeadingZeros = '00' + this.state.hourInput;
      var minutesWithLeadingZeros = '00' + this.state.minuteInput;
      summaryData.displayStartDate =
        hourWithLeadingZeros.substring(hourWithLeadingZeros.length - 2) +
        ':' +
        minutesWithLeadingZeros.substring(minutesWithLeadingZeros.length - 2);

      // Show time (without date) when the repeating maintenance ends
      if (this.state.strictEndTimeSelected) {
        // User has selected strict hour and minute
        hourWithLeadingZeros = '00' + this.state.strictEndHourInput;
        minutesWithLeadingZeros = '00' + this.state.strictEndMinuteInput;
        summaryData.displayStopDate =
          hourWithLeadingZeros.substring(hourWithLeadingZeros.length - 2) +
          ':' +
          minutesWithLeadingZeros.substring(minutesWithLeadingZeros.length - 2);
      } else {
        // User has selected duration; use moment to calculate hour and minute
        // The date used in this calculation is quite absurd (start date of the repeat period)
        const currentDate = new Date(
          this.state.yearInput,
          this.state.monthInput - 1,
          this.state.dayInput,
          this.state.hourInput,
          this.state.minuteInput
        );
        let endTimeDate = moment(currentDate).add(this.state.durationInput, 'second');
        summaryData.displayStopDate = endTimeDate.format('HH:mm');
      }
    }

    summaryData.displayHosts = '';
    this.state.selectedHosts.forEach((host) => {
      if (host.selected) {
        if (summaryData.displayHosts) {
          summaryData.displayHosts += ', ';
        }
        summaryData.displayHosts += host.text;
      }
    });
    summaryData.displayWeeklyDays = '';
    (Object.keys(this.state.weeklyWeekdays) as Array<keyof WeekdayNames>).forEach((weekday) => {
      if (this.state.weeklyWeekdays[weekday]) {
        if (summaryData.displayWeeklyDays) {
          summaryData.displayWeeklyDays += ', ';
        }
        summaryData.displayWeeklyDays += this.weekdayNames[weekday];
      }
    });
    summaryData.displayMonths = '';
    (Object.keys(this.state.months) as Array<keyof MonthNames>).forEach((month) => {
      if (this.state.months[month]) {
        if (summaryData.displayMonths) {
          summaryData.displayMonths += ', ';
        }
        summaryData.displayMonths += this.monthNames[month];
      }
    });
    const everyDayOfWeekInputOption = this.everyDayOfWeekInputOptions.find(
      (option) => option.value === this.state.everyDayOfWeekInput
    );
    summaryData.displayMonthlyWeekdayNumber = everyDayOfWeekInputOption ? everyDayOfWeekInputOption.label : '';
    summaryData.displayMonthlyWeekdayNames = '';
    (Object.keys(this.state.monthlyWeekdays) as Array<keyof WeekdayNames>).forEach((weekday) => {
      if (this.state.monthlyWeekdays[weekday]) {
        if (summaryData.displayMonthlyWeekdayNames) {
          summaryData.displayMonthlyWeekdayNames += ', ';
        }
        summaryData.displayMonthlyWeekdayNames += this.weekdayNames[weekday];
      }
    });
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
              {(Object.keys(this.state.weeklyWeekdays) as Array<keyof WeekdayNames>).map((day) => (
                <div className="checkbox-container" key={day}>
                  <input
                    className="action-panel-cb"
                    type="checkbox"
                    checked={this.state.weeklyWeekdays[day]}
                    onChange={(e) =>
                      this.setState({ weeklyWeekdays: { ...this.state.weeklyWeekdays, [day]: e.target.checked } })
                    }
                    id={day}
                  />
                  <label className="gf-form-label checkbox-label" htmlFor={day}>
                    {this.weekdayNames[day]}
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
                  {(Object.keys(this.state.months) as Array<keyof MonthNames>).slice(index, index + 3).map((month) => (
                    <div className="checkbox-container" key={month}>
                      <input
                        className="action-panel-cb"
                        type="checkbox"
                        checked={this.state.months[month]}
                        onChange={(e) => this.toggleMonthSelection(month, e.target.checked)}
                        id={month}
                      />
                      <label className="gf-form-label checkbox-label" htmlFor={month}>
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
                    checked={this.state.months.all}
                    id="all"
                    onChange={(e) => this.toggleAllMonthsSelection(e.target.checked)}
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
                      value={this.state.everyDayOfWeekInput}
                      onChange={(e) => this.setState({ everyDayOfWeekInput: parseInt(e.target.value, 10) })}
                    >
                      {this.everyDayOfWeekInputOptions.map((option) => (
                        <option value={option.value} key={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="checkbox-block checkbox-top-spacer">
                    {(Object.keys(this.state.monthlyWeekdays) as Array<keyof WeekdayNames>).map((day) => (
                      <div className="checkbox-container" key={'w' + day}>
                        <input
                          className="action-panel-cb"
                          type="checkbox"
                          checked={this.state.monthlyWeekdays[day]}
                          onChange={(e) =>
                            this.setState({
                              monthlyWeekdays: { ...this.state.monthlyWeekdays, [day]: e.target.checked },
                            })
                          }
                          id={'w' + day}
                        />
                        <label className="gf-form-label checkbox-label" htmlFor={'w' + day}>
                          {this.weekdayNames[day]}
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
                value={this.state.dayInput}
                onChange={(e) => this.onDayValueChanged(parseInt(e.target.value, 10))}
              >
                {this.getDayOptions(this.state.yearInput, this.state.monthInput).map((option) => (
                  <option value={option.value} key={'d' + option.value}>
                    {option.text}
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
                value={this.state.monthInput}
                onChange={(e) => this.onMonthValueChanged(parseInt(e.target.value, 10))}
              >
                {this.getMonthOptions().map((option) => (
                  <option value={option.value} key={'m' + option.value}>
                    {option.text}
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
                value={this.state.yearInput}
                onChange={(e) => this.onYearValueChanged(parseInt(e.target.value, 10))}
              >
                {this.getYearOptions(this.state.yearInput).map((option) => (
                  <option value={option.value} key={'y' + option.value}>
                    {option.text}
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
                value={this.state.hourInput}
                onChange={(e) => this.onHourValueChanged(parseInt(e.target.value, 10))}
              >
                {this.getHourOptions().map((option) => (
                  <option value={option.value} key={'h' + option.value}>
                    {option.text}
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
                value={this.state.minuteInput}
                onChange={(e) => this.onMinuteValueChanged(parseInt(e.target.value, 10))}
              >
                {this.getMinuteOptions().map((option) => (
                  <option value={option.value} key={'mi' + option.value}>
                    {option.text}
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
                  value={this.state.dayInput}
                  onChange={(e) => this.onDayValueChanged(parseInt(e.target.value, 10))}
                >
                  {this.getDayOptions(this.state.yearInput, this.state.monthInput).map((option) => (
                    <option value={option.value} key={'d' + option.value}>
                      {option.text}
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
                  value={this.state.monthInput}
                  onChange={(e) => this.onMonthValueChanged(parseInt(e.target.value, 10))}
                >
                  {this.getMonthOptions().map((option) => (
                    <option value={option.value} key={'m' + option.value}>
                      {option.text}
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
                  value={this.state.yearInput}
                  onChange={(e) => this.onYearValueChanged(parseInt(e.target.value, 10))}
                >
                  {this.getYearOptions(this.state.yearInput).map((option) => (
                    <option value={option.value} key={'y' + option.value}>
                      {option.text}
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
                  value={this.state.dayStopInput}
                  onChange={(e) => this.onDayStopValueChanged(parseInt(e.target.value, 10))}
                >
                  {this.getDayOptions(this.state.yearStopInput, this.state.monthStopInput).map((option) => (
                    <option value={option.value} key={'ds' + option.value}>
                      {option.text}
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
                  value={this.state.monthStopInput}
                  onChange={(e) => this.onMonthStopValueChanged(parseInt(e.target.value, 10))}
                >
                  {this.getMonthOptions().map((option) => (
                    <option value={option.value} key={'ms' + option.value}>
                      {option.text}
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
                  value={this.state.yearStopInput}
                  onChange={(e) => this.onYearStopValueChanged(parseInt(e.target.value, 10))}
                >
                  {this.getYearOptions(this.state.yearStopInput).map((option) => (
                    <option value={option.value} key={'ys' + option.value}>
                      {option.text}
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
      // Maintenance duration in hours
      return (
        <>
          <label className="gf-form-label">{this.texts.maintenanceDuration}</label>
          <div className="gf-form-select-wrapper iiris-fixed-width-select">
            <select
              className="gf-form-input"
              value={this.state.durationInput}
              onChange={(e) => this.onDurationValueChanged(parseInt(e.target.value, 10))}
            >
              {this.durationInput.options.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.text}
                </option>
              ))}
            </select>
          </div>
        </>
      );
    }

    // Strict end date & time of the maintenance
    return (
      <>
        <label className="gf-form-label">{this.texts.maintenanceEndTime}</label>
        <div className="date-selection-row">
          <div className="date-selection-container">
            <div>{this.texts.day}</div>
            <div className="gf-form-select-wrapper">
              <select
                className="gf-form-input"
                value={this.state.strictEndDayInput}
                onChange={(e) => this.onStrictEndDayValueChanged(parseInt(e.target.value, 10))}
              >
                {this.getDayOptions(this.state.strictEndYearInput, this.state.strictEndMonthInput).map((option) => (
                  <option value={option.value} key={'sd' + option.value}>
                    {option.text}
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
                value={this.state.strictEndMonthInput}
                onChange={(e) => this.onStrictEndMonthValueChanged(parseInt(e.target.value, 10))}
              >
                {this.getMonthOptions().map((option) => (
                  <option value={option.value} key={'sm' + option.value}>
                    {option.text}
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
                value={this.state.strictEndYearInput}
                onChange={(e) => this.onStrictEndYearValueChanged(parseInt(e.target.value, 10))}
              >
                {this.getYearOptions(this.state.strictEndYearInput).map((option) => (
                  <option value={option.value} key={'sy' + option.value}>
                    {option.text}
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
                value={this.state.strictEndHourInput}
                onChange={(e) => this.onStrictEndHourValueChanged(parseInt(e.target.value, 10))}
              >
                {this.getHourOptions().map((option) => (
                  <option value={option.value} key={'sh' + option.value}>
                    {option.text}
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
                value={this.state.strictEndMinuteInput}
                onChange={(e) => this.onStrictEndMinuteValueChanged(parseInt(e.target.value, 10))}
              >
                {this.getMinuteOptions().map((option) => (
                  <option value={option.value} key={'smi' + option.value}>
                    {option.text}
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
                  value={this.state.hourInput}
                  onChange={(e) => this.onHourValueChanged(parseInt(e.target.value, 10))}
                >
                  {this.getHourOptions().map((option) => (
                    <option value={option.value} key={'h' + option.value}>
                      {option.text}
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
                  value={this.state.minuteInput}
                  onChange={(e) => this.onMinuteValueChanged(parseInt(e.target.value, 10))}
                >
                  {this.getMinuteOptions().map((option) => (
                    <option value={option.value} key={'mi' + option.value}>
                      {option.text}
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
                    value={this.state.durationInput}
                    onChange={(e) => this.onDurationValueChanged(parseInt(e.target.value, 10))}
                  >
                    {this.durationInput.options.map((option) => (
                      <option value={option.value} key={option.value}>
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
                    value={this.state.strictEndHourInput}
                    onChange={(e) => this.onStrictEndHourValueChanged(parseInt(e.target.value, 10))}
                  >
                    {this.getHourOptions().map((option) => (
                      <option value={option.value} key={'sh' + option.value}>
                        {option.text}
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
                    value={this.state.strictEndMinuteInput}
                    onChange={(e) => this.onStrictEndMinuteValueChanged(parseInt(e.target.value, 10))}
                  >
                    {this.getMinuteOptions().map((option) => (
                      <option value={option.value} key={'smi' + option.value}>
                        {option.text}
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
                  onChange={(e) => this.onMaintenanceTypeChanged(parseInt(e.target.value, 10))}
                >
                  {this.mTypeInput.options.map((option) => (
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

            {/* Selection of whether the end time is strictly defined instead of a duration */}
            <div className="gf-form-group maintenance-row-container">
              <div className="iiris-checkbox">
                <input
                  id="strict_end_time"
                  type="checkbox"
                  checked={this.state.strictEndTimeSelected}
                  onChange={(e) => this.onStrictEndDayToggle(e.target.checked)}
                />
                <label className="checkbox-label" htmlFor="strict_end_time">
                  {this.texts.setPreciseEndTime}
                </label>
              </div>
            </div>

            {/* Wizard buttons */}
            <div className="gf-form-button-row">
              <button className="btn btn-secondary" onClick={() => this.props.openAllMaintenancesModal()}>
                {this.texts.back}
              </button>
              <button className="btn btn-secondary" onClick={() => this.onDismiss()}>
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
                        <tr className={dates.new && 'tr-new'}>
                          <td>
                            {moment(dates.startTime * 1000)
                              .locale(contextSrv.storedLanguage)
                              .format('dd DD.MM.YYYY HH:mm')}
                          </td>
                          <td>
                            {moment(dates.endTime * 1000)
                              .locale(contextSrv.storedLanguage)
                              .format('dd DD.MM.YYYY HH:mm')}
                          </td>
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
                checked={this.state.allHostsSelected}
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
                !this.state.searchText || fHost.text.toLowerCase().indexOf(this.state.searchText.toLowerCase()) > -1
            )
            .map((host) => (
              <div className="iiris-checkbox" key={host.value}>
                <input
                  id={'cb' + host.value}
                  type="checkbox"
                  checked={host.selected}
                  onChange={(e) => this.selectHost(host.value, e.target.checked)}
                />
                <label className="checkbox-label" htmlFor={'cb' + host.value}>
                  {host.text}
                </label>
              </div>
            ))}
        </div>

        {/* Wizard buttons */}
        <div className="gf-form-button-row">
          <button className="btn btn-secondary" onClick={(e) => this.goToPrevious()}>
            {this.texts.back}
          </button>
          <button className="btn btn-secondary" onClick={(e) => this.onDismiss()}>
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
            {(this.mTypeInput.options.find((item) => item.value === this.state.maintenanceType) || { label: '' }).label}
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
          <button className="btn btn-secondary" onClick={() => this.onDismiss()}>
            {this.texts.cancel}
          </button>
          <button className="btn btn-primary" onClick={() => this.onSaveChanges()}>
            {this.props.selectedMaintenance ? this.texts.saveChanges : this.texts.createMaintenance}
          </button>
        </div>
      </>
    );
  }

  render() {
    const title = (
      <h2 className="modal-header modal-header-title">
        {this.props.selectedMaintenance ? this.texts.modifyMaintenance : this.texts.createNewMaintenance}
      </h2>
    );

    return (
      <>
        <Modal isOpen={this.props.show} title={title} onDismiss={this.onDismiss} className="modal modal-body">
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
