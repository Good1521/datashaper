/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { DataFormat } from '@datashaper/schema'
import { DataTable } from '@datashaper/workflow'
import type { ComponentStory } from '@storybook/react'
import { useEffect, useMemo } from 'react'

import { DataTableSchemaComponent } from './DataTableSchemaComponent.js'

const storyMetadata = {
	title: 'App:Components/DataTableSchemaComponent',
	component: DataTableSchemaComponent,
	argTypes: {},
}
export default storyMetadata

const Template: ComponentStory<typeof DataTableSchemaComponent> = ({
	...args
}): JSX.Element => {
	const resource = useMemo(
		() =>
			new DataTable({
				format: DataFormat.CSV,
			}),
		[],
	)
	useEffect(() => resource.onChange(() => console.log(resource)), [resource])
	return (
		<div
			style={{
				width: 240,
				height: 400,
				padding: 10,
				overflowY: 'auto',
				border: '1px solid orange',
			}}
		>
			<DataTableSchemaComponent {...args} resource={resource} />
		</div>
	)
}

export const DataTableSchemaComponentStory = Template.bind({})
DataTableSchemaComponentStory.storyName = 'DataTableSchemaComponent'
