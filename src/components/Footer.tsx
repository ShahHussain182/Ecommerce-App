import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion'; // Import motion

export const Footer = () => {
  const { data: categories, isLoading, isError } = useCategories();
  const displayedCategories = categories?.slice(0, 5) || [];

  const linkVariants = {
    initial: { x: 0, color: "hsl(var(--muted-foreground))", backgroundColor: "transparent", transition: { duration: 0.2 } },
    hover: { x: 8, color: "hsl(var(--primary))", backgroundColor: "hsl(var(--accent))", transition: { duration: 0.2 } },
  };

  return (
    <footer className="bg-muted/50 py-12 border-t text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-4">E-Store</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your one-stop shop for the latest electronics, trendy clothing, home essentials, and captivating books.
            Discover quality products and exceptional service.
          </p>
          <div className="flex space-x-4 mt-6">
            <a href="#" className="text-muted-foreground hover:text-blue-600 transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-muted-foreground hover:text-pink-600 transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-muted-foreground hover:text-blue-400 transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-muted-foreground hover:text-red-600 transition-colors">
              <Youtube size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-foreground">Quick Links</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <motion.div whileHover="hover" initial="initial" variants={linkVariants} className="inline-block rounded-md">
                <Link to="/" className="block px-2 py-1 text-muted-foreground transition-colors">Home</Link>
              </motion.div>
            </li>
            <li>
              <motion.div whileHover="hover" initial="initial" variants={linkVariants} className="inline-block rounded-md">
                <Link to="/about" className="block px-2 py-1 text-muted-foreground transition-colors">About Us</Link>
              </motion.div>
            </li>
            <li>
              <motion.div whileHover="hover" initial="initial" variants={linkVariants} className="inline-block rounded-md">
                <Link to="/contact" className="block px-2 py-1 text-muted-foreground transition-colors">Contact Us</Link>
              </motion.div>
            </li>
            <li>
              <motion.div whileHover="hover" initial="initial" variants={linkVariants} className="inline-block rounded-md">
                <Link to="/cart" className="block px-2 py-1 text-muted-foreground transition-colors">Cart</Link>
              </motion.div>
            </li>
            <li>
              <motion.div whileHover="hover" initial="initial" variants={linkVariants} className="inline-block rounded-md">
                <Link to="/profile" className="block px-2 py-1 text-muted-foreground transition-colors">My Account</Link>
              </motion.div>
            </li>
          </ul>
        </div>

        {/* Shop Categories */}
        <div>
          <h4 className="font-semibold text-foreground">Shop</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <motion.div whileHover="hover" initial="initial" variants={linkVariants} className="inline-block rounded-md">
                <Link to="/products" className="block px-2 py-1 text-muted-foreground transition-colors">All Products</Link>
              </motion.div>
            </li>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <li key={i}><Skeleton className="h-4 w-24 bg-muted" /></li>
              ))
            ) : isError ? (
              <li><span className="text-destructive">Error loading categories</span></li>
            ) : (
              displayedCategories.map((category) => (
                <li key={category._id}>
                  <motion.div whileHover="hover" initial="initial" variants={linkVariants} className="inline-block rounded-md">
                    <Link to={`/products?category=${encodeURIComponent(category.name)}`} className="block px-2 py-1 text-muted-foreground transition-colors">
                      {category.name}
                    </Link>
                  </motion.div>
                </li>
              ))
            )}
            {categories && categories.length > 5 && (
              <li>
                <motion.div whileHover="hover" initial="initial" variants={linkVariants} className="inline-block rounded-md">
                  <Link to="/products" className="block px-2 py-1 text-muted-foreground transition-colors">
                    More Categories...
                  </Link>
                </motion.div>
              </li>
            )}
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="font-semibold text-foreground">Customer Service</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <motion.div whileHover="hover" initial="initial" variants={linkVariants} className="inline-block rounded-md">
                <Link to="/contact#faq" className="block px-2 py-1 text-muted-foreground transition-colors">FAQ</Link>
              </motion.div>
            </li>
            <li>
              <motion.div whileHover="hover" initial="initial" variants={linkVariants} className="inline-block rounded-md">
                <Link to="/shipping-returns" className="block px-2 py-1 text-muted-foreground transition-colors">Shipping & Returns</Link>
              </motion.div>
            </li>
            <li>
              <motion.div whileHover="hover" initial="initial" variants={linkVariants} className="inline-block rounded-md">
                <Link to="/press" className="block px-2 py-1 text-muted-foreground transition-colors">Press</Link>
              </motion.div>
            </li>
            <li>
              <motion.div whileHover="hover" initial="initial" variants={linkVariants} className="inline-block rounded-md">
                <Link to="/privacy-policy" className="block px-2 py-1 text-muted-foreground transition-colors">Privacy Policy</Link>
              </motion.div>
            </li>
            <li>
              <motion.div whileHover="hover" initial="initial" variants={linkVariants} className="inline-block rounded-md">
                <Link to="/terms-of-service" className="block px-2 py-1 text-muted-foreground transition-colors">Terms of Service</Link>
              </motion.div>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} E-Store. All rights reserved.
      </div>
    </footer>
  );
};