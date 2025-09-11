import { Product, ProductVariant, PaginatedProductsResponse, FetchProductsParams } from "@/types";

const CATEGORIES = ["Electronics", "Apparel", "Accessories", "Wearables", "Home Goods"];
const COLORS = ["Black", "White", "Red", "Blue", "Green", "Gray", "Silver"];
const SIZES = ["S", "M", "L", "XL", "One Size"];
const ADJECTIVES = ["Premium", "Sleek", "Ergonomic", "Stylish", "Durable", "Smart", "Organic"];
const NOUNS = ["Gadget", "T-Shirt", "Bottle", "Watch", "Lamp", "Headphones", "Tracker", "Keyboard"];

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomPrice = (min: number, max: number): number => parseFloat((Math.random() * (max - min) + min).toFixed(2));
const getRandomStock = (): number => Math.floor(Math.random() * 101);

const generateMockProducts = (count: number): Product[] => {
  const products: Product[] = [];
  for (let i = 1; i <= count; i++) {
    const category = getRandomElement(CATEGORIES);
    const hasVariants = category === "Apparel";
    const numVariants = hasVariants ? Math.floor(Math.random() * 4) + 1 : 1;
    const variants: ProductVariant[] = [];

    for (let j = 1; j <= numVariants; j++) {
      variants.push({
        id: i * 100 + j,
        size: hasVariants ? getRandomElement(SIZES.slice(0, -1)) : "One Size",
        color: getRandomElement(COLORS),
        price: getRandomPrice(10, 500),
        stock: getRandomStock(),
      });
    }

    products.push({
      id: i,
      name: `${getRandomElement(ADJECTIVES)} ${getRandomElement(NOUNS)}`,
      imageUrls: ["/placeholder.svg", "/favicon.ico"],
      description: "A high-quality, modern product designed to enhance your lifestyle. Built with the finest materials and attention to detail.",
      category,
      variants,
    });
  }
  return products;
};

const allProducts: Product[] = generateMockProducts(100);

export const fetchProducts = async ({
  pageParam = 1,
  filters,
}: FetchProductsParams): Promise<PaginatedProductsResponse> => {
  console.log(`Fetching products page: ${pageParam}`, filters);
  await new Promise(resolve => setTimeout(resolve, 500));

  let filteredProducts = [...allProducts];

  // Filtering
  if (filters.categories?.length) {
    filteredProducts = filteredProducts.filter(p => filters.categories.includes(p.category));
  }
  if (filters.priceRange) {
    // Filter based on the price of the first variant, which is typically displayed
    filteredProducts = filteredProducts.filter(p => 
      p.variants[0].price >= filters.priceRange[0] && p.variants[0].price <= filters.priceRange[1]
    );
  }
  if (filters.colors?.length) {
    filteredProducts = filteredProducts.filter(p => 
      p.variants.some(v => filters.colors.includes(v.color))
    );
  }
  if (filters.sizes?.length) {
    filteredProducts = filteredProducts.filter(p => 
      p.variants.some(v => filters.sizes.includes(v.size))
    );
  }

  // Sorting
  if (filters.sortBy) {
    filteredProducts.sort((a, b) => {
      const priceA = a.variants[0].price;
      const priceB = b.variants[0].price;
      switch (filters.sortBy) {
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }

  // Pagination
  const limit = 12;
  const offset = (pageParam - 1) * limit;
  const paginatedProducts = filteredProducts.slice(offset, offset + limit);
  const nextPage = offset + limit < filteredProducts.length ? pageParam + 1 : null;

  return {
    products: paginatedProducts,
    nextPage,
    totalProducts: filteredProducts.length,
  };
};

interface FetchSearchResultsParams {
  pageParam?: number;
  searchTerm: string;
}

export const searchProducts = async ({
  pageParam = 1,
  searchTerm,
}: FetchSearchResultsParams): Promise<PaginatedProductsResponse> => {
  console.log(`Searching for "${searchTerm}", page: ${pageParam}`);
  await new Promise(resolve => setTimeout(resolve, 500));

  const lowerCaseSearchTerm = searchTerm.toLowerCase();

  let filteredProducts = allProducts.filter(product =>
    product.name.toLowerCase().includes(lowerCaseSearchTerm) ||
    product.description.toLowerCase().includes(lowerCaseSearchTerm) ||
    product.category.toLowerCase().includes(lowerCaseSearchTerm) ||
    product.variants.some(variant =>
      variant.color.toLowerCase().includes(lowerCaseSearchTerm) ||
      variant.size.toLowerCase().includes(lowerCaseSearchTerm)
    )
  );

  // For search, we might want a default sort, e.g., by relevance (which is implicit here)
  // or by name. Let's default to name-asc for consistency if no explicit relevance.
  filteredProducts.sort((a, b) => a.name.localeCompare(b.name));


  // Pagination
  const limit = 12;
  const offset = (pageParam - 1) * limit;
  const paginatedProducts = filteredProducts.slice(offset, offset + limit);
  const nextPage = offset + limit < filteredProducts.length ? pageParam + 1 : null;

  return {
    products: paginatedProducts,
    nextPage,
    totalProducts: filteredProducts.length,
  };
};


export const fetchFeaturedProducts = async (): Promise<Product[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return Promise.resolve(allProducts.slice(0, 4));
};

export const fetchProductById = async (id: number): Promise<Product> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const product = allProducts.find((p) => p.id === id);
  if (!product) {
    return Promise.reject(new Error(`Product with id ${id} not found`));
  }
  return Promise.resolve(product);
};