import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Share2, Download, Check, Sparkles, Palette } from 'lucide-react'
import useStore from '../store/useStore'

const ResultPage = () => {
    const navigate = useNavigate()
    const { previewUrl, filters, projectContext, plantFilter } = useStore()
    const [showOriginal, setShowOriginal] = useState(false)
    const [isEditMode, setIsEditMode] = useState(false)

    // In a real app, this would come from the backend.
    // For the POC, we use a placeholder that looks like a transformed garden.
    const transformedUrl = "https://images.unsplash.com/photo-1558905648-2784464e7237?auto=format&fit=crop&q=80&w=2000"

    const handleDownload = () => {
        const data = {
            project_id: 'demo-' + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            user_choices: filters,
            botanical_filter: plantFilter,
            context: {
                location: projectContext?.location,
                climate_current: projectContext?.climate_profile?.current,
                climate_annual: projectContext?.annual_profile?.summary
            }
        }
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `paysagea-project-${new Date().getTime()}.json`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-1000">
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
                        <span>{isEditMode ? 'Quitter Modification' : 'Modifier'}</span>
                    </button>
                    <button className="flex-1 md:flex-none p-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-gray-400 hover:text-[var(--color-structure)]">
                        <Share2 size={20} className="mx-auto" />
                    </button>
                    <button
                        onClick={handleDownload}
                        className="flex-1 md:flex-none p-3.5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all text-gray-400 hover:text-[var(--color-structure)]"
                        title="Télécharger le manifeste"
                    >
                        <Download size={20} className="mx-auto" />
                    </button>
                    <button className="flex-[2] md:flex-none premium-button flex items-center justify-center gap-3 py-3.5 px-8">
                        <RefreshCw size={20} />
                        <span className="uppercase tracking-widest text-xs font-black">Régénérer</span>
                    </button>
                </div>
            </div>

            {/* Main Visual Focus - Centered Image View */}
            <div className="max-w-6xl mx-auto w-full space-y-6">
                <div className="relative h-[calc(100vh-320px)] min-h-[450px] max-h-[750px] rounded-[3rem] overflow-hidden bg-white shadow-2xl border border-gray-100 group">
                    {/* View Wrapper */}
                    <div className="absolute inset-0 transition-all duration-700 ease-in-out">
                        <img 
                            src={showOriginal ? previewUrl : transformedUrl} 
                            className={`w-full h-full object-cover transition-opacity duration-500 ${showOriginal ? 'grayscale-[0.2]' : ''}`} 
                            alt="Garden view" 
                        />
                        
                        {/* Status Badges */}
                        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-4 animate-in slide-in-from-top-4 duration-700">
                            <div className={`px-6 py-3 rounded-2xl font-black text-[10px] tracking-[0.2em] shadow-xl transition-all duration-300 ${!showOriginal ? 'bg-[var(--color-nature)] text-white scale-110' : 'bg-white/50 backdrop-blur text-gray-400 opacity-50'}`}>
                                PROPOSITION IA
                            </div>
                            <div className={`px-6 py-3 rounded-2xl font-black text-[10px] tracking-[0.2em] shadow-xl transition-all duration-300 ${showOriginal ? 'bg-[var(--color-structure)] text-white scale-110' : 'bg-white/50 backdrop-blur text-gray-400 opacity-50'}`}>
                                ÉTAT INITIAL
                            </div>
                        </div>

                        {/* Toggle Control - Floating Switch */}
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30">
                            <button 
                                onClick={() => setShowOriginal(!showOriginal)}
                                className="bg-white/90 backdrop-blur-xl border border-gray-100 px-8 py-4 rounded-full shadow-2xl flex items-center gap-8 group/toggle hover:scale-105 transition-all active:scale-95"
                            >
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${showOriginal ? 'text-[var(--color-structure)]' : 'text-gray-300'}`}>Avant</span>
                                <div className="w-14 h-7 bg-gray-100 rounded-full relative p-0.5 border border-gray-200">
                                    <div className={`absolute top-0.5 w-6 h-6 rounded-full shadow-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${showOriginal ? 'left-0.5 bg-[var(--color-structure)]' : 'left-[calc(100%-1.625rem)] bg-[var(--color-nature)]'}`} />
                                </div>
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${!showOriginal ? 'text-[var(--color-nature)]' : 'text-gray-300'}`}>Après</span>
                            </button>
                        </div>
                    </div>

                    {/* Edit Mode Overlay (Immersive Studio) */}
                    {isEditMode && (
                        <div className="fixed inset-0 bg-[var(--color-base)] z-[100] animate-in fade-in zoom-in duration-500 flex flex-col">
                            {/* Studio Header */}
                            <header className="h-20 bg-white border-b border-gray-100 px-8 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--color-nature)]/10 flex items-center justify-center text-[var(--color-nature)]">
                                        <Palette size={20} />
                                    </div>
                                    <div>
                                        <h1 className="text-lg font-black text-[var(--color-structure)] uppercase tracking-widest">Studio de Création</h1>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Édition haute précision • {filters.style}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setIsEditMode(false)}
                                        className="px-6 py-3 rounded-xl hover:bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-widest transition-colors"
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        onClick={() => setIsEditMode(false)}
                                        className="premium-button px-8 py-3 text-xs font-black uppercase tracking-widest shadow-lg"
                                    >
                                        Enregistrer
                                    </button>
                                </div>
                            </header>

                            <div className="flex-1 flex overflow-hidden">
                                {/* Left Sidebar - Plant Library */}
                                <aside className="w-80 bg-white border-r border-gray-100 flex flex-col animate-in slide-in-from-left duration-700">
                                    <div className="p-6 border-b border-gray-50">
                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Bibliothèque Végétale</h3>
                                        <div className="relative">
                                            <input 
                                                type="text" 
                                                placeholder="Rechercher une espèce..." 
                                                className="w-full bg-stone-50 border-none rounded-xl px-4 py-3 text-xs font-medium placeholder:text-gray-300 focus:ring-1 focus:ring-[var(--color-nature)]/30"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex-1 overflow-auto p-4 grid grid-cols-2 gap-3">
                                        {[1, 2, 3, 4, 5, 6].map((i) => (
                                            <div key={i} className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-100 hover:border-[var(--color-nature)] transition-colors cursor-pointer">
                                                <img src={`https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&q=80&w=200&h=200&sig=${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Plant" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                                    <p className="text-[8px] text-white font-bold uppercase tracking-tighter">Espèce #{i}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </aside>

                                {/* Center Editing Canvas */}
                                <main className="flex-1 bg-stone-100 p-12 overflow-hidden flex items-center justify-center relative">
                                    <div className="relative w-full max-w-5xl aspect-video rounded-3xl overflow-hidden shadow-2xl border-8 border-white group/canvas">
                                        <img src={transformedUrl} className="w-full h-full object-cover" alt="Editor Canvas" />
                                        
                                        {/* Interaction Overlays (Future features) */}
                                        <div className="absolute inset-0 pointer-events-none border-2 border-[var(--color-nature)]/0 group-hover/canvas:border-[var(--color-nature)]/20 transition-colors" />
                                        
                                        {/* Floating Tooltips */}
                                        <div className="absolute top-1/3 left-1/4 p-2 bg-white/90 backdrop-blur rounded-lg shadow-xl border border-white flex items-center gap-2 animate-bounce cursor-pointer pointer-events-auto">
                                            <div className="w-2 h-2 rounded-full bg-[var(--color-nature)] animate-pulse" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[var(--color-structure)]">Modifier la densité</span>
                                        </div>
                                    </div>

                                    {/* Bottom View Modes */}
                                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 p-1.5 bg-white/80 backdrop-blur-xl rounded-2xl border border-white shadow-xl">
                                        <button className="px-4 py-2 rounded-xl bg-[var(--color-structure)] text-white text-[9px] font-black uppercase tracking-widest">2D Design</button>
                                        <button className="px-4 py-2 rounded-xl hover:bg-gray-50 text-[var(--color-structure)] text-[9px] font-black uppercase tracking-widest opacity-40">3D Preview</button>
                                    </div>
                                </main>

                                {/* Right Sidebar - Analysis & Tweaks */}
                                <aside className="w-80 bg-white border-l border-gray-100 flex flex-col animate-in slide-in-from-right duration-700">
                                    <div className="p-8 space-y-8">
                                        <div className="space-y-4">
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Outils IA</h3>
                                            <div className="space-y-2">
                                                <button className="w-full p-4 bg-stone-50 rounded-[1.5rem] flex items-center gap-4 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 group">
                                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[var(--color-nature)] group-hover:bg-[var(--color-nature)] group-hover:text-white transition-colors">
                                                        <RefreshCw size={18} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-xs font-black text-[var(--color-structure)] uppercase tracking-widest">Inpainting</p>
                                                        <p className="text-[9px] text-gray-400 font-bold uppercase">Recréer la zone</p>
                                                    </div>
                                                </button>
                                                <button className="w-full p-4 bg-stone-50 rounded-[1.5rem] flex items-center gap-4 hover:bg-white hover:shadow-md transition-all border border-transparent hover:border-gray-100 group opacity-40 cursor-not-allowed">
                                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-[var(--color-action)]">
                                                        <Check size={18} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-xs font-black text-[var(--color-structure)] uppercase tracking-widest">Smart Eraser</p>
                                                        <p className="text-[9px] text-gray-400 font-bold uppercase">Gomme magique</p>
                                                    </div>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="pt-8 border-t border-gray-50 space-y-6">
                                            <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Paramètres de Scène</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Luminosité</span>
                                                        <span className="text-[9px] font-black text-[var(--color-nature)] uppercase">80%</span>
                                                    </div>
                                                    <div className="h-1 bg-stone-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-[var(--color-nature)] w-[80%] rounded-full" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex justify-between mb-2">
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Saturations Saisons</span>
                                                        <span className="text-[9px] font-black text-[var(--color-nature)] uppercase">Printemps</span>
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-1">
                                                        {[1, 2, 3, 4].map(s => <div key={s} className={`h-1 rounded-full ${s === 1 ? 'bg-[var(--color-nature)]' : 'bg-gray-100'}`} />)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-8 bg-stone-50 rounded-[2.5rem] border border-stone-100 flex items-center justify-center text-center">
                    <div className="flex items-center gap-6 max-w-3xl">
                        <div className="relative flex-shrink-0">
                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[var(--color-action)]">
                                <Sparkles size={28} />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[var(--color-nature)] rounded-full animate-ping opacity-30" />
                        </div>
                        <p className="text-[var(--color-structure)] font-bold italic text-xl leading-snug">
                            "Un contraste saisissant qui respecte l'âme de votre propriété tout en y insufflant une modernité botanique durable."
                        </p>
                    </div>
                </div>
            </div>

            {/* Information Grid at Bottom */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Botanical Analysis Card */}
                <div className="p-10 bg-white rounded-[3rem] shadow-xl border border-gray-100 flex flex-col space-y-8">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                        <h3 className="text-xl font-black text-[var(--color-structure)] tracking-tight italic">Analyse Bio</h3>
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                            <Check size={18} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Bio-Indicateurs</p>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-center gap-4 group hover:bg-white hover:shadow-md transition-all duration-300">
                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg">☀️</div>
                                <div>
                                    <p className="text-[10px] font-black text-[var(--color-nature)] uppercase tracking-widest">Exposition</p>
                                    <p className="text-sm font-bold text-[var(--color-structure)]">{projectContext?.annual_profile?.summary?.sunshine_h_per_day || '6.4'} h/jour moy.</p>
                                </div>
                            </div>
                            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-center gap-4 group hover:bg-white hover:shadow-md transition-all duration-300">
                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg">💧</div>
                                <div>
                                    <p className="text-[10px] font-black text-[var(--color-nature)] uppercase tracking-widest">Précipitations</p>
                                    <p className="text-sm font-bold text-[var(--color-structure)]">{projectContext?.annual_profile?.summary?.precip_annual_mm || '780'} mm/an</p>
                                </div>
                            </div>
                            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-center gap-4 group hover:bg-white hover:shadow-md transition-all duration-300">
                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg">❄️</div>
                                <div>
                                    <p className="text-[10px] font-black text-[var(--color-nature)] uppercase tracking-widest">Résilience</p>
                                    <p className="text-sm font-bold text-[var(--color-structure)]">{projectContext?.annual_profile?.summary?.frost_days_per_year || '12'} jours gel/an</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Concepts & Budget Card */}
                <div className="p-10 bg-white rounded-[3rem] shadow-xl border border-gray-100 flex flex-col justify-between">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Note de Design</p>
                            <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                Ce concept architectural a été généré sur-mesure en analysant vos directives textuelles et les spécificités bioclimatiques de votre terrain.
                            </p>
                        </div>

                        <div className="pt-8 border-t border-gray-50 text-center space-y-4">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Estimation Projective</p>
                                <p className="text-4xl font-black text-[var(--color-structure)]">14 500 €</p>
                                <p className="text-[9px] text-gray-300 uppercase font-bold tracking-widest italic mt-1">Hors main d'œuvre</p>
                            </div>
                            <button className="w-full premium-button py-5 text-sm font-black uppercase tracking-[0.2em] shadow-xl">
                                Dossier PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* Expertise Call-to-Action Card */}
                <div className="relative p-10 bg-[var(--color-structure)] rounded-[3rem] text-white overflow-hidden group flex flex-col justify-center">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 transition-transform duration-700 group-hover:scale-150" />
                    <div className="relative z-10">
                        <h4 className="text-2xl font-black italic mb-4 tracking-tight">Expertise Pro</h4>
                        <p className="text-sm text-gray-400 mb-8 leading-relaxed font-medium">Transformez ce concept en réalité. Échangez avec un architecte paysagiste certifié Paysagea.</p>
                        <button className="flex items-center gap-3 text-[var(--color-action)] font-black uppercase tracking-widest text-xs hover:text-white transition-colors group/btn">
                            Consulter un expert
                            <ArrowLeft size={16} className="rotate-180 transition-transform group-hover/btn:translate-x-2" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Debug Filter Section (POC specific) */}
            {plantFilter && (
                <div className="p-10 bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-2 h-full bg-[var(--color-nature)]" />
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-nature)]/10 flex items-center justify-center text-[var(--color-nature)]">
                            <Sparkles size={16} />
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Debug : Filtre Botanique (Input LLM)</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        {Object.entries(plantFilter).map(([key, value]) => (
                            <div key={key} className="p-4 bg-stone-50 rounded-2xl border border-stone-100 transition-all hover:bg-white hover:shadow-md">
                                <p className="text-[9px] text-gray-400 uppercase font-black mb-1">{key.replace(/_/g, ' ')}</p>
                                <p className="text-xs font-mono text-[var(--color-nature)] font-bold truncate">{value ?? 'null'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export default ResultPage
