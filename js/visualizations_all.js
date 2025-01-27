

// JS with match data from here ######################################################################################################################################################################################################################################################################## //
let chart;  // Store the chart instance

// Function to load data from JSON and update the chart
async function loadData() {
    const response = await fetch('../data/all_seasons.json'); // Ensure the path is correct based on where your JSON file is located
    const matches = await response.json();
    updateChart(matches);  // Pass the data to update the chart
}

// Function to filter matches based on season and game type (home/away)
function filterMatches(matches, season, gameType) {
    return matches.filter(match => {
        const seasonMatch = season === "all" || match.season === season;
        const gameTypeMatch = gameType === "all" || match.game_type === gameType;
        return seasonMatch && gameTypeMatch;
    });
}

// Function to calculate win/loss counts
function calculateWinLoss(matches) {
    let wins = 0;
    let losses = 0;
    matches.forEach(match => {
        if (match.winner === "Frederiksberg Volley") {
            wins++;
        } else {
            losses++;
        }
    });
    return { wins, losses };
}

// Function to update the chart based on the selected filters
function updateChart(matches) {
    const season = document.getElementById("season").value;
    const gameType = document.getElementById("game-type").value;

    const filteredMatches = filterMatches(matches, season, gameType);
    const { wins, losses } = calculateWinLoss(filteredMatches);

    const ctx = document.getElementById("winLossChart").getContext("2d");

    // If the chart already exists, update the data instead of creating a new chart
    if (chart) {
        chart.data.datasets[0].data = [wins, losses];
        chart.update();  // Update the chart with the new data
    } else {
        // Create a new chart if it doesn't exist yet
        chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: ["Wins", "Losses"],
                datasets: [{
                    label: "",
                    data: [wins, losses],
                    backgroundColor: ["#4CAF50", "#F44336"],  // Green for wins, Red for losses
                    borderColor: ["#388E3C", "#D32F2F"],
                    borderWidth: 1
                }]
            },
            options: {
                legend: {
                    display: false // Disable the legend so no label appears
                },
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    datalabels: {
                        color: 'white',  // Label text color
                        font: {
                            size: 10
                        },
                        anchor: 'end',  // Position the labels at the top
                        align: 'start',   // Align labels to the end of the bars
                        clamp: true,
                        padding: 1
                    }
                }
            },
            plugins: [ChartDataLabels]  // Add the plugin to the chart
        });
    }
}


// Add event listeners to the filters
document.getElementById("season").addEventListener("change", function() {
    loadData();  // Reload the data when the user selects a new filter
});
document.getElementById("game-type").addEventListener("change", function() {
    loadData();  // Reload the data when the user selects a new filter
});

// Initial data load
loadData();
