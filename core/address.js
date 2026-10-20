// A start event in the address of the page: ?event=<JSON of an event>, for example the file of an event given as text. Without it the page starts with random momenta.
export function initialEventFromAddress(search = location.search) {
  const text = new URLSearchParams(search).get('event');
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}
