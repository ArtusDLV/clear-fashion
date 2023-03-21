const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
//const { data } = require('cheerio/lib/api/attributes');

const {MongoClient, ObjectId} = require('mongodb');
var MONGODB_URI = 'mongodb+srv://artusvilleguerin:12345@clusterclearfashion.npik1qc.mongodb.net/test';
const MONGODB_DB_NAME = 'clearfashion_db';
const MONGODB_COLLECTION = 'clearfashion_collection';
const fs = require('fs');
var collection = null;

const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/', async (request, response) => {
  response.send({'ack': true});
});

app.get('/all', async (request, response) => {
  await connectMongoDb();
  products = await collection.find().sort({price: 1}).toArray();
  console.log(products);
  total = products.length;
  response.send({"limit":total, "total":total, "results" : products});
});

app.get('/brands', async (request, response) => {
  await connectMongoDb();
  brands = await collection.distinct("brand");
  response.send(brands);
});

app.get('/brandsearch', async (request, response) => {
  var brand = request.query.brand;
  await connectMongoDb();
  products = await collection.find({"brand" : brand}).sort({price: 1}).toArray();
  total = products.length;
  response.send({"limit":total, "total":total, "results" : products});
});

app.get('/products/search', async (request, response) => {
  var limit = request.query.limit;
  var brand = request.query.brand;
  var price = request.query.price;
  var products = [];
  var total = 0;

  if(limit == undefined)
  {
    limit = 12;
  }
  else
  {
    limit = parseInt(limit);
  }

  if(brand === undefined)
  {
    if(price == undefined)
    {
      await connectMongoDb();
      products = await collection.find().sort({price: 1}).limit(limit).toArray();
    }
    else
    {
      price = parseInt(price);
      await connectMongoDb();
      products = await collection.find({"price": {$lt:price}}).sort({price: 1}).limit(limit).toArray();
    }
  }
  else
  {    
    if(price == undefined)
    {
      await connectMongoDb();
      products = await collection.find({"brand" : brand}).sort({price: 1}).limit(limit).toArray();
    }
    else
    {
      price = parseInt(price);
      await connectMongoDb();
      products = await collection.find({"brand" : brand, "price": {$lt:price}}).sort({price: 1}).limit(limit).toArray();
    }
  }

  total = products.length;
  response.send({"limit":limit, "total":total, "results" : products});
});

app.get('/products/:id', async (request, response) => {
  //response.send({'ack': true});
  const products = await fetchbyID(request.params.id);
  response.send(products);  
});

app.listen(PORT);

console.log(`📡 Running on port ${PORT}`);

async function connectMongoDb(){
  const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
  const db =  client.db(MONGODB_DB_NAME);
  collection = db.collection(MONGODB_COLLECTION);
}

async function fetchbyID(id){
  await connectMongoDb();
  const products = await collection.find({ "_id": ObjectId(`${id}`) }).toArray();
  return products
  //process.exit(0);
}