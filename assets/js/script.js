"use strict";
let cart = [];
const normalizeText = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const createProductCard = (product) => {
    const hasDiscount = product.oldPrice && product.oldPrice > product.price;
    return `
      <div class="produto" id="produto-${product.id}">
        <div class="item">
          <div class="produto-slider">
            ${product.photos && product.photos.length > 1
        ? `<div class="slider">
                     ${product.photos
            .map((photo, index) => `<img src="${photo}" alt="${product.name}" class="slide ${index === 0 ? "active" : ""}" data-index="${index}">`)
            .join("")}
                     <button class="prev">&lt;</button>
                     <button class="next">&gt;</button>
                   </div>`
        : `<img src="${product.photo ?? ""}" alt="${product.name}">`}
          </div>
          <div class="produto-descricao">
            <h3 class="nome">${product.name}</h3>
            ${hasDiscount
        ? `<div class="text-xss">
                     <span class="oldPriceCard">R$&nbsp;${product.oldPrice.toFixed(2)}</span>
                   </div>`
        : `<div class="mar"></div>`}
            <h1 class="preco">${product.price.toFixed(2)} R$</h1>
            <div class="text-xs margin">
              À vista no PIX </br>
              <span class="text-xs">
                ou até 
                <b class="text-xs">
                  12x de R$ ${(product.price / 12).toFixed(2)}
                </b>
              </span>
            </div>
            <button 
              class="add-to-cart" 
              data-id="${product.id}" 
              ${product.stock === 0
        ? 'disabled style="background-color: gray; cursor: not-allowed;"'
        : ""}
            >
              ${product.stock === 0
        ? "Indisponível"
        : "Adicionar ao Carrinho"}
            </button>
          </div>
        </div>
      </div>
    `;
};
const updateProductList = (products, container) => {
    container.innerHTML = "";
    if (products.length === 0) {
        container.innerHTML = "<p>Nenhum produto encontrado.</p>";
    }
    else {
        products.forEach((product) => {
            container.innerHTML += createProductCard(product);
        });
    }
    activateSliders();
    setupAddToCartButtons();
};
const updateCart = () => {
    const cartContainer = document.getElementById("cart-items");
    const cartsummary = document.getElementById("summary");
    if (!cartContainer || !cartsummary)
        return;
    cartContainer.innerHTML = "";
    if (cart.length === 0) {
        cartContainer.innerHTML = "<p>Seu carrinho está vazio.</p>";
        cartsummary.style.display = "none";
        return;
    }
    cart.forEach((item) => {
        const totalPrice = (item.price * item.quantity).toFixed(2);
        cartContainer.innerHTML += `
        <div class="cart-item">
          <img src="${item.photo ?? ""}" alt="${item.name}">
          <div class="cart-item-details">
            <h3 class="nome">${item.name}</h3>
            ${item.oldPrice
            ? `<div class="text-xss">
                     <span class="oldPriceCard">R$&nbsp;${item.oldPrice.toFixed(2)}</span>
                   </div>`
            : ""}
            <h1 class="preco">
              ${item.quantity > 1
            ? `R$ ${totalPrice}`
            : `R$ ${item.price.toFixed(2)}`}
            </h1>
          </div>
          <input 
            type="number" 
            min="1" 
            max="${item.stock}" 
            value="${item.quantity}" 
            data-id="${item.id}" 
            class="cart-quantity"
            readonly
          >
          <button class="clear remove-item" data-id="${item.id}">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="remove-item-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"></path>
            </svg>
          </button>
        </div>
      `;
    });
    cartsummary.style.display = "block";
};
const addToCart = (productId) => {
    fetch("./produtos.json")
        .then((response) => {
        if (!response.ok) {
            throw new Error(`Erro ao carregar produtos: ${response.status}`);
        }
        return response.json();
    })
        .then((products) => {
        const product = products.find((item) => item.id === productId);
        if (!product) {
            alert("Produto não encontrado!");
            return;
        }
        const existingProduct = cart.find((item) => item.id === productId);
        const currentQuantity = existingProduct ? existingProduct.quantity : 0;
        if (currentQuantity + 1 > product.stock) {
            return;
        }
        if (existingProduct) {
            existingProduct.quantity += 1;
        }
        else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCart();
    })
        .catch((error) => console.error("Erro ao adicionar ao carrinho:", error));
};
function setupAddToCartButtons() {
    document
        .querySelectorAll(".add-to-cart")
        .forEach((button) => {
        button.addEventListener("click", () => {
            if (button.disabled)
                return;
            const productId = parseInt(button.getAttribute("data-id") ?? "0", 10);
            if (productId)
                addToCart(productId);
        });
    });
}
const finalizeCart = () => {
    if (cart.length === 0)
        return alert("Seu carrinho está vazio!");
    console.log("Produtos no carrinho:", cart);
    alert("Compra finalizada! Confira os detalhes no console.");
    cart = [];
    updateCart();
};
document.getElementById("finalize-cart")?.addEventListener("click", finalizeCart);
async function loadProducts(filterText = "") {
    try {
        const response = await fetch("./produtos.json");
        if (!response.ok)
            throw new Error(`Erro ao carregar produtos: ${response.status}`);
        const products = await response.json();
        const produtosContainer = document.querySelector(".produtos");
        if (!produtosContainer)
            return;
        const filteredProducts = filterText
            ? products.filter((product) => normalizeText(product.name).includes(normalizeText(filterText)))
            : products;
        updateProductList(filteredProducts, produtosContainer);
    }
    catch (error) {
        console.error("Erro ao carregar os produtos:", error);
    }
}
function activateSliders() {
    document.querySelectorAll(".slider").forEach((slider) => {
        const slides = slider.querySelectorAll(".slide");
        const prev = slider.querySelector(".prev");
        const next = slider.querySelector(".next");
        let currentIndex = 0;
        if (!prev || !next || slides.length === 0)
            return;
        const updateSlides = () => {
            slides.forEach((slide, index) => {
                slide.classList.toggle("active", index === currentIndex);
            });
        };
        prev.addEventListener("click", () => {
            currentIndex = (currentIndex - 1 + slides.length) % slides.length;
            updateSlides();
        });
        next.addEventListener("click", () => {
            currentIndex = (currentIndex + 1) % slides.length;
            updateSlides();
        });
    });
}
function setupSearch() {
    const searchInput = document.querySelector("input[name='search']");
    const searchButton = document.querySelector("form button");
    if (!searchInput || !searchButton)
        return;
    searchInput.addEventListener("input", (event) => {
        const searchValue = event.target.value.trim();
        if (searchValue === "")
            loadProducts();
    });
    searchButton.addEventListener("click", (event) => {
        event.preventDefault();
        const searchValue = searchInput.value.trim();
        if (searchValue !== "")
            loadProducts(searchValue);
    });
}
const toggleCartVisibility = () => {
    const cartIcon = document.querySelector(".cart-i");
    const cartContainer = document.querySelector(".cart");
    const iconcart = document.querySelector(".ic");
    if (!cartIcon || !cartContainer)
        return;
    cartIcon.addEventListener("click", () => {
        const isVisible = cartContainer.style.display === "flex";
        cartContainer.style.display = isVisible ? "none" : "flex";
    });
    iconcart.addEventListener("click", () => {
        let isVisi = cartContainer.style.display === "flex";
        cartContainer.style.display = isVisi ? "none" : "flex";
    });
};
const clear = () => {
    const cartContainer = document.getElementById("cart-items");
    cartContainer?.addEventListener("click", (event) => {
        const button = event.target.closest(".clear");
        if (!button)
            return;
        const productId = parseInt(button.getAttribute("data-id") ?? "0", 10);
        if (!productId) {
            console.error("Produto não encontrado para remoção!");
            return;
        }
        cart = cart.filter((item) => item.id !== productId);
        updateCart();
    });
};
document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    setupSearch();
    toggleCartVisibility();
    clear();
});
