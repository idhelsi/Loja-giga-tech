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
    const photos = product.photos && product.photos.length > 0 ? product.photos : [product.photo ?? ""];
  
    return `
      <div class="produto" id="produto-${product.id}">
        <div class="item">
          <div class="produto-slider">
            <div class="slider">
              ${photos
                .map(
                  (photo, index) =>
                    `<img src="${photo}" alt="${product.name}" class="slide ${
                      index === 0 ? "active" : ""
                    }" data-index="${index}">`
                )
                .join("")}
              ${photos.length > 1 ? `
                <button class="prev">&lt;</button>
                <button class="next">&gt;</button>
              ` : ''}
            </div>
          </div>
          <div class="produto-descricao">
            <h3 class="nome">${product.name}</h3>
            ${
              hasDiscount
                ? `<div class="text-xss">
                     <span class="oldPriceCard">R$&nbsp;${product.oldPrice!.toFixed(
                       2
                     ).replace(".",",")}</span>
                   </div>`
                : `<div class="mar"></div>`
            }
            <h1 class="preco">${product.price.toFixed(2).replace(".",",")} R$</h1>
            <div class="text-xs margin">
              À vista no PIX </br>
              <span class="text-xs">
                ou até 
                <b class="text-xs">
                  12x de R$ ${(product.price / 12).toFixed(2).replace(".",",")}
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
    const cartsummary = document.getElementById("summary") ; 
  
    if (!cartContainer || !cartsummary) return;
  
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
            ${
              item.oldPrice
                ? `<div class="text-xss">
                     <span class="oldPriceCard">R$&nbsp;${item.oldPrice.toFixed(2).replace(".",",")}</span>
                   </div>`
                : ""
            }
            <h1 class="preco">
              ${
                item.quantity > 1
                  ? `R$ ${totalPrice.replace(".", ",")}`
                  : `R$ ${item.price.toFixed(2).replace(".",",")}`
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
          <button class="clear remove-item" data-id="${item.id}">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="remove-item-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"></path>
            </svg>
          </button>
        </div>
      `;
    });
  
    cartsummary.style.display = "block";
    updateCartSummary();
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
          // console.log("Quantidade excede o estoque disponível!");
          return;
        }
  
        if (existingProduct) {
          existingProduct.quantity += 1;
        } else {
          cart.push({ ...product, quantity: 1 });
        }
  
        updateCart();
        updateCartSummary();
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
  
    // Calcula o total geral e cria um resumo dos itens no carrinho
    const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const cartDetails = cart.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      total: (item.price * item.quantity).toFixed(2),
    }));

    const itemDetails = cartDetails
    .map(
      (detail) =>
        `🛒 *Produto:* ${detail.name}\n📦 *Quantidade:* ${detail.quantity}\n💰 *Total:* R$ ${detail.total.replace(".", ",")}\n`
    )
    .join("\n----------------------\n");

  // Adiciona o valor total ao final da mensagem
  const valorTotal = `\n💵 *Valor total da compra:* R$ ${totalAmount.toFixed(2).replace(".", ",")}`;

  // Envia a mensagem completa via WhatsApp
  enviarWhatsApp(itemDetails + valorTotal);

    cart = [];
    updateCart();
  };
  
  document.getElementById("finalize-cart")?.addEventListener("click", finalizeCart)

  function enviarWhatsApp(product: string) {
    // Criar a mensagem com os detalhes dos produtos
    // const mensagem = produtos.map(produto => {
    //     return `🛒 *Produto:* ${produto.nome}\n💵 *Preço:* ${produto.preco}\n📦 *Estoque:* ${produto.estoque}\n🖼️ *Imagem:* ${produto.imagem}\n`;
    // }).join("\n----------------------\n");
    const numeroWhatsApp = "+5595991202940"
    const mensagem = product

    // Criar o link do WhatsApp
    const link = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;

    // Abrir o link em uma nova aba
    window.open(link, '_blank');
  }

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
    const iconcart = document.querySelector(".ic") as HTMLElement;
  
    if (!cartIcon || !cartContainer) return;
  
    cartIcon.addEventListener("click", () => {
      const isVisible = cartContainer.style.display === "flex";
      cartContainer.style.display = isVisible ? "none" : "flex";
    });

    iconcart.addEventListener("click", () => {
      let isVisi = cartContainer.style.display === "flex";
      cartContainer.style.display = isVisi ? "none" : "flex"
    })
  };


  const clear = (): void => {
    const cartContainer = document.getElementById("cart-items");
  
    cartContainer?.addEventListener("click", (event) => {
      // Verifica se o clique foi no botão ou em seus filhos
      const button = (event.target as HTMLElement).closest(".clear");
      if (!button) return;
  
      // Obtém o ID do produto a partir do botão clicado
      const productId = parseInt(button.getAttribute("data-id") ?? "0", 10);
  
      if (!productId) {
        console.error("Produto não encontrado para remoção!");
        return;
      }
  
      // Remove o item do array `cart`
      cart = cart.filter((item) => item.id !== productId);
  
      // Atualiza o carrinho
      updateCart();
    });
  };
  
  const updateCartSummary = (): void => {
    const summaryElement = document.querySelector<HTMLElement>(".summary-value");
  
    if (!summaryElement) {
      console.error("Elemento com a classe 'summary-value' não encontrado.");
      return;
    }
   
    const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    
    const formattedTotal = `R$ ${total.toFixed(2).replace(".", ",")}`

    summaryElement.textContent = formattedTotal;
  };
  
// Evento DOMContentLoaded
document.addEventListener("DOMContentLoaded", (): void => {
    loadProducts(); 
    setupSearch();
    toggleCartVisibility();
    clear();
  });

