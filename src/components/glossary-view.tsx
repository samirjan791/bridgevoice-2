"use client";
import { useEffect, useState } from "react";
import {
  Search,
  Plus,
  Download,
  Upload,
  Star,
  Trash2,
  Pencil,
  Printer,
} from "lucide-react";
import Link from "next/link";
import { glossary } from "@/lib/glossary";
import { Entry, entrySchema } from "@/lib/schema";
import {
  readSaved,
  writeSaved,
  saveEntry,
  parseImport,
  mergeEntries,
  csv,
  download,
} from "@/lib/storage";
import { usePreferences } from "./providers";
import { TermCard } from "./term-card";
import { Language, packs } from "@/lib/languages";
export function GlossaryView({ saved = false }: { saved?: boolean }) {
  const { notify, settings } = usePreferences();
  const [personal, setPersonal] = useState<Entry[]>([]),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("all"),
    [target, setTarget] = useState<Language>(settings.target),
    [sort, setSort] = useState("az"),
    [favorites, setFavorites] = useState(false),
    [editing, setEditing] = useState<Entry | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    const load = () => {
      try {
        setPersonal(readSaved());
      } catch {
        setError(
          "Saved glossary could not be read. Export any available entries before clearing browser data.",
        );
      }
    };
    load();
    window.addEventListener("bv-glossary", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("bv-glossary", load);
      window.removeEventListener("storage", load);
    };
  }, []);
  function persist(rows: Entry[]) {
    try {
      writeSaved(rows);
      setPersonal(rows);
      notify("Glossary updated.");
    } catch {
      setError(
        "Unable to write browser storage. Export your entries to retain a copy.",
      );
    }
  }
  const entries = saved ? personal : glossary;
  const filtered = entries
    .filter(
      (e) =>
        (category === "all" || e.domain === category) &&
        (!favorites || e.favorite) &&
        [e.en, e.ps, e["fa-AF"], e.explanation, e.notes || ""].some((t) =>
          t.toLowerCase().includes(query.toLowerCase()),
        ),
    )
    .sort((a, b) =>
      sort === "az" ? a.en.localeCompare(b.en) : b.en.localeCompare(a.en),
    );
  return (
    <div className="page-wrap">
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR WORDS. YOUR EXPERTISE.</span>
          <h1>{saved ? "My glossary" : "A library for understanding."}</h1>
          <p>
            {saved
              ? "Your saved terminology and corrections, stored in this browser."
              : "120 editorial draft entries across 12 domains. Bilingual professional review is still required."}
          </p>
        </div>
        <Link
          className="secondary"
          href={saved ? "/glossary/library" : "/glossary"}
        >
          {saved ? "Browse terminology" : "Open My glossary"} →
        </Link>
      </div>
      <div className="notice">
        Draft terminology is not certified. Empty translations are explicitly
        pending review. Exported files may contain your notes and saved phrases;
        share them deliberately.
      </div>
      <div className="glossary-tools">
        <label className="search">
          <Search size={18} />
          <input
            aria-label="Search terminology"
            placeholder="Search a word, translation or note…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          Category
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All categories</option>
            {[...new Set(entries.map((e) => e.domain))].sort().map((d) => (
              <option key={d}>{d}</option>
            ))}
          </select>
        </label>
        <label>
          Translation
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value as Language)}
          >
            {Object.values(packs).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Sort
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
          </select>
        </label>
      </div>
      {saved && (
        <div className="row wrap actions">
          <button
            className="primary"
            onClick={() =>
              setEditing({
                id: crypto.randomUUID(),
                en: "",
                ps: "",
                "fa-AF": "",
                explanation: "",
                domain: "Personal",
                example: "",
                source: "User-generated entry; not externally verified",
                reviewStatus: "user_corrected",
                notes: "",
              })
            }
          >
            <Plus size={15} /> Add term
          </button>
          <button
            onClick={() =>
              download(
                "bridgevoice-glossary.json",
                JSON.stringify(personal, null, 2),
                "application/json",
              )
            }
          >
            <Download size={15} /> Export JSON
          </button>
          <button
            onClick={() =>
              download(
                "bridgevoice-glossary.csv",
                csv(personal),
                "text/csv;charset=utf-8",
              )
            }
          >
            <Download size={15} /> Export CSV
          </button>
          <label className="file-button">
            <Upload size={15} /> Import JSON
            <input
              type="file"
              accept=".json,application/json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  if (file.size > 2000000)
                    throw new Error("Import must be smaller than 2 MB.");
                  const incoming = parseImport(await file.text()),
                    merged = mergeEntries(personal, incoming);
                  persist(merged);
                  notify(
                    `${merged.length - personal.length} entries imported; duplicates skipped.`,
                  );
                } catch {
                  setError(
                    "Import rejected. Use a valid BridgeVoice JSON export smaller than 2 MB.",
                  );
                }
                e.target.value = "";
              }}
            />
          </label>
          <button onClick={() => window.print()}>
            <Printer size={15} /> Print
          </button>
          <button
            className={favorites ? "selected" : ""}
            onClick={() => setFavorites(!favorites)}
          >
            <Star size={15} /> Favorites
          </button>
        </div>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {editing && (
        <section className="editor" aria-label="Edit glossary entry">
          <h2>{editing.en ? "Edit term" : "New term"}</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const checked = entrySchema.safeParse({
                ...editing,
                reviewStatus: "user_corrected",
              });
              if (!checked.success) {
                setError(
                  "Check your entry: English term is required and fields must be within length limits.",
                );
                return;
              }
              if (
                personal.some(
                  (x) =>
                    x.id !== editing.id &&
                    x.en.trim().toLowerCase() ===
                      editing.en.trim().toLowerCase(),
                )
              ) {
                setError("A term with that English name already exists.");
                return;
              }
              persist([
                ...personal.filter((x) => x.id !== editing.id),
                checked.data,
              ]);
              setEditing(null);
              setError("");
            }}
          >
            <div className="form-grid">
              {(
                [
                  "en",
                  "ps",
                  "fa-AF",
                  "explanation",
                  "domain",
                  "example",
                  "notes",
                ] as const
              ).map((f) => (
                <label key={f}>
                  {
                    {
                      en: "English term",
                      ps: "Pashto",
                      "fa-AF": "Dari",
                      explanation: "Plain-language explanation",
                      domain: "Domain",
                      example: "Example",
                      notes: "Your notes",
                    }[f]
                  }
                  <textarea
                    required={f === "en"}
                    dir={f === "ps" || f === "fa-AF" ? "rtl" : "ltr"}
                    value={editing[f] || ""}
                    onChange={(e) =>
                      setEditing({ ...editing, [f]: e.target.value })
                    }
                  />
                </label>
              ))}
            </div>
            <div className="row">
              <button className="primary" type="submit">
                Save entry
              </button>
              <button type="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}
      <p className="muted">
        {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
        {saved ? " · Personal collection" : " · Draft library"}
      </p>
      <div className="glossary-grid">
        {filtered.map((e) => (
          <div key={e.id}>
            <TermCard entry={e} target={target} />
            {saved && (
              <div className="personal-actions">
                <button
                  aria-label={"Favorite " + e.en}
                  onClick={() =>
                    persist(
                      personal.map((x) =>
                        x.id === e.id ? { ...x, favorite: !x.favorite } : x,
                      ),
                    )
                  }
                >
                  <Star size={15} fill={e.favorite ? "currentColor" : "none"} />
                </button>
                <button onClick={() => setEditing(e)}>
                  <Pencil size={14} /> Edit / notes
                </button>
                <button
                  aria-label={"Delete " + e.en}
                  onClick={() => {
                    if (window.confirm("Delete this saved entry?"))
                      persist(personal.filter((x) => x.id !== e.id));
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="empty">
          <h2>No terms here yet.</h2>
          <p>
            {saved
              ? "Save a term from the cockpit or terminology library, or add your own."
              : "Try a different search or category."}
          </p>
        </div>
      )}
    </div>
  );
}
