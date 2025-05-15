// components/HeroSlider.tsx
import Slider from "react-slick";

const sliderImages = [
  {
    src: "/images/slide2.png",
    title: "Mid Month Sale!",
    subtitle: "Up to 60% off",
    buttonText: "Shop Now",
  },
  {
    src: "/images/slide2.png",
    title: "Dine in Style",
    subtitle: "Up to 50% off!",
    buttonText: "Explore",
  },
  {
    src: "/images/slide2.png",
    title: "Tech Deals",
    subtitle: "Gadgets at Best Prices",
    buttonText: "Buy Now",
  },
];

const HeroSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    speed: 500,
    autoplaySpeed: 4000,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      {
        breakpoint: 640, // Tailwind's sm breakpoint
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 768, // Tailwind's md breakpoint
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 1024, // Tailwind's lg breakpoint
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto pt-2 px-4">
      <Slider {...settings}>
        {sliderImages.map((slide, index) => (
          <div key={index} className="relative">
            <img
              src={slide.src}
              alt={`slide-${index}`}
              className="w-full h-auto max-h-[400px] sm:max-h-[500px] md:max-h-[600px] object-cover rounded-xl shadow-lg"
            />
            <div className="absolute top-1/2 left-4 sm:left-8 md:left-10 transform -translate-y-1/2 text-white drop-shadow-lg px-2 sm:px-4">
              <h2 className="text-xl sm:text-2xl md:text-4xl font-bold">{slide.title}</h2>
              <p className="text-sm sm:text-base md:text-xl mt-1 sm:mt-2">{slide.subtitle}</p>
              <button className="mt-2 sm:mt-4 bg-blue-600 hover:bg-blue-700 px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base rounded shadow">
                {slide.buttonText}
              </button>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HeroSlider;
