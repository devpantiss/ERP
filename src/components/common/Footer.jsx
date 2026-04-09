// src/components/Footer.jsx
import React from "react";

export default function Footer() {
  return (
    <footer
      className="w-full text-gray-700 pt-16 pb-6"
      style={{
        background:
          "linear-gradient(to bottom, #f5f8fc 0%, #8db3e2 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Left: Logo + Description + Social */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src="https://www.deshpandefoundation.org/wp-content/uploads/2022/12/Deshpande-foundation-logo-1024x255.png"
                alt="Deshpande Foundation"
                className="h-14 w-auto"
              />
            </div>

            <p className="text-sm leading-relaxed max-w-xs">
              The Deshpande Foundation, founded by Jaishree and Gururaj 'Desh'
              Deshpande, has supported sustainable, scalable social and economic 
              impact through innovation and entrepreneurship in the United States, 
              Canada, and India.
            </p>

            <div className="flex items-center gap-4 mt-5">
              {/* Facebook */}
              <a href="#" className="text-gray-600 hover:text-gray-900">
                <i className="fa-brands fa-facebook text-xl"></i>
              </a>
              {/* Twitter */}
              <a href="#" className="text-gray-600 hover:text-gray-900">
                <i className="fa-brands fa-twitter text-xl"></i>
              </a>
              {/* LinkedIn */}
              <a href="#" className="text-gray-600 hover:text-gray-900">
                <i className="fa-brands fa-linkedin text-xl"></i>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-orange-600 font-semibold underline">Home</a>
              </li>
              <li><a href="#" className="hover:text-gray-900">About</a></li>
              <li><a href="#" className="hover:text-gray-900">The Future</a></li>
              <li><a href="#" className="hover:text-gray-900">Events</a></li>
              <li><a href="#" className="hover:text-gray-900">Publications</a></li>
              <li><a href="#" className="hover:text-gray-900">Contact</a></li>
            </ul>
          </div>

          {/* Our Initiatives */}
          <div>
            <h3 className="font-bold text-lg mb-4">Our Initiatives</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-gray-900">Deshpande Foundation India</a></li>
              <li><a href="#" className="hover:text-gray-900">Entrepreneurship For All</a></li>
              <li><a href="#" className="hover:text-gray-900">MIT Deshpande Center</a></li>
              <li><a href="#" className="hover:text-gray-900">Gopalakrishnan Deshpande Center</a></li>
              <li><a href="#" className="hover:text-gray-900">Dunin–Deshpande Queen's Innovation Center</a></li>
              <li><a href="#" className="hover:text-gray-900">Pond Deshpande Center</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact</h3>
            <p className="font-semibold text-sm">Deshpande Foundation</p>
            <p className="mt-3 text-sm">info@deshpandefoundation.org</p>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-gray-400 mt-16 pt-6 flex justify-between flex-col md:flex-row text-sm text-gray-700">
          <p>© Copyright 2025 by Deshpande Foundation</p>

          <div className="flex items-center gap-8 mt-3 md:mt-0">
            <a href="#" className="hover:text-gray-900">Terms of Use & Privacy Policy</a>

            <div className="flex items-center gap-2">
              <span>Crafted by</span>
              <img
                src="https://www.deshpandefoundation.org/wp-content/uploads/2019/12/msd-logo-temp-1.png"
                alt="Mindshare Digital"
                className="h-5 w-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
