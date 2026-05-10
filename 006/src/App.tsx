import React from 'react'
import { LibraryProvider } from './contexts/LibraryContext'
import { ToastProvider } from './components/common'
import { Layout } from './components/Layout'
import './index.css'

const App: React.FC = () => {
  return (
    <ToastProvider>
      <LibraryProvider>
        <Layout />
      </LibraryProvider>
    </ToastProvider>
  )
}

export default App
