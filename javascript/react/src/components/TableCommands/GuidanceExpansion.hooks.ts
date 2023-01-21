/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import { default as guidanceContent } from '@datashaper/guidance'
import { useMemo } from 'react'

/**
 * Loads the pre-build guidance markdown content and filters it to only verbs.
 * @returns
 */
export function useGuidanceContent(): Record<string, string> {
	return useMemo(() => {
		return Object.entries(guidanceContent).reduce(
			(acc, [key, value]: [string, string]) => {
				if (key.startsWith('verbs')) {
					acc[key.replace('verbs.', '')] = value
				}
				return acc
			},
			{} as Record<string, string>,
		)
	}, [])
}
