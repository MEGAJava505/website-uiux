document.addEventListener("DOMContentLoaded", () => {
  console.log("Game page script loaded");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const closeBtn = document.querySelector(".lightbox-close");
  const galleryItems = document.querySelectorAll(".gallery-item img");
  if (lightbox && lightboxImg && closeBtn) {
    galleryItems.forEach((img) => {
      img.addEventListener("click", (e) => {
        lightbox.style.display = "block";
        lightboxImg.src = e.target.src;
      });
    });
    const items = document.querySelectorAll(".gallery-item");
    items.forEach((item) => {
      item.addEventListener("click", () => {
        const img = item.querySelector("img");
        if (img) {
          lightbox.style.display = "block";
          lightboxImg.src = img.src;
        }

      });
    });
    closeBtn.onclick = function () {
      lightbox.style.display = "none";
    };
    lightbox.onclick = function (e) {
      if (e.target === lightbox) {
        lightbox.style.display = "none";
      }

    };
  }

  const tabs = {
    "tab-desc": "content-desc",
    "tab-req": "content-req",
    "tab-rev": "content-rev",
  };
  Object.keys(tabs).forEach((tabId) => {
    const tabElement = document.getElementById(tabId);
    if (tabElement) {
      tabElement.addEventListener("click", () => {
        Object.keys(tabs).forEach((id) => {
          document.getElementById(id).classList.remove("active");
          document.getElementById(tabs[id]).classList.remove("active");
          document.getElementById(tabs[id]).classList.add("hidden");
        });
        tabElement.classList.add("active");
        const contentElement = document.getElementById(tabs[tabId]);
        contentElement.classList.remove("hidden");
        contentElement.classList.add("active");
      });
    }

  });
  const showMoreBtn = document.getElementById("description-more");
  const descriptionText = document.querySelector(".description-text");
  if (showMoreBtn && descriptionText) {
    showMoreBtn.addEventListener("click", () => {
      const isExpanded = descriptionText.classList.toggle("expanded");
      const span = showMoreBtn.querySelector("span");
      const img = showMoreBtn.querySelector("img");
      if (isExpanded) {
        span.textContent = "Свернуть";
        img.style.transform = "rotate(180deg)";
      } else {
        span.textContent = "Показать больше";
        img.style.transform = "rotate(0deg)";
        showMoreBtn
          .closest(".game-description-section")
          .scrollIntoView({ behavior: "smooth" });
      }

    });
  }

  const cartButtons = document.querySelectorAll(".btn-cart, .hero-cart-btn");
  const wishlistButtons = document.querySelectorAll(
    ".btn-wishlist, .hero-wishlist-btn",
  );
  cartButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (btn.textContent.includes("В корзине")) {
        btn.textContent = btn.classList.contains("hero-cart-btn")
          ? "В корзину"
          : "В корзину";
        btn.style.filter = "none";
      } else {
        btn.textContent = "В корзине";
        btn.style.filter = "hue-rotate(-50deg) brightness(1.2)";
      }

    });
  });
  wishlistButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const img = btn.querySelector("img");
      if (btn.classList.contains("active")) {
        btn.classList.remove("active");
        if (img) img.style.filter = "none";
      } else {
        btn.classList.add("active");
        if (img)
          img.style.filter =
            "invert(27%) sepia(82%) saturate(7444%) hue-rotate(354deg) brightness(97%) contrast(105%)";
      }

    });
  });
});
