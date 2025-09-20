// script.js
// 풀페이지 스크롤 (휠/터치 → 한 섹션씩 이동)

document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".pane");
  let currentIndex = 0;
  let isScrolling = false;

  function scrollToSection(index) {
    if (index < 0 || index >= sections.length) return;
    isScrolling = true;
    sections[index].scrollIntoView({ behavior: "smooth" });
    currentIndex = index;
    setTimeout(() => {
      isScrolling = false;
    }, 800); // 스크롤 중복 방지
  }

  // 마우스 휠 이벤트
  window.addEventListener("wheel", (e) => {
    if (isScrolling) return;
    if (e.deltaY > 0) {
      scrollToSection(currentIndex + 1);
    } else {
      scrollToSection(currentIndex - 1);
    }
  });

  // 키보드 (↑, ↓, PgUp, PgDn)
  window.addEventListener("keydown", (e) => {
    if (isScrolling) return;
    if (["ArrowDown", "PageDown"].includes(e.key)) {
      scrollToSection(currentIndex + 1);
    }
    if (["ArrowUp", "PageUp"].includes(e.key)) {
      scrollToSection(currentIndex - 1);
    }
  });

  // 터치 스와이프 (모바일)
  let startY = 0;
  window.addEventListener("touchstart", (e) => {
    startY = e.touches[0].clientY;
  });
  window.addEventListener("touchend", (e) => {
    const endY = e.changedTouches[0].clientY;
    if (Math.abs(startY - endY) < 50) return; // 작은 움직임 무시
    if (startY > endY) {
      scrollToSection(currentIndex + 1); // 아래로 스와이프
    } else {
      scrollToSection(currentIndex - 1); // 위로 스와이프
    }
  });
});
