import { useState, useEffect, useCallback, memo } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { MoreHorizontal, X, ChevronDown, LogOut } from "lucide-react";

/**
 * MobileBottomDock — fixed bottom nav bar shown only on mobile (<md).
 *
 * Props:
 *   dockItems    — Array<{ label, shortLabel?, path, icon }>  (max 4)
 *   drawerItems  — Array<{ label, path?, icon, heading?, children?: Array }>
 *   accentClass  — { activeBg, activeText, dot, headerText }
 *   roleLabel    — string displayed in drawer header
 *   logoutPath   — string (default "/")
 */
const MobileBottomDock = ({
  dockItems,
  drawerItems,
  accentClass,
  roleLabel,
  logoutPath = "/",
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState([]);
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const toggleGroup = useCallback((label) => {
    setExpandedGroups((prev) =>
      prev.includes(label)
        ? prev.filter((l) => l !== label)
        : [...prev, label]
    );
  }, []);

  // Highlight "More" when any drawer item matches current path
  const isMoreActive = drawerItems.some((item) => {
    if (item.path && location.pathname.startsWith(item.path)) return true;
    if (item.children)
      return item.children.some(
        (c) => c.path && location.pathname.startsWith(c.path)
      );
    return false;
  });

  return (
    <>
      {/* ─── Bottom Dock Bar ─── */}
      <nav className="mobile-dock md:hidden" id="mobile-dock-nav">
        {dockItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `mobile-dock__item ${
                  isActive
                    ? `mobile-dock__item--active ${accentClass.activeText}`
                    : "text-white/50"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                  <span className="mobile-dock__label">
                    {item.shortLabel || item.label}
                  </span>
                  {isActive && (
                    <span className={`mobile-dock__dot ${accentClass.dot}`} />
                  )}
                </>
              )}
            </NavLink>
          );
        })}

        {/* More Button */}
        <button
          onClick={() => setDrawerOpen(true)}
          className={`mobile-dock__item ${
            isMoreActive
              ? `mobile-dock__item--active ${accentClass.activeText}`
              : "text-white/50"
          }`}
        >
          <MoreHorizontal size={20} strokeWidth={isMoreActive ? 2.2 : 1.8} />
          <span className="mobile-dock__label">More</span>
          {isMoreActive && (
            <span className={`mobile-dock__dot ${accentClass.dot}`} />
          )}
        </button>
      </nav>

      {/* ─── Drawer Overlay ─── */}
      {drawerOpen && (
        <div
          className="mobile-drawer-overlay md:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div
            className="mobile-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="mobile-drawer__handle" />

            {/* Header */}
            <div className="mobile-drawer__header">
              <span className={`mobile-drawer__title ${accentClass.headerText}`}>
                {roleLabel}
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="mobile-drawer__close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="mobile-drawer__body">
              {drawerItems.map((item, idx) => {
                // Section heading divider
                if (item.heading) {
                  return (
                    <p
                      key={`h-${item.heading}`}
                      className="mobile-drawer__heading"
                    >
                      {item.heading}
                    </p>
                  );
                }

                const Icon = item.icon;

                // Group with children
                if (item.children) {
                  const isExpanded = expandedGroups.includes(item.label);
                  const isChildActive = item.children.some(
                    (c) => c.path && location.pathname.startsWith(c.path)
                  );

                  return (
                    <div key={item.label} className="mobile-drawer__group">
                      <button
                        onClick={() => toggleGroup(item.label)}
                        className={`mobile-drawer__group-btn ${
                          isChildActive
                            ? accentClass.activeText
                            : "text-white/70"
                        }`}
                      >
                        <Icon size={18} />
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronDown
                          size={16}
                          className={`transition-transform duration-200 ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      <div
                        className={`mobile-drawer__children ${
                          isExpanded ? "mobile-drawer__children--open" : ""
                        }`}
                      >
                        {item.children.map((child) => {
                          if (child.heading) {
                            return (
                              <p
                                key={`ch-${child.heading}`}
                                className="mobile-drawer__heading"
                                style={{ paddingLeft: 4 }}
                              >
                                {child.heading}
                              </p>
                            );
                          }
                          const ChildIcon = child.icon;
                          return (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              className={({ isActive }) =>
                                `mobile-drawer__child-item ${
                                  isActive
                                    ? accentClass.activeText
                                    : "text-white/50"
                                }`
                              }
                            >
                              <ChildIcon size={16} />
                              <span>{child.label}</span>
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // Simple nav item
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `mobile-drawer__item ${
                        isActive
                          ? `${accentClass.activeBg} ${accentClass.activeText}`
                          : "text-white/70"
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}

              {/* Logout */}
              <div className="mobile-drawer__divider" />
              <Link to={logoutPath} className="mobile-drawer__item text-red-400">
                <LogOut size={18} />
                <span>Log Out</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(MobileBottomDock);
