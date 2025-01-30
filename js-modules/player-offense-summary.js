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

    // Clear any existing content
    tableHeader.innerHTML = '';
    tableBody.innerHTML = '';

    // Dynamically create headers
    const headers = Object.keys(cleanedData[0]);
    headers.forEach(header => {
      const th = document.createElement('th');
      th.textContent = header;
      tableHeader.appendChild(th);
    });

    // Populate rows
    cleanedData.forEach(row => {
      const tr = document.createElement('tr');
      headers.forEach(header => {
        const td = document.createElement('td');
        td.textContent = row[header];
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
      });
    }

  } catch (error) {
    console.error("Error fetching or creating the table:", error);
  }
}

// Initialize the table creation
createTable();
