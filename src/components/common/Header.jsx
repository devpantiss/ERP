import React from 'react'


export default function Header(){
return (
<header className="bg-white border-b border-gray-200">
<div className="max-w-7xl mx-auto px-6">
<div className="flex items-center justify-between h-20">
{/* left: logo */}
<div className="flex items-center gap-4">
<img
src={'https://www.deshpandefoundation.org/wp-content/uploads/2022/12/Deshpande-foundation-logo.png'}
alt="Deshpande Foundation"
className="h-12 w-auto"
/>
</div>


{/* center / nav */}
<nav className="hidden md:flex items-center gap-8 text-sm font-medium">
<a href="/" className="relative py-2 px-1 text-black">
<span>Home</span>
<span className="absolute left-0 right-0 -bottom-3 h-0.5 bg-black rounded-full block mx-auto w-8"></span>
</a>
<a href="/about" className="text-gray-700 hover:text-black">About</a>
<a href="#future" className="text-gray-700 hover:text-black">The Future</a>
<div className="relative group">
<button className="flex items-center gap-2 text-gray-700 hover:text-black">Our Initiatives <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg></button>
{/* optional dropdown can be added here */}
</div>
<a href="#publications" className="text-gray-700 hover:text-black">Publications</a>
<a href="#events" className="text-gray-700 hover:text-black">Events</a>
<a href="#blog" className="text-gray-700 hover:text-black">Blog</a>
<a href="#contact" className="text-gray-700 hover:text-black">Contact</a>
</nav>


{/* right: placeholder for actions / mobile menu */}
<div className="flex items-center gap-4">
<button className="hidden md:inline-block px-4 py-2 text-sm rounded-md border border-gray-200">Get Involved</button>


{/* mobile menu button */}
<button className="md:hidden p-2 rounded-md focus:outline-none">
<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
</svg>
</button>
</div>
</div>
</div>
</header>
)
}