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

document.querySelector("#product-grid").replaceChildren(...products.map(createCard));
