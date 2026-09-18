// pages/product/[id].js
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function ProductDetail() {
  const router = useRouter();
  const { data } = router.query;
  const [product, setProduct] = useState(null);
  const [mainMedia, setMainMedia] = useState(null);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(to bottom, #000428, #001a4a)" }}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading product…</p>
        </div>
      </div>
    );
  }

  const discountedPrice =
    product.discount > 0
      ? (product.price - (product.price * product.discount) / 100).toFixed(2)
      : null;

  const handleMediaClick = (type, src, idx) => {
    setMainMedia({ type, src });
    if (typeof idx === "number") setActiveImgIdx(idx);
  };

  const handleCheckout = () => {
    router.push({
      pathname: "/checkout",
      query: {
        name: product.name,
        price: product.price,
        discountedPrice: discountedPrice || "",
        image: product.images?.[0] || "",
      },
    });
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(to bottom, #000428, #001a4a)" }}
    >
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-16">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-white/40 mb-8">
          <Link href="/user" className="hover:text-white transition-colors">
            Home
          </Link>
          <span>/</span>
          {product.category && (
            <>
              <span className="hover:text-white transition-colors cursor-pointer">
                {product.category}
              </span>
              <span>/</span>
            </>
          )}
          <span className="text-white/80 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

            {/* ── Left: Images ───────────────────────────────────────────── */}
            <div className="md:w-1/2 flex flex-col gap-4">
              {/* Main display */}
              <div className="aspect-square relative rounded-xl overflow-hidden bg-white/5 border border-white/10">
                {mainMedia?.type === "image" ? (
                  <img
                    src={mainMedia.src}
                    alt={product.name}
                    className="w-full h-full object-contain"
                  />
                ) : mainMedia?.type === "video" ? (
                  <video controls className="w-full h-full rounded-xl">
                    <source src={mainMedia.src} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    📦
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images?.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleMediaClick("image", img, idx)}
                    className={`flex-shrink-0 h-16 w-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      activeImgIdx === idx && mainMedia?.type === "image"
                        ? "border-blue-500 shadow-lg shadow-blue-500/30"
                        : "border-white/20 hover:border-white/50"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
                {product.video && (
                  <button
                    onClick={() => handleMediaClick("video", product.video)}
                    className={`flex-shrink-0 h-16 w-16 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                      mainMedia?.type === "video"
                        ? "border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/30"
                        : "border-white/20 hover:border-white/50 bg-white/5"
                    }`}
                  >
                    <span className="text-2xl">🎥</span>
                  </button>
                )}
              </div>
            </div>

            {/* ── Right: Product Info ────────────────────────────────────── */}
            <div className="md:w-1/2 flex flex-col">
              {/* Category tag */}
              {product.category && (
                <span className="inline-block bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs px-3 py-1 rounded-full mb-3 w-fit">
                  {product.category}
                </span>
              )}

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="mb-4">
                {discountedPrice ? (
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-3xl font-extrabold text-green-400">
                      Rs{discountedPrice}
                    </span>
                    <span className="text-xl text-white/40 line-through">
                      Rs{product.price}
                    </span>
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">
                      {product.discount}% OFF
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl font-extrabold text-green-400">
                    Rs{product.price}
                  </span>
                )}
              </div>

              {/* Social proof */}
              {product.purchase_count > 0 && (
                <div className="flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2 mb-4 w-fit">
                  <span className="text-lg">🔥</span>
                  <span className="text-orange-300 text-sm font-medium">
                    {product.purchase_count} people bought this
                  </span>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-white/50 uppercase tracking-widest mb-2">
                    Description
                  </h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-white/10 my-4" />

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-2 mb-6">
                {[
                  { icon: "🚚", label: "Fast Delivery" },
                  { icon: "✅", label: "Quality Assured" },
                  { icon: "💬", label: "WhatsApp Support" },
                ].map((badge) => (
                  <div
                    key={badge.label}
                    className="flex flex-col items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-2 text-center"
                  >
                    <span className="text-xl">{badge.icon}</span>
                    <span className="text-[10px] text-white/50">{badge.label}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                onClick={handleCheckout}
                className="btn-buy-pulse w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl text-lg transition-all duration-200 shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-3"
              >
                <span>🛒</span>
                Proceed to Checkout
              </button>

              <Link href="/user">
                <button className="mt-3 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white font-medium py-3 rounded-xl text-sm transition-all duration-200">
                  ← Continue Shopping
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
