// --- Funções Auxiliares ---
// Normaliza texto removendo acentos e transformando em minúsculas
const normalizeText = text => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Cria o HTML de um cartão de produto
const createProductCard = product => {
  const hasDiscount = product.oldPrice && parseFloat(product.oldPrice) > parseFloat(product.price);

  return `
    <div class="produto" id="produto-${product.id}">
      <a href="#">
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
        </div>
      </a>
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

// Garante que o menu seja alternado ao clicar no botão
function toggleMenu() {
  const menuButton = document.querySelector('.header-rigth .menu-open');
  const menu = document.querySelector('.header-rigth nav');

  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const isMenuVisible = menu.style.display === "block";
      menu.style.display = isMenuVisible ? "none" : "block";

      if (!isMenuVisible) {
        menuButton.classList.add('menu-active');
      } else {
        menuButton.classList.remove('menu-active');
      }
    });
  }
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
  toggleMenu(); // Configura o menu
  setupSearch(); // Configura a pesquisa
});



// // Função para carregar os produtos do arquivo JSON (com filtro opcional)
// async function loadProducts(filterText = "") {
//   try {
//     const response = await fetch("./produtos.json");

//     if (!response.ok) {
//       throw new Error(`Erro ao carregar produtos: ${response.status}`);
//     }

//     const products = await response.json();
//     const produtos = document.querySelector(".produtos");
//     produtos.innerHTML = "";

//     // Função para normalizar texto (remover acentos e transformar em minúsculas)
//     const normalizeText = text => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

//     // Filtra os produtos pelo texto da pesquisa (ignora maiúsculas/minúsculas e acentos)
//     const filteredProducts = filterText
//       ? products.filter(product =>
//           normalizeText(product.name).includes(normalizeText(filterText))
//         )
//       : products;

//     filteredProducts.forEach(product => {
//       const hasDiscount = product.oldPrice && parseFloat(product.oldPrice) > parseFloat(product.price);

//       const productCard = `
//       <div class="produto" id="produto-${product.id}">
//         <a href="#">
//           <div class="produto-slider">
//             ${
//               product.photos && product.photos.length > 1
//                 ? `<div class="slider">
//                      ${product.photos
//                        .map(
//                          (photo, index) =>
//                            `<img src="${photo}" alt="${product.name}" class="slide ${index === 0 ? 'active' : ''}" data-index="${index}">`
//                        )
//                        .join("")}
//                      <button class="prev">&lt;</button>
//                      <button class="next">&gt;</button>
//                    </div>`
//                 : `<img src="${product.photo}" alt="${product.name}">`
//             }
//           </div>
//           <div class="produto-descricao">
//             <h3 class="nome">${product.name}</h3>
//             ${
//               hasDiscount
//                 ? `<div class="text-xss">
//                      <span class="oldPriceCard">
//                        R$&nbsp;${parseFloat(product.oldPrice).toFixed(2)}
//                      </span>
//                    </div>`
//                 : ""
//             }
//             <h1 class="preco">${parseFloat(product.price).toFixed(2)} R$</h1>
//             <div class="text-xs margin">
//               À vista no PIX </br>
//               <span class="text-xs">
//                 ou até 
//                 <b class="text-xs">
//                   12x de R$ ${(parseFloat(product.price) / 12).toFixed(2)}
//                 </b>
//               </span>
//             </div>
//           </div>
//         </a>
//       </div>
//     `;
//       produtos.innerHTML += productCard;
//     });

//     if (filteredProducts.length === 0) {
//       produtos.innerHTML = "<p>Nenhum produto encontrado.</p>";
//     }

//     activateSliders(); // Ativa os sliders após carregar os produtos
//   } catch (error) {
//     console.error("Erro ao carregar os produtos:", error);
//   }
// }

// // Captura o evento de entrada de texto no campo de pesquisa
// const searchInput = document.querySelector("input[name='search']");
// const searchButton = document.querySelector("form button");

// // Evento para verificar o campo de entrada
// searchInput.addEventListener("input", event => {
//   const searchValue = event.target.value.trim();

//   // Se o campo estiver vazio, carregue todos os produtos
//   if (searchValue === "") {
//     loadProducts();
//   }
// });

// // Evento para filtrar os produtos ao clicar no botão de pesquisa
// searchButton.addEventListener("click", event => {
//   event.preventDefault(); 
//   const searchValue = searchInput.value.trim();

//   // Apenas filtra os produtos se houver texto no campo
//   if (searchValue !== "") {
//     loadProducts(searchValue);
//   }
// });

// // Inicialização do script
// document.addEventListener("DOMContentLoaded", () => {
//   loadProducts(); 
//   toggleMenu(); 
// });
