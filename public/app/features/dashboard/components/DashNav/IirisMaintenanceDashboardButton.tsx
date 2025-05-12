/**
 * This is the Manage Maintenances button that is shown in the dashboard navigation header (DashNav).
 * It also contains the other react components (such as modal dialogs) related to managing maintenances.
 */
import React, { PureComponent } from 'react';

import { AppEvents } from '@grafana/data';
import { getTemplateSrv, getDataSourceSrv } from '@grafana/runtime';
import { ToolbarButton } from '@grafana/ui';
import appEvents from 'app/core/app_events';
import { contextSrv } from 'app/core/core';

import { DashboardModel } from '../../state/DashboardModel';

import { IirisMaintenanceListModal } from './IirisMaintenanceListModal';

interface Props {
  dashboard: DashboardModel;
  key: string;
}

interface State {
  showMaintenanceListModal: boolean;

  // Parameters for the maintenace list modal dialog
  hostGroup: string | undefined; // Configured host group; if not defined fetch all maintenances regardless of hosts
  zabbixDataSource: string; // Zabbix data source
}

export class IirisMaintenanceDashboardButton extends PureComponent<Props, State> {
  // Initial state
  state: State = {
    showMaintenanceListModal: false,
    hostGroup: '',
    zabbixDataSource: '',
  };

  componentDidMount() {
    // Listen to event from iiris action panel
    // The panel has configuration of the maintenance will be maintained in the detail argument of the event
    document.addEventListener(
      'iiris-maintenance-dialog-open',
      (e: any) =>
        this.onOpenMaintenanceListFromActionPanel(
          e.detail.loadAllHosts,
          e.detail.hostGroup,
          e.detail.availableDatasources
        ),
      false
    );
  }

  componentWillUnmount() {
    document.removeEventListener(
      'iiris-maintenance-dialog-open',
      (e: any) =>
        this.onOpenMaintenanceListFromActionPanel(
          e.detail.loadAllHosts,
          e.detail.hostGroup,
          e.detail.availableDatasources
        ),
      false
    );
  }

  // Open maintenance list dialog as response from a message from action panel
  onOpenMaintenanceListFromActionPanel(loadAllHosts: boolean, hostGroup: string, availableDatasources: string[]) {
    // Verify mesasge arguments
    if ((!loadAllHosts && !hostGroup) || !availableDatasources || availableDatasources.length === 0) {
      appEvents.emit(AppEvents.alertError, ['Action panel message did not have all the required arguments']);
      return;
    }
    this.setState({
      showMaintenanceListModal: true,
      hostGroup: loadAllHosts ? undefined : hostGroup,
      zabbixDataSource: availableDatasources[0],
    });
  }

  // Open maintenance list dialog when the user clicks 'Manage Maintenances' button on dashboard's navigation bar
  openMaintenanceListModal = () => {
    // Find out zabbix data source name
    const dashboard = this.props.dashboard;
    const templateSrv = getTemplateSrv();
    let zabbixDSName;
    if (dashboard.selectedDatasource) {
      // Data source is configured in dashboard settings
      zabbixDSName = dashboard.selectedDatasource;
    } else {
      // No data source is configured in dashboard settings -> take the first zabbix data source available
      const zabbixDSNames = getDataSourceSrv()
        .getList({ metrics: true })
        .filter((datasource) => datasource.meta.id.indexOf('zabbix-datasource') > -1 && datasource.name)
        .map((ds: any) => ds.name);
      if (zabbixDSNames.length === 0) {
        appEvents.emit(AppEvents.alertError, [
          'Zabbix data source has not been defined; unable to open maintenances dialog',
        ]);
        return;
      }
      zabbixDSName = zabbixDSNames[0];
    }

    // Host group name comes from dashboard configuration
    var hostGroupName = dashboard.maintenanceHostGroup; // This cannot be empty because button is not shown if host group has not been configured
    hostGroupName = templateSrv.replace(hostGroupName); // Replace dashboard variables

    this.setState({
      showMaintenanceListModal: true,
      hostGroup: hostGroupName,
      zabbixDataSource: zabbixDSName,
    });
  };

  // Render component
  render() {
    const texts = contextSrv.getLocalizedTexts();
    return (
      <>
        <ToolbarButton
          key="manage_maintenances"
          tooltip={texts.manageMaintenancesButtonTooltip}
          id="maintenance_button"
          onClick={(e: any) => {
            e.currentTarget.blur();
            this.openMaintenanceListModal();
          }}
        >
          <div style={{ width: '24px', height: '24px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 100 100" fill="#ffffff">
              <path
                d="M84.4,29.6L74.2,39.8L65,37l-2.1-8.6l10-10c-5.5-2-11.4-1-16,3.5c-4.5,4.5-5.6,9.7-3.8,14.8L21,69
                c-3.3,3.3-3.3,8.7,0,12h0c3.3,3.3,8.7,3.3,12,0l32-32c5.7,2.7,11.3,1.7,16.1-3C85.7,41.4,86.6,35.2,84.4,29.6z M27,78
                c-1.7,0-3-1.3-3-3s1.3-3,3-3s3,1.3,3,3S28.7,78,27,78z"
              />
              <polygon points="19,17 30,23 33,31 42,40 36,46 27,37 18,34 13,23 " />
              <path d="M78.3,70.7l-13-13L54.7,68.3l13,13c2.9,2.9,7.7,2.9,10.6,0S81.2,73.6,78.3,70.7z" />
            </svg>
          </div>
        </ToolbarButton>
        <IirisMaintenanceListModal
          show={this.state.showMaintenanceListModal}
          onDismiss={() => this.setState({ showMaintenanceListModal: false })}
          hostGroup={this.state.hostGroup}
          zabbixDataSource={this.state.zabbixDataSource}
        />
      </>
    );
  }
}
