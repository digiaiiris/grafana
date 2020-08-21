/* eslint-disable */
/* tslint:disable */
/**
 * <h3>Maintenance Modal Dialog</h3>
 * You can initiate Zabbix maintenance from this dialog.
 */

import coreModule from 'app/core/core_module';
import appEvents from 'app/core/app_events';
import _ from 'lodash';
import moment from 'moment'; // eslint-disable-line no-restricted-imports

const WEEK = 'WEEK';
const MONTH = 'MONTH';

export class IirisMaintenanceModalCtrl {
  scope: any;
  hosts: any;
  user: string;
  onCreateMaintenance: any;
  selectedMaintenance: any;
  getCurrentTimeEpoch: any;
  description: string;
  durationInput: {
    options: any;
    value: number;
    text: string;
    isValid: boolean;
  };
  mTypeInput: {
    options: any;
    value: string;
    text: string;
  };
  yearInput: {
    options: any;
    value: number;
    text: string;
  };
  monthInput: {
    options: any;
    value: number;
    text: string;
  };
  dayInput: {
    options: any;
    value: number;
    text: string;
  };
  hourInput: {
    options: any;
    value: string;
    text: string;
  };
  minuteInput: {
    options: any;
    value: string;
    text: string;
  };
  yearStopInput: {
    options: any;
    value: number;
    text: string;
  };
  monthStopInput: {
    options: any;
    value: number;
    text: string;
  };
  dayStopInput: {
    options: any;
    value: number;
    text: string;
  };
  everyDayOfWeekInput: {
    options: any;
    value: number;
    text: string;
  };
  strictEndHourInput: {
    options: any;
    value: string;
    text: string;
  };
  strictEndMinuteInput: {
    options: any;
    value: string;
    text: string;
  };
  strictEndYearInput: {
    options: any;
    value: number;
    text: string;
  };
  strictEndMonthInput: {
    options: any;
    value: number;
    text: string;
  };
  strictEndDayInput: {
    options: any;
    value: number;
    text: string;
  };

  /**
   * Maintenance Modal class constructor
   */
  constructor() {
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
        { text: 'Yksittäinen', value: '0' },
        { text: 'Päivittäinen', value: '2' },
        { text: 'Viikottainen', value: '3' },
        { text: 'Kuukausittainen', value: '4' },
      ],
    };
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
    let currentDate = new Date();
    let currentHours = currentDate.getHours();
    let currentMinutes = currentDate.getMinutes();
    if (this.scope.selectedMaintenance) {
      if (this.scope.selectedMaintenance.maintenanceType > 0) {
        currentDate = new Date(this.scope.selectedMaintenance.activeSince * 1000);
      } else {
        currentDate = new Date(this.scope.selectedMaintenance.startTime * 1000);
      }
      const currentStartTime = new Date(this.scope.selectedMaintenance.startTime * 1000);
      currentHours = currentStartTime.getHours();
      currentMinutes = currentStartTime.getMinutes();
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
    const strictEndTimeHours = strictEndTimeDate.getHours();
    const strictEndTimeMinutes = strictEndTimeDate.getMinutes();
    const strictEndTimeYear = strictEndTimeDate.getFullYear();
    const strictEndTimeMonth = strictEndTimeDate.getMonth() + 1;
    const strictEndTimeDay = strictEndTimeDate.getDate();
    this.populateYearSelector(this.strictEndYearInput, strictEndTimeYear);
    this.populateMonthSelector(this.strictEndMonthInput, strictEndTimeMonth);
    this.strictEndDayInput.value = strictEndTimeDay;
    this.strictEndDayInput.text = '' + strictEndTimeDay;
    this.populateDaySelector(null, true);
    this.populateHourSelector(this.strictEndHourInput, strictEndTimeHours);
    this.populateMinuteSelector(this.strictEndMinuteInput, strictEndTimeMinutes);
    // Populate form with preselected maintenance values
    if (this.scope.selectedMaintenance) {
      const m = this.scope.selectedMaintenance;
      this.description = m.description;
      const typeObj =
        this.mTypeInput.options.find((item: any) => item.value === m.maintenanceType + '') ||
        this.mTypeInput.options[0];
      this.mTypeInput.value = typeObj.value;
      this.mTypeInput.text = typeObj.text;
      const durObj =
        this.durationInput.options.find((item: any) => item.value === m.duration) || this.durationInput.options[0];
      this.durationInput.value = durObj.value;
      this.durationInput.text = durObj.text;
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
          this.scope.hosts.selected[index] = false;
          this.scope.hosts.allSelected = false;
        }
      });
    }
    this.scope.strictEndTimeSelected = false;
  }

  /**
   * Callback for starting maintenance
   * @param {MouseEvent} event
   */
  onStartMaintenance(event: MouseEvent) {
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
    stopDate = moment
      .utc(stopDate)
      .endOf('day')
      .toDate();
    if (maintenanceType === 2 || maintenanceType === 3 || maintenanceType === 4) {
      options.start_time = moment.utc(startDate).hour() * 60 * 60 + moment.utc(startDate).minute() * 60;
    }
    let anyHostSelected = false;
    const hostIds = [];
    for (let i = 0; i < this.scope.hosts.selected.length; i++) {
      if (this.scope.hosts.selected[i]) {
        anyHostSelected = true;
        hostIds.push(this.scope.hosts.options[i].value);
      }
    }
    const maintenanceName = (this.description || '') + '|' + this.scope.user + '|' + this.getCurrentTimeEpoch()();
    if (!anyHostSelected) {
      this.scope.errorText = "Ainakin yhden palvelimen täytyy olla valittu";
    } else if (maintenanceName.length > 128) {
      const excessLength = maintenanceName.length - 128;
      this.scope.errorText = "Huollon kuvaus on " + excessLength + " merkkiä liian pitkä";
    } else {
      this.onCreateMaintenance()(
        maintenanceType,
        maintenanceName,
        this.durationInput.value,
        hostIds,
        options,
        startDate,
        stopDate,
        this.scope.selectedMaintenance ? this.scope.selectedMaintenance.id : null
      );
      this.dismiss();
    }
  }

  /**
   * Callback for select value changed
   */
  onDurationValueChanged() {
    if (this.durationInput.value > 0) {
      this.durationInput.isValid = true;
    } else {
      this.durationInput.isValid = false;
    }
  }

  /**
   * Set contents of year selector
   */
  populateYearSelector(yearInputObject: any, yearValue: number) {
    yearInputObject.value = yearValue;
    yearInputObject.text = '' + yearValue;
    for (let i = yearValue; i < yearValue + 2; i++) {
      yearInputObject.options.push({
        text: '' + i,
        value: i,
      });
    }
  }

  /**
   * Set contents of month selector
   */
  populateMonthSelector(monthInputObject: any, monthValue: number) {
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
  populateDaySelector(isStopDate?: boolean, isStrictEndDate?: boolean) {
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
  populateHourSelector(hourInputObject: any, hourValue: number) {
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
  populateMinuteSelector(minuteInputObject: any, minuteValue: number) {
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

  /**
   * Count maintenance duration if strict end time is selected
   */
  getStrictEndTimeDuration() {
    const startDate = new Date(
      this.yearInput.value,
      this.monthInput.value - 1,
      this.dayInput.value,
      parseInt(this.hourInput.value, 10),
      parseInt(this.minuteInput.value, 10)
    );
    const stopDate = new Date(
      this.strictEndYearInput.value,
      this.strictEndMonthInput.value - 1,
      this.strictEndDayInput.value,
      parseInt(this.strictEndHourInput.value, 10),
      parseInt(this.strictEndMinuteInput.value, 10)
    );
    const duration = Math.round((stopDate.getTime() - startDate.getTime()) / 1000);
    return duration;
  }

  /**
   * Callback for select month
   */
  onMonthValueChanged() {
    this.populateDaySelector();
  }

  /**
   * Callback for select year
   */
  onYearValueChanged() {
    const m = this.monthInput.value;
    const y = this.yearInput.value;
    if (((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) && m === 2) {
      this.populateDaySelector();
    }
  }

  /**
   * Callback for select month
   */
  onMonthStopValueChanged() {
    this.populateDaySelector(true);
  }

  /**
   * Callback for select year
   */
  onYearStopValueChanged() {
    const m = this.monthStopInput.value;
    const y = this.yearStopInput.value;
    if (((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) && m === 2) {
      this.populateDaySelector(true);
    }
  }

  /**
   * Callback for select strict end month
   */
  onStrictEndMonthValueChanged() {
    this.populateDaySelector(null, true);
  }

  /**
   * Callback for select strict year
   */
  onStrictEndYearValueChanged() {
    const m = this.strictEndMonthInput.value;
    const y = this.strictEndYearInput.value;
    if (((y % 4 === 0 && y % 100 !== 0) || y % 400 === 0) && m === 2) {
      this.populateDaySelector(null, true);
    }
  }

  /**
   * Callback for selecting strict end time
   */
  selectStrictEndTime() {
    // this.scope.strictEndTimeSelected = !this.scope.strictEndTimeSelected;
  }

  /**
   * Callback for selecting all hosts
   */
  selectAllHosts() {
    const allSelected = this.scope.hosts.allSelected;
    for (let i = 0; i < this.scope.hosts.options.length; i++) {
      this.scope.hosts.options[i].checked = allSelected;
      this.scope.hosts.selected[i] = allSelected;
    }
  }

  /**
   * Callback for selecting host
   */
  selectHost(index: number) {
    this.scope.hosts.options[index].checked = !this.scope.hosts.options[index].checked;
    if (!this.scope.hosts.options[index].checked) {
      this.scope.hosts.allSelected = false;
    } else {
      // Check if all checkboxes are selected
      let allSelected = true;
      for (let i = 0; i < this.scope.hosts.options.length; i++) {
        if (!this.scope.hosts.selected[i]) {
          allSelected = false;
        }
      }
      this.scope.hosts.allSelected = allSelected;
    }
  }

  /**
   * Callback for selecting a month; check if all are selected
   */
  toggleMonthSelection() {
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
  toggleAllMonthsSelection() {
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
  onMaintenanceTypeChanged() {
    this.scope.errorText = '';
  }

  /**
   * Callback for go next button
   */
  goToNext() {
    let valid = true;
    this.scope.errorText = '';
    // Check for validity
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
    if (this.mTypeInput.value === '2' || this.mTypeInput.value === '3' || this.mTypeInput.value === '4') {
      const startDate = new Date(
        this.yearInput.value,
        this.monthInput.value - 1,
        this.dayInput.value,
        parseInt(this.hourInput.value, 10),
        parseInt(this.minuteInput.value, 10)
      );
      const stopDate = new Date(this.yearStopInput.value, this.monthStopInput.value - 1, this.dayStopInput.value);
      if (stopDate <= startDate) {
        valid = false;
        this.scope.errorText += 'Toiston päättymisaika pitää olla huollon alkamisajan jälkeen. ';
      }
    }
    if (this.mTypeInput.value === '0' && this.scope.strictEndTimeSelected && this.getStrictEndTimeDuration() <= 0) {
      valid = false;
      this.scope.errorText += 'Huollon päättymisajan pitää olla huollon alkamisajan jälkeen. ';
    }
    if (valid) {
      this.scope.wizardPhase = 2;
    }
  }

  /**
   * Callback for go previous button
   */
  goToPrevious() {
    this.scope.wizardPhase = 1;
  }

  dismiss() {
    appEvents.emit('hide-modal');
  }
}

export function iirisMaintenanceModalDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app/features/dashboard/components/DashNav/iiris_maintenance_modal.html',
    controller: IirisMaintenanceModalCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    transclude: true,
    scope: {
      onCreateMaintenance: '&',
      getCurrentTimeEpoch: '&',
      hosts: '=',
      selectedMaintenance: '=',
      user: '=',
    },
  };
}

coreModule.directive('iirisMaintenanceModal', iirisMaintenanceModalDirective);
