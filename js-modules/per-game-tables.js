const tableContainer = document.querySelector("#dataTablePerGameAttack");
let dataTableInstance = null; // Store DataTable instance

function cleanData(data) {
    return data.map(row => {
        for (let key in row) {
            if (isNaN(row[key]) && typeof row[key] !== "string") {
                row[key] = "N/A"; // Replace NaN with "N/A"
            }
        }
        return row;
    });
}

document.addEventListener("DOMContentLoaded", function () {
    //const gameSelect = document.getElementById("gameSelector");
    let jsonData = [];

    // Load JSON data
    fetch("../data/player-offense-per-game.json")
        .then(response => response.json())
        .then(data => {
            jsonData = data;
            populateGameDropdown(data);
            updateTables(jsonData); // Show all games initially
        });

    // Populate dropdown with unique games
    function populateGameDropdown(data) {
        const gameSelect = document.getElementById("gameSelector");
        gameSelect.innerHTML = '<option value="all-matches">All Games</option>'; // Reset with default option

        const games = [...new Set(data.map(item => item.match))]; // Get unique game names

        games.forEach(game => {
            const option = document.createElement("option");
            option.value = game;
            option.textContent = game;
            gameSelect.appendChild(option);
        });
    }

    // Attach event listener to dropdown only once
    const gameSelect = document.getElementById("gameSelector");
    gameSelect.addEventListener("change", () => updateTables(jsonData)); // Update table on change
});

// Function to filter and update the table
function updateTables(data) {
    const selectedGame = document.getElementById("gameSelector").value;

    // Filter or show combined data if 'All Games' is selected
    const filteredData = selectedGame === "all-matches"
        ? data.filter(item => item.match === "all-matches")
        : data.filter(item => item.match === selectedGame);

    createTable(filteredData);  // Re-render table with filtered data
}

// Function to fetch data and create a table
async function createTable(filteredData) {
    try {
        if (!filteredData.length) return;

        const cleanedData = cleanData(filteredData);

        const tableHeader = document.getElementById('per-game-attack-header');
        const tableBody = document.getElementById('per-game-attack-body');

        const columnRenames = {
            "match": "Match",
            "player": "Player",
            "pass-attempt": "Number of passes",
            //"positive_percentage": "Positive %",
            //"perfect_percentage": "Perfect %",
            //"average_pass_rating": "Pass Rating",
            //"error_percentage": "Error %"
        };

        // Clear existing table content
        tableHeader.innerHTML = '';
        tableBody.innerHTML = '';

        // Create headers with specific column widths
        const headers = Object.keys(filteredData[0]);

        headers.forEach((header, index) => {
            const th = document.createElement('th');
            th.textContent = columnRenames[header] || header;
            th.style.textAlign = "center";

            // Inline CSS for column width
            if (index === 0) {
                th.style.width = '100px';  // First column
            }

            if (index === 1) {
                th.style.width = '100px';  // First column
            }

            tableHeader.appendChild(th);
        });

        // Populate rows
        cleanedData.forEach(row => {
            const tr = document.createElement('tr');

            headers.forEach((header, index) => {
                const td = document.createElement('td');

                let cellValue = row[header];

                if (index === 0 || index === 1) {
                    td.style.textAlign = "left"; // Align player names to the left
                }

                if (index >= 2 && index <= 7) {
                    td.style.textAlign = "right"; // Align values right
                }

                // Apply formatting to columns 5 and 6 (index 4 and 5)
                if (index === 5 || index === 6) {
                    cellValue = (cellValue).toFixed(0) + "%";
                } else if (index === 7) {
                    cellValue = cellValue.toFixed(3);
                }

                td.textContent = cellValue;

                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });

        // If DataTable already exists, clear the rows and add new data
        if (dataTableInstance) {
            // Clear existing rows
            dataTableInstance.clear();
            // Add new rows
            dataTableInstance.rows.add(tableBody.rows);
            // Redraw the table
            dataTableInstance.draw();
        } else {
            // Initialize the table with DataTables
            dataTableInstance = $(tableContainer).DataTable({
                "lengthChange": false,  // Disables the entries dropdown
                "searching": false,
                ordering: true,
                order: [[5, 'desc']],  // Order by column 5 (0-based)
            });
        }

    } catch (error) {
        console.error("Error fetching or creating the table:", error);
    }
}

// Initialize the table creation for the first time
createTable([]);
