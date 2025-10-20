// import { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { ArrowLeft, Star, Plus, Minus, ShoppingCart, Heart, Share2 } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { useCart } from '@/contexts/CartContext';
// import config from '../config';


// interface Product {
//   product_id: number;
//   product_name: string;
//   product_price: number;
//   product_description: string;
//   product_image: string;
//   // Future fields that need backend support
//   product_images?: string[]; // Array of image URLs
//   reviews?: Review[];
//   stock?: number;
//   category?: string;
//   subcategory?: string;
//   view_count?: number;
// }

// interface Review {
//   id: number;
//   user_name: string;
//   rating: number;
//   comment: string;
//   date: string;
// }

// export default function ProductDetail() {
//   const { id } = useParams<{ id: string }>();
//   const navigate = useNavigate();
//   const [product, setProduct] = useState<Product | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [selectedImageIndex, setSelectedImageIndex] = useState(0);
//   const [quantity, setQuantity] = useState(1);
//   const [isFavorite, setIsFavorite] = useState(false);
//   const { addToCart } = useCart();

//   useEffect(() => {
//     if (id) {
//       fetchProduct(parseInt(id));
//     }
//   }, [id]);

//   const fetchProduct = async (productId: number) => {
//     try {
//       // const response = await fetch(`http://localhost:9004/v1/products/${productId}`);
//       const response = await fetch(config.PRODUCT_DETAIL(productId));
//       if (response.ok) {
//         const result = await response.json();
//         if (result.status === 1 && result.data) {
//           setProduct(result.data);
//         } else {
//           navigate('/');
//         }
//       } else {
//         navigate('/');
//       }
//     } catch (error) {
//       console.error('Error fetching product:', error);
//       navigate('/');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddToCart = () => {
//     if (!product) return;
    
//     for (let i = 0; i < quantity; i++) {
//       addToCart({
//         id: product.product_id,
//         name: product.product_name,
//         price: product.product_price,
//         image: product.product_image,
//         description: product.product_description
//       });
//     }
    
//     // Reset quantity after adding
//     setQuantity(1);
//   };

//   const incrementQuantity = () => {
//     setQuantity(prev => prev + 1);
//   };

//   const decrementQuantity = () => {
//     setQuantity(prev => Math.max(1, prev - 1));
//   };

//   const handleShare = async () => {
//     if (navigator.share) {
//       try {
//         await navigator.share({
//           title: product?.product_name,
//           text: product?.product_description,
//           url: window.location.href,
//         });
//       } catch (error) {
//         console.log('Error sharing:', error);
//       }
//     } else {
//       // Fallback: copy to clipboard
//       navigator.clipboard.writeText(window.location.href);
//       alert('Product link copied to clipboard!');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="flex items-center justify-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
//         </div>
//       </div>
//     );
//   }

//   if (!product) {
//     return (
//       <div className="container mx-auto px-4 py-8 text-center">
//         <h1 className="text-2xl font-bold mb-4">Product not found</h1>
//         <Button onClick={() => navigate('/')}>Back to Home</Button>
//       </div>
//     );
//   }

//   // Use product_images array if available, otherwise use single product_image
//   let productImages: string[] = [];
//   if (Array.isArray(product.product_image) && product.product_image.length > 0) {
//     productImages = product.product_image;
//   } else if (product.product_images && product.product_images.length > 0) {
//     productImages = product.product_images;
//   } else if (typeof product.product_image === 'string' && product.product_image) {
//     productImages = [product.product_image];
//   }

//   const averageRating = product.reviews && product.reviews.length > 0
//     ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length
//     : 0;

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* Back Button */}
//       <Button
//         variant="ghost"
//         onClick={() => navigate(-1)}
//         className="mb-6 flex items-center space-x-2"
//       >
//         <ArrowLeft className="w-4 h-4" />
//         <span>Back</span>
//       </Button>

//       <div className="grid lg:grid-cols-2 gap-12">
//         {/* Product Images */}
//         <div className="space-y-4">
//           {/* Main Image or No Image Message */}
//           {productImages.length > 0 ? (
//             <div className="flex flex-col items-center">
//               <div className="relative w-full max-w-md aspect-square bg-gray-100 rounded-lg overflow-hidden group">
//                 {/* Left Arrow */}
//                 <button
//                   className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white z-10"
//                   onClick={() => setSelectedImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1))}
//                   aria-label="Previous image"
//                 >
//                   <ArrowLeft className="w-6 h-6 text-pink-500" />
//                 </button>
//                 {/* Main Image */}
//                 <img
//                   src={productImages[selectedImageIndex] || '/placeholder.svg'}
//                   alt={`${product.product_name} ${selectedImageIndex + 1}`}
//                   className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
//                   onClick={() => window.open(productImages[selectedImageIndex], '_blank')}
//                 />
//                 {/* Right Arrow */}
//                 <button
//                   className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white z-10"
//                   onClick={() => setSelectedImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1))}
//                   aria-label="Next image"
//                 >
//                   <ArrowLeft className="w-6 h-6 text-pink-500 rotate-180" />
//                 </button>
//                 <div className="absolute top-4 right-4 flex space-x-2">
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     className="bg-white/80 hover:bg-white"
//                     onClick={() => setIsFavorite(!isFavorite)}
//                   >
//                     <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
//                   </Button>
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     className="bg-white/80 hover:bg-white"
//                     onClick={handleShare}
//                   >
//                     <Share2 className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </div>
//               {/* Dots/Thumbnails */}
//               <div className="flex items-center justify-center mt-4 space-x-2">
//                 {productImages.map((img, idx) => (
//                   <button
//                     key={idx}
//                     className={`w-4 h-4 rounded-full border-2 ${selectedImageIndex === idx ? 'border-pink-500 bg-pink-500' : 'border-gray-300 bg-gray-200'} focus:outline-none`}
//                     onClick={() => setSelectedImageIndex(idx)}
//                     aria-label={`Go to image ${idx + 1}`}
//                   />
//                 ))}
//               </div>
//             </div>
//           ) : (
//             <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
//               <img src="/placeholder.svg" alt="No product image" className="w-16 h-16 mb-4 opacity-60" />
//               <span className="text-gray-500 text-lg">No image available for this product.</span>
//             </div>
//           )}
//         </div>

//         {/* Product Information */}
//         <div className="space-y-6">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.product_name}</h1>
            
//             {/* Rating and Views */}
//             <div className="flex items-center space-x-4 mb-4">
//               {product.reviews && product.reviews.length > 0 && (
//                 <div className="flex items-center space-x-2">
//                   <div className="flex items-center">
//                     {[...Array(5)].map((_, i) => (
//                       <Star
//                         key={i}
//                         className={`w-5 h-5 ${
//                           i < Math.floor(averageRating)
//                             ? 'fill-yellow-400 text-yellow-400'
//                             : 'text-gray-300'
//                         }`}
//                       />
//                     ))}
//                   </div>
//                   <span className="text-gray-600">
//                     {averageRating.toFixed(1)} ({product.reviews.length} reviews)
//                   </span>
//                 </div>
//               )}
              
//               {product.view_count && (
//                 <span className="text-gray-500 text-sm">
//                   {product.view_count} views
//                 </span>
//               )}
//             </div>
            
//             <div className="text-3xl font-bold text-pink-600 mb-4">
//               ₹{product.product_price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
//             </div>
//           </div>

//           {/* Description */}
//           <div>
//             <h3 className="text-lg font-semibold mb-2">Description</h3>
//             <p className="text-gray-600 leading-relaxed">{product.product_description}</p>
//           </div>

//           {/* Stock Status */}
//           {product.stock !== undefined && (
//             <div className="flex items-center space-x-2">
//               <span className="font-medium">Availability:</span>
//               <span className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}>
//                 {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
//               </span>
//             </div>
//           )}

//           {/* Quantity and Add to Cart */}
//           <div className="space-y-4">
//             <div className="flex items-center space-x-4">
//               <span className="font-medium">Quantity:</span>
//               <div className="flex items-center border border-gray-300 rounded-lg">
//                 <button
//                   onClick={decrementQuantity}
//                   className="p-2 hover:bg-gray-100 transition-colors"
//                 >
//                   <Minus className="w-4 h-4" />
//                 </button>
//                 <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
//                 <button
//                   onClick={incrementQuantity}
//                   className="p-2 hover:bg-gray-100 transition-colors"
//                 >
//                   <Plus className="w-4 h-4" />
//                 </button>
//               </div>
//             </div>

//             <div className="flex space-x-4">
//               <Button
//                 onClick={handleAddToCart}
//                 className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 flex items-center justify-center space-x-2"
//                 size="lg"
//                 disabled={product.stock === 0}
//               >
//                 <ShoppingCart className="w-5 h-5" />
//                 <span>Add to Cart</span>
//               </Button>
              
//               <Button
//                 variant="outline"
//                 size="lg"
//                 className="px-8"
//                 onClick={() => {
//                   handleAddToCart();
//                   navigate('/checkout');
//                 }}
//                 disabled={product.stock === 0}
//               >
//                 Buy Now
//               </Button>
//             </div>
//           </div>

//           {/* Product Details */}
//           <div className="border-t pt-6">
//             <h3 className="text-lg font-semibold mb-4">Product Details</h3>
//             <div className="space-y-2 text-sm">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Product ID:</span>
//                 <span>{product.product_id}</span>
//               </div>
//               {product.category && (
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Category:</span>
//                   <span>{product.category}</span>
//                 </div>
//               )}
//               {product.subcategory && (
//                 <div className="flex justify-between">
//                   <span className="text-gray-600">Subcategory:</span>
//                   <span>{product.subcategory}</span>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Reviews Section */}
//       {product.reviews && product.reviews.length > 0 && (
//         <div className="mt-12">
//           <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h2>
//           <div className="space-y-6">
//             {product.reviews.map((review) => (
//               <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-6">
//                 <div className="flex items-center justify-between mb-3">
//                   <div>
//                     <h4 className="font-semibold">{review.user_name}</h4>
//                     <div className="flex items-center mt-1">
//                       {[...Array(5)].map((_, i) => (
//                         <Star
//                           key={i}
//                           className={`w-4 h-4 ${
//                             i < review.rating
//                               ? 'fill-yellow-400 text-yellow-400'
//                               : 'text-gray-300'
//                           }`}
//                         />
//                       ))}
//                     </div>
//                   </div>
//                   <span className="text-sm text-gray-500">{review.date}</span>
//                 </div>
//                 <p className="text-gray-700">{review.comment}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Related Products Section - Placeholder */}
//       <div className="mt-12">
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Products</h2>
//         <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center">
//           <p className="text-gray-500">Related products coming soon</p>
//         </div>
//       </div>
//     </div>
//   );
// }






import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Plus,
  Minus,
  ShoppingCart,
  Heart,
  Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import config from '../config';

interface Product {
  product_id: number;
  product_name: string;
  product_price: number;
  product_description: string;
  product_image?: string | string[];
  product_images?: string[]; // Multiple images support
  reviews?: Review[];
  stock?: number;
  category?: string;
  subcategory?: string;
  view_count?: number;
}

interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
}

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      fetchProduct(parseInt(id));
    }
  }, [id]);

  const fetchProduct = async (productId: number) => {
    try {
      const response = await fetch(config.PRODUCT_DETAIL(productId));
      if (!response.ok) throw new Error('Failed to fetch product');
      const result = await response.json();

      if (result.status === 1 && result.data) {
        setProduct(result.data);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.product_id,
        name: product.product_name,
        price: product.product_price,
        image: getMainImage(),
        description: product.product_description,
      });
    }
    setQuantity(1);
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1));

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.product_name,
          text: product?.product_description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  const getProductImages = (): string[] => {
    if (!product) return [];
    if (Array.isArray(product.product_images) && product.product_images.length > 0)
      return product.product_images;
    if (Array.isArray(product.product_image) && product.product_image.length > 0)
      return product.product_image;
    if (typeof product.product_image === 'string' && product.product_image)
      return [product.product_image];
    return [];
  };

  const getMainImage = (): string => {
    const imgs = getProductImages();
    return imgs[selectedImageIndex] || '/placeholder.svg';
  };

  const productImages = getProductImages();

  const averageRating =
    product?.reviews && product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
        product.reviews.length
      : 0;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Button onClick={() => navigate('/')}>Back to Home</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </Button>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {productImages.length > 0 ? (
            <div className="flex flex-col items-center">
              <div className="relative w-full max-w-md aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                {/* Left Arrow */}
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white z-10"
                  onClick={() =>
                    setSelectedImageIndex((prev) =>
                      prev === 0 ? productImages.length - 1 : prev - 1
                    )
                  }
                  aria-label="Previous image"
                >
                  <ArrowLeft className="w-6 h-6 text-pink-500" />
                </button>

                {/* Main Image */}
                <img
                  src={getMainImage()}
                  alt={`${product.product_name} ${selectedImageIndex + 1}`}
                  className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                  onClick={() => window.open(getMainImage(), '_blank')}
                />

                {/* Right Arrow */}
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white z-10"
                  onClick={() =>
                    setSelectedImageIndex((prev) =>
                      prev === productImages.length - 1 ? 0 : prev + 1
                    )
                  }
                  aria-label="Next image"
                >
                  <ArrowLeft className="w-6 h-6 text-pink-500 rotate-180" />
                </button>

                <div className="absolute top-4 right-4 flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/80 hover:bg-white"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFavorite ? 'fill-red-500 text-red-500' : ''
                      }`}
                    />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/80 hover:bg-white"
                    onClick={handleShare}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Thumbnails / Dots */}
              <div className="flex items-center justify-center mt-4 space-x-2">
                {productImages.map((_, idx) => (
                  <button
                    key={idx}
                    className={`w-4 h-4 rounded-full border-2 ${
                      selectedImageIndex === idx
                        ? 'border-pink-500 bg-pink-500'
                        : 'border-gray-300 bg-gray-200'
                    }`}
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`Go to image ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 bg-gray-100 rounded-lg">
              <img
                src="/placeholder.svg"
                alt="No product image"
                className="w-16 h-16 mb-4 opacity-60"
              />
              <span className="text-gray-500 text-lg">
                No image available for this product.
              </span>
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {product.product_name}
            </h1>

            {/* Rating and Views */}
            <div className="flex items-center space-x-4 mb-4">
              {product.reviews && product.reviews.length > 0 && (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(averageRating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-600">
                    {averageRating.toFixed(1)} ({product.reviews.length} reviews)
                  </span>
                </div>
              )}

              {product.view_count && (
                <span className="text-gray-500 text-sm">
                  {product.view_count} views
                </span>
              )}
            </div>

            <div className="text-3xl font-bold text-pink-600 mb-4">
              ₹
              {product.product_price.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {product.product_description}
            </p>
          </div>

          {/* Stock */}
          {product.stock !== undefined && (
            <div className="flex items-center space-x-2">
              <span className="font-medium">Availability:</span>
              <span
                className={
                  product.stock > 0 ? 'text-green-600' : 'text-red-600'
                }
              >
                {product.stock > 0
                  ? `${product.stock} in stock`
                  : 'Out of stock'}
              </span>
            </div>
          )}

          {/* Quantity and Cart */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Quantity:</span>
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={decrementQuantity}
                  className="p-2 hover:bg-gray-100"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={incrementQuantity}
                  className="p-2 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex space-x-4">
              <Button
                onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 flex items-center justify-center space-x-2"
                size="lg"
                disabled={product.stock === 0}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="px-8"
                onClick={() => {
                  handleAddToCart();
                  navigate('/checkout');
                }}
                disabled={product.stock === 0}
              >
                Buy Now
              </Button>
            </div>
          </div>

          {/* Product Details */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Product Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Product ID:</span>
                <span>{product.product_id}</span>
              </div>
              {product.category && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span>{product.category}</span>
                </div>
              )}
              {product.subcategory && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Subcategory:</span>
                  <span>{product.subcategory}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Customer Reviews
          </h2>
          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white border border-gray-200 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{review.user_name}</h4>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{review.date}</span>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Related Products
        </h2>
        <div className="bg-gray-100 h-32 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Related products coming soon</p>
        </div>
      </div>
    </div>
  );
}
