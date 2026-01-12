const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const WICKETKEEPERS = new Set([
  "MS Dhoni","Rishabh Pant","KL Rahul","Sanju Samson","Ishan Kishan",
  "Jos Buttler","Nicholas Pooran","Quinton de Kock","Jonny Bairstow",
  "Jitesh Sharma","Phil Salt","Josh Inglis","Ryan Rickelton",
  "Devon Conway","Rahmanullah Gurbaz","Tim Seifert","Kusal Mendis",
  "Kusal Perera","Tom Latham","Kyle Verreynne","Alex Carey",
  "Sam Billings","Jordan Cox","Ben McDermott","Josh Philippe",
  "Narayan Jagadeesan","Hardik Tamore","Abishek Porel","Dhruv Jurel",
  "Prabhsimran Singh","Vishnu Vinod","Upendra Yadav","Anuj Rawat",
  "Luvnith Sisodia","Robin Minz","Srikar Bharat","Donovan Ferreira",
  "Harvik Desai","BR Sharath","Krishnan Shrijith","Aravelly Avanish"
]);

const INPUT = path.join(__dirname, "../data/raw/ipl_2025_auction_players.csv");
const OUTPUT = path.join(__dirname, "../data/reference/players_2025.json");

const players = [];
const roleStats = { BAT: 0, BOWL: 0, AR: 0, WK: 0 };
const teams = new Set();

fs.createReadStream(INPUT)
  .pipe(csv())
  .on("data", row => {
    if (!row.Players) return;

    const name = row.Players.trim();
    const team = row.Team && row.Team !== "-" ? row.Team.trim() : null;
    const basePrice = row.Base !== "-" ? Number(row.Base) : 0;
    const soldPrice = row.Sold !== "-" ? Number(row.Sold) : 0;

    const role = WICKETKEEPERS.has(name)
      ? "WK"
      : (row.Type || "UNKNOWN").trim();

    if (roleStats[role] !== undefined) roleStats[role]++;

    players.push({
      id: `${name}-${team || "POOL"}`.replace(/\s+/g, "_"),
      name,
      role,
      team,
      basePrice,
      soldPrice,
      sold: soldPrice > 0,
      soldTo: soldPrice > 0 ? team : null
    });

    if (team) teams.add(team);
  })
  .on("end", () => {
    fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });

    fs.writeFileSync(
      OUTPUT,
      JSON.stringify({
        season: "IPL 2025",
        players,
        stats: {
          totalPlayers: players.length,
          ...roleStats,
          teams: teams.size
        }
      }, null, 2)
    );

    console.log("✅ 2025 DATA BUILD COMPLETE");
    console.log("Total:", players.length);
    console.log(roleStats);
    console.log("Teams:", teams.size);
  });
