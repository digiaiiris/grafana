import React, { PureComponent } from 'react';
import { css } from '@emotion/css';
import { connect, ConnectedProps } from 'react-redux';
import { locationService } from '@grafana/runtime';
import { selectors } from '@grafana/e2e-selectors';
import { CustomScrollbar, stylesFactory, Themeable2, withTheme2 } from '@grafana/ui';

import { createErrorNotification } from 'app/core/copy/appNotification';
import { Branding } from 'app/core/components/Branding/Branding';
import { DashboardGrid } from '../dashgrid/DashboardGrid';
import { DashNav } from '../components/DashNav';
import { DashboardSettings } from '../components/DashboardSettings';
import { PanelEditor } from '../components/PanelEditor/PanelEditor';
import { initDashboard } from '../state/initDashboard';
import { notifyApp } from 'app/core/actions';
import { KioskMode, StoreState } from 'app/types';
import { PanelModel } from 'app/features/dashboard/state';
import { PanelInspector } from '../components/Inspector/PanelInspector';
import { SubMenu } from '../components/SubMenu/SubMenu';
import { cleanUpDashboardAndVariables } from '../state/actions';
import { cancelVariables, templateVarsChangedInUrl } from '../../variables/state/actions';
import { findTemplateVarChanges } from '../../variables/utils';
import { dashboardWatcher } from 'app/features/live/dashboard/dashboardWatcher';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { getTimeSrv } from '../services/TimeSrv';
import { getKioskMode } from 'app/core/navigation/kiosk';
import { GrafanaTheme2, TimeRange, UrlQueryValue, AppEvents } from '@grafana/data';
import { DashboardLoading } from '../components/DashboardLoading/DashboardLoading';
import { DashboardFailed } from '../components/DashboardLoading/DashboardFailed';
import { DashboardPrompt } from '../components/DashboardPrompt/DashboardPrompt';
import classnames from 'classnames';
import { PanelEditEnteredEvent, PanelEditExitedEvent } from 'app/types/events';
import { liveTimer } from '../dashgrid/liveTimer';
import appEvents from 'app/core/app_events';
import { contextSrv } from 'app/core/core';

export interface DashboardPageRouteParams {
  uid?: string;
  type?: string;
  slug?: string;
}

type DashboardPageRouteSearchParams = {
  tab?: string;
  folderId?: string;
  editPanel?: string;
  viewPanel?: string;
  editview?: string;
  inspect?: string;
  kiosk?: UrlQueryValue;
  from?: string;
  to?: string;
  refresh?: string;
  relaytarget?: string;
  relayparams?: string;
};

export const mapStateToProps = (state: StoreState) => ({
  initPhase: state.dashboard.initPhase,
  isInitSlow: state.dashboard.isInitSlow,
  initError: state.dashboard.initError,
  dashboard: state.dashboard.getModel(),
});

const mapDispatchToProps = {
  initDashboard,
  cleanUpDashboardAndVariables,
  notifyApp,
  cancelVariables,
  templateVarsChangedInUrl,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = Themeable2 &
  GrafanaRouteComponentProps<DashboardPageRouteParams, DashboardPageRouteSearchParams> &
  ConnectedProps<typeof connector>;

export interface State {
  editPanel: PanelModel | null;
  viewPanel: PanelModel | null;
  updateScrollTop?: number;
  rememberScrollTop: number;
  showLoadingState: boolean;
  panelNotFound: boolean;
  editPanelAccessDenied: boolean;
}

/* eslint-disable */
/* tslint:disable */

export class UnthemedDashboardPage extends PureComponent<Props, State> {
  private forceRouteReloadCounter = 0;
  state: State = this.getCleanState();

  getCleanState(): State {
    return {
      editPanel: null,
      viewPanel: null,
      showLoadingState: false,
      rememberScrollTop: 0,
      panelNotFound: false,
      editPanelAccessDenied: false,
    };
  }

  sendError(errorText: string) {
    const dashboard = (this.props.dashboard || {}).title + '|' + (this.props.dashboard || {}).uid;
    const messageObj = {
      errorText,
      dashboard
    };
    window.top?.postMessage(messageObj, '*');
  }

  componentDidMount() {
    this.initDashboard();
    this.forceRouteReloadCounter = (this.props.history.location.state as any)?.routeReloadCounter || 0;
    appEvents.on(AppEvents.alertError, (response: any) => {
      const errorText = Object.keys(response).map((key: string) => response[key]).join(' ');
      this.sendError(errorText);
    });
    const sendErrorFunc = this.sendError.bind(this);
    window.onerror = function(message: any) {
      sendErrorFunc(message);
      return false;
    }
  }

  componentWillUnmount() {
    this.closeDashboard();
  }

  closeDashboard() {
    this.props.cleanUpDashboardAndVariables();
    this.setState(this.getCleanState());
  }

  initDashboard() {
    const { dashboard, match, queryParams } = this.props;

    if (dashboard) {
      this.closeDashboard();
    }

    this.props.initDashboard({
      urlSlug: match.params.slug,
      urlUid: match.params.uid,
      urlType: match.params.type,
      urlFolderId: queryParams.folderId,
      routeName: this.props.route.routeName,
      fixUrl: true,
    });

    // small delay to start live updates
    setTimeout(this.updateLiveTimer, 250);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    function notifyContainerWindow(messageObj: any, queryObj: any) {
      let orgId = '';
      if (queryObj.orgId) {
        orgId = queryObj.orgId;
        delete queryObj.orgId;
      }
      let queryParams = '';
      Object.keys(queryObj).map(pKey => {
        if (
          pKey !== 'breadcrumb' &&
          pKey !== 'dashboard' &&
          pKey !== 'orgId' &&
          pKey !== 'random' &&
          queryObj[pKey] &&
          queryObj[pKey] !== 'null'
        ) {
          queryParams += '&' + pKey + '=' + queryObj[pKey];
        }
      });
      messageObj.breadcrumb = true;
      messageObj.params = queryParams;
      messageObj.orgId = orgId;
      window.top?.postMessage(messageObj, '*');
    }

    function isInsideIframe() {
      try {
        return window.self !== window.top;
      } catch (error) {
        return true;
      }
    }

    // Update breadcrumb when dashboard is loaded
    if (this.props.dashboard && this.props.dashboard !== prevProps.dashboard) {
      const db = this.props.dashboard;
      const messageObj = {
        url: `/d/${this.props.match.params.uid}/${this.props.match.params.slug}`,
        name: db.title,
        uid: this.props.match.params.uid,
        orgName: contextSrv.user.orgName,
        isGrafanaAdmin: contextSrv.user.isGrafanaAdmin,
      };
      const query = Object.assign({}, this.props.queryParams)
      if (db.uid) {
        notifyContainerWindow(messageObj, query);
      }
    }

    // Check if Grafana is inside iFrame
    if (!isInsideIframe()) {
      let url = '';
      if (window.location.hostname === 'localhost') {
        // Using local version of Grafana for testing purposes
        url = 'http://localhost:8080/';
      } else {
        // Assume that Pulssi frontend is in the domain root of Grafana url
        url = window.location.protocol + '//' + window.location.hostname + '/';
      }
      const pathArray = window.location.pathname.split('/');
      const dashboardId = pathArray.length > 1 ? pathArray[pathArray.length - 2] : '';
      url += '?dashboard=' + dashboardId;
      const queryParams = window.location.search;
      if (queryParams.indexOf('?') > -1) {
        url += '&' + queryParams.substr(1, queryParams.length);
      }
      window.location.href = url;
    }

    // Adding a mechanism for telling parent frame to navigate to new url
    // Listen for location changes: If route has relaytarget-parameter then
    // tell parent window to navigate to given target
    // e.g. setting following url-link in some Grafana dashboard: ?relaytarget=logs
    // relayparams-parameter sets the path and possible query-params which are given to iFrame under parent
    // e.g. relaytarget=logs&relayparams=search%3Foption%3Dtest
    if (this.props.queryParams && this.props.queryParams.relaytarget) {
      const messageObj: any = {
        relaytarget: this.props.queryParams.relaytarget,
        relayparams: this.props.queryParams.relayparams,
      };
      // Add possible url params as their own keys to messageObj
      if (messageObj.relayparams && messageObj.relayparams.indexOf('?') > -1) {
        const queryString = messageObj.relayparams.split('?')[1];
        const queryObj: any = {};
        queryString.split('&').map((item: any) => (queryObj[item.split('=')[0]] = item.split('=')[1]));
        Object.keys(queryObj).map((param: any) => {
          messageObj[param] = queryObj[param];
        });
        messageObj.relayparams = messageObj.relayparams.split('?')[0];
      }
      // Send messageObj to parent window
      window.top?.postMessage(messageObj, '*');
    }

    const { dashboard, match, templateVarsChangedInUrl } = this.props;
    const routeReloadCounter = (this.props.history.location.state as any)?.routeReloadCounter;

    if (!dashboard) {
      return;
    }

    // if we just got dashboard update title
    if (prevProps.dashboard !== dashboard) {
      document.title = dashboard.title + ' - ' + Branding.AppTitle;
    }

    if (
      prevProps.match.params.uid !== match.params.uid ||
      (routeReloadCounter !== undefined && this.forceRouteReloadCounter !== routeReloadCounter)
    ) {
      this.initDashboard();
      this.forceRouteReloadCounter = routeReloadCounter;
      return;
    }

    if (prevProps.location.search !== this.props.location.search) {
      const prevUrlParams = prevProps.queryParams;
      const urlParams = this.props.queryParams;

      if (urlParams?.from !== prevUrlParams?.from || urlParams?.to !== prevUrlParams?.to) {
        getTimeSrv().updateTimeRangeFromUrl();
        this.updateLiveTimer();
      }

      if (!prevUrlParams?.refresh && urlParams?.refresh) {
        getTimeSrv().setAutoRefresh(urlParams.refresh);
      }

      const templateVarChanges = findTemplateVarChanges(this.props.queryParams, prevProps.queryParams);

      if (templateVarChanges) {
        templateVarsChangedInUrl(templateVarChanges);
      }
    }

    // entering edit mode
    if (this.state.editPanel && !prevState.editPanel) {
      dashboardWatcher.setEditingState(true);

      // Some panels need to be notified when entering edit mode
      this.props.dashboard?.events.publish(new PanelEditEnteredEvent(this.state.editPanel.id));
    }

    // leaving edit mode
    if (!this.state.editPanel && prevState.editPanel) {
      dashboardWatcher.setEditingState(false);

      // Some panels need kicked when leaving edit mode
      this.props.dashboard?.events.publish(new PanelEditExitedEvent(prevState.editPanel.id));
    }

    if (this.state.editPanelAccessDenied) {
      this.props.notifyApp(createErrorNotification('Permission to edit panel denied'));
      locationService.partial({ editPanel: null });
    }

    if (this.state.panelNotFound) {
      this.props.notifyApp(createErrorNotification(`Panel not found`));
      locationService.partial({ editPanel: null, viewPanel: null });
    }
  }

  updateLiveTimer = () => {
    let tr: TimeRange | undefined = undefined;
    if (this.props.dashboard?.liveNow) {
      tr = getTimeSrv().timeRange();
    }
    liveTimer.setLiveTimeRange(tr);
  };

  static getDerivedStateFromProps(props: Props, state: State) {
    const { dashboard, queryParams } = props;

    const urlEditPanelId = queryParams.editPanel;
    const urlViewPanelId = queryParams.viewPanel;

    if (!dashboard) {
      return state;
    }

    // Entering edit mode
    if (!state.editPanel && urlEditPanelId) {
      const panel = dashboard.getPanelByUrlId(urlEditPanelId);
      if (!panel) {
        return { ...state, panelNotFound: true };
      }

      if (dashboard.canEditPanel(panel)) {
        return { ...state, editPanel: panel };
      } else {
        return { ...state, editPanelAccessDenied: true };
      }
    }
    // Leaving edit mode
    else if (state.editPanel && !urlEditPanelId) {
      return { ...state, editPanel: null };
    }

    // Entering view mode
    if (!state.viewPanel && urlViewPanelId) {
      const panel = dashboard.getPanelByUrlId(urlViewPanelId);
      if (!panel) {
        return { ...state, panelNotFound: urlEditPanelId };
      }

      // This mutable state feels wrong to have in getDerivedStateFromProps
      // Should move this state out of dashboard in the future
      dashboard.initViewPanel(panel);

      return {
        ...state,
        viewPanel: panel,
        updateScrollTop: 0,
      };
    }
    // Leaving view mode
    else if (state.viewPanel && !urlViewPanelId) {
      // This mutable state feels wrong to have in getDerivedStateFromProps
      // Should move this state out of dashboard in the future
      dashboard.exitViewPanel(state.viewPanel);

      return { ...state, viewPanel: null, updateScrollTop: state.rememberScrollTop };
    }

    // if we removed url edit state, clear any panel not found state
    if (state.panelNotFound || (state.editPanelAccessDenied && !urlEditPanelId)) {
      return { ...state, panelNotFound: false, editPanelAccessDenied: false };
    }

    return state;
  }

  onAddPanel = () => {
    const { dashboard } = this.props;

    if (!dashboard) {
      return;
    }

    // Return if the "Add panel" exists already
    if (dashboard.panels.length > 0 && dashboard.panels[0].type === 'add-panel') {
      return;
    }

    dashboard.addPanel({
      type: 'add-panel',
      gridPos: { x: 0, y: 0, w: 12, h: 8 },
      title: 'Panel Title',
    });

    // scroll to top after adding panel
    this.setState({ updateScrollTop: 0 });
  };

  getInspectPanel() {
    const { dashboard, queryParams } = this.props;

    const inspectPanelId = queryParams.inspect;

    if (!dashboard || !inspectPanelId) {
      return null;
    }

    const inspectPanel = dashboard.getPanelById(parseInt(inspectPanelId, 10));

    // cannot inspect panels plugin is not already loaded
    if (!inspectPanel) {
      return null;
    }

    return inspectPanel;
  }

  render() {
    const { dashboard, isInitSlow, initError, queryParams, theme } = this.props;
    const { editPanel, viewPanel, updateScrollTop } = this.state;
    const kioskMode = getKioskMode(queryParams.kiosk);
    const styles = getStyles(theme, kioskMode);

    if (!dashboard) {
      if (isInitSlow) {
        return <DashboardLoading initPhase={this.props.initPhase} />;
      }

      return null;
    }

    const inspectPanel = this.getInspectPanel();
    const containerClassNames = classnames(styles.dashboardContainer, {
      'panel-in-fullscreen': viewPanel,
    });
    const showSubMenu = !editPanel && kioskMode === KioskMode.Off && !this.props.queryParams.editview;

    return (
      <div className={containerClassNames}>
        {kioskMode !== KioskMode.Full && (
          <header data-testid={selectors.pages.Dashboard.DashNav.navV2}>
            <DashNav
              dashboard={dashboard}
              title={dashboard.title}
              folderTitle={dashboard.meta.folderTitle}
              isFullscreen={!!viewPanel}
              onAddPanel={this.onAddPanel}
              kioskMode={kioskMode}
              hideTimePicker={dashboard.timepicker.hidden}
            />
          </header>
        )}

        <DashboardPrompt dashboard={dashboard} />

        <div className={styles.dashboardScroll}>
          <CustomScrollbar
            autoHeightMin="100%"
            scrollTop={updateScrollTop}
            hideHorizontalTrack={true}
            updateAfterMountMs={500}
          >
            <div className={styles.dashboardContent}>
              {initError && <DashboardFailed />}
              {showSubMenu && (
                <section aria-label={selectors.pages.Dashboard.SubMenu.submenu}>
                  <SubMenu dashboard={dashboard} annotations={dashboard.annotations.list} links={dashboard.links} />
                </section>
              )}

              <DashboardGrid dashboard={dashboard} viewPanel={viewPanel} editPanel={editPanel} />
            </div>
          </CustomScrollbar>
        </div>

        {inspectPanel && <PanelInspector dashboard={dashboard} panel={inspectPanel} />}
        {editPanel && <PanelEditor dashboard={dashboard} sourcePanel={editPanel} tab={this.props.queryParams.tab} />}
        {queryParams.editview && <DashboardSettings dashboard={dashboard} editview={queryParams.editview} />}
      </div>
    );
  }
}

/*
 * Styles
 */
export const getStyles = stylesFactory((theme: GrafanaTheme2, kioskMode) => {
  const contentPadding = kioskMode !== KioskMode.Full ? theme.spacing(1) : theme.spacing(2);
  return {
    dashboardContainer: css`
      width: 100%;
      height: 100%;
      display: flex;
      flex: 1 1 0;
      flex-direction: column;
      min-height: 0;
    `,
    dashboardScroll: css`
      width: 100%;
      flex-grow: 1;
      min-height: 0;
      display: flex;
    `,
    dashboardContent: css`
      padding: ${contentPadding};
      flex-basis: 100%;
      flex-grow: 1;
    `,
  };
});

export const DashboardPage = withTheme2(UnthemedDashboardPage);
DashboardPage.displayName = 'DashboardPage';
export default connector(DashboardPage);
