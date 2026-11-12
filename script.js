const bakeryProducts = [
  {
    id: "country-baguette",
    name: "Country Loaves & Baguettes",
    category: "breads",
    price: 7.00,
    priceText: "$5.00 - $9.00",
    image: "bakery-bread.png",
    alt: "Rustic assortment of fresh sourdough loaves, baguettes, and rye boules",
    description: "Traditional crusty loaves, rustic seeded rye, and classic Parisian-style baguettes baked with organic wheat and sea salt.",
    featured: false
  },
  {
    id: "butter-croissant",
    name: "Butter Croissants & Danishes",
    category: "pastries",
    price: 4.75,
    priceText: "$3.75 - $6.00",
    image: "bakery-feature-small.png",
    alt: "Flaky golden laminated butter croissants and fruit danishes",
    description: "Laminated buttery croissants, cinnamon cardamom morning buns, and seasonal organic fruit Danishes baked crisp every morning.",
    featured: false
  },
  {
    id: "celebration-cake",
    name: "Custom Specialty Cakes",
    category: "cakes",
    price: 45.00,
    priceText: "$28.00 - $65.00",
    image: "bakery-storefront.png",
    alt: "North Star Bakery display counter with custom celebration cakes and baked goods",
    description: "Layered sponge cakes, dark chocolate ganache gateaux, and fresh fruit custard tarts created for weddings and gatherings.",
    featured: false
  }
];

const validationMessages = {
  nameRequired: "Please enter your full name (at least 3 characters).",
  emailInvalid: "Please enter a valid email address (e.g., name@example.com).",
  dateInvalid: "Please select today or a future pickup date.",
  requestRequired: "Please select a request type from the dropdown menu.",
  itemsShort: "Please list at least one bakery item (minimum 5 characters)."
};

let savedFavorites = [];
let activeCategory = "all";

function loadFromStorage() {
  const storedItems = localStorage.getItem("nsb_saved_favorites");
  if (storedItems) {
    try {
      savedFavorites = JSON.parse(storedItems);
    } catch (e) {
      savedFavorites = [];
    }
  }
}

function saveToStorage() {
  localStorage.setItem("nsb_saved_favorites", JSON.stringify(savedFavorites));
}

function toggleFavorite(productId) {
  const index = savedFavorites.indexOf(productId);
  if (index === -1) {
    savedFavorites.push(productId);
  } else {
    savedFavorites.splice(index, 1);
  }
  saveToStorage();
  renderProducts(activeCategory);
  updateSavedSummary();
}

function clearSavedFavorites() {
  savedFavorites = [];
  saveToStorage();
  renderProducts(activeCategory);
  updateSavedSummary();
}

function updateSavedSummary() {
  const summaryBox = document.getElementById("saved-wishlist-box");
  if (!summaryBox) return;

  if (savedFavorites.length === 0) {
    summaryBox.innerHTML = "<p>No items saved yet. Click <strong>Save to Pre-Order List</strong> on any item below to build your list.</p>";
    return;
  }

  let totalEstimate = 0;
  const listItemsHtml = savedFavorites.map(id => {
    const item = bakeryProducts.find(p => p.id === id);
    if (!item) return "";
    totalEstimate += item.price;
    return `<li>${item.name} (${item.priceText})</li>`;
  }).join("");

  summaryBox.innerHTML = `
    <p><strong>Saved Pre-Order List (${savedFavorites.length} items):</strong></p>
    <ul class="saved-items-list">${listItemsHtml}</ul>
    <p class="estimate-text">Estimated Total: ~$${totalEstimate.toFixed(2)}</p>
    <div class="wishlist-actions">
      <a href="contact.html" class="btn-secondary">Proceed to Pre-Order Form &rarr;</a>
      <button type="button" id="clear-list-btn" class="btn-outline">Clear List</button>
    </div>
  `;

  const clearBtn = document.getElementById("clear-list-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearSavedFavorites);
  }
}

function renderProducts(category) {
  const container = document.getElementById("dynamic-products-container");
  if (!container) return;

  activeCategory = category;
  const filtered = category === "all"
    ? bakeryProducts
    : bakeryProducts.filter(item => item.category === category);

  container.innerHTML = filtered.map(product => {
    const isSaved = savedFavorites.includes(product.id);
    const btnText = isSaved ? "✓ Saved in List" : "+ Save to Pre-Order List";
    const btnClass = isSaved ? "btn-save saved" : "btn-save";

    return `
      <article class="product-card">
        <h3>${product.name}</h3>
        <img src="${product.image}" alt="${product.alt}">
        <p>${product.description}</p>
        <p><strong>Price range:</strong> ${product.priceText}</p>
        <button type="button" class="${btnClass}" data-id="${product.id}">${btnText}</button>
      </article>
    `;
  }).join("");

  container.querySelectorAll(".btn-save").forEach(btn => {
    btn.addEventListener("click", () => {
      toggleFavorite(btn.getAttribute("data-id"));
    });
  });
}

function initProductPage() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  if (filterButtons.length === 0) return;

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      renderProducts(btn.getAttribute("data-category"));
    });
  });

  renderProducts("all");
  updateSavedSummary();
}

function prefillContactForm() {
  const itemDetailsField = document.getElementById("item-details");
  const requestTypeField = document.getElementById("request-type");
  const nameField = document.getElementById("client-name");
  const emailField = document.getElementById("client-email");
  const storageBanner = document.getElementById("storage-restored-banner");

  if (!itemDetailsField) return;

  const savedName = localStorage.getItem("nsb_customer_name");
  const savedEmail = localStorage.getItem("nsb_customer_email");
  if (savedName && nameField) nameField.value = savedName;
  if (savedEmail && emailField) emailField.value = savedEmail;

  if (savedFavorites.length > 0 && itemDetailsField.value.trim() === "") {
    const names = savedFavorites.map(id => {
      const found = bakeryProducts.find(p => p.id === id);
      return found ? `1x ${found.name}` : "";
    }).filter(Boolean);

    itemDetailsField.value = names.join(", ");
    if (requestTypeField) requestTypeField.value = "preorder";

    if (storageBanner) {
      storageBanner.textContent = `Restored ${names.length} saved item(s) from your Products list!`;
      storageBanner.style.display = "block";
    }
  }
}

function showFieldError(inputEl, errorElId, message) {
  const errorEl = document.getElementById(errorElId);
  if (inputEl) inputEl.classList.add("input-error");
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.style.display = "block";
  }
}

function clearFieldError(inputEl, errorElId) {
  const errorEl = document.getElementById(errorElId);
  if (inputEl) inputEl.classList.remove("input-error");
  if (errorEl) {
    errorEl.textContent = "";
    errorEl.style.display = "none";
  }
}

function validateContactForm(event) {
  event.preventDefault();

  const nameInput = document.getElementById("client-name");
  const emailInput = document.getElementById("client-email");
  const dateInput = document.getElementById("pickup-date");
  const typeInput = document.getElementById("request-type");
  const itemsInput = document.getElementById("item-details");
  const formSuccessBox = document.getElementById("form-success-message");

  let isValid = true;
  if (formSuccessBox) formSuccessBox.style.display = "none";

  if (!nameInput || nameInput.value.trim().length < 3) {
    showFieldError(nameInput, "error-name", validationMessages.nameRequired);
    isValid = false;
  } else {
    clearFieldError(nameInput, "error-name");
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailInput || !emailPattern.test(emailInput.value.trim())) {
    showFieldError(emailInput, "error-email", validationMessages.emailInvalid);
    isValid = false;
  } else {
    clearFieldError(emailInput, "error-email");
  }

  const todayStr = new Date().toISOString().split("T")[0];
  if (!dateInput || !dateInput.value || dateInput.value < todayStr) {
    showFieldError(dateInput, "error-date", validationMessages.dateInvalid);
    isValid = false;
  } else {
    clearFieldError(dateInput, "error-date");
  }

  if (!typeInput || typeInput.value === "") {
    showFieldError(typeInput, "error-type", validationMessages.requestRequired);
    isValid = false;
  } else {
    clearFieldError(typeInput, "error-type");
  }

  if (!itemsInput || itemsInput.value.trim().length < 5) {
    showFieldError(itemsInput, "error-items", validationMessages.itemsShort);
    isValid = false;
  } else {
    clearFieldError(itemsInput, "error-items");
  }

  if (isValid) {
    localStorage.setItem("nsb_customer_name", nameInput.value.trim());
    localStorage.setItem("nsb_customer_email", emailInput.value.trim());

    if (formSuccessBox) {
      formSuccessBox.innerHTML = `<strong>Thank you, ${nameInput.value.trim()}!</strong> Your inquiry for pickup on <strong>${dateInput.value}</strong> has been received. We will confirm via <em>${emailInput.value.trim()}</em> shortly.`;
      formSuccessBox.style.display = "block";
    }
  }
}

function initContactPage() {
  const form = document.getElementById("preorder-form");
  if (!form) return;

  prefillContactForm();
  form.addEventListener("submit", validateContactForm);
}

document.addEventListener("DOMContentLoaded", () => {
  loadFromStorage();
  initProductPage();
  initContactPage();
});