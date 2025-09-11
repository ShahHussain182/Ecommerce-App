import { FilterState } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RangeSlider } from './RangeSlider'; // Import the new RangeSlider

interface ProductFilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onClearFilters: () => void;
}

const CATEGORIES = ["Electronics", "Apparel", "Accessories", "Wearables", "Home Goods"];
const COLORS = ["Black", "White", "Red", "Blue", "Green", "Gray", "Silver"];
const SIZES = ["S", "M", "L", "XL"];

export const ProductFilterSidebar = ({ filters, onFilterChange, onClearFilters }: ProductFilterSidebarProps) => {
  return (
    <aside className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onClearFilters}>Clear all</Button>
      </div>
      <Accordion type="multiple" defaultValue={['category', 'price']} className="w-full">
        <AccordionItem value="category">
          <AccordionTrigger>Category</AccordionTrigger>
          <AccordionContent className="space-y-2">
            {CATEGORIES.map(category => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${category}`}
                  checked={filters.categories.includes(category)}
                  onCheckedChange={(checked) => {
                    const newCategories = checked
                      ? [...filters.categories, category]
                      : filters.categories.filter(c => c !== category);
                    onFilterChange({ categories: newCategories });
                  }}
                />
                <Label htmlFor={`cat-${category}`} className="font-normal">{category}</Label>
              </div>
            ))}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="price">
          <AccordionTrigger>Price</AccordionTrigger>
          <AccordionContent className="pt-4">
            <RangeSlider // Using the new RangeSlider component
              min={0}
              max={500}
              step={10}
              value={filters.priceRange}
              onValueChange={(value) => onFilterChange({ priceRange: value as [number, number] })}
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>${filters.priceRange[0]}</span>
              <span>${filters.priceRange[1]}</span>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="colors">
          <AccordionTrigger>Colors</AccordionTrigger>
          <AccordionContent>
            <ToggleGroup
              type="multiple"
              value={filters.colors}
              onValueChange={(value) => onFilterChange({ colors: value })}
              className="flex flex-wrap gap-2 pt-2"
            >
              {COLORS.map(color => (
                <ToggleGroupItem key={color} value={color} aria-label={`Toggle ${color}`} className="h-8 w-8 rounded-full border" style={{ backgroundColor: color.toLowerCase() }} />
              ))}
            </ToggleGroup>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="sizes">
          <AccordionTrigger>Sizes</AccordionTrigger>
          <AccordionContent>
            <ToggleGroup
              type="multiple"
              value={filters.sizes}
              onValueChange={(value) => onFilterChange({ sizes: value })}
              className="flex flex-wrap gap-2 pt-2"
            >
              {SIZES.map(size => (
                <ToggleGroupItem key={size} value={size} aria-label={`Toggle ${size}`} className="px-3">
                  {size}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </aside>
  );
};