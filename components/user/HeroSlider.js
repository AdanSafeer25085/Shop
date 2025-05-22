"use client";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/router";
import { FastAverageColor } from "fast-average-color";
import Image from "next/image";

const HeroSlider = () => {
  const supabase = createClientComponentClient();
  const [discountedProducts, setDiscountedProducts] = useState([]);
  const [colorModes, setColorModes] = useState([]); // 'light' or 'dark' for each product
  const router = useRouter();

  useEffect(() => {
    async function fetchDiscountedProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, discount, images").gte("discount", 1);

      if (error) {
        console.error("Error fetching discounted products:", error);
      } else {
        console.log("Fetched discounted products:", data);
        setDiscountedProducts(data);
      }
    }
    fetchDiscountedProducts();
  }, []);

  // Analyze images for color mode
  useEffect(() => {
    if (discountedProducts.length === 0) return;
    const fac = new FastAverageColor();
    let isMounted = true;
    Promise.all(
      discountedProducts.map((product) => {
        return new Promise((resolve) => {
          const img = new window.Image();
          img.crossOrigin = "Anonymous";
          img.src = (Array.isArray(product.images) && product.images[0]) || "/images/fallback.png";
          img.onload = () => {
            const color = fac.getColor(img);
            // Perceived brightness formula
            const brightness = (color.value[0] * 299 + color.value[1] * 587 + color.value[2] * 114) / 1000;
            resolve(brightness < 128 ? "light" : "dark");
          };
          img.onerror = () => resolve("dark"); // fallback
        });
      })
    ).then((modes) => {
      if (isMounted) setColorModes(modes);
    });
    return () => { isMounted = false; };
  }, [discountedProducts]);

  const onlyOne = discountedProducts.length === 1;

  const settings = {
    dots: !onlyOne,
    infinite: !onlyOne,
    autoplay: !onlyOne,
    speed: 500,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    swipe: true,
    draggable: true,
  };

  const calculateDiscountedPrice = (price, discount) => {
    return price - (price * discount) / 100;
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto pt-2">
      {discountedProducts.length > 0 ? (
        <Slider {...settings}>
          {discountedProducts.map((product, index) => {
            const textMode = colorModes[index] || "dark";
            const textClass = textMode === "light" ? "text-white" : "text-black";
            const bgClass = textMode === "light" ? "bg-black/40" : "bg-white/50";
            return (
              <div key={product.id + "-" + index} className="flex justify-center items-center">
                <div className="relative w-full">
                  <Image
                    src={(Array.isArray(product.images) && product.images[0]) || "/images/fallback.png"}
                    alt={product.name}
                    width={1200}
                    height={600}
                    className="w-full h-[400px] sm:h-[500px] md:h-[600px] object-cover rounded-xl shadow-lg"
                    priority={index === 0}
                  />
                  <div className={`absolute top-1/2 left-4 sm:left-8 md:left-10 transform -translate-y-1/2 drop-shadow-lg px-2 sm:px-4 py-2 rounded-xl ${bgClass} ${textClass}`}
                    style={{ maxWidth: "90%" }}
                  >
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">{product.name}</h2>
                    <p className="text-lg sm:text-xl md:text-2xl mb-2">${product.price}</p>
                    <p className="text-lg sm:text-xl md:text-2xl mb-4">
                      Now ${calculateDiscountedPrice(product.price, product.discount).toFixed(2)} ({product.discount}% OFF)
                    </p>
                    <button
                      onClick={() => router.push({
                        pathname: `/product/${product.id}`,
                        query: { data: JSON.stringify({
                          ...product,
                          discountedPrice: calculateDiscountedPrice(product.price, product.discount)
                        }) }
                      })}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </Slider>
      ) : (
        <p className="text-center text-gray-500 py-10">No discounted products available.</p>
      )}
    </div>
  );
};

export default HeroSlider;
