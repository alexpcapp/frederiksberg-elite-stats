export function setupFilters(data) {
    console.log('Setting up filters...');
    const filtersDiv = document.getElementById('filters');
  
    // Example: Filter by 'home_team'
    const dropdown = document.createElement('select');
    dropdown.id = 'filter-dropdown';
  
    // Create unique filter options based on the 'home_team' field
    const home_teams = [...new Set(data.map((item) => item.home_team))];
    home_teams.forEach((home_team) => {
      const option = document.createElement('option');
      option.home_result = home_team;
      option.textContent = home_team;
      dropdown.appendChild(option);
    });
  
    filtersDiv.appendChild(dropdown);
  
    dropdown.addEventListener('change', (event) => {
      const selectedHome_team = event.target.home_result;
      const filteredData = data.filter((item) => item.home_team === selectedHome_team);
      const eventToEmit = new CustomEvent('dataFiltered', { detail: filteredData });
      window.dispatchEvent(eventToEmit);
    });
  }
  