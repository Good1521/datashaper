/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import type { TreeGroup, TreeItem } from '@essex/components'
import { useMemo } from 'react'

import type { ResourceRoute, ResourceRouteGroup } from '../../../types.js'
import { ResourceGroupType } from '../../../types.js'
import { FieldWells } from './FieldWells.js'
import type { BindingChangeHandler } from './ResourceTree.types.js'

/**
 * Extract the grouping instructions for the Tree component.
 * @param groups
 * @returns
 */
export function useTreeGroups(
	groups: ResourceRouteGroup[],
	narrow = false,
): TreeGroup[] {
	return useMemo(
		() => groups.map((g) => ({ key: g.type, text: groupName(g, narrow) })),
		[groups, narrow],
	)
}

function groupName(group: ResourceRouteGroup, narrow = false): string {
	switch (group.type) {
		case ResourceGroupType.Data:
			return narrow ? 'Data' : 'Data files'
		default:
			return narrow ? 'Apps' : 'Analysis apps'
	}
}

/**
 * Extract a flat list of TreeItems for the Tree, with each assigned to a group
 * that aligns with the grouping instructions.
 * @param groups
 * @returns
 */
export function useTreeItems(
	groups: ResourceRouteGroup[],
	onSelect: (v: ResourceRoute) => void,
	onBindingChange?: BindingChangeHandler,
): TreeGroup[] {
	return useMemo(
		() =>
			groups.flatMap((group) =>
				group.resources.map((resource) =>
					makeTreeItem(resource, group.type, onSelect, onBindingChange),
				),
			),
		[groups, onSelect, onBindingChange],
	)
}

function makeTreeItem(
	resource: ResourceRoute,
	group?: ResourceGroupType,
	onSelect?: (v: ResourceRoute) => void,
	onBindingChange?: BindingChangeHandler,
): TreeItem {
	const numChildren = resource.children?.length ?? 0
	const customRender = resource.fieldWells
		? (props: any, defaultRenderer: any) => {
				return (
					<>
						{resource.fieldWells && (
							<FieldWells
								fields={resource.fieldWells}
								onBindingChange={onBindingChange}
							/>
						)}
						{defaultRenderer(props)}
					</>
				)
		  }
		: undefined
	return {
		// TODO: is this no-href valid?
		key: resource.href ?? 'no-href',
		text: resource.title,
		iconName: resource.icon,
		group,
		// TEMP: this is because the tree will not allow expansion if there are no children
		// but if we have an onRendeContent, we should still allow expansion
		expanded: true,
		children:
			numChildren > 0
				? resource.children?.map((c) =>
						makeTreeItem(c, group, onSelect, onBindingChange),
				  )
				: undefined,
		menuItems: resource.menuItems,
		onClick: () => onSelect?.(resource),
		onRenderContent: customRender,
	}
}
