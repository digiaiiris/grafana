import * as H from 'history';
import { each, filter, find } from 'lodash';
import React, { useContext, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Prompt } from 'react-router-dom';

import { locationService } from '@grafana/runtime';
import { ModalsContext } from '@grafana/ui';
import { appEvents } from 'app/core/app_events';
import { contextSrv } from 'app/core/services/context_srv';
import { SaveLibraryPanelModal } from 'app/features/library-panels/components/SaveLibraryPanelModal/SaveLibraryPanelModal';
import { PanelModelWithLibraryPanel } from 'app/features/library-panels/types';
import { DashboardSavedEvent } from 'app/types/events';

import { DashboardModel } from '../../state/DashboardModel';
import { discardPanelChanges, exitPanelEditor } from '../PanelEditor/state/actions';
import { UnsavedChangesModal } from '../SaveDashboard/UnsavedChangesModal';

export interface Props {
  dashboard: DashboardModel;
}

interface State {
  original: object | null;
  originalPath?: string;
}

export const DashboardPrompt = React.memo(({ dashboard }: Props) => {
  const [state, setState] = useState<State>({ original: null });
  const dispatch = useDispatch();
  const { original, originalPath } = state;
  const { showModal, hideModal } = useContext(ModalsContext);

  useEffect(() => {
    // This timeout delay is to wait for panels to load and migrate scheme before capturing the original state
    // This is to minimize unsaved changes warnings due to automatic schema migrations
    const timeoutId = setTimeout(() => {
      const originalPath = locationService.getLocation().pathname;
      const original = dashboard.getSaveModelClone();
      setState({ originalPath, original });
    }, 1000);

    const savedEventUnsub = appEvents.subscribe(DashboardSavedEvent, () => {
      const original = dashboard.getSaveModelClone();
      setState({ originalPath, original });
    });

    return () => {
      clearTimeout(timeoutId);
      savedEventUnsub.unsubscribe();
    };
  }, [dashboard, originalPath]);

  useEffect(() => {
    const handleUnload = (event: BeforeUnloadEvent) => {
      if (ignoreChanges(dashboard, original)) {
        return;
      }
      if (hasChanges(dashboard, original)) {
        event.preventDefault();
        // No browser actually displays this message anymore.
        // But Chrome requires it to be defined else the popup won't show.
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [dashboard, original]);

  const onHistoryBlock = (location: H.Location) => {
    const panelInEdit = dashboard.panelInEdit;
    const search = new URLSearchParams(location.search);

    // Are we leaving panel edit & library panel?
    if (panelInEdit && panelInEdit.libraryPanel && panelInEdit.hasChanged && !search.has('editPanel')) {
      showModal(SaveLibraryPanelModal, {
        isUnsavedPrompt: true,
        panel: dashboard.panelInEdit as PanelModelWithLibraryPanel,
        folderId: dashboard.meta.folderId as number,
        onConfirm: () => {
          hideModal();
          moveToBlockedLocationAfterReactStateUpdate(location);
        },
        onDiscard: () => {
          dispatch(discardPanelChanges());
          moveToBlockedLocationAfterReactStateUpdate(location);
          hideModal();
        },
        onDismiss: hideModal,
      });
      return false;
    }

    // Are we still on the same dashboard?
    if (originalPath === location.pathname || !original) {
      // This is here due to timing reasons we want the exit panel editor state changes to happen before router update
      if (panelInEdit && !search.has('editPanel')) {
        dispatch(exitPanelEditor());
      }

      return true;
    }

    if (ignoreChanges(dashboard, original)) {
      return true;
    }

    if (!hasChanges(dashboard, original)) {
      return true;
    }

    showModal(UnsavedChangesModal, {
      dashboard: dashboard,
      onSaveSuccess: () => {
        hideModal();
        moveToBlockedLocationAfterReactStateUpdate(location);
      },
      onDiscard: () => {
        setState({ ...state, original: null });
        hideModal();
        moveToBlockedLocationAfterReactStateUpdate(location);
      },
      onDismiss: hideModal,
    });

    return false;
  };

  return <Prompt when={true} message={onHistoryBlock} />;
});

DashboardPrompt.displayName = 'DashboardPrompt';

function moveToBlockedLocationAfterReactStateUpdate(location?: H.Location | null) {
  if (location) {
    setTimeout(() => locationService.push(location), 10);
  }
}

/**
 * For some dashboards and users changes should be ignored *
 */
export function ignoreChanges(current: DashboardModel, original: object | null) {
  // If tab row is in display mode we need to ignore changes to dashboard panels
  let tabRowInDisplayMode = false;
  current.panels.map((panel: any) => {
    if (panel.type === 'iiris-tab-row-panel') {
      if (panel.options.isInDisplayMode) {
        tabRowInDisplayMode = true;
      }
    }
  });
  if (tabRowInDisplayMode) {
    return true;
  }

  if (!original) {
    return true;
  }

  // Ignore changes if the user has been signed out
  if (!contextSrv.isSignedIn) {
    return true;
  }

  if (!current || !current.meta) {
    return true;
  }

  const { canSave, fromScript, fromFile } = current.meta;
  if (!contextSrv.isEditor && !canSave) {
    return true;
  }

  return !canSave || fromScript || fromFile;
}

/**
 * Remove stuff that should not count in diff
 */
function cleanDashboardFromIgnoredChanges(dashData: any) {
  // need to new up the domain model class to get access to expand / collapse row logic
  const model = new DashboardModel(dashData);

  // Expand all rows before making comparison. This is required because row expand / collapse
  // change order of panel array and panel positions.
  model.expandRows();

  const dash = model.getSaveModelClone();

  // ignore time and refresh
  dash.time = 0;
  dash.refresh = 0;
  dash.schemaVersion = 0;
  dash.timezone = 0;

  // ignore iteration property
  delete dash.iteration;

  dash.panels = filter(dash.panels, (panel) => {
    if (panel.repeatPanelId) {
      return false;
    }

    // remove scopedVars
    panel.scopedVars = undefined;

    // ignore panel legend sort
    if (panel.legend) {
      delete panel.legend.sort;
      delete panel.legend.sortDesc;
    }

    return true;
  });

  // ignore template variable values
  each(dash.getVariables(), (variable: any) => {
    variable.current = null;
    variable.options = null;
    variable.filters = null;
  });

  return dash;
}

export function hasChanges(current: DashboardModel, original: any) {
  const currentClean = cleanDashboardFromIgnoredChanges(current.getSaveModelClone());
  const originalClean = cleanDashboardFromIgnoredChanges(original);

  const currentTimepicker: any = find((currentClean as any).nav, { type: 'timepicker' });
  const originalTimepicker: any = find((originalClean as any).nav, { type: 'timepicker' });

  if (currentTimepicker && originalTimepicker) {
    currentTimepicker.now = originalTimepicker.now;
  }

  const currentJson = JSON.stringify(currentClean, null);
  const originalJson = JSON.stringify(originalClean, null);

  return currentJson !== originalJson;
}
