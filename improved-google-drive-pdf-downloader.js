/* Google Drive view-only PDF downloader — auto-scroll version
 * Paste once in the PDF viewer console, then leave the tab open.
 * It captures visible Drive blob images during scrolling, so virtualized
 * pages do not need to remain in the DOM at the same time.
 */
(async function () {
  "use strict";

  if (window.__gdrivePdfDownloaderRunning) {
    console.warn("Downloader is already running in this tab.");
    return;
  }
  window.__gdrivePdfDownloaderRunning = true;

  const CONFIG = {
    renderWaitMs: 700,
    stableBottomPasses: 8,
    scrollFraction: 0.85,
    maxPasses: 10000,
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const isDriveBlob = (img) => img?.src?.startsWith("blob:https://drive.google.com/");

  function scrollableElements() {
    return [document.scrollingElement, ...document.querySelectorAll("*")]
      .filter((el) => {
        if (!el) return false;
        const s = getComputedStyle(el);
        return el.scrollHeight - el.clientHeight > 80 &&
          ["auto", "scroll", "overlay"].includes(s.overflowY);
      });
  }

  function chooseScrollRoot() {
    const candidates = [...new Set(scrollableElements())];
    candidates.sort((a, b) => {
      const count = (el) => [...el.querySelectorAll("img")].filter(isDriveBlob).length;
      const score = (el) => count(el) * 1e9 + Math.min(el.clientWidth * el.clientHeight, 1e7) +
        Math.min(el.scrollHeight - el.clientHeight, 1e7);
      return score(b) - score(a);
    });
    return candidates[0] || document.scrollingElement || document.documentElement;
  }

  const root = chooseScrollRoot();
  const pageImages = new Map();
  const isDocumentRoot = root === document.scrollingElement || root === document.documentElement;
  const getTop = () => isDocumentRoot ? window.scrollY : root.scrollTop;
  const setTop = (value) => isDocumentRoot ? window.scrollTo(0, value) : (root.scrollTop = value);
  const visibleBounds = () => isDocumentRoot
    ? { top: 0, bottom: window.innerHeight }
    : root.getBoundingClientRect();

  async function captureVisiblePages() {
    const bounds = visibleBounds();
    const scrollTop = getTop();

    for (const img of [...document.querySelectorAll("img")].filter(isDriveBlob)) {
      if (!img.complete || !img.naturalWidth || !img.naturalHeight) continue;
      const rect = img.getBoundingClientRect();
      if (rect.bottom < bounds.top - 20 || rect.top > bounds.bottom + 20) continue;

      // Position is used as the key because Drive can replace the blob URL
      // when it virtualizes/re-renders a page.
      const pageY = Math.round((rect.top + scrollTop) / 4) * 4;
      const key = `${pageY}:${img.naturalWidth}x${img.naturalHeight}`;
      if (pageImages.has(key)) continue;

      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        canvas.getContext("2d").drawImage(img, 0, 0);
        pageImages.set(key, {
          pageY,
          width: canvas.width,
          height: canvas.height,
          data: canvas.toDataURL("image/png"),
        });
        console.log(`Captured ${pageImages.size} page image(s)`);
      } catch (error) {
        console.warn("Capture failed; this image will be retried:", error);
      }
    }
  }

  try {
    console.log("Automatic loading started ...", root);
    setTop(0);
    await sleep(CONFIG.renderWaitMs);

    let stableAtBottom = 0;
    for (let pass = 1; pass <= CONFIG.maxPasses; pass++) {
      await captureVisiblePages();

      const before = getTop();
      const maxTop = Math.max(0, root.scrollHeight - root.clientHeight);
      setTop(Math.min(maxTop, before + Math.max(200, root.clientHeight * CONFIG.scrollFraction)));
      await sleep(CONFIG.renderWaitMs);
      await captureVisiblePages();

      const after = getTop();
      const nowAtBottom = after >= Math.max(0, root.scrollHeight - root.clientHeight) - 3;
      if (nowAtBottom && after <= before + 2) stableAtBottom++;
      else stableAtBottom = 0;

      if (pass % 10 === 0 || nowAtBottom) {
        console.log(`Loading pass ${pass}; captured ${pageImages.size}; scroll ${Math.round(after)}/${Math.round(root.scrollHeight - root.clientHeight)}`);
      }
      // Drive can append more content after reaching the bottom. Wait for
      // several unchanged bottom passes before concluding the load is done.
      if (stableAtBottom >= CONFIG.stableBottomPasses) break;
    }

    await captureVisiblePages();
    const pages = [...pageImages.values()].sort((a, b) => a.pageY - b.pageY);
    if (!pages.length) throw new Error("No Drive page images found in this tab.");

    console.log(`Loading complete: ${pages.length} page image(s) found.`);
    console.log("Loading jsPDF ...");
    const script = document.createElement("script");
    const source = "https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js";
    script.src = window.trustedTypes?.createPolicy?.("gdrivePdfPolicy", {
      createScriptURL: (url) => url,
    })?.createScriptURL(source) || source;
    await new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = () => reject(new Error("Could not load jsPDF from unpkg.com."));
      document.body.appendChild(script);
    });

    const { jsPDF } = window.jspdf;
    let pdf;
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const orientation = page.width > page.height ? "l" : "p";
      if (i === 0) {
        pdf = new jsPDF({ orientation, unit: "px", format: [page.width, page.height] });
      } else {
        pdf.addPage([page.width, page.height], orientation);
      }
      pdf.addImage(page.data, "PNG", 0, 0, page.width, page.height, undefined, "SLOW");
      console.log(`Combining page ${i + 1}/${pages.length}`);
    }

    let title = document.querySelector('meta[itemprop="name"]')?.content ||
      document.title || "download.pdf";
    if (!title.toLowerCase().endsWith(".pdf")) title += ".pdf";

    console.log("Downloading PDF file ...");
    await pdf.save(title, { returnPromise: true });
    console.log(`PDF downloaded! ${pages.length} page(s).`);
  } catch (error) {
    console.error("PDF downloader failed:", error);
  } finally {
    window.__gdrivePdfDownloaderRunning = false;
  }
})();

/* If Chrome blocks paste, type: allow pasting */
/* Keep the tab open until: PDF downloaded! N page(s). */
/* This script still depends on Drive exposing pages as blob <img> elements. */
