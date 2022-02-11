/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { ImputeArgs, InputColumnArgs } from '@data-wrangling-components/core'
import { TextField } from '@fluentui/react'
import { memo, useMemo } from 'react'
import styled from 'styled-components'
import { LeftAlignedRow, useHandleTextfieldChange } from '../../common/index.js'
import { StepComponentProps } from '../../types.js'

interface ColumnArgs extends InputColumnArgs, ImputeArgs {}

/**
 * Just the to/value inputs for an impute.
 * Input table is expected to be edited elsewhere and configured as the step input.
 */
export const ImputeInputs: React.FC<StepComponentProps> = memo(
	function ImputeInputs({ step, onChange }) {
		// always match the input column and output - impute is an inline replacement verb
		const args = useMemo<ColumnArgs>(() => {
			return {
				...(step.args as ColumnArgs),
				to: (step as any).column,
			} as ColumnArgs
		}, [step])

		const handleValueChange = useHandleTextfieldChange(
			step,
			'args.value',
			onChange,
		)

		return (
			<Container>
				<LeftAlignedRow>
					<TextField
						required
						label={'Fill value'}
						value={(args as any).value && `${(args as any).value}`}
						placeholder={'text, number, or boolean'}
						onChange={handleValueChange}
					/>
				</LeftAlignedRow>
			</Container>
		)
	},
)

const Container = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: flex-start;
`
