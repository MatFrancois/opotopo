/**
 * Configuration globale de l'application
 */

const CONFIG = {
    // Chemin vers les données
    dataPath: 'randonnees_enrich.json',
    
    // Configuration DataTables
    dataTableConfig: {
        responsive: {
            details: {
                type: 'column',
                target: 'tr'
            }
        },
        paging: true,
        searching: true,
        ordering: true,
        info: true,
        scrollX: true,
        autoWidth: true,
        columnDefs: [
            { targets: 6, visible: false },
            { responsivePriority: 1, targets: 1 },  // Niveau
            { responsivePriority: 1, targets: 2 },  // Randonnée
            { responsivePriority: 1, targets: 4 },  // Dénivelé
            { responsivePriority: 1, targets: 5 },  // Distance
            { responsivePriority: 1, targets: 11 }, // Note
            { responsivePriority: 2, targets: 3 },  // Temps
            { responsivePriority: 3, targets: 0 },  // Altitude
            { responsivePriority: 3, targets: 10 }, // N coms
            { responsivePriority: 10, targets: 7 }, // Vallées
            { responsivePriority: 11, targets: 8 }, // Piolet
            { responsivePriority: 12, targets: 9 }, // Crampons
            { responsivePriority: 13, targets: 12 } // URL
        ],
        pageLength: 10,
        lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "Tous"]],
        language: {
            lengthMenu: "Afficher _MENU_ randonnées",
            zeroRecords: "Aucune randonnée trouvée",
            info: "Page _PAGE_ sur _PAGES_",
            infoEmpty: "Aucune randonnée disponible",
            infoFiltered: "(filtré de _MAX_ randonnées)",
            search: "Rechercher:",
            paginate: {
                first: "Premier",
                last: "Dernier",
                next: "Suivant",
                previous: "Précédent"
            }
        }
    },
    
    // Configuration des filtres
    filterDefaults: {
        altitude: { min: -Infinity, max: Infinity },
        temps: { max: Infinity },
        denivele: { min: -Infinity, max: Infinity },
        distance: { min: -Infinity, max: Infinity },
        note: { min: -Infinity, max: Infinity },
        popularite: { min: -Infinity }
    }
};

// Export pour les modules ES6 (optionnel)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
