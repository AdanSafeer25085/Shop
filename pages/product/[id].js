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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-6xl">
        <Link href="/user">
          <button className="mb-6 bg-gray-700 px-4 py-2 rounded hover:bg-gray-600">
            ← Back to Shop
          </button>
        </Link>

        <div className="bg-gray-800 rounded shadow p-6 flex flex-col md:flex-row gap-6">
          {/* Left: Main Image/Video */}
          <div className="md:w-1/2 w-full">
            {mainMedia?.type === "image" ? (
              <img
                src={mainMedia.src}
                alt={product.name}
                className="w-full h-80 object-contain rounded"
              />
            ) : (
              <video controls className="w-full h-80 rounded">
                <source src={mainMedia.src} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}

            <div className="flex mt-4 gap-2 overflow-x-auto">
              {product.images?.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`Image ${idx + 1}`}
                  onClick={() => handleMediaClick("image", img)}
                  className="h-20 w-20 object-cover rounded cursor-pointer border border-gray-600 hover:border-white"
                />
              ))}
              {product.video && (
                <div
                  onClick={() => handleMediaClick("video", product.video)}
                  className="h-20 w-20 bg-black flex items-center justify-center rounded cursor-pointer border border-gray-600 hover:border-white"
                >
                  <span className="text-xs text-white">🎥 Video</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="md:w-1/2 w-full flex flex-col justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
              <p className="text-gray-300 mb-4">{product.description}</p>
              <p className="text-green-400 font-bold text-2xl mb-6">
                ${product.price}
              </p>
            </div>

            <Link
              href={{
                pathname: "/checkout",
                query: { product: encodeURIComponent(JSON.stringify(product)) },
              }}
            >
              <button className="mt-6 bg-blue-600 px-6 py-2 rounded hover:bg-blue-700">
                Proceed to Checkout
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
