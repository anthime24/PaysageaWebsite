import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import UploadPage from './pages/UploadPage'
import ProcessingPage from './pages/ProcessingPage'
import ResultPage from './pages/ResultPage'

function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/upload" replace />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/processing" element={<ProcessingPage />} />
                <Route path="/result/:projectId" element={<ResultPage />} />
            </Route>
        </Routes>
    )
}

export default App
