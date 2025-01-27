export function createVisualization(data) {
    console.log('Creating visualization...');
    const vizDiv = document.getElementById('visualization');
    vizDiv.innerHTML = ''; // Clear previous visualization
  
    data.forEach((item) => {
      const bar = document.createElement('div');
      bar.style.width = `${item.amount / 10}px`; // Scale the width based on 'amount'
      bar.style.background = 'blue';
      bar.style.margin = '5px 0';
      bar.textContent = `${item.home_result} (${item.away_result}): $${item.home_sets_won}`;
      vizDiv.appendChild(bar);
    });
  }

