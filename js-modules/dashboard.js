// dashboard.js
// Main script to orchestrate the dashboard
import { fetchData } from './fetching-data.js';
import { createVisualization } from './data-visualization.js';
import { setupFilters } from './filter-controls.js';

const initDashboard = async () => {
    const dataUrl = '../data/all_seasons_frb.json';
    const data = await fetchData(dataUrl);

    if (data) {
        setupFilters(data);
        createVisualization(data);
    } else {
        console.error("Failed to initialize dashboard due to missing data.");
    }
};

window.addEventListener('DOMContentLoaded', initDashboard);
