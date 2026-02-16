import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const slides = [
  {
    id: 1,
    title: "The world consists of people with disposable income...",
    subtitle:
      "Approximately 2 billion people have disposable income both in affluent and developing countries",
    image:
      "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/deshpande-foundation-disposable-income.jpg",
  },
  {
    id: 2,
    title: "The Deshpande Foundation...",
    subtitle:
      "delivers scalable, impactful solutions with unique and different approaches for these distinct segments",
    image:
      "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/deshpande-foundation-little-disposable-income.jpg",
  },
  {
    id: 3,
    title: "... and those without",
    subtitle:
      "Around 5 billion people struggle with little disposable income and can be found in both affluent and developing countries",
    image:
      "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/deshpande-foundation-scalable-approach.jpg",
  },
];

// CUSTOM ARROWS
const NextArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center"
  >
    ❯
  </button>
);

const PrevArrow = ({ onClick }) => (
  <button
    onClick={onClick}
    className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/60 text-white w-10 h-10 rounded-full flex items-center justify-center"
  >
    ❮
  </button>
);

export default function HeroSlider() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    arrows: true,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    appendDots: (dots) => (
      <div className="absolute bottom-0 flex justify-center z-30">
        <ul className="flex gap-2 w-[130px] bg-[#0B4278]/90 rounded-br-lg px-4 py-2 backdrop-blur-sm">
          {dots}
        </ul>
      </div>
    ),
    customPaging: () => (
      <div className="w-3 h-3 bg-white hover:bg-white rounded-full"></div>
    ),
  };

  return (
    <div className="relative w-full">
      <Slider {...settings}>
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="relative h-[70vh] min-h-[460px] w-full overflow-hidden"
          >
            {/* Background Image */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            />

            {/* DIAGONAL BLUE OVERLAY */}
            <div
              className="absolute inset-0 bg-[#0B4278]/90 flex items-center z-10"
              style={{
                clipPath: "polygon(0 0, 60% 0, 45% 100%, 0% 100%)",
              }}
            >
              <div className="max-w-xl pl-10 pr-6 text-white">
                <h2 className="font-extrabold text-3xl md:text-5xl leading-tight">
                  {slide.title}
                </h2>
                <p className="mt-6 text-lg opacity-90">{slide.subtitle}</p>

                <button className="mt-6 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded font-semibold skew-x-[-10deg]">
                  Our Approach
                </button>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}
