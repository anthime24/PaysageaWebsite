import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrainCircuit, Maximize2, Layers, Target, CheckCircle2, Sparkles } from 'lucide-react'
import useStore from '../store/useStore'

const STEPS = [
    { id: 'depth', label: 'Analyse de profondeur', icon: Maximize2, duration: 2500 },
    { id: 'segmentation', label: 'Segmentation des zones', icon: Layers, duration: 3000 },
    { id: 'climate', label: 'Analyse climatique locale', icon: BrainCircuit, duration: 2500 },
    { id: 'detection', label: 'Optimisation botanique', icon: Target, duration: 2000 },
]

const ProcessingPage = () => {
    const navigate = useNavigate()
    const { previewUrl, preprocessData, projectContext, setAnalysisResult, setProjectId } = useStore()
    const [currentStep, setCurrentStep] = useState(0)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        if (!previewUrl) {
            navigate('/upload')
            return
        }

        const runAnalysis = async () => {
            try {
                const API_URL = import.meta.env.VITE_CLIMATE_API_URL || 'http://localhost:3001';
                
                // IA BRIDGE: 1. Envoyer le manifeste complet (RAG/Climat)
                const manifest = useStore.getState().getProjectManifest();
                fetch(`${API_URL}/api/project/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(manifest)
                }).catch(err => console.error('[IA BRIDGE] Erreur manifeste:', err));

                // IA PIPELINE: 2. Lancer SAM + Depth Anyway
                if (preprocessData?.preprocessed_json) {
                    console.log("[IA PIPELINE] Lancement de l'analyse réelle...");
                    
                    // Simuler une progression visuelle pendant le calcul réel
                    const progressInterval = setInterval(() => {
                        setProgress(prev => (prev < 90 ? prev + 2 : prev));
                    }, 500);

                    const response = await fetch(`${API_URL}/api/project/analyze`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ preprocess_json: preprocessData.preprocessed_json })
                    });

                    clearInterval(progressInterval);
                    setProgress(100);

                    if (!response.ok) throw new Error("Erreur lors de l'analyse IA");
                    
                    const aiResult = await response.json();
                    console.log("[IA PIPELINE] Succès:", aiResult);

                    setAnalysisResult({
                        ...aiResult,
                        summary: `Analyse terminée : ${aiResult.sam?.num_segments || 'N/A'} zones segmentées.`
                    });
                } else {
                    // Fallback si pas de preprocess (mode démo ou erreur)
                    for (let i = 0; i < STEPS.length; i++) {
                        setCurrentStep(i)
                        for (let p = 0; p <= 100; p += 10) {
                            setProgress(p)
                            await new Promise(r => setTimeout(r, STEPS[i].duration / 10))
                        }
                    }
                }

                setProjectId(preprocessData?.image_id || 'demo-' + Math.random().toString(36).substr(2, 9));
                navigate(`/result/${preprocessData?.image_id || 'demo'}`);
            } catch (err) {
                console.error("[IA PIPELINE] Erreur fatale:", err);
                alert("Erreur lors de l'analyse IA. Assurez-vous que les modèles SAM et Depth sont installés.");
                navigate('/upload');
            }
        }

        runAnalysis()
    }, [previewUrl, preprocessData, navigate, setAnalysisResult, setProjectId])

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="relative rounded-[2.5rem] overflow-hidden bg-white shadow-2xl h-[550px] border border-gray-100">
                    {previewUrl && <img src={previewUrl} className="w-full h-full object-cover opacity-40 transition-all duration-1000 grayscale-[0.5]" alt="Analysis context" />}

                    <div className="absolute inset-0">
                        {currentStep === 0 && <div className="scan-line !bg-[var(--color-nature)] !shadow-[var(--color-nature)]" />}

                        {currentStep >= 1 && currentStep !== 2 && (
                            <div className="absolute inset-0 bg-[var(--color-nature)]/5 backdrop-blur-[2px] animate-pulse flex items-center justify-center">
                                <div className="px-6 py-3 bg-white/90 shadow-xl rounded-2xl text-[var(--color-nature)] font-bold tracking-widest text-xs uppercase border border-[var(--color-nature)]/20">ZONING EN COURS</div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
                                <div className="p-8 bg-white/90 backdrop-blur-xl shadow-2xl rounded-[2rem] text-center space-y-3 max-w-[85%] border border-gray-100">
                                    <div className="w-12 h-12 bg-[var(--color-nature)]/10 rounded-2xl flex items-center justify-center text-[var(--color-nature)] mx-auto mb-2">
                                        <BrainCircuit size={24} />
                                    </div>
                                    <p className="text-[var(--color-nature)] font-bold tracking-[0.2em] text-[10px] uppercase">Atlas Climatique Précis</p>
                                    <p className="text-base font-bold text-[var(--color-structure)]">{projectContext?.location?.label || 'Localisation inconnue'}</p>
                                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                                        <div className="text-[10px] bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm font-bold">🌡️ {projectContext?.climate_profile?.current?.temp_c}°C</div>
                                        <div className="text-[10px] bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm font-bold">❄️ Min: {projectContext?.annual_profile?.summary?.temp_min_record_c}°C</div>
                                        <div className="text-[10px] bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm font-bold">🌿 {projectContext?.annual_profile?.summary?.hardiness_zone}</div>
                                    </div>
                                    <p className="text-[10px] text-gray-400 italic mt-3">Calcul des paramètres botaniques optimaux...</p>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-[var(--color-nature)] rounded-full animate-ping opacity-20" />
                                <div className="absolute bottom-1/3 right-1/4 w-40 h-40 border-2 border-[var(--color-action)] rounded-full animate-ping opacity-20" />
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-0 inset-x-0 p-10 bg-gradient-to-t from-white via-white/80 to-transparent">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-[var(--color-nature)]/10 flex items-center justify-center text-[var(--color-nature)] animate-pulse">
                                <Sparkles size={32} />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[var(--color-nature)] uppercase tracking-[0.3em]">IA Cognitive</p>
                                <p className="text-xl font-bold text-[var(--color-structure)]">Sublimation de l'espace...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="space-y-3">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1">
                            <span className="text-gray-400">Progression du Design</span>
                            <span className="text-[var(--color-nature)]">{Math.round(((currentStep * 100) + progress) / STEPS.length)}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-[var(--color-nature)] transition-all duration-500 rounded-full"
                                style={{ width: `${((currentStep * 100) + progress) / STEPS.length}%` }}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        {STEPS.map((step, idx) => (
                            <div
                                key={step.id}
                                className={`flex items-center gap-5 p-5 rounded-[1.5rem] border transition-all duration-500 ${idx === currentStep ? 'bg-white border-gray-100 shadow-xl' :
                                    idx < currentStep ? 'bg-[var(--color-nature)]/5 border-transparent text-[var(--color-nature)]' : 'bg-transparent border-transparent text-gray-300'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-500 ${idx === currentStep ? 'bg-[var(--color-nature)] text-white shadow-lg shadow-[#7b9872]/30' :
                                    idx < currentStep ? 'bg-[var(--color-nature)]/10 text-[var(--color-nature)]' : 'bg-gray-50 text-gray-300'
                                    }`}>
                                    {idx < currentStep ? <CheckCircle2 size={24} /> : <step.icon size={24} />}
                                </div>
                                <div className="flex-1">
                                    <p className={`font-bold transition-colors ${idx === currentStep ? 'text-[var(--color-structure)]' : ''}`}>{step.label}</p>
                                    <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">
                                        {idx === currentStep ? 'Calcul en cours...' :
                                            idx < currentStep ? 'Terminé' : 'En attente'}
                                    </p>
                                </div>
                                {idx === currentStep && (
                                    <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-[var(--color-nature)] animate-pulse" style={{ width: `${progress}%` }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-8 rounded-[2rem] bg-stone-50 border border-stone-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--color-nature)]/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
                        <p className="text-sm text-[var(--color-structure)] font-medium italic relative z-10 leading-relaxed">
                            "Chaque végétal proposé est sélectionné selon sa résistance hydrique et son harmonie chromatique avec l'existant."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProcessingPage
