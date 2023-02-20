const fetch = require('node-fetch');
const cheerio = require('cheerio');

/**
 * Parse webpage e-shop
 * @param  {String} data - html response
 * @return {Array} products
 */
const parse = data => {
  const $ = cheerio.load(data);

  return $('.products-list.row .products-list__block')
    .map((i, element) => {
      const name = $(element)
        .find('.product-miniature__title')
        .text()
        .trim()
        .replace(/\s/g, ' ');

      const price = parseInt(
        $(element)
          .find('.product-miniature__pricing')
          .text()
      );
      
      //We get the link of the product
      const link = $(element)
        .find('.product-miniature__thumb-link')
        .attr('href');

      //Get scraping date
      const date = new Date();

      //Get the image of the product
      const image = $(element)
        .find('.w-100')
        .attr('data-src');
      
      const brand = 'Montlimart'

      return {name, price, link, image, date, brand};
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
