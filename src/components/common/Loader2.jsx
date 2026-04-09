import "./Loader2.css";

export default function Loader2() {
  return (
    <div className="flex items-center justify-center w-[180px] h-[180px] text-white font-light text-[1.2em] select-none font-[Inter] relative">
      <div className="flex gap-[2px] items-center justify-center relative">
        <span className="loader-letter">L</span>
        <span className="loader-letter">o</span>
        <span className="loader-letter">a</span>
        <span className="loader-letter">d</span>
        <span className="loader-letter">i</span>
        <span className="loader-letter">n</span>
        <span className="loader-letter">g</span>
        <div className="loader-circle"></div>
      </div>
    </div>
  );
}