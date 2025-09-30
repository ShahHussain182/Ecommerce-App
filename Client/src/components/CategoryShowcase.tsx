import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { useCategories } from '@/hooks/useCategories'; // Import the new hook
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Tag } from "lucide-react";
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion'; // Import motion

// Placeholder images for categories without specific images
const DEFAULT_CATEGORY_IMAGE = "/placeholder.svg";

export const CategoryShowcase = () => {
  const { data: categories, isLoading, isError, error } = useCategories();
  const displayedCategories = categories?.slice(0, 4) || []; // Show up to 4 categories initially

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-10">Shop by Category</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="w-full h-48 object-cover" />
                <CardContent className="p-4 text-center">
                  <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                  <Skeleton className="h-4 w-full mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-10">Shop by Category</h2>
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load categories. {error instanceof Error ? error.message : 'Unknown error'}
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-10">Shop by Category</h2>
          <div className="text-center py-8">
            <Tag className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No categories found</h3>
            <p className="mt-1 text-sm text-gray-500">Check back later for new categories!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-10">Shop by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayedCategories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link to={`/products?category=${encodeURIComponent(category.name)}`}>
                <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                  <img
                    src={DEFAULT_CATEGORY_IMAGE} 
                    alt={category.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <CardContent className="p-4 text-center">
                    <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">{category.name}</h3>
                    <p className="text-gray-600 text-sm">{category.description || "Explore products in this category."}</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
        {categories.length > 4 && (
          <div className="text-center mt-10">
            <Button asChild variant="outline" size="lg">
              <Link to="/products">View All Categories</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};