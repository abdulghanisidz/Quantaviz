import { Outlet } from 'react-router-dom'
import Header from './Header'

export default function Shell() {
  return (
    <div className="qv-shell min-h-screen">
      <Header />
      <Outlet />
    </div>
  )
}
