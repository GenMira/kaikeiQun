import { Route, Routes } from 'react-router'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import Create from './pages/CreateNewProject'
import DownloadPage from './pages/DownloadPage'
import Layout from './components/Layout'
import ProjectProvider from './state/ProjectProvider'
import './components/App.css'

function App() {
  return (
    <ProjectProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<Create />} />
          <Route path="/download" element={<DownloadPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ProjectProvider>
  )
}

export default App
