
import React from 'react';
import ShapeItem, { AnimalType, SHAPE_POINTS } from './ShapeItem';
import { cn } from '@/lib/utils';

interface ShapePaletteProps {
  shapes: AnimalType[];
  onSelectShape: (animal: AnimalType) => void;
  selectedAnimal: AnimalType | null;
  className?: string;
}

const ShapePalette: React.FC<ShapePaletteProps> = ({
  shapes,
  onSelectShape,
  selectedAnimal,
  className
}) => {
  return (
    <div className={cn('safari-card', className)}>
      <h2 className="text-xl font-bold mb-3 text-amber-900">Animal Enclosures</h2>
      <div className="grid grid-cols-2 gap-2">
        {shapes.map((animal) => (
          <div
            key={`${animal.shape}-${animal.size}`}
            className={cn(
              'palette-item cursor-pointer',
              selectedAnimal?.name === animal.name && 'ring-2 ring-primary bg-lime-100'
            )}
            onClick={() => onSelectShape(animal)}
          >
            <ShapeItem shape={animal.shape} size={animal.size} />
            <div className="mt-2 text-center">
              <div className="font-medium text-amber-800">{animal.name}</div>
              <div className="text-xs text-amber-600">{SHAPE_POINTS[animal.size]} points</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShapePalette;
