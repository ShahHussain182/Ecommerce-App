import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-100 py-12 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Company Info */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">E-Store</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            Your one-stop shop for the latest electronics, trendy clothing, home essentials, and captivating books.
            Discover quality products and exceptional service.
          </p>
          <div className="flex space-x-4 mt-6">
            <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
              <Facebook size={20} />
            </a>
            <a href="#" className="text-gray-600 hover:text-pink-600 transition-colors">
              <Instagram size={20} />
            </a>
            <a href="#" className="text-gray-600 hover:text-blue-400 transition-colors">
              <Twitter size={20} />
            </a>
            <a href="#" className="text-gray-600 hover:text-red-600 transition-colors">
              <Youtube size={20} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-gray-900">Quick Links</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/" className="text-gray-600 hover:text-black transition-colors">Home</Link></li>
            <li><Link to="/about" className="text-gray-600 hover:text-black transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="text-gray-600 hover:text-black transition-colors">Contact Us</Link></li>
            <li><Link to="/cart" className="text-gray-600 hover:text-black transition-colors">Cart</Link></li>
            <li><Link to="/profile" className="text-gray-600 hover:text-black transition-colors">My Account</Link></li>
          </ul>
        </div>

        {/* Shop Categories */}
        <div>
          <h4 className="font-semibold text-gray-900">Shop</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/products" className="text-gray-600 hover:text-black transition-colors">All Products</Link></li>
            <li><Link to="/category/electronics" className="text-gray-600 hover:text-black transition-colors">Electronics</Link></li>
            <li><Link to="/category/clothing" className="text-gray-600 hover:text-black transition-colors">Clothing</Link></li>
            <li><Link to="/category/home-kitchen" className="text-gray-600 hover:text-black transition-colors">Home & Kitchen</Link></li>
            <li><Link to="/category/books" className="text-gray-600 hover:text-black transition-colors">Books</Link></li>
          </ul>
        </div>

        {/* Customer Service */}
        <div>
          <h4 className="font-semibold text-gray-900">Customer Service</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/contact#faq" className="text-gray-600 hover:text-black transition-colors">FAQ</Link></li>
            <li><a href="#" className="text-gray-600 hover:text-black transition-colors">Shipping & Returns</a></li>
            <li><a href="#" className="text-gray-600 hover:text-black transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="text-gray-600 hover:text-black transition-colors">Terms of Service</a></li>
          </ul>
        </div>
      </div>
      <div className="mt-12 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} E-Store. All rights reserved.
      </div>
    </footer>
  );
};