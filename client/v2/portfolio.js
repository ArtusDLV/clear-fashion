// Invoking strict mode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode#invoking_strict_mode
'use strict';

/*
Description of the available api
GET https://clear-fashion-api.vercel.app/

Search for specific products

This endpoint accepts the following optional query string parameters:

- `page` - page of products to return
- `size` - number of products to return

GET https://clear-fashion-api.vercel.app/brands

Search for available brands list
*/

// current products on the page
let currentProducts = [];
let currentPagination = {};

var brand_selected = "";
var count_all_products = 242; //Useful for the limit (instead of 12, get all products all the time)

// instantiate the selectors
const selectShow = document.querySelector('#show-select');
const selectPage = document.querySelector('#page-select');
const selectBrands = document.querySelector('#brand-select');
const sectionProducts = document.querySelector('#products');
const spanNbProducts = document.querySelector('#nbProducts');
const spanNbNewProducts = document.querySelector('#nbNewProducts');
const filterReleased = document.querySelector('#recently-released');
const filterReasonable = document.querySelector('#reasonable-price');
const selectSort = document.querySelector('#sort-select');
const spanP50 = document.querySelector('#p50');
const spanP90 = document.querySelector('#p90');
const spanP95 = document.querySelector('#p95');
const spanlastRealeasedDate = document.querySelector('#lastRealeasedDate');
const spanNbBrands = document.querySelector('#nbBrands');

var products_used_for_indicators_filtered;

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = (results) => {
  currentProducts = results;
  //currentPagination = meta;  
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (limit = count_all_products, brand = "") => {
  if(brand=="")
  {
    try {
      const response = await fetch(
        `https://clear-fashion-pqrera056-artusdlv.vercel.app/products/search?limit=${count_all_products}`
      );
      const body = await response.json();
      return body.results;
    } catch (error) {
      console.error(error);
      return {currentProducts, currentPagination};
    }
  }
  else
  {
    try {
      const response = await fetch(
        `https://clear-fashion-pqrera056-artusdlv.vercel.app/products/search?limit=${count_all_products}&brand=${brand}`
      );
      const body = await response.json();
      return body.results;
    } catch (error) {
      console.error(error);
      return {currentProducts, currentPagination};
    }
  }
};

const fetchBrands = async () => {
  try {
    const response = await fetch(
      `https://clear-fashion-pqrera056-artusdlv.vercel.app/brands`
    );
    const body = await response.json();    

    return body;
  } catch (error) {
    console.error(error);
    return {result};
  }
};

/**
 * Render list of products
 * @param  {Array} products
 */
const renderProducts = products => {
  for (let produit of products) {
    if (produit.brand === "Circle Sportswear") {
      produit.image = "https:" + produit.image;
    }
  }
  const fragment = document.createDocumentFragment();
  const container = document.createElement('div');
  container.setAttribute('class', 'product-container');
  
  products.forEach(product => {
    const productElement = document.createElement('div');
    productElement.setAttribute('class', 'product');
    productElement.setAttribute('id', product._id);

    const imageElement = document.createElement('img');
    imageElement.setAttribute('src', product.image);
    imageElement.setAttribute('alt', product.name);
    imageElement.setAttribute('width', '200');
    imageElement.setAttribute('height', '200');
    productElement.appendChild(imageElement);

    const brandElement = document.createElement('span');
    brandElement.textContent = product.brand;
    productElement.appendChild(brandElement);

    const nameElement = document.createElement('a');
    nameElement.setAttribute('href', product.link);
    nameElement.setAttribute('target', '_blank');
    nameElement.textContent = product.name;
    productElement.appendChild(nameElement);

    const priceElement = document.createElement('span');
    priceElement.textContent = product.price + "€";
    productElement.appendChild(priceElement);

    container.appendChild(productElement);
  });

  fragment.appendChild(container);
  sectionProducts.innerHTML = '<div class="products-title">  <h2>Products</h2> </div>';
  sectionProducts.appendChild(fragment);
};


/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderPagination = pagination => {
  const {currentPage, pageCount} = pagination;
  const options = Array.from(
    {'length': pageCount},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');
  selectPage.innerHTML = options;
  selectPage.selectedIndex = currentPage - 1;
};

const renderBrands = async() => {  
  const brands_array = await fetchBrands();
  brands_array.unshift("");
  var options = [];
  for (let i = 0; i < brands_array.length; i++) {
    if(brands_array[i] == "")
    {
      options.push(`<option value="no-brand">${brands_array[i]}</option>`);
    }
    else
    {
      options.push(`<option value="${brands_array[i]}">${brands_array[i]}</option>`);
    }
  }
  options = options.join('');
  selectBrands.innerHTML = options;
};

renderBrands();

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = async() => {
  const count = products_used_for_indicators_filtered.length;

  if(count != 0)
  {
    const Allproducts = products_used_for_indicators_filtered;
    var recent_products = [...Allproducts];
    var price_products = [...Allproducts];
    var date_products = [...Allproducts];

    //Get the number of brands rendered    
    const uniqueBrands = new Set();
    Allproducts.forEach((product) => {
      uniqueBrands.add(product.brand);
    });

    //Get the number of products recently released    
    var currentTime = new Date();
    currentTime.setDate(currentTime.getDate()-14);
    recent_products = recent_products.filter(recent_products => Date.parse(recent_products.date) > currentTime);

    //Get the p50, p90 and p95 price value indicators   
    let products_sorted = price_products.sort(
      (p1, p2) => (p1.price > p2.price) ? 1 : (p1.price < p2.price) ? -1 : 0);
    var p50_value = 0;
    var p90_value = 0;
    var p95_value = 0;
    
    p50_value = products_sorted[Math.round(products_sorted.length*0.5)].price;
    p90_value = products_sorted[Math.round(products_sorted.length*0.1)].price;
    p95_value = products_sorted[Math.round(products_sorted.length*0.05)].price;
    

    //Get last released date  
    let products_sort_date = date_products.sort(
      (p1, p2) => (p1.date < p2.date) ? 1 : (p1.date > p2.date) ? -1 : 0);
    var last_released_date = Date();
    last_released_date = products_sort_date[0].date;
    const formattedDate = new Date(last_released_date).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    last_released_date = formattedDate.replace(',', ' à');

    spanNbProducts.innerHTML = count;
    spanNbNewProducts.innerHTML = recent_products.length;
    spanP50.innerHTML = p50_value;
    spanP90.innerHTML = p90_value;
    spanP95.innerHTML = p95_value;
    spanNbBrands.innerHTML = uniqueBrands.size;
    spanlastRealeasedDate.innerHTML = last_released_date;
  }
  else
  {
    spanNbProducts.innerHTML = 0;
    spanNbNewProducts.innerHTML = 0;
    spanP50.innerHTML = "None";
    spanP90.innerHTML = "None";
    spanP95.innerHTML = "None";
    spanNbBrands.innerHTML = 0;
    spanlastRealeasedDate.innerHTML = "None";
  }
};

const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators();  
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 */
selectShow.addEventListener('change', async (event) => {
 allFunctions();  
});

//Change pagination
selectPage.addEventListener('change', async (event) => {
 allFunctions(true);
});

//Change brands
selectBrands.addEventListener('change', async (event) => {
  brand_selected = event.target.value;
  if(event.target.value == "no-brand")
  {
    brand_selected = "";
  }
  allFunctions();
});

// Filter by recently released
filterReleased.addEventListener('change', async (event) => {
  allFunctions();
});

// Filter by price
filterReasonable.addEventListener('change', async (event) => {
  allFunctions();
});

// Sort by price and date
selectSort.addEventListener('change', async (event) => {
  allFunctions();
});

const allFunctions = async(change_page) => { 
  //First, get all the products
  /*
  try {
    const response = await fetch(
      `https://clear-fashion-pqrera056-artusdlv.vercel.app/all`
    );
    const body = await response.json();
  } catch (error) {
    console.error(error);
  }
  */
  const Allproducts = await fetchProducts(count_all_products, brand_selected);
  var products = [...Allproducts];
  //We first filter by price
  if(filterReasonable.value == "filtered")
  {   
    products = products.filter(products => products.price < 50);
  }
  //We then filter by released date
  if(filterReleased.value == "filtered")
  { 
    var currentTime = new Date();
    currentTime.setDate(currentTime.getDate()-14);
    products = products.filter(products => Date.parse(products.date) > currentTime);
  }
  //We then sort the products
  if(selectSort.value == "price-desc")
  {   
    let products_sorted = products.sort(
      (p1, p2) => (p1.price < p2.price) ? 1 : (p1.price > p2.price) ? -1 : 0);  
    products = products_sorted;    
  }
  else if(selectSort.value == "price-asc")
  {  
    let products_sorted = products.sort(
      (p1, p2) => (p1.price > p2.price) ? 1 : (p1.price < p2.price) ? -1 : 0);  
    products = products_sorted; 
  }
  else if(selectSort.value == "date-desc")
  {  
    let products_sorted = products.sort(
      (p1, p2) => (Date.parse(p1.date) > Date.parse(p2.date)) ? 1 : (Date.parse(p1.date) < Date.parse(p2.date)) ? -1 : 0);  
    products = products_sorted; 
  }
  else if(selectSort.value == "date-asc")
  {   
    let products_sorted = products.sort(
      (p1, p2) => (Date.parse(p1.date) < Date.parse(p2.date)) ? 1 : (Date.parse(p1.date) > Date.parse(p2.date)) ? -1 : 0);  
    products = products_sorted; 
  }
  products_used_for_indicators_filtered = [...products];
  setCurrentProducts(products);  

  currentPagination = {
    currentPage: 1,
    pageCount: 19,
    pageSize: 12,
    count: products_used_for_indicators_filtered.length
  }
  
  currentPagination.pageSize = parseInt(selectShow.value); 
  currentPagination.count = parseInt(products_used_for_indicators_filtered.length);
  if(change_page != true)
  {
    currentPagination.currentPage = 1;
    selectPage.value = 1;
    selectPage.innerHTML = 1;
  }
  else
  {
    currentPagination.currentPage = parseInt(selectPage.value);
  }
  var number_of_pages = Math.floor(currentProducts.length/parseInt(selectShow.value));
  if(currentProducts.length%parseInt(selectShow.value) != 0)
  {
    number_of_pages = number_of_pages + 1;
  } 
  currentPagination.pageCount = number_of_pages;
  const new_current_products = [];
  if(parseInt(selectShow.value) * parseInt(currentPagination.currentPage) < currentPagination.count)
  {
    for(let i = 0 + parseInt(selectShow.value)*(parseInt(currentPagination.currentPage)-1); i < parseInt(selectShow.value) * parseInt(currentPagination.currentPage); i++)
    {
      new_current_products.push(currentProducts[i])
    }
  }
  else
  {
    for(let i = 0 + parseInt(selectShow.value)*(parseInt(currentPagination.currentPage)-1); i < currentPagination.count; i++)
    {
      new_current_products.push(currentProducts[i])
    }
  }
  
  render(new_current_products, currentPagination);
};

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();

  products_used_for_indicators_filtered = [...products];

  setCurrentProducts(products);
  
  currentPagination = {
    currentPage: 1,
    pageCount: 19,
    pageSize: 12,
    count: products_used_for_indicators_filtered.length
  }

  const new_current_products = [];
  if(parseInt(selectShow.value) * parseInt(currentPagination.currentPage) < currentPagination.count)
  {
    for(let i = 0 + parseInt(selectShow.value)*(parseInt(currentPagination.currentPage)-1); i < parseInt(selectShow.value) * parseInt(currentPagination.currentPage); i++)
    {
      new_current_products.push(products[i])
    }
  }
  else
  {
    for(let i = 0 + parseInt(selectShow.value)*(parseInt(currentPagination.currentPage)-1); i < currentPagination.count; i++)
    {
      new_current_products.push(products[i])
    }
  }
  
  render(new_current_products, currentPagination);

});