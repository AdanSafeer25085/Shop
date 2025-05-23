// pages/productDetail.js

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductDetail() {
  const router = useRouter();
  const { data } = router.query;
  const [product, setProduct] = useState(null);
  const [mainMedia, setMainMedia] = useState(null);

  useEffect(() => {
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setProduct(parsed);
        const coverImage = parsed.images?.[parsed.coverIndex ?? 0];
        setMainMedia({ type: "image", src: coverImage });
      } catch (err) {
        console.error("Failed to parse product data:", err);
      }
    }
  }, [data]);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <p>Loading product...</p>
      </div>
    );
  }

  const handleMediaClick = (type, src) => {
    setMainMedia({ type, src });
  };

  const handleAddOrUpdateProduct = async (e) => {
    e.preventDefault();
    const { name, price, category } = productForm;
    if (!name.trim() || !price.trim() || !category.trim()) return;

    if (editingIndex !== null) {
      const id = products[editingIndex].id;
      const { error } = await supabase
        .from("products")
        .update(productForm)
        .eq("id", id);
      if (!error) {
        await fetchProducts();
        resetForm();
      } else {
        console.error("Error updating product:", error);
        alert("Failed to update product");
      }
    } else {
      const { error } = await supabase.from("products").insert([productForm]);
      if (!error) {
        await fetchProducts();
        resetForm();
      } else {
        console.error("Error inserting product:", error);
        alert("Failed to add product");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto pt-20 px-4">
        <Link href="/user">
          <button className="mb-6 bg-gray-700 px-4 py-2 rounded hover:bg-gray-600 text-white">
            ← Back to Shop
          </button>
        </Link>

        <div className="bg-gray-800 rounded-lg shadow-lg p-6 text-white">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left: Main Image/Video */}
            <div className="md:w-1/2">
              <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-700">
                {mainMedia?.type === "image" ? (
                  <img
                    src={mainMedia.src}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video controls className="w-full h-full">
                    <source src={mainMedia.src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>

              <div className="mt-4">
                <div className="flex gap-2 overflow-x-auto py-2">
                  {product.images?.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Image ${idx + 1}`}
                      onClick={() => handleMediaClick("image", img)}
                      className="h-20 w-20 object-cover rounded-lg cursor-pointer border-2 border-gray-600 hover:border-blue-500 transition-colors"
                    />
                  ))}
                  {product.video && (
                    <div
                      onClick={() => handleMediaClick("video", product.video)}
                      className="h-20 w-20 bg-gray-700 flex items-center justify-center rounded-lg cursor-pointer border-2 border-gray-600 hover:border-blue-500 transition-colors"
                    >
                      <span className="text-white">🎥</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Product Info */}
            <div className="md:w-1/2">
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
              {product.description && (
                <p className="text-gray-300 mb-6">{product.description}</p>
              )}
              <div className="space-y-4">
                {product.discount > 0 ? (
                  <>
                    <p className="text-2xl text-gray-400 line-through">Rs{product.price}</p>
                    <p className="text-3xl font-bold text-green-500">
                      Rs{(product.price - (product.price * product.discount / 100)).toFixed(2)}
                      <span className="ml-2 text-lg text-green-400">({product.discount}% OFF)</span>
                    </p>
                  </>
                ) : (
                  <p className="text-3xl font-bold text-green-500">Rs{product.price}</p>
                )}
              </div>

              <Link
                href={{
                  pathname: "/checkout",
                  query: { product: encodeURIComponent(JSON.stringify(product)) },
                }}
              >
                <button className="mt-8 w-full bg-blue-600 px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
                  Proceed to Checkout
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
