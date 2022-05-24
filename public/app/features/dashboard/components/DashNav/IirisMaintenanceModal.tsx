/* eslint-disable */
/* tslint:disable */
import React, { PureComponent } from 'react';
import { Modal, Select } from '@grafana/ui';
import _ from 'lodash';
import moment from 'moment'; // eslint-disable-line no-restricted-imports

const WEEK = 'WEEK';
const MONTH = 'MONTH';

interface Props {
  show: boolean;
  onDismiss(): void;
  onCreateMaintenance?(): void;
  allMaintenances?: any[];
  openMaintenanceModal?(): void;
  onStopMaintenance?(): void;
  onEditMaintenance?(): void;
  ongoingMaintenanceIds?: any[];
  selectedMaintenanceId?: string[];
  confirmIsVisible?: boolean;
  confirmText?: string;
  confirmAction?: string;
}

interface State {
  wizardPhase: number;
  mTypeInput: string;
}

export class IirisMaintenanceModal extends PureComponent<Props, State> {
  scope: any;
  hosts: any;
  user: any;
  onCreateMaintenance: any;
  selectedMaintenance: any;
  getCurrentTimeEpoch: any;
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

  constructor(props: Props) {
    super(props);
    this.state = {
      wizardPhase: 1,
      mTypeInput: '0'
    }
    this.init();
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
      text: 'Yksittäinen',
      options: [
        { label: 'Yksittäinen', value: '0' },
        { label: 'Päivittäinen', value: '2' },
        { label: 'Viikottainen', value: '3' },
        { label: 'Kuukausittainen', value: '4' },
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
      text: 'Ensimmäinen',
      options: [
        { text: 'Ensimmäinen', value: 1 },
        { text: 'Toinen', value: 2 },
        { text: 'Kolmas', value: 3 },
        { text: 'Neljäs', value: 4 },
        { text: 'Viimeinen', value: 5 },
      ],
    };
    this.search = {
      text: ''
    };
    this.weekdayNames = {
      monday: 'Maanantai',
      tuesday: 'Tiistai',
      wednesday: 'Keskiviikko',
      thursday: 'Torstai',
      friday: 'Perjantai',
      saturday: 'Lauantai',
      sunday: 'Sunnuntai',
    };
    this.monthNames = {
      january: 'Tammikuu',
      february: 'Helmikuu',
      march: 'Maaliskuu',
      april: 'Huhtikuu',
      may: 'Toukokuu',
      june: 'Kesäkuu',
      july: 'Heinäkuu',
      august: 'Elokuu',
      september: 'Syyskuu',
      october: 'Lokakuu',
      november: 'Marraskuu',
      december: 'Joulukuu',
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
      this.scope.hosts.options.map((option: any, index: number) => {
        if (maintenanceHostIds.indexOf(option.value) === -1) {
          this.scope.hosts.options[index].checked = false;
          this.scope.hosts.selected[option.value] = false;
          this.scope.hosts.allSelected = false;
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
   * @param {MouseEvent} event
   */
  onStartMaintenance = (event: MouseEvent) => {
    const maintenanceType = parseInt(this.mTypeInput.value, 10);
    const options: any = {};
    if (maintenanceType === 2) {
      // Daily maintenance
      options.every = this.scope.everyNDays;
    } else if (maintenanceType === 3) {
      // Weekly maintenance
      options.every = this.scope.everyNWeeks;
      let dayOfWeekBinary = '';
      Object.keys(this.scope.weekdays).map(weekday => {
        if (this.scope.weekdays[weekday]) {
          dayOfWeekBinary = '1' + dayOfWeekBinary;
        } else {
          dayOfWeekBinary = '0' + dayOfWeekBinary;
        }
      });
      options.dayofweek = parseInt(dayOfWeekBinary, 2);
    } else if (maintenanceType === 4) {
      // Monthly maintenance
      let monthBinary = '';
      Object.keys(this.scope.months).map(month => {
        if (this.scope.months[month] && month !== 'all') {
          monthBinary = '1' + monthBinary;
        } else {
          monthBinary = '0' + monthBinary;
        }
      });
      options.month = parseInt(monthBinary, 2);
      if (this.scope.dayOfMonthOrWeekSelected.value === MONTH) {
        options.day = this.scope.dayOfMonth;
      } else if (this.scope.dayOfMonthOrWeekSelected.value === WEEK) {
        options.every = this.everyDayOfWeekInput.value;
        let dayOfWeekBinary = '';
        Object.keys(this.scope.monthlyWeekdays).map(weekday => {
          if (this.scope.monthlyWeekdays[weekday]) {
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
    this.scope.hosts.options.forEach((option: any) => {
      if (this.scope.hosts.selected[option.value]) {
        anyHostSelected = true;
        hostIds.push(option.value);
      }
    });
    const maintenanceName = (this.description || '') + '|' + this.scope.user + '|' + this.getCurrentTimeEpoch()();
    const duration = this.scope.strictEndTimeSelected ? this.getStrictEndTimeDuration() : this.durationInput.value;
    if (!anyHostSelected) {
      this.scope.errorText = "Ainakin yhden palvelimen täytyy olla valittu";
    } else if (maintenanceName.length > 128) {
      const excessLength = maintenanceName.length - 128;
      this.scope.errorText = "Huollon kuvaus on " + excessLength + " merkkiä liian pitkä";
    } else {
      this.onCreateMaintenance()(
        maintenanceType,
        maintenanceName,
        duration,
        hostIds,
        options,
        startDate,
        stopDate,
        this.scope.selectedMaintenance ? this.scope.selectedMaintenance.id : null
      );
      this.props.onDismiss();
    }
  }

  /**
   * Callback for select value changed
   */
  onDurationValueChanged = () => {
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

  onDayValueChanged = () => {
    this.strictEndDayInput.value = this.dayInput.value;
    this.strictEndDayInput.text = this.dayInput.text;
    this.dayStopInput.value = this.dayInput.value;
    this.dayStopInput.text = this.dayInput.text;
  }

  onHourValueChanged = () => {
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

  onMinuteValueChanged = () => {
    this.strictEndMinuteInput.value = this.minuteInput.value;
    this.strictEndMinuteInput.text = this.minuteInput.text;
  }

  /**
   * Callback for select month
   */
  onMonthValueChanged = () => {
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
  onYearValueChanged = () => {
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

  /**
   * Callback for select month
   */
  onMonthStopValueChanged = () => {
    this.populateDaySelector(true);
  }

  /**
   * Callback for select year
   */
  onYearStopValueChanged = () => {
    const m = this.monthStopInput.value;
    const y = this.yearStopInput.value;
    if (((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) && m === 2) {
      this.populateDaySelector(true);
    }
  }

  /**
   * Callback for select strict end month
   */
  onStrictEndMonthValueChanged = () => {
    this.populateDaySelector(undefined, true);
  }

  /**
   * Callback for select strict year
   */
  onStrictEndYearValueChanged = () => {
    const m = this.strictEndMonthInput.value;
    const y = this.strictEndYearInput.value;
    if (((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) && m === 2) {
      this.populateDaySelector(undefined, true);
    }
  }

  /**
   * Callback for selecting all hosts
   */
  selectAllHosts = () => {
    const allSelected = this.scope.hosts.allSelected;
    this.scope.hosts.options.forEach((option: any, index: number) => {
      this.scope.hosts.options[index].checked = allSelected;
      this.scope.hosts.selected[option.value] = allSelected;
    });
  }

  /**
   * Callback for selecting host
   */
  selectHost = (id: string) => {
    const index = this.scope.hosts.options.findIndex((host: any) => host.value === id);
    this.scope.hosts.options[index].checked = !this.scope.hosts.options[index].checked;
    if (!this.scope.hosts.options[index].checked) {
      this.scope.hosts.allSelected = false;
    } else {
      // Check if all checkboxes are selected
      let allSelected = true;
      this.scope.hosts.options.forEach((option: any) => {
        if (!this.scope.hosts.selected[option.value]) {
          allSelected = false;
        }
      });
      this.scope.hosts.allSelected = allSelected;
    }
  }

  /**
   * Callback for selecting a month; check if all are selected
   */
  toggleMonthSelection = () => {
    let allSelected = true;
    Object.keys(this.scope.months).map(month => {
      if (!this.scope.months[month] && month !== 'all') {
        allSelected = false;
      }
    });
    this.scope.months.all = allSelected;
  }

  /**
   * Callback for toggling all months on/off
   */
  toggleAllMonthsSelection = () => {
    Object.keys(this.scope.months).map(month => {
      if (this.scope.months['all'] && month !== 'all') {
        this.scope.months[month] = true;
      } else if (!this.scope.months['all'] && month !== 'all') {
        this.scope.months[month] = false;
      }
    });
  }

  /**
   * Callback for changing maintenance
   */
  onMaintenanceTypeChanged = (value: string) => {
    this.scope.errorText = '';
    this.maintenanceType = this.mTypeInput.options.find((option: any) => option.value === this.mTypeInput.value).text;
  }

  /**
   * Callback for go next button
   */
  goToNext = () => {
    let valid = true;
    this.scope.errorText = '';
    // Check for validity
    if (this.scope.wizardPhase === 1) {
      if (this.mTypeInput.value === '2') {
        if (!this.scope.everyNDays || !/^[0-9]*$/.test(this.scope.everyNDays)) {
          valid = false;
          this.scope.errorText += 'Kentän "Toistetaan n päivän välein" täytyy sisältää kokonaisluku. ';
        }
      } else if (this.mTypeInput.value === '3') {
        if (!this.scope.everyNWeeks || !/^[0-9]*$/.test(this.scope.everyNWeeks)) {
          valid = false;
          this.scope.errorText += 'Kentän "Toistetaan n viikon välein" täytyy sisältää kokonaisluku. ';
        }
        let someWeekdaySelected = false;
        Object.keys(this.scope.weekdays).map(weekday => {
          if (this.scope.weekdays[weekday]) {
            someWeekdaySelected = true;
          }
        });
        if (!someWeekdaySelected) {
          valid = false;
          this.scope.errorText += 'Ainakin yhden viikonpäivän täytyy olla valittu. ';
        }
      } else if (this.mTypeInput.value === '4') {
        let someMonthSelected = false;
        Object.keys(this.scope.months).map(month => {
          if (this.scope.months[month]) {
            someMonthSelected = true;
          }
        });
        if (!someMonthSelected) {
          valid = false;
          this.scope.errorText += 'Ainakin yhden kuukauden täytyy olla valittu. ';
        }
        if (this.scope.dayOfMonthOrWeekSelected.value === MONTH) {
          if (!this.scope.dayOfMonth || !/^[0-9]*$/.test(this.scope.dayOfMonth)) {
            valid = false;
            this.scope.errorText += 'Kentän "Toistetaan kuukauden päivänä" täytyy sisältää kokonaisluku. ';
          }
        } else if (this.scope.dayOfMonthOrWeekSelected.value === WEEK) {
          let someWeekdaySelected = false;
          Object.keys(this.scope.monthlyWeekdays).map(weekday => {
            if (this.scope.monthlyWeekdays[weekday]) {
              someWeekdaySelected = true;
            }
          });
          if (!someWeekdaySelected) {
            valid = false;
            this.scope.errorText += 'Ainakin yhden viikonpäivän täytyy olla valittu. ';
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
      const duration = this.scope.strictEndTimeSelected ? this.getStrictEndTimeDuration() : this.durationInput.value;
      const stopDateTime = moment(startDate).add(duration, 'second').toDate();
      if (this.mTypeInput.value === '2' || this.mTypeInput.value === '3' || this.mTypeInput.value === '4') {
        if (stopPeriodDate <= startDate) {
          valid = false;
          this.scope.errorText += 'Toiston päättymisaika pitää olla huollon alkamisajan jälkeen. ';
        } else if (stopPeriodDate < currentDate) {
          valid = false;
          this.scope.errorText += 'Toiston päättymisaika ei voi olla menneisyydessä. ';
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
          this.scope.errorText += 'Toiston päättymisaika ei voi ylittää kesä/talviaika vaihdosta ' + 
            nextChange.format(('DD.MM.YYYY HH:mm')) + ' ';
        }
      }
      if (this.mTypeInput.value === '0' && this.scope.strictEndTimeSelected && this.getStrictEndTimeDuration() <= 0) {
        valid = false;
        this.scope.errorText += 'Huollon päättymisajan pitää olla huollon alkamisajan jälkeen. ';
      }
      if (this.mTypeInput.value === '0' && stopDateTime < currentDate) {
        valid = false;
        this.scope.errorText += 'Huollon päättymisaika ei voi olla menneisyydessä. ';
      }
      if (valid) {
        this.scope.wizardPhase = 2;
      }
    } else {
      let anyHostSelected = false;
      this.scope.hosts.options.forEach((option: any) => {
        if (this.scope.hosts.selected[option.value]) {
          anyHostSelected = true;
        }
      });
      const maintenanceName = (this.description || '') + '|' + this.scope.user + '|' + this.getCurrentTimeEpoch()();
      if (!anyHostSelected) {
        this.scope.errorText = "Ainakin yhden palvelimen täytyy olla valittu";
        valid = false;
      } else if (maintenanceName.length > 128) {
        const excessLength = maintenanceName.length - 128;
        this.scope.errorText = "Huollon kuvaus on " + excessLength + " merkkiä liian pitkä";
        valid = false;
      }
      if (valid) {
        this.scope.wizardPhase = 3;
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
        this.scope.hosts.options.forEach((option: any) => {
          if (this.scope.hosts.selected[option.value]) {
            if (this.displayHosts) {
              this.displayHosts += ', ';
            }
            this.displayHosts += option.text;
          }
        });
        this.displayWeeklyDays = '';
        Object.keys(this.scope.weekdays).forEach((weekday: string) => {
          if (this.scope.weekdays[weekday]) {
            if (this.displayWeeklyDays) {
              this.displayWeeklyDays += ', ';
            }
            this.displayWeeklyDays += this.weekdayNames[weekday];
          }
        });
        this.displayMonths = '';
        Object.keys(this.scope.months).forEach((month: string) => {
          if (this.scope.months[month]) {
            if (this.displayMonths) {
              this.displayMonths += ', ';
            }
            this.displayMonths += this.monthNames[month];
          }
        });
        this.displayMonthlyWeekdayNumber = this.everyDayOfWeekInput.options.find((option: any) => option.value === this.everyDayOfWeekInput.value).text;
        this.displayMonthlyWeekdayNames = '';
        Object.keys(this.scope.monthlyWeekdays).forEach((weekday: string) => {
          if (this.scope.monthlyWeekdays[weekday]) {
            if (this.displayMonthlyWeekdayNames) {
              this.displayMonthlyWeekdayNames += ', ';
            }
            this.displayMonthlyWeekdayNames += this.weekdayNames[weekday];
          }
        });
      }
    }
  }

  /**
   * Callback for go previous button
   */
  goToPrevious = () => {
    this.scope.wizardPhase--;
  }

  render() {
    const { show, onDismiss, selectedMaintenanceId } = this.props;
    const { wizardPhase, mTypeInput } = this.state;
    const title = (<h2 className="modal-header modal-header-title">{selectedMaintenanceId ? 'Muokkaa huoltoa' : 'Luo uusi huolto'}</h2>);

    return (
      <>
        <Modal isOpen={show} title={title} onDismiss={onDismiss} className="modal modal-body">
          <div>
            <div className="modal-content">
              { wizardPhase === 1 ? (
                <div className="gf-form-group maintenance-row-container">
                  <label className="gf-form-label">Huollon tyyppi</label>
                  <div className="gf-form-select-wrapper iiris-fixed-width-select">
                    <Select value={mTypeInput} options={this.mTypeInput.options} onChange={(v: any) => this.onMaintenanceTypeChanged(v.value)} />
                  </div>
                </div>) : null }
                {/* <div class="gf-form-group maintenance-row-container" ng-if="ctrl.mTypeInput.value=='2'">
                  <label class="gf-form-label">Toistetaan [n] päivän välein</label>
                  <div>
                    <input class="input-small gf-form-input iiris-fixed-width-select" type="number" ng-model="ctrl.scope.everyNDays" min="1" step="1" />
                  </div>
                </div>
                <div class="gf-form-group maintenance-row-container" ng-if="ctrl.mTypeInput.value=='3'">
                  <label class="gf-form-label">Toistetaan [n] viikon välein</label>
                  <div>
                    <input class="input-small gf-form-input iiris-fixed-width-select" type="number" ng-model="ctrl.scope.everyNWeeks" min="1" step="1" />
                  </div>
                </div>
                <div class="gf-form-group maintenance-row-container" ng-if="ctrl.mTypeInput.value=='3'">
                  <label class="gf-form-label">Toistetaan viikonpäivänä</label>
                  <div class="checkbox-block">
                    <div class="checkbox-container">
                      <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.weekdays.monday" id="monday" />
                      <label class="gf-form-label checkbox-label" for="monday">Maanantai</label>
                    </div>
                    <div class="checkbox-container">
                      <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.weekdays.tuesday" id="tuesday" />
                      <label class="gf-form-label checkbox-label" for="tuesday">Tiistai</label>
                    </div>
                    <div class="checkbox-container">
                      <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.weekdays.wednesday" id="wednesday" />
                      <label class="gf-form-label checkbox-label" for="wednesday">Keskiviikko</label>
                    </div>
                    <div class="checkbox-container">
                      <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.weekdays.thursday" id="thursday" />
                      <label class="gf-form-label checkbox-label" for="thursday">Torstai</label>
                    </div>
                    <div class="checkbox-container">
                      <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.weekdays.friday" id="friday" />
                      <label class="gf-form-label checkbox-label" for="friday">Perjantai</label>
                    </div>
                    <div class="checkbox-container">
                      <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.weekdays.saturday" id="saturday" />
                      <label class="gf-form-label checkbox-label" for="saturday">Lauantai</label>
                    </div>
                    <div class="checkbox-container">
                      <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.weekdays.sunday" id="sunday" />
                      <label class="gf-form-label checkbox-label" for="sunday">Sunnuntai</label>
                    </div>
                  </div>
                </div>
                <div class="gf-form-group maintenance-row-container" ng-if="ctrl.mTypeInput.value=='4'">
                  <label class="gf-form-label">Toistetaan kuukautena</label>
                  <div class="checkbox-block">
                    <div class="checkbox-column">
                      <div class="checkbox-container">
                        <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.months.january" id="january" ng-change="ctrl.toggleMonthSelection()" />
                        <label class="gf-form-label checkbox-label width-8" for="january">Tammikuu</label>
                      </div>
                      <div class="checkbox-container">
                        <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.months.february" id="february" ng-change="ctrl.toggleMonthSelection()" />
                        <label class="gf-form-label checkbox-label width-8" for="february">Helmikuu</label>
                      </div>
                      <div class="checkbox-container">
                        <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.months.march" id="march" ng-change="ctrl.toggleMonthSelection()" />
                        <label class="gf-form-label checkbox-label width-8" for="march">Maaliskuu</label>
                      </div>
                    </div>
                    <div class="checkbox-column">
                      <div class="checkbox-container">
                        <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.months.april" id="april" ng-change="ctrl.toggleMonthSelection()" />
                        <label class="gf-form-label checkbox-label width-8" for="april">Huhtikuu</label>
                      </div>
                      <div class="checkbox-container">
                        <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.months.may" id="may" ng-change="ctrl.toggleMonthSelection()" />
                        <label class="gf-form-label checkbox-label width-8" for="may">Toukokuu</label>
                      </div>
                      <div class="checkbox-container">
                        <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.months.june" id="june" ng-change="ctrl.toggleMonthSelection()" />
                        <label class="gf-form-label checkbox-label width-8" for="june">Kesäkuu</label>
                      </div>
                    </div>
                    <div class="checkbox-column">
                      <div class="checkbox-container">
                        <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.months.july" id="july" ng-change="ctrl.toggleMonthSelection()" />
                        <label class="gf-form-label checkbox-label width-8" for="july">Heinäkuu</label>
                      </div>
                      <div class="checkbox-container">
                        <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.months.august" id="august" ng-change="ctrl.toggleMonthSelection()" />
                        <label class="gf-form-label checkbox-label width-8" for="august">Elokuu</label>
                      </div>
                      <div class="checkbox-container">
                        <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.months.september" id="september" ng-change="ctrl.toggleMonthSelection()" />
                        <label class="gf-form-label checkbox-label width-8" for="september">Syyskuu</label>
                      </div>
                    </div>
                    <div class="checkbox-column">
                      <div class="checkbox-container">
                        <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.months.october" id="october" ng-change="ctrl.toggleMonthSelection()" />
                        <label class="gf-form-label checkbox-label width-8" for="october">Lokakuu</label>
                      </div>
                      <div class="checkbox-container">
                        <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.months.november" id="november" ng-change="ctrl.toggleMonthSelection()" />
                        <label class="gf-form-label checkbox-label width-8" for="november">Marraskuu</label>
                      </div>
                      <div class="checkbox-container">
                        <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.months.december" id="december" ng-change="ctrl.toggleMonthSelection()" />
                        <label class="gf-form-label checkbox-label width-8" for="december">Joulukuu</label>
                      </div>
                    </div>
                    <div class="checkbox-column">
                      <div class="checkbox-container">
                        <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.months.all" id="all" ng-change="ctrl.toggleAllMonthsSelection()" />
                        <label class="gf-form-label checkbox-label width-8" for="all">Valitse kaikki</label>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="gf-form-group maintenance-row-container iiris-modal-column-container" ng-if="ctrl.mTypeInput.value=='4'">
                  <div class="iiris-modal-column">
                    <label class="gf-form-label iiris-radio-button-block">Toistetaan
                      <div class="checkbox-container">
                        <input class="action-panel-cb" type="radio" name="monthtype" ng-model="ctrl.scope.dayOfMonthOrWeekSelected.value" value="MONTH" id="dayOfMonthSelected" />
                        <label class="gf-form-label checkbox-label width-12" for="dayOfMonthSelected">Kuukauden päivänä n</label>
                      </div>
                      <div class="checkbox-container">
                        <input class="action-panel-cb" type="radio" name="monthtype" ng-model="ctrl.scope.dayOfMonthOrWeekSelected.value" value="WEEK" id="dayOfWeekSelected" />
                        <label class="gf-form-label checkbox-label width-12" for="dayOfWeekSelected">Viikonpäivänä n</label>
                      </div>
                    </label>
                  </div>
                  <div class="iiris-modal-column">
                    <div class="gf-form-group" ng-if="ctrl.scope.dayOfMonthOrWeekSelected.value=='MONTH'">
                      <label class="gf-form-label">Toistetaan kuukauden päivänä</label>
                      <div>
                        <input class="input-small gf-form-input iiris-fixed-width-select" type="number" ng-model="ctrl.scope.dayOfMonth" min="1" step="1" />
                      </div>
                    </div>
                    <div class="gf-form-group" ng-if="ctrl.scope.dayOfMonthOrWeekSelected.value=='WEEK'">
                      <label class="gf-form-label">Toistetaan viikonpäivänä (esim. kuukauden toinen tiistai)</label>
                      <div class="gf-form-select-wrapper">
                        <select class="gf-form-input" ng-model="ctrl.everyDayOfWeekInput.value" ng-options="v.value as v.text for v in ctrl.everyDayOfWeekInput.options">
                          <option value="" ng-hide="ctrl.everyDayOfWeekInput.value">{{ctrl.everyDayOfWeekInput.text}}</option>
                        </select>
                      </div>
                      <div class="checkbox-block checkbox-top-spacer">
                        <div class="checkbox-container">
                          <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.monthlyWeekdays.monday" id="monday" />
                          <label class="gf-form-label checkbox-label" for="monday">Maanantai</label>
                        </div>
                        <div class="checkbox-container">
                          <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.monthlyWeekdays.tuesday" id="tuesday" />
                          <label class="gf-form-label checkbox-label" for="tuesday">Tiistai</label>
                        </div>
                        <div class="checkbox-container">
                          <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.monthlyWeekdays.wednesday" id="wednesday" />
                          <label class="gf-form-label checkbox-label" for="wednesday">Keskiviikko</label>
                        </div>
                        <div class="checkbox-container">
                          <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.monthlyWeekdays.thursday" id="thursday" />
                          <label class="gf-form-label checkbox-label" for="thursday">Torstai</label>
                        </div>
                        <div class="checkbox-container">
                          <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.monthlyWeekdays.friday" id="friday" />
                          <label class="gf-form-label checkbox-label" for="friday">Perjantai</label>
                        </div>
                        <div class="checkbox-container">
                          <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.monthlyWeekdays.saturday" id="saturday" />
                          <label class="gf-form-label checkbox-label" for="saturday">Lauantai</label>
                        </div>
                        <div class="checkbox-container">
                          <input class="action-panel-cb" type="checkbox" ng-model="ctrl.scope.monthlyWeekdays.sunday" id="sunday" />
                          <label class="gf-form-label checkbox-label" for="sunday">Sunnuntai</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="gf-form-group maintenance-row-container iiris-modal-column-container">
                  <div class="iiris-modal-column">
                    <label class="gf-form-label" ng-if="ctrl.mTypeInput.value=='0'">Huollon alkamisajankohta</label>
                    <label class="gf-form-label" ng-if="ctrl.mTypeInput.value!='0'">Aloita toisto</label>
                    <div class="date-selection-row">
                      <div class="date-selection-container">
                        <div>Päivä</div>
                        <div class="gf-form-select-wrapper">
                          <select class="gf-form-input" ng-model="ctrl.dayInput.value" ng-options="v.value as v.text for v in ctrl.dayInput.options" ng-change="ctrl.onDayValueChanged()">
                            <option value="" ng-hide="ctrl.dayInput.value">{{ctrl.dayInput.text}}</option>
                          </select>
                        </div>
                      </div>
                      <div class="date-selection-container">
                        <div>Kuukausi</div>
                        <div class="gf-form-select-wrapper">
                          <select class="gf-form-input" ng-model="ctrl.monthInput.value" ng-options="v.value as v.text for v in ctrl.monthInput.options" ng-change="ctrl.onMonthValueChanged()">
                            <option value="" ng-hide="ctrl.monthInput.value">{{ctrl.monthInput.text}}</option>
                          </select>
                        </div>
                      </div>
                      <div class="date-selection-container">
                        <div>Vuosi</div>
                        <div class="gf-form-select-wrapper">
                          <select class="gf-form-input" ng-model="ctrl.yearInput.value" ng-options="v.value as v.text for v in ctrl.yearInput.options" ng-change="ctrl.onYearValueChanged()">
                            <option value="" ng-hide="ctrl.yearInput.value">{{ctrl.yearInput.text}}</option>
                          </select>
                        </div>
                      </div>
                      <div class="date-selection-container hour-input">
                        <div>Tunti</div>
                        <div class="gf-form-select-wrapper">
                          <select class="gf-form-input" ng-model="ctrl.hourInput.value" ng-options="v.value as v.text for v in ctrl.hourInput.options" ng-change="ctrl.onHourValueChanged()">
                            <option value="" ng-hide="ctrl.hourInput.value">{{ctrl.hourInput.text}}</option>
                          </select>
                        </div>
                      </div>
                      <div class="date-selection-container">
                        <div>Minuutti</div>
                        <div class="gf-form-select-wrapper">
                          <select class="gf-form-input" ng-model="ctrl.minuteInput.value" ng-options="v.value as v.text for v in ctrl.minuteInput.options" ng-change="ctrl.onMinuteValueChanged()">
                            <option value="" ng-hide="ctrl.minuteInput.value">{{ctrl.minuteInput.text}}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="iiris-modal-column" ng-if="ctrl.mTypeInput.value=='2'||ctrl.mTypeInput.value=='3'||ctrl.mTypeInput.value=='4'">
                    <label class="gf-form-label">Lopeta toisto</label>
                    <div class="date-selection-row">
                      <div class="date-selection-container">
                        <div>Päivä</div>
                        <div class="gf-form-select-wrapper">
                          <select class="gf-form-input" ng-model="ctrl.dayStopInput.value" ng-options="v.value as v.text for v in ctrl.dayStopInput.options">
                            <option value="" ng-hide="ctrl.dayStopInput.value">{{ctrl.dayStopInput.text}}</option>
                          </select>
                        </div>
                      </div>
                      <div class="date-selection-container">
                        <div>Kuukausi</div>
                        <div class="gf-form-select-wrapper">
                          <select class="gf-form-input" ng-model="ctrl.monthStopInput.value" ng-options="v.value as v.text for v in ctrl.monthStopInput.options" ng-change="ctrl.onMonthStopValueChanged()">
                            <option value="" ng-hide="ctrl.monthStopInput.value">{{ctrl.monthStopInput.text}}</option>
                          </select>
                        </div>
                      </div>
                      <div class="date-selection-container">
                        <div>Vuosi</div>
                        <div class="gf-form-select-wrapper">
                          <select class="gf-form-input" ng-model="ctrl.yearStopInput.value" ng-options="v.value as v.text for v in ctrl.yearStopInput.options" ng-change="ctrl.onYearStopValueChanged()">
                            <option value="" ng-hide="ctrl.yearStopInput.value">{{ctrl.yearStopInput.text}}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="gf-form-group maintenance-row-container" ng-if="!ctrl.scope.strictEndTimeSelected">
                  <label class="gf-form-label">Huollon kesto</label>
                  <div class="gf-form-select-wrapper iiris-fixed-width-select">
                    <select class="gf-form-input" ng-model="ctrl.durationInput.value" ng-options="v.value as v.text for v in ctrl.durationInput.options" ng-change="ctrl.onDurationValueChanged()">
                      <option value="" ng-hide="ctrl.durationInput.value">{{ctrl.durationInput.text}}</option>
                    </select>
                  </div>
                </div>
                <div class="gf-form-group maintenance-row-container">
                  <div class="iiris-checkbox">
                    <input id="strict_end_time" type="checkbox" ng-model="ctrl.scope.strictEndTimeSelected" />
                    <label class="checkbox-label" for="strict_end_time">Määritä tarkka päättymisajankohta</label>
                  </div>
                </div>
                <div class="gf-form-group maintenance-row-container" ng-if="ctrl.scope.strictEndTimeSelected">
                  <label class="gf-form-label">Huollon päättymisajankohta</label>
                  <div class="date-selection-row">
                    <div class="date-selection-container">
                      <div>Päivä</div>
                      <div class="gf-form-select-wrapper">
                        <select class="gf-form-input" ng-model="ctrl.strictEndDayInput.value" ng-options="v.value as v.text for v in ctrl.strictEndDayInput.options">
                          <option value="" ng-hide="ctrl.strictEndDayInput.value">{{ctrl.strictEndDayInput.text}}</option>
                        </select>
                      </div>
                    </div>
                    <div class="date-selection-container">
                      <div>Kuukausi</div>
                      <div class="gf-form-select-wrapper">
                        <select class="gf-form-input" ng-model="ctrl.strictEndMonthInput.value" ng-options="v.value as v.text for v in ctrl.strictEndMonthInput.options" ng-change="ctrl.onStrictEndMonthValueChanged()">
                          <option value="" ng-hide="ctrl.strictEndMonthInput.value">{{ctrl.strictEndMonthInput.text}}</option>
                        </select>
                      </div>
                    </div>
                    <div class="date-selection-container">
                      <div>Vuosi</div>
                      <div class="gf-form-select-wrapper">
                        <select class="gf-form-input" ng-model="ctrl.strictEndYearInput.value" ng-options="v.value as v.text for v in ctrl.strictEndYearInput.options" ng-change="ctrl.onStrictEndYearValueChanged()">
                          <option value="" ng-hide="ctrl.strictEndYearInput.value">{{ctrl.strictEndYearInput.text}}</option>
                        </select>
                      </div>
                    </div>
                    <div class="date-selection-container hour-input">
                      <div>Tunti</div>
                      <div class="gf-form-select-wrapper">
                        <select class="gf-form-input" ng-model="ctrl.strictEndHourInput.value" ng-options="v.value as v.text for v in ctrl.strictEndHourInput.options">
                          <option value="" ng-hide="ctrl.strictEndHourInput.value">{{ctrl.strictEndHourInput.text}}</option>
                        </select>
                      </div>
                    </div>
                    <div class="date-selection-container">
                      <div>Minuutti</div>
                      <div class="gf-form-select-wrapper">
                        <select class="gf-form-input" ng-model="ctrl.strictEndMinuteInput.value" ng-options="v.value as v.text for v in ctrl.strictEndMinuteInput.options">
                          <option value="" ng-hide="ctrl.strictEndMinuteInput.value">{{ctrl.strictEndMinuteInput.text}}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="maintenance-config-error-text">{{ctrl.scope.errorText}}</div>
                <div class="gf-form-button-row">
                  <a class="btn btn-secondary" ng-click="ctrl.openAllMaintenancesModal()()">Takaisin</a>
                  <a class="btn btn-secondary" ng-click="ctrl.dismiss()">Peruuta</a>
                  <a class="btn btn-primary" ng-click="ctrl.goToNext()">Eteenpäin</a>
              </div>
              ) : null */ }
              { /* wizardPhase === 2 ? (
                <div class="gf-form-group maintenance-row-container">
                  <label class="gf-form-label">Huollon kuvaus</label>
                  <textarea class="gf-form-input" ng-model="ctrl.description" rows="3" maxlength="128"></textarea>
                </div>
                <label class="gf-form-label">Palvelimien valinta</label>
                <div class="iiris-text-search-container">
                  <span class="iiris-search-icon fa fa-search"></span>
                  <input class="input-small gf-form-input iiris-fixed-width-select" type="text" ng-model="ctrl.search.text" placeholder="Hae nimellä">
                </div>
                <div class="gf-form-group maintenance-host-list">
                  <div class="iiris-checkbox" ng-if="!ctrl.search.text">
                    <input id="select_all" type="checkbox" ng-model="ctrl.scope.hosts.allSelected" ng-change="ctrl.selectAllHosts()" />
                    <label class="checkbox-label" for="select_all">Kaikki palvelimet</label>
                  </div>
                  <div class="iiris-checkbox" ng-repeat="item in ctrl.scope.hosts.options | filter:ctrl.search">
                    <input id="cb{{item.value}}" type="checkbox" ng-model="ctrl.scope.hosts.selected[item.value]" ng-change="ctrl.selectHost(item.value)" ng-value="item" />
                    <label class="checkbox-label" for="cb{{item.value}}">{{item.text}}</label>
                  </div>
                </div>
                <div class="maintenance-config-error-text">{{ctrl.scope.errorText}}</div>
                <div class="gf-form-button-row">
                  <a class="btn btn-secondary" ng-click="ctrl.goToPrevious()">Takaisin</a>
                  <a class="btn btn-secondary" ng-click="ctrl.dismiss()">Peruuta</a>
                  <a class="btn btn-primary" ng-click="ctrl.goToNext()" ng-if="!ctrl.scope.selectedMaintenance">Luo huolto</a>
                  <a class="btn btn-primary" ng-click="ctrl.goToNext()" ng-if="ctrl.scope.selectedMaintenance">Tallenna muutokset</a>
                </div>
              ) : null */}
              {/* wizardPhase === 3 ? (
                <div class="iiris-maintenance-modal-text-row">
                  <div class="iiris-maintenance-modal-text-label">Kuvaus</div>
                  <div class="iiris-maintenance-modal-text-normal">{{ctrl.description}}</div>
                </div>
                <div class="iiris-maintenance-modal-text-row">
                  <div class="iiris-maintenance-modal-text-label">Palvelimet</div>
                  <div class="iiris-maintenance-modal-text-normal">{{ctrl.displayHosts}}</div>
                </div>
                <div class="iiris-maintenance-modal-text-row">
                  <div class="iiris-maintenance-modal-text-label">Huollon tyyppi</div>
                  <div class="iiris-maintenance-modal-text-normal">{{ctrl.maintenanceType}}</div>
                </div>
                <div ng-if="ctrl.mTypeInput.value==0">
                  <div class="iiris-maintenance-modal-text-row">
                    <div class="iiris-maintenance-modal-text-label">Huollon alkamisajankohta</div>
                    <div class="iiris-maintenance-modal-text-normal">{{ctrl.displayStartDate}}</div>
                  </div>
                  <div class="iiris-maintenance-modal-text-row">
                    <div class="iiris-maintenance-modal-text-label">Huollon päättymisajankohta</div>
                    <div class="iiris-maintenance-modal-text-normal">{{ctrl.displayStopDate}}</div>
                  </div>
                </div>
                <div ng-if="ctrl.mTypeInput.value==2">
                  <div class="iiris-maintenance-modal-text-row">
                    <div class="iiris-maintenance-modal-text-label">Toistetaan [n] päivän välein</div>
                    <div class="iiris-maintenance-modal-text-normal">{{ctrl.scope.everyNDays}}</div>
                  </div>
                </div>
                <div ng-if="ctrl.mTypeInput.value==3">
                  <div class="iiris-maintenance-modal-text-row">
                    <div class="iiris-maintenance-modal-text-label">Toistetaan [n] viikon välein</div>
                    <div class="iiris-maintenance-modal-text-normal">{{ctrl.scope.everyNWeeks}}</div>
                  </div>
                  <div class="iiris-maintenance-modal-text-row">
                    <div class="iiris-maintenance-modal-text-label">Toistetaan viikonpäivänä</div>
                    <div class="iiris-maintenance-modal-text-normal">{{ctrl.displayWeeklyDays}}</div>
                  </div>
                </div>
                <div ng-if="ctrl.mTypeInput.value==4">
                  <div class="iiris-maintenance-modal-text-row">
                    <div class="iiris-maintenance-modal-text-label">Toistetaan kuukautena</div>
                    <div class="iiris-maintenance-modal-text-normal">{{ctrl.displayMonths}}</div>
                  </div>
                  <div ng-if="ctrl.scope.dayOfMonthOrWeekSelected.value=='MONTH'">
                    <div class="iiris-maintenance-modal-text-row">
                      <div class="iiris-maintenance-modal-text-label">Toistetaan kuukauden päivänä n</div>
                      <div class="iiris-maintenance-modal-text-normal">{{ctrl.scope.dayOfMonth}}</div>
                    </div>
                  </div>
                  <div ng-if="ctrl.scope.dayOfMonthOrWeekSelected.value=='WEEK'">
                    <div class="iiris-maintenance-modal-text-row">
                      <div class="iiris-maintenance-modal-text-label">Toistetaan viikon päivänä</div>
                      <div class="iiris-maintenance-modal-text-normal">{{ctrl.displayMonthlyWeekdayNumber + ' ' + ctrl.displayMonthlyWeekdayNames}}</div>
                    </div>
                  </div>
                </div>
                <div ng-if="ctrl.mTypeInput.value>0">
                  <div class="iiris-maintenance-modal-text-row">
                    <div class="iiris-maintenance-modal-text-label">Huollon alkamisajankohta</div>
                    <div class="iiris-maintenance-modal-text-normal">{{ctrl.displayStartDate}}</div>
                  </div>
                  <div class="iiris-maintenance-modal-text-row">
                    <div class="iiris-maintenance-modal-text-label">Huollon päättymisajankohta</div>
                    <div class="iiris-maintenance-modal-text-normal">{{ctrl.displayStopDate}}</div>
                  </div>
                  <div class="iiris-maintenance-modal-text-row">
                    <div class="iiris-maintenance-modal-text-label">Aloita toisto</div>
                    <div class="iiris-maintenance-modal-text-normal">{{ctrl.displayStartDate}}</div>
                  </div>
                  <div class="iiris-maintenance-modal-text-row">
                    <div class="iiris-maintenance-modal-text-label">Lopeta toisto</div>
                    <div class="iiris-maintenance-modal-text-normal">{{ctrl.displayRepeatStopDate}}</div>
                  </div>
                </div>
                <div class="gf-form-button-row">
                  <a class="btn btn-secondary" ng-click="ctrl.goToPrevious()">Takaisin</a>
                  <a class="btn btn-secondary" ng-click="ctrl.dismiss()">Peruuta</a>
                  <a class="btn btn-primary" ng-click="ctrl.onStartMaintenance()" ng-if="!ctrl.scope.selectedMaintenance">Luo huolto</a>
                  <a class="btn btn-primary" ng-click="ctrl.onStartMaintenance()" ng-if="ctrl.scope.selectedMaintenance">Tallenna muutokset</a>
                </div>
              ) : null */}
            </div>
          </div>
        </Modal>
      </>
    );
  }
}
