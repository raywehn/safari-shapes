import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import GameBoard, { CellContent } from '@/components/GameBoard';
import ShapePalette from '@/components/ShapePalette';
import GameScore from '@/components/GameScore';
import GameInstructions from '@/components/GameInstructions';
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
const placeShapeOnGrid = (grid: CellContent[][], shape: CellContent, row: number, col: number): boolean => {
  if (!shape || !canPlaceShapeOnGrid(grid, shape, row, col)) return false;
  
  const gridSize = SIZE_GRID_CELLS[shape.size];
  
  // Fill all cells that the shape occupies
  for (let r = 0; r < gridSize.height; r++) {
    for (let c = 0; c < gridSize.width; c++) {
      grid[row + r][col + c] = {
        ...shape,
        origin: { row, col }
      };
    }
  }
  
  return true;
};

// Helper function to compare layouts
const compareLayouts = (layout1: CellContent[][], layout2: CellContent[][]): boolean => {
  if (layout1.length !== layout2.length || layout1[0].length !== layout2[0].length) {
    return false;
  }

  for (let row = 0; row < layout1.length; row++) {
    for (let col = 0; col < layout1[0].length; col++) {
      const cell1 = layout1[row][col];
      const cell2 = layout2[row][col];
      
      // If one is null and the other isn't, they don't match
      if ((cell1 === null) !== (cell2 === null)) {
        return false;
      }
      
      // If both are cells, compare their properties
      if (cell1 && cell2) {
        if (cell1.shape !== cell2.shape || 
            cell1.size !== cell2.size || 
            cell1.name !== cell2.name) {
          return false;
        }
      }
    }
  }
  return true;
};

// Function to count unique shapes on the board
const countUniqueShapes = (board: CellContent[][]): number => {
  const uniqueOrigins = new Set<string>();
  
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      const cell = board[row][col];
      if (cell && cell.origin) {
        // Create a unique key for each origin
        const originKey = `${cell.origin.row}-${cell.origin.col}`;
        uniqueOrigins.add(originKey);
      }
    }
  }
  
  return uniqueOrigins.size;
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

// Sample layout for guaranteed 50 points
const createSampleSolution = (): CellContent[][] => {
  const grid: CellContent[][] = Array(5).fill(null).map(() => Array(5).fill(null));
  
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'heart', size: 'xl', name: 'Elephant' }, 2, 0);
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'square', size: 'lg', name: 'Leopard' }, 0, 3);
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'circle', size: 'md', name: 'Fox' }, 3, 3);
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'circle', size: 'md', name: 'Fox' }, 0, 0);
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'triangle', size: 'sm', name: 'Rabbit' }, 0, 2);
  placeShapeOnGrid(grid, { id: uuidv4(), shape: 'square', size: 'xs', name: 'Mouse' }, 2, 3);
  
  return grid;
}

// Ending Screen Component
interface EndScreenProps {
  exploreExploitScore: number;
  finalScore: number;
  onReset: () => void;
}

const EndScreen: React.FC<EndScreenProps> = ({ exploreExploitScore, finalScore, onReset }) => {
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
            Start New Experiment
          </Button>
        </div>
      </div>
    </div>
  );
};

const Index: React.FC = () => {
  const BOARD_SIZE = 5;
  const CELL_SIZE = 80;
  
  const [currentRound, setCurrentRound] = useState<number>(1);
  const [sampleSolution, setSampleSolution] = useState<CellContent[][]>(createSampleSolution());
  const [playerBoard, setPlayerBoard] = useState<CellContent[][]>(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalType | null>(null);
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [isRoundComplete, setIsRoundComplete] = useState<boolean>(false);
  const [experimentComplete, setExperimentComplete] = useState<boolean>(false);
  const [exploreExploitScore, setExploreExploitScore] = useState<number>(0);
  
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
    if (currentRound === 1) {
      // In round 1, check if the player has copied the sample layout
      const isLayoutCopied = compareLayouts(board, sampleSolution);
      setIsRoundComplete(isLayoutCopied);
    } else if (currentRound === 2) {
      // In round 2, check if the player has placed at least 3 shapes
      const uniqueShapesCount = countUniqueShapes(board);
      setIsRoundComplete(uniqueShapesCount >= 3);
    } else {
      // In round 3, check if the player has placed at least 4 shapes
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
    if (currentRound < 3) {
      setCurrentRound(prev => prev + 1);
      setPlayerBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
      setCurrentScore(0);
      setSelectedAnimal(null);
      setIsRoundComplete(false);
      
      // Create a new sample solution for round 3
      if (currentRound === 2) {
        setSampleSolution(createSampleSolution());
      }
      
      toast({
        title: `Round ${currentRound + 1} Started`,
        description: getRoundInstructions(currentRound + 1),
      });
    } else {
      // Calculate explore-exploit score for round 3
      const similarity = calculateLayoutSimilarity(playerBoard, sampleSolution);
      // Convert similarity to explore-exploit score (0-100)
      // 100% similarity = 0% exploration, 0% similarity = 100% exploration
      const exploreScore = 100 - similarity;
      setExploreExploitScore(exploreScore);
      
      // Mark experiment complete
      setExperimentComplete(true);
      
      toast({
        title: "Experiment Complete!",
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
    setSampleSolution(createSampleSolution());
    
    toast({
      title: "New Experiment Started",
      description: "Round 1: Copy the sample layout exactly as shown.",
    });
  };
  
  // Get instructions based on current round
  const getRoundInstructions = (round: number): string => {
    switch (round) {
      case 1:
        return "Copy the sample layout exactly as shown.";
      case 2:
        return "Place at least 3 shapes in any way you like. Try to maximize your score!";
      case 3:
        return "Place at least 4 shapes. You can copy the sample layout or create your own!";
      default:
        return "";
    }
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
            
            {/* Right column: Sample Solution */}
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-bold mb-3 text-amber-900">
                {currentRound === 2 ? "No Sample Layout" : "Sample Layout (52 points)"}
              </h2>
              {currentRound !== 2 && (
                <>
                  <GameBoard 
                    size={BOARD_SIZE}
                    cellSize={CELL_SIZE}
                    cells={sampleSolution}
                    selectedShape={null}
                    readOnly={true}
                    className="opacity-90"
                  />
                  <p className="mt-3 text-amber-700 text-center">
                    {currentRound === 1 
                      ? "Copy this layout exactly to complete the round"
                      : "You can use this layout as inspiration"}
                  </p>
                </>
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