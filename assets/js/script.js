let cart = []; 

// --- Funções Auxiliares ---
const normalizeText = text => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Cria o HTML de um cartão de produto
const createProductCard = product => {
  const hasDiscount = product.oldPrice && parseFloat(product.oldPrice) > parseFloat(product.price);

  return `
    <div class="produto" id="produto-${product.id}">
      <div class="item">
        <div class="produto-slider">
          ${
            product.photos && product.photos.length > 1
              ? `<div class="slider">
                   ${product.photos
                     .map(
                       (photo, index) =>
                         `<img src="${photo}" alt="${product.name}" class="slide ${index === 0 ? 'active' : ''}" data-index="${index}">`
                     )
                     .join("")}
                   <button class="prev">&lt;</button>
                   <button class="next">&gt;</button>
                 </div>`
              : `<img src="${product.photo}" alt="${product.name}">`
          }
        </div>
        <div class="produto-descricao">
          <h3 class="nome">${product.name}</h3>
          ${
            hasDiscount
              ? `<div class="text-xss">
                   <span class="oldPriceCard">R$&nbsp;${parseFloat(product.oldPrice).toFixed(2)}</span>
                 </div>`
              : `<div class="mar"></div>`
          }
          <h1 class="preco">${parseFloat(product.price).toFixed(2)} R$</h1>
          <div class="text-xs margin">
            À vista no PIX </br>
            <span class="text-xs">
              ou até 
              <b class="text-xs">
                12x de R$ ${(parseFloat(product.price) / 12).toFixed(2)}
              </b>
            </span>
          </div>
          <button 
            class="add-to-cart" 
            data-id="${product.id}" 
            ${product.stock === 0 ? 'disabled style="background-color: gray; cursor: not-allowed;"' : ""}
          >
            ${product.stock === 0 ? "Indisponível" : "Adicionar ao Carrinho"}
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
  } else {
    products.forEach(product => {
      container.innerHTML += createProductCard(product);
    });
  }

  activateSliders(); 
  setupAddToCartButtons();
};

// --- Funções do Carrinho ---
const updateCart = () => {
  const cartContainer = document.getElementById("cart-items");
  const finalizeButton = document.getElementById("finalize-cart");

  cartContainer.innerHTML = "";

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>Seu carrinho está vazio.</p>";
    finalizeButton.style.display = "none";
    return;
  }

  cart.forEach(item => {
    cartContainer.innerHTML += `
      <div class="cart-item">
        <img src="${item.photo}" alt="${item.name}">
        <div class="cart-item-details">
          <h3 class="nome">${item.name}</h3>
          ${
            item.oldPrice
              ? `<div class="text-xss">
                   <span class="oldPriceCard">R$&nbsp;${parseFloat(item.oldPrice).toFixed(2)}</span>
                 </div>`
              : ""
          }
          <h1 class="preco">${parseFloat(item.price).toFixed(2)} R$</h1>
         
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
        <button class="clear">remover</button>
      </div>
    `;
  });

  finalizeButton.style.display = "block";
};

const addToCart = productId => {
  fetch("./produtos.json")
    .then(response => response.json())
    .then(products => {
      const product = products.find(item => item.id === productId);

      if (!product) {
        alert("Produto não encontrado!");
        return;
      }

      // Verifica se o produto já está no carrinho
      const existingProduct = cart.find(item => item.id === productId);
      const currentQuantity = existingProduct ? existingProduct.quantity : 0;

      if (currentQuantity + 1 > product.stock) {
        alert("Quantidade excede o estoque disponível!");
        return;
      }

      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        cart.push({ ...product, quantity: 1 }); 
      }

      updateCart();
    })
    .catch(error => console.error("Erro ao adicionar ao carrinho:", error));
};

// Configura os botões de adicionar ao carrinho
function setupAddToCartButtons() {
  document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", () => {
      if (button.disabled) return; // Ignora botões desativados
      const productId = parseInt(button.getAttribute("data-id"), 10);
      addToCart(productId);
    });
  });
}

// Finaliza a compra
const finalizeCart = () => {
  if (cart.length === 0) return alert("Seu carrinho está vazio!");

  console.log("Produtos no carrinho:", cart);

  alert("Compra finalizada! Confira os detalhes no console.");
  cart = []; // Limpa o carrinho após finalizar
  updateCart();
};

// Inicializa o botão de finalizar compra
document.getElementById("finalize-cart").addEventListener("click", finalizeCart);


// --- Funções Principais ---
async function loadProducts(filterText = "") {
  try {
    const response = await fetch("./produtos.json");
    if (!response.ok) throw new Error(`Erro ao carregar produtos: ${response.status}`);

    const products = await response.json();
    const produtosContainer = document.querySelector(".produtos");

    const filteredProducts = filterText
      ? products.filter(product =>
          normalizeText(product.name).includes(normalizeText(filterText))
        )
      : products;

    updateProductList(filteredProducts, produtosContainer);
  } catch (error) {
    console.error("Erro ao carregar os produtos:", error);
  }
}

// Ativa os sliders dos produtos
function activateSliders() {
  document.querySelectorAll(".slider").forEach(slider => {
    const slides = slider.querySelectorAll(".slide");
    const prev = slider.querySelector(".prev");
    const next = slider.querySelector(".next");
    let currentIndex = 0;

    if (!prev || !next || slides.length === 0) return;

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

// Configura a pesquisa de produtos
function setupSearch() {
  const searchInput = document.querySelector("input[name='search']");
  const searchButton = document.querySelector("form button");

  searchInput.addEventListener("input", event => {
    const searchValue = event.target.value.trim();
    if (searchValue === "") loadProducts(); 
  });

  searchButton.addEventListener("click", event => {
    event.preventDefault();
    const searchValue = searchInput.value.trim();
    if (searchValue !== "") loadProducts(searchValue);
  });
}

// Alterna a visibilidade do carrinho
const toggleCartVisibility = () => {
  const cartIcon = document.querySelector(".cart-i");
  const cartContainer = document.querySelector(".cart");

  if (!cartIcon || !cartContainer) return;

  cartIcon.addEventListener("click", () => {
    const isVisible = cartContainer.style.display === "block";
    cartContainer.style.display = isVisible ? "none" : "block";
  });
};

const clear = () => {
  const cartContainer = document.getElementById("cart-items");

  cartContainer.addEventListener("click", event => {
    if (event.target.classList.contains("clear")) {
      const button = event.target;
      const productId = parseInt(button.closest(".cart-item").querySelector(".cart-quantity").getAttribute("data-id"), 10);

      // Remove o item do array `cart`
      cart = cart.filter(item => item.id !== productId);

      // Atualiza o carrinho
      updateCart();
    }
  });
};

// --- Inicialização ---
document.addEventListener("DOMContentLoaded", () => {
  loadProducts(); 
  setupSearch();
  toggleCartVisibility();
  clear();
});
