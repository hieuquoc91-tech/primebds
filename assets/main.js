(function () {
  const A = window.AGENT || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---- Thông tin cá nhân ---- */
  $$("[data-agent]").forEach(el => { const v = A[el.dataset.agent]; if (v) el.textContent = v; });
  $$("[data-tel]").forEach(el => el.href = "tel:" + A.phone);
  $$("[data-zalo]").forEach(el => { el.href = "https://zalo.me/" + A.zalo; el.target = "_blank"; el.rel = "noopener"; });
  $$("[data-mail]").forEach(el => el.href = "mailto:" + A.email);
  $$("[data-fb]").forEach(el => { if (!A.facebook) { el.remove(); return; } el.href = A.facebook; el.target = "_blank"; el.rel = "noopener"; });
  $$("[data-portrait]").forEach(el => { if (A.portrait) el.src = A.portrait; });
  $$("[data-tiktok]").forEach(el => { el.href = A.tiktok; el.target = "_blank"; el.rel = "noopener"; });
  $$(".brand-mark").forEach(el => {
    if (A.avatar) el.innerHTML = '<img src="' + A.avatar + '" alt="' + (A.name || "") + '">';
    else el.textContent = A.initials || "";
  });
  if (A.name) document.title = document.title.replace("{name}", A.name);
  $$(".year").forEach(el => el.textContent = new Date().getFullYear());

  /* ---- Header ---- */
  const header = $(".header");
  const onScroll = () => header && header.classList.toggle("scrolled", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  const menuBtn = $(".menu-btn"), nav = $(".nav");
  if (menuBtn) {
    menuBtn.onclick = () => nav.classList.toggle("open");
    $$(".nav a").forEach(a => a.onclick = () => nav.classList.remove("open"));
  }

  /* ---- Reveal + counters + bars ---- */
  const countUp = el => {
    const end = parseFloat(el.dataset.count), dec = (el.dataset.count.split(".")[1] || "").length;
    const t0 = performance.now(), dur = 1600;
    const step = t => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (end * e).toLocaleString("vi-VN", { minimumFractionDigits: dec, maximumFractionDigits: dec });
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    el.classList.add("in");
    if (el.dataset.count) countUp(el);
    $$("[data-count]", el).forEach(countUp);
    $$(".fill", el).forEach(f => f.style.width = f.dataset.w + "%");
    io.unobserve(el);
  }), { threshold: .18 });
  $$(".reveal, .count-group, .bars").forEach(el => io.observe(el));

  /* ---- Marquee: nhân đôi để cuộn liền mạch ---- */
  $$(".marquee-track").forEach(t => t.innerHTML += t.innerHTML);

  /* ---- Horizontal scroll buttons ---- */
  $$("[data-hs]").forEach(btn => btn.onclick = () => {
    const box = $(btn.dataset.hs);
    box.scrollBy({ left: (btn.dataset.dir === "next" ? 1 : -1) * box.clientWidth * .8, behavior: "smooth" });
  });

  /* ---- Parallax ---- */
  const pars = $$(".parallax img");
  if (pars.length && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const run = () => pars.forEach(img => {
      const r = img.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      img.style.transform = "translateY(" + ((r.top + r.height / 2 - innerHeight / 2) * -0.18) + "px)";
    });
    addEventListener("scroll", run, { passive: true }); run();
  }

  /* ---- Filters (thư mục dự án) ---- */
  $$(".filters button").forEach(b => b.onclick = () => {
    $$(".filters button").forEach(x => x.classList.toggle("active", x === b));
    const f = b.dataset.filter;
    $$(".pcard").forEach(c => c.classList.toggle("hidden", f !== "all" && !c.dataset.tags.includes(f)));
  });

  /* ---- Tabs ---- */
  $$(".tabs").forEach(tabs => {
    const btns = $$("button", tabs);
    btns.forEach(b => b.onclick = () => {
      btns.forEach(x => x.classList.toggle("active", x === b));
      $$("." + tabs.dataset.group).forEach(p => p.classList.toggle("active", p.id === b.dataset.tab));
    });
  });

  /* ---- Lightbox ---- */
  const lb = document.createElement("div");
  lb.className = "lb";
  lb.innerHTML = '<button class="x" aria-label="Đóng">×</button><button class="prev" aria-label="Ảnh trước">‹</button><img alt=""><button class="next" aria-label="Ảnh sau">›</button><div class="cap"></div>';
  document.body.appendChild(lb);
  let list = [], idx = 0;
  const show = i => {
    idx = (i + list.length) % list.length;
    $("img", lb).src = list[idx].src;
    $(".cap", lb).textContent = list[idx].alt + "  ·  " + (idx + 1) + "/" + list.length;
  };
  document.addEventListener("click", e => {
    const img = e.target.closest("img[data-lb]");
    if (!img) return;
    const group = img.dataset.lb;
    const seen = new Set();
    list = $$('img[data-lb="' + group + '"]').filter(x => !seen.has(x.src) && seen.add(x.src));
    show(list.findIndex(x => x.src === img.src));
    lb.classList.add("open");
  });
  $(".x", lb).onclick = () => lb.classList.remove("open");
  $(".prev", lb).onclick = () => show(idx - 1);
  $(".next", lb).onclick = () => show(idx + 1);
  lb.onclick = e => { if (e.target === lb) lb.classList.remove("open"); };
  addEventListener("keydown", e => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") lb.classList.remove("open");
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });

  /* ---- Tính khoản vay ---- */
  const calc = $("#calc");
  if (calc) {
    const fmt = n => n.toLocaleString("vi-VN", { maximumFractionDigits: 0 });
    const ty = n => (n / 1e9).toLocaleString("vi-VN", { maximumFractionDigits: 2 }) + " tỷ";
    const upd = () => {
      const loanPct = +$("#c-loan").value, years = +$("#c-years").value, rate = +$("#c-rate").value / 100;
      let price;
      if ($("#c-price")) {                       // nhập giá trực tiếp (tỷ)
        price = +$("#c-price").value * 1e9;
        $("#o-price").textContent = (+$("#c-price").value).toLocaleString("vi-VN") + " tỷ";
      } else {                                   // diện tích × đơn giá
        price = +$("#c-type").value * +$("#c-ppm").value * 1e6;
        $("#o-ppm").textContent = $("#c-ppm").value + " tr/m²";
      }
      const firstPct = +(calc.dataset.first || 5);
      $("#o-loan").textContent = loanPct + "%";
      $("#o-years").textContent = years + " năm";
      $("#o-rate").textContent = $("#c-rate").value + "%/năm";
      const loan = price * loanPct / 100, own = price - loan;
      const r = rate / 12, n = years * 12;
      const pmt = r ? loan * r / (1 - Math.pow(1 + r, -n)) : loan / n;
      $("#r-price").textContent = ty(price);
      $("#r-own").textContent = ty(own);
      $("#r-loan").textContent = ty(loan);
      $("#r-pmt").textContent = fmt(Math.round(pmt / 1000) * 1000) + " đ";
      $("#r-first").textContent = ty(price * firstPct / 100);
    };
    $$("input,select", calc).forEach(i => i.addEventListener("input", upd));
    upd();
  }

  /* ---- Form đăng ký ---- */
  $$("form.form").forEach(form => form.addEventListener("submit", async e => {
    e.preventDefault();
    if (form.website && form.website.value) return;           // chống spam (ô ẩn)
    const fd = new FormData(form);
    fd.delete("website");
    fd.append("page", document.title);
    fd.append("time", new Date().toLocaleString("vi-VN"));
    // gộp các ô chọn nhiều (checkbox cùng tên)
    const d = {};
    for (const [k, v] of fd.entries()) d[k] = d[k] ? d[k] + ", " + v : v;
    const btn = $("button[type=submit]", form), ok = $(".ok", form);
    btn.disabled = true; const label = btn.textContent; btn.textContent = "Đang gửi...";
    let sent = false;
    if (A.leadEndpoint) {
      try {
        await fetch(A.leadEndpoint, { method: "POST", mode: "no-cors", body: new URLSearchParams(d) });
        sent = true;
      } catch (_) {}
    }
    btn.disabled = false; btn.textContent = label;
    ok.textContent = "";
    ok.append("Cảm ơn anh/chị " + (d.name || "") + "! " + (A.name || "Tư vấn viên") +
      (sent ? " đã nhận thông tin và sẽ gọi lại trong ít phút. " : " sẽ liên hệ ngay khi nhận được tin. "));
    const z = document.createElement("a");
    z.href = "https://zalo.me/" + A.zalo; z.target = "_blank"; z.rel = "noopener";
    z.style.textDecoration = "underline"; z.textContent = "Nhắn Zalo cho nhanh →";
    ok.append(z);
    ok.style.display = "block";
    if (sent) form.reset();
  }));
})();
