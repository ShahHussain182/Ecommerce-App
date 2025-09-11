import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

const categories = [
  { name: "Electronics", imageUrl: "/placeholder.svg", description: "Gadgets and gear for the modern world." },
  { name: "Apparel", imageUrl: "/placeholder.svg", description: "Fashion-forward clothing for every style." },
  { name: "Accessories", imageUrl: "/placeholder.svg", description: "The perfect finishing touches for any outfit." },
  { name: "Home Goods", imageUrl: "/placeholder.svg", description: "Elevate your living space with our essentials." },
];

export const CategoryShowcase = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-10">Shop by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <Link to={`/products?category=${category.name}`} key={category.name}>
              <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <CardContent className="p-4 text-center">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary">{category.name}</h3>
                  <p className="text-gray-600 text-sm">{category.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};