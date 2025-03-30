
import React from 'react';
import { cn } from '@/lib/utils';

export type ShapeType = 'square' | 'triangle' | 'circle' | 'heart';
export type SizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Points for each size
export const SHAPE_POINTS: Record<SizeType, number> = {
  'xs': 1,
  'sm': 3, 
  'md': 7,
  'lg': 12,
  'xl': 20
};

// Size dimensions in pixels
export const SIZE_DIMENSIONS: Record<SizeType, number> = {
  'xs': 32,
  'sm': 48,
  'md': 64,
  'lg': 80,
  'xl': 96
};

// Grid cell dimensions for each size (how many cells the shape takes up)
export const SIZE_GRID_CELLS: Record<SizeType, { width: number; height: number }> = {
  'xs': { width: 1, height: 1 },
  'sm': { width: 1, height: 1 },
  'md': { width: 2, height: 2 },
  'lg': { width: 2, height: 2 },
  'xl': { width: 3, height: 3 }
};

// Animal color mapping
export const ANIMAL_COLORS: Record<string, string> = {
  'mouse': 'bg-gray-400',
  'rabbit': 'bg-amber-400',
  'fox': 'bg-orange-500',
  'leopard': 'bg-yellow-600',
  'elephant': 'bg-purple-500'
};

export type AnimalType = {
  name: string;
  shape: ShapeType;
  size: SizeType;
};

interface ShapeItemProps {
  shape: ShapeType;
  size: SizeType;
  className?: string;
  onClick?: () => void;
  preview?: boolean;
  animalName?: string;
  gridPreview?: boolean;
}

const ShapeItem: React.FC<ShapeItemProps> = ({ 
  shape, 
  size, 
  className,
  onClick,
  preview = false,
  animalName,
  gridPreview = false
}) => {
  const dimension = SIZE_DIMENSIONS[size];
  
  // Generate shape styles
  let shapeStyles: React.CSSProperties = {
    width: gridPreview ? '100%' : dimension,
    height: gridPreview ? '100%' : dimension,
  };
  
  // Special handling for triangle
  if (shape === 'triangle') {
    if (!gridPreview) {
      shapeStyles = {
        ...shapeStyles,
        borderLeftWidth: dimension / 2,
        borderRightWidth: dimension / 2,
        borderBottomWidth: dimension,
        width: 0,
        height: 0
      };
    }
  }
  
  // Heart special styling
  const isHeart = shape === 'heart';
  
  const points = SHAPE_POINTS[size];
  
  // Get the animal color class for non-heart shapes
  const animalColorClass = animalName ? 
    ANIMAL_COLORS[animalName.toLowerCase()] || '' : '';
  
  // Get the animal name for heart shape classes
  const animalNameLower = animalName ? animalName.toLowerCase() : '';
  
  // Create the shape base class
  const shapeBaseClass = `shape-${shape}`;
  
  return (
    <div 
      className={cn(
        'relative flex items-center justify-center',
        !preview && 'shape',
        className
      )}
      onClick={onClick}
      data-animal={animalNameLower}
    >
      {/* For non-heart shapes, use a single div with the right styling */}
      {!isHeart && (
        <div 
          className={cn(
            shapeBaseClass,
            animalColorClass,
            shape === 'circle' && 'rounded-full',
            shape === 'square' && 'rounded-md',
            shape === 'triangle' && 'border-solid border-transparent'
          )}
          style={{
            ...shapeStyles,
            borderBottomColor: shape === 'triangle' ? 
              (animalNameLower === 'rabbit' ? '#fbbf24' : '#10b981') : undefined
          }}
        />
      )}
      
      {/* Special handling for heart shape */}
      {isHeart && (
        <div 
          className={cn(
            'heart-shape',
            animalNameLower && animalNameLower // Apply the animal name as a class for hearts
          )}
          style={shapeStyles}
        />
      )}
      
      {/* Points indicator */}
      {!preview && !gridPreview && (
        <div className="absolute -bottom-2 -right-2 bg-amber-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
          {points}
        </div>
      )}
    </div>
  );
};

export default ShapeItem;
