import React from 'react';
import { cn } from '@/lib/utils';

interface GameScoreProps {
  currentScore: number;
  className?: string;
}

const GameScore: React.FC<GameScoreProps> = ({ currentScore, className }) => {
  return (
    <div className={cn('safari-card', className)}>
      <h2 className="text-xl font-bold mb-3 text-amber-900">Current Score</h2>
      <div className="flex items-center">
        <div className="text-4xl font-bold text-primary">{currentScore}</div>
        <div className="text-lg text-amber-700 ml-2">points</div>
      </div>
      
      <div className="mt-3 text-amber-700">
        Try to maximize your score by placing animals strategically!
      </div>
    </div>
  );
};

export default GameScore;