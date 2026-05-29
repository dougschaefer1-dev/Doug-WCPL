#!/usr/bin/env python3
"""
WCPL Anti-Sandbag Algorithm

Detects and prevents rating manipulation through unusual win patterns.
Sandbag: When a higher-rated player intentionally loses to gain unfair advantages.
"""

import json
from datetime import datetime
from typing import Dict, List, Tuple
import math

class AntiSandbagAnalyzer:
    """Analyzes match results for suspicious patterns."""
    
    def __init__(self, sensitivity: float = 1.0):
        """
        Initialize the analyzer.
        
        Args:
            sensitivity: Detection sensitivity (0.5-2.0, higher = more strict)
        """
        self.sensitivity = sensitivity
        self.suspicious_matches = []
        self.warnings = []
    
    def calculate_expected_score(self, rating_diff: int) -> float:
        """
        Calculate expected win probability using Elo formula.
        
        Args:
            rating_diff: Difference between higher and lower rating
            
        Returns:
            Expected score (0-1)
        """
        return 1 / (1 + math.pow(10, rating_diff / 400))
    
    def analyze_match(self, player1: Dict, player2: Dict, 
                      player1_won: bool, match_date: str) -> Dict:
        """
        Analyze a single match for suspicious activity.
        
        Args:
            player1: Player 1 stats (rating, recent_matches, etc)
            player2: Player 2 stats
            player1_won: Whether player 1 won
            match_date: Date of match
            
        Returns:
            Analysis results with suspicion score
        """
        rating_diff = abs(player1['rating'] - player2['rating'])
        higher_rated = player1 if player1['rating'] > player2['rating'] else player2
        lower_rated = player2 if player1['rating'] > player2['rating'] else player1
        higher_won = (player1_won and player1['rating'] > player2['rating']) or \
                     (not player1_won and player2['rating'] > player1['rating'])
        
        suspicion_score = 0.0
        flags = []
        
        # Flag 1: Upset victory by much lower rated player
        if not higher_won and rating_diff > 300:
            upset_severity = min(1.0, (rating_diff - 300) / 500)
            suspicion_score += upset_severity * self.sensitivity * 0.4
            flags.append(f"Upset victory (lower rated won by {rating_diff} points)")
        
        # Flag 2: Unusual win streak for lower-rated player
        if hasattr(lower_rated, 'recent_matches') and len(lower_rated['recent_matches']) > 0:
            recent_wins = sum(1 for m in lower_rated['recent_matches'][-10:] if m['won'])
            if recent_wins > 7:
                suspicion_score += 0.15 * self.sensitivity
                flags.append(f"Win streak: {recent_wins}/10 recent matches")
        
        # Flag 3: Score pattern analysis
        if 'scores' in player1 and len(player1['scores']) > 5:
            recent_scores = player1['scores'][-10:]
            avg_score = sum(recent_scores) / len(recent_scores)
            std_dev = math.sqrt(sum((x - avg_score) ** 2 for x in recent_scores) / len(recent_scores))
            
            if std_dev < 2:  # Suspiciously consistent scoring
                suspicion_score += 0.1 * self.sensitivity
                flags.append("Suspiciously consistent scoring pattern")
        
        # Flag 4: Rapid rating changes
        if hasattr(higher_rated, 'rating_history') and len(higher_rated['rating_history']) > 5:
            recent_changes = [higher_rated['rating_history'][i] - higher_rated['rating_history'][i-1] 
                             for i in range(-5, 0)]
            avg_change = sum(recent_changes) / len(recent_changes)
            if higher_rated['rating_history'][-1] - higher_rated['rating_history'][-6] > 200:
                suspicion_score += 0.1 * self.sensitivity
                flags.append("Unusual rating fluctuation")
        
        # Flag 5: Head-to-head pattern
        if 'h2h_record' in player1:
            total_matches = player1['h2h_record'].get('wins', 0) + player1['h2h_record'].get('losses', 0)
            if total_matches > 5:
                win_pct = player1['h2h_record']['wins'] / total_matches
                expected_win = self.calculate_expected_score(player1['rating'] - player2['rating'])
                
                # If actual win % deviates significantly from expected
                if abs(win_pct - expected_win) > 0.3:
                    suspicion_score += 0.2 * self.sensitivity
                    flags.append(f"Unusual head-to-head pattern (actual: {win_pct:.1%} vs expected: {expected_win:.1%})")
        
        return {
            'suspicion_score': min(1.0, suspicion_score),
            'is_suspicious': suspicion_score > (0.5 * self.sensitivity),
            'flags': flags,
            'recommendation': self._get_recommendation(suspicion_score),
            'match_date': match_date
        }
    
    def _get_recommendation(self, score: float) -> str:
        """
        Get recommendation based on suspicion score.
        
        Args:
            score: Suspicion score (0-1)
            
        Returns:
            Recommendation string
        """
        if score < 0.2:
            return "APPROVE: Normal match"
        elif score < 0.4:
            return "REVIEW: Minor concerns"
        elif score < 0.6:
            return "FLAG: Moderate suspicion"
        elif score < 0.8:
            return "INVESTIGATE: High suspicion"
        else:
            return "REJECT: Very high suspicion"
    
    def adjust_rating_change(self, base_change: float, 
                            analysis: Dict) -> float:
        """
        Adjust rating change based on analysis.
        
        Args:
            base_change: Base Elo rating change
            analysis: Match analysis results
            
        Returns:
            Adjusted rating change
        """
        suspicion = analysis['suspicion_score']
        
        # Reduce rating change for suspicious matches
        # 50% reduction at high suspicion
        adjustment_factor = 1 - (suspicion * 0.5)
        
        return base_change * adjustment_factor
    
    def analyze_player_history(self, player: Dict, 
                               matches: List[Dict]) -> Dict:
        """
        Analyze player's entire match history.
        
        Args:
            player: Player stats
            matches: List of matches player participated in
            
        Returns:
            Overall player analysis
        """
        total_suspicion = 0
        suspicious_count = 0
        
        for match in matches:
            suspicion = self.analyze_match(
                player,
                match['opponent'],
                match['won'],
                match['date']
            )['suspicion_score']
            
            total_suspicion += suspicion
            if suspicion > 0.5:
                suspicious_count += 1
        
        avg_suspicion = total_suspicion / len(matches) if matches else 0
        
        return {
            'player_id': player.get('id'),
            'average_suspicion': avg_suspicion,
            'suspicious_matches': suspicious_count,
            'total_matches': len(matches),
            'risk_level': 'HIGH' if avg_suspicion > 0.5 else 'MEDIUM' if avg_suspicion > 0.3 else 'LOW'
        }


def main():
    """Example usage of the anti-sandbag algorithm."""
    
    # Initialize analyzer
    analyzer = AntiSandbagAnalyzer(sensitivity=1.2)
    
    # Example match data
    player_a = {
        'id': 1,
        'name': 'High Rated Player',
        'rating': 2000,
        'recent_matches': [],
        'scores': [85, 84, 86, 85, 87, 85, 86, 84, 85, 86]
    }
    
    player_b = {
        'id': 2,
        'name': 'Low Rated Player',
        'rating': 1400,
        'recent_matches': []
    }
    
    # Analyze the match
    result = analyzer.analyze_match(
        player_a,
        player_b,
        player1_won=False,  # Lower rated player won (upset)
        match_date=datetime.now().isoformat()
    )
    
    print("\n=== WCPL Anti-Sandbag Analysis ===")
    print(f"Suspicion Score: {result['suspicion_score']:.2%}")
    print(f"Is Suspicious: {result['is_suspicious']}")
    print(f"Recommendation: {result['recommendation']}")
    print("\nFlags:")
    for flag in result['flags']:
        print(f"  - {flag}")
    
    # Example rating adjustment
    base_change = 32  # Example base Elo change
    adjusted = analyzer.adjust_rating_change(base_change, result)
    print(f"\nRating Change Adjustment:")
    print(f"  Base: +{base_change}")
    print(f"  Adjusted: +{adjusted:.1f}")
    print(f"  Reduction: -{base_change - adjusted:.1f}")


if __name__ == '__main__':
    main()