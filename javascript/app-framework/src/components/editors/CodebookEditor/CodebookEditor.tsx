/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { memo } from 'react'

import { JsonEditor } from '../JsonEditor/JsonEditor.js'
import { useContent, useOnChange } from './CodebookEditor.hooks.js'
import type { CodebookEditorProps } from './CodebookEditor.types.js'

export const CodebookEditor: React.FC<CodebookEditorProps> = memo(
	function CodebookEditor({ dataTable }) {
		const content = useContent(dataTable)
		const onChange = useOnChange(dataTable)
		return <JsonEditor content={content} onChange={onChange} />
	},
)
