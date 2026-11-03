"use client";
import { useEffect, useId, useMemo, useRef, useState } from "react";

export type Command = {
  id: string;
  label: string;
  group: string;
  hint?: string;
  keywords?: string;
  run: () => void;
};

/** Pure filter used by the palette (and its tests). Case-insensitive; all words must match. */
export function filterCommands(commands: Command[], query: string): Command[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return commands;
  return commands.filter((c) => {
    const hay = (c.label + " " + c.group + " " + (c.keywords || "")).toLowerCase();
    return words.every((w) => hay.includes(w));
  });
}

/**
 * Ctrl/Cmd+K palette. Keyboard driven (arrows, Enter, Escape), focus is
 * trapped in the dialog while open and restored afterwards.
 */
export function CommandPalette({
  open,
  onClose,
  commands,
}: {
  open: boolean;
  onClose: () => void;
  commands: Command[];
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const previous = useRef<HTMLElement | null>(null);
  const listId = useId();
  const items = useMemo(() => filterCommands(commands, query), [commands, query]);

  useEffect(() => {
    if (!open) return;
    previous.current = document.activeElement as HTMLElement | null;
    setQuery("");
    setActive(0);
    const t = window.setTimeout(() => input.current?.focus(), 0);
    return () => {
      window.clearTimeout(t);
      previous.current?.focus?.();
    };
  }, [open]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;
  const run = (c?: Command) => {
    if (!c) return;
    onClose();
    // Let focus return before the command moves it elsewhere.
    window.setTimeout(c.run, 0);
  };

  return (
    <div
      className="palette-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            onClose();
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => (items.length ? (a + 1) % items.length : 0));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => (items.length ? (a - 1 + items.length) % items.length : 0));
          } else if (e.key === "Enter" && !e.nativeEvent.isComposing) {
            e.preventDefault();
            run(items[active]);
          } else if (e.key === "Tab") {
            e.preventDefault(); // single focus target: keep focus on the input
          }
        }}
      >
        <input
          ref={input}
          className="palette-input"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={items[active] ? `${listId}-${items[active].id}` : undefined}
          aria-label="Search commands"
          placeholder="Type a command or search…"
          value={query}
          dir="auto"
          onChange={(e) => setQuery(e.target.value)}
        />
        <ul id={listId} role="listbox" className="palette-list" aria-label="Commands">
          {items.length === 0 && <li className="palette-empty">No matching command</li>}
          {items.map((c, i) => {
            const header = c.group !== items[i-1]?.group ? c.group : "";
            return (
              <li key={c.id} role="presentation">
                {header && <div className="palette-group">{header}</div>}
                <div
                  id={`${listId}-${c.id}`}
                  role="option"
                  aria-selected={i === active}
                  className="palette-item"
                  data-active={i === active ? "true" : undefined}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => run(c)}
                >
                  <span>{c.label}</span>
                  {c.hint && <kbd>{c.hint}</kbd>}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="palette-foot" aria-hidden="true">
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>Esc close</span>
        </div>
      </div>
    </div>
  );
}
