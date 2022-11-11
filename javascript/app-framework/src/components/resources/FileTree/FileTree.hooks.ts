/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import type { DataFormat, DataShape, ParserOptions } from '@datashaper/schema'
import { createDataTableSchemaObject } from '@datashaper/schema'
import type { TableContainer } from '@datashaper/tables'
import type { BaseFile } from '@datashaper/utilities'
import { createBaseFile } from '@datashaper/utilities'
import { DataTable } from '@datashaper/workflow'
import type { ICommandBarItemProps, IContextualMenuItem } from '@fluentui/react'
import { useTheme } from '@fluentui/react'
import { useCallback, useContext, useMemo } from 'react'

import {
	DataPackageContext,
	PersistenceContext,
} from '../../../context/index.js'
import { useDataPackage } from '../../../hooks/useDataPackage.js'
import { useDataTables } from '../../../hooks/useDataTables.js'
import { removeExtension } from '../../../util/index.js'
import type { OpenTableHandler } from '../../tables/ImportTable/ImportTable.types.js'
import { TABLE_TYPES, ZIP_TYPES } from './FileTree.constants.js'
import type { AddTableHandler,ExampleIndex, FileDefinition  } from './FileTree.types.js'
import { createCommandBar, openProps, saveProps } from './groupTables.js'

export function useOnOpenTable(
	file: BaseFile,
	setFile: (file: BaseFile | undefined) => void,
): OpenTableHandler {
	const onAddTable = useAddTable()
	return useCallback(
		(
			table: TableContainer,
			format: DataFormat,
			parser: ParserOptions,
			shape: DataShape,
		) => {
			onAddTable(parser, file, table, format, shape)
			setFile(undefined)
		},
		[onAddTable, file, setFile],
	)
}

function useAddTable(): AddTableHandler {
	const store = useContext(DataPackageContext)
	return useCallback(
		(
			parser: ParserOptions,
			file: BaseFile,
			{ id }: TableContainer,
			format: DataFormat,
			shape: DataShape,
		) => {
			const name = removeExtension(id)
			const table = new DataTable(
				createDataTableSchemaObject({
					shape,
					parser,
					format,
				}),
			)
			table.name = name
			table.data = file
			store.tableStore.add(table)
		},
		[store],
	)
}

export function useFileManagementCommands(
	examples: ExampleIndex,
	expanded: boolean,
	onOpenFileRequested: (acceptedFiles: string[]) => Promise<BaseFile>,
	setFile: (file: BaseFile) => void,
): {
	commands: ICommandBarItemProps[]
	onOpenCommands: IContextualMenuItem[]
	onSaveCommands: IContextualMenuItem[]
} {
	const tables = useDataTables()
	const hasDataPackages = tables.length > 0
	const uploadZip = useUploadZip()
	const onClickDownloadZip = useDownloadZip()
	const dataPackage = useDataPackage()

	const onClickUploadTable = useCallback(
		() =>
			void onOpenFileRequested(TABLE_TYPES)
				.then(setFile)
				.catch(err => console.error('error loading table file', err)),
		[setFile, onOpenFileRequested],
	)

	const onClickUploadZip = useCallback(
		() =>
			void onOpenFileRequested(ZIP_TYPES)
				.then(file => uploadZip(file))
				.catch(err => console.error('error loading project file', err)),
		[uploadZip, onOpenFileRequested],
	)

	const onClickExample = useCallback(
		(ex: FileDefinition) => {
			void fetch(ex.url)
				.then(res => res.blob())
				.then(data => {
					const files = new Map<string, Blob>()
					files.set('datapackage.json', data)
					return dataPackage.load(files)
				})
				.catch(err => console.error('error loading example file', err))
		},
		[dataPackage],
	)

	const onOpenCommands = useMemo(() => {
		return openProps(
			examples,
			onClickExample,
			onClickUploadTable,
			onClickUploadZip,
		)
	}, [examples, onClickExample, onClickUploadTable, onClickUploadZip])

	const onSaveCommands = useMemo(() => {
		return saveProps(onClickDownloadZip)
	}, [onClickDownloadZip])

	const theme = useTheme()
	const commands = useMemo<ICommandBarItemProps[]>(
		() =>
			createCommandBar(
				expanded,
				hasDataPackages,
				onOpenCommands,
				onSaveCommands,
				theme,
			),
		[theme, hasDataPackages, expanded, onOpenCommands, onSaveCommands],
	)

	return { commands, onOpenCommands, onSaveCommands }
}

function useUploadZip(): (file: BaseFile) => void {
	const persistence = useContext(PersistenceContext)
	return useCallback(
		(file: BaseFile) =>
			void persistence
				.load(file)
				.catch(err => console.error('error loading project', err)),
		[persistence],
	)
}

function useDownloadZip(): () => void {
	const persistence = useContext(PersistenceContext)
	return useCallback(
		() =>
			void persistence
				.save()
				.catch(err => console.error('error loading project', err)),
		[persistence],
	)
}

export function useOnOpenFileRequested(): (
	acceptedFileTypes: string[],
) => Promise<BaseFile> {
	return useCallback((acceptedFileTypes: string[]) => {
		return new Promise<BaseFile>((resolve, reject) => {
			try {
				let input: HTMLInputElement | null = document.createElement('input')
				input.type = 'file'
				input.multiple = false
				input.accept = acceptedFileTypes.toString()
				// eslint-disable-next-line
				input.onchange = (e: any) => {
					// eslint-disable-next-line
					if (e?.target?.files?.length) {
						// eslint-disable-next-line
						for (let file of e.target.files as FileList) {
							try {
								const { name }: { name: string } = file
								const baseFile = createBaseFile(file, { name })
								//depending of the type // we don't have FileType yet
								resolve(baseFile)
							} catch (e) {
								console.error(e)
								reject(e)
							}
						}
					}
				}
				input.click()
				input = null
			} catch (e) {
				console.error(e)
				reject(e)
			}
		})
	}, [])
}
