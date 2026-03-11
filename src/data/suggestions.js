export const SUGGESTIONS = {
    // Quick Ideas (Independent chips)
    ideas: [
        { id: 'detente', label: 'Coin détente à l’ombre', phrase: 'un coin détente ombragé, agréable pour se reposer ou lire' },
        { id: 'fleuri', label: 'Jardin fleuri', phrase: 'un jardin fleuri, coloré et plein de vie' },
        { id: 'mediterraneen', label: 'Ambiance méditerranéenne', phrase: 'une ambiance méditerranéenne avec des senteurs de Provence' },
        { id: 'low_maintenance', label: 'Peu d’entretien', phrase: 'un aménagement nécessitant très peu d’entretien au quotidien' },
        { id: 'lecture', label: 'Espace pour lire', phrase: 'un espace paisible dédié à la lecture en extérieur' },
        { id: 'biodiversite', label: 'Plantes pour papillons', phrase: 'une sélection de plantes favorisant la biodiversité et les papillons' },
        { id: 'moderne', label: 'Style moderne', phrase: 'un design moderne aux lignes épurées et structurées' },
        { id: 'chaleureux', label: 'Jardin chaleureux', phrase: 'un jardin chaleureux et accueillant pour recevoir des amis' }
    ],
    
    // Mapping for existing filters (Style)
    styles: {
        naturel: 'un jardin naturel, harmonieux et respectueux de la biodiversité locale',
        japonais: 'un jardin japonais zen, propice à la méditation et à la sérénité',
        champetre: 'un jardin champêtre sauvage et romantique, comme une prairie en fleurs',
        minimaliste: 'un jardin minimaliste et sobre, où chaque élément à sa place',
        tropical: 'un jardin tropical luxuriant avec des feuillages généreux et exotiques'
    },

    // Mapping for Maintenance
    maintenance: {
        faible: 'un aménagement très facile à vivre au quotidien',
        modere: 'un équilibre parfait entre esthétique et temps d’entretien',
        luxuriant: 'un jardin riche et dense qui demande une attention passionnée'
    },

    // Mapping for Atmosphere
    atmosphere: {
        relaxant: 'une atmosphère calme et relaxante pour déconnecter du quotidien',
        familial: 'un espace convivial et sécurisé pour toute la famille',
        esthetique: 'un rendu visuel soigné et élégant en toutes saisons',
        ombrage: 'un jardin frais et ombragé, idéal pour les après-midi d’été',
        biodiversite: 'un véritable refuge pour la faune et la flore locale'
    }
};
