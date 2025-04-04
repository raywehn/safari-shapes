import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import GameBoard, { CellContent } from '@/components/GameBoard';
import ShapePalette from '@/components/ShapePalette';
import GameScore from '@/components/GameScore';
import GameInstructions from '@/components/GameInstructions';
import ScoreBoard from '@/components/ScoreBoard';
import { AnimalType, SHAPE_POINTS, SIZE_GRID_CELLS } from '@/components/ShapeItem';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Define our animal enclosures
const ANIMALS: AnimalType[] = [
  { name: 'Mouse', shape: 'square', size: 'xs' },
  { name: 'Rabbit', shape: 'triangle', size: 'sm' },
  { name: 'Fox', shape: 'circle', size: 'md' },
  { name: 'Leopard', shape: 'square', size: 'lg' },
  { name: 'Elephant', shape: 'heart', size: 'xl' },
];

// Helper function to check if a shape can be placed at a position
const canPlaceShapeOnGrid = (grid: CellContent[][], shape: CellContent, row: number, col: number): boolean => {
  if (!shape) return false;
  
  const gridSize = SIZE_GRID_CELLS[shape.size];
  
  // Check boundaries
  if (row + gridSize.height > grid.length || col + gridSize.width > grid[0].length) {
    return false;
  }
  
  // Check if any cells are already occupied
  for (let r = 0; r < gridSize.height; r++) {
    for (let c = 0; c < gridSize.width; c++) {
      if (grid[row + r][col + c] !== null) {
        return false;
      }
    }
  }
  
  return true;
};

// Helper function to place a shape on the grid
const placeShapeOnGrid = (grid: CellContent[][], shape: CellContent, row: number, col: number) => {
  if (!shape) return;
  
  const gridSize = SIZE_GRID_CELLS[shape.size];
  
  for (let r = 0; r < gridSize.height; r++) {
    for (let c = 0; c < gridSize.width; c++) {
      grid[row + r][col + c] = {
        ...shape,
        origin: { row, col }
      };
    }
  }
};

// Helper function to compare two layouts
const compareLayouts = (layout1: CellContent[][], layout2: CellContent[][]): boolean => {
  if (layout1.length !== layout2.length || layout1[0].length !== layout2[0].length) {
    return false;
  }
  
  for (let row = 0; row < layout1.length; row++) {
    for (let col = 0; col < layout1[0].length; col++) {
      const cell1 = layout1[row][col];
      const cell2 = layout2[row][col];
      
      if ((cell1 === null && cell2 !== null) || 
          (cell1 !== null && cell2 === null) ||
          (cell1 !== null && cell2 !== null && 
           (cell1.shape !== cell2.shape || 
            cell1.size !== cell2.size || 
            cell1.name !== cell2.name))) {
        return false;
      }
    }
  }
  
  return true;
};

// Helper function to count unique shapes on the board
const countUniqueShapes = (board: CellContent[][]): number => {
  const uniqueShapes = new Set<string>();
  
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const cell = board[row][col];
      if (cell && (!cell.origin || (cell.origin.row === row && cell.origin.col === col))) {
        uniqueShapes.add(`${cell.shape}-${cell.size}-${cell.name}`);
      }
    }
  }
  
  return uniqueShapes.size;
};

// Helper function to check if all shapes are used
const areAllShapesUsed = (board: CellContent[][]): boolean => {
  const usedShapes = new Set<string>();
  
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      const cell = board[row][col];
      if (cell && (!cell.origin || (cell.origin.row === row && cell.origin.col === col))) {
        usedShapes.add(`${cell.shape}-${cell.size}-${cell.name}`);
      }
    }
  }
  
  return usedShapes.size === ANIMALS.length;
};

// Calculate similarity between two layouts (for explore-exploit score)
const calculateLayoutSimilarity = (layout1: CellContent[][], layout2: CellContent[][]): number => {
  if (layout1.length !== layout2.length || layout1[0].length !== layout2[0].length) {
    return 0;
  }

  let matchingCells = 0;
  let totalCells = 0;
  
  for (let row = 0; row < layout1.length; row++) {
    for (let col = 0; col < layout1[0].length; col++) {
      const cell1 = layout1[row][col];
      const cell2 = layout2[row][col];
      
      // Count occupied cells
      if (cell1 !== null || cell2 !== null) {
        totalCells++;
        
        // Check if they match
        if ((cell1 === null && cell2 === null) || 
            (cell1 !== null && cell2 !== null && 
             cell1.shape === cell2.shape && 
             cell1.size === cell2.size && 
             cell1.name === cell2.name)) {
          matchingCells++;
        }
      }
    }
  }
  
  // Return percentage of matching cells (0-100)
  return totalCells > 0 ? (matchingCells / totalCells) * 100 : 0;
};

// Sample layout 1 for rounds 1 and 5 (50+ points)
const createSampleSolution1 = (): CellContent[][] => {
  const grid: CellContent[][] = Array(5).fill(null).map(() => Array(5).fill(null));
  
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'heart', size: 'xl', name: 'Elephant' }, 2, 0);
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'square', size: 'lg', name: 'Leopard' }, 0, 3);
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'circle', size: 'md', name: 'Fox' }, 3, 3);
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'circle', size: 'md', name: 'Fox' }, 0, 0);
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'triangle', size: 'sm', name: 'Rabbit' }, 0, 2);
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'square', size: 'xs', name: 'Mouse' }, 2, 3);
  
  return grid;
};

// Sample layout 2 for round 3 (50+ points)
const createSampleSolution2 = (): CellContent[][] => {
  const grid: CellContent[][] = Array(5).fill(null).map(() => Array(5).fill(null));
  
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'heart', size: 'xl', name: 'Elephant' }, 0, 0);
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'square', size: 'lg', name: 'Leopard' }, 0, 3);
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'circle', size: 'md', name: 'Fox' }, 3, 0);
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'triangle', size: 'sm', name: 'Rabbit' }, 3, 3);
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'square', size: 'xs', name: 'Mouse' }, 4, 4);
  
  return grid;
};

// Define the RoundScore interface
interface RoundScore {
  round: number;
  score: number;
}

// Define the EndScreenProps interface
interface EndScreenProps {
  exploreExploitScore: number;
  finalScore: number;
  onReset: () => void;
  roundScores: RoundScore[];
}

const EndScreen: React.FC<EndScreenProps> = ({ exploreExploitScore, finalScore, onReset, roundScores }) => {
  const explorationLevel = exploreExploitScore > 75 ? "High Exploration" :
                          exploreExploitScore > 25 ? "Balanced Approach" : "High Exploitation";
  
  return (
    <div className="safari-card w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-amber-900 text-center">Experiment Complete!</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-amber-800 mb-2">Your Final Score: {finalScore} points</h3>
          <p className="text-amber-700">
            This reflects how well you optimized your animal enclosure placement.
          </p>
        </div>
        
        {/* Score History in End Screen */}
        <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
          <h4 className="text-lg font-bold text-amber-800 mb-2">Score History</h4>
          <ScoreBoard roundScores={roundScores} />
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-amber-800 mb-2">Explore-Exploit Measurement</h3>
          
          <div className="bg-white p-4 rounded-md border border-amber-200 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-amber-800">Exploration</span>
              <span className="font-semibold text-amber-800">Exploitation</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div 
                className="bg-green-500 h-4 rounded-full" 
                style={{ width: `${100 - exploreExploitScore}%`, marginLeft: `${exploreExploitScore}%` }}
              />
            </div>
            
            <div className="text-center font-semibold text-lg text-amber-900 mt-2">
              {explorationLevel}
            </div>
            
            <p className="mt-4 text-amber-700">
              <strong>Score: {Math.round(100 - exploreExploitScore)}% Exploitation / {Math.round(exploreExploitScore)}% Exploration</strong>
            </p>
            
            <div className="mt-4 text-sm text-amber-600">
              <p className="mb-2">
                <strong>What this means:</strong>
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <strong>Exploration:</strong> Creating your own unique layout, trying new approaches
                </li>
                <li>
                  <strong>Exploitation:</strong> Using the sample layout that was known to work well
                </li>
              </ul>
            </div>
          </div>
          
          <p className="text-amber-700">
            In decision-making, there's often a trade-off between exploring new possibilities and exploiting known successful strategies. Your score reflects your natural tendency toward one approach or a balance between them.
          </p>
        </div>
        
        <div className="mt-6">
          <Button 
            className="w-full bg-primary hover:bg-primary/90"
            onClick={onReset}
          >
            Start a New Safari
          </Button>
        </div>
      </div>
    </div>
  );
};

// Define the StartPageProps interface
interface StartPageProps {
  onStart: () => void;
}

// Create the StartPage component
const StartPage: React.FC<StartPageProps> = ({ onStart }) => {
  return (
    <div className="safari-card w-full max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-amber-900 text-center">Welcome to Safari Shapes!</h2>
      
      <div className="space-y-6">
        <div className="bg-amber-50 p-6 rounded-md border border-amber-200">
          <h3 className="text-xl font-bold text-amber-800 mb-3">About this Game</h3>
          <p className="text-amber-700 mb-3">
            Safari Shapes is a fun puzzle game where you'll arrange animal enclosures in a grid to create the perfect safari!
          </p>
          <p className="text-amber-700 mb-3">
            This game has 5 rounds with different challenges:
          </p>
          <ul className="list-disc list-inside space-y-2 text-amber-700 ml-4">
            <li>Rounds 1-4: Practice rounds to learn different aspects of the game</li>
            <li>Round 5: Final round where you'll create your ultimate safari layout</li>
          </ul>
        </div>
        
        <div className="bg-amber-50 p-6 rounded-md border border-amber-200">
          <h3 className="text-xl font-bold text-amber-800 mb-3">How to Play</h3>
          <ol className="list-decimal list-inside space-y-2 text-amber-700 ml-4">
            <li>Select an animal from the palette at the bottom</li>
            <li>Click on the grid to place the animal enclosure</li>
            <li>Click on a placed animal to remove it</li>
            <li>Complete the objective for each round to progress</li>
          </ol>
        </div>
        
        <div className="mt-8">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-xl py-6"
            onClick={onStart}
          >
            Start the Safari Adventure!
          </Button>
        </div>
      </div>
    </div>
  );
};

// Create the IntermediateScreen component for transitions between rounds
interface IntermediateScreenProps {
  round: number;
  previousScore?: number;
  onStartRound: () => void;
}

const IntermediateScreen: React.FC<IntermediateScreenProps> = ({ round, previousScore, onStartRound }) => {
  // Description and objectives for each round
  const getRoundDetails = (roundNumber: number) => {
    switch (roundNumber) {
      case 1:
        return {
          title: "Round 1: Follow the Blueprint",
          description: "In this practice round, your task is to copy the sample layout exactly as shown.",
          objectives: [
            "Select animals from the palette",
            "Place them on the grid to match the sample layout",
            "Make sure every animal is in exactly the right position"
          ],
          tip: "Pay close attention to the shape, size, and position of each animal enclosure."
        };
      case 2:
        return {
          title: "Round 2: Create Your Own Safari",
          description: "In this practice round, create your own unique safari layout using at least 4 different animals.",
          objectives: [
            "Use at least 4 different animal types",
            "Arrange them in your own unique pattern",
            "Try to maximize your score with your layout"
          ],
          tip: "Larger animals are worth more points, but they also take up more space."
        };
      case 3:
        return {
          title: "Round 3: Follow a New Blueprint",
          description: "In this practice round, copy a new sample layout exactly as shown.",
          objectives: [
            "Select animals from the palette",
            "Place them on the grid to match the new sample layout",
            "Make sure every animal is in exactly the right position"
          ],
          tip: "This layout is different from the first one. Pay close attention to the details."
        };
      case 4:
        return {
          title: "Round 4: Design Another Safari",
          description: "In this practice round, create another unique safari layout using at least 4 different animals.",
          objectives: [
            "Use at least 4 different animal types",
            "Arrange them in a different pattern than round 2",
            "Try to maximize your score with your new layout"
          ],
          tip: "Try a different approach than your previous design to see if you can score higher."
        };
      case 5:
        return {
          title: "Round 5: Final Safari Challenge",
          description: "This is the final round where you'll create your ultimate safari layout.",
          objectives: [
            "Place at least 4 shapes on the grid",
            "You can copy the sample layout or create your own design",
            "Try to maximize your score"
          ],
          tip: "Your choices in this round will be analyzed to provide insights about your decision-making."
        };
      default:
        return {
          title: "Unknown Round",
          description: "Please start a new game.",
          objectives: [],
          tip: ""
        };
    }
  };

  const roundDetails = getRoundDetails(round);

  return (
    <div className="safari-card w-full max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-amber-900 text-center">{roundDetails.title}</h2>
      
      {previousScore !== undefined && (
        <div className="bg-amber-100 p-4 rounded-md border border-amber-300 mb-6">
          <h3 className="text-lg font-semibold text-amber-800 mb-1">Previous Round Score</h3>
          <p className="text-amber-700 text-xl font-bold">{previousScore} points</p>
        </div>
      )}
      
      <div className="space-y-6">
        <div className="bg-amber-50 p-6 rounded-md border border-amber-200">
          <h3 className="text-xl font-bold text-amber-800 mb-3">Round Description</h3>
          <p className="text-amber-700 mb-3">
            {roundDetails.description}
          </p>
        </div>
        
        <div className="bg-amber-50 p-6 rounded-md border border-amber-200">
          <h3 className="text-xl font-bold text-amber-800 mb-3">Objectives</h3>
          <ul className="list-disc list-inside space-y-2 text-amber-700 ml-4">
            {roundDetails.objectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
          
          {roundDetails.tip && (
            <div className="mt-4 bg-amber-100 p-3 rounded-md">
              <p className="text-amber-800 font-semibold">Tip: {roundDetails.tip}</p>
            </div>
          )}
        </div>
        
        <div className="mt-8">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-xl py-6"
            onClick={onStartRound}
          >
            Start Round {round}
          </Button>
        </div>
      </div>
    </div>
  );
};

const Index: React.FC = () => {
  const BOARD_SIZE = 5;
  const CELL_SIZE = 80;
  const TOTAL_ROUNDS = 5;
  
  // Add state for showing the start page and intermediate screen
  const [showStartPage, setShowStartPage] = useState<boolean>(true);
  const [showIntermediateScreen, setShowIntermediateScreen] = useState<boolean>(false);
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [sampleSolution1] = useState<CellContent[][]>(createSampleSolution1());
  const [sampleSolution2] = useState<CellContent[][]>(createSampleSolution2());
  const [currentSampleSolution, setCurrentSampleSolution] = useState<CellContent[][]>(createSampleSolution1());
  const [playerBoard, setPlayerBoard] = useState<CellContent[][]>(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalType | null>(null);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [isRoundComplete, setIsRoundComplete] = useState<boolean>(false);
  const [experimentComplete, setExperimentComplete] = useState<boolean>(false);
  const [exploreExploitScore, setExploreExploitScore] = useState<number>(0);
  const [roundScores, setRoundScores] = useState<RoundScore[]>([]);
  const [previousRoundScore, setPreviousRoundScore] = useState<number | undefined>(undefined);
  
  // Start the game from the start page
  const handleStartGame = () => {
    setShowStartPage(false);
    setShowIntermediateScreen(true);
  };
  
  // Start a round from the intermediate screen
  const handleStartRound = () => {
    setShowIntermediateScreen(false);
    
    toast({
      title: `Round ${currentRound} Started`,
      description: getRoundInstructions(currentRound),
    });
  };
  
  // Calculate score based on shapes on the board
  const calculateScore = (board: CellContent[][]) => {
    const countedShapes = new Set<string>();
    let score = 0;
    
    for (let row = 0; row < board.length; row++) {
      for (let col = 0; col < board[row].length; col++) {
        const cell = board[row][col];
        if (cell && (!cell.origin || (cell.origin.row === row && cell.origin.col === col))) {
          score += SHAPE_POINTS[cell.size];
          countedShapes.add(cell.id);
        }
      }
    }
    
    return score;
  };
  
  // Check if round is complete
  const checkRoundCompletion = (board: CellContent[][]) => {
    // For rounds 1 and 3 (copying sample layouts), check if layout is copied exactly
    if (currentRound === 1 || currentRound === 3) {
      const isLayoutCopied = compareLayouts(board, currentSampleSolution);
      setIsRoundComplete(isLayoutCopied);
    }
    // For rounds 2, 4, and 5 (creating layouts), check if at least 4 shapes are placed
    else {
      const uniqueShapesCount = countUniqueShapes(board);
      setIsRoundComplete(uniqueShapesCount >= 4);
    }
  };
  
  // Handle selecting an animal from the palette
  const handleSelectAnimal = (animal: AnimalType) => {
    setSelectedAnimal(animal);
  };
  
  // Handle placing a shape on the board
  const handleCellClick = (row: number, col: number) => {
    if (!selectedAnimal) return;
    
    const gridSize = SIZE_GRID_CELLS[selectedAnimal.size];
    
    if (row + gridSize.height > BOARD_SIZE || col + gridSize.width > BOARD_SIZE) {
      toast({
        title: "Can't place here",
        description: "The animal enclosure doesn't fit within the boundaries.",
        variant: "destructive"
      });
      return;
    }
    
    for (let r = 0; r < gridSize.height; r++) {
      for (let c = 0; c < gridSize.width; c++) {
        if (playerBoard[row + r][col + c] !== null) {
          toast({
            title: "Can't place here",
            description: "Some cells are already occupied by another animal.",
            variant: "destructive"
          });
          return;
        }
      }
    }
    
    const newBoard = [...playerBoard.map(row => [...row])];
    const newShape: CellContent = {
      id: uuidv4(),
      shape: selectedAnimal.shape,
      size: selectedAnimal.size,
      name: selectedAnimal.name
    };
    
    placeShapeOnGrid(newBoard, newShape, row, col);
    setPlayerBoard(newBoard);
    
    const newScore = calculateScore(newBoard);
    setCurrentScore(newScore);
    
    // Check if round is complete
    checkRoundCompletion(newBoard);
  };

  // Handle removing a shape from the board
  const handleRemoveShape = (row: number, col: number) => {
    const cell = playerBoard[row][col];
    if (!cell) return;

    const originRow = cell.origin?.row ?? row;
    const originCol = cell.origin?.col ?? col;
    const gridSize = SIZE_GRID_CELLS[cell.size];
    
    const newBoard = [...playerBoard.map(row => [...row])];
    
    for (let r = 0; r < gridSize.height; r++) {
      for (let c = 0; c < gridSize.width; c++) {
        newBoard[originRow + r][originCol + c] = null;
      }
    }
    
    setPlayerBoard(newBoard);
    setCurrentScore(calculateScore(newBoard));
    checkRoundCompletion(newBoard);
  };
  
  // Start a new round
  const startNewRound = () => {
    // Save the current round's score
    setRoundScores(prev => [...prev, { round: currentRound, score: currentScore }]);
    // Store the previous round's score for display in the intermediate screen
    setPreviousRoundScore(currentScore);
    
    if (currentRound < TOTAL_ROUNDS) {
      // Prepare for next round
      const nextRound = currentRound + 1;
      setCurrentRound(nextRound);
      setPlayerBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
      setCurrentScore(0);
      setSelectedAnimal(null);
      setIsRoundComplete(false);
      
      // Set the appropriate sample solution for the next round
      if (nextRound === 3) {
        setCurrentSampleSolution(sampleSolution2);
      } else if (nextRound === 5) {
        // Use sample solution 1 for the final round
        setCurrentSampleSolution(sampleSolution1);
      }
      
      // Show the intermediate screen
      setShowIntermediateScreen(true);
    } else {
      // Save the final round score
      const finalRoundScore = { round: currentRound, score: currentScore };
      const updatedScores = [...roundScores, finalRoundScore];
      setRoundScores(updatedScores);
      
      // Calculate explore-exploit score for the final round (round 5)
      const similarity = calculateLayoutSimilarity(playerBoard, currentSampleSolution);
      // Convert similarity to explore-exploit score (0-100)
      // 100% similarity = 0% exploration, 0% similarity = 100% exploration
      const exploreScore = 100 - similarity;
      setExploreExploitScore(exploreScore);
      
      // Mark experiment complete
      setExperimentComplete(true);
      
      toast({
        title: "Game Complete!",
        description: "Your results have been calculated.",
      });
    }
  };
  
  // Reset the experiment
  const resetExperiment = () => {
    setCurrentRound(1);
    setPlayerBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
    setCurrentScore(0);
    setSelectedAnimal(null);
    setIsRoundComplete(false);
    setExperimentComplete(false);
    setCurrentSampleSolution(sampleSolution1);
    setRoundScores([]); // Clear round scores
    setPreviousRoundScore(undefined);
    
    // Show the start page again
    setShowStartPage(true);
    setShowIntermediateScreen(false);
  };
  
  // Get instructions based on current round
  const getRoundInstructions = (round: number): string => {
    switch (round) {
      case 1:
        return "Copy the sample layout exactly as shown.";
      case 2:
        return "Create your own layout with at least 4 different animals.";
      case 3:
        return "Copy this new sample layout exactly as shown.";
      case 4:
        return "Create another layout with at least 4 different animals.";
      case 5:
        return "Final round: Place at least 4 shapes. You can copy the sample or create your own design.";
      default:
        return "";
    }
  };
  
  // Should the sample layout be shown for the current round?
  const shouldShowSampleLayout = (round: number): boolean => {
    // Only show sample layout in rounds 1, 3, and 5
    return round === 1 || round === 3 || round === 5;
  };
  
  // Get the appropriate text for the sample layout based on the round
  const getSampleLayoutText = (round: number): string => {
    if (round === 1 || round === 3) {
      return "Copy this layout exactly to complete the round";
    } else if (round === 5) {
      return "You can copy this layout or create your own";
    }
    return "";
  };
  
  // Calculate score and check completion on initial load
  useEffect(() => {
    setCurrentScore(calculateScore(playerBoard));
    checkRoundCompletion(playerBoard);
  }, []);
  
  // Recheck round completion when the round changes
  useEffect(() => {
    checkRoundCompletion(playerBoard);
  }, [currentRound]);
  
  // Show the start page if showStartPage is true
  if (showStartPage) {
    return (
      <div className="min-h-screen bg-lime-50 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-amber-900 mb-8">
            Safari Shapes
          </h1>
          
          <StartPage onStart={handleStartGame} />
        </div>
      </div>
    );
  }
  
  // Show the intermediate screen if showIntermediateScreen is true
  if (showIntermediateScreen) {
    return (
      <div className="min-h-screen bg-lime-50 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-amber-900 mb-8">
            Safari Shapes
          </h1>
          
          <IntermediateScreen 
            round={currentRound}
            previousScore={previousRoundScore}
            onStartRound={handleStartRound}
          />
        </div>
      </div>
    );
  }
  
  // If experiment is complete, show ending screen
  if (experimentComplete) {
    return (
      <div className="min-h-screen bg-lime-50 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center text-amber-900 mb-8">
            Safari Shapes - Results
          </h1>
          
          <EndScreen 
            exploreExploitScore={exploreExploitScore}
            finalScore={currentScore}
            onReset={resetExperiment}
            roundScores={roundScores}
          />
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-lime-50 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-amber-900 mb-8">
          Safari Shapes
        </h1>
        
        <div className="flex flex-col gap-6">
          {/* Game controls and boards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Instructions and Score */}
            <div className="space-y-6">
              <GameInstructions 
                onStartNewRound={startNewRound}
                currentScore={currentScore}
                round={currentRound}
                isRoundComplete={isRoundComplete}
              />
              
              <GameScore 
                currentScore={currentScore}
              />
              
              {/* Show score history if there are previous rounds */}
              {roundScores.length > 0 && (
                <ScoreBoard 
                  roundScores={roundScores}
                />
              )}
            </div>
            
            {/* Middle column: Player's Game Board */}
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-bold mb-3 text-amber-900">Your Safari</h2>
              <GameBoard 
                size={BOARD_SIZE}
                cellSize={CELL_SIZE}
                cells={playerBoard}
                onCellClick={handleCellClick}
                onRemoveShape={handleRemoveShape}
                selectedShape={selectedAnimal ? {
                  id: 'preview',
                  shape: selectedAnimal.shape,
                  size: selectedAnimal.size,
                  name: selectedAnimal.name
                } : null}
              />
            </div>
            
            {/* Right column: Sample Solution (only shown in rounds 1, 3, and 5) */}
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-bold mb-3 text-amber-900">
                {shouldShowSampleLayout(currentRound) ? "Sample Layout (50+ points)" : "No Sample Layout"}
              </h2>
              {shouldShowSampleLayout(currentRound) && (
                <>
                  <GameBoard 
                    size={BOARD_SIZE}
                    cellSize={CELL_SIZE}
                    cells={currentSampleSolution}
                    selectedShape={null}
                    readOnly={true}
                    className="opacity-90"
                  />
                  <p className="mt-3 text-amber-700 text-center">
                    {getSampleLayoutText(currentRound)}
                  </p>
                </>
              )}
              {!shouldShowSampleLayout(currentRound) && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-amber-700 text-center p-10 bg-amber-50 rounded-md border border-amber-200">
                    {currentRound === 2 ? 
                      "Create your own layout with at least 4 different animals." :
                      "Create another layout with at least 4 different animals."}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Animal Selection Palette - spans full width */}
          <ShapePalette 
            shapes={ANIMALS} 
            onSelectShape={handleSelectAnimal}
            selectedAnimal={selectedAnimal}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Index;