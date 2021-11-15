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
  getDisplayValueAlignmentFactors,
  getFieldDisplayValues,
  PanelProps,
} from '@grafana/data';

import { config } from 'app/core/config';
import { StatPanelOptions } from './types';
import { DataLinksContextMenuApi } from '@grafana/ui/src/components/DataLinks/DataLinksContextMenu';

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
  }

  onPanelClick = () => {
    if (this.panel && this.panel.links && this.panel.links.length > 0) {
      window.location.href = this.panel.links[0].url;
    }
  };

  onMouseEnterPanel = () => {
    if (this.panel && this.panel.links && this.panel.links.length > 0) {
      this.setState({ tooltipVisible: true });
    }
  };

  onMouseLeavePanel = () => {
    this.setState({ tooltipVisible: false });
  };

  onMouseMoveOver(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const { tooltipRef } = this.state;
    const url = this.panel.links[0].url;
    let title = this.panel.links[0].title;
    if (!title) {
      title = url;
    }
    console.log('joo: ' + title);
    if (tooltipRef) {
      const xpos = this.getTooltipXPos(tooltipRef.offsetWidth, event.pageX);
      console.log(xpos);
      this.setState({
        tooltipX: xpos,
        tooltipY: event.pageY - 50,
        hoveredTileUrl: url,
        hoveredTileTitle: title,
        tooltipVisible: !!url,
      });
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
        theme={config.theme}
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
        <DataLinksContextMenu links={getLinks}>
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

    return getFieldDisplayValues({
      fieldConfig,
      reduceOptions: options.reduceOptions,
      replaceVariables,
      theme: config.theme,
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
        onClick={this.onPanelClick}
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
