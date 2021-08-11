/* eslint-disable */
/* tslint:disable */
/**
 * <h3>Maintenance Confirm Modal Dialog</h3>
 * View maintenance confirmation
 */

 import coreModule from 'app/core/core_module';
 import appEvents from 'app/core/app_events';
 
 export class IirisMaintenanceConfirmModalCtrl {
   scope: any;
   onCloseConfirmation: () => void;
   confirmText: string;
 
   /**
    * Maintenance List Modal class constructor
    */
   constructor() {
     this.onCloseConfirmation = () => {
        this.dismiss();
     };
   }
 
   dismiss() {
     appEvents.emit('hide-modal');
   }
 }
 
 export function iirisMaintenanceConfirmModalDirective() {
   return {
     restrict: 'E',
     templateUrl: 'public/app/features/dashboard/components/DashNav/iiris_maintenance_confirm_modal.html',
     controller: IirisMaintenanceConfirmModalCtrl,
     bindToController: true,
     controllerAs: 'ctrl',
     transclude: true,
     scope: {
       confirmText: '=',
     },
   };
 }
 
 coreModule.directive('iirisMaintenanceConfirmModal', iirisMaintenanceConfirmModalDirective);
 