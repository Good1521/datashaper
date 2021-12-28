/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { SortDirection } from '@data-wrangling-components/core'
import { IColumn } from '@fluentui/react'
import ColumnTable from 'arquero/dist/types/table/column-table'
import { useMemo } from 'react'
import { useColumnDefaults } from '.'

export function useColumns(
	table: ColumnTable,
	autoRender = false,
	columns?: IColumn[],
	sortColumn?: string,
	sortDirection?: SortDirection,
	selectedColumn?: string,
	onClick?: (ev: React.MouseEvent<HTMLElement>, column: IColumn) => void,
): IColumn[] {
	const columnDefaults = useColumnDefaults(table, autoRender, columns, true)
	return useMemo(() => {
		return columnDefaults.map(column => ({
			...column,
			isSorted: column.fieldName === sortColumn ? true : false,
			isSortedDescending: sortDirection === SortDirection.Descending,
			onColumnClick: onClick,
			data: {
				selected: column.key === selectedColumn,
				...column.data,
			},
		}))
	}, [columnDefaults, sortColumn, sortDirection, selectedColumn, onClick])
}
