let currentViewMode = "grid";
let currentPage = 1;
const gamesPerPage = 15;
let currentSort = "-added";
document.addEventListener("DOMContentLoaded", () => {
  initPriceSlider();
  initPlatformDropdown();
  initRatingFilter();
  initFilterTags();
  initViewSwitcher();
  initSortDropdown();
  initPagination();
  initWishlist();
  const urlParams = new URLSearchParams(window.location.search);
  const searchParam = urlParams.get("search");
  const genreParam = urlParams.get("genre");
  if (searchParam) {
    const searchInput = document.querySelector(".search-input");
    if (searchInput) searchInput.value = searchParam;
  }

  if (genreParam) {
    const checkboxes = document.querySelectorAll(
      '.catalog-filters input[type="checkbox"]',
    );
    checkboxes.forEach((cb) => {
      const labelEl =
        cb.closest(".platform-option")?.querySelector(".option-text") ||
        cb.closest(".hex-filter")?.querySelector(".filter-text");
      if (labelEl) {
        const label = labelEl.textContent.trim().toLowerCase();
        const genreMap = {
          "open-world": "открытый мир",
          strategy: "стратегия",
          coop: "онлайн-кооператив",
          free: "бесплатно",
          shooter: "шутеры",
          rpg: "rpg",
          active: "экшен",
          racing: "гонки",
        };
        const targetGenre = genreMap[genreParam] || genreParam;
        if (label === targetGenre) {
          cb.checked = true;
          const group = cb.closest(".platform-group");
          if (group) {
            group.classList.add("open");
            const dropdown = group.querySelector(".platform-dropdown");
            if (dropdown) dropdown.classList.add("active");
          }

        }

      }

    });
    updateFilterTags();
  }

  renderCatalog();
  document.addEventListener("search-updated", (e) => {
    currentPage = 1;
    renderCatalog();
  });
});
function initWishlist() {
  document.addEventListener("click", (e) => {
    if (
      e.target.classList.contains("cat-card-heart") ||
      e.target.classList.contains("wishlist-icon")
    ) {
      e.target.classList.toggle("liked");
    }

  });
}

function initSortDropdown() {
  const trigger = document.querySelector(".sort-dropdown-trigger");
  const options = document.querySelectorAll(".sort-option");
  const sortValueText = document.querySelector(".sort-value");
  if (!trigger) return;
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    trigger.classList.toggle("active");
  });
  document.addEventListener("click", () => {
    trigger.classList.remove("active");
  });
  options.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.stopPropagation();
      const val = option.dataset.value;
      const text = option.textContent;
      options.forEach((opt) => opt.classList.remove("active"));
      option.classList.add("active");
      sortValueText.textContent = text;
      trigger.classList.remove("active");
      let apiSort = "-added";
      if (val === "price-low") apiSort = "price";
      if (val === "price-high") apiSort = "-name";
      if (val === "rating") apiSort = "-rating";
      if (val === "bestsellers") apiSort = "-added";
      currentSort = apiSort;
      currentPage = 1;
      renderCatalog();
    });
  });
}

function initPagination() {
  const bottomPagination = document.querySelector(".catalog-bottom-pagination");
  const topPagination = document.querySelector(".catalog-pagination");
  const topInput = topPagination?.querySelector(".page-input");
  const topArrows = topPagination?.querySelectorAll(".page-arrow");
  if (topInput) {
    topInput.addEventListener("change", (e) => {
      const val = parseInt(e.target.value);
      if (!isNaN(val)) goToPage(val);
    });
  }

  if (topArrows) {
    topArrows[0].addEventListener("click", () => goToPage(currentPage - 1));
    topArrows[1].addEventListener("click", () => goToPage(currentPage + 1));
  }

  if (bottomPagination) {
    bottomPagination.addEventListener("click", (e) => {
      if (e.target.classList.contains("page-num")) {
        goToPage(parseInt(e.target.textContent));
      } else if (e.target.classList.contains("prev")) {
        goToPage(currentPage - 1);
      } else if (e.target.classList.contains("next")) {
        goToPage(currentPage + 1);
      }

    });
  }

}
function goToPage(page) {
  currentPage = page;
  renderCatalog();
}

async function renderCatalog() {
  const grid = document.querySelector(".games-grid");
  if (!grid) return;
  grid.style.opacity = "0.5";
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("search");
  const checkedGenres = [];
  const checkedTags = [];
  const checkedPlatforms = [];
  document.querySelectorAll(".catalog-filters input:checked").forEach((cb) => {
    const platformOption = cb.closest(".platform-option");
    const hexFilter = cb.closest(".hex-filter");
    const group = cb.closest(".platform-group");
    const groupTitle = group
      ?.querySelector(".platform-text")
      ?.textContent.trim();
    const labelEl =
      platformOption?.querySelector(".option-text") ||
      hexFilter?.querySelector(".filter-text");
    if (labelEl) {
      const text = labelEl.textContent.trim().toLowerCase();
      if (groupTitle === "Платформа") {
        const platMap = {
          pc: 4,
          playstation: 187,
          xbox: 1,
          android: 21,
          apple: 3,
        };
        if (platMap[text]) checkedPlatforms.push(platMap[text]);
      } else if (text === "бесплатно") {
        checkedTags.push("free-to-play");
      } else if (text === "только игры со скидкой") {
        apiParams.ordering = "-rating";
      } else if (text === "предложение недели") {
        apiParams.metacritic = "80,100";
      } else if (text === "спрятать dlc и дополнение") {
        apiParams.exclude_additions = true;
      } else if (groupTitle === "Мультиплеер") {
        const multiMap = {
          "одиночная игра": "singleplayer",
          "онлайн-мультиплеер": "multiplayer",
          "онлайн-кооператив": "cooperative",
          "локальный кооператив": "local-co-op",
          "кроссплатформенный мультиплеер": "cross-platform-multiplayer",
        };
        checkedTags.push(multiMap[text] || text);
      } else {
        const genreMap = {
          стратегия: "strategy",
          экшен: "action",
          rpg: "role-playing-games-rpg",
          шутеры: "shooter",
          гонки: "racing",
          приключение: "adventure",
          аркада: "arcade",
          платформер: "platformer",
          головоломка: "puzzle",
          симулятор: "simulation",
        };
        const tagMap = {
          "открытый мир": "open-world",
          выживание: "survival",
          хоррор: "horror",
          зомби: "zombies",
          космос: "space",
        };
        if (tagMap[text]) {
          checkedTags.push(tagMap[text]);
        } else {
          checkedGenres.push(genreMap[text] || text);
        }

      }

    }

  });
  let finalGenres = checkedGenres.join(",");
  let finalTags = checkedTags.join(",");
  let finalPlatforms = checkedPlatforms.join(",");
  if (!finalGenres && !finalTags && urlParams.get("genre")) {
    const g = urlParams.get("genre");
    if (g === "free") finalTags = "free-to-play";
    else if (g === "coop") finalTags = "cooperative";
    else finalGenres = g;
  }

  const apiParams = {
    page: currentPage,
    page_size: gamesPerPage,
    ordering: currentSort,
  };
  if (searchQuery) apiParams.search = searchQuery;
  if (finalGenres) apiParams.genres = finalGenres;
  if (finalTags) apiParams.tags = finalTags;
  if (finalPlatforms) apiParams.platforms = finalPlatforms;
  const currentDate = new Date().toISOString().split("T")[0];
  const nextYearDate = new Date(
    new Date().setFullYear(new Date().getFullYear() + 1),
  )
    .toISOString()
    .split("T")[0];
  document.querySelectorAll(".platform-group").forEach((group) => {
    const title = group.querySelector(".platform-text")?.textContent.trim();
    if (title === "Статус релиза") {
      group.querySelectorAll("input:checked").forEach((cb) => {
        const status = cb
          .closest(".platform-option")
          .querySelector(".option-text")
          .textContent.trim();
        if (status === "Новинка") {
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          apiParams.dates = `${sixMonthsAgo.toISOString().split("T")[0]},${currentDate}`;
          apiParams.ordering = "-released";
        } else if (status === "Ожидаемое") {
          apiParams.dates = `${currentDate},${nextYearDate}`;
          apiParams.ordering = "-added";
        } else if (status === "Ранний доступ") {
          if (apiParams.tags) apiParams.tags += ",early-access";
          else apiParams.tags = "early-access";
        }

      });
    }

  });
  const data = await RawgAPI.fetchGames(apiParams);
  if (!data || !data.results) {
    grid.innerHTML =
      '<div style="color: #fff; grid-column: 1/-1; text-align: center;">Ошибка загрузки данных</div>';
    grid.style.opacity = "1";
    return;
  }

  const totalPages = Math.ceil(data.count / gamesPerPage);
  updatePaginationUI(Number.isInteger(totalPages) ? totalPages : 210);
  let filteredResults = data.results;
  const minPriceInput = document.querySelectorAll(".price-input")[0];
  const maxPriceInput = document.querySelectorAll(".price-input")[1];
  if (minPriceInput && maxPriceInput) {
    const minP = parseFloat(minPriceInput.value) || 0;
    const maxP = parseFloat(maxPriceInput.value) || 100;
    if (minP > 5 || maxP < 100) {
      filteredResults = filteredResults.filter((game) => {
        const pricing = RawgAPI.getPriceAndDiscount(game);
        const price = pricing.isFree ? 0 : parseFloat(pricing.price);
        return price >= minP && price <= maxP;
      });
    }

  }

  if (filteredResults.length === 0) {
    grid.innerHTML =
      '<div style="color: #fff; grid-column: 1/-1; text-align: center;">Нет игр, соответствующих фильтру цен на этой странице.</div>';
    grid.style.opacity = "1";
    return;
  }

  grid.innerHTML = filteredResults
    .map((game) => {
      const pricing = RawgAPI.getPriceAndDiscount(game);
      const displayPrice = pricing.isFree ? "БЕСПЛАТНО" : `$${pricing.price}`;
      const rating = game.rating || 0;
      const img = game.background_image || NO_IMAGE;
      if (currentViewMode === "grid") {
        return `
                <div class="catalog-game-card">
                    <div class="cat-card-header">
                        <span>${game.name}</span>
                        <img src="icon/heart.svg" alt="Heart" class="cat-card-heart">
                    </div>
                    <div class="cat-card-image">
                        <img src="${img}" alt="${game.name}" onerror="this.src=window.NO_IMAGE">
                    </div>
                    <div class="cat-card-footer">
                        <span class="cat-price ${pricing.isFree ? "free" : ""}">${displayPrice}</span>
                        ${pricing.discount ? `<span class="cat-discount">${pricing.discount}</span>` : ""}

                        ${pricing.oldPrice ? `<span class="cat-old-price">$${pricing.oldPrice}</span>` : ""}

                    </div>
                </div>
            `;
      } else {
        return `
                <div class="catalog-game-card-wide">
                    <img src="${img}" class="game-img" alt="${game.name}" onerror="this.src=window.NO_IMAGE">
                    <div class="game-details">
                        <div class="game-title">${game.name}</div>
                        <div class="game-rating-row">
                            <div class="stars-container">
                                <div class="stars-bg">
                                    ${'<img src="icon/star.svg" alt="star">'.repeat(5)}

                                </div>
                                <div class="stars-fill" style="width: ${(rating / 5) * 100}%">
                                    ${'<img src="icon/star-filled.svg" alt="star">'.repeat(5)}

                                </div>
                            </div>
                            <div class="rating-box">${rating}</div>
                            <div class="platform-box">
                                <img src="icon/windows.svg" class="platform-icon" alt="Windows">
                            </div>
                        </div>
                        <div class="game-actions">
                            <img src="icon/heart.svg" class="wishlist-icon" alt="Wishlist">
                        </div>
                    </div>
                    <div class="game-price-block">
                        ${pricing.discount ? `<div class="game-discount">${pricing.discount}</div>` : ""}

                        <div class="game-price-col">
                            ${pricing.oldPrice ? `<div class="game-price-old">$${pricing.oldPrice}</div>` : ""}

                            <div class="game-price-new ${pricing.isFree ? "free" : ""}">${displayPrice}</div>
                        </div>
                    </div>
                </div>
            `;
      }

    })
    .join("");
  grid.style.opacity = "1";
}

function updatePaginationUI(totalPages) {
  const headerInput = document.querySelector(".page-input");
  const headerTotal = document.querySelector(".page-total");
  if (headerInput) headerInput.value = currentPage;
  if (headerTotal)
    headerTotal.textContent = `из ${totalPages > 210 ? 210 : totalPages}`;
  const pagesList = document.querySelector(".pages-list");
  if (!pagesList) return;
  let pagesHTML = "";
  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pagesHTML += `<span class="page-num ${i === currentPage ? "active" : ""}">${i}</span>`;
  }

  if (endPage < totalPages) {
    pagesHTML += `<span class="page-dots">...</span>`;
    pagesHTML += `<span class="page-num ${totalPages === currentPage ? "active" : ""}">${totalPages > 210 ? 210 : totalPages}</span>`;
  }

  pagesList.innerHTML = pagesHTML;
}

function initViewSwitcher() {
  const icons = document.querySelectorAll(".view-icon");
  const grid = document.querySelector(".games-grid");
  icons.forEach((icon) => {
    icon.addEventListener("click", () => {
      if (icon.classList.contains("active")) return;
      icons.forEach((i) => i.classList.remove("active"));
      icon.classList.add("active");
      currentViewMode = icon.alt === "grid view" ? "grid" : "list";
      if (currentViewMode === "list") {
        grid.classList.add("list-view");
      } else {
        grid.classList.remove("list-view");
      }

      renderCatalog();
    });
  });
}

function initPriceSlider() {
  const sliderContainer = document.querySelector(".price-slider-visual");
  if (!sliderContainer) return;
  const track = sliderContainer.querySelector(".slider-line");
  const items = sliderContainer.querySelectorAll(".slider-handle");
  const leftHandle = sliderContainer.querySelector(".slider-handle.left");
  const rightHandle = sliderContainer.querySelector(".slider-handle.right");
  const inputs = document.querySelectorAll(".price-input");
  const minInput = inputs[0];
  const maxInput = inputs[1];
  const MIN_PRICE = 5;
  const MAX_PRICE = 100;
  let currentMin = MIN_PRICE;
  let currentMax = MAX_PRICE;
  minInput.value = "";
  minInput.placeholder = MIN_PRICE;
  maxInput.value = "";
  maxInput.placeholder = MAX_PRICE;
  const getPercent = (value) => {
    return ((value - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * 100;
  };
  const getValue = (percent) => {
    return Math.round((percent / 100) * (MAX_PRICE - MIN_PRICE) + MIN_PRICE);
  };
  const updateUI = () => {
    const minPercent = getPercent(currentMin);
    const maxPercent = getPercent(currentMax);
    leftHandle.style.left = `${minPercent}%`;
    leftHandle.style.transform = `translate(-50%, -50%)`;
    rightHandle.style.left = `${maxPercent}%`;
    rightHandle.style.right = "auto";
    rightHandle.style.left = `${maxPercent}%`;
    rightHandle.style.transform = `translate(-50%, -50%)`;
  };
  rightHandle.style.right = "auto";
  updateUI();
  const handleDrag = (handle, isMin) => {
    let isDragging = false;
    handle.addEventListener("mousedown", (e) => {
      isDragging = true;
      e.preventDefault();
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
    const onMouseMove = (e) => {
      if (!isDragging) return;
      const rect = track.getBoundingClientRect();
      let offsetX = e.clientX - rect.left;
      if (offsetX < 0) offsetX = 0;
      if (offsetX > rect.width) offsetX = rect.width;
      let percentage = (offsetX / rect.width) * 100;
      let value = getValue(percentage);
      if (isMin) {
        if (value >= currentMax) value = currentMax - 1;
        if (value < MIN_PRICE) value = MIN_PRICE;
        currentMin = value;
        minInput.value = currentMin;
      } else {
        if (value <= currentMin) value = currentMin + 1;
        if (value > MAX_PRICE) value = MAX_PRICE;
        currentMax = value;
        maxInput.value = currentMax;
      }

      updateUI();
    };
    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  };
  handleDrag(leftHandle, true);
  handleDrag(rightHandle, false);
  const handleInputChange = (isMin) => {
    const input = isMin ? minInput : maxInput;
    const valStr = input.value.trim();
    if (valStr === "") {
      if (isMin) currentMin = MIN_PRICE;
      else currentMax = MAX_PRICE;
      updateUI();
      return;
    }

    let val = parseInt(valStr);
    if (isMin) {
      if (isNaN(val) || val < MIN_PRICE) val = MIN_PRICE;
      if (val >= currentMax) val = currentMax - 1;
      currentMin = val;
      input.value = currentMin;
    } else {
      if (isNaN(val) || val > MAX_PRICE) val = MAX_PRICE;
      if (val <= currentMin) val = currentMin + 1;
      currentMax = val;
      input.value = currentMax;
    }

    updateUI();
  };
  minInput.addEventListener("change", () => {
    handleInputChange(true);
    currentPage = 1;
    renderCatalog();
  });
  maxInput.addEventListener("change", () => {
    handleInputChange(false);
    currentPage = 1;
    renderCatalog();
  });
}

function initPlatformDropdown() {
  const dropdowns = document.querySelectorAll(".platform-dropdown");
  dropdowns.forEach((dropdown) => {
    dropdown.addEventListener("click", () => {
      dropdown.classList.toggle("active");
      const group = dropdown.closest(".platform-group");
      if (group) group.classList.toggle("open");
    });
  });
}

function initRatingFilter() {
  const stars = document.querySelectorAll(".rating-filter .star");
  const ratingText = document.querySelector(".rating-text");
  if (!stars.length || !ratingText) return;
  let currentRating = 0;
  stars.forEach((star, index) => {
    star.addEventListener("click", () => {
      const clickedRating = index + 1;
      if (currentRating === clickedRating) {
        currentRating = 0;
      } else {
        currentRating = clickedRating;
      }

      stars.forEach((s, i) => {
        if (i < currentRating) {
          s.classList.add("filled");
          s.src = "icon/star-filled.svg";
        } else {
          s.classList.remove("filled");
          s.src = "icon/star.svg";
        }

      });
      if (currentRating === 0) {
        ratingText.textContent = "Любой рейтинг";
      } else {
        let suffix = "звезд";
        if (currentRating === 1) suffix = "звезда";
        else if (currentRating >= 2 && currentRating <= 4) suffix = "звезды";
        ratingText.textContent = `${currentRating} ${suffix} и выше`;
      }

      updateFilterTags();
      currentPage = 1;
      renderCatalog();
    });
  });
}

function initFilterTags() {
  const checkboxes = document.querySelectorAll(
    '.platform-option input[type="checkbox"]',
  );
  checkboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      updateFilterTags();
      renderCatalog();
    });
  });
  const resetBtn = document.querySelector(".catalog-reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      checkboxes.forEach((cb) => (cb.checked = false));
      const stars = document.querySelectorAll(".rating-filter .star");
      stars.forEach((s) => {
        s.classList.remove("filled");
        s.src = "icon/star.svg";
      });
      const ratingText = document.querySelector(".rating-text");
      if (ratingText) ratingText.textContent = "Любой рейтинг";
      updateFilterTags();
    });
  }

  updateFilterTags();
}

function updateFilterTags() {
  const tagsRow = document.querySelector(".active-filters-row");
  if (!tagsRow) return;
  tagsRow.innerHTML = "";
  const filterGroups = document.querySelectorAll(".filter-group");
  filterGroups.forEach((group) => {
    const groupTitle = group
      .querySelector(".platform-text")
      ?.textContent.trim();
    if (!groupTitle) return;
    const checkedBoxes = group.querySelectorAll("input:checked");
    checkedBoxes.forEach((cb) => {
      const value = cb
        .closest(".platform-option")
        .querySelector(".option-text")
        .textContent.trim();
      createTag(groupTitle, value, () => {
        cb.checked = false;
        updateFilterTags();
        renderCatalog();
      });
    });
  });
  const ratingText = document.querySelector(".rating-text")?.textContent;
  if (ratingText && ratingText !== "Любой рейтинг") {
    createTag("Рейтинг", ratingText, () => {
      const stars = document.querySelectorAll(".rating-filter .star");
      stars.forEach((s) => {
        s.classList.remove("filled");
        s.src = "icon/star.svg";
      });
      document.querySelector(".rating-text").textContent = "Любой рейтинг";
      updateFilterTags();
      renderCatalog();
    });
  }

  function createTag(label, value, onRemove) {
    const tag = document.createElement("div");
    tag.className = "filter-tag";
    tag.style.cursor = "pointer";
    tag.innerHTML = `
            <span class="tag-label">${label}:</span>
            <span class="tag-value">${value}</span>
            <div class="tag-close-wrapper">
                <img src="icon/x.svg" class="tag-close-icon" alt="remove">
            </div>
        `;
    tag.addEventListener("click", onRemove);
    tagsRow.appendChild(tag);
  }

}
