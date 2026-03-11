import { create } from 'zustand'
import { buildPlantFilter } from '../utils/buildPlantFilter'

const useStore = create((set) => ({
    image: null,
    previewUrl: null,
    filters: {
        style: 'naturel',
        maintenance: 'modere',
        elements: [],
        atmosphere: 'esthetique',
        description: '',
        appliedSuggestions: [], // Track applied IDs to avoid duplicates
    },
    analysisResult: null,
    projectId: null,
    projectContext: null,
    plantFilter: null,

    setImage: (file) => {
        const url = URL.createObjectURL(file)
        set({ image: file, previewUrl: url })
    },

    setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
    })),

    toggleElement: (elementId) => set((state) => {
        const elements = state.filters.elements.includes(elementId)
            ? state.filters.elements.filter(e => e !== elementId)
            : [...state.filters.elements, elementId]
        return { filters: { ...state.filters, elements } }
    }),

    setAnalysisResult: (result) => set({ analysisResult: result }),
    setProjectId: (id) => set({ projectId: id }),
    setProjectContext: (context) => {
        const plantFilter = context ? buildPlantFilter(context) : null
        set({ projectContext: context, plantFilter })
    },
}))

export default useStore
