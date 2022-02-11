/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { RollupStep } from '@data-wrangling-components/core'
import { memo, useMemo } from 'react'
import { VerbDescription } from '../../index.js'
import { StepDescriptionProps } from '../../types.js'

export const RollupDescription: React.FC<StepDescriptionProps> = memo(
	function RollupDescription(props) {
		const rows = useMemo(() => {
			const internal = props.step as RollupStep
			const { args } = internal
			return [
				{
					before: 'into column',
					value: args.to,
				},
				{
					before: 'rollup column',
					value: args.column,
					sub: [
						{
							before: 'with function',
							value: args.operation,
						},
					],
				},
			]
		}, [props])
		return <VerbDescription {...props} rows={rows} />
	},
)
