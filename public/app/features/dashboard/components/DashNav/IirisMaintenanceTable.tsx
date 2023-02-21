import React from 'react';
import { useTable } from 'react-table';

interface ColumnType {
  accessor: string;
  Header: string;
}

interface Props {
  data: any[];
  columns: ColumnType[];
  onEditMaintenance: (maintenanceId: string) => void;
  onStopMaintenance: (maintenanceId: string) => void;
  ongoingMaintenanceIds: string[];
}

export function IirisMaintenanceTable(props: Props) {
  const columns = props.columns;
  const data = props.data.map((item) => {
    const obj: any = {};
    columns.map((col: ColumnType) => {
      obj[col.accessor] = item[col.accessor];
    });
    return obj;
  });

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data });

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
        {rows.map((row, i) => {
          prepareRow(row);
          return (
            <tr {...row.getRowProps()} key={`tbody-tr-${i}`}>
              {row.cells.map((cell) => {
                return (
                  <td
                    {...cell.getCellProps()}
                    className={
                      'iiris-table-cell ' +
                      (props.ongoingMaintenanceIds.indexOf(props.data[row.index].internalId) > -1
                        ? 'iiris-colored-row'
                        : '')
                    }
                    key={`tbody-td-${i}`}
                  >
                    {cell.render('Cell')}
                  </td>
                );
              })}
              <td
                className={
                  'iiris-button-cell ' +
                  (props.ongoingMaintenanceIds.indexOf(props.data[row.index].internalId) > -1
                    ? 'iiris-colored-row'
                    : '')
                }
              >
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
