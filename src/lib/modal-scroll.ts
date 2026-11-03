let locks = 0;
let original = "";
export function lockModalScroll() {
  if (locks++ === 0) { original = document.body.style.overflow; document.body.style.overflow = "hidden"; }
  let released = false;
  return () => { if (released) return; released = true; if (--locks === 0) document.body.style.overflow = original; };
}
