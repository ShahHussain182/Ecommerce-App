import { cn } from '@/lib/utils';

interface StockIndicatorProps {
  stock: number;
}

export const StockIndicator = ({ stock }: StockIndicatorProps) => {
  let stockText: string;
  let stockColorClass: string;

  if (stock === 0) {
    stockText = "Out of Stock";
    stockColorClass = "text-red-600";
  } else if (stock > 0 && stock <= 5) {
    stockText = `Only ${stock} left!`;
    stockColorClass = "text-yellow-600 font-semibold";
  } else {
    stockText = "In Stock";
    stockColorClass = "text-green-600";
  }

  return (
    <p className={cn("text-sm mt-1", stockColorClass)}>
      {stockText}
    </p>
  );
};