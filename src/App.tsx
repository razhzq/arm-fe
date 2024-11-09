import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

import ForexDashboard from './pages/Home'
import CurrencyDetails from './pages/CurrencyDetails'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ForexDashboard />} />
        <Route path="/currency" element={<CurrencyDetails />} />
      </Routes>
    </Router>
  )
}