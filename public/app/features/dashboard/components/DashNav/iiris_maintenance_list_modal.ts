/* eslint-disable */
/* tslint:disable */
/**
 * <h3>Maintenance List Modal Dialog</h3>
 * You can view all Zabbix maintenances from this dialog.
 */

import coreModule from 'app/core/core_module';
import appEvents from 'app/core/app_events';

export class IirisMaintenanceListModalCtrl {
  scope: any;
  onStopMaintenanceClicked: (maintenanceId: string) => void;
  onStopMaintenance: any;
  confirmIsVisible: boolean;
  onCloseConfirmation: () => void;
  onAcceptConfirmation: () => void;
  confirmText: string;
  confirmAction: any;
  selectedMaintenanceId: string;

  /**
   * Maintenance List Modal class constructor
   */
  constructor() {
    this.onStopMaintenanceClicked = (maintenanceId: string) => {
      this.onStopMaintenance()(maintenanceId);
    };
    this.onCloseConfirmation = () => {
      this.confirmIsVisible = false;
    };
    this.onAcceptConfirmation = () => {
      this.confirmIsVisible = false;
      if (this.confirmAction) {
        this.confirmAction()(this.selectedMaintenanceId);
      }
      this.dismiss();
    };
  }

  dismiss() {
    appEvents.emit('hide-modal');
  }
}

export function iirisMaintenanceListModalDirective() {
  return {
    restrict: 'E',
    templateUrl: 'public/app/features/dashboard/components/DashNav/iiris_maintenance_list_modal.html',
    controller: IirisMaintenanceListModalCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    transclude: true,
    scope: {
      onCreateMaintenance: '&',
      openMaintenanceModal: '&',
      onStopMaintenance: '&',
      onEditMaintenance: '&',
      allMaintenances: '=',
      ongoingMaintenanceIds: '=',
      selectedMaintenanceId: '=',
      confirmIsVisible: '=',
      confirmText: '=',
      confirmAction: '&',
    },
  };
}

coreModule.directive('iirisMaintenanceListModal', iirisMaintenanceListModalDirective);
