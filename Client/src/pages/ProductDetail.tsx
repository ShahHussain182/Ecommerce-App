"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useProductById } from '@/hooks/useProductById';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore'; // Import wishlist store
import { ProductVariant } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { RelatedProducts } from '@/components/RelatedProducts';
import { ProductDetailSkeleton } from '@/components/ProductDetailSkeleton';
import { ProductVariantSelector } from '@/components/ProductVariantSelector';
import { StockIndicator } from '@/components/StockIndicator';
import { StickyAddToCartBar } from '@/components/StickyAddToCartBar';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Minus, Plus, Terminal, ChevronLeft, ChevronRight, X, Heart } from 'lucide-react'; // Import Heart icon
import { cn } from '@/lib/utils';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = id || '';

  const { data: product, isLoading, isError, error } = useProductById(productId);
  const addItemToCart = useCartStore((state) => state.addItem);
  const { isAuthenticated } = useAuthStore();
  
  const addItemToWishlist = useWishlistStore((state) => state.addItemToWishlist); // Get wishlist actions
  const removeItemFromWishlist = useWishlistStore((state) => state.removeItemFromWishlist);
  const isItemInWishlist = useWishlistStore((state) => state.isItemInWishlist);
  const wishlistItems = useWishlistStore((state) => state.wishlist?.items || []);

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(undefined);

  const isMobile = useIsMobile();
  const addToCartSectionRef = useRef<HTMLDivElement>(null);
  const [isStickyBarVisible, setIsStickyBarVisible] = useState(false);

  useEffect(() => {
    if (product && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  useEffect(() => {
    if (product && product.imageUrls.length > 0) {
      setSelectedImageIndex(0);
    }
  }, [product]);

  useEffect(() => {
    if (isMobile) return;

    const headerHeight = 64; // h-16 is 4rem = 64px

    const handleScroll = () => {
      if (addToCartSectionRef.current) {
        const { bottom } = addToCartSectionRef.current.getBoundingClientRect();
        if (bottom < headerHeight) {
          setIsStickyBarVisible(true);
        } else {
          setIsStickyBarVisible(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile]);

  const handleQuantityChange = (amount: number) => {
    setQuantity((prev) => Math.max(1, prev + amount));
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.info("Please log in to add items to your cart.");
      navigate('/login');
      return;
    }

    if (selectedVariant && product) {
      addItemToCart(product, selectedVariant, quantity);
    }
  };

  const handleToggleWishlist = () => {
    if (!isAuthenticated) {
      toast.info("Please log in to add items to your wishlist.");
      navigate('/login');
      return;
    }

    if (selectedVariant && product) {
      const isInList = isItemInWishlist(product._id, selectedVariant._id);
      if (isInList) {
        const wishlistItemId = wishlistItems.find(item => item.productId._id === product._id && item.variantId === selectedVariant._id)?._id;
        if (wishlistItemId) {
          removeItemFromWishlist(wishlistItemId);
        }
      } else {
        addItemToWishlist(product, selectedVariant);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePosition({ x, y });
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxImageIndex((prevIndex) =>
      prevIndex === 0 ? product!.imageUrls.length - 1 : prevIndex - 1
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxImageIndex((prevIndex) =>
      prevIndex === product!.imageUrls.length - 1 ? 0 : prevIndex + 1
    );
  };

  if (isLoading || (!product && !isError)) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow">
          <ProductDetailSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error instanceof Error ? error.message : 'Could not load product.'}
              <Button variant="link" onClick={() => navigate('/')} className="p-0 h-auto ml-2">Return to Home</Button>
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  const isInWishlist = selectedVariant ? isItemInWishlist(product._id, selectedVariant._id) : false;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Header />
      {!isMobile && (
        <StickyAddToCartBar
          isVisible={isStickyBarVisible}
          product={product}
          selectedVariant={selectedVariant}
          quantity={quantity}
          onQuantityChange={handleQuantityChange}
          onAddToCart={handleAddToCart}
        />
      )}
      <main className="flex-grow">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link to="/">Home</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild><Link to="/products">Products</Link></BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
                <DialogTrigger asChild>
                  <div 
                    className="relative overflow-hidden rounded-lg border cursor-zoom-in"
                    onMouseEnter={() => setIsZoomed(true)}
                    onMouseLeave={() => setIsZoomed(false)}
                    onMouseMove={handleMouseMove}
                    onClick={() => {
                      setLightboxImageIndex(selectedImageIndex);
                      setIsLightboxOpen(true);
                    }}
                  >
                    <img 
                      src={product.imageUrls[selectedImageIndex]}
                      alt={product.name} 
                      className="w-full h-auto aspect-square object-cover transition-transform duration-300 ease-in-out"
                      style={{
                        transform: isZoomed ? 'scale(2)' : 'scale(1)',
                        transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                      }}
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="bg-transparent border-none p-0">
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
                    <div className="relative">
                      <img
                        src={product.imageUrls[lightboxImageIndex]}
                        alt={`${product.name} enlarged view`}
                        className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
                      />
                      <Button variant="ghost" size="icon" onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/75 rounded-full h-10 w-10 z-10"><ChevronLeft className="h-6 w-6" /></Button>
                      <Button variant="ghost" size="icon" onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/75 rounded-full h-10 w-10 z-10"><ChevronRight className="h-6 w-6" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => setIsLightboxOpen(false)} className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/75 rounded-full h-10 w-10 z-10"><X className="h-6 w-6" /></Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <div className="grid grid-cols-5 gap-4 mt-4">
                {product.imageUrls.map((img, index) => (
                  <button key={index} onClick={() => setSelectedImageIndex(index)} className={`rounded-lg overflow-hidden border-2 transition-colors ${selectedImageIndex === index ? 'border-primary' : 'border-transparent hover:border-gray-300'}`}>
                    <img src={img} alt={`${product.name} thumbnail ${index + 1}`} className="w-full h-auto aspect-square object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col space-y-6">
              <h1 className="text-4xl font-bold tracking-tight">{product.name}</h1>
              
              <div>
                <p className="text-3xl font-semibold">${selectedVariant?.price.toFixed(2)}</p>
                {selectedVariant && <StockIndicator stock={selectedVariant.stock} />}
              </div>
              
              {product.variants.length > 1 && (
                <ProductVariantSelector variants={product.variants} onChange={setSelectedVariant} />
              )}

              <div ref={addToCartSectionRef} className="flex items-center space-x-4">
                <div className="flex items-center">
                  <Button variant="outline" size="icon" onClick={() => handleQuantityChange(-1)}><Minus className="h-4 w-4" /></Button>
                  <Input type="number" value={quantity} readOnly className="w-16 text-center" />
                  <Button variant="outline" size="icon" onClick={() => handleQuantityChange(1)}><Plus className="h-4 w-4" /></Button>
                </div>
                <Button size="lg" className="flex-grow" onClick={handleAddToCart} disabled={!selectedVariant || selectedVariant.stock === 0}>
                  {selectedVariant?.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleToggleWishlist}
                  disabled={!isAuthenticated}
                  className={cn(
                    "h-12 w-12",
                    isInWishlist ? "text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600" : "text-gray-500 hover:bg-gray-50 hover:text-gray-600"
                  )}
                >
                  <Heart className={cn("h-6 w-6", isInWishlist && "fill-red-500")} />
                </Button>
              </div>

              <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>Description</AccordionTrigger>
                  <AccordionContent>{product.description}</AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
        <RelatedProducts currentProductId={product._id} />
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;