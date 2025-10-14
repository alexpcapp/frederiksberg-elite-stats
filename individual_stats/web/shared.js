document.addEventListener("DOMContentLoaded", function() {
  const nav = document.createElement("div");
  nav.classList.add("navbar");
  nav.innerHTML = `
    <a href="index.html">🏆 Player Ranking</a>
    <a href="game-stats.html">🏐 Game Stats</a>
    <a href="team-trends.html">📊 Team Trends</a>
  `;
  // <a href="players.html">👤 Players</a>

  document.body.prepend(nav);
});
