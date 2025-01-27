// top-scorer.js
import { applyLayoutStyles, getChartColors } from './layout.js';

// Function to fetch the JSON data
async function fetchTopScorerData() {
    try {
        const response = await fetch('../data/top-scorer.json');  // Adjust the path if needed
        const data = await response.json();
        renderTopScorerChart(data);  // Pass the data to the rendering function
    } catch (error) {
        console.error('Error fetching top scorer data:', error);
    }
}

// Function to sort scorer data from highest to lowest
function sortTopScorerData(data) {
    return data.sort((a, b) => b.points - a.points);
}

function renderTopScorerChart(data) {
    const sortedData = sortTopScorerData(data);

    const labels = sortedData.map(item => item.player);
    const points = sortedData.map(item => item.points);

    const ctx = document.getElementById('topScorerChart').getContext('2d');
    const topScorerChart = new Chart(ctx, {
        type: 'bar', // Horizontal bars
        data: {
            labels: labels,
            datasets: [{
                label: 'Points',
                data: points,
                backgroundColor: '#4e73df', // Single color for all bars
                borderColor: '#4e73df', // Same color for the border
                borderWidth: 1,
                barThickness: 5
            }]
        },
        options: {
            indexAxis: 'y', // Flip the axes
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        autoSkip: false, // Ensure no labels are skipped
                        maxRotation: 90, // Rotate labels to fit better
                        minRotation: 0, // Adjust to fit labels more easily
                        padding: 10 // Add padding to avoid label overlap
                    },
                    categoryPercentage: 1
                }
            }
        }
    });

    applyLayoutStyles(topScorerChart);
}


// Call the fetch function on page load
document.addEventListener('DOMContentLoaded', fetchTopScorerData);
