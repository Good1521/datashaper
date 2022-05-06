/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { isInputTableStep } from '@data-wrangling-components/core'
import { NodeInput } from '@essex/dataflow'
import { memo } from 'react'
import styled from 'styled-components'

import { TableDropdown } from '../controls/index.js'
import {
	useDropdownChangeHandler,
	useSimpleDropdownOptions,
	useTableNames,
} from '../hooks/index.js'
import { LeftAlignedRow } from '../styles.js'
import type { StepComponentProps } from '../types.js'
import type { HOCFunction } from './types.js'

/**
 * Higher order component generator to wrap a Step in the input table dropdown.
 * @param label - optional label to use for the dropdown instead of the default.
 * @returns
 */
export function withInputTableDropdown(
	label?: string,
): HOCFunction<StepComponentProps> {
	return Component => {
		const WithTableDropdown: React.FC<StepComponentProps> = props => {
			const { step, graph, onChange } = props
			const tables = useTableNames(graph)
			const tableOptions = useSimpleDropdownOptions(tables)
			const handleTableChange = useDropdownChangeHandler(
				step,
				(s, val) => (s.input[NodeInput.Source] = { node: val as string }),
				onChange,
			)
			if (!isInputTableStep(step)) {
				return <Component {...props} />
			} else {
				const selected = step.input[NodeInput.Source]?.node
				return (
					<Container className="with-input-table-dropdown">
						<LeftAlignedRow>
							<TableDropdown
								options={tableOptions}
								label={label || 'Input table'}
								selectedKey={selected}
								onChange={handleTableChange}
							/>
						</LeftAlignedRow>
						<Component {...props} />
					</Container>
				)
			}
		}
		return memo(WithTableDropdown)
	}
}

const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	align-content: flex-start;
	justify-content: flex-start;
`
