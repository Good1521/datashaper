import type { Resource } from '@datashaper/workflow'

export interface RenameModalProps {
	resource?: Resource
	isOpen: boolean
	onDismiss: () => void
}
