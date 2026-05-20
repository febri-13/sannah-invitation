const ACTIVE_EVENT_COOKIE = "active_event_id";

export function getActiveEvent(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(`(^| )${ACTIVE_EVENT_COOKIE}=([^;]+)`)
  );
  return match ? match[2] : undefined;
}

export function setActiveEvent(eventId: string): void {
  document.cookie = `${ACTIVE_EVENT_COOKIE}=${eventId}; path=/; max-age=2592000; SameSite=Lax`;
}

export function clearActiveEvent(): void {
  document.cookie = `${ACTIVE_EVENT_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
