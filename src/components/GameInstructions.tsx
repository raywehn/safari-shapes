import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GameInstructionsProps {
  onStartNewRound: () => void;
  currentScore: number;
  className?: string;
}

const GameInstructions: React.FC<GameInstructionsProps> = ({ 
  onStartNewRound,
  currentScore,
  className
}) => {
  return (
    <div className={cn('safari-card', className)}>
      <h2 className="text-xl font-bold mb-3 text-amber-900">Safari Shapes</h2>
      
      <div className="text-amber-800 mb-4">
        <p className="mb-2">
          Welcome to Safari Shapes! Your goal is to maximize your score by strategically arranging animal enclosures.
        </p>
        <p className="mb-2">
          Each animal is represented by a unique shape, and larger shapes are worth more points.
        </p>
        <p>
          Try different arrangements to discover the highest possible score you can achieve!
        </p>
      </div>
      
      <div className="mt-4">
        <Button 
          className="w-full bg-primary hover:bg-primary/90"
          onClick={onStartNewRound}
        >
          Start New Round
        </Button>
      </div>
    </div>
  );
};

export default GameInstructions;