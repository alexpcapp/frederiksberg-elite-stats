// Table creation module
const tableContainer = document.querySelector("#dataTable");


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

// Function to fetch data and create a table
async function createTable() {
  try {
    const response = await fetch('../data/player-offense-summary.json'); // Adjust path as needed
    const data = await response.json();

    if (!data.length) return;

    const cleanedData = cleanData(data);

    const tableHeader = document.getElementById('table-header');
    const tableBody = document.getElementById('table-body');

    const columnRenames = {
        "player": "Player",
        "attack_attempts": "Attacks",
        "total_kills": "Total Kills",
        "attack_errors": "Attack Errors",
        "kill_pct": "Kill %",
        "error_pct": "Error %",
        "kill_effic": "Kill Efficiency"
      };

    // Clear any existing content
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';

    // Create headers with specific column widths
    const headers = Object.keys(data[0]);

    

    headers.forEach((header, index) => {
      const th = document.createElement('th');
      th.textContent = columnRenames[header] || header;
      th.style.textAlign = "center"; 


      // Inline CSS for column width
      if (index === 0) {
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
        
        // Apply formatting to columns 5 and 6 (index 4 and 5)
        if (index === 4 || index === 5) {
          // Assuming the value is a decimal (e.g., 0.85 for 85%)
          cellValue = (cellValue).toFixed(0) + "%";
        } else if (index === 6) {
            // For the 6th column, format with no leading zero
            cellValue = cellValue.toFixed(3).replace(/^0/, '');
          }
    
        td.textContent = cellValue;
    
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });

    // Dynamic table with DataTables features
    if (tableContainer) {
      $(tableContainer).DataTable({
        paging: true,
        searching: true,
        ordering: true,
        order: [[6, 'desc']]
      });
    }



  } catch (error) {
    console.error("Error fetching or creating the table:", error);
  }
}

// Initialize the table creation
createTable();
