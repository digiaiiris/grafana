import React, { FC, ReactNode, useRef } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { useLocation } from 'react-router-dom';

import { locationUtil, textUtil } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { ButtonGroup, ModalsController, ToolbarButton, PageToolbar, useForceUpdate } from '@grafana/ui';
import config from 'app/core/config';
import { contextSrv } from 'app/core/core';
import { toggleKioskMode } from 'app/core/navigation/kiosk';
import { DashboardCommentsModal } from 'app/features/dashboard/components/DashboardComments/DashboardCommentsModal';
import { SaveDashboardProxy } from 'app/features/dashboard/components/SaveDashboard/SaveDashboardProxy';
import { ShareModal } from 'app/features/dashboard/components/ShareModal';
import { playlistSrv } from 'app/features/playlist/PlaylistSrv';
import { updateTimeZoneForSession } from 'app/features/profile/state/reducers';
import { KioskMode } from 'app/types';

import { getDashboardSrv } from '../../services/DashboardSrv';
import { DashboardModel } from '../../state';

import { DashNavButton } from './DashNavButton';
import { DashNavTimeControls } from './DashNavTimeControls';
import IirisMaintenance from './IirisMaintenance';

const mapDispatchToProps = {
  updateTimeZoneForSession,
};

const connector = connect(null, mapDispatchToProps);

export interface OwnProps {
  dashboard: DashboardModel;
  isFullscreen: boolean;
  kioskMode: KioskMode;
  hideTimePicker: boolean;
  folderTitle?: string;
  title: string;
  onAddPanel: () => void;
}

interface DashNavButtonModel {
  show: (props: Props) => boolean;
  component: FC<Partial<Props>>;
  index?: number | 'end';
}

const customLeftActions: DashNavButtonModel[] = [];
const customRightActions: DashNavButtonModel[] = [];

export function addCustomLeftAction(content: DashNavButtonModel) {
  customLeftActions.push(content);
}

export function addCustomRightAction(content: DashNavButtonModel) {
  customRightActions.push(content);
}

type Props = OwnProps & ConnectedProps<typeof connector>;

export const DashNav = React.memo<Props>((props) => {
  const forceUpdate = useForceUpdate();
  const ref = useRef<{ log: () => void }>(null);

  // Call IirisMaintenance component's function
  const childOpenMaintenanceDialog = (e: any) => {
    if (ref.current) {
      ref.current.log();
    }
  };

  const onStarDashboard = () => {
    const dashboardSrv = getDashboardSrv();
    const { dashboard } = props;

    dashboardSrv.starDashboard(dashboard.id, dashboard.meta.isStarred).then((newState: any) => {
      dashboard.meta.isStarred = newState;
      forceUpdate();
    });
  };

  const onClose = () => {
    locationService.partial({ viewPanel: null });
  };

  const onToggleTVMode = () => {
    toggleKioskMode();
  };

  const onOpenSettings = () => {
    locationService.partial({ editview: 'settings' });
  };

  const onPlaylistPrev = () => {
    playlistSrv.prev();
  };

  const onPlaylistNext = () => {
    playlistSrv.next();
  };

  const onPlaylistStop = () => {
    playlistSrv.stop();
    forceUpdate();
  };

  const addCustomContent = (actions: DashNavButtonModel[], buttons: ReactNode[]) => {
    actions.map((action, index) => {
      const Component = action.component;
      const element = <Component {...props} key={`button-custom-${index}`} />;
      typeof action.index === 'number' ? buttons.splice(action.index, 0, element) : buttons.push(element);
    });
  };

  const isPlaylistRunning = () => {
    return playlistSrv.isPlaying;
  };

  const renderLeftActionsButton = () => {
    const { dashboard, kioskMode } = props;
    const { canStar, canShare, isStarred } = dashboard.meta;
    const buttons: ReactNode[] = [];
    const isLightTheme = contextSrv.user.lightTheme;

    if (kioskMode !== KioskMode.Off || isPlaylistRunning()) {
      return [];
    }

    if (canStar && !isLightTheme) {
      let desc = isStarred ? 'Unmark as favorite' : 'Mark as favorite';
      buttons.push(
        <DashNavButton
          tooltip={desc}
          icon={isStarred ? 'favorite' : 'star'}
          iconType={isStarred ? 'mono' : 'default'}
          iconSize="lg"
          onClick={onStarDashboard}
          key="button-star"
        />
      );
    }

    if (canShare && !isLightTheme) {
      let desc = 'Share dashboard or panel';
      buttons.push(
        <ModalsController key="button-share">
          {({ showModal, hideModal }) => (
            <DashNavButton
              tooltip={desc}
              icon="share-alt"
              iconSize="lg"
              onClick={() => {
                showModal(ShareModal, {
                  dashboard,
                  onDismiss: hideModal,
                });
              }}
            />
          )}
        </ModalsController>
      );
    }

    if (dashboard.uid && config.featureToggles.dashboardComments) {
      buttons.push(
        <ModalsController key="button-dashboard-comments">
          {({ showModal, hideModal }) => (
            <DashNavButton
              tooltip="Show dashboard comments"
              icon="comment-alt-message"
              iconSize="lg"
              onClick={() => {
                showModal(DashboardCommentsModal, {
                  dashboard,
                  onDismiss: hideModal,
                });
              }}
            />
          )}
        </ModalsController>
      );
    }

    addCustomContent(customLeftActions, buttons);
    return buttons;
  };

  const renderPlaylistControls = () => {
    return (
      <ButtonGroup key="playlist-buttons">
        <ToolbarButton tooltip="Go to previous dashboard" icon="backward" onClick={onPlaylistPrev} narrow />
        <ToolbarButton onClick={onPlaylistStop}>Stop playlist</ToolbarButton>
        <ToolbarButton tooltip="Go to next dashboard" icon="forward" onClick={onPlaylistNext} narrow />
      </ButtonGroup>
    );
  };

  const renderTimeControls = () => {
    const { dashboard, updateTimeZoneForSession, hideTimePicker } = props;

    if (hideTimePicker) {
      return null;
    }

    return (
      <DashNavTimeControls dashboard={dashboard} onChangeTimeZone={updateTimeZoneForSession} key="time-controls" />
    );
  };

  const findMaintenanceButton = (element: HTMLElement): HTMLElement | null => {
    if (element.id === 'maintenance_button') {
      return element;
    } else if (element.parentElement) {
      return findMaintenanceButton(element.parentElement);
    } else {
      return null;
    }
  };

  /**
   * Callback for clicking wiki icon
   */
  const onOpenWikiPage = () => {
    const { dashboard } = props;
    if (dashboard.serviceInfoWikiUrlIsExternal) {
      // Navigate directly to given URL
      window.open(dashboard.serviceInfoWikiUrl, '_blank');
    } else {
      // Tell parent window to navigate to given URL
      const messageObj = {
        relaytarget: 'wiki',
        relayparams: dashboard.serviceInfoWikiUrl,
      };
      // eslint-disable-next-line
      window.top?.postMessage(messageObj, '*');
    }
  };

  const renderRightActionsButton = () => {
    const { dashboard, onAddPanel, isFullscreen, kioskMode } = props;
    const { canSave, canEdit, showSettings } = dashboard.meta;
    const { snapshot } = dashboard;
    const snapshotUrl = snapshot && snapshot.originalUrl;
    const buttons: ReactNode[] = [];
    const isLightTheme = contextSrv.user.lightTheme;
    const tvButton = (
      <ToolbarButton tooltip="Cycle view mode" icon="monitor" onClick={onToggleTVMode} key="tv-button" />
    );

    if (isPlaylistRunning()) {
      return [renderPlaylistControls(), renderTimeControls()];
    }

    if (kioskMode === KioskMode.TV) {
      return [renderTimeControls(), tvButton];
    }

    if (canEdit && !isFullscreen && !isLightTheme) {
      buttons.push(<ToolbarButton tooltip="Add panel" icon="panel-add" onClick={onAddPanel} key="button-panel-add" />);
    }

    if (canSave && !isFullscreen && !isLightTheme) {
      buttons.push(
        <ModalsController key="button-save">
          {({ showModal, hideModal }) => (
            <ToolbarButton
              tooltip="Save dashboard"
              icon="save"
              onClick={() => {
                showModal(SaveDashboardProxy, {
                  dashboard,
                  onDismiss: hideModal,
                });
              }}
            />
          )}
        </ModalsController>
      );
    }

    if (props.dashboard.maintenanceHostGroup) {
      buttons.push(
        <ToolbarButton
          key="manage_maintenances"
          tooltip="Manage Maintenances"
          id="maintenance_button"
          onClick={(e) => childOpenMaintenanceDialog(e.target as any)}
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
      );
    }
    if (props.dashboard.serviceInfoWikiUrl) {
      buttons.push(
        <ToolbarButton key="open_wiki" tooltip="Go To Wiki" onClick={() => onOpenWikiPage()}>
          <div style={{ width: '20px', height: '20px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 140 140" fill="#ffffff">
              <path d="M86.7,10h-6.3H80H24v120h92V46v-0.3v-6.3L86.7,10z M88,22.7L103.3,38H88V22.7z M108,122H32V18h48v28h28V122z" />
              <rect x="48" y="57" width="45" height="8" />
              <rect x="48" y="75" width="45" height="8" />
              <rect x="48" y="93" width="45" height="8" />
            </svg>
          </div>
        </ToolbarButton>
      );
    }

    if (snapshotUrl) {
      buttons.push(
        <ToolbarButton
          tooltip="Open original dashboard"
          onClick={() => gotoSnapshotOrigin(snapshotUrl)}
          icon="link"
          key="button-snapshot"
        />
      );
    }

    if (showSettings && !isLightTheme) {
      buttons.push(
        <ToolbarButton tooltip="Dashboard settings" icon="cog" onClick={onOpenSettings} key="button-settings" />
      );
    }

    addCustomContent(customRightActions, buttons);

    buttons.push(renderTimeControls());
    if (!isLightTheme) {
      buttons.push(tvButton);
    }
    return buttons;
  };

  const gotoSnapshotOrigin = (snapshotUrl: string) => {
    window.location.href = textUtil.sanitizeUrl(snapshotUrl);
  };

  const { dashboard, isFullscreen, title, folderTitle } = props;
  // this ensures the component rerenders when the location changes
  const location = useLocation();
  const titleHref = locationUtil.getUrlForPartial(location, { search: 'open' });
  const parentHref = locationUtil.getUrlForPartial(location, { search: 'open', folder: 'current' });
  const onGoBack = isFullscreen ? onClose : undefined;
  const folderTitleByTheme = contextSrv.user.lightTheme ? '' : folderTitle;

  return (
    <div className="iiris-custom-toolbar">
      {props.dashboard.dashboardLogo ? (
        <div className="iiris-customer-logo">
          <img src={props.dashboard.dashboardLogo} />
        </div>
      ) : null}
      <PageToolbar
        pageIcon={isFullscreen ? undefined : 'apps'}
        title={title}
        parent={folderTitleByTheme}
        titleHref={titleHref}
        parentHref={parentHref}
        onGoBack={onGoBack}
        leftItems={renderLeftActionsButton()}
      >
        {renderRightActionsButton()}
      </PageToolbar>
      <IirisMaintenance dashboard={dashboard} ref={ref} />
    </div>
  );
});

DashNav.displayName = 'DashNav';

export default connector(DashNav);
