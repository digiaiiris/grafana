/**
 * Simple function component used to show maintenance table in the maintenance list modal dialog
 */
import { contextSrv } from 'app/core/core';

import { Maintenance, MaintenanceType } from './IirisMaintenanceModel';

interface Props {
  data: Maintenance[];
  onEditMaintenance: (maintenanceId: number) => void;
  onStopMaintenance: (maintenanceId: number) => void;
}

/**
 * Generate duration string from number of seconds
 * @param {number} duration
 * @returns {string}
 */
function generateDurationString(duration: number) {
  let durationDays,
    durationHours,
    durationMinutes,
    durationSeconds = 0;
  let durationString = '';
  if (duration >= 24 * 60 * 60) {
    durationDays = Math.floor(duration / 60 / 60 / 24);
    durationHours = Math.floor((duration - durationDays * 24 * 60 * 60) / 60 / 60);
    durationString = durationDays + 'd ' + (durationHours > 0 ? durationHours + 'h' : '');
  } else if (duration < 24 * 60 * 60 && duration >= 60 * 60) {
    durationHours = Math.floor(duration / 60 / 60);
    durationMinutes = Math.floor((duration - durationHours * 60 * 60) / 60);
    durationString = durationHours + 'h ' + (durationMinutes > 0 ? durationMinutes + 'min' : '');
  } else if (duration < 60 * 60 && duration > 60) {
    durationMinutes = Math.floor(duration / 60);
    durationString = durationMinutes + 'min';
  } else {
    durationSeconds = duration;
    durationString = durationSeconds + 's';
  }
  return durationString;
}

export function IirisMaintenanceTable(props: Props) {
  const texts = contextSrv.getLocalizedTexts();

  return (
    <table className="table">
      <thead>
        <tr>
          <th>{texts.type}</th>
          <th>{texts.description}</th>
          <th>{texts.createdBy}</th>
          <th>{texts.maintenanceListStartTime}</th>
          <th>{texts.maintenanceListEndTime}</th>
          <th>{texts.duration}</th>
          <th>{texts.repeatEnds}</th>
        </tr>
      </thead>
      <tbody>
        {props.data.map((maintenance) => {
          const maintenanceId = maintenance.id;
          let maintenanceTypeString = '';
          if (maintenance.maintenanceType === MaintenanceType.OneTime) {
            maintenanceTypeString = texts.oneTimeAbbr;
          } else if (maintenance.maintenanceType === MaintenanceType.Daily) {
            maintenanceTypeString = texts.dailyAbbr;
          } else if (maintenance.maintenanceType === MaintenanceType.Weekly) {
            maintenanceTypeString = texts.weeklyAbbr;
          } else if (maintenance.maintenanceType === MaintenanceType.Monthly) {
            maintenanceTypeString = texts.monthlyAbbr;
          }

          let errorCells;
          if (maintenance.periodicStartTimeNotCompatibleWithCurrentTimeZone) {
            // Cannot show start and end dates because they have been configured with a different timezone
            // so that if dates were converted to the current local timezone they would show maintenance
            // repetition days incorrectly
            errorCells = <td colSpan={4}>{texts.cannotShowDatesTimeZoneIssue}</td>;
          }

          return (
            <tr key={`tbody-tr-${maintenanceId}`} className={maintenance.ongoing ? 'iiris-ongoing-maintenance' : ''}>
              <td className="iiris-cell-no-word-break">{maintenanceTypeString}</td>
              <td>{maintenance.description}</td>
              <td className="iiris-cell-no-word-break">{maintenance.createdBy}</td>
              {errorCells ? (
                errorCells
              ) : (
                <>
                  <td>{maintenance.startTimeString}</td>
                  <td>{maintenance.endTimeString}</td>
                  <td>{generateDurationString(maintenance.duration)}</td>
                  <td>{maintenance.repeatEndString}</td>
                </>
              )}
              <td>
                <div className="iiris-button-cell">
                  <div
                    className="iiris-button iiris-button-condensed iiris-table-button iiris-table-icon-button"
                    onClick={() => props.onEditMaintenance(maintenanceId)}
                    title="Muokkaa huoltoa"
                  >
                    <span className="fa fa-edit"></span>
                  </div>
                  <div
                    className="iiris-button iiris-button-condensed iiris-table-button iiris-table-icon-button primary"
                    onClick={() => props.onStopMaintenance(maintenanceId)}
                    title="Lopeta huolto"
                  >
                    <span className="fa fa-remove"></span>
                  </div>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
