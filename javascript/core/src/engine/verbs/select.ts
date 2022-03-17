/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { all } from 'arquero'

import { container } from '../../factories.js'
import type { TableStore } from '../../index.js'
import type { SelectStep, TableContainer } from '../../types.js'

/**
 * Executes an arquero select.
 * @param step
 * @param store
 * @returns
 */
export async function select(
	{ input, output, args: { columns = [] } }: SelectStep,
	store: TableStore,
): Promise<TableContainer> {
	const inputTable = await store.table(input)
	const expr = [columns] as any

	if (expr.length === 0) {
		expr.push(all())
	}
	return container(output, inputTable.select(...expr))
}
