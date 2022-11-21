/*!
 * Copyright (c) Microsoft. All rights reserved.
 * Licensed under the MIT license. See LICENSE file in the project.
 */
import 'allotment/dist/style.css'

import { DataShaperApp } from '@datashaper/app-framework'
import { Spinner } from '@fluentui/react'
import { memo, Suspense } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { RecoilRoot } from 'recoil'

import { Layout } from '../components/Layout.js'
import { About } from './About.js'
import { ErrorBoundary } from './ErrorBoundary.js'
import { StyleContext } from './StyleContext.js'

export const App: React.FC = memo(function App() {
	return (
		<ErrorBoundary>
			<RecoilRoot>
				<BrowserRouter>
					<Suspense fallback={<Spinner />}>
						<StyleContext>
							<Layout>
								<DataShaperApp examples={examples}>
									<About />
								</DataShaperApp>
							</Layout>
						</StyleContext>
					</Suspense>
				</BrowserRouter>
			</RecoilRoot>
		</ErrorBoundary>
	)
})

const examples = [
	{ name: 'Smoking', url: 'examples/smoking.json' },
	{ name: 'Companies', url: 'examples/companies.json' },
]
