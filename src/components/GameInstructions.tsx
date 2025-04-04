import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GameInstructionsProps {
  onStartNewRound: () => void;
  currentScore: number;
  round: number;
  isRoundComplete: boolean;
  className?: string;
}

const GameInstructions: React.FC<GameInstructionsProps> = ({ 
  onStartNewRound,
  currentScore,
  round,
  isRoundComplete,
  className
}) => {
  const getRoundInstructions = () => {
    switch (round) {
      case 1:
        return (
          <>
            <p className="mb-2">
              Welcome to Safari Shapes! In this round, you'll learn how to play by copying a sample layout.
            </p>
            <p className="mb-2">
              Look at the sample layout on the right and try to copy it exactly. You can place shapes by:
            </p>
            <ol className="list-decimal list-inside mb-2">
              <li>Selecting a shape from the palette</li>
              <li>Clicking on the grid where you want to place it</li>
              <li>Removing shapes by clicking on them again</li>
            </ol>
            <p className="font-semibold text-red-600">
              You must copy the sample layout exactly to complete this round.
            </p>
          </>
        );
      case 2:
        return (
          <>
            <p className="mb-2">
              Great job! Now it's time to explore on your own.
            </p>
            <p className="mb-2">
              In this round, you'll need to use all 5 animal shapes. Try to:
            </p>
            <ul className="list-disc list-inside mb-2">
              <li>Place all 5 different animal shapes at least once</li>
              <li>Maximize your score by using larger shapes</li>
              <li>Experiment with different arrangements</li>
            </ul>
            <p className="font-semibold text-red-600">
              You must place all 5 animal shapes to complete this round.
            </p>
          </>
        );
      case 3:
        return (
          <>
            <p className="mb-2">
              This is your final round! You can now:
            </p>
            <ul className="list-disc list-inside mb-2">
              <li>Use the sample layout as inspiration</li>
              <li>Create your own unique layout</li>
              <li>Try to achieve the highest score possible</li>
            </ul>
            <p className="mb-2">
              Place at least 4 shapes to complete the round.
            </p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('safari-card', className)}>
      <h2 className="text-xl font-bold mb-3 text-amber-900">Round {round}</h2>
      
      <div className="text-amber-800 mb-4">
        {getRoundInstructions()}
      </div>
      
      <div className="mt-4">
        <Button 
          className={cn(
            "w-full",
            isRoundComplete 
              ? "bg-primary hover:bg-primary/90" 
              : "bg-red-500 hover:bg-red-600 cursor-not-allowed"
          )}
          onClick={onStartNewRound}
          disabled={!isRoundComplete}
        >
          {isRoundComplete ? "Start Next Round" : "Complete This Round"}
        </Button>
      </div>
    </div>
  );
};

export default GameInstructions;