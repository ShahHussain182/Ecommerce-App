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
import { cn } from '@/lib/utils'; // Import cn for conditional classnames

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

  // Ensure availableCategories is always an array, even if categories is null/undefined initially
  const availableCategories = categories || []; 
  const displayedCategories = showAllCategories
    ? availableCategories
    : availableCategories.slice(0, INITIAL_DISPLAY_CATEGORIES);

  return (
    <aside className="space-y-6 bg-card p-6 rounded-lg shadow-sm border dark:border-gray-700"> {/* Enhanced card styling */}
      <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
        <h3 className="text-xl font-bold text-foreground">Filters</h3>
        <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-muted-foreground hover:text-primary">Clear all</Button>
      </div>
      <Accordion type="multiple" defaultValue={['category', 'price', 'colors', 'sizes']} className="w-full"> {/* Expanded default open items */}
        <AccordionItem value="category" className="border-b dark:border-gray-800">
          <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline hover:text-primary transition-colors">Category</AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
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
                      className="border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                    />
                    <Label htmlFor={`cat-${category.name}`} className="font-normal text-muted-foreground cursor-pointer hover:text-foreground transition-colors">{category.name}</Label>
                  </div>
                ))}
                {availableCategories.length > INITIAL_DISPLAY_CATEGORIES && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="px-0 pt-2 text-primary hover:underline"
                  >
                    {showAllCategories ? 'Show Less' : 'Show More'}
                  </Button>
                )}
              </>
            )}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="price" className="border-b dark:border-gray-800">
          <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline hover:text-primary transition-colors">Price</AccordionTrigger>
          <AccordionContent className="pt-4">
            <RangeSlider
              min={0}
              max={500}
              step={10}
              value={filters.priceRange}
              onValueChange={(value) => onFilterChange({ priceRange: value as [number, number] })}
              className="px-1"
            />
            <div className="flex justify-between text-sm text-muted-foreground mt-3 font-medium">
              <span>${filters.priceRange?.[0] || 0}</span>
              <span>${filters.priceRange?.[1] || 500}</span>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="colors" className="border-b dark:border-gray-800">
          <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline hover:text-primary transition-colors">Colors</AccordionTrigger>
          <AccordionContent>
            <ToggleGroup
              type="multiple"
              value={filters.colors}
              onValueChange={(value) => onFilterChange({ colors: value as string[] })}
              className="flex flex-wrap gap-2 pt-2"
            >
              {COLORS.map(color => (
                <ToggleGroupItem 
                  key={color} 
                  value={color} 
                  aria-label={`Toggle ${color}`} 
                  className={cn(
                    "h-8 w-8 rounded-full border-2 transition-all duration-200",
                    "data-[state=on]:border-primary data-[state=on]:ring-2 data-[state=on]:ring-primary data-[state=on]:ring-offset-2",
                    "hover:scale-110",
                    color.toLowerCase() === 'white' && 'border-gray-300' // Add a visible border for white color
                  )}
                  style={{ backgroundColor: color.toLowerCase() }} 
                />
              ))}
            </ToggleGroup>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="sizes">
          <AccordionTrigger className="text-lg font-semibold text-foreground hover:no-underline hover:text-primary transition-colors">Sizes</AccordionTrigger>
          <AccordionContent>
            <ToggleGroup
              type="multiple"
              value={filters.sizes}
              onValueChange={(value) => onFilterChange({ sizes: value as string[] })}
              className="flex flex-wrap gap-2 pt-2"
            >
              {SIZES.map(size => (
                <ToggleGroupItem 
                  key={size} 
                  value={size} 
                  aria-label={`Toggle ${size}`} 
                  className="px-4 py-2 rounded-md border-2 text-sm font-medium transition-all duration-200
                             data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary
                             hover:bg-accent hover:text-accent-foreground"
                >
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