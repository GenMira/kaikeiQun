import { Route, Routes } from 'react-router'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import Create from './pages/CreateNewProject'
import './components/App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/create" element={<Create />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
