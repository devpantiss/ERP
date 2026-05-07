import { useState, useRef, useEffect, useMemo } from "react";
import { AtSign, X, User, ShieldAlert, UserCog } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   MentionInput — "@" mention picker for selecting multiple people
   
   Props:
     values       — array of currently selected person objects [{ name, role, ... }]
     onChange     — (peopleArray) => void
     people       — array of { name, role, project?, center? }
     placeholder  — placeholder text
     accentColor  — tailwind accent e.g. "violet", "yellow", "emerald", "red"
     label        — label text
═══════════════════════════════════════════════════════════════ */

const ROLE_ICONS = {
  "Super Admin": ShieldAlert,
  Admin: UserCog,
};

const ACCENT_MAP = {
  violet: {
    focus: "focus:border-violet-400/50",
    ring: "ring-violet-400/30",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    text: "text-violet-400",
    hoverBg: "hover:bg-violet-500/10",
    activeBg: "bg-violet-500/15",
  },
  yellow: {
    focus: "focus:border-yellow-400/50",
    ring: "ring-yellow-400/30",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    text: "text-yellow-400",
    hoverBg: "hover:bg-yellow-500/10",
    activeBg: "bg-yellow-500/15",
  },
  emerald: {
    focus: "focus:border-emerald-400/50",
    ring: "ring-emerald-400/30",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    hoverBg: "hover:bg-emerald-500/10",
    activeBg: "bg-emerald-500/15",
  },
  cyan: {
    focus: "focus:border-cyan-400/50",
    ring: "ring-cyan-400/30",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    text: "text-cyan-400",
    hoverBg: "hover:bg-cyan-500/10",
    activeBg: "bg-cyan-500/15",
  },
  red: {
    focus: "focus:border-red-400/50",
    ring: "ring-red-400/30",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    text: "text-red-400",
    hoverBg: "hover:bg-red-500/10",
    activeBg: "bg-red-500/15",
  },
};

export default function MentionInput({
  values = [],
  onChange,
  people = [],
  placeholder = "Type @ to search people...",
  accentColor = "violet",
  label = "Addressed To *",
}) {
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const containerRef = useRef(null);

  const a = ACCENT_MAP[accentColor] || ACCENT_MAP.violet;

  // Filter people based on input after "@"
  const query = useMemo(() => {
    const atIdx = inputValue.lastIndexOf("@");
    if (atIdx === -1) return "";
    return inputValue.slice(atIdx + 1).toLowerCase();
  }, [inputValue]);

  const filteredPeople = useMemo(() => {
    if (!showDropdown) return [];
    return people.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.role.toLowerCase().includes(query) ||
        (p.project && p.project.toLowerCase().includes(query)) ||
        (p.center && p.center.toLowerCase().includes(query))
    );
  }, [people, query, showDropdown]);

  // Reset highlight when filtered list changes
  useEffect(() => {
    setHighlightIdx(0);
  }, [filteredPeople.length]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (dropdownRef.current) {
      const el = dropdownRef.current.children[highlightIdx];
      if (el) el.scrollIntoView({ block: "nearest" });
    }
  }, [highlightIdx]);

  const isSelected = (person) => values.some(v => v.name === person.name && v.role === person.role);

  const selectPerson = (person) => {
    if (!isSelected(person)) {
      onChange([...values, person]);
    }
    setInputValue("");
    setShowDropdown(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const removePerson = (person) => {
    onChange(values.filter(v => v.name !== person.name || v.role !== person.role));
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);

    if (val.includes("@")) {
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || filteredPeople.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.min(prev + 1, filteredPeople.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      selectPerson(filteredPeople[highlightIdx]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="text-xs text-white/60 mb-1.5 block font-bold">{label}</label>

      {/* Selected person chips */}
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {values.map((val, idx) => {
            const RIcon = ROLE_ICONS[val.role] || User;
            return (
              <div key={idx} className={`flex items-center gap-2 ${a.bg} border ${a.border} rounded-lg px-2.5 py-1.5 transition-all`}>
                <RIcon size={12} className={a.text} />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white leading-none">{val.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removePerson(val)}
                  className="p-0.5 rounded text-white/40 hover:text-white hover:bg-white/10 transition shrink-0 ml-1"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Text input with @ trigger */}
      <div className="relative">
        <AtSign size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (inputValue.includes("@")) setShowDropdown(true); }}
          placeholder={values.length > 0 ? "Type @ to add more people..." : placeholder}
          className={`w-full bg-white/[0.03] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white/90 ${a.focus} focus:outline-none placeholder:text-slate-600 transition-all`}
        />
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 max-h-64 overflow-y-auto rounded-xl border border-white/[0.08] bg-[#0f172a] shadow-2xl shadow-black/50"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#1e293b transparent" }}
        >
          {filteredPeople.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-white/30">
              <User size={20} className="mx-auto mb-2 opacity-40" />
              <p>No matching people found</p>
              <p className="text-[10px] mt-1">Try typing a name, role, or project after @</p>
            </div>
          ) : (
            filteredPeople.map((person, idx) => {
              const PersonIcon = ROLE_ICONS[person.role] || User;
              return (
                <button
                  type="button"
                  key={`${person.name}-${person.role}-${idx}`}
                  onClick={() => selectPerson(person)}
                  onMouseEnter={() => setHighlightIdx(idx)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                    idx === highlightIdx
                      ? `${a.activeBg} border-l-2 ${a.border}`
                      : `border-l-2 border-transparent ${a.hoverBg}`
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-700/60 flex items-center justify-center shrink-0 text-[10px] font-black text-white">
                    {person.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white/90 truncate">{person.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/40">
                      <span className={`px-1.5 py-0.5 rounded border ${a.border} ${a.text} font-bold`}>{person.role}</span>
                      {person.project && <span className="truncate">{person.project}</span>}
                      {person.center && <span className="truncate">· {person.center}</span>}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
