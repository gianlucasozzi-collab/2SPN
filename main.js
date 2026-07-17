// js/main.js
(() => {
  "use strict";

  const CFG = window.SPN_CONFIG || {};

  // --- DATI CORSI (come i tuoi) ---
  const courseData = [
    {
      id: "full-course",
      title: "Scuola Pratica di Nutrizione (Percorso Completo)",
      dates: "Dal 23 Ottobre 2026",
      price: 1580,
      deposit: 618,
    },
    {
      id: "isak-1",
      title: "Certificazione ISAK Livello 1",
      description: "Antropometria applicata. Applicazione metodi standardizzati.",
      dates: "23-24-25 Ottobre 2026",
      price: 400,
      deposit: 178,
    },
    {
      id: "comunicazione",
      title: "Comunicazione e Cambiamento Comportamentale",
      description: "Ascolto attivo, alleanza terapeutica e modelli di cambiamento.",
      dates: "07 Novembre 2026",
      price: 400,
      deposit: 200,
    },
    {
      id: "clinica",
      title: "Competenze Cliniche e Metodologia Operativa",
      description: "Mystery Case Method, anamnesi, piani evidence-based.",
      dates: "14-15 Novembre 2026",
      price: 400,
      deposit: 200,
    },
    {
      id: "marketing",
      title: "Personal Branding e Marketing Sanitario",
      description: "Comunicazione etica sui social, personal brand.",
      dates: "Fruibile online dal momento dell'acquisto",
      price: 380,
      deposit: 40,
    },
  ];

  // --- STATO ---
  let currentMode = "full"; // 'full' | 'custom'
  const selectedCustomModules = new Set();

  // --- HELPERS ---
  const $ = (id) => document.getElementById(id);

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }

  function euro(n) {
    // arrotonda "bella" per UI
    const v = Number.isFinite(n) ? n : 0;
    return `€${Math.round(v)}`;
  }

  // --- EARLY BIRD ---
  function isEarlyBird() {
    if (window.SPN_EB_ENABLED === false) return false; // versione 0109index: prezzo pieno
    if (!CFG.EARLY_BIRD_DEADLINE) return false;
    const d = new Date(CFG.EARLY_BIRD_DEADLINE);
    return Number.isFinite(d.getTime()) && new Date() <= d;
  }

  // --- MENU MOBILE ---
  function setupMobileMenu() {
    const toggleBtn = $("mobile-menu-toggle");
    const menu = $("mobile-menu");
    const icon = $("menu-icon");
    if (!toggleBtn || !menu || !icon) return;

    toggleBtn.addEventListener("click", () => {
      const isHidden = menu.classList.contains("hidden");
      menu.classList.toggle("hidden", !isHidden);

      icon.setAttribute("data-lucide", isHidden ? "x" : "menu");
      refreshIcons();
    });

    document.querySelectorAll(".mobile-link").forEach((a) => {
      a.addEventListener("click", () => {
        menu.classList.add("hidden");
        icon.setAttribute("data-lucide", "menu");
        refreshIcons();
      });
    });

    const scrollTopEl = document.querySelector("[data-scroll-top]");
    if (scrollTopEl) {
      scrollTopEl.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    }
  }

  // --- TAB MODE ---
  function setMode(mode) {
    currentMode = mode;

    const btnFull = $("btn-tab-full");
    const btnCustom = $("btn-tab-custom");
    const panelFull = $("panel-full");
    const panelCustom = $("panel-custom");

    if (!btnFull || !btnCustom || !panelFull || !panelCustom) return;

    if (mode === "full") {
      btnFull.className = "flex-1 py-3 font-bold rounded-lg bg-white shadow text-emerald-700 transition-all";
      btnCustom.className = "flex-1 py-3 font-bold rounded-lg text-slate-500 hover:text-slate-700 transition-all";
      panelFull.classList.remove("hidden");
      panelCustom.classList.add("hidden");
    } else {
      btnFull.className = "flex-1 py-3 font-bold rounded-lg text-slate-500 hover:text-slate-700 transition-all";
      btnCustom.className = "flex-1 py-3 font-bold rounded-lg bg-white shadow text-emerald-700 transition-all";
      panelFull.classList.add("hidden");
      panelCustom.classList.remove("hidden");
    }

    updateCalculations();
  }

  // --- RENDER MODULI SINGOLI ---
  function renderCustomModules() {
    const container = $("custom-modules-container");
    if (!container) return;

    const singles = courseData.slice(1);
    container.innerHTML = singles
      .map((m) => {
        return `
          <label class="block cursor-pointer group">
            <div class="bg-white border-2 border-slate-200 rounded-xl p-5 hover:border-emerald-400 transition-all flex items-start gap-4">
              <div class="mt-1">
                <input type="checkbox" data-module-id="${m.id}"
                  class="w-5 h-5 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500">
              </div>
              <div class="flex-grow">
                <div class="flex justify-between items-start mb-1 gap-4">
                  <h5 class="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">${m.title}</h5>
                  <span class="font-bold text-slate-900 whitespace-nowrap">${
                    isEarlyBird()
                      ? `<span class="line-through text-slate-400 font-semibold mr-1">€${m.price}</span><span class="text-emerald-700">€${Math.round(m.price * 0.9)}</span>`
                      : `€${m.price}`
                  }</span>
                </div>
                <p class="text-sm text-slate-500 mb-2">${m.description || ""}</p>
                <div class="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                  <span class="text-xs text-slate-400 flex items-center gap-1">
                    <i data-lucide="calendar" class="w-3 h-3"></i> ${m.dates}
                  </span>
                  <span class="text-sm font-semibold text-emerald-600">Acconto: ${
                    isEarlyBird()
                      ? `<span class="line-through text-slate-400 mr-1">€${m.deposit}</span>€${Math.max(Math.round(m.deposit - m.price * 0.1), 0)}`
                      : `€${m.deposit}`
                  }</span>
                </div>
              </div>
            </div>
          </label>
        `;
      })
      .join("");

    // listeners checkbox
    container.querySelectorAll("input[type='checkbox'][data-module-id]").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        const id = e.target.getAttribute("data-module-id");
        if (!id) return;
        if (e.target.checked) selectedCustomModules.add(id);
        else selectedCustomModules.delete(id);
        updateCalculations();
      });
    });

    refreshIcons();
  }

  // --- ODB checkbox ---
  function setupOdb() {
    const odbCb = $("odb-checkbox");
    const odbWrap = $("odb-input-container");
    const odbNumber = $("odb-number");
    if (!odbCb || !odbWrap || !odbNumber) return;

    const handle = () => {
      const on = odbCb.checked;
      odbWrap.classList.toggle("hidden", !on);
      if (!on) odbNumber.value = "";
      updateCalculations();
    };

    odbCb.addEventListener("change", handle);
    odbNumber.addEventListener("input", updateCalculations);
  }

  // --- T&C + Privacy ---
  function setupTermsPrivacy() {
    const tc = $("tc-checkbox");
    const priv = $("privacy-checkbox");
    if (tc) tc.addEventListener("change", updateCalculations);
    if (priv) priv.addEventListener("change", updateCalculations);
  }

  // --- CALCOLI ---
  function getSelectedItems() {
    if (currentMode === "full") return [courseData[0]];
    const items = [];
    selectedCustomModules.forEach((id) => {
      const m = courseData.find((x) => x.id === id);
      if (m) items.push(m);
    });
    return items;
  }

  function updateCalculations() {
    const selectedItems = getSelectedItems();

    let totalPrice = 0;
    let totalDeposit = 0;

    selectedItems.forEach((i) => {
      totalPrice += i.price;
      totalDeposit += i.deposit;
    });

    // riepilogo lista
    const summaryContainer = $("summary-items");
    if (summaryContainer) {
      if (selectedItems.length === 0) {
        summaryContainer.innerHTML = `<p class="text-slate-400 italic">Nessun modulo selezionato</p>`;
      } else {
        summaryContainer.innerHTML = selectedItems
          .map(
            (item) => `
              <div class="flex justify-between items-start gap-2">
                <span class="flex-1 font-medium text-slate-800 leading-tight">${item.title}</span>
                <span class="text-slate-500 shrink-0">€${item.price}</span>
              </div>
            `
          )
          .join("");
      }
    }

    // sconto ODB
    const odbCb = $("odb-checkbox");
    const odbNumber = $("odb-number");
    const isOdb = !!(odbCb && odbCb.checked);
    const odbOk = !isOdb || (odbNumber && odbNumber.value.trim().length > 0);

    const eb = isEarlyBird();
    const hasDiscount = (isOdb || eb) && totalPrice > 0;

    let discount = 0;
    if (hasDiscount) discount = totalPrice * 0.1; // un solo 10%: EB e OdB NON cumulabili

    const discountRow = $("summary-discount-row");
    const discountVal = $("summary-discount");
    const discountLabel = $("summary-discount-label");
    if (discountRow && discountVal) {
      if (hasDiscount) {
        discountRow.classList.remove("hidden");
        discountVal.textContent = `-€${discount.toFixed(2)}`;
        if (discountLabel) {
          if (isOdb && eb) discountLabel.textContent = "Sconto 10% (EB/OdB non cumulabili)";
          else if (eb) discountLabel.textContent = "Sconto Early Bird (-10%)";
          else discountLabel.textContent = "Sconto OdB (-10%)";
        }
      } else {
        discountRow.classList.add("hidden");
      }
    }

    // logica acconto/saldo (sconto solo su acconto)
    const originalBalance = totalPrice - totalDeposit;
    let finalDeposit = totalDeposit - discount;
    if (finalDeposit < 0) finalDeposit = 0;
    const finalBalance = originalBalance;

    const totalEl = $("summary-total");
    const depositEl = $("summary-deposit");
    const balanceEl = $("summary-balance-text");
    if (totalEl) totalEl.textContent = `€${Math.round(totalPrice)}`;
    if (depositEl) depositEl.textContent = euro(finalDeposit);
    if (balanceEl) balanceEl.innerHTML = `Saldo di <strong>€${Math.round(finalBalance)}</strong> ai docenti, entro una settimana prima di ciascun modulo`;

    // abilita checkout
    const tc = $("tc-checkbox");
    const priv = $("privacy-checkbox");
    const tcOk = !!(tc && tc.checked);
    const privOk = !!(priv && priv.checked);
    const hasItems = selectedItems.length > 0;

    const btn = $("btn-checkout");
    if (!btn) return;

    const canCheckout = hasItems && tcOk && privOk && odbOk;

    btn.disabled = !canCheckout;

    if (!canCheckout) {
      btn.className =
        "w-full py-4 bg-slate-200 text-slate-400 font-bold text-lg rounded-xl cursor-not-allowed flex justify-center items-center gap-2 transition-all";
    } else {
      btn.className =
        "w-full py-4 bg-emerald-600 text-white font-bold text-lg rounded-xl shadow-md hover:bg-emerald-700 hover:-translate-y-0.5 transition-all flex justify-center items-center gap-2";
    }
  }

  // --- STRIPE LINK CHOICE ---
  function getStripeLink() {
    const odbCb = $("odb-checkbox");
    const odbNumber = $("odb-number");
    const isOdb = !!(odbCb && odbCb.checked);
    const hasNumber = !!(odbNumber && odbNumber.value.trim().length > 0);

    if (isOdb && hasNumber) return CFG.STRIPE_PAYMENT_LINK_OBPLV || "";
    if (isEarlyBird()) return CFG.STRIPE_PAYMENT_LINK_OBPLV || ""; // stesso importo scontato del -10%
    return CFG.STRIPE_PAYMENT_LINK_STANDARD || "";
  }

  // --- VIDEO MODAL + CHECKOUT ---
  function setupCheckoutFlow() {
    const btn = $("btn-checkout");
    const modal = $("video-modal");
    const yt = $("yt-iframe");
    const continueBtn = $("video-continue");
    const dontShow = $("dont-show-video");

    if (!btn) return;

    const openModal = () => {
      if (!modal) return;
      modal.classList.remove("hidden");

      // autoplay: ricarico iframe con autoplay=1
      if (yt && CFG.YT_VIDEO_ID) {
        yt.src = `https://www.youtube-nocookie.com/embed/${CFG.YT_VIDEO_ID}?rel=0&modestbranding=1&autoplay=1`;
      }
      refreshIcons();
    };

    const closeModal = () => {
      if (!modal) return;
      modal.classList.add("hidden");

      // stop video: svuoto src
      if (yt) {
        yt.src = `https://www.youtube-nocookie.com/embed/${CFG.YT_VIDEO_ID}?rel=0&modestbranding=1`;
      }
    };

    const goStripe = () => {
      const url = getStripeLink();
      if (!url) return;
      window.location.href = url;
    };

    // click checkout
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      const url = getStripeLink();
      if (!url) return;

      // se video disattivo o skip settato -> vai diretto
      const skip = localStorage.getItem(CFG.VIDEO_SKIP_KEY) === "1";
      if (!CFG.VIDEO_ENABLED || skip) {
        goStripe();
        return;
      }

      openModal();
    });

    // close handlers
    document.querySelectorAll("[data-video-close]").forEach((el) => {
      el.addEventListener("click", () => {
        closeModal();
      });
    });

    // continue
    if (continueBtn) {
      continueBtn.addEventListener("click", () => {
        if (dontShow && dontShow.checked) {
          localStorage.setItem(CFG.VIDEO_SKIP_KEY, "1");
        }
        goStripe();
      });
    }

    // ESC close
    document.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape" && modal && !modal.classList.contains("hidden")) closeModal();
    });
  }

  // --- COOKIE BANNER ---
  function setupCookieBanner() {
    const bannerEl = $("cookie-banner");
    const accept = $("cookie-accept");
    const reject = $("cookie-reject");
    if (!bannerEl || !accept || !reject) return;

    const key = CFG.COOKIE_KEY || "cookieConsent";
    if (!localStorage.getItem(key)) {
      bannerEl.classList.remove("hidden");
    }

    accept.addEventListener("click", () => {
      localStorage.setItem(key, "accepted");
      bannerEl.classList.add("hidden");
    });

    reject.addEventListener("click", () => {
      localStorage.setItem(key, "rejected");
      bannerEl.classList.add("hidden");
    });
  }

  // --- INIT ---
  document.addEventListener("DOMContentLoaded", () => {
    setupMobileMenu();

    // tab events
    const btnFull = $("btn-tab-full");
    const btnCustom = $("btn-tab-custom");
    const panelFull = $("panel-full");

    if (btnFull) btnFull.addEventListener("click", () => setMode("full"));
    if (btnCustom) btnCustom.addEventListener("click", () => setMode("custom"));
    if (panelFull) panelFull.addEventListener("click", () => setMode("full"));

    renderCustomModules();
    setupOdb();
    setupTermsPrivacy();
    setupCheckoutFlow();
    setupCookieBanner();

    // Early Bird: se la finestra è chiusa, nasconde tutte le note EB nel DOM
    if (!isEarlyBird()) {
      document.querySelectorAll("[data-eb-note]").forEach((el) => el.classList.add("hidden"));
    } else {
      // EB attivo: la card del percorso mostra il prezzo scontato, pieno barrato
      const fp = $("full-price-display");
      const fc = $("full-price-caption");
      if (fp) {
        const full = courseData[0].price;
        const ebPrice = Math.round(full * 0.9);
        fp.innerHTML = `<span class="line-through text-slate-400 text-lg font-bold mr-2">€${full}</span>€${ebPrice}`;
      }
      if (fc) fc.textContent = "Early Bird fino all'1 settembre";
    }

    updateCalculations();
    refreshIcons();
  });
})();
