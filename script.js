(() => {
  const sections = Array.from(document.querySelectorAll(".pane[data-title]"));
  const navLinks = Array.from(document.querySelectorAll(".gnb a"));
  const indicator = document.querySelector(".floating-indicator");
  const indicatorTitle = document.querySelector(".indicator-title");
  const indicatorCount = document.querySelector(".indicator-count");

  if (!sections.length) return;

  document.querySelectorAll(".stack-icons i[title]").forEach((el) => {
    el.setAttribute("tabindex", "0");
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", el.getAttribute("title"));
  });

  const sectionMap = new Map(
    sections.map((section, index) => [section.id, { title: section.dataset.title, index }])
  );

  function updateUI(section) {
    const meta = sectionMap.get(section.id);
    if (!meta) return;

    indicatorTitle.textContent = meta.title;
    indicatorCount.textContent = `${meta.index + 1} / ${sections.length}`;

    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const isActive = href === `#${section.id}`;
      link.classList.toggle("is-active", isActive);
      link.setAttribute("aria-current", isActive ? "page" : "false");
    });
  }

  // 변경된 핵심 로직: 화면 중앙(상하 40% 제외한 영역)에 닿는 섹션을 활성화
  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries.filter((entry) => entry.isIntersecting);
      
      if (visibleEntries.length > 0) {
        updateUI(visibleEntries[0].target);
      }
    },
    {
      root: null,
      threshold: 0, 
      rootMargin: "-40% 0px -40% 0px", 
    }
  );

  sections.forEach((section) => observer.observe(section));
  updateUI(sections[0]);

  indicator.addEventListener("click", () => {
    const currentText = indicatorTitle.textContent;
    const currentIndex = sections.findIndex(
      (section) => section.dataset.title === currentText
    );
    const nextIndex = currentIndex >= sections.length - 1 ? 0 : currentIndex + 1;
    sections[nextIndex].scrollIntoView({ behavior: "smooth", block: "start" });
  });

  window.addEventListener("keydown", (event) => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const activeElement = document.activeElement;
    const isTyping =
      activeElement &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.isContentEditable);

    if (!isDesktop || isTyping) return;

    const currentText = indicatorTitle.textContent;
    const currentIndex = sections.findIndex(
      (section) => section.dataset.title === currentText
    );

    if (["ArrowDown", "PageDown"].includes(event.key)) {
      event.preventDefault();
      const next = Math.min(currentIndex + 1, sections.length - 1);
      sections[next].scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (["ArrowUp", "PageUp"].includes(event.key)) {
      event.preventDefault();
      const prev = Math.max(currentIndex - 1, 0);
      sections[prev].scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (event.key === "Home") {
      event.preventDefault();
      sections[0].scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (event.key === "End") {
      event.preventDefault();
      sections[sections.length - 1].scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
})();
