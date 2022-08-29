/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import type { Resource } from '../datapackage/Resource.js'
import type { Field } from './Field.js'

/**
 * This contains all of the field-level details for interpreting a data table,
 * including data types, mapping, and metadata.
 * Table schemas are standalone resources that can be linked from a Dataset or embedded.
 * Note also that with persisted metadata and field examples, a table can often be visualized
 * and described to the user without actually loading the source file.
 * resource profile: 'codebook'
 */
export interface Codebook extends Resource {
	fields: Field[]
}
