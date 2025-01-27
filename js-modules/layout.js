// layout.js

// General function to apply consistent chart styles (e.g., colors, fonts)
function applyLayoutStyles(chart) {
    chart.options = {
        ...chart.options,
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    font: {
                        size: 14
                    }
                }
            }
        },
        elements: {
            point: {
                radius: 5,
            },
            line: {
                tension: 0.4
            }
        }
    };
}

// Apply a common color palette for visualizations
const colorPalette = ['#FF5733', '#33FF57', '#3357FF', '#F0FF33', '#FF33F0'];

// Example of setting colors for a bar chart dynamically
function getChartColors(index) {
    return colorPalette[index % colorPalette.length];
}

export { applyLayoutStyles, getChartColors };
