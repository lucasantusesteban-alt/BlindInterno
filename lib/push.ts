"use client";

import { pb } from "@/lib/pocketbase";

// VAPID public key — safe to expose in the client.
export const VAPID_PUBLIC_KEY =
  "BLNsoWQAuRNFEJRE4UOavyrA6CvnPHxFmox6sCzWS6-Aj0rJRgx8TzHY94zAFIJOLyp150Nd_A_pQon1TYqozdc";

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return null;
  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch (e) {
    console.error("[push] SW registration failed", e);
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function currentPermission(): NotificationPermission | "unsupported" {
  if (!pushSupported()) return "unsupported";
  return Notification.permission;
}

export async function isSubscribed(): Promise<boolean> {
  if (!pushSupported()) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    return !!sub;
  } catch {
    return false;
  }
}

type SubResult = { ok: boolean; error?: string };

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(label)), ms)),
  ]);
}

function authUserId(): string | undefined {
  // SDK 0.27 exposes authStore.record; older versions used .model.
  const store = pb.authStore as unknown as {
    record?: { id?: string };
    model?: { id?: string };
  };
  return store.record?.id ?? store.model?.id;
}

export async function subscribeToPush(): Promise<SubResult> {
  try {
    if (!pushSupported()) return { ok: false, error: "unsupported" };
    if (!pb.authStore.isValid) return { ok: false, error: "not_authenticated" };

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return { ok: false, error: "denied" };

    // Make sure a SW is registered, then wait for it to be ready (with a
    // timeout — navigator.serviceWorker.ready can hang forever on iOS).
    let reg = await navigator.serviceWorker.getRegistration();
    if (!reg) reg = await navigator.serviceWorker.register("/sw.js");
    reg = await withTimeout(navigator.serviceWorker.ready, 10000, "sw_timeout");

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await withTimeout(
        reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
        }),
        15000,
        "subscribe_timeout"
      );
    }

    const json = sub.toJSON();
    const endpoint = json.endpoint;
    const keys = json.keys;
    if (!endpoint) return { ok: false, error: "no_endpoint" };
    if (!keys?.p256dh || !keys?.auth) return { ok: false, error: "no_keys" };

    let userId = authUserId();
    if (!userId) {
      // Auth token is valid but the record wasn't hydrated — refresh it.
      try {
        const refreshed = await withTimeout(
          pb.collection("users").authRefresh(),
          10000,
          "refresh_timeout"
        );
        userId = refreshed.record?.id;
      } catch {
        /* fall through */
      }
    }
    if (!userId) return { ok: false, error: "no_user" };

    const existing = await withTimeout(
      pb
        .collection("push_subscriptions")
        .getFirstListItem(`endpoint="${endpoint}"`)
        .catch(() => null),
      10000,
      "save_timeout"
    );

    if (existing) {
      await withTimeout(
        pb.collection("push_subscriptions").update(existing.id, {
          user: userId,
          p256dh: keys.p256dh,
          auth: keys.auth,
          userAgent: navigator.userAgent,
        }),
        10000,
        "save_timeout"
      );
    } else {
      await withTimeout(
        pb.collection("push_subscriptions").create({
          user: userId,
          endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          userAgent: navigator.userAgent,
        }),
        10000,
        "save_timeout"
      );
    }
    return { ok: true };
  } catch (e) {
    console.error("[push] subscribe failed", e);
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}

export async function unsubscribeFromPush(): Promise<void> {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;

  const endpoint = sub.endpoint;
  await sub.unsubscribe().catch(() => {});

  try {
    const existing = await pb
      .collection("push_subscriptions")
      .getFirstListItem(`endpoint="${endpoint}"`)
      .catch(() => null);
    if (existing) await pb.collection("push_subscriptions").delete(existing.id);
  } catch {
    /* best effort */
  }
}
