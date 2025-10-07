document.addEventListener("DOMContentLoaded", function () {
    const gameSelect = document.getElementById("gameSelector");

    let offenseData = [];
    let defenseData = [];
    let offenseTableInstance = null;
    let defenseTableInstance = null;

    // Fetch both datasets
    Promise.all([
        fetch("../data/player-offense-per-game.json").then(response => response.json()),
        fetch("../data/player-passing-per-game.json").then(response => response.json())
    ]).then(([offense, defense]) => {
        offenseData = offense;
        defenseData = defense;

        console.log("Offense Data:", offenseData);
        console.log("Defense Data:", defenseData);

        populateGameDropdown(offenseData); // Assuming both datasets have same game names
        updateTables(offenseData, defenseData);
    });

    function populateGameDropdown(data) {
        gameSelect.innerHTML = '<option value="all">All Games</option>';
        const games = [...new Set(data.map(item => item.match))];

        games.forEach(game => {
            const option = document.createElement("option");
            option.value = game;
            option.textContent = game;
            gameSelect.appendChild(option);
        });
    }

    gameSelect.addEventListener("change", () => updateTables(offenseData, defenseData));

    function updateTables(offense, defense) {
        const selectedGame = gameSelect.value;
        console.log("Updating tables for:", selectedGame);

        const filteredOffense = selectedGame === "all"
            ? offense.filter(item => item.match === "all-matches")
            : offense.filter(item => item.match === selectedGame);

        const filteredDefense = selectedGame === "all"
            ? defense.filter(item => item.match === "all-matches")
            : defense.filter(item => item.match === selectedGame);

        console.log("Filtered Offense:", filteredOffense);
        console.log("Filtered Defense:", filteredDefense);

        createTable(filteredOffense, "per-game-attack-header", "per-game-attack-body", "dataTablePerGameAttack", offenseTableInstance, instance => offenseTableInstance = instance);
        createTable(filteredDefense, "per-game-passing-header", "per-game-passing-body", "dataTablePerGamePassing", defenseTableInstance, instance => defenseTableInstance = instance);
    }

    async function createTable(filteredData, headerId, bodyId, tableId, dataTableInstance, updateInstance) {
        try {
            if (!filteredData.length) return;
    
            const tableHeader = document.getElementById(headerId);
            const tableBody = document.getElementById(bodyId);
            const tableContainer = document.getElementById(tableId);
    
            // Destroy existing DataTable before modifying table content
            if (dataTableInstance) {
                dataTableInstance.destroy();
                dataTableInstance = null;
            }
    
            // Clear the table
            tableHeader.innerHTML = '';
            tableBody.innerHTML = '';
    
            // Define custom column names
            const columnNameMapping = {
                "match": "Match",
                "player": "Player",
                "attack_attempts": "Attack Attempts",
                "total_kills": "Total Kills",
                "attack_errors": "Attack Errors",
                "kill_pct": "Kill %",
                "error_pct": "Error %",
                "kill_effic": "Kill Efficiency",

                "avg_pass_rating": "Average Pass Rating",
                "pass-attempt": "Pass Attemtps",
                "positive_percentage": "Positive %",
                "perfect_percentage": "Perfect %",
                "error_percentage": "Error %",
                "average_pass_rating": "Pass Rating"
            };

            // Rename headers if they exist in the mapping
            const originalHeaders = Object.keys(filteredData[0]);
            const customHeaders = originalHeaders.map(header => columnNameMapping[header] || header);

            // Create headers with new names
            customHeaders.forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                th.style.textAlign = "center";
                tableHeader.appendChild(th);
            });
    
            // Populate table with data
            filteredData.forEach(row => {
                const tr = document.createElement('tr');

                originalHeaders.forEach((header, index) => {
                    const td = document.createElement('td');

                    let cellValue = row[header];

                    // Apply different formatting based on the tableId and column index
                    if (tableId === "dataTablePerGameAttack" && index === 0 || index === 1) {
                        td.innerHTML = `${row[header]}`; 
                        td.style.textAlign = "left";

                    } else if (tableId === "dataTablePerGameAttack" && index === 5 | index === 6) {
                        td.innerHTML = `${row[header]}`; 
                        td.style.textAlign = "right";  
                        cellValue = cellValue.toFixed(0) + "%";  

                    } else if (tableId === "dataTablePerGameAttack" && index === 7) {
                        td.innerHTML = `${row[header]}`; 
                        td.style.textAlign = "right";  
                        cellValue = cellValue.toFixed(3);

                    } else if (tableId === "dataTablePerGameAttack") {
                        td.innerHTML = `${row[header]}`; 
                        td.style.textAlign = "right";  

                    }  else if (tableId === "dataTablePerGamePassing" && index === 0) {
                        td.innerHTML = `${row[header]}`; 
                        // Default formatting
                        td.style.textAlign = "left";

                    } else if (tableId === "dataTablePerGamePassing" && index === 2) {
                        td.innerHTML = `${row[header]}`; 
                        td.style.textAlign = "right";
                        cellValue = cellValue.toFixed(0);

                    } else if (tableId === "dataTablePerGamePassing" && index >=3 && index <=5) {   
                        td.innerHTML = `${row[header]}`; 
                        td.style.textAlign = "right";
                        cellValue = cellValue.toFixed(0) + "%";

                    } else if (tableId === "dataTablePerGamePassing" && index === 6) {   
                        td.innerHTML = `${row[header]}`; 
                        td.style.textAlign = "right";
                        cellValue = cellValue.toFixed(2);
                    } 

                    td.textContent = cellValue;
    
                    tr.appendChild(td);
                });
                
                tableBody.appendChild(tr);
            });
    
            // Reinitialize DataTable after updating content
            dataTableInstance = $(tableContainer).DataTable({
                "lengthChange": false,
                "searching": false,
                "ordering": true,
                "order":
                    (tableId === "dataTablePerGameAttack") ? [[7, "desc"]] :  // Sort by 3rd column in attack table
                    (tableId === "dataTablePerGamePassing") ? [[6, "desc"]] :  // Sort by 2nd column in passing table
                    [[1, "asc"]]  // Default: sort by the first column
            });
    
            // Update the stored instance
            updateInstance(dataTableInstance);
    
        } catch (error) {
            console.error("Error creating the table:", error);
        }
    }
});
