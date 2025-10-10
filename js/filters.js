/**
 * Gestion des filtres de l'application
 */

class FilterManager {
    constructor(table) {
        this.table = table;
        this.selectedRegions = [];
        this.initializeFilters();
    }

    /**
     * Initialise tous les filtres
     */
    initializeFilters() {
        this.attachAdvancedFilterListeners();
        this.attachClearButtonListener();
    }

    /**
     * Attache les écouteurs d'événements pour les filtres avancés
     */
    attachAdvancedFilterListeners() {
        $('#advanced-filters input, #advanced-filters select').on('input change', () => {
            this.applyAdvancedFilters();
        });
    }

    /**
     * Attache l'écouteur pour le bouton de réinitialisation
     */
    attachClearButtonListener() {
        $('#clear-all-filters').click(() => {
            this.clearAllFilters();
        });
    }

    /**
     * Applique tous les filtres avancés
     */
    applyAdvancedFilters() {
        const altMin = parseFloat($('#alt-min').val()) || -Infinity;
        const altMax = parseFloat($('#alt-max').val()) || Infinity;
        const tempsMax = parseFloat($('#temps-max').val()) || Infinity;
        const denivMin = parseFloat($('#deniv-min').val()) || -Infinity;
        const denivMax = parseFloat($('#deniv-max').val()) || Infinity;
        const distMin = parseFloat($('#dist-min').val()) || -Infinity;
        const distMax = parseFloat($('#dist-max').val()) || Infinity;
        const pioletChecked = $('#piolet-check').is(':checked');
        const cramponsChecked = $('#crampons-check').is(':checked');
        const popMin = parseFloat($('#pop-min').val()) || -Infinity;
        const noteMin = parseFloat($('#note-min').val()) || -Infinity;
        const noteMax = parseFloat($('#note-max').val()) || Infinity;

        // Ajoute un filtre personnalisé à DataTables
        $.fn.dataTable.ext.search.push((settings, data, dataIndex) => {
            const alt = parseFloat(data[0]) || 0;
            if (alt < altMin || alt > altMax) return false;

            const temps = parseFloat(data[3]) || 0;
            if (temps > tempsMax) return false;

            const deniv = parseFloat(data[4]) || 0;
            if (deniv < denivMin || deniv > denivMax) return false;

            const dist = parseFloat(data[5]) || 0;
            if (dist < distMin || dist > distMax) return false;

            // Vérifie si piolet est requis (doit être égal à 1 ou "1")
            if (pioletChecked && data[8] != 1) return false;
            
            // Vérifie si crampons sont requis (doit être égal à 1 ou "1")
            if (cramponsChecked && data[9] != 1) return false;

            const pop = parseFloat(data[10]) || 0;
            if (pop < popMin) return false;

            const noteStr = data[11].split(' ±')[0];
            const note = parseFloat(noteStr) || 0;
            if (note < noteMin || note > noteMax) return false;

            return true;
        });

        // Applique les filtres de colonne
        const niveau = $('#niveau-select').val();
        this.table.column(1).search(niveau);

        const rando = $('#rando-filter').val();
        this.table.column(2).search(rando);

        const vallees = $('#vallees-filter').val();
        this.table.column(7).search(vallees);

        // Rafraîchit la table
        this.table.draw();
        $.fn.dataTable.ext.search.pop();
    }

    /**
     * Crée les boutons de filtre par région
     */
    createRegionButtons(regions) {
        const regionFilters = $('#region-filters');
        
        // Bouton "Tous"
        
        // Boutons pour chaque région
        regions.forEach((region) => {
            const button = $('<button class="btn btn-outline-primary btn-sm me-1 mb-1 region-btn">' + region + '</button>');
            button.click(() => {
                this.toggleRegion(region, button);
            });
            regionFilters.append(button);
        });
        
        const allButton = $('<button class="btn btn-primary btn-sm me-1 mb-1">Tous</button>');
        allButton.click(() => {
            this.selectedRegions = [];
            $('.region-btn').removeClass('active');
            this.table.column(6).search('').draw();
        });
        regionFilters.append(allButton);
    }

    /**
     * Active/désactive une région
     */
    toggleRegion(region, button) {
        const index = this.selectedRegions.indexOf(region);
        if (index > -1) {
            this.selectedRegions.splice(index, 1);
            button.removeClass('active');
        } else {
            this.selectedRegions.push(region);
            button.addClass('active');
        }
        
        const searchTerm = this.selectedRegions.length ? this.selectedRegions.join('|') : '';
        this.table.column(6).search(searchTerm, true, false).draw();
    }

    /**
     * Remplit le sélecteur de niveaux
     */
    populateNiveauSelector(niveaux) {
        const niveauSelect = $('#niveau-select');
        niveauSelect.empty();
        niveauSelect.append('<option value="">Tous niveaux</option>');
        
        niveaux.forEach((niveau) => {
            niveauSelect.append('<option value="' + niveau + '">' + niveau + '</option>');
        });
    }

    /**
     * Réinitialise tous les filtres
     */
    clearAllFilters() {
        $('#advanced-filters input').val('');
        $('#advanced-filters select').val('');
        $('#advanced-filters input[type="checkbox"]').prop('checked', false);
        $('.region-btn').removeClass('active');
        this.selectedRegions = [];
        this.table.search('').columns().search('').draw();
        $.fn.dataTable.ext.search = [];
    }
}
