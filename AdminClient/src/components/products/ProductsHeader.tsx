import { Button } from '@/components/ui/button';
import { DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import type { Category } from '@/types';

interface ProductsHeaderProps {
  categoriesLoading: boolean;
  categoriesError: Error | null;
  categoryNames: string[];
  setIsAddDialogOpen: (isOpen: boolean) => void;
}

export const ProductsHeader = ({ categoriesLoading, categoriesError, categoryNames, setIsAddDialogOpen }: ProductsHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">Manage your product inventory and details</p>
      </div>

      <DialogTrigger asChild>
        <Button
          disabled={categoriesLoading || !!categoriesError || categoryNames.length === 0}
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </DialogTrigger>
    </div>
  );
};