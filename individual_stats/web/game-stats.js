// === References to HTML elements ===
const matchSelect = document.getElementById("matchSelect");

let allData = [];
let playerTable = null;

// === Define themes and their columns/players ===
const themes = [

  { 
    id: "hitting", 
    label: "Hitting", 
    columns: ["Player_Name", "Kills", "Kill_%", "Kills/Game"],
    players: ["Hjorth", "Anton", "Martin", "Boerme", "Mikkel", "Nico Lang", "Frederik", "Nicola", "Kristian", "Ando", "Malthe", "Gustav", "Bo", "Alex"] 
  },
  
  { 
    id: "serving", 
    label: "Serving", 
    columns: ["Player_Name", "Aces", "Serve_Errors", "Serve_Rating"], 
    players: ["Martin", "Hjorth", "Bosse", "Alex", "Kristian", "Jonas", "Gustav", "Bo", "Ando", "Boerme", "Anton", "Lasse", "Malthe", "Bo"] 
  },
  { 
    id: "passing", 
    label: "Passing", 
    columns: ["Player_Name", "Pass_Rating", "3-pass_Percent", "Total_Pass_Error_%"], 
    players: ["Alex", "Anton", "Boerme", "Hjorth", "Malthe", "Nicola", "Bosse", "Bo"] 
  },
  { 
    id: "defence", 
    label: "Defence", 
    columns: ["Player_Name", "Digs", "Digs/Game"], 
    players: ["Alex", "Lasse", "Anton", "Boerme", "Hjorth", "Nicola", "Bosse", "Martin", "Mikkel", "Ando", "Malthe", "Gustav", "Ando", "Kristian", "Bo"] // Add the players you want to show for defence
  }
];

// === Helper: clean numeric strings ===
function cleanValue(value) {
  if (typeof value === "string") value = value.trim().replace("%", "");
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

// === Column formatting & label mapping ===
const columnFormatters = {
  // Labels
  "Player_Name": { label: "Player" },
  "Serve_Errors": { label: "Serve Errors" },
  "Pass_Rating": { label: "Pass Rating" },
  
  // Formatters
  "Kill_%": { label: "Kill %", format: val => val != null ? val.toFixed(1) + "%" : "" },
  "3-pass_Percent": { label: "3-pass %", format: val => val != null ? val.toFixed(1) + "%" : "" },
  "Total_Pass_Error_%": { label: "Total Pass Error %", format: val => val != null ? val.toFixed(1) + "%" : "" },
  "Serve_Rating": { label: "Serve Rating", format: val => val != null ? val.toFixed(2) : "" },
  "Pass_Rating": { label: "Pass Rating", format: val => val != null ? val.toFixed(2) : "" },
  "Digs": { label: "Digs", format: val => val != null ? val.toString() : "" },
  "Kills/Game": { label: "Kills / Set", format: val => val != null ? val.toFixed(2) : "" },
  "Digs/Game": { label: "Digs / Set", format: val => val != null ? val.toFixed(2) : "" },
};

// === Format match label ===
function formatMatchLabel(date, opponent) {
  let formattedDate = "Unknown date";
  if (typeof date === "number") {
    formattedDate = new Date(date).toISOString().split("T")[0];
  } else if (!isNaN(Date.parse(date))) {
    formattedDate = new Date(date).toISOString().split("T")[0];
  } else {
    formattedDate = date;
  }
  return `${formattedDate} – ${opponent}`;
}

// === Populate match selector ===
function populateMatchDropdown(data) {
  const matchesMap = new Map();
  data.forEach(game => {
    if (!matchesMap.has(game.kampnr)) {
      matchesMap.set(game.kampnr, { date: game.date, opponent: game.opponent });
    }
  });

  const matches = Array.from(matchesMap.entries())
    .map(([kampnr, info]) => ({ kampnr, ...info }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  matchSelect.innerHTML = "";
  matches.forEach(match => {
    const option = document.createElement("option");
    option.value = match.kampnr;
    option.textContent = formatMatchLabel(match.date, match.opponent);
    matchSelect.appendChild(option);
  });

  if (matches.length > 0) matchSelect.value = matches[0].kampnr;
}

// === Create theme tabs dynamically ===
function createThemeTabs() {
  const tabContainer = document.createElement("div");
  tabContainer.classList.add("theme-tabs");

  tabContainer.innerHTML = themes
    .map((t, i) => `
      <button class="theme-tab ${i === 0 ? "active" : ""}" data-theme="${t.id}">
        ${t.label}
      </button>
    `)
    .join("");

  const summary = document.getElementById("summaryTable");
  if (summary) summary.insertAdjacentElement("afterend", tabContainer);
  else document.body.appendChild(tabContainer);

  // Handle tab clicks
  tabContainer.querySelectorAll(".theme-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      tabContainer.querySelectorAll(".theme-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      updatePlayerTable(); // rebuild table with new theme
    });
  });
}

// === Populate summary table ===
const passers = ["Alex", "Bosse", "Boerme", "Hjorth", "Anton", "Nicola", "Nico Lang", "Vestbjerg"];

function populateSummaryTable(matchId) {
  const matchPlayers = allData.filter(d => d.kampnr == matchId);
  const tbody = document.querySelector("#summaryTable tbody");
  tbody.innerHTML = "";

  const categories = [
    { key: "Total_Earned", label: "Top Scorer" },
    { key: "Pass_Rating", label: "Best Pass Rating", onlyPassers: true },
    { key: "Blocks", label: "Most Blocks" },
    { key: "Serve_Rating", label: "Best Serve Rating" },
    { key: "Digs", label: "Most Digs" },
  ];


  categories.forEach(cat => {
    let bestPlayer = null;
    let bestValue = -Infinity;

    const playersToConsider = cat.onlyPassers
      ? matchPlayers.filter(p => passers.includes(p.Player_Name))
      : matchPlayers;

    playersToConsider.forEach(player => {
      const val = player[cat.key];
      if (val !== null && val !== undefined && val > bestValue) {
        bestValue = val;
        bestPlayer = player.Player_Name;
      }
    });

    let formattedValue = bestValue !== -Infinity ? bestValue : "-";
    if (cat.key === "Serve_Rating" || cat.key === "Pass_Rating") {
      formattedValue = bestValue !== -Infinity ? bestValue.toFixed(2) : "-";
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${cat.label}</td><td>${bestPlayer ?? "-"}</td><td>${formattedValue}</td>`;
    tbody.appendChild(tr);
  });
}

function updatePlayerTable() {
  const selectedMatch = matchSelect.value;
  if (!selectedMatch) return;

  const activeTab = document.querySelector(".theme-tab.active")?.dataset.theme || themes[0].id;
  const theme = themes.find(t => t.id === activeTab);
  if (!theme) return;

  const matchPlayers = allData.filter(d => {
    // First check if player is in the theme's player list and in selected match
    if (d.kampnr != selectedMatch || !theme.players.includes(d.Player_Name)) {
      return false;
    }
    
    // Check if player has any actual data in the theme's columns (excluding Player_Name)
    const dataColumns = theme.columns.filter(col => col !== "Player_Name");
    const hasData = dataColumns.some(col => {
      const val = d[col];
      return val !== null && val !== undefined && val !== "" && val !== 0;
    });
    
    return hasData;
  });

  const tableData = matchPlayers.map(player => {
    return theme.columns.map(col => {
      let val = player[col];
      if (typeof val === "string") val = val.trim();

      if (columnFormatters[col]?.format) {
        val = columnFormatters[col].format(val);
      }

      return val ?? "";
    });
  });

  // Destroy previous table if exists
  if (playerTable) {
    playerTable.destroy();
    playerTable = null;
  }

  // Clear the table body
  const tbody = document.querySelector("#playerTable tbody");
  if (tbody) tbody.innerHTML = "";

  // Build table headers
  const thead = document.querySelector("#playerTable thead tr");
  thead.innerHTML = "";
  theme.columns.forEach(col => {
    const th = document.createElement("th");
    th.textContent = columnFormatters[col]?.label || col;
    thead.appendChild(th);
  });

  // Initialize DataTable
  playerTable = $("#playerTable").DataTable({
    data: tableData,
    columns: theme.columns.map(col => ({
      title: columnFormatters[col]?.label || col
    })),
    paging: false,
    searching: false,
    info: false,
    order: [[1, 'desc']]
  });
}

// === Event listener for match selection ===
matchSelect.addEventListener("change", () => {
  updatePlayerTable();
  populateSummaryTable(matchSelect.value);
});

// === Load JSON and initialize everything ===
fetch("../per_game_player_stat.json")
  .then(resp => resp.json())
  .then(data => {
    allData = data.map(d => {
      const cleaned = { ...d };
      for (const key in cleaned) {
        if (!["kampnr", "opponent", "Player_Name", "date"].includes(key)) {
          cleaned[key] = cleanValue(cleaned[key]);
        }
      }
      return cleaned;
    });

    populateMatchDropdown(allData);
    createThemeTabs();

    if (allData.length > 0) {
      const firstOption = matchSelect.options[0].value;
      matchSelect.value = firstOption;
      updatePlayerTable();
      populateSummaryTable(firstOption);
    }
  })
  .catch(err => {
    console.error("❌ Error loading JSON:", err);
    matchSelect.innerHTML = "<option>Error loading data</option>";
  });
