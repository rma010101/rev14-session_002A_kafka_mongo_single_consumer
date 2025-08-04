# Kafka + MongoDB + Redis Single Consumer Node.js Example

This project demonstrates how to use Apache Kafka with Node.js, MongoDB, and Redis for a **single consumer** order processing scenario with caching optimization. This example shows basic Kafka message processing with database integration and caching strategies.

## Node.js Dependencies & Installation

This project requires the following Node.js packages:

- `kafka-node` – Kafka client for Node.js
- `mongodb` – MongoDB client for Node.js
- `redis` – Redis client for Node.js

If you do not have a `package.json` file, first initialize your project:

```
npm init -y
```

Then install all dependencies:

```
npm install kafka-node mongodb redis
```

Or simply:
```
npm install
```
if you already have a `package.json` file with the dependencies listed.

## Prerequisites
- Java (for Kafka and ZooKeeper)
- Node.js and npm
- MongoDB running on `localhost:27017`
- Redis running on default port `6379`
- Kafka and ZooKeeper (downloaded and extracted, e.g., `C:\kafka\kafka_2.13-3.9.1`)

## Setup Steps

### 1. Start ZooKeeper
Open a terminal and run:
```
C:\kafka\kafka_2.13-3.9.1\bin\windows\zookeeper-server-start.bat C:\kafka\kafka_2.13-3.9.1\config\zookeeper.properties
```

### 2. Start Kafka Broker
Open a new terminal and run:
```
C:\kafka\kafka_2.13-3.9.1\bin\windows\kafka-server-start.bat C:\kafka\kafka_2.13-3.9.1\config\server.properties
```

### 3. Create Kafka Topic
```
C:\kafka\kafka_2.13-3.9.1\bin\windows\kafka-topics.bat --create --topic my-order-updates --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
```

> **Note:** The topic name `my-order-updates` must be exactly the same as the topic used in your `producer.js` and `consumer.js` files.

#### Example: Where to Set the Topic Name

**In `producer.js`:**
```js
function sendOrderMessage(order) {
    const orderMessage = JSON.stringify(order);
    producer.send([{ topic: 'my-order-updates', messages: orderMessage, partition: 0 }], (err, data) => {
        // ...
    });
}
```

**In `consumer.js`:**
```js
const consumer = new kafka.Consumer(kafkaClient, [{ topic: 'my-order-updates', partition: 0 }], { autoCommit: true });
```

### 4. Start MongoDB
Ensure MongoDB is running on the default port `27017`. The consumer will connect to the `ecommerce` database and use the `products` collection.

### 5. Start Redis
Ensure Redis is running on the default port `6379` for caching functionality.

### 6. Monitor Messages with Console Consumer (Recommended)
To monitor the messages being sent by the producer, set up a Kafka console consumer first:

```
# Terminal 3 - Monitor messages
cd C:\kafka\kafka_2.13-3.9.1\bin\windows
kafka-console-consumer.bat --bootstrap-server localhost:9092 --topic my-order-updates --from-beginning
```

> **Note:** This console consumer will show you the raw JSON messages being sent by the producer, allowing you to monitor the message flow in real-time. **Start this first** to capture all messages from the beginning.

### 7. Run the Consumer (Single Consumer Setup)
```
# Terminal 4 - Start consumer
node consumer.js
```

> **Important:** This project demonstrates a **single consumer** architecture. One consumer processes all messages from the Kafka topic.

### 8. Run the Producer

You have **two options** for sending messages to the Kafka topic:

#### Option A: Node.js Producer (Recommended)
```
# Terminal 5 - Start Node.js producer (in a new terminal)
node producer.js
```

This runs your custom Node.js application that automatically sends structured order messages with JSON data (orderId, productId, quantity).

#### Option B: Kafka Console Producer (Alternative/Manual Testing)
If you prefer to send messages manually or want to test without the Node.js producer:

```
# Terminal 5 (Alternative) - Manual console producer
cd C:\kafka\kafka_2.13-3.9.1\bin\windows
kafka-console-producer.bat --topic my-order-updates --bootstrap-server localhost:9092

# Then type JSON messages manually in the terminal, for example:
{"orderId": "order-123", "productId": "product-456", "quantity": 2}
{"orderId": "order-124", "productId": "product-789", "quantity": 1}
```

> **Choose one option**: Use either the Node.js producer OR the console producer, not both simultaneously.

The producer will send messages, and you'll see the console consumer displaying the raw messages FIRST, then the Node.js consumer processing those messages, demonstrating complete message flow visibility.

## Complete Setup Summary

For the full single consumer demonstration with monitoring, you'll need **5 terminals**:

1. **Terminal 1**: ZooKeeper (`zookeeper-server-start.bat`)
2. **Terminal 2**: Kafka Server (`kafka-server-start.bat`)  
3. **Terminal 3**: Console Consumer Monitor (`kafka-console-consumer.bat`)
4. **Terminal 4**: Node.js Consumer (`node consumer.js`)
5. **Terminal 5**: Producer - Choose one:
   - **Option A**: Node.js Producer (`node producer.js`) - Recommended
   - **Option B**: Console Producer (`kafka-console-producer.bat`) - Manual testing

> **Recommended Order**: Start monitoring console consumer (3) before Node.js consumer (4) to capture all messages from the beginning.

## Files
- `producer.js`: Sends order messages to Kafka topic with order details (orderId, productId, quantity).
- `consumer.js`: Listens for order messages, updates product stock in MongoDB, and uses Redis for caching product data.
- `package.json`: Node.js dependencies and project configuration.

## Key Features

### Single Consumer Architecture
- **Producer**: Sends order messages to Kafka topic
- **Single Consumer**: One consumer instance processes all orders sequentially
- **MongoDB Integration**: Stores product data in `ecommerce.products` collection
- **Redis Caching**: Improves performance by caching frequently accessed product data

### Cache Strategy
- **Cache Hit**: Product data retrieved from Redis
- **Cache Miss**: Data fetched from MongoDB and cached in Redis
- **Cache Invalidation**: Redis cache cleared after stock updates

### Data Flow
1. Producer sends order message to Kafka topic
2. Single consumer receives message and extracts productId and quantity
3. Consumer checks Redis cache for product data
4. If cache miss, fetches from MongoDB
5. Updates product stock in MongoDB
6. Invalidates Redis cache for updated product

> **Single Consumer Behavior**: All messages are processed by one consumer instance in the order they are received.

## Monitoring & Logs

### Application Logs
- **Consumer logs**: Displayed in the terminal where you run `node consumer.js`
- **Producer logs**: Displayed in the terminal where you run `node producer.js`

### Kafka Logs
- **Kafka Server logs**: `C:\kafka\kafka_2.13-3.9.1\logs\server.log`
- **Kafka data logs**: `C:\kafka\kafka_2.13-3.9.1\kafka-logs\` (topic partitions and metadata)
- **ZooKeeper logs**: `C:\kafka\kafka_2.13-3.9.1\logs\zookeeper.log`

### Monitor Kafka Topics

#### Real-time Message Monitoring
To see the actual messages being sent by the producer:
```bash
# Console Consumer - Monitor all messages
C:\kafka\kafka_2.13-3.9.1\bin\windows\kafka-console-consumer.bat --topic my-order-updates --from-beginning --bootstrap-server localhost:9092

# Console Consumer - Monitor new messages only
C:\kafka\kafka_2.13-3.9.1\bin\windows\kafka-console-consumer.bat --topic my-order-updates --bootstrap-server localhost:9092
```

#### Topic Management Commands
```bash
# List all topics
C:\kafka\kafka_2.13-3.9.1\bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092

# Check consumer group status
C:\kafka\kafka_2.13-3.9.1\bin\windows\kafka-consumer-groups.bat --bootstrap-server localhost:9092 --list

# Describe topic details
C:\kafka\kafka_2.13-3.9.1\bin\windows\kafka-topics.bat --describe --topic my-order-updates --bootstrap-server localhost:9092
```

#### Manual Message Production Commands
```bash
# Start console producer for manual message sending
C:\kafka\kafka_2.13-3.9.1\bin\windows\kafka-console-producer.bat --topic my-order-updates --bootstrap-server localhost:9092

# Example messages to type in console producer:
{"orderId": "order-001", "productId": "product-123", "quantity": 3}
{"orderId": "order-002", "productId": "product-456", "quantity": 1}
{"orderId": "order-003", "productId": "product-789", "quantity": 5}
```

### MongoDB Logs
- **Default location**: `C:\Program Files\MongoDB\Server\{version}\log\mongod.log`
- **Custom location**: Check your MongoDB configuration file for log path

### Redis Logs
- **Console output**: Redis logs appear in the terminal where you started `redis-server`
- **Log file**: Can be configured in `redis.conf` if using configuration file

## Project Structure
```
session_002B_kafka_mongodb_single_consumer/
├── consumer.js                     # Single Kafka consumer implementation
├── producer.js                     # Kafka producer implementation
├── package.json                    # Node.js dependencies
├── package-lock.json              # Dependency lock file
├── node_modules/                   # Installed dependencies
├── kafkakafka_2.13-3.9.1kafka-logs/      # Kafka data logs
├── kafkakafka_2.13-3.9.1zookeeper-data/  # ZooKeeper data
└── README.md                       # This file
```

## Learning Points
- How to set up and run Kafka and ZooKeeper on Windows
- How to produce and consume messages with `kafka-node` in Node.js
- **How to implement single consumer architecture**
- **How one consumer processes all messages sequentially**
- How to integrate MongoDB for data persistence
- How to implement Redis caching for performance optimization
- How to handle cache invalidation strategies
- How to process order data and update inventory in real-time
- How to resolve common Kafka startup errors (e.g., cluster ID mismatch)
- How to monitor and debug distributed systems using logs
- Understanding the difference between single and multi-consumer patterns

## Common Issues & Troubleshooting

### Kafka Connection Issues
- Ensure ZooKeeper is started before Kafka
- Check if ports 2181 (ZooKeeper) and 9092 (Kafka) are available
- Verify topic exists before running consumer

### MongoDB Connection Issues
- Ensure MongoDB service is running
- Check connection string in consumer.js
- Verify database and collection permissions

### Redis Connection Issues
- Ensure Redis server is running on port 6379
- Check Redis configuration if using custom settings
- Verify Redis client connection in consumer.js

### Node.js Package Issues
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version compatibility
- Clear npm cache if encountering installation issues: `npm cache clean --force`

---
