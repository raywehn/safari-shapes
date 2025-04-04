import React from 'react';
import { cn } from '@/lib/utils';

interface RoundScore {
  round: number;
  score: number;
}

interface ScoreBoardProps {
  roundScores: RoundScore[];
  className?: string;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ roundScores, className }) => {
  // Sort scores in descending order
  const sortedScores = [...roundScores].sort((a, b) => b.score - a.score);
  
  return (
    <div className={cn('safari-card', className)}>
      <h2 className="text-xl font-bold mb-3 text-amber-900">Score History</h2>
      
      {roundScores.length === 0 ? (
        <p className="text-amber-700">No round scores yet.</p>
      ) : (
        <>
          <div className="mb-3 text-amber-700 font-medium">
            Your previous scores ranked from highest to lowest:
          </div>
          
          <div className="space-y-2">
            {sortedScores.map((score, index) => (
              <div 
                key={score.round} 
                className={cn(
                  "flex justify-between items-center p-2 rounded-md",
                  index === 0 ? "bg-amber-100 border border-amber-300" : ""
                )}
              >
                <div className="flex items-center">
                  {index === 0 && (
                    <span className="text-amber-600 mr-2">🏆</span>
                  )}
                  <span className="font-medium">Round {score.round}</span>
                </div>
                <div className="font-bold text-lg text-primary">{score.score} points</div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-amber-700 text-sm">
            Can you beat your high score in the final round?
          </div>
        </>
      )}
    </div>
  );
};

export default ScoreBoard;