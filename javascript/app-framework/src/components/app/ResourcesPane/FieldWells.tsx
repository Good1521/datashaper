/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import type { IDropdownOption } from '@fluentui/react'
import { Dropdown } from '@fluentui/react'
import { memo, useCallback } from 'react'
import type { ResourceSlotFieldWell } from '../../../types.js'

import {
	Container,
	FieldContainer,
	StyledIcon,
	Title,
	useFieldDropdownProps,
	Well,
} from './FieldWells.styles.js'
import type { FieldWellsProps } from './FieldWells.types.js'

// TODO: collapsed width state

export const FieldWells: React.FC<FieldWellsProps> = memo(function FieldWells({
	fields,
}) {
	return (
		<Container>
			{fields.map((field) => {
				return <FieldWell key={`field-well-${field.slot.key}`} field={field} />
			})}
		</Container>
	)
})

interface FieldWellProps {
	field: ResourceSlotFieldWell
}

export const FieldWell: React.FC<FieldWellProps> = memo(function FieldWell({
	field,
}) {
	const dropdownProps = useFieldDropdownProps()
	const { slot, selectedKey, options } = field
	const { title, placeholder, icon, required } = slot

	const handleChange = useCallback(
		(_e: React.FormEvent<HTMLDivElement>, option?: IDropdownOption) =>
			field.onChange?.((option?.key as string) || ''),
		[field],
	)
	const disabled = !options || options.length === 0
	return (
		<FieldContainer>
			<Title>{title}</Title>
			<Well>
				<StyledIcon iconName={icon} />
				<Dropdown
					disabled={disabled}
					options={options || []}
					placeholder={disabled ? '(No valid options)' : placeholder}
					required={required}
					onChange={handleChange}
					selectedKey={selectedKey}
					{...dropdownProps}
				/>
			</Well>
		</FieldContainer>
	)
})
