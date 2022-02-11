/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import { Dropdown, IDropdownOption } from '@fluentui/react'
import { memo } from 'react'
import { getDropdownValue } from '../util/index.js'
import { DropdownCellProps } from './types.js'

/**
 * Renders an array-valued cell as a dropdown.
 */
export const ArrayDropdownCell: React.FC<DropdownCellProps> = memo(
	function ArrayDropdownCell({ item, column, onCellDropdownSelect, rowIndex }) {
		const values = getDropdownValue(item, rowIndex, column) || []
		const placeholderValues =
			values
				.slice(0, 10)
				.map((value: IDropdownOption) => value.text)
				.join(', ') || 'Open to see the values'

		return (
			<Dropdown
				onChange={onCellDropdownSelect}
				placeholder={placeholderValues}
				options={values}
				styles={{ root: { width: '85%' } }}
			></Dropdown>
		)
	},
)
