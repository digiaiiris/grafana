/**
 * Simple function component used to show maintenance table in the maintenance list modal dialog
 */

import React from 'react';
import { useTable } from 'react-table';

import { contextSrv } from 'app/core/core';

interface Props {
  data: any[];
  onEditMaintenance: (maintenanceId: number) => void;
  onStopMaintenance: (maintenanceId: number) => void;
}

export function IirisMaintenanceTable(props: Props) {
  const texts = contextSrv.getLocalizedTexts();
  const columns = [
    {
      Header: texts.type,
      accessor: 'maintenanceTypeString',
    },
    {
      Header: texts.description,
      accessor: 'description',
    },
    {
      Header: texts.createdBy,
      accessor: 'createdBy',
    },
    {
      Header: texts.startTime,
      accessor: 'startTimeString',
    },
    {
      Header: texts.endTime,
      accessor: 'endTimeString',
    },
    {
      Header: texts.duration,
      accessor: 'durationString',
    },
    {
      Header: texts.repeatEnds,
      accessor: 'repeatEndString',
    },
  ];

  const data = props.data.map((item) => {
    const obj: any = {};
    columns.forEach((col) => {
      obj[col.accessor] = item[col.accessor];
    });
    return obj;
  });

  // autoResetHiddenColumns is set to false to prevent infinity loop (see https://stackoverflow.com/questions/63549751/react-maximum-update-depth-exceeded-using-react-table)
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data,
    autoResetHiddenColumns: false,
  });

  return (
    <table {...getTableProps()} className="table">
      <thead>
        {headerGroups.map((headerGroup, i) => (
          <tr {...headerGroup.getHeaderGroupProps()} key={`thead-tr-${i}`}>
            {headerGroup.headers.map((column, i) => (
              <th {...column.getHeaderProps()} key={`thead-th-${i}`}>
                {column.render('Header')}
              </th>
            ))}
            <th></th>
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map((row) => {
          prepareRow(row);
          const maintenanceId = props.data[row.index].id;
          return (
            <tr {...row.getRowProps()} key={`tbody-tr-${maintenanceId}`}>
              {row.cells.map((cell, columnIndex) => {
                return (
                  <td
                    {...cell.getCellProps()}
                    className={'iiris-table-cell ' + (props.data[row.index].ongoing ? 'iiris-colored-row' : '')}
                    key={`tbody-td-${maintenanceId}-${columnIndex}`}
                  >
                    {cell.render('Cell')}
                  </td>
                );
              })}
              <td className={'iiris-button-cell ' + (props.data[row.index].ongoing ? 'iiris-colored-row' : '')}>
                <div
                  className="iiris-button iiris-button-condensed iiris-table-button iiris-table-icon-button"
                  onClick={() => props.onEditMaintenance(props.data[row.index].id)}
                  title="Muokkaa huoltoa"
                >
                  <span className="fa fa-edit"></span>
                </div>
                <div
                  className="iiris-button iiris-button-condensed iiris-table-button iiris-table-icon-button primary"
                  onClick={() => props.onStopMaintenance(props.data[row.index].id)}
                  title="Lopeta huolto"
                >
                  <span className="fa fa-remove"></span>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
