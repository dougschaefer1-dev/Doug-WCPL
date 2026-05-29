// WCPL Application JavaScript

// Data Storage
let players = JSON.parse(localStorage.getItem('wcplPlayers')) || [];
let matches = JSON.parse(localStorage.getItem('wcplMatches')) || [];
let exports_history = JSON.parse(localStorage.getItem('wcplExports')) || [];

// Initialize Application
function initApp() {
    loadSampleData();
    populatePlayerSelects();
    displayTopPlayers();
    updateDashboard();
    setupEventListeners();
    registerServiceWorker();
}

// Register Service Worker for PWA
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('wcpl-mobile-wrapper/service-worker.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed'));
    }
}

// Load Sample Data
function loadSampleData() {
    if (players.length === 0) {
        const samplePlayers = [
            { id: 1, name: 'Alex Champion', email: 'alex@wcpl.com', rating: 2150, wins: 45, losses: 5, joined: '2023-01-15' },
            { id: 2, name: 'Jordan Pro', email: 'jordan@wcpl.com', rating: 2050, wins: 42, losses: 8, joined: '2023-02-20' },
            { id: 3, name: 'Sam Thunder', email: 'sam@wcpl.com', rating: 1950, wins: 40, losses: 12, joined: '2023-03-10' },
            { id: 4, name: 'Casey Strike', email: 'casey@wcpl.com', rating: 1850, wins: 35, losses: 15, joined: '2023-04-05' },
            { id: 5, name: 'Morgan Elite', email: 'morgan@wcpl.com', rating: 1750, wins: 32, losses: 18, joined: '2023-05-12' },
            { id: 6, name: 'Taylor Victory', email: 'taylor@wcpl.com', rating: 1650, wins: 28, losses: 22, joined: '2023-06-18' },
            { id: 7, name: 'Riley Power', email: 'riley@wcpl.com', rating: 1550, wins: 25, losses: 25, joined: '2023-07-22' },
            { id: 8, name: 'Blake Steady', email: 'blake@wcpl.com', rating: 1450, wins: 22, losses: 28, joined: '2023-08-30' },
            { id: 9, name: 'Quinn Rising', email: 'quinn@wcpl.com', rating: 1350, wins: 18, losses: 32, joined: '2023-09-14' },
            { id: 10, name: 'Dakota Keen', email: 'dakota@wcpl.com', rating: 1250, wins: 15, losses: 35, joined: '2023-10-25' }
        ];
        players = samplePlayers;
        saveData();
    }
}

// Setup Event Listeners
function setupEventListeners() {
    const searchInput = document.getElementById('playerSearch');
    const filterSelect = document.getElementById('ratingFilter');

    if (searchInput) {
        searchInput.addEventListener('input', filterPlayers);
    }
    if (filterSelect) {
        filterSelect.addEventListener('change', filterPlayers);
    }
}

// Display Section
function showSection(sectionId) {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.classList.remove('active'));
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
        
        // Load section-specific data
        if (sectionId === 'players') {
            displayPlayers();
        } else if (sectionId === 'matches') {
            displayMatches();
            populateMatchForm();
        } else if (sectionId === 'compare') {
            populateCompareSelects();
        } else if (sectionId === 'export') {
            displayExportHistory();
        }
    }
}

// Dashboard Functions
function updateDashboard() {
    const totalPlayersElem = document.getElementById('totalPlayers');
    const avgRatingElem = document.getElementById('avgRating');

    if (totalPlayersElem) {
        totalPlayersElem.textContent = players.length;
    }

    if (avgRatingElem && players.length > 0) {
        const avgRating = Math.round(
            players.reduce((sum, p) => sum + p.rating, 0) / players.length
        );
        avgRatingElem.textContent = avgRating;
    }
}

function displayTopPlayers() {
    const tableBody = document.getElementById('topPlayersTable');
    if (!tableBody) return;

    const topPlayers = players
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 10);

    tableBody.innerHTML = topPlayers.map((player, index) => {
        const winPct = player.wins + player.losses > 0 
            ? ((player.wins / (player.wins + player.losses)) * 100).toFixed(1) 
            : 0;
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${player.name}</td>
                <td>${player.rating}</td>
                <td>${player.wins}</td>
                <td>${player.losses}</td>
                <td>${winPct}%</td>
            </tr>
        `;
    }).join('');
}

// Player Management
function addPlayer(event) {
    event.preventDefault();
    
    const name = document.getElementById('playerName').value;
    const email = document.getElementById('playerEmail').value;
    const initialRating = parseInt(document.getElementById('initialRating').value);

    const newPlayer = {
        id: players.length + 1,
        name,
        email,
        rating: initialRating,
        wins: 0,
        losses: 0,
        joined: new Date().toISOString().split('T')[0]
    };

    players.push(newPlayer);
    saveData();
    
    document.getElementById('playerForm').reset();
    displayPlayers();
    populatePlayerSelects();
    updateDashboard();
    
    alert(`Player ${name} added successfully!`);
}

function displayPlayers() {
    const tableBody = document.getElementById('playersTable');
    if (!tableBody) return;

    const displayPlayers = getFilteredPlayers();

    tableBody.innerHTML = displayPlayers.map(player => {
        const winPct = player.wins + player.losses > 0 
            ? ((player.wins / (player.wins + player.losses)) * 100).toFixed(1) 
            : 0;
        return `
            <tr>
                <td>${player.name}</td>
                <td>${player.rating}</td>
                <td>${player.wins}</td>
                <td>${player.losses}</td>
                <td>${winPct}%</td>
                <td>${player.joined}</td>
                <td><button class="btn-secondary" onclick="viewPlayerDetails(${player.id})">View</button></td>
            </tr>
        `;
    }).join('');
}

function getFilteredPlayers() {
    const searchValue = document.getElementById('playerSearch')?.value.toLowerCase() || '';
    const filterValue = document.getElementById('ratingFilter')?.value || '';

    return players.filter(player => {
        const matchesSearch = player.name.toLowerCase().includes(searchValue);
        
        let matchesFilter = true;
        if (filterValue) {
            const rating = player.rating;
            switch (filterValue) {
                case 'beginner':
                    matchesFilter = rating <= 1000;
                    break;
                case 'intermediate':
                    matchesFilter = rating > 1000 && rating <= 1500;
                    break;
                case 'advanced':
                    matchesFilter = rating > 1500 && rating <= 2000;
                    break;
                case 'elite':
                    matchesFilter = rating > 2000;
                    break;
            }
        }
        
        return matchesSearch && matchesFilter;
    });
}

function filterPlayers() {
    displayPlayers();
}

function populatePlayerSelects() {
    const selects = [
        'player1Select', 'player2Select', 'player1', 'player2'
    ];

    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            const currentValue = select.value;
            const options = players.map(p => `<option value="${p.id}">${p.name} (${p.rating})</option>`).join('');
            select.innerHTML = `<option value="">Select a player</option>${options}`;
            if (currentValue) select.value = currentValue;
        }
    });
}

function populateCompareSelects() {
    populatePlayerSelects();
}

function populateMatchForm() {
    populatePlayerSelects();
}

function viewPlayerDetails(playerId) {
    const player = players.find(p => p.id === playerId);
    if (player) {
        alert(`Player: ${player.name}\nRating: ${player.rating}\nWins: ${player.wins}\nLosses: ${player.losses}`);
    }
}

// Match Recording
function recordMatch(event) {
    event.preventDefault();
    
    const player1Id = parseInt(document.getElementById('player1').value);
    const player2Id = parseInt(document.getElementById('player2').value);
    const player1Score = parseInt(document.getElementById('player1Score').value);
    const player2Score = parseInt(document.getElementById('player2Score').value);

    if (player1Id === player2Id) {
        alert('Players must be different!');
        return;
    }

    const player1 = players.find(p => p.id === player1Id);
    const player2 = players.find(p => p.id === player2Id);

    if (!player1 || !player2) {
        alert('Players not found!');
        return;
    }

    // Determine winner
    const player1Wins = player1Score > player2Score;
    const winner = player1Wins ? player1.name : player2.name;

    // Calculate rating changes using Elo formula
    const result = calculateEloRating(player1, player2, player1Wins);

    // Update player ratings and records
    player1.rating = Math.round(result.newRating1);
    player2.rating = Math.round(result.newRating2);

    if (player1Wins) {
        player1.wins++;
        player2.losses++;
    } else {
        player1.losses++;
        player2.wins++;
    }

    // Record match
    const match = {
        id: matches.length + 1,
        player1: player1.name,
        player1Id: player1Id,
        player1Score: player1Score,
        player2: player2.name,
        player2Id: player2Id,
        player2Score: player2Score,
        winner: winner,
        ratingChange1: Math.round(result.ratingChange1),
        ratingChange2: Math.round(result.ratingChange2),
        date: new Date().toISOString().split('T')[0]
    };

    matches.push(match);
    saveData();

    document.getElementById('matchForm').reset();
    displayMatches();
    displayTopPlayers();
    updateDashboard();
    populatePlayerSelects();

    alert(`Match recorded! ${winner} wins!\n${player1.name}: ${player1.rating} (${result.ratingChange1 > 0 ? '+' : ''}${Math.round(result.ratingChange1)})\n${player2.name}: ${player2.rating} (${result.ratingChange2 > 0 ? '+' : ''}${Math.round(result.ratingChange2)})`);
}

function displayMatches() {
    const tableBody = document.getElementById('matchesTable');
    if (!tableBody) return;

    const recentMatches = matches.slice(-10).reverse();

    tableBody.innerHTML = recentMatches.map(match => `
        <tr>
            <td>${match.player1}</td>
            <td>${match.player1Score}</td>
            <td>${match.player2}</td>
            <td>${match.player2Score}</td>
            <td>${match.winner}</td>
            <td>${match.ratingChange1 > 0 ? '+' : ''}${match.ratingChange1} / ${match.ratingChange2 > 0 ? '+' : ''}${match.ratingChange2}</td>
            <td>${match.date}</td>
        </tr>
    `).join('');
}

// Elo Rating Calculation
function calculateEloRating(player1, player2, player1Won) {
    const k1 = getKFactor(player1.rating);
    const k2 = getKFactor(player2.rating);

    const expectedScore1 = 1 / (1 + Math.pow(10, (player2.rating - player1.rating) / 400));
    const expectedScore2 = 1 / (1 + Math.pow(10, (player1.rating - player2.rating) / 400));

    const score1 = player1Won ? 1 : 0;
    const score2 = player1Won ? 0 : 1;

    const newRating1 = player1.rating + k1 * (score1 - expectedScore1);
    const newRating2 = player2.rating + k2 * (score2 - expectedScore2);

    return {
        newRating1,
        newRating2,
        ratingChange1: newRating1 - player1.rating,
        ratingChange2: newRating2 - player2.rating
    };
}

function getKFactor(rating) {
    if (rating < 1200) return 32;
    if (rating < 1600) return 24;
    if (rating < 2000) return 16;
    return 12;
}

// Comparison Functions
function comparePlayersAction() {
    const player1Id = parseInt(document.getElementById('player1Select').value);
    const player2Id = parseInt(document.getElementById('player2Select').value);

    if (!player1Id || !player2Id) {
        alert('Please select both players!');
        return;
    }

    const player1 = players.find(p => p.id === player1Id);
    const player2 = players.find(p => p.id === player2Id);

    if (!player1 || !player2) {
        alert('Players not found!');
        return;
    }

    // Display comparison
    document.getElementById('p1Name').textContent = player1.name;
    document.getElementById('p1Rating').textContent = player1.rating;
    document.getElementById('p1Wins').textContent = player1.wins;
    document.getElementById('p1Losses').textContent = player1.losses;
    document.getElementById('p1WinPct').textContent = player1.wins + player1.losses > 0
        ? ((player1.wins / (player1.wins + player1.losses)) * 100).toFixed(1) + '%'
        : '0%';
    document.getElementById('p1AvgPoints').textContent = player1.wins + player1.losses > 0
        ? ((player1.wins + player1.losses) / (player1.wins + player1.losses)).toFixed(1)
        : '0';

    document.getElementById('p2Name').textContent = player2.name;
    document.getElementById('p2Rating').textContent = player2.rating;
    document.getElementById('p2Wins').textContent = player2.wins;
    document.getElementById('p2Losses').textContent = player2.losses;
    document.getElementById('p2WinPct').textContent = player2.wins + player2.losses > 0
        ? ((player2.wins / (player2.wins + player2.losses)) * 100).toFixed(1) + '%'
        : '0%';
    document.getElementById('p2AvgPoints').textContent = player2.wins + player2.losses > 0
        ? ((player2.wins + player2.losses) / (player2.wins + player2.losses)).toFixed(1)
        : '0';

    // Head-to-head
    const h2hMatches = matches.filter(m => 
        (m.player1Id === player1Id && m.player2Id === player2Id) ||
        (m.player1Id === player2Id && m.player2Id === player1Id)
    );

    let p1H2HWins = 0;
    let p2H2HWins = 0;

    h2hMatches.forEach(m => {
        if (m.winner === player1.name) p1H2HWins++;
        else p2H2HWins++;
    });

    document.getElementById('p1H2HWins').textContent = p1H2HWins;
    document.getElementById('p1H2HName').textContent = player1.name;
    document.getElementById('p2H2HWins').textContent = p2H2HWins;
    document.getElementById('p2H2HName').textContent = player2.name;

    document.getElementById('compareResult').classList.remove('hidden');
}

// Win Probability Calculator
function calculateWinProbability() {
    const yourRating = parseInt(document.getElementById('yourRating').value);
    const oppRating = parseInt(document.getElementById('oppRating').value);

    if (isNaN(yourRating) || isNaN(oppRating)) {
        alert('Please enter valid ratings!');
        return;
    }

    const expectedScore = 1 / (1 + Math.pow(10, (oppRating - yourRating) / 400));
    const winProbability = Math.round(expectedScore * 100);

    document.getElementById('winProbValue').textContent = winProbability + '%';
    document.getElementById('winProbResult').classList.remove('hidden');
}

// Export Functions
function exportData(format) {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `wcpl_players_${timestamp}`;

    if (format === 'csv') {
        let csv = 'Name,Email,Rating,Wins,Losses,Win %,Joined\n';
        players.forEach(p => {
            const winPct = p.wins + p.losses > 0 
                ? ((p.wins / (p.wins + p.losses)) * 100).toFixed(1) 
                : 0;
            csv += `${p.name},${p.email},${p.rating},${p.wins},${p.losses},${winPct}%,${p.joined}\n`;
        });
        downloadFile(csv, `${filename}.csv`, 'text/csv');
    } else if (format === 'json') {
        const json = JSON.stringify(players, null, 2);
        downloadFile(json, `${filename}.json`, 'application/json');
    }

    addExportRecord(`Players Export (${format.toUpperCase()})`);
}

function exportHistory(format) {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `wcpl_matches_${timestamp}`;

    if (format === 'csv') {
        let csv = 'Player 1,Score 1,Player 2,Score 2,Winner,Rating Change,Date\n';
        matches.forEach(m => {
            csv += `${m.player1},${m.player1Score},${m.player2},${m.player2Score},${m.winner},${m.ratingChange1}/${m.ratingChange2},${m.date}\n`;
        });
        downloadFile(csv, `${filename}.csv`, 'text/csv');
    } else if (format === 'json') {
        const json = JSON.stringify(matches, null, 2);
        downloadFile(json, `${filename}.json`, 'application/json');
    }

    addExportRecord(`Match History Export (${format.toUpperCase()})`);
}

function backupData() {
    const backup = {
        players,
        matches,
        timestamp: new Date().toISOString()
    };
    const json = JSON.stringify(backup, null, 2);
    downloadFile(json, `wcpl_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    addExportRecord('Complete Backup');
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}

function addExportRecord(description) {
    const record = {
        id: exports_history.length + 1,
        description,
        date: new Date().toISOString()
    };
    exports_history.push(record);
    localStorage.setItem('wcplExports', JSON.stringify(exports_history));
    displayExportHistory();
}

function displayExportHistory() {
    const list = document.getElementById('exportList');
    if (!list) return;

    list.innerHTML = exports_history.slice().reverse().map(record => `
        <li>${record.description} - ${new Date(record.date).toLocaleString()}</li>
    `).join('');
}

// Data Persistence
function saveData() {
    localStorage.setItem('wcplPlayers', JSON.stringify(players));
    localStorage.setItem('wcplMatches', JSON.stringify(matches));
}

// Initialize App on Load
document.addEventListener('DOMContentLoaded', initApp);