import { useLayoutEffect } from "react";

// The root attribute also supplies tokens to dialogs rendered through portals.
export default function useRoleTheme(role) {
  useLayoutEffect(() => {
    document.documentElement.dataset.roleTheme = role;
    return () => { delete document.documentElement.dataset.roleTheme; };
  }, [role]);
}
