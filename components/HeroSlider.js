"use client";
import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const HeroSlider = () => {
  const supabase = createClientComponentClient();
  const [discountedProducts, setDiscountedProducts] = useState([]);

  useEffect(() => {
    async function fetchDiscountedProducts() {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, discount, images")
        .gte("discount", 1);

      if (error) {
        console.error("Error fetching discounted products:", error);
      } else {
        console.log("Fetched discounted products:", data);
        setDiscountedProducts(data);
      }
    }

    fetchDiscountedProducts();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 500,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto pt-2 px-4">
      {discountedProducts.length > 0 ? (
        <Slider {...settings}>
          {discountedProducts.map((product, index) => (
            <div key={product.id + "-" + index} className="!flex justify-center">
              <div className="relative w-full">
                <img
                  src={(Array.isArray(product.images) && product.images[0]) || "/images/fallback.png"}
                  alt={product.name}
                  className="w-full h-[400px] sm:h-[500px] md:h-[600px] object-cover rounded-xl shadow-lg"
                />
                <div className="absolute top-1/2 left-4 sm:left-8 md:left-10 transform -translate-y-1/2 text-white drop-shadow-lg px-2 sm:px-4">
                  <h2 className="text-xl sm:text-2xl md:text-4xl font-bold">{product.name}</h2>
                  <p className="text-sm sm:text-base md:text-xl mt-1 sm:mt-2">{product.discount}% OFF!</p>
                  <button className="mt-2 sm:mt-4 bg-blue-600 hover:bg-blue-700 px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base rounded shadow">
                    Shop Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      ) : (
        <p className="text-center text-gray-500 py-10">No discounted products available.</p>
      )}
    </div>
  );
};

export default HeroSlider;
