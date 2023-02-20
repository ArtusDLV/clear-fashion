/* eslint-disable no-console, no-process-exit */
const dedicatedbrand = require('./eshops/dedicatedbrand');
const circlesportswearbrand = require('./eshops/circlesportswearbrand');
const fs = require('fs');

async function sandbox (eshop = ['https://shop.circlesportswear.com/collections/collection-homme', 'https://www.dedicatedbrand.com/en/men/news']) {
  try {

    console.log(`🕵️‍♀️  browsing ${eshop} eshop`);

    const products = await circlesportswearbrand.scrape(eshop);

    console.log(products);
    console.log('done');
    const jsonString = JSON.stringify(products, null, 2);
    fs.writeFileSync('./products_scraped.json', jsonString);
    process.exit(0);   

  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;

sandbox(eshop);
