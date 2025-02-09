// Table creation module
const tableContainer = document.querySelector("#dataTableReceptionSummary");


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
    const response = await fetch('../data/player-passing-summary.json'); // Adjust path as needed
    const data = await response.json();

    if (!data.length) return;

    const cleanedData = cleanData(data);

    const tableHeader = document.getElementById('reception-table-header');
    const tableBody = document.getElementById('reception-table-body');

    const columnRenames = {
        "player": "Player",
        "pass-attempt": "Number of passes",
        "positive_percentage": "Positive %",
        "perfect_percentage": "Perfect %",
        "average_pass_rating": "Pass Rating",
        "error_percentage": "Error %"
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

        if (index === 0) {
            td.style.textAlign = "left"; // Align player names to the left
          }

        if (index === 1) {
            td.style.textAlign = "right"; // Align values right
          }
        
        // Apply formatting to columns 5 and 6 (index 4 and 5)
        if (index === 2 || index === 3|| index === 4) {
          // Assuming the value is a decimal (e.g., 0.85 for 85%)
          cellValue = (cellValue).toFixed(0) + "%";
        } else if (index === 5) {
            // For the 6th column, format with no leading zero
            //cellValue = cellValue.toFixed(2).replace(/^0/, '');
            cellValue = cellValue.toFixed(2);

          }
    
        td.textContent = cellValue;
    
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });

    // Dynamic table with DataTables features
    if (tableContainer) {
      $(tableContainer).DataTable({
        "lengthChange": false,  // Disables the entries dropdown
        "searching": false,
        //paging: true,
        //searching: true,
        ordering: true,
        order: [[5, 'desc']]
      });
    }



  } catch (error) {
    console.error("Error fetching or creating the table:", error);
  }
}

// Initialize the table creation
createTable();
