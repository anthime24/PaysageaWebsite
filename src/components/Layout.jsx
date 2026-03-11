import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Plus, Save, Paintbrush, Sparkles, Leaf } from 'lucide-react'
import SidebarButton from './SidebarButton'

const Layout = () => {
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <div className="flex h-screen bg-[var(--color-bg-light)] text-[var(--color-structure)] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-80 bg-white border-r border-gray-100 flex flex-col p-6 z-20">
                <div className="flex items-center gap-3 mb-12 px-2">
                    <div className="w-10 h-10 bg-[var(--color-nature)] flex items-center justify-center rounded-xl shadow-lg shadow-[#7b9872]/20">
                        <Leaf className="text-white" size={24} />
                    </div>
                    <div>
                        <span className="text-xl font-bold tracking-tight block leading-none">Paysagea</span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">Design Studio</span>
                    </div>
                </div>

                <div className="flex-1 space-y-3">
                    <SidebarButton
                        icon={Plus}
                        label="Ajouter objets"
                        onClick={() => console.log('Future Catalog')}
                    />
                    <SidebarButton
                        icon={Save}
                        label="Enregistrer"
                        onClick={() => console.log('Save')}
                    />
                    <SidebarButton
                        icon={Paintbrush}
                        label="Outils dessin"
                        inactive={true}
                    />
                </div>

                <div className="mt-auto pt-6 border-t border-gray-100">
                    <SidebarButton
                        icon={Sparkles}
                        label="Générer"
                        highlight={true}
                        onClick={() => navigate('/processing')}
                    />
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 relative flex flex-col overflow-hidden animate-mesh">
                <div className="flex-1 overflow-auto p-12 relative z-10">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}

export default Layout
