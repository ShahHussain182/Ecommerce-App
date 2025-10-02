import { useState, useMemo, useEffect } from 'react';
import { ProductVariant } from '@/types';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from '@/lib/utils';

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  onChange: (variant: ProductVariant) => void;
}

export const ProductVariantSelector = ({ variants, onChange }: ProductVariantSelectorProps) => {
  const [selectedSize, setSelectedSize] = useState<string>(variants[0].size);
  const [selectedColor, setSelectedColor] = useState<string>(variants[0].color);

  const sizes = useMemo(() => [...new Set(variants.map(v => v.size))], [variants]);
  
  const availableColorsForSelectedSize = useMemo(() => {
    return variants
      .filter(v => v.size === selectedSize)
      .map(v => v.color);
  }, [selectedSize, variants]);

  useEffect(() => {
    // If the current selected color is not available for the new size,
    // default to the first available color.
    if (!availableColorsForSelectedSize.includes(selectedColor)) {
      setSelectedColor(availableColorsForSelectedSize[0]);
    }
  }, [selectedSize, availableColorsForSelectedSize, selectedColor]);

  useEffect(() => {
    const variant = variants.find(v => v.size === selectedSize && v.color === selectedColor);
    if (variant) {
      onChange(variant);
    }
  }, [selectedSize, selectedColor, variants, onChange]);

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-medium">Size</Label>
        <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex items-center gap-2 mt-2">
          {sizes.map(size => (
            <Label
              key={size}
              htmlFor={`size-${size}`}
              className={cn(
                "border rounded-md px-4 py-2 cursor-pointer hover:bg-accent",
                selectedSize === size && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              <RadioGroupItem value={size} id={`size-${size}`} className="sr-only" />
              {size}
            </Label>
          ))}
        </RadioGroup>
      </div>
      <div>
        <Label className="text-lg font-medium">Color</Label>
        <RadioGroup value={selectedColor} onValueChange={setSelectedColor} className="flex items-center gap-3 mt-2">
          {availableColorsForSelectedSize.map(color => (
            <Label
              key={color}
              htmlFor={`color-${color}`}
              className={cn(
                "relative h-8 w-8 rounded-full border-2 cursor-pointer flex items-center justify-center",
                selectedColor === color ? "border-primary" : "border-gray-200"
              )}
              style={{ backgroundColor: color.toLowerCase() }}
            >
              <RadioGroupItem value={color} id={`color-${color}`} className="sr-only" />
              {selectedColor === color && <div className="h-full w-full rounded-full border-2 border-white" />}
            </Label>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};