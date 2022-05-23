/* eslint-disable */
/* tslint:disable */
import React from 'react';
import { useTable } from 'react-table';

interface ColumnType {
  accessor: string;
  Header: string;
}

interface Props {
  data: any[];
  columns: ColumnType[];
}
 
export function IirisMaintenanceTable(props: Props) {
  const columns = props.columns;
  const data = props.data.map(item => {
    const obj: any = {};
    columns.map((col: ColumnType) => {
      obj[col.accessor] = item[col.accessor];
    });
    return obj;
  });

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable({ columns, data })

  return (
    <table {...getTableProps()} className="table">
      <thead>
        {headerGroups.map(headerGroup => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map(column => (
              <th
                {...column.getHeaderProps()}
              >
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()}>
        {rows.map(row => {
          prepareRow(row)
          return (
            <tr {...row.getRowProps()}>
              {row.cells.map(cell => {
                return (
                  <td
                    {...cell.getCellProps()}
                    className="iiris-table-cell"
                  >
                    {cell.render('Cell')}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
