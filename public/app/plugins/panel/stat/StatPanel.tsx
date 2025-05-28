import { isNumber } from 'lodash';
import { PureComponent } from 'react';
import { connect, ConnectedProps } from 'react-redux';

import {
  DisplayValueAlignmentFactors,
  FieldDisplay,
  FieldType,
  getDisplayValueAlignmentFactors,
  getFieldDisplayValues,
  NumericRange,
  PanelProps,
} from '@grafana/data';
import { findNumericFieldMinMax } from '@grafana/data/src/field/fieldOverrides';
import { BigValueTextMode, BigValueGraphMode } from '@grafana/schema';
import { BigValue, DataLinksContextMenu, VizRepeater, VizRepeaterRenderValueProps } from '@grafana/ui';
import { StoreState } from 'app/types';
import { PanelModel } from 'app/features/dashboard/state/PanelModel';
import { GrafanaRouteComponentProps } from 'app/core/navigation/types';
import { DataLinksContextMenuApi } from '@grafana/ui/src/components/DataLinks/DataLinksContextMenu';
import { config } from 'app/core/config';
import { initDashboard } from '../../../features/dashboard/state/initDashboard';

import { Options } from './panelcfg.gen';

export interface DashboardPageRouteParams {
  uid?: string;
  type?: string;
  slug?: string;
}

const mapStateToProps = (state: StoreState) => ({
  dashboard: state.dashboard.getModel(),
});

const mapDispatchToProps = {
  initDashboard,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

export type Props = GrafanaRouteComponentProps<DashboardPageRouteParams, { panelId: string; timezone?: string }> &
  ConnectedProps<typeof connector>;

export interface State {
  panel: PanelModel | null;
  notFound: boolean;
}

export class StatPanel extends PureComponent<PanelProps<Options>, State> {
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
        disableWideLayout={!options.wideLayout}
        percentChangeColorMode={options.percentChangeColorMode}
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
      percentChange: options.showPercentChange,
      timeZone,
    });
  };

  render() {
    const { height, options, width, data, renderCounter } = this.props;

    return (
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
    );
  }
}

export default connector(StatPanel);
