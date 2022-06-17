/* eslint-disable */
/* tslint:disable */
import React, { PureComponent } from 'react';
import { Modal } from '@grafana/ui';
import _ from 'lodash';
import moment from 'moment'; // eslint-disable-line no-restricted-imports
import { contextSrv } from 'app/core/core';

const WEEK = 'WEEK';
const MONTH = 'MONTH';

interface Props {
  show: boolean;
  onDismiss(): void;
  onCreateMaintenance: any;
  selectedMaintenance?: any;
  openAllMaintenancesModal(): void;
  hosts: any;
  user: string;
}

interface State {
  wizardPhase: number;
  maintenanceType: string;
  everyNDays: number;
  everyNWeeks: number;
  weekdays: any;
  months: any;
  dayOfMonthOrWeekSelected: string;
  dayOfMonth: number;
  monthlyWeekdays: any;
  everyDayOfWeekInput: number;
  dayInput: number;
  monthInput: number;
  yearInput: number;
  hourInput: number;
  minuteInput: number;
  dayStopInput: number;
  monthStopInput: number;
  yearStopInput: number;
  strictEndDayInput: number;
  strictEndMonthInput: number;
  strictEndYearInput: number;
  strictEndHourInput: number;
  strictEndMinuteInput: number;
  strictEndTimeSelected: boolean;
  durationInput: number;
  errorText: string;
  description: string;
  searchText: string;
  allHostsSelected: boolean;
  selectedHosts: any;
}

export class IirisMaintenanceModal extends PureComponent<Props, State> {
  scope: any;
  hosts: any;
  user: any;
  selectedMaintenance: any;
  description: any;
  durationInput: {
    options: any;
    value: number;
    text: string;
    isValid: boolean;
  } | any;
  mTypeInput: {
    options: any;
    value: string;
    text: string;
  } | any;
  yearInput: {
    options: any;
    value: number;
    text: string;
  } | any;
  monthInput: {
    options: any;
    value: number;
    text: string;
  } | any;
  dayInput: {
    options: any;
    value: number;
    text: string;
  } | any;
  hourInput: {
    options: any;
    value: string;
    text: string;
  } | any;
  minuteInput: {
    options: any;
    value: string;
    text: string;
  } | any;
  yearStopInput: {
    options: any;
    value: number;
    text: string;
  } | any;
  monthStopInput: {
    options: any;
    value: number;
    text: string;
  } | any;
  dayStopInput: {
    options: any;
    value: number;
    text: string;
  } | any;
  everyDayOfWeekInput: {
    options: any;
    value: number;
    text: string;
  } | any;
  strictEndHourInput: {
    options: any;
    value: string;
    text: string;
  } | any;
  strictEndMinuteInput: {
    options: any;
    value: string;
    text: string;
  } | any;
  strictEndYearInput: {
    options: any;
    value: number;
    text: string;
  } | any;
  strictEndMonthInput: {
    options: any;
    value: number;
    text: string;
  } | any;
  strictEndDayInput: {
    options: any;
    value: number;
    text: string;
  } | any;
  search: {
    text: string;
  } | any;
  maintenanceType: any;
  displayStartDate: any;
  displayStopDate: any;
  displayRepeatStopDate: any;
  displayHosts: any;
  displayWeeklyDays: any;
  weekdayNames: any;
  monthNames: any;
  displayMonths: any;
  displayMonthlyDays: any;
  displayMonthlyWeekdayNumber: any;
  displayMonthlyWeekdayNames: any;
  selectedHosts: any;
  allHostsSelected = true;
  texts: any;

  constructor(props: Props) {
    super(props);
    this.texts = contextSrv.getLocalizedTexts();
    this.init();
    this.state = {
      wizardPhase: 1,
      maintenanceType: '0',
      everyNDays: 1,
      everyNWeeks: 1,
      weekdays: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      months: {
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
      },
      dayOfMonthOrWeekSelected: MONTH,
      dayOfMonth: 1,
      monthlyWeekdays: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
      everyDayOfWeekInput: 1,
      dayInput: this.dayInput.value,
      monthInput: this.monthInput.value,
      yearInput: this.yearInput.value,
      hourInput: this.hourInput.value,
      minuteInput: this.minuteInput.value,
      dayStopInput: this.dayStopInput.value,
      monthStopInput: this.monthStopInput.value,
      yearStopInput: this.yearStopInput.value,
      strictEndDayInput: this.strictEndDayInput.value,
      strictEndMonthInput: this.strictEndMonthInput.value,
      strictEndYearInput: this.strictEndYearInput.value,
      strictEndHourInput: this.strictEndHourInput.value,
      strictEndMinuteInput: this.strictEndMinuteInput.value,
      strictEndTimeSelected: false,
      durationInput: 3600,
      errorText: '',
      description: '',
      searchText: '',
      allHostsSelected: this.allHostsSelected,
      selectedHosts: this.selectedHosts,
    }
  }

  componentDidUpdate(prevProps: any) {
    if (this.props.show && this.props.show !== prevProps.show) {
      this.selectedMaintenance = this.props.selectedMaintenance;
      this.init();
      this.setState({
        wizardPhase: 1,
        searchText: '',
        errorText: '',
        dayInput: this.dayInput.value,
        monthInput: this.monthInput.value,
        yearInput: this.yearInput.value,
        hourInput: this.hourInput.value,
        minuteInput: this.minuteInput.value,
        dayStopInput: this.dayStopInput.value,
        monthStopInput: this.monthStopInput.value,
        yearStopInput: this.yearStopInput.value,
        strictEndDayInput: this.strictEndDayInput.value,
        strictEndMonthInput: this.strictEndMonthInput.value,
        strictEndYearInput: this.strictEndYearInput.value,
        strictEndHourInput: this.strictEndHourInput.value,
        strictEndMinuteInput: this.strictEndMinuteInput.value,
        strictEndTimeSelected: this.scope.strictEndTimeSelected,
        durationInput: this.durationInput.value,
        description: this.description,
        maintenanceType: this.mTypeInput.value,
        everyNDays: this.scope.everyNDays,
        everyNWeeks: this.scope.everyNWeeks,
        everyDayOfWeekInput: this.everyDayOfWeekInput.value,
        selectedHosts: this.selectedHosts,
        allHostsSelected: this.allHostsSelected,
        monthlyWeekdays: this.scope.monthlyWeekdays,
        dayOfMonth: this.scope.dayOfMonth,
        dayOfMonthOrWeekSelected: this.scope.dayOfMonthOrWeekSelected.value,
        months: this.scope.months,
        weekdays: this.scope.weekdays,
      });
    }
  }

  /**
   * Maintenance Modal class constructor
   */
  init = () => {
    this.scope = {};
    this.scope.hosts = this.hosts;
    this.scope.user = this.user;
    this.scope.selectedMaintenance = this.selectedMaintenance;
    this.scope.wizardPhase = 1;
    this.scope.maintenanceType = 0;
    this.scope.everyNDays = 1;
    this.scope.everyNWeeks = 1;
    this.scope.dayOfMonthOrWeekSelected = {
      value: MONTH,
    };
    this.scope.dayOfMonth = 1;
    this.scope.errorText = '';
    this.scope.strictEndTimeSelected = false;
    this.scope.weekdays = {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    };
    this.scope.months = {
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
    this.scope.monthlyWeekdays = {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    };
    this.durationInput = {
      value: 3600,
      text: '',
      isValid: true,
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
      value: '0',
      text: this.texts.oneTime,
      options: [
        { label: this.texts.oneTime, value: '0' },
        { label: this.texts.daily, value: '2' },
        { label: this.texts.weekly, value: '3' },
        { label: this.texts.monthly, value: '4' },
      ],
    };
    this.maintenanceType = this.mTypeInput.text;
    this.yearInput = {
      value: 0,
      text: '',
      options: [],
    };
    this.monthInput = {
      value: 0,
      text: '',
      options: [],
    };
    this.dayInput = {
      value: 0,
      text: '',
      options: [],
    };
    this.hourInput = {
      value: '',
      text: '',
      options: [],
    };
    this.minuteInput = {
      value: '',
      text: '',
      options: [],
    };
    this.yearStopInput = {
      value: 0,
      text: '',
      options: [],
    };
    this.monthStopInput = {
      value: 0,
      text: '',
      options: [],
    };
    this.dayStopInput = {
      value: 0,
      text: '',
      options: [],
    };
    this.strictEndHourInput = {
      value: '',
      text: '',
      options: [],
    };
    this.strictEndMinuteInput = {
      value: '',
      text: '',
      options: [],
    };
    this.strictEndYearInput = {
      value: 0,
      text: '',
      options: [],
    };
    this.strictEndMonthInput = {
      value: 0,
      text: '',
      options: [],
    };
    this.strictEndDayInput = {
      value: 0,
      text: '',
      options: [],
    };
    this.everyDayOfWeekInput = {
      value: 1,
      text: this.texts.first,
      options: [
        { label: this.texts.first, value: 1 },
        { label: this.texts.second, value: 2 },
        { label: this.texts.third, value: 3 },
        { label: this.texts.fourth, value: 4 },
        { label: this.texts.last, value: 5 },
      ],
    };
    this.search = {
      text: ''
    };
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
    let currentDate = new Date();
    let currentHours = currentDate.getHours();
    let currentMinutes = currentDate.getMinutes();
    if (this.scope.selectedMaintenance) {
      const currentStartTime = new Date(this.scope.selectedMaintenance.startTime * 1000);
      currentHours = currentStartTime.getHours();
      currentMinutes = currentStartTime.getMinutes();
      if (this.scope.selectedMaintenance.maintenanceType > 0) {
        currentDate = moment(this.scope.selectedMaintenance.activeSince * 1000)
          .startOf('day')
          .add(currentHours, 'hour')
          .add(currentMinutes, 'minute')
          .toDate();
      } else {
        currentDate = new Date(this.scope.selectedMaintenance.startTime * 1000);
      }
    }
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();
    this.populateYearSelector(this.yearInput, currentYear);
    this.populateMonthSelector(this.monthInput, currentMonth);
    this.dayInput.value = currentDay;
    this.dayInput.text = '' + currentDay;
    this.populateDaySelector();
    this.populateHourSelector(this.hourInput, currentHours);
    this.populateMinuteSelector(this.minuteInput, currentMinutes);
    // Stop repeat date selector
    let stopDate = moment(currentDate)
      .add(1, 'day')
      .toDate();
    if (this.scope.selectedMaintenance) {
      if (this.scope.selectedMaintenance.maintenanceType > 0) {
        stopDate = new Date(this.scope.selectedMaintenance.activeTill * 1000);
      } else {
        stopDate = new Date(this.scope.selectedMaintenance.endTime * 1000);
      }
    }
    const stopYear = stopDate.getFullYear();
    const stopMonth = stopDate.getMonth() + 1;
    const stopDay = stopDate.getDate();
    this.populateYearSelector(this.yearStopInput, stopYear);
    this.populateMonthSelector(this.monthStopInput, stopMonth);
    this.dayStopInput.value = stopDay;
    this.dayStopInput.text = '' + stopDay;
    this.populateDaySelector(true);
    // Set strict end time selector
    const duration = this.scope.selectedMaintenance ? this.scope.selectedMaintenance.duration : this.durationInput.value;
    let strictEndTimeDate = moment(currentDate)
      .add(duration, 'second')
      .toDate();
    this.setStrictEndTimeDate(strictEndTimeDate);
    this.selectedHosts = this.props.hosts.map((host: any) => ({ ...host, selected: true }));
    this.allHostsSelected = true;
    this.description = '';
    // Populate form with preselected maintenance values
    if (this.scope.selectedMaintenance) {
      const m = this.scope.selectedMaintenance;
      this.description = m.description;
      const typeObj =
        this.mTypeInput.options.find((item: any) => item.value === m.maintenanceType + '') ||
        this.mTypeInput.options[0];
      this.mTypeInput.value = typeObj.value;
      this.mTypeInput.text = typeObj.text;
      // Check if selected maintenances duration is one of the presets
      let durObj = this.durationInput.options.find((item: any) => item.value === m.duration);
      if (durObj) {
        this.durationInput.value = durObj.value;
        this.durationInput.text = durObj.text;
      } else {
        this.scope.strictEndTimeSelected = true;
      }
      if (m.maintenanceType === 2) {
        this.scope.everyNDays = m.every;
      } else if (m.maintenanceType === 3) {
        this.scope.everyNWeeks = m.every;
        // Turn dayOfWeek number to binary and then to array to get active days
        const days = parseInt(m.dayOfWeek, 10)
          .toString(2)
          .split('')
          .reverse();
        for (let i = 0; i < days.length; i++) {
          if (days[i] === '1') {
            const dayTitles = Object.keys(this.scope.weekdays);
            this.scope.weekdays[dayTitles[i]] = true;
          }
        }
      } else if (m.maintenanceType === 4) {
        // Turn month number to binary and then to array to get active days
        const months = parseInt(m.month, 10)
          .toString(2)
          .split('')
          .reverse();
        let monthAmount = 0;
        for (let i = 0; i < months.length; i++) {
          if (months[i] === '1') {
            const monthTitles = Object.keys(this.scope.months);
            this.scope.months[monthTitles[i]] = true;
            monthAmount++;
          }
        }
        if (monthAmount === 12) {
          this.scope.months.all = true;
        }
        if (m.day) {
          this.scope.dayOfMonth = m.day;
          this.scope.dayOfMonthOrWeekSelected.value = MONTH;
        } else {
          this.scope.dayOfMonthOrWeekSelected.value = WEEK;
          const dayObj =
            this.everyDayOfWeekInput.options.find((item: any) => item.value === m.every) ||
            this.everyDayOfWeekInput.options[0];
          this.everyDayOfWeekInput.value = dayObj.value;
          this.everyDayOfWeekInput.text = dayObj.text;
          const days = parseInt(m.dayOfWeek, 10)
            .toString(2)
            .split('')
            .reverse();
          for (let i = 0; i < days.length; i++) {
            if (days[i] === '1') {
              const dayTitles = Object.keys(this.scope.monthlyWeekdays);
              this.scope.monthlyWeekdays[dayTitles[i]] = true;
            }
          }
        }
      }
      // Set host selection based on selected maintenance
      const maintenanceHostIds: string[] = this.scope.selectedMaintenance.hosts.map((host: any) => host.hostid);
      this.selectedHosts.map((option: any, index: number) => {
        if (maintenanceHostIds.indexOf(option.value) === -1) {
          this.selectedHosts[index].selected = false;
          this.allHostsSelected = false;
        } else {
          this.selectedHosts[index].selected = true;
        }
      });
    }
  }

  setStrictEndTimeDate = (strictEndTimeDate: Date) => {
    const strictEndTimeHours = strictEndTimeDate.getHours();
    const strictEndTimeMinutes = strictEndTimeDate.getMinutes();
    const strictEndTimeYear = strictEndTimeDate.getFullYear();
    const strictEndTimeMonth = strictEndTimeDate.getMonth() + 1;
    const strictEndTimeDay = strictEndTimeDate.getDate();
    this.populateYearSelector(this.strictEndYearInput, strictEndTimeYear);
    this.populateMonthSelector(this.strictEndMonthInput, strictEndTimeMonth);
    this.strictEndDayInput.value = strictEndTimeDay;
    this.strictEndDayInput.text = '' + strictEndTimeDay;
    this.populateDaySelector(undefined, true);
    this.populateHourSelector(this.strictEndHourInput, strictEndTimeHours);
    this.populateMinuteSelector(this.strictEndMinuteInput, strictEndTimeMinutes);
  }

  /**
   * Callback for starting maintenance
   */
  onStartMaintenance = () => {
    const maintenanceType = parseInt(this.state.maintenanceType, 10);
    const options: any = {};
    if (maintenanceType === 2) {
      // Daily maintenance
      options.every = this.state.everyNDays;
    } else if (maintenanceType === 3) {
      // Weekly maintenance
      options.every = this.state.everyNWeeks;
      let dayOfWeekBinary = '';
      Object.keys(this.state.weekdays).map(weekday => {
        if (this.state.weekdays[weekday]) {
          dayOfWeekBinary = '1' + dayOfWeekBinary;
        } else {
          dayOfWeekBinary = '0' + dayOfWeekBinary;
        }
      });
      options.dayofweek = parseInt(dayOfWeekBinary, 2);
    } else if (maintenanceType === 4) {
      // Monthly maintenance
      let monthBinary = '';
      Object.keys(this.state.months).map(month => {
        if (this.state.months[month] && month !== 'all') {
          monthBinary = '1' + monthBinary;
        } else {
          monthBinary = '0' + monthBinary;
        }
      });
      options.month = parseInt(monthBinary, 2);
      if (this.state.dayOfMonthOrWeekSelected === MONTH) {
        options.day = this.state.dayOfMonth;
      } else if (this.state.dayOfMonthOrWeekSelected === WEEK) {
        options.every = this.state.everyDayOfWeekInput;
        let dayOfWeekBinary = '';
        Object.keys(this.state.monthlyWeekdays).map(weekday => {
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
      this.yearInput.value,
      this.monthInput.value - 1,
      this.dayInput.value,
      parseInt(this.hourInput.value, 10),
      parseInt(this.minuteInput.value, 10)
    );
    let stopDate = new Date(this.yearStopInput.value, this.monthStopInput.value - 1, this.dayStopInput.value);
    stopDate = moment(stopDate)
      .endOf('day')
      .toDate();
    if (maintenanceType === 2 || maintenanceType === 3 || maintenanceType === 4) {
      options.start_time = moment.utc(startDate).hour() * 60 * 60 + moment.utc(startDate).minute() * 60;
    }
    let anyHostSelected = false;
    const hostIds: string[] = [];
    this.state.selectedHosts.forEach((option: any) => {
      if (option.selected) {
        anyHostSelected = true;
        hostIds.push(option.value);
      }
    });
    const maintenanceName = (this.state.description || '') + '|' + this.props.user + '|' + this.getCurrentTimeEpoch();
    const duration = this.state.strictEndTimeSelected ? this.getStrictEndTimeDuration() : this.durationInput.value;
    if (!anyHostSelected) {
      this.setState({ errorText: this.texts.atLeastOneHostMustBeSelected });
    } else if (maintenanceName.length > 128) {
      const excessLength = maintenanceName.length - 128;
      this.setState({ errorText: this.texts.maintenanceDescriptionIs + ' ' + excessLength + ' ' + this.texts.charsTooLong });
    } else {
      this.props.onCreateMaintenance(
        maintenanceType,
        maintenanceName,
        duration,
        hostIds,
        options,
        startDate,
        stopDate,
        this.props.selectedMaintenance ? this.props.selectedMaintenance.id : null
      );
      this.props.onDismiss();
    }
  }

  /**
   * Callback for select value changed
   */
  onDurationValueChanged = (value: number) => {
    this.setState({ durationInput: value });
    this.durationInput.value = value;
    if (this.durationInput.value > 0) {
      this.durationInput.isValid = true;
      this.onHourValueChanged();
    } else {
      this.durationInput.isValid = false;
    }
  }

  /**
   * Set contents of year selector
   */
  populateYearSelector = (yearInputObject: any, yearValue: number) => {
    yearInputObject.value = yearValue;
    yearInputObject.text = '' + yearValue;
    const currentYear = new Date().getFullYear();
    const startYear = Math.min(currentYear, yearValue);
    const endYear = Math.max(currentYear, yearValue)
    for (let i = startYear; i < endYear + 2; i++) {
      yearInputObject.options.push({
        text: '' + i,
        value: i,
      });
    }
  }

  /**
   * Set contents of month selector
   */
  populateMonthSelector = (monthInputObject: any, monthValue: number) => {
    monthInputObject.value = monthValue;
    monthInputObject.text = '' + monthValue;
    for (let i = 1; i < 13; i++) {
      monthInputObject.options.push({
        text: '' + i,
        value: i,
      });
    }
  }

  /**
   * Set contents of day selector based on selected month and year
   */
  populateDaySelector = (isStopDate?: boolean, isStrictEndDate?: boolean) => {
    let maxAmount = 0;
    let m = 0;
    let y = 0;
    let dayInputObject: any;
    if (isStopDate) {
      m = this.monthStopInput.value;
      y = this.yearStopInput.value;
      dayInputObject = this.dayStopInput;
    } else if (isStrictEndDate) {
      m = this.strictEndMonthInput.value;
      y = this.strictEndYearInput.value;
      dayInputObject = this.strictEndDayInput;
    } else {
      m = this.monthInput.value;
      y = this.yearInput.value;
      dayInputObject = this.dayInput;
    }
    dayInputObject.options = [];
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
    for (let i = 1; i <= maxAmount; i++) {
      dayInputObject.options.push({
        text: '' + i,
        value: i,
      });
    }
    if (dayInputObject.value > maxAmount) {
      dayInputObject.value = maxAmount;
      dayInputObject.text = '' + maxAmount;
    }
  }

  /**
   * Set contents of month selector
   */
  populateHourSelector = (hourInputObject: any, hourValue: number) => {
    for (let i = 0; i < 24; i++) {
      hourInputObject.options.push({
        text: '' + i,
        value: '' + i,
      });
    }
    if (hourInputObject.options.findIndex((item: any) => item.value === hourValue + '')) {
      hourInputObject.value = hourValue + '';
    } else {
      hourInputObject.value = hourInputObject.options[0].value;
    }
    hourInputObject.text = '' + hourValue;
  }

  /**
   * Set contents of month selector
   */
  populateMinuteSelector = (minuteInputObject: any, minuteValue: number) => {
    for (let i = 0; i < 60; i++) {
      minuteInputObject.options.push({
        text: i < 10 ? '0' + i : '' + i,
        value: i < 10 ? '0' + i : '' + i,
      });
    }
    const givenMinutes = minuteValue < 10 ? '0' + minuteValue : '' + minuteValue;
    if (minuteInputObject.options.findIndex((item: any) => item.value === givenMinutes)) {
      minuteInputObject.value = givenMinutes;
    } else {
      minuteInputObject.value = minuteInputObject.options[0].value;
    }
    minuteInputObject.text = givenMinutes;
  }

  getStrictEndTimeDate = () => {
    return new Date(
      this.strictEndYearInput.value,
      this.strictEndMonthInput.value - 1,
      this.strictEndDayInput.value,
      parseInt(this.strictEndHourInput.value, 10),
      parseInt(this.strictEndMinuteInput.value, 10)
    );
  }

  /**
   * Count maintenance duration if strict end time is selected
   */
  getStrictEndTimeDuration = () => {
    const startDate = new Date(
      this.yearInput.value,
      this.monthInput.value - 1,
      this.dayInput.value,
      parseInt(this.hourInput.value, 10),
      parseInt(this.minuteInput.value, 10)
    );
    const stopDate = this.getStrictEndTimeDate();
    const duration = Math.round((stopDate.getTime() - startDate.getTime()) / 1000);
    return duration;
  }

  onDayValueChanged = (value: number) => {
    this.setState({ dayInput: value, dayStopInput: value, strictEndDayInput: value });
    this.dayInput.value = value;
    this.dayStopInput.value = value;
    this.strictEndDayInput.value = value;
  }

  onHourValueChanged = (value?: number) => {
    if (value) {
      this.setState({ hourInput: value });
      this.hourInput.value = value;
    }
    const currentDate = new Date(
      this.yearInput.value,
      this.monthInput.value - 1,
      this.dayInput.value,
      parseInt(this.hourInput.value, 10),
      parseInt(this.minuteInput.value, 10)
    );
    let strictEndTimeDate = moment(currentDate)
      .add(this.durationInput.value, 'second')
      .toDate();
    this.setStrictEndTimeDate(strictEndTimeDate);
  }

  onMinuteValueChanged = (value: number) => {
    this.setState({ minuteInput: value, strictEndMinuteInput: value });
    this.minuteInput.value = value;
    this.strictEndMinuteInput.value = value;
  }

  /**
   * Callback for select month
   */
  onMonthValueChanged = (value: number) => {
    this.setState({ monthInput: value });
    this.monthInput.value = value;
    this.populateDaySelector();
    this.monthStopInput.value = this.monthInput.value;
    this.monthStopInput.text = this.monthInput.text;
    this.strictEndMonthInput.value = this.monthInput.value;
    this.strictEndMonthInput.text = this.monthInput.text;
    this.populateDaySelector(true);
    this.populateDaySelector(undefined, true);
  }

  /**
   * Callback for select year
   */
  onYearValueChanged = (value: number) => {
    this.setState({ yearInput: value });
    this.yearInput.value = value;
    const m = this.monthInput.value;
    const y = this.yearInput.value;
    this.yearStopInput.value = this.yearInput.value;
    this.yearStopInput.text = this.yearInput.text;
    this.strictEndYearInput.value = this.yearInput.value;
    this.strictEndYearInput.text = this.yearInput.text;
    if (((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) && m === 2) {
      this.populateDaySelector();
      this.populateDaySelector(true);
      this.populateDaySelector(undefined, true);
    }
  }

  onDayStopValueChanged = (value: number) => {
    this.setState({ dayStopInput: value });
    this.dayStopInput.value = value;
  }

  /**
   * Callback for select month
   */
  onMonthStopValueChanged = (value: number) => {
    this.setState({ monthStopInput: value });
    this.monthStopInput.value = value;
    this.populateDaySelector(true);
  }

  /**
   * Callback for select year
   */
  onYearStopValueChanged = (value: number) => {
    this.setState({ yearStopInput: value });
    this.yearStopInput.value = value;
    const m = this.monthStopInput.value;
    const y = this.yearStopInput.value;
    if (((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) && m === 2) {
      this.populateDaySelector(true);
    }
  }

  onStrictEndMinuteValueChanged = (value: number) => {
    this.setState({ strictEndMinuteInput: value });
    this.strictEndMinuteInput.value = value;
  }

  onStrictEndHourValueChanged = (value: number) => {
    this.setState({ strictEndHourInput: value });
    this.strictEndHourInput.value = value;
  }

  onStrictEndDayValueChanged = (value: number) => {
    this.setState({ strictEndDayInput: value });
    this.strictEndDayInput.value = value;
  }

  /**
   * Callback for select strict end month
   */
  onStrictEndMonthValueChanged = (value: number) => {
    this.setState({ strictEndMonthInput: value });
    this.strictEndMonthInput.value = value;
    this.populateDaySelector(undefined, true);
  }

  /**
   * Callback for select strict year
   */
  onStrictEndYearValueChanged = (value: number) => {
    this.setState({ strictEndYearInput: value });
    this.strictEndYearInput.value = value;
    const m = this.strictEndMonthInput.value;
    const y = this.strictEndYearInput.value;
    if (((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) && m === 2) {
      this.populateDaySelector(undefined, true);
    }
  }

  /**
   * Callback for selecting all hosts
   */
  selectAllHosts = (allSelected: boolean) => {
    const selectedHosts = [...this.state.selectedHosts];
    selectedHosts.forEach((host: any) => {
      host.selected = allSelected;
    });
    this.setState({ allHostsSelected: allSelected, selectedHosts });
  }

  /**
   * Callback for selecting host
   */
  selectHost = (id: string, checked: boolean) => {
    const selectedHosts: any = [...this.state.selectedHosts];
    const index = selectedHosts.findIndex((host: any) => host.value === id);
    if (index > -1) {
      selectedHosts[index].selected = checked;
    }
    const allHostsSelected = !selectedHosts.some((item: any) => !item.selected);
    this.setState({ selectedHosts, allHostsSelected });
  }

  /**
   * Callback for selecting a month; check if all are selected
   */
  toggleMonthSelection = (month: string, selected: boolean) => {
    const months = { ...this.state.months };
    months[month] = selected;
    let allSelected = true;
    Object.keys(months).map(monthName => {
      if (!months[monthName] && monthName !== 'all') {
        allSelected = false;
      }
    });
    months.all = allSelected;
    this.setState({ months });
  }

  /**
   * Callback for toggling all months on/off
   */
  toggleAllMonthsSelection = (selected: boolean) => {
    const months = { ...this.state.months };
    Object.keys(months).map(month => {
      if (selected) {
        months[month] = true;
      } else {
        months[month] = false;
      }
    });
    this.setState({ months });
  }

  /**
   * Callback for changing maintenance
   */
  onMaintenanceTypeChanged = (value: string) => {
    this.setState({ maintenanceType: value, errorText: '' });
    this.maintenanceType = this.mTypeInput.options.find((option: any) => option.value === value).text;
  }

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
   * Callback for go next button
   */
  goToNext = () => {
    const { maintenanceType, wizardPhase } = this.state;
    let valid = true;
    this.scope.errorText = '';
    // Check for validity
    if (wizardPhase === 1) {
      if (maintenanceType === '2') {
        if (!this.state.everyNDays || !/^[0-9]*$/.test(this.state.everyNDays + '')) {
          valid = false;
          this.scope.errorText += this.texts.dayFieldMustContainInteger + ' ';
        }
      } else if (maintenanceType === '3') {
        if (!this.state.everyNWeeks || !/^[0-9]*$/.test(this.state.everyNWeeks + '')) {
          valid = false;
          this.scope.errorText += this.texts.weekFieldMustContainInteger + ' ';
        }
        let someWeekdaySelected = false;
        Object.keys(this.state.weekdays).map(weekday => {
          if (this.state.weekdays[weekday]) {
            someWeekdaySelected = true;
          }
        });
        if (!someWeekdaySelected) {
          valid = false;
          this.scope.errorText += this.texts.oneWeekdayMustBeChosen + ' ';
        }
      } else if (maintenanceType === '4') {
        let someMonthSelected = false;
        Object.keys(this.state.months).map(month => {
          if (this.state.months[month]) {
            someMonthSelected = true;
          }
        });
        if (!someMonthSelected) {
          valid = false;
          this.scope.errorText += this.texts.oneMonthMustBeChosen + ' ';
        }
        if (this.state.dayOfMonthOrWeekSelected === MONTH) {
          if (!this.state.dayOfMonth || !/^[0-9]*$/.test(this.state.dayOfMonth + '')) {
            valid = false;
            this.scope.errorText += this.texts.monthFieldMustContainInteger + ' ';
          }
        } else if (this.state.dayOfMonthOrWeekSelected === WEEK) {
          let someWeekdaySelected = false;
          Object.keys(this.state.monthlyWeekdays).map(weekday => {
            if (this.state.monthlyWeekdays[weekday]) {
              someWeekdaySelected = true;
            }
          });
          if (!someWeekdaySelected) {
            valid = false;
            this.scope.errorText += this.texts.oneWeekdayMustBeChosen + ' ';
          }
        }
      }
      const startDate = new Date(
        this.yearInput.value,
        this.monthInput.value - 1,
        this.dayInput.value,
        parseInt(this.hourInput.value, 10),
        parseInt(this.minuteInput.value, 10)
      );
      const stopPeriodDate = moment(
        new Date(
          this.yearStopInput.value,
          this.monthStopInput.value - 1,
          this.dayStopInput.value)
        ).endOf('day').toDate();
      const currentDate = new Date();
      const duration = this.state.strictEndTimeSelected ? this.getStrictEndTimeDuration() : this.durationInput.value;
      const stopDateTime = moment(startDate).add(duration, 'second').toDate();
      if (maintenanceType === '2' || maintenanceType === '3' || maintenanceType === '4') {
        if (stopPeriodDate <= startDate) {
          valid = false;
          this.scope.errorText += this.texts.repeatMustEndAfterStartTime + ' ';
        } else if (stopPeriodDate < currentDate) {
          valid = false;
          this.scope.errorText += this.texts.repeatEndTimeCantBeInPast + ' ';
        }
        // Check if period continues over next DST change
        const curYear = new Date().getFullYear();
        const isCurrentlyDST = moment().isDST();
        let nextChange;
        if (isCurrentlyDST) {
          nextChange = moment(curYear + '-10-01').endOf("month").startOf('isoWeek').subtract(1,'day').add(4,'hour');
        } else {
          nextChange = moment(curYear + '-03-01').endOf("month").startOf('isoWeek').subtract(1,'day').add(3,'hour');
        }
        if (moment(stopPeriodDate).valueOf() > nextChange.valueOf()) {
          valid = false;
          this.scope.errorText += this.texts.repeatEndTimeCantOverlapDaylight + ' ' + 
            nextChange.format(('DD.MM.YYYY HH:mm')) + ' ';
        }
      }
      if (maintenanceType === '0' && this.state.strictEndTimeSelected && this.getStrictEndTimeDuration() <= 0) {
        valid = false;
        this.scope.errorText += this.texts.maintenanceEndMustBeAfterStart + ' ';
      }
      if (maintenanceType === '0' && stopDateTime < currentDate) {
        valid = false;
        this.scope.errorText += this.texts.maintenanceEndCantBeInPast + ' ';
      }
      if (valid) {
        this.scope.wizardPhase = 2;
        this.setState({ wizardPhase: 2 });
      }
    } else {
      let anyHostSelected = false;
      this.state.selectedHosts.forEach((option: any) => {
        if (option.value) {
          anyHostSelected = true;
        }
      });
      const maintenanceName = (this.state.description || '') + '|' + this.props.user + '|' + this.getCurrentTimeEpoch();
      if (!anyHostSelected) {
        this.scope.errorText = this.texts.atLeastOneHostMustBeSelected;
        valid = false;
      } else if (maintenanceName.length > 128) {
        const excessLength = maintenanceName.length - 128;
        this.scope.errorText = this.texts.maintenanceDescriptionIs + ' ' + excessLength + ' ' + this.texts.charsTooLong;
        valid = false;
      }
      if (valid) {
        this.scope.wizardPhase = 3;
        this.setState({ wizardPhase: 3 });
        this.displayStartDate = moment(new Date(
          this.yearInput.value,
          this.monthInput.value - 1,
          this.dayInput.value,
          parseInt(this.hourInput.value, 10),
          parseInt(this.minuteInput.value, 10)
        )).format('DD.MM.YYYY HH:mm');
        this.displayStopDate = moment(this.getStrictEndTimeDate()).format('DD.MM.YYYY HH:mm');
        this.displayRepeatStopDate = moment(
          new Date(this.yearStopInput.value, this.monthStopInput.value - 1, this.dayStopInput.value)
        ).endOf('day').format('DD.MM.YYYY HH:mm');
        this.displayHosts = '';
        this.state.selectedHosts.forEach((option: any) => {
          if (option.value) {
            if (this.displayHosts) {
              this.displayHosts += ', ';
            }
            this.displayHosts += option.text;
          }
        });
        this.displayWeeklyDays = '';
        Object.keys(this.state.weekdays).forEach((weekday: string) => {
          if (this.state.weekdays[weekday]) {
            if (this.displayWeeklyDays) {
              this.displayWeeklyDays += ', ';
            }
            this.displayWeeklyDays += this.weekdayNames[weekday];
          }
        });
        this.displayMonths = '';
        Object.keys(this.state.months).forEach((month: string) => {
          if (this.state.months[month]) {
            if (this.displayMonths) {
              this.displayMonths += ', ';
            }
            this.displayMonths += this.monthNames[month];
          }
        });
        this.displayMonthlyWeekdayNumber = this.everyDayOfWeekInput.options.find((option: any) => option.value === this.state.everyDayOfWeekInput).label;
        this.displayMonthlyWeekdayNames = '';
        Object.keys(this.state.monthlyWeekdays).forEach((weekday: string) => {
          if (this.state.monthlyWeekdays[weekday]) {
            if (this.displayMonthlyWeekdayNames) {
              this.displayMonthlyWeekdayNames += ', ';
            }
            this.displayMonthlyWeekdayNames += this.weekdayNames[weekday];
          }
        });
      }
    }
    this.setState({ errorText: this.scope.errorText });
  }

  /**
   * Callback for go previous button
   */
  goToPrevious = () => {
    this.setState({ wizardPhase: this.state.wizardPhase - 1 });
  }

  render() {
    const { show, onDismiss, selectedMaintenance, openAllMaintenancesModal } = this.props;
    const { wizardPhase, maintenanceType, everyNDays, everyNWeeks, weekdays, months, dayOfMonthOrWeekSelected, dayOfMonth,
      monthlyWeekdays, everyDayOfWeekInput, dayInput, monthInput, yearInput, hourInput, minuteInput, dayStopInput,
      monthStopInput, yearStopInput, strictEndTimeSelected, durationInput, strictEndMinuteInput, strictEndHourInput,
      strictEndDayInput, strictEndMonthInput, strictEndYearInput, errorText, description, searchText, allHostsSelected,
      selectedHosts } = this.state;
    const title = (<h2 className="modal-header modal-header-title">{selectedMaintenance ? 'Muokkaa huoltoa' : 'Luo uusi huolto'}</h2>);

    return (
      <>
        <Modal isOpen={show} title={title} onDismiss={onDismiss} className="modal modal-body">
          <div>
            <div className="modal-content">
              { wizardPhase === 1 ? (
                <>
                  <div className="gf-form-group maintenance-row-container">
                    <label className="gf-form-label">{this.texts.maintenanceType}</label>
                    <div className="gf-form-select-wrapper iiris-fixed-width-select">
                      <select className="gf-form-input" value={maintenanceType} onChange={(e: any) => this.onMaintenanceTypeChanged(e.target.value)}>
                        { this.mTypeInput.options.map((option: any) => (
                          <option value={option.value} key={option.value}>{ option.label }</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  { maintenanceType === '2' ? (
                    <div className="gf-form-group maintenance-row-container">
                      <label className="gf-form-label">{this.texts.repeatEveryNDays}</label>
                      <div>
                        <input className="input-small gf-form-input iiris-fixed-width-select" type="number" value={everyNDays} onChange={(e: any) => this.setState({ everyNDays: e.target.value })} min="1" step="1" />
                      </div>
                    </div>
                  ) : null }
                  { maintenanceType === '3' ? (
                    <div className="gf-form-group maintenance-row-container">
                      <label className="gf-form-label">{this.texts.repeatEveryNWeeks}</label>
                      <div>
                        <input className="input-small gf-form-input iiris-fixed-width-select" type="number" value={everyNWeeks} onChange={(e: any) => this.setState({ everyNWeeks: e.target.value })} min="1" step="1" />
                      </div>
                    </div>
                  ) : null }
                  { maintenanceType === '3' ? (
                    <div className="gf-form-group maintenance-row-container">
                      <label className="gf-form-label">{this.texts.repeatOnWeekday}</label>
                      <div className="checkbox-block">
                        { Object.keys(weekdays).map((day: string) => (
                          <div className="checkbox-container" key={day}>
                            <input className="action-panel-cb" type="checkbox" checked={weekdays[day]} onChange={(e: any) => this.setState({ weekdays: {...weekdays, [day]: e.target.checked }})} id={day} />
                            <label className="gf-form-label checkbox-label" htmlFor={day}>{ this.weekdayNames[day] }</label>
                          </div>
                        )) }
                      </div>
                    </div>
                  ) : null }
                  { maintenanceType === '4' ? (
                    <div className="gf-form-group maintenance-row-container">
                      <label className="gf-form-label">{this.texts.repeatOnMonth}</label>
                      <div className="checkbox-block">
                        { [0, 3, 6, 9].map(index => (
                          <div className="checkbox-column" key={'col' + index}>
                            { Object.keys(months).slice(index, index + 3).map(month => (
                              <div className="checkbox-container" key={month}>
                                <input className="action-panel-cb" type="checkbox" checked={months[month]} onChange={(e: any) => this.toggleMonthSelection(month, e.target.checked)} id={month} />
                                <label className="gf-form-label checkbox-label" htmlFor={month}>{ this.monthNames[month] }</label>
                              </div>
                            ))}
                          </div>
                        ))}
                        <div className="checkbox-column">
                          <div className="checkbox-container">
                            <input className="action-panel-cb" type="checkbox" checked={months.all} id="all" onChange={(e: any) => this.toggleAllMonthsSelection(e.target.checked)} />
                            <label className="gf-form-label checkbox-label width-8" htmlFor="all">{this.texts.selectAll}</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null }
                  { maintenanceType === '4' ? (
                    <div className="gf-form-group maintenance-row-container iiris-modal-column-container">
                      <div className="iiris-modal-column">
                        <label className="gf-form-label iiris-radio-button-block">{this.texts.repeatOn}
                          <div className="checkbox-container">
                            <input className="action-panel-cb" type="radio" name="monthtype" checked={dayOfMonthOrWeekSelected === MONTH} onChange={(e: any) => this.setState({ dayOfMonthOrWeekSelected: e.target.value })} value={MONTH} id="dayOfMonthSelected" />
                            <label className="gf-form-label checkbox-label width-12" htmlFor="dayOfMonthSelected">{this.texts.nthDayOfMonth}</label>
                          </div>
                          <div className="checkbox-container">
                            <input className="action-panel-cb" type="radio" name="monthtype" checked={dayOfMonthOrWeekSelected === WEEK} onChange={(e: any) => this.setState({ dayOfMonthOrWeekSelected: e.target.value })} value={WEEK} id="dayOfWeekSelected" />
                            <label className="gf-form-label checkbox-label width-12" htmlFor="dayOfWeekSelected">{this.texts.nthDayOfWeek}</label>
                          </div>
                        </label>
                      </div>
                      <div className="iiris-modal-column">
                        { dayOfMonthOrWeekSelected === MONTH ? (
                          <div className="gf-form-group">
                            <label className="gf-form-label">{this.texts.repeatOnDayOfMonth}</label>
                            <div>
                              <input className="input-small gf-form-input iiris-fixed-width-select" type="number" value={dayOfMonth} onChange={e => this.setState({ dayOfMonth: parseInt(e.target.value, 10) })} min="1" step="1" />
                            </div>
                          </div>
                        ) : null }
                        { dayOfMonthOrWeekSelected === WEEK ? (
                          <div className="gf-form-group">
                            <label className="gf-form-label">{this.texts.repeatOnDayOfWeek + ' ' + this.texts.secondTuesdayOfApril}</label>
                            <div className="gf-form-select-wrapper">
                              <select className="gf-form-input" value={everyDayOfWeekInput} onChange={e => this.setState({ everyDayOfWeekInput: parseInt(e.target.value, 10) })}>
                                { this.everyDayOfWeekInput.options.map((option: any) => (
                                  <option value={option.value} key={option.value}>{ option.label }</option>
                                )) }
                              </select>
                            </div>
                            <div className="checkbox-block checkbox-top-spacer">
                              { Object.keys(monthlyWeekdays).map((day: string) => (
                                <div className="checkbox-container" key={'w' + day}>
                                  <input className="action-panel-cb" type="checkbox" checked={monthlyWeekdays[day]} onChange={(e: any) => this.setState({ monthlyWeekdays: {...monthlyWeekdays, [day]: e.target.checked }})} id={'w'+ day} />
                                  <label className="gf-form-label checkbox-label" htmlFor={'w' + day}>{ this.weekdayNames[day] }</label>
                                </div>
                              )) }
                            </div>
                          </div>
                        ) : null }
                      </div>
                    </div>
                  ) : null }
                  <div className="gf-form-group maintenance-row-container iiris-modal-column-container">
                    <div className="iiris-modal-column">
                      <label className="gf-form-label">{ maintenanceType === '0' ? 'Huollon alkamisajankohta' : 'Aloita toisto' }</label>
                      <div className="date-selection-row">
                        <div className="date-selection-container">
                          <div>{this.texts.day}</div>
                          <div className="gf-form-select-wrapper">
                            <select className="gf-form-input" value={dayInput} onChange={e => this.onDayValueChanged(parseInt(e.target.value, 10))}>
                              { this.dayInput.options.map((option: any) => (
                                <option value={option.value} key={'d' + option.value}>{ option.text }</option>
                              )) }
                            </select>
                          </div>
                        </div>
                        <div className="date-selection-container">
                          <div>{this.texts.month}</div>
                          <div className="gf-form-select-wrapper">
                            <select className="gf-form-input" value={monthInput} onChange={e => this.onMonthValueChanged(parseInt(e.target.value, 10))}>
                              { this.monthInput.options.map((option: any) => (
                                <option value={option.value} key={'m' + option.value}>{ option.text }</option>
                              )) }
                            </select>
                          </div>
                        </div>
                        <div className="date-selection-container">
                          <div>{this.texts.year}</div>
                          <div className="gf-form-select-wrapper">
                            <select className="gf-form-input" value={yearInput} onChange={e => this.onYearValueChanged(parseInt(e.target.value, 10))}>
                              { this.yearInput.options.map((option: any) => (
                                <option value={option.value} key={'y' + option.value}>{ option.text }</option>
                              )) }
                            </select>
                          </div>
                        </div>
                        <div className="date-selection-container hour-input">
                          <div>{this.texts.hour}</div>
                          <div className="gf-form-select-wrapper">
                            <select className="gf-form-input" value={hourInput} onChange={e => this.onHourValueChanged(parseInt(e.target.value, 10))}>
                              { this.hourInput.options.map((option: any) => (
                                <option value={option.value} key={'h' + option.value}>{ option.text }</option>
                              )) }
                            </select>
                          </div>
                        </div>
                        <div className="date-selection-container">
                          <div>{this.texts.minute}</div>
                          <div className="gf-form-select-wrapper">
                            <select className="gf-form-input" value={minuteInput} onChange={e => this.onMinuteValueChanged(parseInt(e.target.value, 10))}>
                              { this.minuteInput.options.map((option: any) => (
                                <option value={option.value} key={'mi' + option.value}>{ option.text }</option>
                              )) }
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    { parseInt(maintenanceType, 10) > 0 ? (
                      <div className="iiris-modal-column">
                        <label className="gf-form-label">{this.texts.endRepeat}</label>
                        <div className="date-selection-row">
                          <div className="date-selection-container">
                            <div>{this.texts.day}</div>
                            <div className="gf-form-select-wrapper">
                              <select className="gf-form-input" value={dayStopInput} onChange={e => this.onDayStopValueChanged(parseInt(e.target.value, 10))}>
                                { this.dayStopInput.options.map((option: any) => (
                                  <option value={option.value} key={'ds' + option.value}>{ option.text }</option>
                                )) }
                              </select>
                            </div>
                          </div>
                          <div className="date-selection-container">
                            <div>{this.texts.month}</div>
                            <div className="gf-form-select-wrapper">
                              <select className="gf-form-input" value={monthStopInput} onChange={e => this.onMonthStopValueChanged(parseInt(e.target.value, 10))}>
                                { this.monthStopInput.options.map((option: any) => (
                                  <option value={option.value} key={'ms' + option.value}>{ option.text }</option>
                                )) }
                              </select>
                            </div>
                          </div>
                          <div className="date-selection-container">
                            <div>{this.texts.year}</div>
                            <div className="gf-form-select-wrapper">
                              <select className="gf-form-input" value={yearStopInput} onChange={e => this.onYearStopValueChanged(parseInt(e.target.value, 10))}>
                                { this.yearStopInput.options.map((option: any) => (
                                  <option value={option.value} key={'ys' + option.value}>{ option.text }</option>
                                )) }
                              </select>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null }
                  </div>
                  { !strictEndTimeSelected ? (
                    <div className="gf-form-group maintenance-row-container">
                      <label className="gf-form-label">{this.texts.maintenanceDuration}</label>
                      <div className="gf-form-select-wrapper iiris-fixed-width-select">
                        <select className="gf-form-input" value={durationInput} onChange={e => this.onDurationValueChanged(parseInt(e.target.value, 10))}>
                          { this.durationInput.options.map((option: any) => (
                            <option value={option.value} key={option.value}>{ option.text }</option>
                          )) }
                        </select>
                      </div>
                    </div>
                  ) : null }
                  <div className="gf-form-group maintenance-row-container">
                    <div className="iiris-checkbox">
                      <input id="strict_end_time" type="checkbox" checked={strictEndTimeSelected} onChange={(e: any) => this.setState({ strictEndTimeSelected: e.target.checked })} />
                      <label className="checkbox-label" htmlFor="strict_end_time">{this.texts.setPreciseEndTime}</label>
                    </div>
                  </div>
                  { strictEndTimeSelected ? (
                    <div className="gf-form-group maintenance-row-container">
                      <label className="gf-form-label">{this.texts.maintenanceEndTime}</label>
                      <div className="date-selection-row">
                        <div className="date-selection-container">
                          <div>{this.texts.day}</div>
                          <div className="gf-form-select-wrapper">
                            <select className="gf-form-input" value={strictEndDayInput} onChange={e => this.onStrictEndDayValueChanged(parseInt(e.target.value, 10))}>
                              { this.strictEndDayInput.options.map((option: any) => (
                                <option value={option.value} key={'sd' + option.value}>{ option.text }</option>
                              )) }
                            </select>
                          </div>
                        </div>
                        <div className="date-selection-container">
                          <div>{this.texts.month}</div>
                          <div className="gf-form-select-wrapper">
                            <select className="gf-form-input" value={strictEndMonthInput} onChange={e => this.onStrictEndMonthValueChanged(parseInt(e.target.value, 10))}>
                              { this.strictEndMonthInput.options.map((option: any) => (
                                <option value={option.value} key={'sm' + option.value}>{ option.text }</option>
                              )) }
                            </select>
                          </div>
                        </div>
                        <div className="date-selection-container">
                          <div>{this.texts.year}</div>
                          <div className="gf-form-select-wrapper">
                            <select className="gf-form-input" value={strictEndYearInput} onChange={e => this.onStrictEndYearValueChanged(parseInt(e.target.value, 10))}>
                              { this.strictEndYearInput.options.map((option: any) => (
                                <option value={option.value} key={'sy' + option.value}>{ option.text }</option>
                              )) }
                            </select>
                          </div>
                        </div>
                        <div className="date-selection-container hour-input">
                          <div>{this.texts.hour}</div>
                          <div className="gf-form-select-wrapper">
                            <select className="gf-form-input" value={strictEndHourInput} onChange={e => this.onStrictEndHourValueChanged(parseInt(e.target.value, 10))}>
                              { this.strictEndHourInput.options.map((option: any) => (
                                <option value={option.value} key={'sh' + option.value}>{ option.text }</option>
                              )) }
                            </select>
                          </div>
                        </div>
                        <div className="date-selection-container">
                          <div>{this.texts.minute}</div>
                          <div className="gf-form-select-wrapper">
                            <select className="gf-form-input" value={strictEndMinuteInput} onChange={e => this.onStrictEndMinuteValueChanged(parseInt(e.target.value, 10))}>
                              { this.strictEndMinuteInput.options.map((option: any) => (
                                <option value={option.value} key={'smi' + option.value}>{ option.text }</option>
                              )) }
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null }
                  <div className="maintenance-config-error-text">{errorText}</div>
                  <div className="gf-form-button-row">
                    <a className="btn btn-secondary" onClick={() => openAllMaintenancesModal()}>{this.texts.back}</a>
                    <a className="btn btn-secondary" onClick={() => onDismiss()}>{this.texts.cancel}</a>
                    <a className="btn btn-primary" onClick={() => this.goToNext()}>{this.texts.next}</a>
                  </div>
                </>
              ) : null }
              { wizardPhase === 2 ? (
                <>
                  <div className="gf-form-group maintenance-row-container">
                    <label className="gf-form-label">{this.texts.maintenanceDescription}</label>
                    <textarea className="gf-form-input" value={description} onChange={(e) => this.setState({ description: e.target.value })} rows={3} maxLength={128}></textarea>
                  </div>
                  <label className="gf-form-label">{this.texts.selectHosts}</label>
                  <div className="iiris-text-search-container">
                    <span className="iiris-search-icon fa fa-search"></span>
                    <input className="input-small gf-form-input iiris-fixed-width-select" type="text" value={searchText} onChange={(e) => this.setState({ searchText: e.target.value })} placeholder="Hae nimellä" />
                  </div>
                  <div className="gf-form-group maintenance-host-list">
                    { !searchText ? (
                      <div className="iiris-checkbox">
                        <input id="select_all" type="checkbox" checked={allHostsSelected} onChange={e => this.selectAllHosts(e.target.checked)} />
                        <label className="checkbox-label" htmlFor="select_all">{this.texts.allHosts}</label>
                      </div>
                    ) : null }
                    { selectedHosts.filter((fHost: any) => !searchText || fHost.text.toLowerCase().indexOf(searchText.toLowerCase()) > -1).map((host: any) => (
                      <div className="iiris-checkbox" key={host.value}>
                        <input id={'cb' + host.value} type="checkbox" checked={host.selected} onChange={e => this.selectHost(host.value, e.target.checked)} />
                        <label className="checkbox-label" htmlFor={'cb' + host.value}>{host.text}</label>
                      </div>
                    ))}
                  </div>
                  <div className="maintenance-config-error-text">{errorText}</div>
                  <div className="gf-form-button-row">
                    <a className="btn btn-secondary" onClick={e => this.goToPrevious()}>{this.texts.back}</a>
                    <a className="btn btn-secondary" onClick={e => onDismiss()}>{this.texts.cancel}</a>
                    <a className="btn btn-primary" onClick={e => this.goToNext()}>{selectedMaintenance ? this.texts.saveChanges : this.texts.createMaintenance}</a>
                  </div>
                </>
              ) : null }
              { wizardPhase === 3 ? (
                <>
                  <div className="iiris-maintenance-modal-text-row">
                    <div className="iiris-maintenance-modal-text-label">{this.texts.description}</div>
                    <div className="iiris-maintenance-modal-text-normal">{description}</div>
                  </div>
                  <div className="iiris-maintenance-modal-text-row">
                    <div className="iiris-maintenance-modal-text-label">{this.texts.hosts}</div>
                    <div className="iiris-maintenance-modal-text-normal">{this.displayHosts}</div>
                  </div>
                  <div className="iiris-maintenance-modal-text-row">
                    <div className="iiris-maintenance-modal-text-label">{this.texts.maintenanceType}</div>
                    <div className="iiris-maintenance-modal-text-normal">{(this.mTypeInput.options.find((item: any) => item.value === maintenanceType)||{label: ''}).label}</div>
                  </div>
                  { maintenanceType === '0' ? (
                    <div>
                      <div className="iiris-maintenance-modal-text-row">
                        <div className="iiris-maintenance-modal-text-label">{this.texts.maintenanceStartTime}</div>
                        <div className="iiris-maintenance-modal-text-normal">{this.displayStartDate}</div>
                      </div>
                      <div className="iiris-maintenance-modal-text-row">
                        <div className="iiris-maintenance-modal-text-label">{this.texts.maintenanceEndTime}</div>
                        <div className="iiris-maintenance-modal-text-normal">{this.displayStopDate}</div>
                      </div>
                    </div>
                  ) : null }
                  { maintenanceType === '2' ? (
                    <div>
                      <div className="iiris-maintenance-modal-text-row">
                        <div className="iiris-maintenance-modal-text-label">{this.texts.repeatEveryNDays}</div>
                        <div className="iiris-maintenance-modal-text-normal">{everyNDays}</div>
                      </div>
                    </div>
                  ) : null }
                  { maintenanceType === '3' ? (
                    <div>
                      <div className="iiris-maintenance-modal-text-row">
                        <div className="iiris-maintenance-modal-text-label">{this.texts.repeatEveryNWeeks}</div>
                        <div className="iiris-maintenance-modal-text-normal">{everyNWeeks}</div>
                      </div>
                      <div className="iiris-maintenance-modal-text-row">
                        <div className="iiris-maintenance-modal-text-label">{this.texts.repeatOnWeekday}</div>
                        <div className="iiris-maintenance-modal-text-normal">{this.displayWeeklyDays}</div>
                      </div>
                    </div>
                  ) : null }
                  { maintenanceType === '4' ? (
                    <div>
                      <div className="iiris-maintenance-modal-text-row">
                        <div className="iiris-maintenance-modal-text-label">{this.texts.repeatOnMonth}</div>
                        <div className="iiris-maintenance-modal-text-normal">{this.displayMonths}</div>
                      </div>
                      { dayOfMonthOrWeekSelected === MONTH ? (
                        <div>
                          <div className="iiris-maintenance-modal-text-row">
                            <div className="iiris-maintenance-modal-text-label">{this.texts.repeatOnDayOfMonth}</div>
                            <div className="iiris-maintenance-modal-text-normal">{dayOfMonth}</div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="iiris-maintenance-modal-text-row">
                            <div className="iiris-maintenance-modal-text-label">{this.texts.repeatOnDayOfWeek}</div>
                            <div className="iiris-maintenance-modal-text-normal">{this.displayMonthlyWeekdayNumber + ' ' + this.displayMonthlyWeekdayNames}</div>
                          </div>
                        </div>
                      ) }
                    </div>
                  ) : null }
                  { parseInt(maintenanceType, 10) > 0 ? (
                    <div>
                      <div className="iiris-maintenance-modal-text-row">
                        <div className="iiris-maintenance-modal-text-label">{this.texts.maintenanceStartTime}</div>
                        <div className="iiris-maintenance-modal-text-normal">{this.displayStartDate}</div>
                      </div>
                      <div className="iiris-maintenance-modal-text-row">
                        <div className="iiris-maintenance-modal-text-label">{this.texts.maintenanceEndTime}</div>
                        <div className="iiris-maintenance-modal-text-normal">{this.displayStopDate}</div>
                      </div>
                      <div className="iiris-maintenance-modal-text-row">
                        <div className="iiris-maintenance-modal-text-label">{this.texts.repeatStarts}</div>
                        <div className="iiris-maintenance-modal-text-normal">{this.displayStartDate}</div>
                      </div>
                      <div className="iiris-maintenance-modal-text-row">
                        <div className="iiris-maintenance-modal-text-label">{this.texts.repeatEnds}</div>
                        <div className="iiris-maintenance-modal-text-normal">{this.displayRepeatStopDate}</div>
                      </div>
                    </div>
                  ) : null }
                  <div className="gf-form-button-row">
                    <a className="btn btn-secondary" onClick={() => this.goToPrevious()}>{this.texts.back}</a>
                    <a className="btn btn-secondary" onClick={() => this.props.onDismiss()}>{this.texts.cancel}</a>
                    <a className="btn btn-primary" onClick={() => this.onStartMaintenance()}>{ selectedMaintenance ? this.texts.saveChanges : this.texts.createMaintenance }</a>
                  </div>
                </>
              ) : null }
            </div>
          </div>
        </Modal>
      </>
    );
  }
}
