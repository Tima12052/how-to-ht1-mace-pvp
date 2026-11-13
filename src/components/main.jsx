import { Route, Routes } from 'react-router-dom'
import Home from '../pages/home'
import Tiers from '../pages/tiers'

export default function Main() {
  return (
    <main className="app-main">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tiers" element={<Tiers />} />
      </Routes>
    </main>
  )
}
