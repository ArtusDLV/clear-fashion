/* eslint-disable no-console, no-process-exit */
const dedicatedbrand = require('./eshops/dedicatedbrand');
const circlesportswearbrand = require('./eshops/circlesportswearbrand');
const montlimart = require('./eshops/montlimart.js');

const url_list = [dedicatedbrand, circlesportswearbrand, montlimart];
const fs = require('fs');

async function sandbox (eshop = ['https://www.dedicatedbrand.com/en/men/news', 'https://shop.circlesportswear.com/collections/collection-homme', 'https://www.montlimart.com/99-vetements']) {
  try {  
    var allProducts = []
    for(let i = 0; i < eshop.length; i++)
    {
      console.log(`🕵️‍♀️  browsing ${eshop[i]} eshop`);

      const products = await url_list[i].scrape(eshop[i]);
      console.log(products);
      allProducts = allProducts.concat(products);
    }    
    const jsonString = JSON.stringify(allProducts, null, 2);
    fs.writeFileSync('./products_scraped.json', jsonString);
    process.exit(0);   

  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;

sandbox(eshop);
