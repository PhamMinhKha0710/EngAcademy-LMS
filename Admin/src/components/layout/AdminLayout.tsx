import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'

export default function AdminLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    return (
        <div className="flex h-screen overflow-hidden bg-background font-sans">
            {/* Sidebar */}
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <Outlet />
                </main>
                <Footer />
            </div>
        </div>
    )
}
