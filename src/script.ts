type Product = {
    id: number;
    name: string;
    price: number;
    oldPrice?: number;
    stock: number;
    photos?: string[];
    photo?: string;
  };
  
  type CartItem = Product & { quantity: number };
  
  let cart: CartItem[] = [];
  
  // --- Funções Auxiliares ---
  const normalizeText = (text: string): string =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  
  // Cria o HTML de um cartão de produto
  const createProductCard = (product: Product): string => {
    const hasDiscount = product.oldPrice && product.oldPrice > product.price;
  
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
                           `<img src="${photo}" alt="${product.name}" class="slide ${
                             index === 0 ? "active" : ""
                           }" data-index="${index}">`
                       )
                       .join("")}
                     <button class="prev">&lt;</button>
                     <button class="next">&gt;</button>
                   </div>`
                : `<img src="${product.photo ?? ""}" alt="${product.name}">`
            }
          </div>
          <div class="produto-descricao">
            <h3 class="nome">${product.name}</h3>
            ${
              hasDiscount
                ? `<div class="text-xss">
                     <span class="oldPriceCard">R$&nbsp;${product.oldPrice!.toFixed(
                       2
                     )}</span>
                   </div>`
                : `<div class="mar"></div>`
            }
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
              ${
                product.stock === 0
                  ? 'disabled style="background-color: gray; cursor: not-allowed;"'
                  : ""
              }
            >
              ${
                product.stock === 0
                  ? "Indisponível"
                  : "Adicionar ao Carrinho"
              }
            </button>
          </div>
        </div>
      </div>
    `;
  };
  
  const updateProductList = (
    products: Product[],
    container: HTMLElement
  ): void => {
    container.innerHTML = "";
  
    if (products.length === 0) {
      container.innerHTML = "<p>Nenhum produto encontrado.</p>";
    } else {
      products.forEach((product) => {
        container.innerHTML += createProductCard(product);
      });
    }
  
    activateSliders();
    setupAddToCartButtons();
  };
  
  // --- Funções do Carrinho ---
  const updateCart = (): void => {
    const cartContainer = document.getElementById("cart-items");
    const finalizeButton = document.getElementById("finalize-cart");
  
    if (!cartContainer || !finalizeButton) return;
  
    cartContainer.innerHTML = "";
  
    if (cart.length === 0) {
      cartContainer.innerHTML = "<p>Seu carrinho está vazio.</p>";
      finalizeButton.style.display = "none";
      return;
    }
  
    cart.forEach((item) => {
      const totalPrice = (item.price * item.quantity).toFixed(2);
      cartContainer.innerHTML += `
        <div class="cart-item">
          <img src="${item.photo ?? ""}" alt="${item.name}">
          <div class="cart-item-details">
            <h3 class="nome">${item.name}</h3>
            ${
              item.oldPrice
                ? `<div class="text-xss">
                     <span class="oldPriceCard">R$&nbsp;${item.oldPrice.toFixed(2)}</span>
                   </div>`
                : ""
            }
            <h1 class="preco">
              ${
                item.quantity > 1
                  ? `R$ ${totalPrice}`
                  : `R$ ${item.price.toFixed(2)}`
              }
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
          <button class="clear" data-id="${item.id}">remover</button>
        </div>
      `;
    });
  
    finalizeButton.style.display = "block";
  };
  
  const addToCart = (productId: number): void => {
    fetch("./produtos.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erro ao carregar produtos: ${response.status}`);
        }
        return response.json();
      })
      .then((products: Product[]) => {
        const product = products.find((item) => item.id === productId);
  
        if (!product) {
          alert("Produto não encontrado!");
          return;
        }
  
        const existingProduct = cart.find((item) => item.id === productId);
        const currentQuantity = existingProduct ? existingProduct.quantity : 0;
  
        if (currentQuantity + 1 > product.stock) {
          console.log("Quantidade excede o estoque disponível!");
          return;
        }
  
        if (existingProduct) {
          existingProduct.quantity += 1;
        } else {
          cart.push({ ...product, quantity: 1 });
        }
  
        updateCart();
      })
      .catch((error) => console.error("Erro ao adicionar ao carrinho:", error));
  };
  
  function setupAddToCartButtons(): void {
    document
      .querySelectorAll<HTMLButtonElement>(".add-to-cart")
      .forEach((button) => {
        button.addEventListener("click", () => {
          if (button.disabled) return;
          const productId = parseInt(button.getAttribute("data-id") ?? "0", 10);
          if (productId) addToCart(productId);
        });
      });
  }
  
  const finalizeCart = (): void => {
    if (cart.length === 0) return alert("Seu carrinho está vazio!");
  
    console.log("Produtos no carrinho:", cart);
  
    alert("Compra finalizada! Confira os detalhes no console.");
    cart = [];
    updateCart();
  };
  
  document.getElementById("finalize-cart")?.addEventListener("click", finalizeCart);
  
  async function loadProducts(filterText: string = ""): Promise<void> {
    try {
      const response = await fetch("./produtos.json");
      if (!response.ok)
        throw new Error(`Erro ao carregar produtos: ${response.status}`);
  
      const products: Product[] = await response.json();
      const produtosContainer = document.querySelector<HTMLElement>(".produtos");
  
      
      if (!produtosContainer) return;
  
      const filteredProducts = filterText
        ? products.filter((product) =>
            normalizeText(product.name).includes(normalizeText(filterText))
          )
        : products;

        updateProductList(filteredProducts, produtosContainer);
    } catch (error) {
      console.error("Erro ao carregar os produtos:", error);
    }
  }
  
  function activateSliders(): void {
    document.querySelectorAll<HTMLElement>(".slider").forEach((slider) => {
      const slides = slider.querySelectorAll<HTMLElement>(".slide");
      const prev = slider.querySelector<HTMLElement>(".prev");
      const next = slider.querySelector<HTMLElement>(".next");
      let currentIndex = 0;
  
      if (!prev || !next || slides.length === 0) return;
  
      const updateSlides = (): void => {
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
  
  function setupSearch(): void {
    const searchInput = document.querySelector<HTMLInputElement>(
      "input[name='search']"
    );
    const searchButton = document.querySelector<HTMLButtonElement>("form button");
  
    if (!searchInput || !searchButton) return;
  
    searchInput.addEventListener("input", (event) => {
      const searchValue = (event.target as HTMLInputElement).value.trim();
      if (searchValue === "") loadProducts();
    });
  
    searchButton.addEventListener("click", (event) => {
      event.preventDefault();
      const searchValue = searchInput.value.trim();
      if (searchValue !== "") loadProducts(searchValue);
    });
  }
  
  const toggleCartVisibility = (): void => {
    const cartIcon = document.querySelector<HTMLElement>(".cart-i");
    const cartContainer = document.querySelector<HTMLElement>(".cart");
  
    if (!cartIcon || !cartContainer) return;
  
    cartIcon.addEventListener("click", () => {
      const isVisible = cartContainer.style.display === "block";
      cartContainer.style.display = isVisible ? "none" : "block";
    });
  };

  const clear = () => {
    const cartContainer = document.getElementById("cart-items");
  
    cartContainer?.addEventListener("click", (event) => {
      if ((event.target as HTMLElement).classList.contains("clear")) {
        const button = event.target as HTMLElement;
        const productId = parseInt(
          button.closest(".cart-item")?.querySelector(".cart-quantity")?.getAttribute("data-id") || "0",
          10
        );
  
        // Remove o item do array `cart`
        cart = cart.filter((item) => item.id !== productId);
  
        // Atualiza o carrinho
        updateCart();
      }
    });
  };
  
  
//   toggleCartVisibility();
//   setupSearch();
//   loadProducts();
//   clear()

// Evento DOMContentLoaded
document.addEventListener("DOMContentLoaded", (): void => {
    loadProducts(); 
    setupSearch();
    toggleCartVisibility();
    clear();
  });
