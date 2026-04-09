// src/components/QuoteHero.jsx
import React from "react";

export default function QuoteHero({
  image = "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/deshpande-quote1.jpg",
  logo = "https://www.deshpandefoundation.org/wp-content/uploads/2020/04/globe-icon-white.png",
  children,
}) {
  return (
    <section className="w-full">
      <div
        className="
          relative 
          h-[260px] md:h-[360px] lg:h-[420px] 
          overflow-hidden
        "
      >
        {/* Background with parallax */}
        <div
          className="
            absolute inset-0 
            bg-cover bg-right bg-no-repeat 
            hidden md:block
          "
          style={{
            backgroundImage: `url("${image}")`,
            backgroundAttachment: "fixed",       // PARALLAX
          }}
        />

        {/* Mobile fallback (no parallax since iOS blocks it) */}
        <div
          className="
            absolute inset-0 
            bg-cover bg-right bg-no-repeat 
            md:hidden
          "
          style={{
            backgroundImage: `url("${image}")`,
          }}
        />

        {/* Dark left gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(10,34,60,0.78) 0%, rgba(10,34,60,0.6) 25%, rgba(10,34,60,0.2) 45%, rgba(10,34,60,0) 100%)",
          }}
        />

        {/* Text Container */}
        <div className="relative z-10 max-w-6xl mx-auto h-full flex items-center">
          <div className="px-6 md:px-10 lg:px-16 w-full md:w-2/3 lg:w-1/2">

            {/* Logo */}
            <div className="mb-4">
              <img
                src={logo}
                alt="logo"
                className="h-8 w-8 md:h-10 md:w-10 rounded-full"
                style={{ objectFit: "cover", filter: "brightness(1.1)" }}
              />
            </div>

            {/* Main Quote Text */}
            <h1 className="text-white text-2xl md:text-4xl lg:text-5xl font-extrabold leading-tight">
              The difference between a{" "}
              <span className="font-extrabold">vibrant community</span> and an
              impoverished community is{" "}
              <span className="font-extrabold">how many people</span> are excited
              about <span className="font-extrabold">solving problems</span>.
              <br />
              By <span className="font-extrabold">encouraging problem solvers</span>, you
              create an <span className="font-extrabold">entrepreneurial ecosystem.</span>
            </h1>

            {children && <div className="mt-6">{children}</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
