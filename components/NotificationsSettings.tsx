"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Bell, BellOff, Check } from "lucide-react";
import {
  pushSupported,
  currentPermission,
  isSubscribed,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push";

const ERROR_LABELS: Record<string, string> = {
  unsupported: "Tu navegador no soporta notificaciones push.",
  not_authenticated: "Inicia sesión de nuevo para activar las notificaciones.",
  denied: "Permiso denegado. Actívalo en los ajustes del navegador.",
  no_endpoint: "El navegador no devolvió un endpoint de push.",
  no_keys: "El navegador no devolvió las claves de cifrado.",
  no_user: "No se pudo identificar tu usuario. Cierra sesión y vuelve a entrar.",
  save_failed: "Error al guardar la suscripción.",
  sw_timeout: "El service worker no respondió. Cierra la app del todo y reábrela.",
  subscribe_timeout: "iOS no completó la suscripción. Reintenta o reinstala la app.",
  refresh_timeout: "No se pudo refrescar la sesión (sin conexión con el servidor).",
  save_timeout: "No se pudo guardar la suscripción (sin conexión con el servidor).",
};

export function NotificationsSettings() {
  const [supported, setSupported] = useState(true);
  const [subscribed, setSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const sup = pushSupported();
    setSupported(sup);
    setPermission(currentPermission());
    if (!sup) {
      setLoading(false);
      return;
    }
    // Guard: navigator.serviceWorker.ready can hang on iOS; never stay stuck loading.
    const timeout = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 3000);
    isSubscribed()
      .then((s) => {
        if (!cancelled) setSubscribed(s);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) {
          clearTimeout(timeout);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  async function handleEnable() {
    setWorking(true);
    setError(null);
    try {
      const res = await subscribeToPush();
      if (res.ok) {
        setSubscribed(true);
        setPermission("granted");
      } else {
        setError(ERROR_LABELS[res.error ?? ""] ?? res.error ?? "Error desconocido.");
        setPermission(currentPermission());
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido.");
    } finally {
      setWorking(false);
    }
  }

  async function handleDisable() {
    setWorking(true);
    setError(null);
    await unsubscribeFromPush();
    setSubscribed(false);
    setWorking(false);
  }

  const isIOS =
    typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone =
    typeof window !== "undefined" &&
    (window.matchMedia?.("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari legacy flag
      window.navigator.standalone === true);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell size={13} className="text-[#c8102e]" />
          <span
            className="text-[#f0f0ee] text-[11px] tracking-[0.2em]"
            style={{ fontFamily: "var(--font-space-mono)" }}
          >
            NOTIFICACIONES PUSH
          </span>
        </div>
        {subscribed && (
          <span className="flex items-center gap-1 text-green-400 text-[9px] tracking-[0.15em]"
            style={{ fontFamily: "var(--font-space-mono)" }}>
            <Check size={10} /> ACTIVAS
          </span>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-[#8c8c8c] text-xs leading-relaxed mb-4">
          Recibe un recordatorio diario con tus tareas pendientes y los eventos del
          día, además de avisos antes de cada grabación o publicación programada.
        </p>

        {!supported ? (
          <div className="border border-[#2a2a2a] bg-[#0a0a0a] p-3">
            <p className="text-[#8c8c8c] text-[10px]" style={{ fontFamily: "var(--font-space-mono)" }}>
              {isIOS && !isStandalone
                ? "// En iPhone: añade la app a la pantalla de inicio (Compartir › Añadir a inicio) y vuelve aquí para activarlas."
                : "// Tu navegador no soporta notificaciones push."}
            </p>
          </div>
        ) : loading ? (
          <p className="text-[#2a2a2a] text-[10px]" style={{ fontFamily: "var(--font-space-mono)" }}>
            CARGANDO...
          </p>
        ) : (
          <div className="space-y-3">
            {!subscribed ? (
              <button
                onClick={handleEnable}
                disabled={working || permission === "denied"}
                className="flex items-center gap-2 bg-[#c8102e] hover:bg-[#a00d24] disabled:opacity-40 disabled:cursor-not-allowed text-[#f0f0ee] px-4 py-2.5 text-[10px] tracking-[0.15em] transition-colors"
                style={{ fontFamily: "var(--font-space-mono)" }}
              >
                <Bell size={12} />
                {working ? "ACTIVANDO..." : "ACTIVAR NOTIFICACIONES"}
              </button>
            ) : (
              <button
                onClick={handleDisable}
                disabled={working}
                className="flex items-center gap-2 border border-[#2a2a2a] hover:border-[#8c8c8c] text-[#8c8c8c] hover:text-[#f0f0ee] disabled:opacity-40 px-4 py-2.5 text-[10px] tracking-[0.15em] transition-colors"
                style={{ fontFamily: "var(--font-space-mono)" }}
              >
                <BellOff size={12} />
                {working ? "DESACTIVANDO..." : "DESACTIVAR EN ESTE DISPOSITIVO"}
              </button>
            )}

            {permission === "denied" && (
              <p className="text-[#c8102e] text-[10px]" style={{ fontFamily: "var(--font-space-mono)" }}>
                ⚠ Has bloqueado las notificaciones. Actívalas en los ajustes del navegador para este sitio.
              </p>
            )}

            {error && (
              <p className="text-[#c8102e] text-[10px]" style={{ fontFamily: "var(--font-space-mono)" }}>
                ⚠ {error}
              </p>
            )}

            <p className="text-[#2a2a2a] text-[9px]" style={{ fontFamily: "var(--font-space-mono)" }}>
              // La suscripción es por dispositivo. Actívalas en cada móvil/ordenador donde quieras recibirlas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
