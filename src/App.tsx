import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ScreenSizeProvider, useScreenSize } from '@ui'
import { AppShell } from './components/app-shell'
import { StatusProvider } from './lib/status-context'
import { HomePage } from './pages/home'
import { SetupPage } from './pages/setup/setup-page'

const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/setup', element: <SetupPage /> },
    ],
  },
])

export function App() {
  const size = useScreenSize()

  return (
    <ScreenSizeProvider size={size}>
      <StatusProvider>
        <RouterProvider router={router} />
      </StatusProvider>
    </ScreenSizeProvider>
  )
}
