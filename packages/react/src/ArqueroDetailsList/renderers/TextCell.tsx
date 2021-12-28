/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import React, { memo } from 'react'
import { getValue } from '../util'
import { FormattedCellProps } from './types'

/**
 * Basic rendering of text values.
 */
export const TextCell: React.FC<FormattedCellProps> = memo(function TextCell({
	item,
	column,
	textAlign = 'left',
}) {
	const value = getValue(item, column)
	return (
		<div
			style={{
				textAlign,
			}}
		>
			{value}
		</div>
	)
})
