document.addEventListener("DOMContentLoaded", function () {
  var list = document.getElementById("selection-list");
  if (!list) {
    return;
  }

  var cards = Array.from(list.querySelectorAll(".selection-card"));
  var categoryButtons = Array.from(document.querySelectorAll('[data-filter-group="category"]'));
  var regionButtons = Array.from(document.querySelectorAll('[data-filter-group="region"]'));
  var featureButtons = Array.from(document.querySelectorAll('[data-filter-group="feature"]'));
  var sortButtons = Array.from(document.querySelectorAll("[data-sort]"));
  var countNode = document.getElementById("selection-results-count");
  var titleNode = document.getElementById("selection-results-title");
  var emptyNode = document.getElementById("selection-empty");
  var queryParams = new URLSearchParams(window.location.search);
  var initialCategory = queryParams.get("category");

  var state = {
    category: initialCategory === "sale" || initialCategory === "rent" ? initialCategory : "all",
    region: "all",
    features: new Set(),
    sort: "featured"
  };

  function setPressed(buttons, activeButton, allowMulti) {
    buttons.forEach(function (button) {
      var isActive = allowMulti
        ? state.features.has(button.dataset.filterValue)
        : button === activeButton;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  }

  function matchesWithState(card, candidateState) {
    var categoryMatches = candidateState.category === "all" || card.dataset.category === candidateState.category;
    if (!categoryMatches) {
      return false;
    }

    var regionMatches = candidateState.region === "all" || card.dataset.region === candidateState.region;
    if (!regionMatches) {
      return false;
    }

    return Array.from(candidateState.features).every(function (feature) {
      return card.dataset.features.split(" ").includes(feature);
    });
  }

  function cardMatches(card) {
    return matchesWithState(card, state);
  }

  function compareCards(a, b) {
    if (state.sort === "price-asc") {
      return Number(a.dataset.price) - Number(b.dataset.price);
    }

    if (state.sort === "popular") {
      return Number(a.dataset.popularRank) - Number(b.dataset.popularRank);
    }

    return Number(a.dataset.featureRank) - Number(b.dataset.featureRank);
  }

  function updateSummary(visibleCards) {
    var titleByCategory = {
      all: "符合條件的精選物件",
      sale: "符合條件的買賣物件",
      rent: "符合條件的租屋物件"
    };

    if (countNode) {
      countNode.innerHTML = "<strong>共 " + visibleCards.length + " 筆</strong>";
    }

    if (titleNode) {
      titleNode.textContent = visibleCards.length > 0 ? titleByCategory[state.category] : "目前沒有符合條件的物件";
    }

    if (emptyNode) {
      emptyNode.classList.toggle("is-visible", visibleCards.length === 0);
    }
  }

  function render() {
    var visibleCards = cards.filter(cardMatches).sort(compareCards);
    var fragment = document.createDocumentFragment();

    visibleCards.forEach(function (card) {
      fragment.appendChild(card);
    });

    list.replaceChildren(fragment);
    updateSummary(visibleCards);
  }

  categoryButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var value = button.dataset.filterValue;
      if (value === "all" || state.category === value) {
        state.category = "all";
      } else {
        state.category = value;
      }
      var activeButton = categoryButtons.find(function (categoryButton) {
        return categoryButton.dataset.filterValue === state.category;
      }) || categoryButtons[0];
      setPressed(categoryButtons, activeButton, false);
      render();
    });
  });

  regionButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var value = button.dataset.filterValue;
      if (value === "all" || state.region === value) {
        state.region = "all";
      } else {
        state.region = value;
      }
      var activeButton = regionButtons.find(function (regionButton) {
        return regionButton.dataset.filterValue === state.region;
      }) || regionButtons[0];
      setPressed(regionButtons, activeButton, false);
      render();
    });
  });

  featureButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var value = button.dataset.filterValue;
      if (state.features.has(value)) {
        state.features.delete(value);
      } else {
        state.features.add(value);
      }
      setPressed(featureButtons, null, true);
      render();
    });
  });

  sortButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      state.sort = button.dataset.sort;
      sortButtons.forEach(function (sortButton) {
        var isActive = sortButton === button;
        sortButton.classList.toggle("active", isActive);
        sortButton.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
      render();
    });
  });

  var initialCategoryButton = categoryButtons.find(function (button) {
    return button.dataset.filterValue === state.category;
  }) || categoryButtons[0];

  setPressed(categoryButtons, initialCategoryButton, false);
  setPressed(regionButtons, regionButtons[0], false);
  setPressed(featureButtons, null, true);
  render();
});
