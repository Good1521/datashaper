/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */

import type { Step } from '@datashaper/workflow'
import { isNoArgsStep } from '@datashaper/workflow'
import { CollapsiblePanel, DialogConfirm } from '@essex/components'
import { DefaultButton, useTheme } from '@fluentui/react'
import { memo } from 'react'

import { DisplayOrder } from '../../enums.js'
import { useWorkflowSteps } from '../../hooks/workflow/useWorkflowSteps.js'
import type { StepHeaderStyles } from '../StepHeader/index.js'
import { StepHeader } from '../StepHeader/index.js'
import { TableTransform } from '../TableTransform/index.js'
import { useDeleteConfirm, useTableHandlers } from './StepStack.hooks.js'
import {
	ButtonContainer,
	buttonStyles,
	Container,
	icons,
	StepsContainer,
	tableTransformStyle,
} from './StepStack.styles.js'
import type { StepStackProps } from './StepStack.types.js'
import { getCollapsiblePanelStyles } from './StepStack.utils.js'

export const StepStack: React.FC<StepStackProps> = memo(function StepStack({
	workflow,
	showSelectButtons = true,
	order = DisplayOrder.FirstOnTop,
	onDelete,
	onSelect,
	onSave,
	selectedKey,
	styles,
}) {
	const theme = useTheme()
	const steps = useWorkflowSteps(workflow, order)

	const collapsiblePanelStyles = getCollapsiblePanelStyles(theme)
	const {
		onClick: onDeleteClicked,
		onConfirm: onConfirmDelete,
		toggle: toggleDeleteModal,
		isOpen: isDeleteModalOpen,
	} = useDeleteConfirm(onDelete)

	const { onSelectOriginalTable, onSelectLatest } = useTableHandlers(
		workflow,
		onSelect,
	)

	return (
		<Container style={styles?.root}>
			<DialogConfirm
				toggle={toggleDeleteModal}
				title="Are you sure you want to delete this step?"
				subText={
					'You will also lose any table transformations made after this step.'
				}
				show={isDeleteModalOpen}
				onConfirm={onConfirmDelete}
			/>
			{showSelectButtons && (
				<ButtonContainer style={styles?.buttonContainer}>
					{onSelectOriginalTable && (
						<DefaultButton
							disabled={!steps.length}
							iconProps={icons.preview}
							style={buttonStyles}
							onClick={onSelectOriginalTable}
						>
							Original
						</DefaultButton>
					)}

					<DefaultButton
						disabled={!steps.length}
						iconProps={icons.preview}
						style={buttonStyles}
						onClick={onSelectLatest}
					>
						Latest
					</DefaultButton>
				</ButtonContainer>
			)}
			<StepsContainer style={styles?.stepsContainer}>
				{steps.map(step => {
					const stepIndex = workflow.steps.findIndex(s => s.id === step.id)
					const handleSave =
						isNoArgsStep(step) || !onSave
							? undefined
							: (s: Step) => onSave(s, stepIndex)
					return (
						<CollapsiblePanel
							key={step.id}
							styles={collapsiblePanelStyles}
							onHeaderClick={() => onSelect?.(step.id)}
							onRenderHeader={() =>
								onRenderHeader(
									step,
									stepIndex,
									selectedKey === step.id,
									styles?.stepHeaders,
								)
							}
						>
							<TableTransform
								hideInput
								hideOutput
								step={step}
								index={stepIndex}
								workflow={workflow}
								style={tableTransformStyle}
								onDelete={onDeleteClicked}
								onTransformRequested={handleSave}
								hideStepSelector
							/>
						</CollapsiblePanel>
					)
				})}
			</StepsContainer>
		</Container>
	)
})

function onRenderHeader(
	step: Step,
	index: number,
	selected = false,
	styles?: StepHeaderStyles,
): JSX.Element {
	return (
		<StepHeader step={step} index={index} selected={selected} styles={styles} />
	)
}
