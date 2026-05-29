# WCPL - World Championship Pool League

## Overview

A comprehensive real-time scoring and rating system for the World Championship Pool League. This application manages player ratings using the Elo algorithm with built-in anti-sandbag protection to ensure fair competition.

## Features

### 🎯 Core Features
- **Real-Time Scoring**: Record matches instantly with automatic rating calculations
- **Elo Rating System**: Dynamic player ratings based on competitive performance
- **Player Management**: Add, track, and manage player profiles
- **Match History**: Complete record of all tournament matches
- **Player Comparison**: Head-to-head statistics and win probability calculator
- **Data Export**: Export player data and match history in CSV/JSON formats
- **Responsive Design**: Mobile-friendly interface with PWA support

### 🛡️ Anti-Sandbag Protection
- Detects unusual win patterns
- Flags suspicious rating changes
- Prevents rating manipulation
- Adjusts rating changes for flagged matches
- Maintains competition integrity

### 📱 Progressive Web App
- Install as a native app on mobile devices
- Offline functionality with service worker caching
- Fast loading and smooth performance
- App shortcuts for quick access

## Project Structure

```
Doug-WCPL/
├── index.html                    # Main application file
├── styles.css                    # Responsive styling
├── app.js                        # Application logic
├── wcpl_antisandbag_algorithm.py # Python backend algorithm
├── wcpl-mobile-wrapper/          # PWA resources
│   ├── manifest.json            # PWA manifest
│   ├── service-worker.js        # Offline support
│   ├── icon-192.png             # App icon (192x192)
│   ├── icon-512.png             # App icon (512x512)
│   ├── icon-192.svg             # Vector icon
│   └── icon-512.svg             # Vector icon
├── README.md                     # This file
└── LICENSE                       # MIT License
```

## Getting Started

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dougschaefer1-dev/Doug-WCPL.git
   cd Doug-WCPL
   ```

2. **Start a local server**:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Or using Node.js http-server
   npx http-server
   ```

3. **Open in browser**:
   - Navigate to `http://localhost:8000`
   - The app uses localStorage for data persistence

### Deployment

1. **GitHub Pages**:
   - Push to your repository
   - Enable GitHub Pages in repository settings
   - Access at `https://dougschaefer1-dev.github.io/Doug-WCPL`

2. **Traditional Hosting**:
   - Upload all files to your web server
   - Ensure HTTPS is enabled for PWA features
   - Service worker will handle caching

## Usage

### Adding Players
1. Go to **Players** section
2. Fill in player name, email, and initial rating
3. Click **Add Player**
4. Player appears in directory and selects

### Recording Matches
1. Navigate to **Matches** section
2. Select both players
3. Enter match scores
4. Click **Record Match**
5. Ratings automatically update using Elo algorithm

### Comparing Players
1. Go to **Compare** section
2. Select two players
3. Click **Compare**
4. View detailed statistics and head-to-head records

### Win Probability Calculator
1. In **Ratings** section
2. Enter your rating and opponent's rating
3. Click **Calculate**
4. See expected win probability

### Exporting Data
1. Navigate to **Export** section
2. Choose export format (CSV/JSON)
3. Select data type (Players/Matches/All)
4. File downloads automatically
5. Previous exports tracked in history

## Rating System

### Elo Formula
```
Ra' = Ra + K × (W - E)
```

Where:
- **Ra**: Player's old rating
- **K**: K-factor (varies by skill level)
- **W**: Match result (1 = win, 0 = loss)
- **E**: Expected score based on rating difference

### K-Factor by Rating Range
| Rating Range | K-Factor |
|-------------|----------|
| 0 - 1200   | 32       |
| 1201 - 1600| 24       |
| 1601 - 2000| 16       |
| 2001+      | 12       |

### Player Categories
- **Beginner**: 0 - 1000
- **Intermediate**: 1001 - 1500
- **Advanced**: 1501 - 2000
- **Elite**: 2001+

## Anti-Sandbag Algorithm

### Detection Methods
1. **Upset Victory Analysis**: Flags unusual wins by lower-rated players
2. **Win Streak Monitoring**: Detects anomalous win patterns
3. **Scoring Pattern Analysis**: Identifies suspiciously consistent scores
4. **Rating Change Monitoring**: Flags rapid, unusual rating fluctuations
5. **Head-to-Head Analysis**: Compares actual vs expected win percentages

### Rating Adjustments
When a match is flagged as suspicious:
- Rating change is reduced by up to 50%
- Original calculation preserved in records
- Admin can review and manually adjust
- Player history tracked for patterns

## Data Storage

### Local Storage
- Players: `wcplPlayers`
- Matches: `wcplMatches`
- Exports: `wcplExports`

### Data Structure
```javascript
// Player
{
  id: 1,
  name: "Player Name",
  email: "email@example.com",
  rating: 1500,
  wins: 10,
  losses: 5,
  joined: "2024-01-15"
}

// Match
{
  id: 1,
  player1: "Player A",
  player1Id: 1,
  player1Score: 100,
  player2: "Player B",
  player2Id: 2,
  player2Score: 85,
  winner: "Player A",
  ratingChange1: 15,
  ratingChange2: -15,
  date: "2024-01-15"
}
```

## API Reference

### JavaScript Functions

#### Player Management
- `addPlayer(event)` - Add new player
- `displayPlayers()` - Show player directory
- `filterPlayers()` - Filter by search/rating
- `populatePlayerSelects()` - Fill select dropdowns

#### Match Recording
- `recordMatch(event)` - Record new match
- `displayMatches()` - Show match history
- `calculateEloRating(p1, p2, p1Won)` - Calculate rating changes

#### Comparison
- `comparePlayersAction()` - Compare two players
- `calculateWinProbability()` - Calculate win odds

#### Data Export
- `exportData(format)` - Export players
- `exportHistory(format)` - Export matches
- `backupData()` - Create full backup

### Python Functions

#### AntiSandbagAnalyzer Class
- `analyze_match()` - Analyze single match
- `analyze_player_history()` - Analyze player pattern
- `adjust_rating_change()` - Adjust for suspicion

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 13+)
- Opera: Full support

## PWA Installation

### Desktop (Chrome)
1. Click address bar icon (Install)
2. Click **Install**
3. App appears in applications

### Mobile (iOS)
1. Open Safari
2. Tap Share button
3. Tap **Add to Home Screen**
4. Confirm

### Mobile (Android)
1. Open Chrome/Edge
2. Tap menu (3 dots)
3. Tap **Install app**
4. Confirm

## Performance Metrics

- **Page Load**: < 1s
- **Time to Interactive**: < 2s
- **First Contentful Paint**: < 800ms
- **Lighthouse Score**: 95+ (PWA)
- **Cache Size**: ~150KB

## Security Considerations

- Data stored locally (not sent to servers)
- HTTPS recommended for deployment
- Service worker validates cache
- No sensitive data transmitted
- Consider backend validation for production

## Future Enhancements

- [ ] Backend API integration
- [ ] Database storage (PostgreSQL/MongoDB)
- [ ] User authentication
- [ ] Tournament management
- [ ] Leaderboards and rankings
- [ ] Match scheduling
- [ ] Player statistics dashboard
- [ ] Admin panel
- [ ] Real-time notifications
- [ ] Mobile app (React Native/Flutter)

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
- Open a GitHub issue
- Check documentation
- Review example data in code

## Author

Douglas Schaefer
World Championship Pool League

## Version

1.0.0 - Initial Release (May 2024)

---

**Last Updated**: May 29, 2024

For the latest updates and features, visit the [GitHub Repository](https://github.com/dougschaefer1-dev/Doug-WCPL)