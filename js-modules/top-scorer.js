// top-scorer.js
import { applyLayoutStyles } from './layout.js';

let originalData = []; // To store the unfiltered data
let chartInstance; // To store the chart instance for updates


// Function to fetch the JSON data
async function fetchTopScorerData() {
    try {
        const response = await fetch('../data/top-scorer-per-game.json');  // Adjust the path if needed
        const data = await response.json();
        originalData = data;
        renderTopScorerChart(data);  // Pass the data to the rendering function
        populateGameFilters(data);
    } catch (error) {
        console.error('Error fetching top scorer data:', error);
    }
}

// Function to sort scorer data from highest to lowest
function aggregateData(data, selectedGames = []) {
    const filteredData = selectedGames.length
        ? data.filter(item => selectedGames.includes(item.match))
        : data;

    const aggregated = filteredData.reduce((acc, curr) => {
        if (!acc[curr.player]) {
            acc[curr.player] = 0;
        }
        acc[curr.player] += curr.points;
        return acc;
    }, {});

    return Object.entries(aggregated)
        .map(([player, points]) => ({ player, points }))
        .sort((a, b) => b.points - a.points);
}

function getGlobalMaxPoints(data) {
    return Math.max(...data.map(item => item['max-earned'])) + 10; // Add padding to the max value
}


function renderTopScorerChart(data, selectedGames = []) {
    const aggregatedData = aggregateData(data, selectedGames);
    const labels = aggregatedData.map(item => item.player);
    const points = aggregatedData.map(item => item.points);

    const ctx = document.getElementById('topScorerChart').getContext('2d');

    // If chart already exists, destroy it before creating a new one
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Find the max value for the points (for consistent x-axis scaling)
    //const maxPoints = Math.max(...points);
    const globalMaxPoints = getGlobalMaxPoints(data);
    // const globalMaxPoints = Math.max(...originalData.map(item => item.points)) + 10; // Padding


    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Total Points',
                data: points,
                backgroundColor: '#4e73df',
                borderColor: '#4e73df',
                borderWidth: 1,
                //barThickness: 10,
                barThickness: window.innerWidth < 768 ? 10 : 20
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            
            scales: {
                x: {
                    beginAtZero: true,
                    max: globalMaxPoints + 20,
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        autoSkip: false,
                        padding: 20,
                    }
                }
            }
        }
    });

    // Update bar thickness on resize
    window.addEventListener('resize', () => {
        myChart.data.datasets[0].barThickness = window.innerWidth < 768 ? 10 : 20;
        myChart.update();
    });

    applyLayoutStyles(chartInstance);
}

function populateGameFilters(data) {
    const uniqueGames = [...new Set(data.map(item => item.match))];

    const filterContainer = document.getElementById('gameFilters');
    filterContainer.innerHTML = ''; // Clear previous options

    const select = document.createElement('select');
    select.multiple = true; // Allow multiple selections
    uniqueGames.forEach(match => {
        const option = document.createElement('option');
        option.value = match;
        option.textContent = match;
        select.appendChild(option);
    });

    // Add event listener to update the chart based on selected games
    select.addEventListener('change', () => {
        const selectedGames = Array.from(select.selectedOptions).map(opt => opt.value);
        renderTopScorerChart(originalData, selectedGames);
    });

    filterContainer.appendChild(select);
}

document.addEventListener('DOMContentLoaded', fetchTopScorerData);