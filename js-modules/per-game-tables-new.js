// Function to populate the filter dropdown with match options
function populateFilter(dataset) {
    const matches = [...new Set(dataset.map(item => item.match))]; // Get unique match names
    const selectElement = document.getElementById('games-select');
    matches.forEach(match => {
        const option = document.createElement('option');
        option.value = match;
        option.textContent = match;
        selectElement.appendChild(option);
    });
}

// Function to filter the stats based on selected matches
function filterStats(dataset, table) {
    const selectedMatches = Array.from(document.getElementById('games-select').selectedOptions)
                                  .map(option => option.value);

    // If no match is selected, show combined stats
    const filteredData = selectedMatches.length > 0
                         ? dataset.filter(item => selectedMatches.includes(item.match))
                         : dataset;

    // Clear and redraw the table with filtered data
    table.clear().rows.add(filteredData).draw();
}

// Function to render the statistics table using DataTables
function renderStats(dataset) {
    const table = $('dataTablePerGameAttack').DataTable({
        data: dataset,
        columns: [
            { data: 'match', title: 'Match' },
            { data: 'player', title: 'Player' }
            //{ data: 'stat1', title: 'Stat 1' },  // Replace with actual stats
            //{ data: 'stat2', title: 'Stat 2' },  // Replace with actual stats
            // Add more columns as needed
        ],
        lengthChange: false,  // Disable changing the number of rows
        searching: false,    // Disable the search bar (we use custom filtering)
        ordering: true,      // Allow sorting by column
        pageLength: 10       // Set default number of rows per page
    });

    // Bind filtering function
    const selectElement = document.getElementById('games-select');
    selectElement.addEventListener('change', function() {
        filterStats(dataset, table);
    });
}

// Fetch data and initialize the page
fetch('../data/player-offense-per-game.json')
    .then(response => response.json())
    .then(data => {
        dataset = data;
        populateFilter(dataset);  // Populate filter options
        renderStats(dataset);     // Initialize the DataTable with data
        filterStats(dataset, $('#dataTablePerGameAttack').DataTable()); // Show all stats by default
    })
    .catch(error => console.error('Error fetching data:', error));
