Chart.register(window['chartjs-plugin-annotation']);


// === References to HTML elements ===
const select = document.getElementById("gameSelect");
const table = document.getElementById("gameTable");
const ctx = document.getElementById("passChart").getContext("2d");
let chart;

// === Load JSON data ===
fetch("../../team_passing_per_match.json") // adjust path if needed
  .then(resp => resp.json())
  .then(data => {
    // Convert date to Date objects
    data.forEach(game => {
      if (typeof game.date === "number") {
        game.date = new Date(game.date);
      } else {
        game.date = new Date(game.date);
      }
    });

    // Sort matches by date (earliest first)
    data.sort((a, b) => a.date - b.date);

    // Populate dropdown with id_opponent_date
    data.forEach(game => {
      const option = document.createElement("option");
      option.value = game.id_opponent_date;
      option.textContent = game.id_opponent_date;
      select.appendChild(option);
    });

    // Create Pass_Rating chart for all matches
    createPassRatingChart(data);

    // Handle dropdown selection
    select.addEventListener("change", () => {
      const selectedId = select.value;
      if (!selectedId) {
        clearTable();
        return;
      }
      const game = data.find(g => g.id_opponent_date === selectedId);
      if (game) showGameData(game);
    });
  })
  .catch(err => console.error("Error loading data:", err));

// === Show selected match in table ===
function showGameData(game) {
  const thead = table.querySelector("thead tr");
  const tbody = table.querySelector("tbody");
  thead.innerHTML = "";
  tbody.innerHTML = "";


// Define which columns you want to display
const columns = ["date", "opponent", "positive_percentage", "Pass_Rating"]; // <-- change as needed

const prettyNames = {
        //id_opponent_date: "Match ID",
        date: "Date",
        opponent: "Opponent",
        positive_percentage: "Positive %",
        Pass_Rating: "Pass Rating",
    };

const formatters = {
    positive_percentage: v => ({ text: v.toFixed(1) + "%", align: "right" }),
    Pass_Rating: v => ({text: v.toFixed(2), align: "right"})
};

const columnWidths = {
    date: "100px",
    opponent: "200px",
    positive_percentage: "100px",
    Pass_Rating: "120px"
};


// Table headers
columns.forEach(key => {
    const th = document.createElement("th");
    th.textContent = prettyNames[key] || key; // fallback to key if no mapping exists

    // Set width if defined
    if (columnWidths[key]) {
        th.style.width = columnWidths[key];
    }

    thead.appendChild(th);
});

// Table row
const row = document.createElement("tr");

    columns.forEach(key => {
    const td = document.createElement("td");
    let value = game[key];
    let align = "left"; // default alignment

    // Format value if a formatter exists
    if (formatters[key]) {
        const result = formatters[key](value);
        value = result.text;
        align = result.align || align;
    }
    // Format date
    else if (key === "date" && value instanceof Date) {
        const day = String(value.getDate()).padStart(2, "0");
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const year = value.getFullYear();
        value = `${day}/${month}/${year}`;
    }

    td.textContent = value;
    td.style.textAlign = align;

    row.appendChild(td);
});


    tbody.appendChild(row);


}

    

// === Clear table helper ===
function clearTable() {
  table.querySelector("thead tr").innerHTML = "";
  table.querySelector("tbody").innerHTML = "";
}




function createPassRatingChart(data) {
  const filtered = data.filter(d => d.Pass_Rating !== undefined);
  filtered.sort((a, b) => a.date - b.date);

  const labels = filtered.map(g => g.opponent);
  const ratings = filtered.map(g => g.Pass_Rating);

  const seasonChanges = [];
  for (let i = 1; i < filtered.length; i++) {
    if (filtered[i].season !== filtered[i - 1].season) {
      seasonChanges.push({
        index: i,
        newSeason: filtered[i].season
      });
    }
  }

  // Prepare annotation lines as an object
  

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Team Pass Rating",
        data: ratings,
        borderColor: "#0047ab",
        backgroundColor: "#0047ab",
        pointRadius: 2,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: false,
        borderWidth: 1.2
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { mode: "index", intersect: false },
        annotation: {
            annotations: {
                hLine: {
                type: 'line',
                scaleID: 'x',
                value: 1.5,    // y-coordinate
                borderColor: 'red',
                borderWidth: 1,
                borderDash: [1,1],
                label: {
                    display: true,
                    content: 'Threshold 1.5',
                    position: 'end',
                    backgroundColor: 'rgba(255, 0, 0, 0.8)',
                    color: 'red'
                }
                }
            }
        }

      },
      scales: {
        x: {
          type: 'category',
          title: { display: true, text: "Opponent" },
          ticks: { autoSkip: false, maxRotation: 90, minRotation: 45 }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: "Pass Rating" }
        }
      }
    }
  });
}

