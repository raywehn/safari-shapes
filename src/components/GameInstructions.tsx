
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GameInstructionsProps {
  onStartNewRound: () => void;
  currentScore: number;
  targetScore: number;
  className?: string;
}

const GameInstructions: React.FC<GameInstructionsProps> = ({ 
  onStartNewRound,
  currentScore,
  targetScore,
  className
}) => {
  const hasWon = currentScore >= targetScore;
  
  return (
    <div className={cn('safari-card', className)}>
      <h2 className="text-xl font-bold mb-3 text-amber-900">Safari Shapes</h2>
      
      <div className="text-amber-800 mb-4">
        <p className="mb-2">
          Welcome to Safari Shapes! Your goal is to arrange animal enclosures to score at least {targetScore} points.
        </p>
        <p className="mb-2">
          Each animal is represented by a unique shape, and larger shapes are worth more points.
        </p>
        <p>
          You can use the sample layout on the right as a guide—it guarantees exactly {targetScore} points—or create your own arrangement to explore different strategies!
        </p>
      </div>
      
      <div className="mt-4">
        {hasWon ? (
          <div className="space-y-3">
            <div className="text-green-600 font-bold text-lg">
              Congratulations! You've completed this round.
            </div>
            <Button 
              className="w-full bg-primary hover:bg-primary/90"
              onClick={onStartNewRound}
            >
              Start New Round
            </Button>
          </div>
        ) : (
          <div className="text-amber-700 font-medium">
            Select animals from the palette and place them on the board.
          </div>
        )}
      </div>
    </div>
  );
};

export default GameInstructions;
