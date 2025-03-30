
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
  const animalNameLower = animalName?.toLowerCase() || '';
  
  // Generate shape styles
  let shapeStyles: React.CSSProperties = {
    width: gridPreview ? '100%' : dimension,
    height: gridPreview ? '100%' : dimension,
  };
  
  let colorStyle: React.CSSProperties = {};
  
  // Get color based on animal
  if (animalNameLower) {
    switch (animalNameLower) {
      case 'mouse':
        colorStyle.backgroundColor = '#9ca3af'; // gray-400
        break;
      case 'rabbit':
        colorStyle.backgroundColor = '#fbbf24'; // amber-400
        break;
      case 'fox':
        colorStyle.backgroundColor = '#f97316'; // orange-500
        break;
      case 'leopard':
        colorStyle.backgroundColor = '#ca8a04'; // yellow-600
        break;
      case 'elephant':
        colorStyle.backgroundColor = '#a855f7'; // purple-500
        break;
      default:
        colorStyle.backgroundColor = '#10b981'; // Default color
    }
  }
  
  // Special handling for triangle
  if (shape === 'triangle') {
    if (!gridPreview) {
      shapeStyles = {
        ...shapeStyles,
        borderLeftWidth: dimension / 2,
        borderRightWidth: dimension / 2,
        borderBottomWidth: dimension,
        width: 0,
        height: 0,
        borderBottomColor: colorStyle.backgroundColor || '#10b981',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent'
      };
      colorStyle = {}; // Reset color style as we set it directly in the shape
    } else {
      // When in grid, render a colored div instead with triangle shape
      shapeStyles = {
        ...shapeStyles,
        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
        ...colorStyle
      };
    }
  }
  
  // For heart shape, we'll use different styling
  const isHeart = shape === 'heart';
  const heartColor = colorStyle.backgroundColor;
  
  const points = SHAPE_POINTS[size];
  
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
            'shape-base',
            shape === 'circle' && 'rounded-full',
            shape === 'square' && 'rounded-md'
          )}
          style={{
            ...shapeStyles,
            ...(shape !== 'triangle' ? colorStyle : {})
          }}
        />
      )}
      
      {/* Special handling for heart shape */}
      {isHeart && (
        <div className="heart-shape-container" style={shapeStyles}>
          <div 
            className="heart-shape"
            style={{
              position: 'relative',
              width: '100%',
              height: '100%'
            }}
          >
            <div style={{
              position: 'absolute',
              width: '50%',
              height: '80%',
              left: 0,
              top: 0,
              borderRadius: '50%',
              backgroundColor: heartColor,
              transform: 'rotate(-45deg)',
              transformOrigin: 'top right'
            }} />
            <div style={{
              position: 'absolute',
              width: '50%',
              height: '80%',
              right: 0,
              top: 0,
              borderRadius: '50%',
              backgroundColor: heartColor,
              transform: 'rotate(45deg)',
              transformOrigin: 'top left'
            }} />
          </div>
        </div>
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
