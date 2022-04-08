/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { table } from 'arquero'

import { Verb } from '../../index.js'
import type { Step } from '../../steps/index.js'
import { step } from '../../steps/step.js'
import { createTableStore } from '../../store/index.js'
import type { Store } from '../../store/types.js'
import type { TableContainer } from '../../tables/index.js'
import { createGraph } from '../graph.js'

describe('stepGraph', () => {
	let store: Store<TableContainer>

	beforeEach(() => {
		store = createTableStore([
			{ id: 'input', table: table({ ID: [1, 2, 3, 4] }) },
		])
	})

	test('runs a single step with normal input/output', () => {
		const steps: Step[] = [
			step({
				verb: Verb.Fill,
				args: {
					to: 'filled',
					value: 1,
				},
				inputs: {
					source: 'input',
				},
				outputs: { target: 'output' },
			}),
		]

		const g = createGraph(steps, store)
		expect(g).toBeDefined()
		const result = store.get('output')
		expect(result?.table?.numCols()).toBe(2)
		expect(result?.table?.numRows()).toBe(4)
		expect(store.list()).toEqual(['input', 'output'])
	})

	test('runs multiple steps with normal input/output and all intermediates', () => {
		const steps: Step[] = [
			step({
				id: 'output-1',
				verb: Verb.Fill,
				inputs: {
					source: { node: 'input' },
				},
				args: {
					to: 'filled',
					value: 1,
				},
				outputs: { target: 'output-1' },
			}),
			step({
				id: 'output-2',
				verb: Verb.Fill,
				args: {
					to: 'filled2',
					value: 2,
				},
				// Note: this input is being auto-configured to the output of the previous node
				// todo: restore auto-wiring?
				inputs: {
					source: { node: 'output-1' },
				},
				outputs: { target: 'output-2' },
			}),
		]

		const g = createGraph(steps, store)
		expect(g).toBeDefined()
		const result = store.get('output-2')
		expect(result).toBeDefined()
		expect(result?.table?.numCols()).toBe(3)
		expect(result?.table?.numRows()).toBe(4)
		expect(result?.table?.columnNames()).toEqual(['ID', 'filled', 'filled2'])
		expect(store.list()).toEqual(['input', 'output-1', 'output-2'])
	})
})
