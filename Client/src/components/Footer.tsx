import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion'; // Import motion

export const Footer = () => {
  const { data: categories, isLoading, isError } = useCategories();
  const displayedCategories = categories?.slice(0, 5) || [];

  const linkVariants = {
    hover: { scale: 1.05, x: 5, transition: { duration: 0.2 } },
    initial: { scale: 1, x: 0 },
  };

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 py-12 border-t border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-4">E-Store</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
            Your one-stop shop for the latest electronics, trendy clothing, home essentials, and captivating books.
            Discover quality products and exceptional service.
          </p>
          <div className="flex space-x-4 mt-6">
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-blue-400 dark:hover:text-blue-300 transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
              <Youtube size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-50">Quick Links</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <motion.div whileHover="hover" initial="initial" variants={linkVariants}>
                <Link to="/" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors hover:underline hover:underline-offset-4">Home</Link>
              </motion.div>
            </li>
            <li>
              <motion.div whileHover="hover" initial="initial" variants={linkVariants}>
                <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors hover:underline hover:underline-offset-4">About Us</Link>
              </motion.div>
            </li>
            <li>
              <motion.div whileHover="hover" initial="initial" variants={linkVariants}>
                <Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors hover:underline hover:underline-offset-4">Contact Us</Link>
              </motion.div>
            </li>
            <li>
              <motion.div whileHover="hover" initial="initial" variants={linkVariants}>
                <Link to="/cart" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors hover:underline hover:underline-offset-4">Cart</Link>
              </motion.div>
            </li>
            <li>
              <motion.div whileHover="hover" initial="initial" variants={linkVariants}>
                <Link to="/profile" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors hover:underline hover:underline-offset-4">My Account</Link>
              </motion.div>
            </li>
          </ul>
        </div>

        {/* Shop Categories */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-50">Shop</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <motion.div whileHover="hover" initial="initial" variants={linkVariants}>
                <Link to="/products" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors hover:underline hover:underline-offset-4">All Products</Link>
              </motion.div>
            </li>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <li key={i}><Skeleton className="h-4 w-24 bg-gray-200 dark:bg-gray-700" /></li>
              ))
            ) : isError ? (
              <li><span className="text-destructive">Error loading categories</span></li>
            ) : (
              displayedCategories.map((category) => (
                <li key={category._id}>
                  <motion.div whileHover="hover" initial="initial" variants={linkVariants}>
                    <Link to={`/products?category=${encodeURIComponent(category.name)}`} className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors hover:underline hover:underline-offset-4">
                      {category.name}
                    </Link>
                  </motion.div>
                </li>
              ))
            )}
            {categories && categories.length > 5 && (
              <li>
                <motion.div whileHover="hover" initial="initial" variants={linkVariants}>
                  <Link to="/products" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors hover:underline hover:underline-offset-4">
                    More Categories...
                  </Link>
                </motion.div>
              </li>
            )}
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-50">Customer Service</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <motion.div whileHover="hover" initial="initial" variants={linkVariants}>
                <Link to="/contact#faq" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors hover:underline hover:underline-offset-4">FAQ</Link>
              </motion.div>
            </li>
            <li>
              <motion.div whileHover="hover" initial="initial" variants={linkVariants}>
                <Link to="/shipping-returns" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors hover:underline hover:underline-offset-4">Shipping & Returns</Link>
              </motion.div>
            </li>
            <li>
              <motion.div whileHover="hover" initial="initial" variants={linkVariants}>
                <Link to="/press" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors hover:underline hover:underline-offset-4">Press</Link>
              </motion.div>
            </li>
            <li>
              <motion.div whileHover="hover" initial="initial" variants={linkVariants}>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors hover:underline hover:underline-offset-4">Privacy Policy</a>
              </motion.div>
            </li>
            <li>
              <motion.div whileHover="hover" initial="initial" variants={linkVariants}>
                <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors hover:underline hover:underline-offset-4">Terms of Service</a>
              </motion.div>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8 text-center text-sm text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} E-Store. All rights reserved.
      </div>
    </footer>
  );
};