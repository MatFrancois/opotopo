/**
 * Gestion de la table DataTables
 */

class TableManager {
    constructor() {
        this.table = null;
        this.data = [];
    }

    /**
     * Charge les données depuis le fichier JSON
     */
    async loadData() {
        try {
            const response = await fetch(CONFIG.dataPath);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            this.data = await response.json();
            return this.data;
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            throw error;
        }
    }

    /**
     * Remplit le tableau HTML avec les données
     */
    populateTable() {
        const tbody = document.querySelector('#randonnees-table tbody');
        tbody.innerHTML = ''; // Vide le tableau

        this.data.forEach((rando) => {
            const row = document.createElement('tr');
            // expose the rid on the row for other modules (minimap)
            // console.log(rando.rid)
            // console.log('cc')
            if (rando.rid !== undefined) {
                row.dataset.rid = rando.rid;
            }
            // Store key info in data attributes for minimap popup
            row.dataset.randonnee = rando.randonnee || '';
            row.dataset.kms = rando.kms || '';
            row.dataset.deniv = rando.deniv || '';
            row.innerHTML = `
                <td>${rando.alt}</td>
                <td>${rando.niveaux}</td>
                <td>${rando.randonnee}</td>
                <td>${rando.temps_minute}</td>
                <td>${rando.deniv}</td>
                <td>${rando.kms}</td>
                <td>${rando.regions}</td>
                <td>${rando.vallees}</td>
                <td>${rando.piolet}</td>
                <td>${rando.crampons}</td>
                <td>${rando.n_com}</td>
                <td>${rando.note ? rando.note.toFixed(1) : ''} ± ${rando.note_sd ? rando.note_sd.toFixed(1) : ''}</td>
                <td><a href="${rando.url}" target="_blank">Lien</a></td>
            `;
            tbody.appendChild(row);
        });
    }

    /**
     * Initialise DataTables avec la configuration
     */
    initializeDataTable() {
        this.table = $('#randonnees-table').DataTable(CONFIG.dataTableConfig);
        return this.table;
    }

    /**
     * Extrait les régions uniques des données
     */
    getUniqueRegions() {
        return [...new Set(this.data.map(r => r.regions))].sort();
    }

    /**
     * Extrait les niveaux uniques des données
     */
    getUniqueNiveaux() {
        return [...new Set(this.data.map(r => r.niveaux))].sort();
    }

    /**
     * Obtient l'instance de la table DataTables
     */
    getTable() {
        return this.table;
    }

    /**
     * Obtient les données chargées
     */
    getData() {
        return this.data;
    }
}
