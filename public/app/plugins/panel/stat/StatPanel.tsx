/* eslint-disable */
/* tslint:disable */
import React, { PureComponent } from 'react';
import { connect, MapDispatchToProps, MapStateToProps } from 'react-redux';
import {
  BigValue,
  BigValueGraphMode,
  DataLinksContextMenu,
  VizRepeater,
  VizRepeaterRenderValueProps,
  BigValueTextMode,
} from '@grafana/ui';
import {
  DisplayValueAlignmentFactors,
  FieldDisplay,
  FieldType,
  getDisplayValueAlignmentFactors,
  getFieldDisplayValues,
  NumericRange,
  PanelProps,
  urlUtil,
  DataLinkBuiltInVars,
} from '@grafana/data';
import {
  getExpandedUrlLink,
  getExpandedTemplateVariables
} from 'app/features/dashboard/components/DashNav/common_tools';
import { getTemplateSrv } from '@grafana/runtime';

import { config } from 'app/core/config';
import { StatPanelOptions } from './types';
import { DataLinksContextMenuApi } from '@grafana/ui/src/components/DataLinks/DataLinksContextMenu';
import { findNumericFieldMinMax } from '@grafana/data/src/field/fieldOverrides';
import { isNumber } from 'lodash';

interface Props extends PanelProps<StatPanelOptions> {
  dashboard: any;
}

interface State {
  tooltipVisible: boolean;
  tooltipX: number;
  tooltipY: number;
  hoveredTileUrl: string;
  hoveredTileTitle: string;
  tooltipRef: any;
}

export class StatPanelUnconnected extends PureComponent<Props, State> {
  panel: any;
  linkUrl: string = '';
  linkTitle: string = '';

  constructor(props: any) {
    super(props);
    this.state = {
      tooltipVisible: false,
      tooltipX: -1000,
      tooltipY: 0,
      hoveredTileUrl: '',
      hoveredTileTitle: '',
      tooltipRef: undefined,
    };
  }

  componentDidMount() {
    const { dashboard, id } = this.props;
    this.panel = dashboard.panels.find((panel: any) => panel.id === id);
    if (!this.panel && dashboard.panelInEdit.id === id) {
      this.panel = dashboard.panels.find((panel: any) => panel.id === dashboard.panelInEdit.editSourceId);
    }
    // Set link title and url to class attributes
    // Check first for regular Grafana panel links and if that doesn't exist then check for data links
    // Also check for override links if there is only one override (can't add tooltips for multiple links)
    if (this.hasFieldConfigOverrides()) {
      this.linkUrl = this.panel.fieldConfig.overrides[0].properties[0].value[0].url;
      this.linkTitle = this.panel.fieldConfig.overrides[0].properties[0].value[0].title;
      this.expandVariables(this.linkUrl, this.linkTitle);
    } else if (this.hasFieldConfigLinks()) {
      this.linkUrl = this.panel.fieldConfig.defaults.links[0].url;
      this.linkTitle = this.panel.fieldConfig.defaults.links[0].title;
      this.expandVariables(this.linkUrl, this.linkTitle);
    } else if (this.hasPanelLinks()) {
      this.linkUrl = this.panel.links[0].url;
      this.linkTitle = this.panel.links[0].title;
      this.expandVariables(this.linkUrl, this.linkTitle);
    }
  }

  hasPanelLinks = () => {
    return this.panel && this.panel.links && this.panel.links.length > 0;
  }

  hasFieldConfigLinks = () => {
    return (
      this.panel && this.panel.fieldConfig &&
      this.panel.fieldConfig.defaults &&
      this.panel.fieldConfig.defaults.links &&
      this.panel.fieldConfig.defaults.links.length > 0
    );
  }

  hasFieldConfigOverrides = () => {
    return (
      this.panel && this.panel.fieldConfig &&
      this.panel.fieldConfig.overrides &&
      this.panel.fieldConfig.overrides.length === 1 &&
      this.panel.fieldConfig.overrides[0].properties &&
      this.panel.fieldConfig.overrides[0].properties.length > 0 &&
      this.panel.fieldConfig.overrides[0].properties[0].value &&
      this.panel.fieldConfig.overrides[0].properties[0].value.length > 0 &&
      this.panel.fieldConfig.overrides[0].properties[0].value[0].url
    );
  }

  expandVariables = (linkUrl: string, linkTitle: string) => {
    const vars = Object.assign({}, this.panel.scopedVars);
    this.linkUrl = getExpandedUrlLink(
      linkUrl,
      getTemplateSrv(),
      urlUtil,
      DataLinkBuiltInVars,
      vars
    );
    this.linkTitle = getExpandedTemplateVariables(linkTitle, getTemplateSrv(), vars);
  }

  onPanelClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.stopPropagation();
    if (this.linkUrl) {
      window.location.href = this.linkUrl;
    }
  };

  onMouseEnterPanel = () => {
    if (this.linkUrl) {
      this.setState({ tooltipVisible: true });
    }
  };

  onMouseLeavePanel = () => {
    this.setState({ tooltipVisible: false });
  };

  onMouseMoveOver(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const { tooltipRef } = this.state;
    const url = this.linkUrl;
    let title = this.linkTitle;
    if (this.linkUrl) {
      if (!title) {
        title = url;
      }
      if (tooltipRef) {
        const xpos = this.getTooltipXPos(tooltipRef.offsetWidth, event.pageX);
        this.setState({
          tooltipX: xpos,
          tooltipY: event.pageY - 50,
          hoveredTileUrl: url,
          hoveredTileTitle: title,
          tooltipVisible: !!url,
        });
      }
    }
  }

  getTooltipXPos = (tooltipWidth: any, pageX: number) => {
    const totalWidth = pageX + tooltipWidth;
    const xpos = totalWidth > window.innerWidth ? window.innerWidth - tooltipWidth : pageX;
    return xpos;
  };

  getTooltipRef = (tooltipRef: any) => {
    this.setState({ tooltipRef });
  };

  renderComponent = (
    valueProps: VizRepeaterRenderValueProps<FieldDisplay, DisplayValueAlignmentFactors>,
    menuProps: DataLinksContextMenuApi
  ): JSX.Element => {
    const { timeRange, options } = this.props;
    const { value, alignmentFactors, width, height, count } = valueProps;
    const { openMenu, targetClassName } = menuProps;
    let sparkline = value.sparkline;
    if (sparkline) {
      sparkline.timeRange = timeRange;
    }

    return (
      <BigValue
        value={value.display}
        count={count}
        sparkline={sparkline}
        colorMode={options.colorMode}
        graphMode={options.graphMode}
        justifyMode={options.justifyMode}
        textMode={this.getTextMode()}
        alignmentFactors={alignmentFactors}
        text={options.text}
        width={width}
        height={height}
        theme={config.theme2}
        onClick={openMenu}
        className={targetClassName}
      />
    );
  };

  getTextMode() {
    const { options, fieldConfig, title } = this.props;

    // If we have manually set displayName or panel title switch text mode to value and name
    if (options.textMode === BigValueTextMode.Auto && (fieldConfig.defaults.displayName || !title)) {
      return BigValueTextMode.ValueAndName;
    }

    return options.textMode;
  }

  renderValue = (valueProps: VizRepeaterRenderValueProps<FieldDisplay, DisplayValueAlignmentFactors>): JSX.Element => {
    const { value } = valueProps;
    const { getLinks, hasLinks } = value;

    if (hasLinks && getLinks) {
      return (
        <DataLinksContextMenu links={getLinks} config={value.field}>
          {(api) => {
            return this.renderComponent(valueProps, api);
          }}
        </DataLinksContextMenu>
      );
    }

    return this.renderComponent(valueProps, {});
  };

  getValues = (): FieldDisplay[] => {
    const { data, options, replaceVariables, fieldConfig, timeZone } = this.props;

    let globalRange: NumericRange | undefined = undefined;

    for (let frame of data.series) {
      for (let field of frame.fields) {
        let { config } = field;
        // mostly copied from fieldOverrides, since they are skipped during streaming
        // Set the Min/Max value automatically
        if (field.type === FieldType.number) {
          if (field.state?.range) {
            continue;
          }
          if (!globalRange && (!isNumber(config.min) || !isNumber(config.max))) {
            globalRange = findNumericFieldMinMax(data.series);
          }
          const min = config.min ?? globalRange!.min;
          const max = config.max ?? globalRange!.max;
          field.state = field.state ?? {};
          field.state.range = { min, max, delta: max! - min! };
        }
      }
    }

    return getFieldDisplayValues({
      fieldConfig,
      reduceOptions: options.reduceOptions,
      replaceVariables,
      theme: config.theme2,
      data: data.series,
      sparkline: options.graphMode !== BigValueGraphMode.None,
      timeZone,
    });
  };

  render() {
    const { height, options, width, data, renderCounter } = this.props;
    const { tooltipVisible, tooltipX, tooltipY, hoveredTileTitle } = this.state;

    return (
      <div
        className={'iiris-stat-panel' + (tooltipVisible ? ' has-link' : '')}
        onClick={(event) => this.onPanelClick(event)}
        onMouseEnter={this.onMouseEnterPanel}
        onMouseLeave={this.onMouseLeavePanel}
        onMouseMove={(event) => this.onMouseMoveOver(event)}
      >
        <VizRepeater
          getValues={this.getValues}
          getAlignmentFactors={getDisplayValueAlignmentFactors}
          renderValue={this.renderValue}
          width={width}
          height={height}
          source={data}
          itemSpacing={3}
          renderCounter={renderCounter}
          autoGrid={true}
          orientation={options.orientation}
        />
        {tooltipVisible ? (
          <div
            className="grafana-tooltip iiris-maintenance-tooltip"
            id="iirisstatustooltip"
            ref={this.getTooltipRef}
            style={{ top: tooltipY + 'px', left: tooltipX + 'px' }}
          >
            {hoveredTileTitle}
          </div>
        ) : null}
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<any, any> = (state: any, props: any) => {
  const dashboard = state.dashboard.getModel();
  return { dashboard };
};

const mapDispatchToProps: MapDispatchToProps<any, any> = {};

export const StatPanel = connect(mapStateToProps, mapDispatchToProps)(StatPanelUnconnected);
