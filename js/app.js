/**
 * Eng. Hafedh Ali Saif Al-Mashwali - Main Application Controller
 * Handles Bilingual switching, Filtering, Search, Counter animation, Toast, and UI interactions.
 */

const App = (() => {
  let currentLanguage = "ar";
  let currentFilter = "all";
  let currentSearchQuery = "";
  let currentViewMode = "grid"; // "grid" or "table"
  let storedScansMap = {};

  const I18N = {
    ar: {
      siteTitle: "المهندس حافظ علي سيف المشولي | المنصة التنفيذية والوثائق المعتمدة",
      navHome: "الرئيسية",
      navAbout: "نبذة مهنية",
      navCompetencies: "مجالات الخبرة",
      navCredentials: "الشهادات المعتمدة",
      navTimeline: "المسار المهني",
      navContact: "تواصل رسمي",
      navPrint: "طباعة السيرة",
      navTitle: "مهندس علوم أغذية • أخصائي جودة وإحصاء وعقود",
      langToggleText: "English",

      // Hero
      heroEyebrow: "الجمهورية اليمنية – سجل الاعتماد والخبرة المهنية والتنفيذية",
      heroOwnerName: "المهندس حافظ علي سيف المشولي",
      heroOwnerNameEn: "Eng. Hafedh Ali Saif Al-Mashwali",
      heroHeadline: "مهندس علوم أغذية | أخصائي إدارة العمليات والجودة (ISO 22000 / HACCP) | محلل بيانات إحصائية (SPSS) وإدارة عقود",
      heroBio: "مهندس واستشاري تنفيذي يتمتع بأكثر من 22 عاماً من الخبرة المتراكمة في مجالات هندسة وتكنولوجيا الأغذية، إدارة أنظمة الجودة العالمية وسلامة الغذاء، التحليل الإحصائي المالي والجمركي المتقدم، وصياغة العقود القانونية والحوكمة المؤسسية.",
      heroBtnBrowse: "تصفح الشهادات المعتمدة",
      heroBtnWhatsApp: "تواصل عبر واتساب",
      heroBtnCopyEmail: "نسخ البريد الإلكتروني",
      heroStatusAvailable: "متاح للاستشارات والتعاقد والمشاريع",
      heroLocation: "صنعاء، الجمهورية اليمنية",

      // Stats
      stat1Number: "22+",
      stat1Title: "عاماً من الخبرة المتراكمة",
      stat1Desc: "منذ التخرج من جامعة حلب عام 2002م ومسيرة حافلة بالإنجازات",
      stat2Number: "10",
      stat2Title: "وثائق ومصدقات رسمية",
      stat2Desc: "مؤهل جامعي وشهادات تدريب تخصصية معتمدة وموثقة",
      stat3Number: "174+",
      stat3Title: "ساعة تدريبية موثقة",
      stat3Desc: "برامج تخصصية مكثفة في أرقى المعاهد والمؤسسات",
      stat4Number: "4",
      stat4Title: "ركائز تخصصية متكاملة",
      stat4Desc: "علوم الأغذية، التحليل الإحصائي، صياغة العقود، وإدارة العمليات",

      // Credentials Section
      credSectionSubtitle: "السجل والاعتمادات الرسمية",
      credSectionTitle: "معرض الشهادات والمصدقات المعتمدة",
      credSectionDesc: "استعراض تفاعلي كامل للمؤهل الجامعي الأساسي وشهادات التدريب التخصصية الصادرة عن أرقى الجامعات والمعاهد الحكومية ومجموعات الأعمال.",
      searchPlaceholder: "ابحث بالاسم، الجهة المصدرة، السنة، أو رقم الاعتماد...",
      tabAll: "الكل (10)",
      tabAcademic: "المؤهل الجامعي",
      tabSpss: "تحليل البيانات SPSS",
      tabQuality: "الجودة والإنتاج الغذائي",
      tabManagement: "الإدارة والقانون والسلامة",
      viewModeGrid: "شبكة",
      viewModeTable: "جدول رسمي",
      viewDocBtn: "عرض الوثيقة والتحكم",
      uploadScanBtn: "إرفاق مسح ضوئي",
      scanSavedBadge: "مسح ضوئي مرفق",
      plaqueBadge: "شهادة رقمية معتمدة",
      hoursLabel: "الساعات:",
      dateLabel: "التاريخ:",
      issuerLabel: "الجهة:",
      codeLabel: "الكود:",
      noResultsTitle: "لم يتم العثور على وثائق مطابقة",
      noResultsDesc: "يرجى تجربة كلمات بحث أخرى أو تغيير تبويب التصفية.",

      // Competencies
      compSectionSubtitle: "الجدارات والركائز التنفيذية",
      compSectionTitle: "أربعة مجالات خبرة قيادية متكاملة",
      compSectionDesc: "تكامل فريد يجمع بين الهندسة العلمية للأغذية، التميز في إدارة الجودة والسلامة، قوة التحليل الإحصائي المالي، والدقة في صياغة العقود القانونية.",

      // Timeline
      timeSectionSubtitle: "المحطات والتطور التاريخي",
      timeSectionTitle: "المسار المهني والأكاديمي (2002 – 2024)",
      timeSectionDesc: "تتبع زمني متسلسل يوثق المحطات التخصصية والشهادات المهنية التي صقلت المسيرة التنفيذية للمهندس حافظ المشولي.",

      // About
      aboutSubtitle: "البروفايل المهني",
      aboutTitle: "المهندس حافظ علي سيف المشولي في سطور",
      aboutP1: "يحمل المهندس حافظ علي سيف المشولي درجة البكالوريوس في الهندسة الزراعية تخصص <strong>علوم الأغذية</strong> من جامعة حلب بالجمهورية العربية السورية (دفعة 2002م بتقدير جيد).",
      aboutP2: "يمتلك مسيرة مهنية امتدت لأكثر من عقدين من الزمن، قاد وأشرف خلالها على العمليات الإنتاجية وإرساء أنظمة الجودة العالمية <strong>(ISO 22000 / HACCP)</strong> وتكنولوجيا منتجات الدقيق والسلامة المهنية بالتعاون مع كبرى الصروح الصناعية كمجموعة هائل سعيد أنعم والشركة اليمنية للصناعة والتجارة (YCIC).",
      aboutP3: "يعتبر من الكفاءات النادرة التي استكملت تميزها الصناعي باحتراف تقني وإداري متقدم، حيث تخصص في <strong>التحليل الإحصائي للبيانات باستخدام برنامج SPSS</strong> (عبر برامج معتمدة من المعهد المالي ومصلحة الجمارك بوزارة المالية)، بالإضافة إلى تخصصه المعتمد في <strong>صياغة وتدقيق العقود القانونية والتجارية</strong> بإشراف وزارة التعليم الفني.",

      // Contact
      contactSubtitle: "قنوات الاتصال المعتمدة",
      contactTitle: "التواصل الرسمي والاستشارات",
      contactDesc: "للتواصل بشأن الاستشارات المتخصصة في نظم الجودة، التحليل الإحصائي، صياغة العقود، أو الفرص والمشاريع التنفيذية.",
      contactEmailCardTitle: "البريد الإلكتروني المباشر",
      contactWhatsappCardTitle: "مراسلة واتساب المعتمدة",
      contactPhoneCardTitle: "الاتصال الهاتفي المباشر",
      contactLocationCardTitle: "المقر والمدينة",
      formName: "الاسم الكامل",
      formEmail: "البريد الإلكتروني",
      formPhone: "رقم الهاتف / الواتساب",
      formSubject: "موضوع الاستشارة أو التعاقد",
      formMessage: "تفاصيل الرسالة أو الاستفسار",
      formSubmit: "إرسال الرسالة عبر واتساب (733825496)",
      formDraftEmail: "فتح مسودة بريد إلكتروني",

      // Footer
      footerHeadline: "المنصة الرسمية للسجل المهني والاعتمادات",
      footerRights: "جميع الحقوق محفوظة للمهندس حافظ علي سيف المشولي © 2026",
      footerVerifiedNote: "جميع الوثائق والشهادات والمصدقات المعروضة مسجلة ومعتمدة لدى الجهات الرسمية والأكاديمية المعنية.",

      // Toasts
      toastCopied: "تم نسخ البريد الإلكتروني بنجاح:",
      toastScanUploaded: "تم رفع وتخزين المسح الضوئي بنجاح!"
    },
    en: {
      siteTitle: "Eng. Hafedh Ali Saif Al-Mashwali | Executive Portfolio & Verified Credentials",
      navHome: "Home",
      navAbout: "Executive Profile",
      navCompetencies: "Expertise",
      navCredentials: "Credentials",
      navTimeline: "Career Timeline",
      navContact: "Contact",
      navPrint: "Print Dossier",
      navTitle: "Food Science Engineer • Quality & Data Specialist",
      langToggleText: "العربية",

      // Hero
      heroEyebrow: "REPUBLIC OF YEMEN – OFFICIAL PROFESSIONAL & EXECUTIVE CREDENTIAL REGISTER",
      heroOwnerName: "Eng. Hafedh Ali Saif Al-Mashwali",
      heroOwnerNameEn: "المهندس حافظ علي سيف المشولي",
      heroHeadline: "Food Science Engineer | Operations & Quality Management Specialist (ISO 22000 / HACCP) | Statistical Data Analyst (SPSS) & Contract Management",
      heroBio: "Executive engineer and consultant with over 22 years of accumulated expertise in food science and technology, international quality & safety management systems (ISO 22000 / HACCP), advanced financial & customs statistical analysis (SPSS), and legal contract drafting & institutional governance.",
      heroBtnBrowse: "Browse Verified Credentials",
      heroBtnWhatsApp: "Direct WhatsApp",
      heroBtnCopyEmail: "Copy Email",
      heroStatusAvailable: "Available for Consultations, Contracts & Strategic Projects",
      heroLocation: "Sana'a, Republic of Yemen",

      // Stats
      stat1Number: "22+",
      stat1Title: "Years of Executive Experience",
      stat1Desc: "Continuous track record since graduating from Aleppo University in 2002",
      stat2Number: "10",
      stat2Title: "Official Degrees & Credentials",
      stat2Desc: "B.Sc. engineering degree and certified specialized executive diplomas",
      stat3Number: "174+",
      stat3Title: "Documented Training Hours",
      stat3Desc: "Accredited programs completed at premier institutes and authorities",
      stat4Number: "4",
      stat4Title: "Integrated Core Pillars",
      stat4Desc: "Food Science, SPSS Analytics, Legal Contracts & Industrial Operations",

      // Credentials Section
      credSectionSubtitle: "VERIFIED REGISTRY & ACCREDITATIONS",
      credSectionTitle: "Official Credentials & Document Archive",
      credSectionDesc: "Interactive showcase of primary university degree and specialized professional certifications issued by renowned universities, government institutes, and corporate conglomerates.",
      searchPlaceholder: "Search by title, issuer, year, or reference code...",
      tabAll: "All (10)",
      tabAcademic: "Academic Degree",
      tabSpss: "SPSS Data Analysis",
      tabQuality: "Food & Quality",
      tabManagement: "Management, Law & HSE",
      viewModeGrid: "Grid",
      viewModeTable: "Official Register",
      viewDocBtn: "Inspect Document & Controls",
      uploadScanBtn: "Attach Scan",
      scanSavedBadge: "Scan Attached",
      plaqueBadge: "Official Digital Plaque",
      hoursLabel: "Hours:",
      dateLabel: "Date:",
      issuerLabel: "Issuer:",
      codeLabel: "Ref:",
      noResultsTitle: "No Matching Documents Found",
      noResultsDesc: "Please adjust your search terms or select another filter tab.",

      // Competencies
      compSectionSubtitle: "EXECUTIVE PILLARS & VALUE DRIVERS",
      compSectionTitle: "Four Integrated Domains of High-Impact Expertise",
      compSectionDesc: "A rare synergy linking scientific food engineering, international quality standards, rigorous statistical econometric analytics, and airtight legal contracting.",

      // Timeline
      timeSectionSubtitle: "CHRONOLOGICAL PROGRESSION",
      timeSectionTitle: "Career & Qualifications Journey (2002 – 2024)",
      timeSectionDesc: "Milestone timeline documenting the continuous development and accredited qualifications shaping Eng. Hafedh's executive profile.",

      // About
      aboutSubtitle: "EXECUTIVE BIOGRAPHY",
      aboutTitle: "Eng. Hafedh Ali Saif Al-Mashwali Profile",
      aboutP1: "Eng. Hafedh Ali Saif Al-Mashwali holds a Bachelor of Science (B.Sc.) in Agricultural Engineering with specialization in <strong>Food Science</strong> from the University of Aleppo, Syrian Arab Republic (Class of 2002 with 'Good' standing).",
      aboutP2: "Over a career spanning more than two decades, he has directed plant operations, instituted international safety and quality standards <strong>(ISO 22000 / HACCP)</strong>, and supervised flour processing technology and HSE systems within industrial titans including Hayel Saeed Anam Group and YCIC.",
      aboutP3: "He uniquely synergizes industrial manufacturing with advanced computational and legal competencies, excelling in <strong>Statistical Data Analysis (SPSS)</strong> certified by the Financial Institute and Yemen Customs Authority, and <strong>Legal & Commercial Contract Drafting</strong> certified under MoTEVT supervision.",

      // Contact
      contactSubtitle: "OFFICIAL CHANNELS",
      contactTitle: "Official Contact & Inquiries",
      contactDesc: "Direct channels for consultations regarding food quality systems, statistical analysis, contract drafting, or senior engineering engagements.",
      contactEmailCardTitle: "Official Email Address",
      contactWhatsappCardTitle: "Official WhatsApp Channel",
      contactPhoneCardTitle: "Direct Phone Call",
      contactLocationCardTitle: "Headquarters & Residence",
      formName: "Full Name",
      formEmail: "Email Address",
      formPhone: "Phone / WhatsApp",
      formSubject: "Subject / Nature of Inquiry",
      formMessage: "Message Details / Specifications",
      formSubmit: "Send Directly via WhatsApp (733825496)",
      formDraftEmail: "Draft Email Message",

      // Footer
      footerHeadline: "Official Executive & Academic Registry",
      footerRights: "All Rights Reserved for Eng. Hafedh Ali Saif Al-Mashwali © 2026",
      footerVerifiedNote: "All credentials, certificates, and scans are officially registered and authenticated with designated state and educational bodies.",

      // Toasts
      toastCopied: "Email address copied successfully:",
      toastScanUploaded: "Document scan uploaded and saved permanently!"
    }
  };

  async function init() {
    // Load stored scans from IndexedDB
    storedScansMap = await CredentialsStorage.getAllScans();

    // Init DocumentViewer modal module
    DocumentViewer.init();

    // Setup navigation and smooth scrolling
    setupNavigation();

    // Render interactive components
    renderCredentials();
    renderTimeline();
    renderCompetencies();
    setupFiltersAndSearch();
    setupCountersObserver();
    setupContactActions();

    // Listen for scan updates
    window.addEventListener("scan:updated", (e) => {
      storedScansMap[e.detail.id] = e.detail.record;
      renderCredentials();
    });

    window.addEventListener("scan:removed", (e) => {
      delete storedScansMap[e.detail.id];
      renderCredentials();
    });

    // Check language preference
    const savedLang = localStorage.getItem("hafedh_portfolio_lang");
    if (savedLang === "en") {
      setLanguage("en");
    } else {
      setLanguage("ar");
    }
  }

  function setLanguage(lang) {
    currentLanguage = lang;
    localStorage.setItem("hafedh_portfolio_lang", lang);

    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";

    const t = I18N[lang];

    // Update document title
    document.title = t.siteTitle;

    // Update all i18n text bindings
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (t[key]) {
        el.textContent = t[key];
      }
    });

    document.querySelectorAll("[data-i18n-html]").forEach(el => {
      const key = el.getAttribute("data-i18n-html");
      if (t[key]) {
        el.innerHTML = t[key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (t[key]) {
        el.placeholder = t[key];
      }
    });

    // Update language toggle button label
    const langBtn = document.getElementById("lang-toggle-btn");
    if (langBtn) {
      langBtn.innerHTML = `<i class="fa-solid fa-globe"></i> <span>${t.langToggleText}</span>`;
    }

    // Notify DocumentViewer
    DocumentViewer.setLanguage(lang);

    // Re-render language-dependent components
    renderCredentials();
    renderTimeline();
    renderCompetencies();
  }

  function toggleLanguage() {
    setLanguage(currentLanguage === "ar" ? "en" : "ar");
  }

  function setupNavigation() {
    const langBtn = document.getElementById("lang-toggle-btn");
    langBtn?.addEventListener("click", toggleLanguage);

    const mobileToggle = document.getElementById("mobile-menu-toggle");
    const navMenu = document.getElementById("nav-menu");
    const navOverlay = document.getElementById("nav-overlay");

    mobileToggle?.addEventListener("click", () => {
      navMenu?.classList.toggle("open");
      navOverlay?.classList.toggle("open");
      mobileToggle.classList.toggle("active");
    });

    navOverlay?.addEventListener("click", () => {
      navMenu?.classList.remove("open");
      navOverlay?.classList.remove("open");
      mobileToggle?.classList.remove("active");
    });

    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        navMenu?.classList.remove("open");
        navOverlay?.classList.remove("open");
        mobileToggle?.classList.remove("active");
      });
    });

    // Header scroll background effect
    window.addEventListener("scroll", () => {
      const navbar = document.querySelector(".navbar");
      if (navbar) {
        if (window.scrollY > 40) {
          navbar.classList.add("scrolled");
        } else {
          navbar.classList.remove("scrolled");
        }
      }
    });

    // Print button in header
    document.getElementById("btn-print-dossier")?.addEventListener("click", () => {
      window.print();
    });
  }

  function setupFiltersAndSearch() {
    // Tabs
    document.querySelectorAll(".filter-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".filter-tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.getAttribute("data-filter") || "all";
        renderCredentials();
      });
    });

    // Search input
    const searchInput = document.getElementById("credentials-search-input");
    const clearSearchBtn = document.getElementById("btn-clear-search");

    searchInput?.addEventListener("input", (e) => {
      currentSearchQuery = e.target.value.trim().toLowerCase();
      if (clearSearchBtn) {
        clearSearchBtn.style.display = currentSearchQuery.length > 0 ? "block" : "none";
      }
      renderCredentials();
    });

    clearSearchBtn?.addEventListener("click", () => {
      if (searchInput) searchInput.value = "";
      currentSearchQuery = "";
      clearSearchBtn.style.display = "none";
      renderCredentials();
    });

    // View mode switchers (Grid vs Table)
    document.getElementById("view-mode-grid")?.addEventListener("click", () => {
      currentViewMode = "grid";
      document.getElementById("view-mode-grid")?.classList.add("active");
      document.getElementById("view-mode-table")?.classList.remove("active");
      renderCredentials();
    });

    document.getElementById("view-mode-table")?.addEventListener("click", () => {
      currentViewMode = "table";
      document.getElementById("view-mode-table")?.classList.add("active");
      document.getElementById("view-mode-grid")?.classList.remove("active");
      renderCredentials();
    });
  }

  function getFilteredCredentials() {
    return CREDENTIALS_DATA.filter(doc => {
      // Category filter
      if (currentFilter !== "all" && doc.category !== currentFilter) {
        return false;
      }

      // Search query filter
      if (currentSearchQuery) {
        const titleAr = doc.title.ar.toLowerCase();
        const titleEn = doc.title.en.toLowerCase();
        const issuerAr = doc.issuer.ar.toLowerCase();
        const issuerEn = doc.issuer.en.toLowerCase();
        const refAr = doc.reference.ar.toLowerCase();
        const refEn = doc.reference.en.toLowerCase();
        const year = doc.year.toLowerCase();
        const id = doc.id.toLowerCase();

        return (
          titleAr.includes(currentSearchQuery) ||
          titleEn.includes(currentSearchQuery) ||
          issuerAr.includes(currentSearchQuery) ||
          issuerEn.includes(currentSearchQuery) ||
          refAr.includes(currentSearchQuery) ||
          refEn.includes(currentSearchQuery) ||
          year.includes(currentSearchQuery) ||
          id.includes(currentSearchQuery)
        );
      }

      return true;
    });
  }

  function renderCredentials() {
    const container = document.getElementById("credentials-container");
    if (!container) return;

    const filtered = getFilteredCredentials();
    const t = I18N[currentLanguage];
    const isAr = currentLanguage === "ar";

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="no-results-card">
          <div class="no-results-icon"><i class="fa-solid fa-file-circle-question"></i></div>
          <h3 class="no-results-title">${t.noResultsTitle}</h3>
          <p class="no-results-desc">${t.noResultsDesc}</p>
        </div>
      `;
      return;
    }

    if (currentViewMode === "grid") {
      container.className = "credentials-grid-view";
      container.innerHTML = filtered.map(doc => renderCardHTML(doc, t, isAr)).join("");
    } else {
      container.className = "credentials-table-view";
      container.innerHTML = renderTableHTML(filtered, t, isAr);
    }

    // Attach event listeners to newly generated buttons
    container.querySelectorAll(".btn-inspect-doc").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-doc-id");
        DocumentViewer.openDoc(id, filtered);
      });
    });

    container.querySelectorAll(".btn-card-upload").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-doc-id");
        // Open doc viewer and prompt file upload
        DocumentViewer.openDoc(id, filtered);
        setTimeout(() => {
          DocumentViewer.triggerUpload();
        }, 150);
      });
    });
  }

  function renderCardHTML(doc, t, isAr) {
    const hasScan = storedScansMap[doc.id] && storedScansMap[doc.id].dataUrl;
    const title = doc.title[currentLanguage];
    const issuer = doc.issuerShort[currentLanguage];
    const date = doc.date[currentLanguage];
    const duration = doc.duration[currentLanguage];
    const ref = doc.reference[currentLanguage];
    const badge = doc.badge[currentLanguage];

    const previewContent = hasScan
      ? `<img src="${storedScansMap[doc.id].dataUrl}" alt="${title}" class="card-scan-thumbnail">`
      : `<div class="card-plaque-mini">${DocumentViewer.generateCertificateSVG(doc, currentLanguage)}</div>`;

    return `
      <article class="credential-card" data-category="${doc.category}">
        <div class="card-preview-wrapper" onclick="App.openDocumentModal('${doc.id}')">
          ${previewContent}
          <div class="card-preview-overlay">
            <span class="preview-zoom-pill"><i class="fa-solid fa-magnifying-glass-plus"></i> ${isAr ? "معاينة وتكبير" : "Inspect & Zoom"}</span>
          </div>
          <div class="card-corner-badge">
            <span class="badge-cat-pill">${badge}</span>
          </div>
        </div>

        <div class="card-body">
          <div class="card-header-row">
            <span class="card-doc-code">${doc.id.toUpperCase()}</span>
            <span class="card-year-pill"><i class="fa-regular fa-calendar"></i> ${doc.year}</span>
          </div>

          <h3 class="card-title" title="${title}" onclick="App.openDocumentModal('${doc.id}')">${title}</h3>

          <div class="card-meta-list">
            <div class="card-meta-row">
              <span class="meta-icon"><i class="fa-solid fa-building-columns"></i></span>
              <span class="meta-text font-medium">${issuer}</span>
            </div>
            <div class="card-meta-row">
              <span class="meta-icon"><i class="fa-solid fa-clock"></i></span>
              <span class="meta-text">${duration}</span>
            </div>
            <div class="card-meta-row">
              <span class="meta-icon"><i class="fa-solid fa-barcode"></i></span>
              <span class="meta-text code-subtle">${ref}</span>
            </div>
          </div>

          <div class="card-scan-status-strip">
            ${hasScan 
              ? `<span class="status-indicator-uploaded"><i class="fa-solid fa-circle-check"></i> ${t.scanSavedBadge}</span>`
              : `<span class="status-indicator-plaque"><i class="fa-solid fa-award"></i> ${t.plaqueBadge}</span>`
            }
          </div>

          <div class="card-action-bar">
            <button class="btn btn-card-primary btn-inspect-doc" data-doc-id="${doc.id}">
              <i class="fa-solid fa-expand"></i>
              <span>${t.viewDocBtn}</span>
            </button>
            <button class="btn btn-card-secondary btn-card-upload" data-doc-id="${doc.id}" title="${t.uploadScanBtn}">
              <i class="fa-solid fa-arrow-up-from-bracket"></i>
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function renderTableHTML(docs, t, isAr) {
    return `
      <div class="table-responsive">
        <table class="official-credentials-table">
          <thead>
            <tr>
              <th>#</th>
              <th>${isAr ? "كود الوثيقة" : "Doc ID"}</th>
              <th>${isAr ? "عنوان الشهادة / المؤهل" : "Certificate / Degree Title"}</th>
              <th>${isAr ? "الجهة المصدرة" : "Issuing Authority"}</th>
              <th>${isAr ? "التاريخ" : "Date"}</th>
              <th>${isAr ? "المدة / الساعات" : "Duration"}</th>
              <th>${isAr ? "حالة المسح" : "Scan Status"}</th>
              <th>${isAr ? "الإجراءات" : "Actions"}</th>
            </tr>
          </thead>
          <tbody>
            ${docs.map((doc, idx) => {
              const hasScan = storedScansMap[doc.id] && storedScansMap[doc.id].dataUrl;
              return `
                <tr>
                  <td class="text-center font-bold text-slate">${idx + 1}</td>
                  <td><span class="table-doc-tag">${doc.id.toUpperCase()}</span></td>
                  <td>
                    <div class="table-title-cell">
                      <strong>${doc.title[currentLanguage]}</strong>
                      <span class="table-sub-ref">${doc.reference[currentLanguage]}</span>
                    </div>
                  </td>
                  <td>${doc.issuerShort[currentLanguage]}</td>
                  <td><span class="table-date-badge">${doc.year}</span></td>
                  <td>${doc.duration[currentLanguage]}</td>
                  <td>
                    ${hasScan 
                      ? `<span class="badge-status-uploaded small"><i class="fa-solid fa-circle-check"></i> ${isAr ? "مرفق" : "Attached"}</span>`
                      : `<span class="badge-status-plaque small"><i class="fa-solid fa-award"></i> ${isAr ? "رقمي" : "Digital"}</span>`
                    }
                  </td>
                  <td>
                    <div class="table-actions">
                      <button class="table-btn-inspect btn-inspect-doc" data-doc-id="${doc.id}" title="${t.viewDocBtn}">
                        <i class="fa-solid fa-eye"></i>
                      </button>
                      <button class="table-btn-upload btn-card-upload" data-doc-id="${doc.id}" title="${t.uploadScanBtn}">
                        <i class="fa-solid fa-arrow-up-from-bracket"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  function renderTimeline() {
    const container = document.getElementById("timeline-container");
    if (!container) return;

    const isAr = currentLanguage === "ar";

    container.innerHTML = TIMELINE_DATA.map((item, index) => {
      const title = item.title[currentLanguage];
      const institution = item.institution[currentLanguage];
      const desc = item.desc[currentLanguage];
      const date = item.date[currentLanguage];

      return `
        <div class="timeline-milestone" data-category="${item.category}">
          <div class="timeline-dot">
            <i class="fa-solid ${item.icon}"></i>
          </div>
          <div class="timeline-content-card">
            <div class="timeline-card-header">
              <span class="timeline-year-tag">${item.year}</span>
              <span class="timeline-date-tag">${date}</span>
            </div>
            <h3 class="timeline-title">${title}</h3>
            <h4 class="timeline-institution"><i class="fa-solid fa-building"></i> ${institution}</h4>
            <p class="timeline-desc">${desc}</p>
            ${item.docId ? `
            <div class="timeline-card-footer">
              <button class="timeline-view-doc-btn" onclick="App.openDocumentModal('${item.docId}')">
                <i class="fa-solid fa-file-shield"></i>
                <span>${isAr ? "عرض وثيقة الاعتماد الرسمية" : "Inspect Official Credential Document"} (${item.docId.toUpperCase()})</span>
              </button>
            </div>
            ` : ""}
          </div>
        </div>
      `;
    }).join("");
  }

  function renderCompetencies() {
    const container = document.getElementById("competencies-container");
    if (!container) return;

    container.innerHTML = COMPETENCIES_DATA.map(comp => {
      const badge = comp.badge[currentLanguage];
      const title = comp.title[currentLanguage];
      const desc = comp.desc[currentLanguage];
      const skills = comp.skills[currentLanguage] || [];

      return `
        <div class="competency-card">
          <div class="competency-header">
            <div class="competency-icon-box">
              <i class="fa-solid ${comp.icon}"></i>
            </div>
            <span class="competency-badge">${badge}</span>
          </div>
          <h3 class="competency-title">${title}</h3>
          <p class="competency-desc">${desc}</p>
          <div class="competency-divider"></div>
          <ul class="competency-skill-list">
            ${skills.map(s => `<li><i class="fa-solid fa-check text-emerald"></i> <span>${s}</span></li>`).join("")}
          </ul>
        </div>
      `;
    }).join("");
  }

  function setupCountersObserver() {
    const counters = document.querySelectorAll(".counter-val");
    if (!counters.length) return;

    let hasRun = false;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasRun) {
          hasRun = true;
          counters.forEach(counter => {
            const target = parseInt(counter.getAttribute("data-target") || "0", 10);
            animateCounter(counter, target);
          });
        }
      });
    }, { threshold: 0.3 });

    const statsSection = document.getElementById("executive-highlights");
    if (statsSection) {
      observer.observe(statsSection);
    }
  }

  function animateCounter(el, target) {
    let current = 0;
    const duration = 1600;
    const stepTime = 25;
    const totalSteps = duration / stepTime;
    const increment = target / totalSteps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      el.textContent = Math.floor(current);
    }, stepTime);
  }

  function setupContactActions() {
    // Copy email button
    const copyBtns = document.querySelectorAll(".btn-copy-email");
    copyBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        navigator.clipboard.writeText(OWNER_INFO.email).then(() => {
          const t = I18N[currentLanguage];
          showToast(`${t.toastCopied} ${OWNER_INFO.email}`, "success");
        }).catch(() => {
          // fallback
          prompt("Copy email address:", OWNER_INFO.email);
        });
      });
    });

    // Contact form WhatsApp forwarding
    const form = document.getElementById("executive-contact-form");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("form-name")?.value || "";
      const email = document.getElementById("form-email")?.value || "";
      const subject = document.getElementById("form-subject")?.value || "";
      const message = document.getElementById("form-message")?.value || "";

      const text = `السلام عليكم ورحمة الله وبركاته،\nالأخ المهندس حافظ علي سيف المشولي،\n\nأنا: ${name}\nالبريد: ${email}\nالموضوع: ${subject}\n\nالتفاصيل:\n${message}`;
      const url = `https://wa.me/967733825496?text=${encodeURIComponent(text)}`;
      window.open(url, "_blank");
    });

    // Draft email button
    document.getElementById("btn-draft-email")?.addEventListener("click", () => {
      const subject = document.getElementById("form-subject")?.value || "استفسار رسمي / استشارة مهنية";
      const body = document.getElementById("form-message")?.value || "";
      window.location.href = `mailto:${OWNER_INFO.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });
  }

  function openDocumentModal(docId) {
    DocumentViewer.openDoc(docId, CREDENTIALS_DATA);
  }

  return {
    init,
    toggleLanguage,
    setLanguage,
    openDocumentModal
  };
})();

// Helper function: Toast Notification
function showToast(message, type = "info") {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `toast-item toast-${type}`;
  const icon = type === "success" 
    ? '<i class="fa-solid fa-circle-check"></i>' 
    : type === "error" 
      ? '<i class="fa-solid fa-triangle-exclamation"></i>' 
      : '<i class="fa-solid fa-circle-info"></i>';

  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-msg">${message}</div>
    <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// Initialize on DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});
