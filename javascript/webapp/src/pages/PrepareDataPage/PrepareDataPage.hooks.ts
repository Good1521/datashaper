/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import {
	useHeaderCommandBarDefaults,
	useWorkflowSteps,
} from '@datashaper/react'
import type { TableContainer } from '@datashaper/tables'
import { introspect } from '@datashaper/tables'
import { renameDuplicatedFileName } from '@datashaper/utilities'
import type { Workflow } from '@datashaper/workflow'
import type { ICommandBarProps } from '@fluentui/react'
import { useBoolean } from '@fluentui/react-hooks'
import { useCallback, useEffect, useMemo, useState } from 'react'

export function useTables(setSelectedTableId: (id: string) => void): {
	tables: TableContainer[]
	onAddTables: (update: TableContainer[]) => void
} {
	const [tables, setTables] = useState<TableContainer[]>([])

	const onAddTables = useCallback(
		(update: TableContainer[]) => {
			if (update.length > 0) {
				const map = new Map<string, number>()
				const allTables = [...tables, ...update].map(table => {
					if (!table.metadata) {
						table.metadata = introspect(table.table!, true)
					}
					return table
				})
				const renamedTables = allTables.map(t => ({
					...t,
					id: renameDuplicatedFileName(map, t.id),
				}))
				setSelectedTableId(renamedTables[renamedTables.length - 1]?.id)
				setTables(renamedTables)
			}
		},
		[setTables, setSelectedTableId, tables],
	)

	return {
		tables,
		onAddTables,
	}
}

export function useStepListener(
	workflow: Workflow,
	setSelectedTableId: (tableId: string) => void,
	inputNames: string[],
): void {
	useEffect(() => {
		if (workflow.steps.length > 0) {
			const { id } = workflow.steps[workflow.steps.length - 1]
			setSelectedTableId(id)
		} else {
			if (workflow.inputNames.size > 0) {
				const lastInputName = inputNames[workflow.inputNames.size - 1]
				if (lastInputName) {
					setSelectedTableId(lastInputName)
				}
			}
		}
	}, [workflow, inputNames, setSelectedTableId])
}

export function useInputListener(
	workflow: Workflow,
	inputs: TableContainer[],
): void {
	useEffect(
		function syncDataTablesWhenInputsChange() {
			if (inputs) {
				workflow.addInputTables(inputs)
			}
		},
		[workflow, inputs],
	)
}

export function useHistory(workflow: Workflow): {
	historyProps: ICommandBarProps
	isCollapsed: boolean
	toggleCollapsed: () => void
} {
	const [isCollapsed, { toggle: toggleCollapsed }] = useBoolean(false)
	const steps = useWorkflowSteps(workflow)
	const baseProps = useMemo(
		() =>
			({
				items: [
					{
						key: 'history',
						text: `(${steps.length})`,
						iconProps: {
							iconName: 'Clock',
						},
						// disabled: steps.length === 0,
						onClick: () => toggleCollapsed(),
					},
				],
			} as ICommandBarProps),
		[steps, toggleCollapsed],
	)
	const historyProps = useHeaderCommandBarDefaults(baseProps, true)
	return {
		historyProps,
		isCollapsed,
		toggleCollapsed,
	}
}
