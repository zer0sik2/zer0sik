// 뒤로가기/세션 캐시 무효화
window.addEventListener("pageshow", function (event) {
  if (event.persisted) {
    window.location.reload();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // 정적 리소스 캐시 무효화 (CSS, JS, 이미지)
  document
    .querySelectorAll("link[rel='stylesheet'], script[src], img[src]")
    .forEach((el) => {
      const url = new URL(el.href || el.src, window.location.origin);
      url.searchParams.set("v", Date.now());
      if (el.tagName === "LINK") el.href = url.toString();
      else el.src = url.toString();
    });

  const container = document.querySelector("#scroll-container");
  const sections = Array.from(document.querySelectorAll(".pane"));

  let currentIndex = 0;
  let isScrolling = false;
  let offsets = [];

  // 페이지 인디케이터 생성
  const indicator = document.createElement("div");
  indicator.className = "page-indicator";
  document.body.appendChild(indicator);

  // 섹션 이름 정의 (Pane 순서와 매칭)
  const sectionNames = [
    "프로필",
    "기본정보",
    "부가정보",
    "기술스택",
    "경력 - 프라뱅",
    "경력 - 만나플래닛",
    "경력 - 푸드노트서비스",
    "경력 - 브리지텍",
    "경력 - 엠엘소프트",
    "성격의 장단점",
  ];

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  // 각 섹션 위치 계산
  function computeOffsets() {
    container.style.transform = "translateY(0px)";
    offsets = sections.map((sec) => sec.offsetTop);
    requestAnimationFrame(() => scrollToSection(currentIndex, true));
  }

  // 인디케이터 업데이트
  function updateIndicator() {
    const name = sectionNames[currentIndex] || `섹션 ${currentIndex + 1}`;
    indicator.textContent = `${name} (${currentIndex + 1} / ${
      sections.length
    })`;
  }

  // 섹션 스크롤 이동
  function scrollToSection(index, instant = false) {
    index = clamp(index, 0, sections.length - 1);
    if (isScrolling && !instant) return;

    const targetY = -offsets[index];

    if (instant) {
      const prev = container.style.transition;
      container.style.transition = "none";
      container.style.transform = `translateY(${targetY}px)`;
      container.getBoundingClientRect();
      container.style.transition = prev || "";
    } else {
      isScrolling = true;
      container.style.transform = `translateY(${targetY}px)`;
      setTimeout(() => {
        isScrolling = false;
      }, 850);
    }

    currentIndex = index;
    updateIndicator();
  }

  // 초기화
  computeOffsets();
  updateIndicator();

  // 입력 핸들링 (마우스 휠)
  window.addEventListener(
    "wheel",
    (e) => {
      if (isScrolling) return;
      if (e.deltaY > 0) scrollToSection(currentIndex + 1);
      else if (e.deltaY < 0) scrollToSection(currentIndex - 1);
    },
    { passive: true }
  );

  // 입력 핸들링 (키보드)
  window.addEventListener("keydown", (e) => {
    if (isScrolling) return;
    if (["ArrowDown", "PageDown"].includes(e.key))
      scrollToSection(currentIndex + 1);
    if (["ArrowUp", "PageUp"].includes(e.key))
      scrollToSection(currentIndex - 1);
    if (e.key === "Home") scrollToSection(0);
    if (e.key === "End") scrollToSection(sections.length - 1);
  });

  // 입력 핸들링 (터치 스와이프)
  let startY = 0;
  window.addEventListener(
    "touchstart",
    (e) => {
      startY = e.touches[0].clientY;
    },
    { passive: true }
  );
  window.addEventListener("touchend", (e) => {
    const endY = e.changedTouches[0].clientY;
    if (Math.abs(startY - endY) < 50) return;
    if (startY > endY) scrollToSection(currentIndex + 1);
    else scrollToSection(currentIndex - 1);
  });

  // 콘텐츠/이미지/폰트 로드 후 보정
  window.addEventListener("load", () => computeOffsets());
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => computeOffsets());
  }
  document.querySelectorAll("img").forEach((img) => {
    if (!img.complete) {
      img.addEventListener("load", computeOffsets, { once: true });
      img.addEventListener("error", computeOffsets, { once: true });
    }
  });

  // 동적 DOM 변경 감지
  const mo = new MutationObserver(() => computeOffsets());
  mo.observe(container, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  // 리사이즈/방향 전환 시 보정
  window.addEventListener("resize", () => computeOffsets());

  // 원하는 페이지로 바로 이동 (네비게이션 버튼 클릭)
  document.querySelectorAll(".page-nav button[data-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetIndex = parseInt(btn.dataset.target, 10);
      scrollToSection(targetIndex);
    });
  });
});
