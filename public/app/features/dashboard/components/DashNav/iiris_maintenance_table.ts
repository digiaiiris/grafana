/* eslint-disable */
/* tslint:disable */
import coreModule from 'app/core/core_module';
import _ from 'lodash';

const SORT_ASC = 'sort-ascending';
const SORT_DESC = 'sort-descending';
const ROW_HEIGHT = 38;
const HEADER_HEIGHT = 33;

export interface IirisMaintenanceTableScope extends ng.IScope {
  data: any[];
  pageData: any[];
  eventList: any[];
  sortValue: string;
  sortDirection: string;
  currentPage: number;
  pageCount: number;
  pageList: number[];
  onRowAmountChanged: () => void;
  onSortTable: (sortValue: string) => void;
  onGoToPage: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  onURLLinkClick: (eventItem: any) => void;
  tableStyle: any;
  selectedMaintenanceId: string;
  onEditIconClick: (maintenanceID: string) => void;
  onStopIconClick: (maintenanceID: string) => void;
  onEditMaintenance: () => void;
  onStopMaintenance: () => void;
}

export class IirisMaintenanceTableCtrl {
  rowsPerPage: number;

  constructor() {
    this.rowsPerPage = 10;
  }
}

coreModule.directive('iirisMaintenanceModalTable', () => {
  return {
    restrict: 'E',
    templateUrl: 'public/app/features/dashboard/components/DashNav/iiris_maintenance_table.html',
    controller: IirisMaintenanceTableCtrl,
    scope: {
      data: '=',
      onStopMaintenance: '&',
      onEditMaintenance: '&',
      ongoingMaintenanceIds: '=',
      selectedMaintenanceId: '=',
    },
    link: (scope: IirisMaintenanceTableScope, elem: any, attrs: any, ctrl: any) => {
      scope.sortValue = 'startTime';
      scope.sortDirection = SORT_ASC;
      scope.currentPage = 1;
      scope.pageCount = 1;
      scope.tableStyle = { height: ctrl.rowsPerPage * ROW_HEIGHT + HEADER_HEIGHT + 'px' };

      render();

      scope.$watch('data', (newVal: any) => {
        if (newVal) {
          render();
        }
      });

      /**
       * Render directive to screen
       * @param {boolean} preservePagePosition Don't clear current page value
       */
      function render(preservePagePosition?: boolean) {
        if (scope.data) {
          // Render tables
          if (!preservePagePosition) {
            scope.currentPage = 1;
          }
          const filteredEvents = scope.data;
          scope.pageCount = Math.ceil(filteredEvents.length / ctrl.rowsPerPage);
          scope.pageData = filteredEvents;
          // Update paging
          scope.pageList = [];
          // When pages amount is greater than 9 we need to add ellipsis buttons to reduce the amount visible
          // To identify the buttons, the first ellipsis button will have value -1 and second button -2
          if (scope.pageCount > 9) {
            let ellipsisFirst = false;
            let ellipsisLast = false;
            let pageFirst = Math.max(1, scope.currentPage - 2);
            let pageLast = Math.min(scope.pageCount, scope.currentPage + 2);
            if (scope.currentPage > 5) {
              ellipsisFirst = true;
              pageFirst = pageFirst > scope.pageCount - 6 ? scope.pageCount - 6 : pageFirst;
            } else {
              pageFirst = pageFirst > 1 ? 1 : pageFirst;
            }
            if (scope.currentPage < scope.pageCount - 4) {
              ellipsisLast = true;
              pageLast = pageLast < 7 ? 7 : pageLast;
            } else {
              pageLast = pageLast < scope.pageCount ? scope.pageCount : pageLast;
            }
            for (let i = pageFirst; i <= pageLast; i++) {
              scope.pageList.push(i);
            }
            if (ellipsisFirst) {
              scope.pageList.unshift(1, -1);
            }
            if (ellipsisLast) {
              scope.pageList.push(-2, scope.pageCount);
            }
          } else {
            for (let i = 1; i <= scope.pageCount; i++) {
              scope.pageList.push(i);
            }
          }
          // Update sorting
          if (scope.sortValue) {
            scope.pageData = _.sortBy(scope.pageData, scope.sortValue);
            if (scope.sortDirection === SORT_DESC) {
              scope.pageData.reverse();
            }
          }
          scope.pageData = scope.pageData.splice((scope.currentPage - 1) * ctrl.rowsPerPage, ctrl.rowsPerPage);
          scope.tableStyle = { height: ctrl.rowsPerPage * ROW_HEIGHT + HEADER_HEIGHT + 'px' };
        }
      }

      /**
       * Callback for clicking table column sort button
       * @param {string} sortValue
       */
      scope.onSortTable = (sortValue: string) => {
        if (sortValue !== scope.sortValue) {
          scope.sortValue = sortValue;
          scope.sortDirection = SORT_ASC;
        } else {
          if (scope.sortDirection === SORT_ASC) {
            scope.sortDirection = SORT_DESC;
          } else {
            scope.sortDirection = SORT_ASC;
            scope.sortValue = '';
          }
        }
        render();
      };

      /**
       * Callback for clicking page number button
       * @param {number} page
       */
      scope.onGoToPage = (page: number) => {
        if (page === -1) {
          // -1 is the first ellipsis button, we need to jump to page previous in ellipsis line
          scope.currentPage = scope.pageList[scope.pageList.indexOf(page) + 1] - 1;
        } else if (page === -2) {
          // -2 is the second ellipsis button, we need to jump to page next in ellipsis line
          scope.currentPage = scope.pageList[scope.pageList.indexOf(page) - 1] + 1;
        } else {
          scope.currentPage = page;
        }
        render(true);
      };

      /**
       * Callback for clicking next page button
       */
      scope.onNextPage = () => {
        if (scope.currentPage < scope.pageCount) {
          scope.currentPage++;
          render(true);
        }
      };

      /**
       * Callback for clicking previous page button
       */
      scope.onPrevPage = () => {
        if (scope.currentPage > 1) {
          scope.currentPage--;
          render(true);
        }
      };

      /**
       * Callback for changing row amount
       */
      scope.onRowAmountChanged = () => {
        render();
      };

      /**
       * Callback for clicking edit icon
       */
      scope.onEditIconClick = (maintenanceID: string) => {
        scope.selectedMaintenanceId = maintenanceID;
        setTimeout(scope.onEditMaintenance, 0);
      };

      /**
       * Callback for clicking stop icon
       */
      scope.onStopIconClick = (maintenanceID: string) => {
        scope.selectedMaintenanceId = maintenanceID;
        setTimeout(scope.onStopMaintenance, 0);
      };
    },
  };
});
