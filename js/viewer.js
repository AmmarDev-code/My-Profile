/**
 * Eng. Hafedh Ali Saif Al-Mashwali - Smart Document Viewer (Lightbox Modal)
 * Provides Zoom In/Out, Rotate Left/Right, Reset, Pan/Drag, and File Upload with IndexedDB persistence.
 */

const DocumentViewer = (() => {
  let currentDocIndex = 0;
  let currentDocsList = [];
  let currentScale = 1;
  let currentRotation = 0;
  let panX = 0;
  let panY = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let currentLang = "ar";

  // Cache DOM elements
  let modalEl = null;
  let viewportEl = null;
  let transformWrapperEl = null;
  let activeImageEl = null;
  let activePlaqueEl = null;
  let docMetaEl = null;
  let zoomLevelTextEl = null;
  let rotationTextEl = null;
  let fileInputEl = null;
  let currentUploadedRecord = null;

  function init() {
    modalEl = document.getElementById("doc-viewer-modal");
    if (!modalEl) return;

    viewportEl = document.getElementById("viewer-viewport");
    transformWrapperEl = document.getElementById("viewer-transform-wrapper");
    activeImageEl = document.getElementById("viewer-active-image");
    activePlaqueEl = document.getElementById("viewer-active-plaque");
    docMetaEl = document.getElementById("viewer-doc-meta");
    zoomLevelTextEl = document.getElementById("viewer-zoom-val");
    rotationTextEl = document.getElementById("viewer-rotation-val");

    // Hidden file input for uploading scans
    fileInputEl = document.createElement("input");
    fileInputEl.type = "file";
    fileInputEl.accept = "image/*,.heic,.pdf";
    fileInputEl.style.display = "none";
    document.body.appendChild(fileInputEl);

    fileInputEl.addEventListener("change", handleFileChosen);

    setupEventListeners();
    setupPanAndDrag();
  }

  function setLanguage(lang) {
    currentLang = lang;
    if (modalEl && modalEl.classList.contains("active")) {
      renderCurrentDoc();
    }
  }

  function setupEventListeners() {
    // Toolbar buttons
    document.getElementById("btn-viewer-zoom-in")?.addEventListener("click", () => zoomBy(0.25));
    document.getElementById("btn-viewer-zoom-out")?.addEventListener("click", () => zoomBy(-0.25));
    document.getElementById("btn-viewer-rotate-left")?.addEventListener("click", () => rotateBy(-90));
    document.getElementById("btn-viewer-rotate-right")?.addEventListener("click", () => rotateBy(90));
    document.getElementById("btn-viewer-reset")?.addEventListener("click", resetTransform);
    document.getElementById("btn-viewer-close")?.addEventListener("click", closeModal);
    document.getElementById("btn-viewer-prev")?.addEventListener("click", showPrev);
    document.getElementById("btn-viewer-next")?.addEventListener("click", showNext);
    document.getElementById("btn-viewer-upload")?.addEventListener("click", triggerUpload);
    document.getElementById("btn-viewer-print")?.addEventListener("click", printCurrentDocument);
    document.getElementById("btn-viewer-remove-scan")?.addEventListener("click", removeCurrentScan);

    // Close on backdrop click (outside modal content)
    modalEl.addEventListener("click", (e) => {
      if (e.target === modalEl || e.target.classList.contains("viewer-backdrop")) {
        closeModal();
      }
    });

    // Keyboard navigation
    window.addEventListener("keydown", (e) => {
      if (!modalEl || !modalEl.classList.contains("active")) return;
      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "ArrowLeft") {
        if (currentLang === "ar") showNext(); else showPrev();
      } else if (e.key === "ArrowRight") {
        if (currentLang === "ar") showPrev(); else showNext();
      } else if (e.key === "+" || e.key === "=") {
        zoomBy(0.25);
      } else if (e.key === "-") {
        zoomBy(-0.25);
      } else if (e.key === "r" || e.key === "R") {
        rotateBy(90);
      } else if (e.key === "0") {
        resetTransform();
      }
    });

    // Listen for scan updates from other parts of UI
    window.addEventListener("scan:updated", (e) => {
      const activeDoc = getActiveDoc();
      if (activeDoc && activeDoc.id === e.detail.id) {
        currentUploadedRecord = e.detail.record;
        renderActiveDisplay();
      }
    });

    window.addEventListener("scan:removed", (e) => {
      const activeDoc = getActiveDoc();
      if (activeDoc && activeDoc.id === e.detail.id) {
        currentUploadedRecord = null;
        renderActiveDisplay();
      }
    });
  }

  function setupPanAndDrag() {
    if (!viewportEl) return;

    viewportEl.addEventListener("mousedown", (e) => {
      if (e.target.closest(".viewer-controls") || e.target.closest("button")) return;
      isDragging = true;
      dragStartX = e.clientX - panX;
      dragStartY = e.clientY - panY;
      viewportEl.style.cursor = "grabbing";
      e.preventDefault();
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      panX = e.clientX - dragStartX;
      panY = e.clientY - dragStartY;
      applyTransform();
    });

    window.addEventListener("mouseup", () => {
      if (isDragging) {
        isDragging = false;
        viewportEl.style.cursor = currentScale > 1 ? "grab" : "default";
      }
    });

    // Mouse wheel zoom
    viewportEl.addEventListener("wheel", (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.15 : 0.15;
      zoomBy(delta);
    }, { passive: false });

    // Touch support for mobile pinch/drag
    let initialTouchDistance = null;
    let initialScale = 1;

    viewportEl.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX - panX;
        dragStartY = e.touches[0].clientY - panY;
      } else if (e.touches.length === 2) {
        isDragging = false;
        initialTouchDistance = getTouchDistance(e.touches);
        initialScale = currentScale;
      }
    }, { passive: true });

    viewportEl.addEventListener("touchmove", (e) => {
      if (isDragging && e.touches.length === 1) {
        panX = e.touches[0].clientX - dragStartX;
        panY = e.touches[0].clientY - dragStartY;
        applyTransform();
      } else if (e.touches.length === 2 && initialTouchDistance) {
        const newDistance = getTouchDistance(e.touches);
        const factor = newDistance / initialTouchDistance;
        currentScale = Math.min(Math.max(initialScale * factor, 0.5), 4);
        applyTransform();
      }
    }, { passive: true });

    viewportEl.addEventListener("touchend", () => {
      isDragging = false;
      initialTouchDistance = null;
    });
  }

  function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.hypot(dx, dy);
  }

  function getActiveDoc() {
    return currentDocsList[currentDocIndex] || null;
  }

  async function openDoc(docId, docsList = CREDENTIALS_DATA) {
    currentDocsList = docsList;
    const idx = currentDocsList.findIndex(d => d.id === docId);
    currentDocIndex = idx >= 0 ? idx : 0;

    resetTransform();
    modalEl.classList.add("active");
    document.body.classList.add("modal-open");

    await renderCurrentDoc();
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.classList.remove("active");
    document.body.classList.remove("modal-open");
    resetTransform();
  }

  async function showNext() {
    if (currentDocIndex < currentDocsList.length - 1) {
      currentDocIndex++;
    } else {
      currentDocIndex = 0; // loop
    }
    resetTransform();
    await renderCurrentDoc();
  }

  async function showPrev() {
    if (currentDocIndex > 0) {
      currentDocIndex--;
    } else {
      currentDocIndex = currentDocsList.length - 1; // loop
    }
    resetTransform();
    await renderCurrentDoc();
  }

  function zoomBy(step) {
    currentScale = Math.min(Math.max(currentScale + step, 0.5), 4);
    applyTransform();
  }

  function rotateBy(degrees) {
    currentRotation = (currentRotation + degrees) % 360;
    if (currentRotation < 0) currentRotation += 360;
    applyTransform();
  }

  function resetTransform() {
    currentScale = 1;
    currentRotation = 0;
    panX = 0;
    panY = 0;
    applyTransform();
  }

  function applyTransform() {
    if (!transformWrapperEl) return;
    transformWrapperEl.style.transform = `translate(${panX}px, ${panY}px) rotate(${currentRotation}deg) scale(${currentScale})`;

    if (zoomLevelTextEl) {
      zoomLevelTextEl.textContent = `${Math.round(currentScale * 100)}%`;
    }
    if (rotationTextEl) {
      rotationTextEl.textContent = `${currentRotation}°`;
    }

    if (viewportEl) {
      viewportEl.style.cursor = currentScale > 1 ? "grab" : "default";
    }
  }

  async function renderCurrentDoc() {
    const doc = getActiveDoc();
    if (!doc) return;

    // Check stored scan in IndexedDB
    currentUploadedRecord = await CredentialsStorage.getScan(doc.id);

    renderMeta();
    renderActiveDisplay();
  }

  function renderMeta() {
    const doc = getActiveDoc();
    if (!doc || !docMetaEl) return;

    const isAr = currentLang === "ar";
    const title = doc.title[currentLang];
    const issuer = doc.issuer[currentLang];
    const date = doc.date[currentLang];
    const duration = doc.duration[currentLang];
    const ref = doc.reference[currentLang];
    const grade = doc.grade ? doc.grade[currentLang] : "";
    const badge = doc.badge[currentLang];
    const highlights = doc.highlights[currentLang] || [];

    const removeScanBtn = document.getElementById("btn-viewer-remove-scan");
    if (removeScanBtn) {
      removeScanBtn.style.display = currentUploadedRecord ? "inline-flex" : "none";
    }

    const scanStatusBadge = currentUploadedRecord
      ? `<span class="badge-status-uploaded"><i class="fa-solid fa-circle-check"></i> ${isAr ? "تم إرفاق المسح الضوئي وحفظه" : "Physical Scan Attached & Saved"}</span>`
      : `<span class="badge-status-plaque"><i class="fa-solid fa-award"></i> ${isAr ? "الشهادة الرقمية المعتمدة" : "Official Digital Plaque"}</span>`;

    docMetaEl.innerHTML = `
      <div class="meta-header">
        <div class="meta-badges">
          <span class="meta-badge-id">${doc.id.toUpperCase()}</span>
          <span class="meta-badge-cat">${badge}</span>
          ${scanStatusBadge}
        </div>
        <div class="meta-counter">${currentDocIndex + 1} / ${currentDocsList.length}</div>
      </div>
      
      <h2 class="meta-title">${title}</h2>
      
      <div class="meta-grid">
        <div class="meta-item">
          <span class="meta-label"><i class="fa-solid fa-building-columns"></i> ${isAr ? "الجهة المصدرة:" : "Issuing Authority:"}</span>
          <span class="meta-value">${issuer}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label"><i class="fa-solid fa-calendar-check"></i> ${isAr ? "تاريخ الإصدار:" : "Date of Issuance:"}</span>
          <span class="meta-value">${date}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label"><i class="fa-solid fa-clock"></i> ${isAr ? "المدة / الساعات:" : "Duration / Hours:"}</span>
          <span class="meta-value font-bold">${duration}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label"><i class="fa-solid fa-stamp"></i> ${isAr ? "الاعتماد / المرجع:" : "Reference / Code:"}</span>
          <span class="meta-value code-font">${ref}</span>
        </div>
        ${grade ? `
        <div class="meta-item full-width">
          <span class="meta-label"><i class="fa-solid fa-star"></i> ${isAr ? "التقدير والاعتماد:" : "Grade / Standing:"}</span>
          <span class="meta-value highlight-gold">${grade}</span>
        </div>
        ` : ""}
      </div>

      <div class="meta-highlights">
        <h4 class="highlights-heading"><i class="fa-solid fa-circle-check text-emerald"></i> ${isAr ? "مجالات الجدارة والكفاءة المكتسبة:" : "Key Competencies Gained:"}</h4>
        <ul>
          ${highlights.map(h => `<li>${h}</li>`).join("")}
        </ul>
      </div>

      <div class="meta-footer-info">
        <span class="meta-file-ref"><i class="fa-regular fa-file"></i> ${isAr ? "اسم ملف المسح الأصلي:" : "Original File Ref:"} <code>${doc.fileRef}</code></span>
      </div>
    `;
  }

  function renderActiveDisplay() {
    const doc = getActiveDoc();
    if (!doc) return;

    if (currentUploadedRecord && currentUploadedRecord.dataUrl) {
      // Display user-uploaded scan image
      activePlaqueEl.style.display = "none";
      activeImageEl.style.display = "block";
      activeImageEl.src = currentUploadedRecord.dataUrl;
      activeImageEl.alt = doc.title[currentLang];
    } else {
      // Try local fallback image or render high-fidelity SVG Plaque
      activePlaqueEl.style.display = "block";
      activeImageEl.style.display = "none";
      activePlaqueEl.innerHTML = generateCertificateSVG(doc, currentLang);

      // Pre-check if physical file exists in assets/certificates/
      const testImg = new Image();
      testImg.onload = () => {
        // Physical image exists on server/disk!
        activePlaqueEl.style.display = "none";
        activeImageEl.style.display = "block";
        activeImageEl.src = doc.imageFallback;
        activeImageEl.alt = doc.title[currentLang];
      };
      testImg.onerror = () => {
        // Fallback to SVG plaque (already set)
      };
      testImg.src = doc.imageFallback;
    }
  }

  function triggerUpload() {
    if (!fileInputEl) return;
    fileInputEl.value = "";
    fileInputEl.click();
  }

  async function handleFileChosen(e) {
    const file = e.target.files[0];
    if (!file) return;

    const doc = getActiveDoc();
    if (!doc) return;

    const isAr = currentLang === "ar";
    showToast(isAr ? "جاري معالجة وحفظ صورة الوثيقة..." : "Processing & saving document scan...", "info");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      try {
        await CredentialsStorage.saveScan(doc.id, dataUrl, {
          name: file.name,
          size: file.size,
          type: file.type
        });
        showToast(
          isAr
            ? `تم حفظ وتثبيت المسح الضوئي للوثيقة (${doc.id.toUpperCase()}) بنجاح!`
            : `Scan for (${doc.id.toUpperCase()}) saved permanently!`,
          "success"
        );
      } catch (err) {
        console.error("Save scan error:", err);
        showToast(isAr ? "حدث خطأ أثناء حفظ الصورة" : "Error saving document scan", "error");
      }
    };
    reader.readAsDataURL(file);
  }

  async function removeCurrentScan() {
    const doc = getActiveDoc();
    if (!doc) return;

    const isAr = currentLang === "ar";
    if (confirm(isAr ? "هل أنت متأكد من رغبتك في حذف المسح الضوئي المرفق والعودة للوثيقة الرقمية المعتمدة؟" : "Are you sure you want to remove the uploaded scan and revert to the official digital plaque?")) {
      await CredentialsStorage.removeScan(doc.id);
      showToast(isAr ? "تم حذف المسح الضوئي والرجوع للشهادة الرسمية الرقمية" : "Scan removed, reverted to digital plaque", "info");
    }
  }

  function printCurrentDocument() {
    window.print();
  }

  /**
   * Generates a museum-grade, official SVG digital certificate plaque
   * with authentic seals, guilloché security borders, Arabic typography, and security stamps.
   */
  function generateCertificateSVG(doc, lang = "ar") {
    const isAr = lang === "ar";
    const title = doc.title[lang];
    const issuer = doc.issuer[lang];
    const date = doc.date[lang];
    const duration = doc.duration[lang];
    const ref = doc.reference[lang];
    const grade = doc.grade ? doc.grade[lang] : "";
    const recipientAr = "المهندس / حافظ علي سيف المشولي";
    const recipientEn = "Eng. Hafedh Ali Saif Al-Mashwali";

    const accent = doc.colorAccent || "#0F172A";

    return `
      <svg class="certificate-svg-plaque" viewBox="0 0 1000 700" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg-grad-${doc.id}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="50%" stop-color="#FBFBFD"/>
            <stop offset="100%" stop-color="#F8FAFC"/>
          </linearGradient>

          <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F59E0B"/>
            <stop offset="50%" stop-color="#D97706"/>
            <stop offset="100%" stop-color="#92400E"/>
          </linearGradient>

          <linearGradient id="seal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#FDE68A"/>
            <stop offset="35%" stop-color="#F59E0B"/>
            <stop offset="70%" stop-color="#D97706"/>
            <stop offset="100%" stop-color="#78350F"/>
          </linearGradient>

          <pattern id="guilloche-pat" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 0 20 Q 10 0, 20 20 T 40 20" fill="none" stroke="#E2E8F0" stroke-width="0.8"/>
            <path d="M 0 20 Q 10 40, 20 20 T 40 20" fill="none" stroke="#E2E8F0" stroke-width="0.8"/>
          </pattern>

          <filter id="shadow-seal" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="5" stdDeviation="6" flood-color="#0F172A" flood-opacity="0.18"/>
          </filter>
        </defs>

        <!-- Main Card Canvas -->
        <rect x="10" y="10" width="980" height="680" rx="16" fill="url(#bg-grad-${doc.id})" stroke="#E2E8F0" stroke-width="2"/>
        <rect x="24" y="24" width="952" height="652" rx="12" fill="none" stroke="#CBD5E1" stroke-width="1.2"/>
        <rect x="32" y="32" width="936" height="636" rx="8" fill="url(#guilloche-pat)" opacity="0.4"/>
        <rect x="36" y="36" width="928" height="628" rx="8" fill="none" stroke="${accent}" stroke-width="2" stroke-dasharray="6,4" opacity="0.65"/>

        <!-- Four Corner Ornaments -->
        <g stroke="${accent}" stroke-width="2" fill="none">
          <!-- Top-Left -->
          <path d="M 46 66 L 46 46 L 66 46"/>
          <circle cx="54" cy="54" r="3" fill="${accent}"/>
          <!-- Top-Right -->
          <path d="M 954 66 L 954 46 L 934 46"/>
          <circle cx="946" cy="54" r="3" fill="${accent}"/>
          <!-- Bottom-Left -->
          <path d="M 46 634 L 46 654 L 66 654"/>
          <circle cx="54" cy="646" r="3" fill="${accent}"/>
          <!-- Bottom-Right -->
          <path d="M 954 634 L 954 654 L 934 654"/>
          <circle cx="946" cy="646" r="3" fill="${accent}"/>
        </g>

        <!-- Institutional Header Banner -->
        <g text-anchor="middle">
          <text x="500" y="80" font-family="'Tajawal', 'Cairo', sans-serif" font-size="14" font-weight="700" fill="#64748B" letter-spacing="3">
            ${isAr ? "الجمهورية اليمنية – سجل الاعتماد والتأهيل المهني المعتمد" : "OFFICIAL ACCREDITED PROFESSIONAL CREDENTIAL DOSSIER"}
          </text>
          <text x="500" y="112" font-family="'Cairo', 'Tajawal', sans-serif" font-size="20" font-weight="800" fill="#0F172A">
            ${issuer}
          </text>
          <line x1="320" y1="126" x2="680" y2="126" stroke="url(#gold-grad)" stroke-width="2.5" stroke-linecap="round"/>
        </g>

        <!-- Document Main Identification Type -->
        <g text-anchor="middle">
          <text x="500" y="168" font-family="'Cairo', sans-serif" font-size="24" font-weight="900" fill="${accent}">
            ${title}
          </text>
          <text x="500" y="196" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="600" fill="#64748B" letter-spacing="1">
            ${doc.title.en}
          </text>
        </g>

        <!-- Recipient Attribution Frame -->
        <rect x="200" y="222" width="600" height="98" rx="10" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5" filter="url(#shadow-seal)"/>
        <g text-anchor="middle">
          <text x="500" y="248" font-family="'Tajawal', sans-serif" font-size="13" font-weight="600" fill="#64748B">
            ${isAr ? "تشهد الجهة المانحة بأن هذا المؤهل / الاعتماد الرسمي صادر للمهندس:" : "This official credential certifies and honors:"}
          </text>
          <text x="500" y="280" font-family="'Cairo', sans-serif" font-size="23" font-weight="900" fill="#0F172A">
            ${recipientAr}
          </text>
          <text x="500" y="304" font-family="'Plus Jakarta Sans', sans-serif" font-size="13" font-weight="700" fill="#059669">
            ${recipientEn}
          </text>
        </g>

        <!-- Credentials Detail Box Grid -->
        <g>
          <!-- Box 1: Duration & Hours -->
          <rect x="80" y="340" width="260" height="90" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
          <text x="210" y="368" text-anchor="middle" font-family="'Tajawal', sans-serif" font-size="12" font-weight="600" fill="#64748B">
            ${isAr ? "مدة البرنامج وساعات التدريب" : "Training Hours / Duration"}
          </text>
          <text x="210" y="402" text-anchor="middle" font-family="'Cairo', sans-serif" font-size="${duration.length > 25 ? '12' : '14'}" font-weight="800" fill="#0F172A">
            ${duration}
          </text>

          <!-- Box 2: Issue Date & Year -->
          <rect x="370" y="340" width="260" height="90" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
          <text x="500" y="368" text-anchor="middle" font-family="'Tajawal', sans-serif" font-size="12" font-weight="600" fill="#64748B">
            ${isAr ? "تاريخ الإصدار والاعتماد" : "Issue Date & Period"}
          </text>
          <text x="500" y="402" text-anchor="middle" font-family="'Cairo', sans-serif" font-size="${date.length > 25 ? '12' : '14'}" font-weight="800" fill="#0F172A">
            ${date}
          </text>

          <!-- Box 3: Official Code / Reference -->
          <rect x="660" y="340" width="260" height="90" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>
          <text x="790" y="368" text-anchor="middle" font-family="'Tajawal', sans-serif" font-size="12" font-weight="600" fill="#64748B">
            ${isAr ? "كود الوثيقة ورقم السجل" : "Reference & Registration"}
          </text>
          <text x="790" y="402" text-anchor="middle" font-family="'Cairo', monospace" font-size="${ref.length > 28 ? '10.5' : '12.5'}" font-weight="800" fill="${accent}">
            ${ref}
          </text>
        </g>

        <!-- Evaluation & Standing Note -->
        ${grade ? `
        <rect x="250" y="450" width="500" height="42" rx="6" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1" opacity="0.8"/>
        <text x="500" y="476" text-anchor="middle" font-family="'Cairo', sans-serif" font-size="14" font-weight="800" fill="#92400E">
          ★ ${grade} ★
        </text>
        ` : ""}

        <!-- Executive Gold Emblem Seal (Center-Bottom) -->
        <g transform="translate(500, 570)" filter="url(#shadow-seal)">
          <circle cx="0" cy="0" r="46" fill="url(#seal-grad)"/>
          <circle cx="0" cy="0" r="40" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="3,2"/>
          <circle cx="0" cy="0" r="32" fill="#92400E"/>
          
          <!-- Star & Ribbon in Seal -->
          <polygon points="0,-16 5,-5 16,-5 8,3 11,14 0,7 -11,14 -8,3 -16,-5 -5,-5" fill="#FDE68A"/>
          <text x="0" y="24" text-anchor="middle" font-family="'Tajawal', sans-serif" font-size="8" font-weight="800" fill="#FDE68A" letter-spacing="1">VERIFIED</text>
        </g>

        <!-- Left Stamp / Signature Line -->
        <g transform="translate(180, 580)" text-anchor="middle">
          <line x1="-80" y1="0" x2="80" y2="0" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4,3"/>
          <text x="0" y="22" font-family="'Tajawal', sans-serif" font-size="12" font-weight="700" fill="#475569">
            ${isAr ? "الاعتماد والختم الرسمي" : "Official Accreditation Seal"}
          </text>
          <text x="0" y="40" font-family="'Tajawal', sans-serif" font-size="10" font-weight="500" fill="#94A3B8">
            ${doc.id.toUpperCase()} • VALIDATED
          </text>
        </g>

        <!-- Right Barcode / Authenticity QR Area -->
        <g transform="translate(820, 580)" text-anchor="middle">
          <line x1="-80" y1="0" x2="80" y2="0" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="4,3"/>
          <text x="0" y="22" font-family="'Tajawal', sans-serif" font-size="12" font-weight="700" fill="#475569">
            ${isAr ? "إدارة التوثيق والسجلات" : "Registrar & Records Dept."}
          </text>
          <text x="0" y="40" font-family="'Courier New', monospace" font-size="10" font-weight="700" fill="#64748B">
            ID: ${doc.id.toUpperCase()} • YEAR: ${doc.year}
          </text>
        </g>

        <!-- Security Bottom Band -->
        <rect x="36" y="654" width="928" height="10" fill="${accent}" opacity="0.85"/>
      </svg>
    `;
  }

  return {
    init,
    openDoc,
    closeModal,
    setLanguage,
    generateCertificateSVG,
    zoomBy,
    rotateBy,
    resetTransform,
    showNext,
    showPrev,
    triggerUpload
  };
})();
