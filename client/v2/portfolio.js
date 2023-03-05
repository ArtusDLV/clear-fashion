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

/**
 * Set global value
 * @param {Array} result - products to display
 * @param {Object} meta - pagination meta info
 */
const setCurrentProducts = ({result, meta}) => {
  currentProducts = result;
  currentPagination = meta;
};

/**
 * Fetch products from api
 * @param  {Number}  [page=1] - current page to fetch
 * @param  {Number}  [size=12] - size of the page
 * @return {Object}
 */
const fetchProducts = async (page = 1, size = 12, brand = "") => {
  try {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app?page=${page}&size=${size}&brand=${brand}`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {currentProducts, currentPagination};
    }

    return body.data;
  } catch (error) {
    console.error(error);
    return {currentProducts, currentPagination};
  }
};

const fetchBrands = async () => {
  try {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app/brands`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
      return {result};
    }

    return body.data;
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
  const fragment = document.createDocumentFragment();
  const div = document.createElement('div');
  const template = products
    .map(product => {
      return `
      <div class="product" id=${product.uuid}>
        <span>${product.brand}</span>
        <a href="${product.link}" target="_blank">${product.name}</a>
        <span>${product.price}</span>
      </div>
    `;
    })
    .join('');

  div.innerHTML = template;
  fragment.appendChild(div);
  sectionProducts.innerHTML = '<h2>Products</h2>';
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
 const brands_object = await fetchBrands();
 const brands_array = [];
 for (const prop in brands_object) {brands_array.push(`${brands_object[prop]}`);}
 console.log(brands_array);
 
 //const {currentPage, pageCount} = pagination;
 const options = Array.from(
    {'brand': brands_array},
    (value, index) => `<option value="${index + 1}">${index + 1}</option>`
  ).join('');

selectBrands.innerHTML = options;
//selectBrands.selectedIndex = currentPage - 1;
  
};

/**
 * Render page selector
 * @param  {Object} pagination
 */
const renderIndicators = async(pagination) => {
  const {count} = pagination;
  const Allproducts = await fetchProducts(1, count, brand_selected);
  var recent_products = {...Allproducts};
  var price_products = {...Allproducts};
  var date_products = {...Allproducts};

  //Get the number of products recently released
  var onlyproduct = recent_products.result;
  var currentTime = new Date();
  currentTime.setDate(currentTime.getDate()-14);
  onlyproduct = onlyproduct.filter(onlyproduct => onlyproduct.released > currentTime);
  recent_products.result = onlyproduct;

  //Get the p50, p90 and p95 price value indicators
  var onlyproduct = price_products.result;    
  let products_sorted = onlyproduct.sort(
    (p1, p2) => (p1.price > p2.price) ? 1 : (p1.price < p2.price) ? -1 : 0);
  const p50_value = products_sorted[Math.round(products_sorted.length*0.5)].price;
  const p90_value = products_sorted[Math.round(products_sorted.length*0.1)].price;
  const p95_value = products_sorted[Math.round(products_sorted.length*0.05)].price;

  //Get last released date
  var onlyproduct = date_products.result;    
  let products_sort_date = onlyproduct.sort(
    (p1, p2) => (p1.released < p2.released) ? 1 : (p1.released > p2.released) ? -1 : 0);
  const last_released_date = products_sort_date[0].released;

  spanNbProducts.innerHTML = count;
  spanNbNewProducts.innerHTML = recent_products.result.length;
  spanP50.innerHTML = p50_value;
  spanP90.innerHTML = p90_value;
  spanP95.innerHTML = p95_value;
  spanlastRealeasedDate.innerHTML = last_released_date;
};

const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination);
  //renderBrands();
};

/**
 * Declaration of all Listeners
 */

/**
 * Select the number of products to display
 */
selectShow.addEventListener('change', async (event) => {
  const products = await fetchProducts(1, parseInt(event.target.value), brand_selected);

  if(filterReleased.value == "filtered")
  {     
    var onlyproduct = products.result;
    var currentTime = new Date();
    currentTime.setDate(currentTime.getDate()-14);
    onlyproduct = onlyproduct.filter(onlyproduct => onlyproduct.released > currentTime);
    products.result = onlyproduct;
  }

  if(filterReasonable.value == "filtered")
  { 
    var onlyproduct = products.result;    
    onlyproduct = onlyproduct.filter(onlyproduct => onlyproduct.price < 50);
    products.result = onlyproduct;
  }

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

//Change pagination
selectPage.addEventListener('change', async (event) => {
  const products = await fetchProducts(parseInt(event.target.value), currentPagination.pageSize, brand_selected);

  if(filterReleased.value == "filtered")
  {     
    var onlyproduct = products.result;
    var currentTime = new Date();
    currentTime.setDate(currentTime.getDate()-14);
    onlyproduct = onlyproduct.filter(onlyproduct => onlyproduct.released > currentTime);
    products.result = onlyproduct;
  }

  if(filterReasonable.value == "filtered")
  { 
    var onlyproduct = products.result;    
    onlyproduct = onlyproduct.filter(onlyproduct => onlyproduct.price < 50);
    products.result = onlyproduct;
  }

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

//Change brands
selectBrands.addEventListener('change', async (event) => {
  brand_selected = event.target.value
  const products = await fetchProducts(1, 12, brand_selected);

  if(filterReleased.value == "filtered")
  {     
    var onlyproduct = products.result;
    var currentTime = new Date();
    currentTime.setDate(currentTime.getDate()-14);
    onlyproduct = onlyproduct.filter(onlyproduct => onlyproduct.released > currentTime);
    products.result = onlyproduct;
  }

  if(filterReasonable.value == "filtered")
  { 
    var onlyproduct = products.result;    
    onlyproduct = onlyproduct.filter(onlyproduct => onlyproduct.price < 50);
    products.result = onlyproduct;
  }

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

// Filter by recently released
filterReleased.addEventListener('change', async (event) => {
  if(event.target.value == "filtered")
  { 
    var products = await fetchProducts(1, 12, brand_selected);
    var onlyproduct = products.result;
    var currentTime = new Date();
    currentTime.setDate(currentTime.getDate()-14);
    onlyproduct = onlyproduct.filter(onlyproduct => onlyproduct.released > currentTime);
    products.result = onlyproduct;
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
  }
  else
  {
    var products = await fetchProducts(1, 12, brand_selected);
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
  }
});

// Filter by price
filterReasonable.addEventListener('change', async (event) => {
  if(event.target.value == "filtered")
  { 
    var products = await fetchProducts(1, 12, brand_selected);
    var onlyproduct = products.result;    
    onlyproduct = onlyproduct.filter(onlyproduct => onlyproduct.price < 50);
    products.result = onlyproduct;
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
  }
  else
  {
    var products = await fetchProducts(1, 12, brand_selected);
    setCurrentProducts(products);
    render(currentProducts, currentPagination);
  }
});

// Sort by price and date
selectSort.addEventListener('change', async (event) => {
  var products = await fetchProducts(selectPage.value, selectShow.value, brand_selected);
  if(event.target.value == "price-desc")
  { 
    var onlyproduct = products.result;    
    let products_sorted = onlyproduct.sort(
      (p1, p2) => (p1.price < p2.price) ? 1 : (p1.price > p2.price) ? -1 : 0);  
    products.result = products_sorted;    
  }
  else if(event.target.value == "price-asc")
  {
    var onlyproduct = products.result;    
    let products_sorted = onlyproduct.sort(
      (p1, p2) => (p1.price > p2.price) ? 1 : (p1.price < p2.price) ? -1 : 0);  
    products.result = products_sorted; 
  }
  else if(event.target.value == "date-desc")
  {
    var onlyproduct = products.result;    
    let products_sorted = onlyproduct.sort(
      (p1, p2) => (p1.released < p2.released) ? 1 : (p1.released > p2.released) ? -1 : 0);  
    products.result = products_sorted; 
  }
  else if(event.target.value == "date-asc")
  {
    var onlyproduct = products.result;    
    let products_sorted = onlyproduct.sort(
      (p1, p2) => (p1.released > p2.released) ? 1 : (p1.released < p2.released) ? -1 : 0);  
    products.result = products_sorted; 
  }
  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});

document.addEventListener('DOMContentLoaded', async () => {
  const products = await fetchProducts();

  setCurrentProducts(products);
  render(currentProducts, currentPagination);
});