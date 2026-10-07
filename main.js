import { products } from "./products.js";

const cardTemplate = document.querySelector("#product-card");

function applyBadges(card, badges) {
  const bestseller = card.querySelector("[data-badge='bestseller']");
  const sale = card.querySelector("[data-badge='sale']");
  const saleBadge = badges.find((badge) => badge.type === "sale");

  if (!badges.some((badge) => badge.type === "bestseller")) {
    bestseller.remove();
  }

  if (!saleBadge) {
    sale.remove();
  }
}

function applyStars(card, rating) {
  const fullStars = Math.floor(rating);
  card.querySelectorAll("[data-star]").forEach((star, index) => {
    star.classList.toggle("hidden", index >= fullStars);
  });
  card.querySelector("[data-half-star]").classList.toggle("hidden", rating - fullStars < 0.5);
  card.querySelector("[data-stars]").setAttribute("aria-label", `Rated ${rating} out of 5 stars`);
}

function applyTitle(card, product) {
  const title = card.querySelector("[data-title]");

  if (!product.shortName) {
    title.textContent = product.name;
    return;
  }

  card.querySelector("[data-short-name]").textContent = product.shortName;
  card.querySelector("[data-full-name]").textContent = product.name;
}

function createCard(product) {
  const card = cardTemplate.content.firstElementChild.cloneNode(true);
  const image = card.querySelector("[data-image]");
  const hoverImage = card.querySelector("[data-hover-image]");

  card.querySelector("[data-product-link]").href = `#${product.slug}`;
  image.src = product.image;
  image.alt = product.imageAlt;
  hoverImage.src = product.hoverImage;
  applyBadges(card, product.badges);
  applyTitle(card, product);
  applyStars(card, product.rating);
  card.querySelector("[data-reviews]").textContent = `${product.reviewCount.toLocaleString("en-US")} Reviews`;
  card.querySelector("[data-price]").textContent = `$${product.price.toFixed(2)}`;
  return card;
}

const previewCount = 4;

function createBatch(items) {
  const batch = document.createElement("div");
  const clip = document.createElement("div");
  const list = document.createElement("ul");
  batch.className = "more-batch";
  clip.className = "more-clip";
  list.className = "product-grid more-grid";
  list.append(...items.map(createCard));
  clip.append(list);
  batch.append(clip);
  return batch;
}

function renderProducts() {
  const preview = products.slice(0, previewCount);
  const rest = products.slice(previewCount);
  const batches = [];

  for (let index = 0; index < rest.length; index += previewCount) {
    batches.push(createBatch(rest.slice(index, index + previewCount)));
  }

  document.querySelector("#product-grid").replaceChildren(...preview.map(createCard));
  moreProducts.replaceChildren(...batches);
  scroller.querySelectorAll(".product-card").item(products.length - 1)?.classList.add("is-last");
  showMoreButton.hidden = batches.length === 0;
}

const showMoreButton = document.querySelector("#show-more");
const moreProducts = document.querySelector("#more-products");
const scroller = document.querySelector("#product-scroller");
const mobileQuery = window.matchMedia("(max-width: 1023px)");

function moreBatches() {
  return [...moreProducts.querySelectorAll(".more-batch")];
}

function syncMoreAccess() {
  const batches = moreBatches();
  const anyOpen = batches.some((batch) => batch.classList.contains("is-open"));
  const anyClosed = batches.some((batch) => !batch.classList.contains("is-open"));

  batches.forEach((batch) => {
    const hidden = mobileQuery.matches && !batch.classList.contains("is-open");
    batch.toggleAttribute("inert", hidden);
    batch.setAttribute("aria-hidden", hidden ? "true" : "false");
  });

  showMoreButton.textContent = anyClosed ? "Show More" : "Show Less";
  showMoreButton.setAttribute("aria-expanded", String(anyOpen));
}

renderProducts();

showMoreButton.addEventListener("click", () => {
  const batches = moreBatches();
  const nextBatch = batches.find((batch) => !batch.classList.contains("is-open"));

  if (nextBatch) {
    nextBatch.classList.add("is-open");
  } else {
    batches.forEach((batch) => batch.classList.remove("is-open"));
  }

  syncMoreAccess();
});

syncMoreAccess();
mobileQuery.addEventListener("change", syncMoreAccess);

let imageDragStartX = 0;
let imageDragStartScroll = 0;
let imageDragging = false;
let imageDragMoved = false;

scroller.addEventListener("pointerdown", (event) => {
  if (mobileQuery.matches || event.button !== 0 || !event.target.closest(".product-card")) {
    return;
  }

  imageDragging = true;
  imageDragMoved = false;
  imageDragStartX = event.clientX;
  imageDragStartScroll = scroller.scrollLeft;
  scroller.setPointerCapture(event.pointerId);
});

scroller.addEventListener("pointermove", (event) => {
  if (!imageDragging) {
    return;
  }

  const delta = event.clientX - imageDragStartX;

  if (Math.abs(delta) > 6) {
    imageDragMoved = true;
    scroller.classList.add("is-dragging");
  }

  if (imageDragMoved) {
    scroller.scrollLeft = imageDragStartScroll - delta;
  }
});

function endImageDrag() {
  if (!imageDragging) {
    return;
  }

  imageDragging = false;
  scroller.classList.remove("is-dragging");
}

scroller.addEventListener("pointerup", endImageDrag);
scroller.addEventListener("pointercancel", endImageDrag);
scroller.addEventListener(
  "click",
  (event) => {
    if (!imageDragMoved) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    imageDragMoved = false;
  },
  true
);
