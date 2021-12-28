/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import {
	DetailsList,
	DetailsListLayoutMode,
	IColumn,
	SelectionMode,
	IDetailsListProps,
	IDetailsListStyles,
} from '@fluentui/react'
import ColumnTable from 'arquero/dist/types/table/column-table'
import React, { memo, useMemo } from 'react'
import {
	useColumns,
	useDetailsListStyles,
	useSlicedTable,
	useSortedTable,
	useSortHandling,
} from './hooks'

export interface ArqueroDetailsListProps
	extends Omit<IDetailsListProps, 'items'> {
	table: ColumnTable
	/**
	 * Indicates to introspect the data columns and provide full rich rendering automatically for everything.
	 * TODO: we could use an enum and specify levels of richness. For example, basic formatting -> header details -> full-blown smart cells.
	 */
	autoRender?: boolean
	offset?: number
	limit?: number
	isSortable?: boolean
	/**
	 * Passthrough to the column click handler
	 */
	onColumnClick?: (ev: React.MouseEvent<HTMLElement>, column: IColumn) => void
	/**
	 * Key for a selected column - this is not normally an option in DetailsList
	 */
	selectedColumn?: string
}

/**
 * Renders an arquero table using a fluent DetailsList.
 */
export const ArqueroDetailsList: React.FC<ArqueroDetailsListProps> = memo(
	function ArqueroDetailsList(props) {
		const {
			table,
			autoRender = false,
			offset = 0,
			limit = Infinity,
			isSortable = true,
			selectedColumn,
			onColumnClick,
			// extract props we want to set data-centric defaults for
			selectionMode = SelectionMode.none,
			layoutMode = DetailsListLayoutMode.fixedColumns,
			columns,
			onColumnHeaderClick,
			styles,
			// passthrough the remainder as props
			...rest
		} = props
		const { sortColumn, sortDirection, handleColumnHeaderClick } =
			useSortHandling(isSortable, onColumnHeaderClick)
		// first apply sort to internal table copy
		// note that this is different than the orderby of a pipeline step
		// this is a temporary sort only for the table display
		const sorted = useSortedTable(table, sortColumn, sortDirection)
		// slice any potential page
		const sliced = useSlicedTable(sorted, offset, limit)
		// last, copy these items to actual JS objects for the DetailsList
		// TODO: an iterator facade over the table compatible with DetailsList to avoid this copy?
		const items = useMemo(() => sliced.objects(), [sliced])

		const displayColumns = useColumns(
			table,
			autoRender,
			columns,
			sortColumn,
			sortDirection,
			selectedColumn,
			onColumnClick,
		)

		const headerStyle = useDetailsListStyles(
			{
				autoRender,
			},
			styles as IDetailsListStyles,
		)

		return (
			<DetailsList
				items={items}
				selectionMode={selectionMode}
				layoutMode={layoutMode}
				columns={displayColumns as IColumn[]}
				onColumnHeaderClick={handleColumnHeaderClick}
				{...rest}
				styles={headerStyle}
			/>
		)
	},
)
