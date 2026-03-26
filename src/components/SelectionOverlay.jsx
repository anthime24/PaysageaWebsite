import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, RotateCcw, MousePointer2 } from 'lucide-react'
import useStore from '../store/useStore'

const SelectionOverlay = ({ isOpen, onClose, imageUrl }) => {
    const { userZone, setUserZone } = useStore()
    const [points, setPoints] = useState([])
    const imgRef = useRef(null)
    const containerRef = useRef(null)
    const [imgLoaded, setImgLoaded] = useState(false)

    // Sync store initial state if needed
    useEffect(() => {
        if (isOpen && userZone) {
            setPoints(userZone)
        }
    }, [isOpen, userZone])

    const getNormalizedCoords = (e) => {
        if (!imgRef.current) return null
        const rect = imgRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width
        const y = (e.clientY - rect.top) / rect.height
        return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) }
    }

    const handleCanvasClick = (e) => {
        const coords = getNormalizedCoords(e)
        if (coords) {
            setPoints([...points, coords])
        }
    }

    const handleReset = () => {
        setPoints([])
    }

    const handleValidate = () => {
        setUserZone(points)
        onClose()
    }

    if (!isOpen) return null

    return createPortal(
        <AnimatePresence>
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                />

                {/* Modal Window */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative max-w-[95vw] max-h-[95vh] bg-[#1a1a1a] rounded-3xl border border-white/10 shadow-3xl flex flex-col overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="bg-[var(--color-nature)] p-2 rounded-xl">
                                <MousePointer2 size={20} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-sm font-black uppercase tracking-tighter text-white">Éditeur de Zone</h2>
                                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest leading-none">Cliquez précisément pour définir le contour</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-400"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Interaction Area (Adaptive) */}
                    <div className="relative flex items-center justify-center bg-black p-2 min-h-[300px]">
                        <div 
                            ref={containerRef}
                            className="relative cursor-crosshair inline-block shadow-2xl"
                            onClick={handleCanvasClick}
                        >
                            {imageUrl && (
                                <img 
                                    ref={imgRef}
                                    src={imageUrl} 
                                    alt="Selection" 
                                    onLoad={() => setImgLoaded(true)}
                                    className="block max-h-[75vh] max-w-full w-auto h-auto select-none rounded-lg"
                                    onDragStart={(e) => e.preventDefault()}
                                />
                            )}

                            {/* SVG Layer Overlaying exactly the image */}
                            {imgLoaded && imgRef.current && (
                                <svg 
                                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                    style={{ 
                                        width: imgRef.current.clientWidth, 
                                        height: imgRef.current.clientHeight 
                                    }}
                                >
                                    {points.length > 0 && (
                                        <polyline
                                            points={points.map(p => {
                                                const w = imgRef.current.clientWidth
                                                const h = imgRef.current.clientHeight
                                                return `${p.x * w},${p.y * h}`
                                            }).join(' ')}
                                            fill="rgba(123, 152, 114, 0.4)"
                                            stroke="var(--color-nature)"
                                            strokeWidth="2"
                                            strokeLinejoin="round"
                                        />
                                    )}
                                    {points.map((p, i) => {
                                        const w = imgRef.current.clientWidth
                                        const h = imgRef.current.clientHeight
                                        return (
                                            <circle 
                                                key={i} 
                                                cx={p.x * w} 
                                                cy={p.y * h} 
                                                r="4" 
                                                fill="white" 
                                                stroke="var(--color-nature)" 
                                                strokeWidth="2" 
                                            />
                                        )
                                    })}
                                </svg>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-5 border-t border-white/5 bg-white/[0.02] flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5">
                                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-nature)] animate-pulse" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">{points.length} Points</span>
                            </div>
                            <button 
                                onClick={handleReset}
                                className="px-3 py-1.5 hover:bg-white/10 text-gray-400 rounded-lg transition-all text-[10px] font-black uppercase tracking-widest"
                            >
                                Recommencer
                            </button>
                        </div>

                        <div className="flex items-center gap-4">
                            <button 
                                onClick={onClose}
                                className="text-gray-500 font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors"
                            >
                                Annuler
                            </button>
                            <button 
                                onClick={handleValidate}
                                className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-nature)] text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-lg shadow-[#7b9872]/20 hover:scale-[1.05] active:scale-[0.95] transition-all disabled:opacity-30"
                                disabled={points.length < 3}
                            >
                                <Check size={16} />
                                Valider la zone
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    )
}

export default SelectionOverlay
