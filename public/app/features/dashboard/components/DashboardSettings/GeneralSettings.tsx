import React, { useState, useEffect } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { TimeZone } from '@grafana/data';
import { CollapsableSection, Field, Input, RadioButtonGroup, TagsInput, Select, Switch } from '@grafana/ui';
import { selectors } from '@grafana/e2e-selectors';
import { FolderPicker } from 'app/core/components/Select/FolderPicker';
import { DashboardModel } from '../../state/DashboardModel';
import { DeleteDashboardButton } from '../DeleteDashboard/DeleteDashboardButton';
import { TimePickerSettings } from './TimePickerSettings';

import { updateTimeZoneDashboard, updateWeekStartDashboard } from 'app/features/dashboard/state/actions';
import { PreviewSettings } from './PreviewSettings';
import { config } from '@grafana/runtime';
import { getDatasourceSrv } from 'app/features/plugins/datasource_srv';

interface OwnProps {
  dashboard: DashboardModel;
}

export type Props = OwnProps & ConnectedProps<typeof connector>;

const GRAPH_TOOLTIP_OPTIONS = [
  { value: 0, label: 'Default' },
  { value: 1, label: 'Shared crosshair' },
  { value: 2, label: 'Shared Tooltip' },
];

/* eslint-disable */
/* tslint:disable */
const getZabbix = (availableDatasources: string[], datasourceSrv: any) => {
  return new Promise<any>((resolve: any, reject: any) => {
    if (availableDatasources.length > 0) {
      datasourceSrv
        .get(availableDatasources[0])
        .then((datasource: any) => {
          if (datasource.zabbix) {
            resolve(datasource.zabbix);
          } else {
            reject('');
          }
        })
        .catch((err: any) => {
          reject(err);
        });
      } else {
        reject('');
      }
  }) as any;
}

const getHostGroups = (availableDatasources: string[], datasourceSrv: any) => {
  return new Promise<any>((resolve: any, reject: any) => {
    getZabbix(availableDatasources, datasourceSrv)
      .then((zabbix: any) => {
        // Get all host group ids
        zabbix.getAllGroups()
          .then((groups: any) => {
            resolve(groups.map((group: any) => group.name));
          });
      })
      .catch((err: any) => {
        reject(err);
      });
  }) as any;
}

export function GeneralSettingsUnconnected({
  dashboard,
  updateTimeZone,
  updateWeekStart,
}: Props): JSX.Element {
  const [renderCounter, setRenderCounter] = useState(0);
  const [datasourceOptions, setDatasourceOptions] = useState<string[]>([]);
  const [hostGroupOptions, setHostGroupOptions] = useState<string[]>([]);

  useEffect(() => {
    const datasourceSrv = getDatasourceSrv();
    const datasources: any[] = [];
    datasourceSrv.getMetricSources().map((datasource: { name: string }) => datasources.push(datasource.name));
    setDatasourceOptions(datasources);
    const availableDatasources = datasourceSrv
      .getMetricSources()
      .filter((datasource: any) => datasource.meta.id.indexOf('zabbix-datasource') > -1 && datasource.value)
      .map((ds: any) => ds.name);
    if (!dashboard.selectedDatasource && availableDatasources.length > 0) {
      dashboard.selectedDatasource = availableDatasources[0];
    }
    const dsPointer = dashboard.selectedDatasource ? [dashboard.selectedDatasource] : availableDatasources;
    getHostGroups(dsPointer, datasourceSrv).then((groups: string[]) => setHostGroupOptions(groups));
  }, []);

  const onFolderChange = (folder: { id: number; title: string }) => {
    dashboard.meta.folderId = folder.id;
    dashboard.meta.folderTitle = folder.title;
    dashboard.meta.hasUnsavedFolderChange = true;
  };

  const onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    dashboard[event.currentTarget.name as 'title' | 'description'] = event.currentTarget.value;
  };

  const onTooltipChange = (graphTooltip: number) => {
    dashboard.graphTooltip = graphTooltip;
    setRenderCounter(renderCounter + 1);
  };

  const onRefreshIntervalChange = (intervals: string[]) => {
    dashboard.timepicker.refresh_intervals = intervals.filter((i) => i.trim() !== '');
  };

  const onNowDelayChange = (nowDelay: string) => {
    dashboard.timepicker.nowDelay = nowDelay;
  };

  const onHideTimePickerChange = (hide: boolean) => {
    dashboard.timepicker.hidden = hide;
    setRenderCounter(renderCounter + 1);
  };

  const onLiveNowChange = (v: boolean) => {
    dashboard.liveNow = v;
    setRenderCounter(renderCounter + 1);
  };

  const onTimeZoneChange = (timeZone: TimeZone) => {
    dashboard.timezone = timeZone;
    setRenderCounter(renderCounter + 1);
    updateTimeZone(timeZone);
  };

  const onWeekStartChange = (weekStart: string) => {
    dashboard.weekStart = weekStart;
    setRenderCounter(renderCounter + 1);
    updateWeekStart(weekStart);
  };

  const onTagsChange = (tags: string[]) => {
    dashboard.tags = tags;
    setRenderCounter(renderCounter + 1);
  };

  const onEditableChange = (value: boolean) => {
    dashboard.editable = value;
    setRenderCounter(renderCounter + 1);
  };

  const onMaintenanceDatasourceChange = (datasource: any) => {
    dashboard.selectedDatasource = datasource.value;
    setRenderCounter(renderCounter + 1);
    const datasourceSrv = getDatasourceSrv();
    if (datasourceOptions.indexOf(dashboard.selectedDatasource) > -1) {
      getHostGroups([dashboard.selectedDatasource], datasourceSrv)
        .then((groups: string[]) => setHostGroupOptions(groups))
        .catch((err: any) => {
          setHostGroupOptions([]);
        });
    }
  };

  const onMaintenanceHostGroupChange = (hostgroup: any) => {
    dashboard.maintenanceHostGroup = hostgroup.value;
    setRenderCounter(renderCounter + 1);
  };

  const onServiceInfoWikiUrlIsExternalChange = (event: any) => {
    dashboard.serviceInfoWikiUrlIsExternal = event.target.checked;
    setRenderCounter(renderCounter + 1);
  };

  const editableOptions = [
    { label: 'Editable', value: true },
    { label: 'Read-only', value: false },
  ];

  return (
    <div style={{ maxWidth: '600px' }}>
      <h3 className="dashboard-settings__header" aria-label={selectors.pages.Dashboard.Settings.General.title}>
        General
      </h3>
      <div className="gf-form-group">
        <Field label="Maintenance Datasource">
          <Select
            className="width-24"
            options={datasourceOptions.map((item: string) => ({ label: item, value: item }))}
            placeholder="Select datasource"
            value={dashboard.selectedDatasource}
            onChange={onMaintenanceDatasourceChange}
          />
        </Field>
        <Field label="Maintenance Host Group">
          <Select
            className="width-24"
            options={hostGroupOptions.map((item: string) => ({ label: item, value: item }))}
            placeholder="Select host group"
            value={dashboard.maintenanceHostGroup}
            onChange={onMaintenanceHostGroupChange}
          />
        </Field>
        <Field label="Dashboard Logo">
          <Input id="dashboardLogo-input" name="dashboardLogo" onBlur={onBlur} defaultValue={dashboard.dashboardLogo} />
        </Field>
        <Field label="Service Info Wiki URL">
          <Input id="serviceInfoWikiUrl-input" name="serviceInfoWikiUrl" onBlur={onBlur} defaultValue={dashboard.serviceInfoWikiUrl} />
        </Field>
        <Field label="Service Info Wiki URL is External">
          <Switch
            id="serviceInfoWikiUrlIsExternal-toggle"
            value={!!dashboard.serviceInfoWikiUrlIsExternal}
            onChange={onServiceInfoWikiUrlIsExternalChange}
          />
        </Field>
        <Field label="Name">
          <Input id="title-input" name="title" onBlur={onBlur} defaultValue={dashboard.title} />
        </Field>
        <Field label="Description">
          <Input id="description-input" name="description" onBlur={onBlur} defaultValue={dashboard.description} />
        </Field>
        <Field label="Tags">
          <TagsInput id="tags-input" tags={dashboard.tags} onChange={onTagsChange} />
        </Field>
        <Field label="Folder">
          <FolderPicker
            inputId="dashboard-folder-input"
            initialTitle={dashboard.meta.folderTitle}
            initialFolderId={dashboard.meta.folderId}
            onChange={onFolderChange}
            enableCreateNew={true}
            dashboardId={dashboard.id}
            skipInitialLoad={true}
          />
        </Field>

        <Field
          label="Editable"
          description="Set to read-only to disable all editing. Reload the dashboard for changes to take effect"
        >
          <RadioButtonGroup value={dashboard.editable} options={editableOptions} onChange={onEditableChange} />
        </Field>
      </div>

      {config.featureToggles.dashboardPreviews && <PreviewSettings uid={dashboard.uid} />}

      <TimePickerSettings
        onTimeZoneChange={onTimeZoneChange}
        onWeekStartChange={onWeekStartChange}
        onRefreshIntervalChange={onRefreshIntervalChange}
        onNowDelayChange={onNowDelayChange}
        onHideTimePickerChange={onHideTimePickerChange}
        onLiveNowChange={onLiveNowChange}
        refreshIntervals={dashboard.timepicker.refresh_intervals}
        timePickerHidden={dashboard.timepicker.hidden}
        nowDelay={dashboard.timepicker.nowDelay}
        timezone={dashboard.timezone}
        weekStart={dashboard.weekStart}
        liveNow={dashboard.liveNow}
      />

      <CollapsableSection label="Panel options" isOpen={true}>
        <Field
          label="Graph tooltip"
          description="Controls tooltip and hover highlight behavior across different panels"
        >
          <RadioButtonGroup onChange={onTooltipChange} options={GRAPH_TOOLTIP_OPTIONS} value={dashboard.graphTooltip} />
        </Field>
      </CollapsableSection>

      <div className="gf-form-button-row">
        {dashboard.meta.canSave && <DeleteDashboardButton dashboard={dashboard} />}
      </div>
    </div>
  );
}

const mapDispatchToProps = {
  updateTimeZone: updateTimeZoneDashboard,
  updateWeekStart: updateWeekStartDashboard,
};

const connector = connect(null, mapDispatchToProps);

export const GeneralSettings = connector(GeneralSettingsUnconnected);
