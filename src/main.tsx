import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { DataModeProvider } from './app/DataModeProvider'
import { router } from './app/router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DataModeProvider>
      <RouterProvider router={router} />
    </DataModeProvider>
  </StrictMode>,
)
