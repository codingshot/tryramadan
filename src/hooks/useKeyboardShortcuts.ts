import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  action: () => void;
  description: string;
}

/**
 * Global keyboard shortcuts for common actions.
 * Usage: useKeyboardShortcuts() in App or a top-level component.
 */
export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    const shortcuts: KeyboardShortcut[] = [
      // Navigation shortcuts with 'g' prefix (like Gmail)
      { key: "d", description: "Go to Dashboard", action: () => navigate("/dashboard") },
      { key: "t", description: "Go to Today", action: () => navigate("/dashboard/today") },
      { key: "s", description: "Go to Schedule", action: () => navigate("/dashboard/schedule") },
      { key: "p", description: "Go to Prayers", action: () => navigate("/dashboard/prayers") },
      { key: "q", description: "Go to Quran", action: () => navigate("/dashboard/quran") },
      { key: "h", description: "Go to Home", action: () => navigate("/") },
      // Settings shortcut
      { key: ",", description: "Open Settings", action: () => navigate("/settings") },
      // Help shortcut - handled by KeyboardShortcutsHelp component
      { key: "?", shift: true, description: "Show keyboard shortcuts", action: () => {
        // Trigger custom event for KeyboardShortcutsHelp to listen to
        window.dispatchEvent(new CustomEvent("show-keyboard-shortcuts"));
      }},
    ];

    let gPressed = false;
    let gTimer: NodeJS.Timeout | null = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return;
      }

      // Handle 'g' prefix for navigation shortcuts
      if (e.key === "g" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        gPressed = true;
        if (gTimer) clearTimeout(gTimer);
        gTimer = setTimeout(() => {
          gPressed = false;
        }, 1000);
        return;
      }

      // If 'g' was pressed, check for navigation shortcuts
      if (gPressed) {
        const shortcut = shortcuts.find(s => s.key === e.key && !s.shift && !s.ctrl && !s.meta);
        if (shortcut) {
          e.preventDefault();
          shortcut.action();
          gPressed = false;
          if (gTimer) clearTimeout(gTimer);
          return;
        }
      }

      // Direct shortcuts (with modifiers)
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
        const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
        if (e.key === shortcut.key && ctrlMatch && shiftMatch && !e.altKey) {
          e.preventDefault();
          shortcut.action();
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (gTimer) clearTimeout(gTimer);
    };
  }, [navigate]);
}
