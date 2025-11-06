// === References to HTML elements ===
const tabButtons = document.querySelectorAll(".tab-button");
const statSelect = document.getElementById("statSelect");       // Stat dropdown
const playerSelect = document.getElementById("playerSelect");   // Player dropdown
const playerLabel = document.getElementById("playerLabel");     // Player label
const table = document.getElementById("trendTable");
const ctx = document.getElementById("passChart").getContext("2d");

let chart;
let currentData = [];
let currentStat = "Pass_Rating";   // Default stat
let currentType = "team";          // Default to team stats
let currentPlayer = null;

// === Available stats to choose from ===
const availableStats = [
  { key: "Pass_Rating", label: "Pass Rating" },
  { key: "First_Ball_Side_Out_%", label: "1st Ball Side-Out %" },
  { key: "Serve_Rating", label: "Serve Rating" },
  { key: "Ace_%", label: "Ace %" },
  { key: "Points_Won_on_Serve_%", label: "Points Won on Serve %" },
  { key: "Serve_Error_%", label: "Serve Error %" },
  { key: "Kill_%", label: "Kill %" },
  { key: "Hitting_Efficiency", label: "Hitting Efficiency" },
  { key: "Attack_Errors/Set", label: "Attack Errors/Set" },
  { key: "Blocks/Set", label: "Blocks/Set" },
  { key: "Digs/Set", label: "Digs/Set" }
];

// === Populate stat dropdown ===
function populateStatDropdown() {
  statSelect.innerHTML = "";
  availableStats.forEach(stat => {
    const option = document.createElement("option");
    option.value = stat.key;
    option.textContent = stat.label;
    statSelect.appendChild(option);
  });
  statSelect.value = currentStat;
}

// === Helper: clean numeric strings and percentages ===
function cleanValue(value) {
  if (typeof value === "string") {
    value = value.trim().replace("%", "");
  }
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

// === Populate player dropdown (only for player stats) ===
function populatePlayerDropdown(data) {
  const players = [...new Set(data.map(g => g.Player_Name))]; // assumes JSON has "player_name"
  playerSelect.innerHTML = "";
  players.forEach(p => {
    const option = document.createElement("option");
    option.value = p;
    option.textContent = p;
    playerSelect.appendChild(option);
  });
  currentPlayer = players[0];
  playerSelect.value = currentPlayer;
}

// === Update chart for selected player ===
function updateChartForPlayer() {
  if (!currentPlayer) return;
  const playerGames = currentData.filter(g => g.Player_Name === currentPlayer);
  createStatChart(playerGames, currentStat);
}

// === Handle stat selection change ===
statSelect.addEventListener("change", () => {
  currentStat = statSelect.value;
  if (currentType === "player") {
    updateChartForPlayer();
  } else {
    createStatChart(currentData, currentStat);
  }
});

// === Handle player selection change ===
playerSelect.addEventListener("change", () => {
  currentPlayer = playerSelect.value;
  updateChartForPlayer();
});

// === Handle tab clicks (Team / Player) ===
tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    tabButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const type = btn.dataset.stat;
    currentType = type;

    if (type === "player") {
      playerSelect.style.display = "inline-block";
      playerLabel.style.display = "inline-block";
    } else {
      playerSelect.style.display = "none";
      playerLabel.style.display = "none";
      currentPlayer = null;
    }

    loadData(type);
  });
});

// === Load data for team or player ===
function loadData(type = "team") {
  const path = type === "player"
    ? "../per_game_player_stat.json"
    : "../per_game_team_stat.json";

  fetch(path)
    .then(resp => resp.json())
    .then(data => {
      // Clean data
      currentData = data.map(game => {
        const cleaned = { ...game, date: new Date(game.date) };
        for (const key in cleaned) {
          if (key !== "opponent" && key !== "season" && key !== "kampnr" && key !== "date" && key !== "Player_Name") {
            cleaned[key] = cleanValue(cleaned[key]);
          }
        }
        return cleaned;
      }).sort((a, b) => a.date - b.date);

      // Update chart
      if (type === "player") {
        populatePlayerDropdown(currentData);
        updateChartForPlayer();
      } else {
        createStatChart(currentData, currentStat);
      }

      clearTable();
    })
    .catch(err => console.error("Error loading data:", err));
}

// === Create chart dynamically ===
function createStatChart(data, statKey) {
  if (chart) chart.destroy();

  const filtered = data.filter(d => d[statKey] !== undefined && d[statKey] !== null);
  filtered.sort((a, b) => a.date - b.date);

  const labels = filtered.map(g => g.opponent);
  const values = filtered.map(g => g[statKey]);
  const statLabel = availableStats.find(s => s.key === statKey)?.label || statKey;

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: (currentType === "player" ? "Player " : "Team ") + statLabel,
        data: values,
        borderColor: currentType === "player" ? "#E07A5F" : "#0047ab",
        backgroundColor: currentType === "player" ? "#E07A5F" : "#0047ab",
        pointRadius: 2,
        tension: 0.3,
        fill: false,
        borderWidth: 1.2
      }]
    },
    options: {
      plugins: {
        legend: { display: true },
        tooltip: { mode: "index", intersect: false }
      },
      scales: {
        x: {
          title: { display: true, text: "Opponent" },
          ticks: { autoSkip: false, maxRotation: 90, minRotation: 45 }
        },
        y: {
          beginAtZero: true,
          title: { display: true, text: statLabel }
        }
      }
    }
  });
}

// === Clear table helper (optional) ===
function clearTable() {
  table.querySelector("thead tr").innerHTML = "";
  table.querySelector("tbody").innerHTML = "";
}

// === Initial setup ===
populateStatDropdown();
playerSelect.style.display = "none";
playerLabel.style.display = "none";
loadData("team");
