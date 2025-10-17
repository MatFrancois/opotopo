/**
 * Point d'entrée principal de l'application
 */

(async function initApp() {
    try {
        // Initialise le gestionnaire de table
        const tableManager = new TableManager();
        
        // Charge les données
        console.log('Chargement des données...');
        await tableManager.loadData();
        
        // Remplit le tableau HTML
        console.log('Remplissage de la table...');
        tableManager.populateTable();
        
        // Initialise DataTables
        console.log('Initialisation de DataTables...');
        const table = tableManager.initializeDataTable();
        
        // Listen to DataTables events to update minimap when table changes
        table.on('draw.dt', function() {
            // 'draw' event fires after pagination, filtering, or sorting
            console.log('Table updated - refreshing GPX tracks...');
            if (typeof window.updateMinimapGpx === 'function') {
                // Small delay to ensure DOM is updated
                setTimeout(() => window.updateMinimapGpx(), 100);
            }
        });
        
        // Initialise le gestionnaire de filtres
        const filterManager = new FilterManager(table);
        
        // Crée les boutons de région
        const regions = tableManager.getUniqueRegions();
        filterManager.createRegionButtons(regions);
        
        // Remplit le sélecteur de niveaux
        const niveaux = tableManager.getUniqueNiveaux();
        filterManager.populateNiveauSelector(niveaux);
        
        console.log('Application initialisée avec succès!');
        
    } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'application:', error);
        
        // Affiche un message d'erreur à l'utilisateur
        const errorMessage = document.createElement('div');
        errorMessage.className = 'alert alert-danger m-3';
        errorMessage.role = 'alert';
        errorMessage.innerHTML = `
            <h4 class="alert-heading">Erreur de chargement</h4>
            <p>Une erreur s'est produite lors du chargement des données. Veuillez rafraîchir la page.</p>
            <hr>
            <p class="mb-0"><small>${error.message}</small></p>
        `;
        document.body.insertBefore(errorMessage, document.body.firstChild);
    }
})();
