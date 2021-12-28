/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import React, { memo } from 'react'
import { getValue } from '../util'
import { useFormattedNumber } from './hooks'
import { FormattedCellProps } from './types'
/**
 * Basic endering of number values.
 */
export const NumberCell: React.FC<FormattedCellProps> = memo(
	function NumberCell({ item, column, textAlign = 'right', numberFormat }) {
		const value = getValue(item, column)
		const printed = useFormattedNumber(value, numberFormat)
		return (
			<div
				style={{
					textAlign,
				}}
			>
				{printed}
			</div>
		)
	},
)
