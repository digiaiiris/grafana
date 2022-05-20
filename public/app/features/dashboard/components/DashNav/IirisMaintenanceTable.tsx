/* eslint-disable */
/* tslint:disable */
import React from 'react';
import { useTable } from 'react-table';

interface Props {
  data: any[];
}
 
export function IirisMaintenanceTable(props: Props) {
  const data = props.data.map(item => ({
    maintenanceTypeString: item.maintenanceTypeString,
    description: item.description,
    startTimeString: item.startTimeString,
  }));

  const columns: any = React.useMemo(
    () => [
      {
        Header: 'maintenanceTypeString',
        accessor: 'maintenanceTypeString',
      },
      {
        Header: 'description',
        accessor: 'description',
      },
      {
        Header: 'startTimeString',
        accessor: 'startTimeString',
      },
    ],
    []
  )

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
