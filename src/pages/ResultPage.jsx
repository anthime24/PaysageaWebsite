import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Share2, Download, Check, Sparkles } from 'lucide-react'
import useStore from '../store/useStore'

const ResultPage = () => {
    const navigate = useNavigate()
    const { previewUrl, filters, projectContext, plantFilter, analysisResult, preprocessData } = useStore()
    const [viewMode, setViewMode] = useState('ia') // 'ia', 'original', 'depth'
    const [isEditMode, setIsEditMode] = useState(false)

    // In a real app, this would come from the backend.
    const transformedUrl = "https://images.unsplash.com/photo-1558905648-2784464e7237?auto=format&fit=crop&q=80&w=2000"

    const handleDownload = () => {
        const data = useStore.getState().getProjectManifest()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `paysagea-project-${new Date().getTime()}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    const getActiveImage = () => {
        if (viewMode === 'original') return preprocessData?.web_url || previewUrl
        if (viewMode === 'depth') return analysisResult?.depth_preview_url || previewUrl
        return analysisResult?.fused_url || transformedUrl
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-1000 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/upload')}
                        className="group flex items-center gap-2 text-gray-400 hover:text-[var(--color-nature)] transition-colors text-sm font-bold uppercase tracking-widest"
                    >
                        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                        <span>Retour au studio</span>
                    </button>
                    <div>
                        <h2 className="text-4xl font-black tracking-tight text-[var(--color-structure)]">
                            Votre Projet <span className="text-[var(--color-nature)] italic">Paysager</span>
                        </h2>
                        <div className="flex items-center gap-3 mt-1">
                            <div className="w-8 h-8 rounded-lg bg-[var(--color-nature)]/10 flex items-center justify-center text-[var(--color-nature)]">
                                <Sparkles size={16} />
                            </div>
                            <p className="text-gray-400 text-sm font-medium">
                                Design optimisé pour <span className="text-[var(--color-structure)] font-bold">{projectContext?.location?.short_label || 'votre région'}</span>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`flex-1 md:flex-none px-6 py-3.5 rounded-2xl shadow-sm transition-all flex items-center gap-2 font-black uppercase tracking-widest text-xs ${isEditMode ? 'bg-[var(--color-nature)] text-white shadow-lg' : 'bg-white border border-gray-100 text-gray-400 hover:text-[var(--color-nature)]'}`}
                    >
                        <Sparkles size={18} />
                        <span>{isEditMode ? 'Quitter Studio' : 'Modifier'}</span>
                    </button>
                    <button className="flex-1 md:flex-none p-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-gray-400 hover:text-[var(--color-structure)]">
                        <Share2 size={20} className="mx-auto" />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex-1 md:flex-none p-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-gray-400 hover:text-[var(--color-structure)]"
                        title="Exporter le Projet"
                    >
                        <Download size={20} className="mx-auto" />
                    </button>
                    <button className="flex-[2] md:flex-none premium-button flex items-center justify-center gap-3 py-3.5 px-8">
                        <RefreshCw size={20} />
                        <span className="uppercase tracking-widest text-xs font-black">Régénérer</span>
                    </button>
                </div>
            </div>

            {/* Main Visual Focus */}
            <div className="max-w-6xl mx-auto w-full space-y-6">
                <div className="relative h-[calc(100vh-320px)] min-h-[450px] max-h-[750px] rounded-[3rem] overflow-hidden bg-white shadow-2xl border border-gray-100 group">
                    <div className="absolute inset-0 transition-all duration-700 ease-in-out">
                        <img 
                            src={getActiveImage()} 
                            className={`w-full h-full object-cover transition-opacity duration-500 ${viewMode === 'original' ? 'grayscale-[0.2]' : ''}`} 
                            key={viewMode}
                            alt="Garden view" 
                        />
                        
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-4 animate-in slide-in-from-top-4 duration-700">
                            {[
                                { id: 'ia', label: 'IA DESIGN' },
                                { id: 'original', label: 'PHOTO RÉELLE' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setViewMode(tab.id)}
                                    className={`px-6 py-3 rounded-2xl font-black text-[10px] tracking-[0.2em] shadow-xl transition-all duration-300 ${viewMode === tab.id ? 'bg-[var(--color-nature)] text-white scale-110' : 'bg-white/50 backdrop-blur text-gray-400 opacity-50 hover:bg-white/80'}`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Info Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Botanical Analysis */}
                    <div className="p-10 bg-white rounded-[3rem] shadow-xl border border-gray-100 space-y-8">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                            <h3 className="text-xl font-black text-[var(--color-structure)] tracking-tight italic">Analyse Bio</h3>
                            <Check className="text-green-500" size={20} />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl">
                                <span className="text-xl">☀️</span>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ensoleillement</p>
                                    <p className="text-sm font-bold text-[var(--color-structure)]">{projectContext?.annual_profile?.summary?.sunshine_h_per_day || '6.4'}h/jour</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl">
                                <span className="text-xl">💧</span>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Précipitations</p>
                                    <p className="text-sm font-bold text-[var(--color-structure)]">{projectContext?.annual_profile?.summary?.precip_annual_mm || '780'}mm/an</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl">
                                <span className="text-xl">❄️</span>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Zone Rusticité</p>
                                    <p className="text-sm font-bold text-[var(--color-structure)]">{projectContext?.annual_profile?.summary?.hardiness_zone || 'Zone 8'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Design Intent */}
                    <div className="p-10 bg-white rounded-[3rem] shadow-xl border border-gray-100 flex flex-col justify-between">
                        <div className="space-y-6">
                            <h3 className="text-xl font-black text-[var(--color-structure)] tracking-tight italic">Intentions</h3>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                "{filters.description || 'Design harmonisé basé sur vos préférences méditerranéennes et bioclimatiques.'}"
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {filters.appliedSuggestions.map((tag, i) => (
                                    <span key={i} className="px-3 py-1 bg-stone-50 rounded-full text-[10px] font-bold text-gray-400 uppercase">{tag}</span>
                                ))}
                            </div>
                        </div>
                        <div className="pt-8 border-t border-gray-50">
                            <button className="w-full premium-button py-4 text-xs font-black uppercase tracking-widest shadow-lg">
                                Dossier Complet PDF
                            </button>
                        </div>
                    </div>

                    {/* Expertise CTA */}
                    <div className="relative p-10 bg-[var(--color-structure)] rounded-[3rem] text-white overflow-hidden group flex flex-col justify-center">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-150" />
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black italic mb-4 tracking-tight text-white">Expertise Pro</h4>
                            <p className="text-sm text-gray-400 mb-8 leading-relaxed font-medium">Transformez ce concept en réalité. Échangez avec un de nos architectes paysagistes.</p>
                            <button className="flex items-center gap-3 text-[var(--color-nature)] font-black uppercase tracking-widest text-xs hover:text-white transition-colors group/btn">
                                Consulter un expert
                                <ArrowLeft size={16} className="rotate-180 transition-transform group-hover/btn:translate-x-2" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* IA BRIDGE DEBUG SECTION */}
                <div className="mt-12 p-8 glass-panel rounded-[2.5rem] border-white/5 relative overflow-hidden group bg-black/40">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                    
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Sparkles size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-white uppercase tracking-widest">Manifeste Projet IA</h4>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Données brutes transmises au RAG & Image Gen</p>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-green-500/10 text-green-500 border border-green-500/20 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse">
                            Bridge Actif
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/10 pb-2">Visual Base</p>
                            <div className="space-y-2">
                                <p className="text-xs text-gray-400">Style: <span className="text-white font-mono">{filters.style}</span></p>
                                <p className="text-xs text-gray-400">Éléments: <span className="text-white font-mono">{filters.elements.join(', ') || 'aucun'}</span></p>
                                <p className="text-xs text-gray-400">Maintenance: <span className="text-white font-mono">{filters.maintenance}</span></p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/10 pb-2">User Intent</p>
                            <div className="space-y-2">
                                <p className="text-xs text-gray-300 italic line-clamp-2">"{filters.description || 'Pas de description'}"</p>
                                <p className="text-[10px] text-gray-500">Tags: {filters.appliedSuggestions.join(', ') || '—'}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/10 pb-2">Environment</p>
                            <div className="space-y-2">
                                <p className="text-xs text-gray-400">USDA Zone: <span className="text-white font-mono">{plantFilter?.usda_zone || '—'}</span></p>
                                <p className="text-xs text-gray-400">Pluie: <span className="text-white font-mono">{plantFilter?.annual_rain_mm}mm</span></p>
                                <p className="text-xs text-gray-400">Lat/Lon: <span className="text-white font-mono">{projectContext?.location?.lat.toFixed(2)}, {projectContext?.location?.lon.toFixed(2)}</span></p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button 
                            onClick={() => console.log('[MANIFEST DEBUG]', useStore.getState().getProjectManifest())}
                            className="text-[10px] font-black text-gray-400 hover:text-primary uppercase tracking-widest transition-colors"
                        >
                            Inspecter l'objet complet (Console JS) ↗
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ResultPage
