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
const spanNbBrands = document.querySelector('#nbBrands');

var products_used_for_indicators_filtered;

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
const fetchProducts = async (limit = 12, brand = "") => {
  if(brand=="")
  {
    try {
      const response = await fetch(
        `https://clear-fashion-4fy2s7nac-artusdlv.vercel.app/products/search?limit=${limit}`
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
  }
  else
  {
    try {
      const response = await fetch(
        `https://clear-fashion-4fy2s7nac-artusdlv.vercel.app/products/search?limit=${limit}&brand=${brand}`
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
  }
};


//A MODIFIER
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
  var brands_array = [];
  for (const prop in brands_object) {brands_array.push(brands_object[prop]);}  
  brands_array = brands_array[0];
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
const renderIndicators = async(pagination) => {
  const {count} = pagination;

  //Get number of brands
  const brands_object = await fetchBrands();
  var brands_array = [];
  for (const prop in brands_object) {brands_array.push(brands_object[prop])};
  brands_array = brands_array[0];

  if(count != 0)
  {
    const Allproducts = products_used_for_indicators_filtered;
    var recent_products = {...Allproducts};
    var price_products = {...Allproducts};
    var date_products = {...Allproducts};

    //Get the number of products recently released
    var onlyproduct = recent_products.result;
    var currentTime = new Date();
    currentTime.setDate(currentTime.getDate()-14);
    onlyproduct = onlyproduct.filter(onlyproduct => Date.parse(onlyproduct.released) > currentTime);
    recent_products.result = onlyproduct;

    //Get the p50, p90 and p95 price value indicators
    var onlyproduct = price_products.result;    
    let products_sorted = onlyproduct.sort(
      (p1, p2) => (p1.price > p2.price) ? 1 : (p1.price < p2.price) ? -1 : 0);
    var p50_value = 0;
    var p90_value = 0;
    var p95_value = 0;
    
    p50_value = products_sorted[Math.round(products_sorted.length*0.5)].price;
    p90_value = products_sorted[Math.round(products_sorted.length*0.1)].price;
    p95_value = products_sorted[Math.round(products_sorted.length*0.05)].price;
    

    //Get last released date
    var onlyproduct = date_products.result;    
    let products_sort_date = onlyproduct.sort(
      (p1, p2) => (p1.released < p2.released) ? 1 : (p1.released > p2.released) ? -1 : 0);
    var last_released_date = Date();

    last_released_date = products_sort_date[0].released;

    spanNbProducts.innerHTML = count;
    spanNbNewProducts.innerHTML = recent_products.result.length;
    spanP50.innerHTML = p50_value;
    spanP90.innerHTML = p90_value;
    spanP95.innerHTML = p95_value;
    spanNbBrands.innerHTML = brands_array.length;
    spanlastRealeasedDate.innerHTML = last_released_date;
  }
  else
  {
    spanNbProducts.innerHTML = 0;
    spanNbNewProducts.innerHTML = 0;
    spanP50.innerHTML = "None";
    spanP90.innerHTML = "None";
    spanP95.innerHTML = "None";
    spanNbBrands.innerHTML = brands_array.length;
    spanlastRealeasedDate.innerHTML = "None";
  }
};

const render = (products, pagination) => {
  renderProducts(products);
  renderPagination(pagination);
  renderIndicators(pagination);  
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
  brand_selected = event.target.value
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
  var count = 5;
  try {
    const response = await fetch(
      `https://clear-fashion-api.vercel.app?`
    );
    const body = await response.json();

    if (body.success !== true) {
      console.error(body);
    }    
    count = Object.values(body)[1].meta.count;
  } catch (error) {
    console.error(error);
  }
  const Allproducts = await fetchProducts(1, count, brand_selected);
  var products = {...Allproducts};
  //We first filter by price
  if(filterReasonable.value == "filtered")
  {
    var onlyproduct = products.result;    
    onlyproduct = onlyproduct.filter(onlyproduct => onlyproduct.price < 50);
    products.result = onlyproduct;
  }
  //We then filter by released date
  if(filterReleased.value == "filtered")
  { 
    var onlyproduct = products.result;
    var currentTime = new Date();
    currentTime.setDate(currentTime.getDate()-14);
    onlyproduct = onlyproduct.filter(onlyproduct => Date.parse(onlyproduct.released) > currentTime);
    products.result = onlyproduct;
  }
  //We then sort the products
  if(selectSort.value == "price-desc")
  { 
    var onlyproduct = products.result;    
    let products_sorted = onlyproduct.sort(
      (p1, p2) => (p1.price < p2.price) ? 1 : (p1.price > p2.price) ? -1 : 0);  
    products.result = products_sorted;    
  }
  else if(selectSort.value == "price-asc")
  {
    var onlyproduct = products.result;    
    let products_sorted = onlyproduct.sort(
      (p1, p2) => (p1.price > p2.price) ? 1 : (p1.price < p2.price) ? -1 : 0);  
    products.result = products_sorted; 
  }
  else if(selectSort.value == "date-desc")
  {
    var onlyproduct = products.result;    
    let products_sorted = onlyproduct.sort(
      (p1, p2) => (Date.parse(p1.released) < Date.parse(p2.released)) ? 1 : (Date.parse(p1.released) > Date.parse(p2.released)) ? -1 : 0);  
    products.result = products_sorted; 
  }
  else if(selectSort.value == "date-asc")
  {
    var onlyproduct = products.result;    
    let products_sorted = onlyproduct.sort(
      (p1, p2) => (Date.parse(p1.released) > Date.parse(p2.released)) ? 1 : (Date.parse(p1.released) < Date.parse(p2.released)) ? -1 : 0);  
    products.result = products_sorted; 
  }

  products_used_for_indicators_filtered = {...products};
  setCurrentProducts(products);  

  currentPagination.pageSize = parseInt(selectShow.value); 
  currentPagination.count = parseInt(currentProducts.length);
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

  products_used_for_indicators_filtered = {...products};
  setCurrentProducts(products);

  render(currentProducts, currentPagination);
});