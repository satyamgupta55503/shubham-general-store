/**
 * downloadPdf — one-click A4 PDF using html2pdf.js
 *
 * Strategy: Temporarily hide action bar + apply PDF styles,
 * capture the element, then restore. This is the only reliable
 * approach because html2canvas requires elements to be visible/on-screen.
 *
 * @param {string}   elementId  DOM id of element to capture
 * @param {string}   filename   Output filename (without .pdf)
 * @param {Function} onStart    Called before generation
 * @param {Function} onDone     Called after download (or on error)
 */
export async function downloadPdf(elementId, filename, onStart, onDone) {
  if (typeof window === 'undefined') return;
  onStart?.();

  // ── Save original styles ──────────────────────────────────────────────────
  const el = document.getElementById(elementId);
  if (!el) { onDone?.(); return; }

  const origMargin    = el.style.margin;
  const origBoxShadow = el.style.boxShadow;
  const origWidth     = el.style.width;
  const origMaxWidth  = el.style.maxWidth;
  const origPadding   = el.style.padding;

  // ── Hide no-print elements (action bar, toast, modals) ───────────────────
  const noPrintEls = document.querySelectorAll('.no-print');
  const noPrintDisplays = [];
  noPrintEls.forEach(e => { noPrintDisplays.push(e.style.display); e.style.display = 'none'; });

  // ── Apply clean PDF styles ────────────────────────────────────────────────
  el.style.margin    = '0 auto';
  el.style.boxShadow = 'none';
  el.style.width     = '210mm';
  el.style.maxWidth  = '210mm';
  el.style.padding   = '12mm 15mm';

  // Also set body bg to white so no grey bleeds in
  const origBodyBg = document.body.style.background;
  document.body.style.background = '#ffffff';

  // Scroll to element so html2canvas can see it
  window.scrollTo(0, 0);
  el.scrollIntoView({ block: 'start' });

  // Small delay so browser repaints before capture
  await new Promise(r => setTimeout(r, 200));

  try {
    const html2pdf = (await import('html2pdf.js')).default;

    const opt = {
      margin:      0,
      filename:    `${filename}.pdf`,
      image:       { type: 'jpeg', quality: 0.97 },
      html2canvas: {
        scale:           2,
        useCORS:         true,
        allowTaint:      true,
        letterRendering: true,
        logging:         false,
        backgroundColor: '#ffffff',
        // Capture from current scroll position
        scrollX:  0,
        scrollY:  0,
      },
      jsPDF: {
        unit:        'mm',
        format:      'a4',
        orientation: 'portrait',
        compress:    true,
      },
      pagebreak: {
        mode:  ['css', 'legacy'],
        avoid: ['tr', 'td', 'th', 'img'],
      },
    };

    await html2pdf().set(opt).from(el).save();

  } catch (err) {
    console.error('PDF generation failed:', err);
  }

  // ── Restore original styles ───────────────────────────────────────────────
  el.style.margin    = origMargin;
  el.style.boxShadow = origBoxShadow;
  el.style.width     = origWidth;
  el.style.maxWidth  = origMaxWidth;
  el.style.padding   = origPadding;
  document.body.style.background = origBodyBg;

  noPrintEls.forEach((e, i) => { e.style.display = noPrintDisplays[i]; });

  onDone?.();
}
