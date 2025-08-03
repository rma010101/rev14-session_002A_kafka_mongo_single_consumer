const redis = require('redis');
const { MongoClient } = require('mongodb');
const kafka = require('kafka-node');

const redisClient = redis.createClient();
redisClient.connect().catch((err) => console.error('Redis connection failed:', err));

const mongoClient = new MongoClient('mongodb://localhost:27017');
const db = mongoClient.db('ecommerce');
const productsCollection = db.collection('products');

const kafkaClient = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });
const consumer = new kafka.Consumer(kafkaClient, [{ topic: 'my-order-updates', partition: 0 }], { autoCommit: true });

async function updateProductStock(productId, quantity) {
    const cacheKey = `product_${productId}`;
    let product = await redisClient.get(cacheKey);

    // implement cache hit or miss
    if (!product) {
        product = await productsCollection.findOne({ product_id: productId });
    } else {
        product = JSON.parse(product);
    }

    const newStock = product.stock - quantity;
    if (newStock >= 0) {
        await productsCollection.updateOne({ product_id: productId }, { $set: { stock: newStock } });
        await redisClient.del(cacheKey);
        console.log(`Product stock updated for product ${productId}, new stock: ${newStock}`);
    } else {
        console.log('Insufficient stock');
    }
}


// JSON. stringyfy() - object to JSON
//JSON.parse()- JSON to Object

consumer.on('message', async (message) => {
    const order = JSON.parse(message.value);
    const { productId, quantity } = order;

    console.log(`Processing order for product ${productId}, quantity: ${quantity}`);
    await updateProductStock(productId, quantity);
});

mongoClient.connect().then(() => console.log('Connected to MongoDB')).catch(console.error);

/**
 * start zookeeper
 * start server
 * create the topic
 */

