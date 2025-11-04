"use client";

import { Sidebar } from "@/components/sidebar/Sidebar";
import { Card } from "@/components/ui/card";
import { HeartIcon, DownloadIcon, MagnifyingGlassIcon, StarFilledIcon } from "@radix-ui/react-icons";
import { useEffect, useMemo, useRef, useState } from "react";

function Tile({ label }: { label: string }) {
  return (
    <div className="w-[220px] h-[120px] rounded-[12px] bg-neutral-200 flex items-center justify-center text-neutral-600 text-sm shrink-0">
      {label}
    </div>
  );
}

export default function EditingPage() {
  type Sfx = { id: string; name: string; duration: string; size: string; category: string; tier: "Free" | "Pro" };
  const sfxData: Sfx[] = [
    { id: "vintage-camera", name: "Vintage Camera Shutter", duration: "0:02", size: "79kb", category: "Vintage", tier: "Pro" },
    { id: "mouse-click-fast", name: "Mouse Click Fast", duration: "0:01", size: "120kb", category: "Tech", tier: "Free" },
    { id: "whoosh-soft", name: "Whoosh Soft", duration: "0:03", size: "140kb", category: "Lifestyle", tier: "Free" },
    { id: "pop-ui", name: "UI Pop", duration: "0:01", size: "85kb", category: "Tech", tier: "Free" },
    { id: "film-roll", name: "Film Roll Start", duration: "0:02", size: "98kb", category: "Vintage", tier: "Pro" },
    { id: "sparkle", name: "Sparkle Chime", duration: "0:02", size: "76kb", category: "Lifestyle", tier: "Free" },
  ];

  const allCategories = Array.from(new Set(sfxData.map((s) => s.category)));
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("cc_sfx_favorites");
      if (raw) setFavorites(JSON.parse(raw));
    } catch {}
    return () => {
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try { localStorage.setItem("cc_sfx_favorites", JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const filtered = useMemo(() => {
    return sfxData.filter((s) => {
      if (favoritesOnly && !favorites.includes(s.id)) return false;
      if (selected.length > 0 && !selected.includes(s.category)) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (!s.name.toLowerCase().includes(q) && !s.category.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [sfxData, favoritesOnly, favorites, selected, query]);

  const handlePlay = async (id: string) => {
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
        const AudioContextClass = window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioContextClass) {
          audioCtxRef.current = new AudioContextClass();
        }
      }
      const ctx = audioCtxRef.current!;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = 660;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      setPlayingId(id);
      setTimeout(() => {
        osc.stop();
        setPlayingId(null);
      }, 420);
    } catch {}
  };

  const handleDownload = (item: Sfx) => {
    const blob = new Blob([`${item.name} (placeholder sound)`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.name.replace(/\s+/g, "-").toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-[100dvh] bg-neutral-50">
      <div className="w-full h-full px-5 flex gap-6 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto py-4">
          <Card padded={false} className="mb-5">
            <div className="px-5 py-4 border-b border-[#efefef]">
              <div className="text-[15px] font-semibold">Editing Resources</div>
              <div className="text-xs text-neutral-500">Quick access to fonts and sound effects</div>
            </div>
            <div className="p-5 space-y-8">
              <section className="space-y-3">
                <div className="text-[14px] font-semibold">Fonts</div>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Tile key={i} label={`Font ${i + 1}`} />
                  ))}
                </div>
              </section>
              <section className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-[14px] font-semibold">Sound FX</div>
                  <button
                    onClick={() => setFavoritesOnly((f) => !f)}
                    className="flex items-center gap-2 rounded-[10px] border border-[#e5e5e5] px-3 py-1.5 text-[12px] hover:bg-neutral-50"
                  >
                    <HeartIcon className="h-3.5 w-3.5" /> {favoritesOnly ? "Favorites Only" : "All Sounds"}
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search sounds and tags..."
                      className="w-full rounded-[12px] border border-[#e5e5e5] bg-white pl-9 pr-3 py-2.5 text-[14px]"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {allCategories.map((c) => {
                    const active = selected.includes(c);
                    return (
                      <button
                        key={c}
                        onClick={() => setSelected((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))}
                        className={
                          `rounded-[12px] px-3 py-1.5 text-[13px] border ${active ? "bg-black text-white border-black" : "bg-white text-neutral-800 border-[#e5e5e5] hover:bg-neutral-50"}`
                        }
                      >
                        {c}
                      </button>
                    );
                  })}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {filtered.map((item) => (
                    <div key={item.id} className="rounded-[12px] border border-[#efefef] bg-white p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[20px] font-semibold leading-tight">{item.name}</div>
                          <div className="mt-2 text-neutral-600 text-[14px]">Duration: {item.duration} · Size: {item.size}</div>
                        </div>
                        {item.tier === "Pro" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-700 px-3 py-1 text-[12px]">
                            <StarFilledIcon className="h-3 w-3" /> Pro
                          </span>
                        )}
                      </div>
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={() => handlePlay(item.id)}
                          className={`flex-1 inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#e5e5e5] px-4 py-2 text-[14px] ${playingId === item.id ? "bg-neutral-100" : "bg-white hover:bg-neutral-50"}`}
                          aria-label="Play preview"
                        >
                          {playingId === item.id ? "Playing" : "Play"}
                          <span className="ml-1 inline-flex gap-0.5">
                            <span className="w-1 h-3 bg-neutral-400 inline-block" />
                            <span className="w-1 h-4 bg-neutral-400 inline-block" />
                            <span className="w-1 h-2 bg-neutral-400 inline-block" />
                            <span className="w-1 h-5 bg-neutral-400 inline-block" />
                          </span>
                        </button>
                        <button
                          onClick={() => toggleFavorite(item.id)}
                          className={`h-9 w-9 inline-flex items-center justify-center rounded-[10px] border ${favorites.includes(item.id) ? "border-rose-300 bg-rose-50 text-rose-600" : "border-[#e5e5e5] text-neutral-700 hover:bg-neutral-50"}`}
                          aria-label="Toggle favorite"
                          title="Favorite"
                        >
                          <HeartIcon />
                        </button>
                        <button
                          onClick={() => handleDownload(item)}
                          className="h-9 w-9 inline-flex items-center justify-center rounded-[10px] border border-[#e5e5e5] text-neutral-700 hover:bg-neutral-50"
                          aria-label="Download"
                          title="Download"
                        >
                          <DownloadIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}

