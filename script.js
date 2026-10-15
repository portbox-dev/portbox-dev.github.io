/* =====================================================
   PORTBOX PORTFOLIO - script.js
   ===================================================== */
const CONFIG = {
  name: "Neil Singh",
  email: "portbox36@gmail.com",
  github: "https://github.com/portbox-dev",
  youtube: "https://youtube.com/@portbox36?si=jXKtExa0QcypoaXt",
  instagram: "https://www.instagram.com/portbox36?vrfl=aXh6NXRnNzdubHZ6",
  telegram: "https://t.me/portbox36"
};

(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Fill in name ---------- */
  $$("[data-config='name']").forEach(el => { el.textContent = CONFIG.name; });
  if (CONFIG.name && CONFIG.name !== "Your Name") {
    document.title = CONFIG.name + " | Portbox - BCA Student, Developer & Video Editor";
  }

  /* ---------- 2. Turn a link element on or off ---------- */
  function setLink(el, url) {
    if (url) {
      el.setAttribute("href", url);
      el.classList.remove("is-placeholder");
      el.removeAttribute("aria-disabled");
      el.removeAttribute("tabindex");
      el.removeAttribute("title");
    } else {
      el.removeAttribute("href");
      el.classList.add("is-placeholder");
      el.setAttribute("aria-disabled", "true");
      el.setAttribute("tabindex", "-1");
      el.setAttribute("title", "Link not added yet");
    }
  }

  /* Social + email links */
  $$("[data-social]").forEach(el => {
    const key = el.getAttribute("data-social");
    let url = CONFIG[key] || "";
    if (key === "email" && url) url = "mailto:" + url;
    setLink(el, url);
  });
  $$("[data-contact-text]").forEach(el => {
    const key = el.getAttribute("data-contact-text");
    const val = CONFIG[key];
    if (val) el.textContent = val.replace(/^https?:\/\/(www\.)?/, "").split("?")[0];
  });

  /* Project buttons */
  $$("a[data-link]").forEach(el => setLink(el, el.getAttribute("data-link")));

  /* ---------- 3. Optional images (no broken-image icons) ---------- */
  $$(".smart-media").forEach(box => {
    const src = box.getAttribute("data-src");
    const img = $("img", box);
    if (!src || !img) return;
    const test = new Image();
    test.onload = function () {
      img.src = src;
      img.hidden = false;
      box.classList.add("loaded");
    };
    test.src = src; 
  });

  /* ---------- 4. Resume ---------- */
  const resumeLinks = $$("[data-resume-link]");
  const resumeNote = $("[data-resume-note]");
  function resumeUnavailable() {
    resumeLinks.forEach(a => {
      a.removeAttribute("href");
      a.removeAttribute("download");
      a.classList.add("is-placeholder");
      a.setAttribute("aria-disabled", "true");
      a.setAttribute("tabindex", "-1");
    });
    $$("[data-resume-label]").forEach(l => { l.textContent = "Resume coming soon"; });
  }
  function resumeAvailable() {
    $$("[data-resume-label]").forEach(l => { l.textContent = "Download Resume"; });
    if (resumeNote) resumeNote.textContent = "Download my resume as a PDF for a quick overview of my education, skills, and projects.";
  }
  resumeUnavailable(); 
  if (window.location.protocol === "file:") {
    
  } else {
    fetch("assets/resume.pdf", { method: "HEAD" })
      .then(r => {
        if (r.ok) {
          resumeLinks.forEach(a => {
            a.setAttribute("href", "assets/resume.pdf");
            a.setAttribute("download", "");
            a.classList.remove("is-placeholder");
            a.removeAttribute("aria-disabled");
            a.removeAttribute("tabindex");
          });
          resumeAvailable();
        }
      })
      .catch(() => {  });
  }

  /* ---------- 5. Mobile menu ---------- */
  const toggle = $("#navToggle");
  const nav = $("#siteNav");
  function closeMenu() {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  $$("a", nav).forEach(a => a.addEventListener("click", closeMenu));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && nav.classList.contains("open")) { closeMenu(); toggle.focus(); }
  });
  window.addEventListener("resize", () => { if (window.innerWidth > 820) closeMenu(); });

  /* ---------- 6. Highlight current section in nav ---------- */
  const sections = $$("main section[id]");
  const navLinks = $$("a[href^='#']", nav);
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach(a => {
            const on = a.getAttribute("href") === "#" + id;
            a.classList.toggle("active", on);
            if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(s => spy.observe(s));
  }

  /* ---------- 7. Scroll reveal ---------- */
  const revealEls = $$(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(el => el.classList.add("is-visible"));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target); 
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---------- 8. Videos ---------- */
  function youTubeId(url) {
    try {
      const u = new URL(url);
      const host = u.hostname.replace(/^www\./, "");
      if (host === "youtu.be") return u.pathname.slice(1).split("/")[0];
      if (host.endsWith("youtube.com")) {
        if (u.searchParams.get("v")) return u.searchParams.get("v");
        const m = u.pathname.match(/^\/(shorts|embed|live)\/([^/?]+)/);
        if (m) return m[2];
      }
    } catch (e) { }
    return null;
  }

  $$(".video-card").forEach(card => {
    const url = (card.getAttribute("data-video") || "").trim();
    const thumb = (card.getAttribute("data-thumb") || "").trim();
    const btn = $(".play-btn", card);
    const stage = $(".video-stage", card);
    const media = $(".video-thumb", card);

    
    if (thumb && media) {
      media.setAttribute("data-src", thumb);
      const img = $("img", media);
      const test = new Image();
      test.onload = () => { img.src = thumb; img.hidden = false; media.classList.add("loaded"); };
      test.src = thumb;
    } else if (url && media) {
      
      const id = youTubeId(url);
      if (id) {
        const auto = "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg";
        const img = $("img", media);
        const test = new Image();
        test.onload = () => { img.src = auto; img.hidden = false; media.classList.add("loaded"); };
        test.src = auto;
      }
    }

    if (!url) {
      card.classList.add("is-empty");
      btn.setAttribute("aria-disabled", "true");
      btn.setAttribute("title", "Video link not added yet");
      return;
    }

    btn.addEventListener("click", () => {
      const id = youTubeId(url);
      if (id) {
        const frame = document.createElement("iframe");
        frame.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
        frame.title = "Video player";
        frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        frame.allowFullscreen = true;
        stage.innerHTML = "";
        stage.appendChild(frame);
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    });
  });

  /* ---------- 9. Footer year ---------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
