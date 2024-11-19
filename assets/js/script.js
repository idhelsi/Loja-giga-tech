// // --- Funções Auxiliares ---
// // Normaliza texto removendo acentos e transformando em minúsculas
// const normalizeText = text => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// // Cria o HTML de um cartão de produto
// const createProductCard = product => {
//   const hasDiscount = product.oldPrice && parseFloat(product.oldPrice) > parseFloat(product.price);

//   return `
//     <div class="produto" id="produto-${product.id}">
//       <a href="#">
//         <div class="produto-slider">
//           ${
//             product.photos && product.photos.length > 1
//               ? `<div class="slider">
//                    ${product.photos
//                      .map(
//                        (photo, index) =>
//                          `<img src="${photo}" alt="${product.name}" class="slide ${index === 0 ? 'active' : ''}" data-index="${index}">`
//                      )
//                      .join("")}
//                    <button class="prev">&lt;</button>
//                    <button class="next">&gt;</button>
//                  </div>`
//               : `<img src="${product.photo}" alt="${product.name}">`
//           }
//         </div>
//         <div class="produto-descricao">
//           <h3 class="nome">${product.name}</h3>
//           ${
//             hasDiscount
//               ? `<div class="text-xss">
//                    <span class="oldPriceCard">
//                      R$&nbsp;${parseFloat(product.oldPrice).toFixed(2)}
//                    </span>
//                  </div>`
//               : ""
//           }
//           <h1 class="preco">${parseFloat(product.price).toFixed(2)} R$</h1>
//           <div class="text-xs margin">
//             À vista no PIX </br>
//             <span class="text-xs">
//               ou até 
//               <b class="text-xs">
//                 12x de R$ ${(parseFloat(product.price) / 12).toFixed(2)}
//               </b>
//             </span>
//           </div>
//           <button class="add-to-cart" data-id="${product.id}">
//             Adicionar ao Carrinho
//           </button>
//         </div>
//       </a>
//     </div>
//   `;
// };

// // Atualiza o conteúdo da lista de produtos
// const updateProductList = (products, container) => {
//   container.innerHTML = "";

//   if (products.length === 0) {
//     container.innerHTML = "<p>Nenhum produto encontrado.</p>";
//   } else {
//     products.forEach(product => {
//       container.innerHTML += createProductCard(product);
//     });
//   }

//   activateSliders(); // Ativa os sliders após carregar os produtos
//   setupAddToCartButtons(); // Configura os botões de adicionar ao carrinho
// };

// // --- Funções Principais ---
// // Carrega os produtos do arquivo JSON (com filtro opcional)
// async function loadProducts(filterText = "") {
//   try {
//     const response = await fetch("./produtos.json");
//     if (!response.ok) throw new Error(`Erro ao carregar produtos: ${response.status}`);

//     const products = await response.json();
//     const produtosContainer = document.querySelector(".produtos");

//     // Filtra os produtos pelo texto da pesquisa
//     const filteredProducts = filterText
//       ? products.filter(product =>
//           normalizeText(product.name).includes(normalizeText(filterText))
//         )
//       : products;

//     updateProductList(filteredProducts, produtosContainer);
//   } catch (error) {
//     console.error("Erro ao carregar os produtos:", error);
//   }
// }

// // Ativa os sliders dos produtos
// function activateSliders() {
//   document.querySelectorAll(".slider").forEach(slider => {
//     const slides = slider.querySelectorAll(".slide");
//     const prev = slider.querySelector(".prev");
//     const next = slider.querySelector(".next");
//     let currentIndex = 0;

//     if (!prev || !next || slides.length === 0) return;

//     const updateSlides = () => {
//       slides.forEach((slide, index) => {
//         slide.classList.toggle("active", index === currentIndex);
//       });
//     };

//     prev.addEventListener("click", () => {
//       currentIndex = (currentIndex - 1 + slides.length) % slides.length;
//       updateSlides();
//     });

//     next.addEventListener("click", () => {
//       currentIndex = (currentIndex + 1) % slides.length;
//       updateSlides();
//     });
//   });
// }

// // Configura os botões de adicionar ao carrinho
// function setupAddToCartButtons() {
//   document.querySelectorAll(".add-to-cart").forEach(button => {
//     button.addEventListener("click", () => {
//       const productId = button.getAttribute("data-id");
//       alert(`Produto ${productId} adicionado ao carrinho!`);
//       // Aqui você pode adicionar lógica para atualizar o carrinho de compras
//     });
//   });
// }

// // --- Manipuladores de Eventos ---
// function setupSearch() {
//   const searchInput = document.querySelector("input[name='search']");
//   const searchButton = document.querySelector("form button");

//   // Atualiza a lista de produtos ao limpar o campo de pesquisa
//   searchInput.addEventListener("input", event => {
//     const searchValue = event.target.value.trim();
//     if (searchValue === "") loadProducts(); // Recarrega todos os produtos
//   });

//   // Filtra os produtos apenas ao clicar no botão de pesquisa
//   searchButton.addEventListener("click", event => {
//     event.preventDefault(); // Evita o envio do formulário padrão
//     const searchValue = searchInput.value.trim();
//     if (searchValue !== "") loadProducts(searchValue); // Carrega produtos filtrados
//   });
// }

// // --- Inicialização ---
// document.addEventListener("DOMContentLoaded", () => {
//   loadProducts(); // Carrega todos os produtos inicialmente
//   setupSearch(); // Configura a pesquisa
// });



// --- Funções Auxiliares ---
// Normaliza texto removendo acentos e transformando em minúsculas
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
                   <span class="oldPriceCard">
                     R$&nbsp;${parseFloat(product.oldPrice).toFixed(2)}
                   </span>
                 </div>`
              : ""
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
          <button class="add-to-cart" data-id="${product.id}">
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  `;
};

// Atualiza o conteúdo da lista de produtos
const updateProductList = (products, container) => {
  container.innerHTML = "";

  if (products.length === 0) {
    container.innerHTML = "<p>Nenhum produto encontrado.</p>";
  } else {
    products.forEach(product => {
      container.innerHTML += createProductCard(product);
    });
  }

  activateSliders(); // Ativa os sliders após carregar os produtos
  setupAddToCartButtons(); // Configura os botões de adicionar ao carrinho
};

// --- Funções Principais ---
// Carrega os produtos do arquivo JSON (com filtro opcional)
async function loadProducts(filterText = "") {
  try {
    const response = await fetch("./produtos.json");
    if (!response.ok) throw new Error(`Erro ao carregar produtos: ${response.status}`);

    const products = await response.json();
    const produtosContainer = document.querySelector(".produtos");

    // Filtra os produtos pelo texto da pesquisa
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

// Configura os botões de adicionar ao carrinho
function setupAddToCartButtons() {
  document.querySelectorAll(".add-to-cart").forEach(button => {
    button.addEventListener("click", () => {
      const productId = button.getAttribute("data-id");
      alert(`Produto ${productId} adicionado ao carrinho!`);
      // Aqui você pode adicionar lógica para atualizar o carrinho de compras
    });
  });
}

// --- Manipuladores de Eventos ---
function setupSearch() {
  const searchInput = document.querySelector("input[name='search']");
  const searchButton = document.querySelector("form button");

  // Atualiza a lista de produtos ao limpar o campo de pesquisa
  searchInput.addEventListener("input", event => {
    const searchValue = event.target.value.trim();
    if (searchValue === "") loadProducts(); // Recarrega todos os produtos
  });

  // Filtra os produtos apenas ao clicar no botão de pesquisa
  searchButton.addEventListener("click", event => {
    event.preventDefault(); // Evita o envio do formulário padrão
    const searchValue = searchInput.value.trim();
    if (searchValue !== "") loadProducts(searchValue); // Carrega produtos filtrados
  });
}

// --- Inicialização ---
document.addEventListener("DOMContentLoaded", () => {
  loadProducts(); // Carrega todos os produtos inicialmente
  setupSearch(); // Configura a pesquisa
});
