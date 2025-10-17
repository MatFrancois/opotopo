// Minimap: initialize maplibre and add up to 10 GPX tracks corresponding to the table rows

(function() {
    let map = null;
    let gpxIndex = {};
    let currentGpxLayers = []; // track currently displayed GPX layers

    // Color palette for GPX tracks (10 distinct colors)
    const gpxColors = [
        '#FF0000', // Red
        '#0000FF', // Blue
        '#00FF00', // Green
        '#FF00FF', // Magenta
        '#FFA500', // Orange
        '#00FFFF', // Cyan
        '#FF1493', // Deep Pink
        '#FFD700', // Gold
        '#9370DB', // Medium Purple
        '#00FF7F'  // Spring Green
    ];

    // wait for DOM and maplibre to be available
    function ready(fn) {
        if (document.readyState !== 'loading') fn();
        else document.addEventListener('DOMContentLoaded', fn);
    }

    // Function to update GPX tracks based on currently visible table rows
    function updateGpxTracks() {
        if (!map || !map.loaded()) return;

        try {
            // Remove all existing GPX layers and sources
            currentGpxLayers.forEach(({ layerId, sourceId, hoverLayerId, outlineLayerId }) => {
                // Remove hover layer if it exists
                if (hoverLayerId && map.getLayer(hoverLayerId)) {
                    map.removeLayer(hoverLayerId);
                }
                // Remove main layer
                if (map.getLayer(layerId)) {
                    map.removeLayer(layerId);
                }
                // Remove outline layer if it exists
                if (outlineLayerId && map.getLayer(outlineLayerId)) {
                    map.removeLayer(outlineLayerId);
                }
                // Remove source
                if (map.getSource(sourceId)) {
                    map.removeSource(sourceId);
                }
            });
            currentGpxLayers = [];

            // Get currently visible rows in the table (those displayed on current page)
            // Filter out hidden rows (display: none) using native DOM
            const allRows = Array.from(document.querySelectorAll('#randonnees-table tbody tr'));
            const visibleRows = allRows.filter(row => {
                const style = window.getComputedStyle(row);
                return style.display !== 'none';
            }); // Remove .slice(0, 10) to show all visible GPX
            
            let added = 0;
            for (const row of visibleRows) {
                const rid = row.dataset.rid;
                if (!rid) continue;

                // Get hike info from row data attributes
                const randonnee = row.dataset.randonnee || 'Randonnée inconnue';
                const kms = row.dataset.kms || 'N/A';
                const deniv = row.dataset.deniv || 'N/A';

                const urls = gpxIndex[String(rid)];
                if (!urls || urls.length === 0) continue;

                // Use first URL (KML or GPX)
                let rawUrl = urls[0];

                // Determine protocol based on file extension
                const isKml = rawUrl.toLowerCase().endsWith('.kml');
                const protocol = isKml ? 'kml://' : 'gpx://';

                // Ensure we have a protocol and wrap for vector text protocol using a CORS proxy
                const proxied = protocol + 'https://corsproxy.io/?' + rawUrl.replace(/^https?:\/\//, 'https://');

                const sourceId = 'gpxSource_' + rid;
                const layerId = 'gpxLayer_' + rid;

                // Use a different color for each GPX track
                const color = gpxColors[added % gpxColors.length];

                // add as geojson source using gpx protocol
                try {
                    map.addSource(sourceId, {
                        type: 'geojson',
                        data: proxied
                    });

                    // Add black outline layer first (drawn underneath)
                    const outlineLayerId = layerId + '_outline';
                    map.addLayer({
                        id: outlineLayerId,
                        type: 'line',
                        source: sourceId,
                        paint: {
                            'line-color': '#000000',
                            'line-width': 7,
                            'line-opacity': 0.6
                        }
                    });

                    // Add main colored layer on top
                    map.addLayer({
                        id: layerId,
                        type: 'line',
                        source: sourceId,
                        paint: {
                            'line-color': color,
                            'line-width': 5,
                            'line-opacity': 0.8
                        }
                    });

                    // Add a thicker, semi-transparent layer for hover effect
                    const hoverLayerId = layerId + '_hover';
                    map.addLayer({
                        id: hoverLayerId,
                        type: 'line',
                        source: sourceId,
                        paint: {
                            'line-color': color,
                            'line-width': 10,
                            'line-opacity': 0
                        }
                    });

                    // Add hover interaction
                    map.on('mouseenter', layerId, () => {
                        map.getCanvas().style.cursor = 'pointer';
                        map.setPaintProperty(hoverLayerId, 'line-opacity', 0.4);
                        map.setPaintProperty(layerId, 'line-width', 7);
                        map.setPaintProperty(outlineLayerId, 'line-width', 9); // Increase outline on hover
                    });

                    map.on('mouseleave', layerId, () => {
                        map.getCanvas().style.cursor = '';
                        map.setPaintProperty(hoverLayerId, 'line-opacity', 0);
                        map.setPaintProperty(layerId, 'line-width', 5);
                        map.setPaintProperty(outlineLayerId, 'line-width', 7); // Reset outline
                    });

                    // Add click interaction to show popup with hike info
                    map.on('click', layerId, (e) => {
                        const coordinates = e.lngLat;
                        
                        // Create popup content
                        const popupContent = `
                            <div style="font-family: Arial, sans-serif; min-width: 200px;">
                                <h3 style="margin: 0 0 10px 0; font-size: 16px; color: ${color}; border-bottom: 2px solid ${color}; padding-bottom: 5px;">
                                    ${randonnee}
                                </h3>
                                <div style="font-size: 14px;">
                                    <p style="margin: 5px 0;"><strong>📏 Distance:</strong> ${kms} km</p>
                                    <p style="margin: 5px 0;"><strong>⛰️ Dénivelé:</strong> ${deniv} m</p>
                                </div>
                            </div>
                        `;

                        new maplibregl.Popup()
                            .setLngLat(coordinates)
                            .setHTML(popupContent)
                            .addTo(map);
                    });

                    currentGpxLayers.push({ layerId, sourceId, hoverLayerId, outlineLayerId });
                    added++;
                } catch (e) {
                    console.warn('Erreur en ajoutant la source/layer pour rid', rid, e);
                }

                // Removed the limit - now showing all visible GPX tracks
            }

            console.log(`${added} GPX tracks affichés sur la carte`);

            // Auto-fit map bounds to show all GPX tracks
            if (added > 0) {
                // Small delay to ensure all sources are loaded
                setTimeout(() => {
                    const bounds = new maplibregl.LngLatBounds();
                    let hasValidBounds = false;

                    // Collect all coordinates from all GPX sources
                    currentGpxLayers.forEach(({ sourceId }) => {
                        const source = map.getSource(sourceId);
                        if (source && source._data) {
                            const data = source._data;
                            
                            // Handle GeoJSON features
                            if (data.type === 'FeatureCollection' && data.features) {
                                data.features.forEach(feature => {
                                    if (feature.geometry && feature.geometry.coordinates) {
                                        const coords = feature.geometry.coordinates;
                                        
                                        // Handle LineString
                                        if (feature.geometry.type === 'LineString') {
                                            coords.forEach(coord => {
                                                if (Array.isArray(coord) && coord.length >= 2) {
                                                    bounds.extend(coord);
                                                    hasValidBounds = true;
                                                }
                                            });
                                        }
                                        // Handle MultiLineString
                                        else if (feature.geometry.type === 'MultiLineString') {
                                            coords.forEach(line => {
                                                line.forEach(coord => {
                                                    if (Array.isArray(coord) && coord.length >= 2) {
                                                        bounds.extend(coord);
                                                        hasValidBounds = true;
                                                    }
                                                });
                                            });
                                        }
                                    }
                                });
                            }
                        }
                    });

                    // Fit map to bounds with padding
                    if (hasValidBounds) {
                        map.fitBounds(bounds, {
                            padding: { top: 50, bottom: 50, left: 50, right: 50 },
                            maxZoom: 12,
                            duration: 1000 // Smooth animation
                        });
                        console.log('Carte ajustée aux limites des GPX');
                    }
                }, 500); // Wait for GPX data to load
            }
        } catch (err) {
            console.error('Erreur lors de la mise à jour des GPX sur la carte', err);
        }
    }

    // Expose the update function globally so main.js can call it
    window.updateMinimapGpx = updateGpxTracks;

    ready(async () => {
        // ensure VectorTextProtocol is available
        if (typeof VectorTextProtocol !== 'undefined' && typeof VectorTextProtocol.addProtocols === 'function') {
            VectorTextProtocol.addProtocols(maplibregl);
        }

        // create map
        map = new maplibregl.Map({
            container: 'map',
            style: "https://api.maptiler.com/maps/positron/style.json?key=fGHEFwGiXNQS65xbHy1s", //'https://demotiles.maplibre.org/style.json',
            center: [0.5, 42.8],
            zoom: 7
        });
        window.map = map; // expose globally
        map.addControl(new maplibregl.NavigationControl(), 'top-right');

        // load mapping file gpx_urls.json
        try {
            const resp = await fetch('gpx_urls.json');
            if (resp.ok) {
                const list = await resp.json();
                // build quick lookup by rid - prioritize KML over GPX
                list.forEach(item => {
                    if (item && item.rid !== undefined) {
                        // Use KML if available, fallback to GPX
                        gpxIndex[String(item.rid)] = item.kml_urls || item.gpx_urls || [];
                    }
                });
            }
        } catch (e) {
            console.warn('Impossible de charger gpx_urls.json', e);
        }

        // On map load, add initial GPX tracks
        map.on('load', () => {
            updateGpxTracks();
        });
    });
})();
