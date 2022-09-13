/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { ArqueroDetailsList, ArqueroTableHeader } from '@datashaper/react'
import { Label } from '@fluentui/react'
import type ColumnTable from 'arquero/dist/types/table/column-table'
import { memo } from 'react'

import { Table } from '../ArqueroDetailsList.styles.js'
import { useGrouping } from './RowGrouping.hooks.js'
import { ButtonContainer, GroupByToggle } from './RowGrouping.styles.js'

export interface RowGroupingProps {
	table: ColumnTable | undefined
}

export const RowGrouping: React.FC<RowGroupingProps> = memo(
	function RowGrouping({ table }) {
		const { grouped, metadata, onGroupChange } = useGrouping(table)

		if (!grouped || !metadata) {
			return <div>Loading...</div>
		}

		return (
			<Table>
				<Label>Group by: </Label>
				<ButtonContainer>
					<GroupByToggle
						label="Symbol"
						onText="On"
						offText="Off"
						onChange={(_e, checked) => onGroupChange('Symbol', checked)}
					/>
					<GroupByToggle
						label="Month"
						onText="On"
						offText="Off"
						onChange={(_e, checked) => onGroupChange('Month', checked)}
					/>
				</ButtonContainer>

				<ArqueroTableHeader table={grouped} />
				<ArqueroDetailsList
					isSortable
					compact
					showColumnBorders
					isHeadersFixed
					table={grouped}
					metadata={metadata}
				/>
			</Table>
		)
	},
)
