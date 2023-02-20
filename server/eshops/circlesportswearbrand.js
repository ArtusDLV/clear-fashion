const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * Parse webpage e-shop
 * @param  {String} data - html response
 * @return {Array} products
 */
const parse = data => {
  const $ = cheerio.load(data);

  return $('.product-grid-container .grid__item')
    .map((i, element) => {
      const name = $(element)
        .find('.full-unstyled-link')
        .text()
        .trim()
        .replace(/\s/g, ' ');

      const price = 
        $(element)
          .find('.price__container')
          .find('.money')
          .text()
      ;
      
      //We get the link of the product
      var link = $(element)
        .find('.full-unstyled-link')
        .attr('href');
        link = "https://shop.circlesportswear.com" + link;

      //Get scraping date
      const date = new Date();

      //Get the image of the product
      const image = $(element)
        .find('.card__media img')
        .attr('src');
      
      return {name, price, link, image, date};
    })
    .get();
};

/**
 * Scrape all the products for a given url page
 * @param  {[type]}  url
 * @return {Array|null}
 */
module.exports.scrape = async url => {
  try {
    const response = await fetch(url);

    if (response.ok) {
      const body = await response.text();

      return parse(body);
    }

    console.error(response);

    return null;
  } catch (error) {
    console.error(error);
    return null;
  }
};
