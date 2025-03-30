
import React from 'react';
import { cn } from '@/lib/utils';

interface GameScoreProps {
  currentScore: number;
  targetScore: number;
  className?: string;
}

const GameScore: React.FC<GameScoreProps> = ({ currentScore, targetScore, className }) => {
  const percentage = Math.min((currentScore / targetScore) * 100, 100);
  
  return (
    <div className={cn('safari-card', className)}>
      <h2 className="text-xl font-bold mb-3 text-amber-900">Current Score</h2>
      <div className="flex items-center">
        <div className="text-4xl font-bold text-primary mr-2">{currentScore}</div>
        <div className="text-lg text-amber-700">/ {targetScore} points</div>
      </div>
      
      <div className="w-full bg-amber-200 rounded-full h-4 mt-2">
        <div 
          className="bg-primary h-4 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      
      {currentScore >= targetScore ? (
        <div className="mt-3 text-lg font-semibold text-green-600">
          Round complete! You've reached the target.
        </div>
      ) : (
        <div className="mt-3 text-amber-700">
          Need {targetScore - currentScore} more points to complete the round
        </div>
      )}
    </div>
  );
};

export default GameScore;
