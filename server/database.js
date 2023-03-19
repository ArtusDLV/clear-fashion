const {MongoClient, ObjectId} = require('mongodb');
var MONGODB_URI = 'mongodb+srv://artusvilleguerin:12345@clusterclearfashion.npik1qc.mongodb.net/test';
const MONGODB_DB_NAME = 'clearfashion_db';
const MONGODB_COLLECTION = 'clearfashion_collection';
const fs = require('fs');
var collection = null;

async function connectMongoDb(){
    console.log('Connecting to MongoDB ...');
    const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
    const db =  client.db(MONGODB_DB_NAME);
    collection = db.collection(MONGODB_COLLECTION);
}

async function insertProductsMongoDB(){
    await connectMongoDb();
    console.log("Inserting products to the MongoDB database");
    const products_to_insert = JSON.parse(fs.readFileSync('products_scraped.json'));
    const inserted_products = await collection.insertMany(products_to_insert);
    console.log(inserted_products);
    process.exit(0);
}
    //insertProductsMongoDB();
    fetchProductsBrands();
    //fetchProductslessThanPrice();
    //fetchProductsSortedByPrice();
    //fetchProductsSortedByDate();
    //fetchProductslessThan2Weeks();
    //fetchbyID();

async function fetchProductsBrands(){
    await connectMongoDb();
    console.log('fetching products from same brand...');
    const brand = 'Dedicated';
    const products = await collection.find({"brand" : brand}).toArray();
    return products
    //console.log(products);
    //process.exit(0);
}


async function fetchbyID(){
    await connectMongoDb();
    console.log('fetching products by ID...');
    const products = await collection.find({ "_id": ObjectId("640f3707b8266552d9bf5504") }).toArray();
    console.log(products);
    process.exit(0);
}

async function fetchProductslessThanPrice(){
    await connectMongoDb();
    console.log('fetching products less than a selected price...');
    const price = 15;
    const products = await collection.find({"price": {$lt:price}}).toArray();
    console.log(products);
    process.exit(0);
}

async function fetchProductsSortedByPrice(){
    await connectMongoDb();
    console.log('fetching products sorted by price...');
    const products = await collection.find().sort({price: 1}).toArray();
    console.log(products);
    process.exit(0);
}

async function fetchProductsSortedByDate(){
    await connectMongoDb();
    console.log('fetching products sorted by date...');
    const products = await collection.find().sort({date: -1}).toArray();
    console.log(products);
    process.exit(0);
}

async function fetchProductslessThan2Weeks(){
    await connectMongoDb();
    console.log('fetching products with scraping date less than 2 weeks...');
    const products = await collection.find({date: {$lte: new Date(Date.now() - (1000 * 60 * 60 * 24 * 14))}}).toArray();
    console.log(products);
    process.exit(0);
}