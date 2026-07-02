import { useState, useEffect } from "react";
import { PREVIRED_STATIC, PreviredData } from "./constants";

const CACHE_KEY = "previred_cache_v1";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas

interface CachedIndicadores {
  UF: number;
  UTM: number;
  timestamp: number;
  mes: string; // "Junio 2026"
}

async function fetchIndicadores(): Promise<Pick<PreviredData, "UF" | "UTM"> & { mes: string }> {
  const res = await fetch("https://mindicador.cl/api");
  if (!res.ok) throw new Error("API error");
  const data = await res.json();

  const fecha = new Date(data.uf.fecha);
  const mes = fecha.toLocaleDateString("es-CL", { month: "long", year: "numeric" });

  return {
    UF:  Math.round(data.uf.valor),
    UTM: Math.round(data.utm.valor),
    mes: mes.charAt(0).toUpperCase() + mes.slice(1),
  };
}

export function usePrevired() {
  const [previred, setPrevired] = useState<PreviredData>(PREVIRED_STATIC);
  const [mesIndicador, setMesIndicador] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Intentar desde caché primero
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached: CachedIndicadores = JSON.parse(raw);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
          setPrevired(prev => ({ ...prev, UF: cached.UF, UTM: cached.UTM }));
          setMesIndicador(cached.mes);
          setLoading(false);
          return;
        }
      }
    } catch {}

    // Fetch fresco
    fetchIndicadores()
      .then(({ UF, UTM, mes }) => {
        const cache: CachedIndicadores = { UF, UTM, mes, timestamp: Date.now() };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        setPrevired(prev => ({ ...prev, UF, UTM }));
        setMesIndicador(mes);
      })
      .catch(() => {
        // Silently fall back to static values
      })
      .finally(() => setLoading(false));
  }, []);

  return { previred, mesIndicador, loading };
}
