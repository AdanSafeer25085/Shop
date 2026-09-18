"use client";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import supabase from "@/lib/supabaseClient";
import { useRouter } from "next/router";
import { FastAverageColor } from "fast-average-color";
import Image from "next/image";

// ── Fallback banner shown when no discounted products exist ──────────────────
function FallbackBanner() {
  const router = useRouter();
  return (
    <div
      className="relative w-full h-[300px] sm:h-[420px] md:h-[520px] rounded-xl overflow-hidden flex items-center"
      style={{
        background: "linear-gradient(135deg, #000428 0%, #004e92 60%, #0072cc 100%)",
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl" />

      <div className="relative z-10 px-8 sm:px-16 max-w-xl">
        <span className="inline-block bg-blue-500/30 border border-blue-400/40 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-widest uppercase">
          New Arrivals
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
          Shop the Latest{" "}
          <span className="bg-gradient-to-r from-blue-300 to-cyan-200 bg-clip-text text-transparent">
            Trends
          </span>
        </h2>
        <p className="text-white/70 text-sm sm:text-base mb-8">
          Discover quality products at unbeatable prices. Fast delivery across Pakistan.
        </p>
        <button
          onClick={() => router.push("/user")}
          className="inline-flex items-center gap-2 bg-white text-blue-900 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
        >
          Shop Now
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Right side decorative text */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-end gap-3 opacity-30 select-none">
        <span className="text-8xl font-black text-white/20 tracking-tighter">TREND</span>
        <span className="text-8xl font-black text-white/20 tracking-tighter">YNEST</span>
      </div>
    </div>
  );
}

// ── Main Hero Slider ─────────────────────────────────────────────────────────
const HeroSlider = () => {
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [colorModes, setColorModes] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchDiscountedProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, discount, images")
        .gte("discount", 1);

      if (error) {
        console.error("Error fetching discounted products:", error);
      } else {
        setDiscountedProducts(data || []);
      }
      setLoading(false);
    }
    fetchDiscountedProducts();
  }, []);

  // Analyze images for text contrast
  useEffect(() => {
    if (discountedProducts.length === 0) return;
    const fac = new FastAverageColor();
    let isMounted = true;
    Promise.all(
      discountedProducts.map((product) =>
        new Promise((resolve) => {
          const img = new window.Image();
          img.crossOrigin = "Anonymous";
          img.src =
            (Array.isArray(product.images) && product.images[0]) ||
            "/images/fallback.png";
          img.onload = () => {
            const color = fac.getColor(img);
            const brightness =
              (color.value[0] * 299 +
                color.value[1] * 587 +
                color.value[2] * 114) /
              1000;
            resolve(brightness < 128 ? "light" : "dark");
          };
          img.onerror = () => resolve("dark");
        })
      )
    ).then((modes) => {
      if (isMounted) setColorModes(modes);
    });
    return () => {
      isMounted = false;
    };
  }, [discountedProducts]);

  const onlyOne = discountedProducts.length === 1;

  const settings = {
    dots: !onlyOne,
    infinite: !onlyOne,
    autoplay: !onlyOne,
    fade: true,
    speed: 700,
    autoplaySpeed: 4500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    swipe: true,
    draggable: true,
    pauseOnHover: true,
  };

  const calculateDiscountedPrice = (price, discount) =>
    price - (price * discount) / 100;

  if (loading) {
    return (
      <div className="w-full h-[300px] sm:h-[420px] md:h-[520px] skeleton rounded-xl" />
    );
  }

  if (discountedProducts.length === 0) {
    return <FallbackBanner />;
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto pt-2">
      <Slider {...settings}>
        {discountedProducts.map((product, index) => {
          const textMode = colorModes[index] || "dark";
          const textClass = textMode === "light" ? "text-white" : "text-gray-900";
          const bgClass =
            textMode === "light"
              ? "bg-black/50 backdrop-blur-sm"
              : "bg-white/70 backdrop-blur-sm";

          return (
            <div key={product.id + "-" + index}>
              <div className="relative w-full overflow-hidden rounded-xl">
                <Image
                  src={
                    (Array.isArray(product.images) && product.images[0]) ||
                    "/images/fallback.png"
                  }
                  alt={product.name}
                  width={1400}
                  height={600}
                  className="w-full h-[300px] sm:h-[420px] md:h-[520px] object-cover"
                  priority={index === 0}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

                {/* Content */}
                <div className="absolute inset-0 flex items-center px-8 sm:px-14">
                  <div className="max-w-sm">
                    {/* Discount badge */}
                    <span className="inline-block bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wide shadow-lg">
                      🔥 {product.discount}% OFF
                    </span>

                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-2 drop-shadow-lg leading-tight">
                      {product.name}
                    </h2>

                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-white/60 line-through text-lg">
                        Rs{product.price}
                      </span>
                      <span className="text-green-300 font-bold text-2xl drop-shadow">
                        Rs{calculateDiscountedPrice(product.price, product.discount).toFixed(0)}
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        router.push({
                          pathname: `/product/${product.id}`,
                          query: {
                            data: JSON.stringify({
                              ...product,
                              discountedPrice: calculateDiscountedPrice(
                                product.price,
                                product.discount
                              ),
                            }),
                          },
                        })
                      }
                      className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
                    >
                      Shop Now
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </Slider>
    </div>
  );
};

export default HeroSlider;
