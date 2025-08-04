# Kafka + MongoDB + Redis Multi-Consumer Node.js Example

This project demonstrates how to use Apache Kafka with Node.js, MongoDB, and Redis for a **multi-consumer** order processing scenario with caching optimization. **Two consumers** will run simultaneously to process messages from the same Kafka topic, showing load distribution and parallel processing.

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
C:\kafka\kafka_2.13-3.9.1\bin\windows\kafka-topics.bat --create --topic my-order-updates2 --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
```

> **Note:** The topic name `my-order-updates2` must be exactly the same as the topic used in your `producer.js` and `consumer.js` files.

#### Example: Where to Set the Topic Name

**In `producer.js`:**
```js
function sendOrderMessage(order) {
    const orderMessage = JSON.stringify(order);
    producer.send([{ topic: 'my-order-updates2', messages: orderMessage, partition: 0 }], (err, data) => {
        // ...
    });
}
```

**In `consumer.js`:**
```js
const consumer = new kafka.Consumer(kafkaClient, [{ topic: 'my-order-updates2', partition: 0 }], { autoCommit: true });
```

### 4. Start MongoDB
Ensure MongoDB is running on the default port `27017`. The consumer will connect to the `ecommerce` database and use the `products` collection.

### 5. Start Redis
Ensure Redis is running on the default port `6379` for caching functionality.

### 6. Monitor Messages with Console Consumers (Recommended)
To monitor the messages being sent by the producer, set up Kafka console consumers first:

```
# Terminal 3 - Monitor messages (Consumer 1)
cd C:\kafka\kafka_2.13-3.9.1\bin\windows
kafka-console-consumer.bat --bootstrap-server localhost:9092 --topic my-order-updates2 --from-beginning

# Terminal 4 - Monitor messages (Consumer 2) 
cd C:\kafka\kafka_2.13-3.9.1\bin\windows
kafka-console-consumer.bat --bootstrap-server localhost:9092 --topic my-order-updates2 --from-beginning
```

> **Note:** These console consumers will show you the raw JSON messages being sent by the producer, allowing you to monitor the message flow in real-time. **Start these first** to capture all messages from the beginning.

### 7. Run Multiple Consumers (Multi-Consumer Setup)
```
# Terminal 5 - Start first consumer
node consumer.js

# Terminal 6 - Start second consumer (in a new terminal)
node consumer.js
```

> **Important:** This project demonstrates a **multi-consumer** architecture. Run **2 consumers** in separate terminals to see how multiple consumers can process messages from the same Kafka topic.

### 8. Run the Producer
```
# Terminal 7 - Start producer (in a new terminal)
node producer.js
```

The producer will send messages, and you'll see the console consumers displaying the raw messages FIRST, then both Node.js consumers processing those messages, demonstrating complete message flow visibility.

## Complete Setup Summary

For the full multi-consumer demonstration with monitoring, you'll need **7 terminals**:

1. **Terminal 1**: ZooKeeper (`zookeeper-server-start.bat`)
2. **Terminal 2**: Kafka Server (`kafka-server-start.bat`)  
3. **Terminal 3**: Console Consumer Monitor 1 (`kafka-console-consumer.bat`)
4. **Terminal 4**: Console Consumer Monitor 2 (`kafka-console-consumer.bat`)
5. **Terminal 5**: Node.js Consumer 1 (`node consumer.js`)
6. **Terminal 6**: Node.js Consumer 2 (`node consumer.js`)
7. **Terminal 7**: Producer (`node producer.js`)

> **Recommended Order**: Start monitoring console consumers (3-4) before Node.js consumers (5-6) to capture all messages from the beginning.

## Files
- `producer.js`: Sends order messages to Kafka topic with order details (orderId, productId, quantity).
- `consumer.js`: Listens for order messages, updates product stock in MongoDB, and uses Redis for caching product data. **Run 2 instances** for multi-consumer setup.
- `package.json`: Node.js dependencies and project configuration.

## Key Features

### Multi-Consumer Architecture
- **Producer**: Sends order messages to Kafka topic
- **Multiple Consumers**: **2 consumer instances** process orders simultaneously and update stock levels
- **Load Balancing**: Messages are distributed between consumer instances
- **MongoDB Integration**: Stores product data in `ecommerce.products` collection
- **Redis Caching**: Improves performance by caching frequently accessed product data

### Cache Strategy
- **Cache Hit**: Product data retrieved from Redis
- **Cache Miss**: Data fetched from MongoDB and cached in Redis
- **Cache Invalidation**: Redis cache cleared after stock updates

### Data Flow
1. Producer sends order message to Kafka topic
2. **Multiple consumers** (2 instances) compete to receive messages
3. Each consumer receives message and extracts productId and quantity
4. Consumer checks Redis cache for product data
5. If cache miss, fetches from MongoDB
6. Updates product stock in MongoDB
7. Invalidates Redis cache for updated product

> **Multi-Consumer Behavior**: Messages are distributed between the 2 consumer instances, demonstrating load balancing and parallel processing capabilities.

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
# Console Consumer 1 - Monitor all messages
C:\kafka\kafka_2.13-3.9.1\bin\windows\kafka-console-consumer.bat --topic my-order-updates2 --from-beginning --bootstrap-server localhost:9092

# Console Consumer 2 - Monitor new messages only
C:\kafka\kafka_2.13-3.9.1\bin\windows\kafka-console-consumer.bat --topic my-order-updates2 --bootstrap-server localhost:9092
```

#### Topic Management Commands
```bash
# List all topics
C:\kafka\kafka_2.13-3.9.1\bin\windows\kafka-topics.bat --list --bootstrap-server localhost:9092

# Check consumer group status
C:\kafka\kafka_2.13-3.9.1\bin\windows\kafka-consumer-groups.bat --bootstrap-server localhost:9092 --list

# Describe topic details
C:\kafka\kafka_2.13-3.9.1\bin\windows\kafka-topics.bat --describe --topic my-order-updates2 --bootstrap-server localhost:9092
```

### MongoDB Logs
- **Default location**: `C:\Program Files\MongoDB\Server\{version}\log\mongod.log`
- **Custom location**: Check your MongoDB configuration file for log path

### Redis Logs
- **Console output**: Redis logs appear in the terminal where you started `redis-server`
- **Log file**: Can be configured in `redis.conf` if using configuration file

## Learning Points
- How to set up and run Kafka and ZooKeeper on Windows
- How to produce and consume messages with `kafka-node` in Node.js
- **How to implement multi-consumer architecture with load balancing**
- **How multiple consumers can process messages from the same topic**
- How to integrate MongoDB for data persistence
- How to implement Redis caching for performance optimization
- How to handle cache invalidation strategies
- How to process order data and update inventory in real-time
- How to resolve common Kafka startup errors (e.g., cluster ID mismatch)
- How to monitor and debug distributed systems using logs

---
