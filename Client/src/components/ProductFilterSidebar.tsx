import { useState } from 'react';
import { FilterState } from '@/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from './ui/button';
import { Label } from './ui/label';
import { RangeSlider } from './RangeSlider';
import { useCategories } from '@/hooks/useCategories'; // Import the new hook
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface ProductFilterSidebarProps {
  filters: FilterState;
  onFilterChange: (newFilters: Partial<FilterState>) => void;
  onClearFilters: () => void;
}

const COLORS = ["Black", "White", "Red", "Blue", "Green", "Gray", "Silver"];
const SIZES = ["S", "M", "L", "XL"];
const INITIAL_DISPLAY_CATEGORIES = 5; // Number of categories to show initially

export const ProductFilterSidebar = ({ filters, onFilterChange, onClearFilters }: ProductFilterSidebarProps) => {
  const { data: categories, isLoading: categoriesLoading, isError: categoriesError } = useCategories();
  const [showAllCategories, setShowAllCategories] = useState(false);

  const availableCategories = categories; // categories is now guaranteed to be an array
  const displayedCategories = showAllCategories
    ? availableCategories
    : availableCategories.slice(0, INITIAL_DISPLAY_CATEGORIES);

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
            {categoriesLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading categories...</span>
              </div>
            ) : categoriesError ? (
              <p className="text-destructive text-sm">Error loading categories.</p>
            ) : availableCategories.length === 0 ? (
              <p className="text-muted-foreground text-sm">No categories available.</p>
            ) : (
              <>
                {displayedCategories.map(category => (
                  <div key={category._id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${category.name}`}
                      checked={filters.categories?.includes(category.name) || false}
                      onCheckedChange={(checked) => {
                        const newCategories = checked
                          ? [...(filters.categories || []), category.name]
                          : (filters.categories || []).filter(c => c !== category.name);
                        onFilterChange({ categories: newCategories });
                      }}
                    />
                    <Label htmlFor={`cat-${category.name}`} className="font-normal">{category.name}</Label>
                  </div>
                ))}
                {availableCategories.length > INITIAL_DISPLAY_CATEGORIES && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="px-0 pt-2 text-primary"
                  >
                    {showAllCategories ? 'Show Less' : 'Show More'}
                  </Button>
                )}
              </>
            )}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="price">
          <AccordionTrigger>Price</AccordionTrigger>
          <AccordionContent className="pt-4">
            <RangeSlider
              min={0}
              max={500}
              step={10}
              value={filters.priceRange}
              onValueChange={(value) => onFilterChange({ priceRange: value as [number, number] })}
            />
            <div className="flex justify-between text-sm text-gray-600 mt-2">
              <span>${filters.priceRange?.[0] || 0}</span>
              <span>${filters.priceRange?.[1] || 500}</span>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="colors">
          <AccordionTrigger>Colors</AccordionTrigger>
          <AccordionContent>
            <ToggleGroup
              type="multiple"
              value={filters.colors}
              onValueChange={(value) => onFilterChange({ colors: value as string[] })}
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
              onValueChange={(value) => onFilterChange({ sizes: value as string[] })}
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