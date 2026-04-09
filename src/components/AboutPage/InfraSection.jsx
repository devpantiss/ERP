import React from "react";

export default function InfrastructureSection() {
  return (
    <section className="w-full">

      {/* ===== TITLE ===== */}
      <div className="w-full text-center py-16">
        <div className="flex justify-center gap-3 mb-4">
          <span className="w-10 h-[3px] bg-[#174c8f]"></span>
          <span className="w-10 h-[3px] bg-[#f36b0a]"></span>
        </div>

        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800">
          Infrastructure
        </h2>
      </div>

      {/* ======================================================= */}
      {/* 1️⃣ SECTION — Deshpande Foundation India HQ */}
      {/* ======================================================= */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT TEXT */}
        <div className="p-12 md:p-20 flex flex-col justify-center">
          <div className="flex gap-3 mb-5">
            <span className="w-10 h-[3px] bg-[#174c8f]"></span>
            <span className="w-10 h-[3px] bg-[#f36b0a]"></span>
          </div>

          <h3 className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-tight mb-6">
            Deshpande<br />Foundation India,<br />Headquarters
          </h3>

          <ul className="space-y-3 text-gray-700 text-lg">
            <li className="flex gap-2"><span className="text-orange-500">•</span>State of the art auditorium</li>
            <li className="flex gap-2"><span className="text-orange-500">•</span>Computer-based classrooms</li>
            <li className="flex gap-2"><span className="text-orange-500">•</span>Architected interactive meeting spaces</li>
          </ul>
        </div>

        {/* RIGHT IMAGE */}
        <div className="h-[500px] w-full">
          <img
            src="https://www.deshpandefoundation.org/wp-content/uploads/2023/05/deshpande-foundation-1.jpg"
            alt="Headquarters"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* ======================================================= */}
      {/* 2️⃣ SECTION — Deshpande Startups */}
      {/* ======================================================= */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2">

        {/* LEFT IMAGE */}
        <div className="h-[550px] w-full">
          <img
            src="https://www.deshpandefoundation.org/wp-content/uploads/2020/04/deshpande-foundation-startups.jpg"
            alt="Startups"
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT TEXT */}
        <div className="p-12 md:p-20 flex flex-col justify-center">
          <div className="flex gap-3 mb-5">
            <span className="w-10 h-[3px] bg-[#174c8f]"></span>
            <span className="w-10 h-[3px] bg-[#f36b0a]"></span>
          </div>

          <h3 className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-tight mb-6">
            Deshpande Startups
          </h3>

          <ul className="space-y-3 text-gray-700 text-lg">
            <li className="flex gap-2"><span className="text-orange-500">•</span>India’s largest incubator with 100,000 sq. ft</li>
            <li className="flex gap-2"><span className="text-orange-500">•</span>Flexible coworking space</li>
            <li className="flex gap-2"><span className="text-orange-500">•</span>8,500 sq. ft. ESDM Cluster + HW & circuit lines</li>
            <li className="flex gap-2"><span className="text-orange-500">•</span>12,000 sq. ft. Maker’s Lab with 3D printers & CNC machines</li>
          </ul>
        </div>
      </div>

      {/* ======================================================= */}
      {/* 3️⃣ SECTION — Skilling Campus */}
      {/* ======================================================= */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2">

        {/* LEFT TEXT */}
        <div className="p-12 md:p-20 flex flex-col justify-center">
          <div className="flex gap-3 mb-5">
            <span className="w-10 h-[3px] bg-[#174c8f]"></span>
            <span className="w-10 h-[3px] bg-[#f36b0a]"></span>
          </div>

          <h3 className="text-3xl md:text-4xl font-extrabold text-gray-800 leading-tight mb-6">
            Deshpande Skilling<br />Campus
          </h3>

          <ul className="space-y-3 text-gray-700 text-lg">
            <li className="flex gap-2"><span className="text-orange-500">•</span>6 Acre Campus</li>
            <li className="flex gap-2"><span className="text-orange-500">•</span>16 Computer-based learning labs</li>
            <li className="flex gap-2"><span className="text-orange-500">•</span>16 Classrooms</li>
            <li className="flex gap-2"><span className="text-orange-500">•</span>50+ Trained faculty</li>
            <li className="flex gap-2"><span className="text-orange-500">•</span>Accommodation for 1750 students</li>
          </ul>
        </div>

        {/* RIGHT IMAGE */}
        <div className="h-[550px] w-full">
          <img
            src="https://www.deshpandefoundation.org/wp-content/uploads/2020/04/deshpande-foundation-skilling-campus.jpg"
            alt="Skilling Campus"
            className="w-full h-full object-cover"
          />
        </div>

      </div>

    </section>
  );
}
