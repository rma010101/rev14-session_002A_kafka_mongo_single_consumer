# Kafka + MongoDB + Redis Node.js Example

This project demonstrates how to use Apache Kafka with Node.js, MongoDB, and Redis for a simple order processing scenario.

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
- Redis running on default port
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
C:\kafka\kafka_2.13-3.9.1\bin\windows\kafka-topics.bat --create --topic <OWN-TOPIC> --bootstrap-server localhost:9092
```

> **Note:** Replace `<OWN-TOPIC>` with your actual topic name. This name must be exactly the same as the topic used in your `producer.js` and `consumer.js` files (e.g., `my-order-updates`).


#### Example: Where to Set the Topic Name

**In `producer.js`:**
```js
const topic = 'my-order-updates'; // <-- Change this to your topic name
// ...
producer.send([
  { topic, messages: [JSON.stringify(order)] }
], (err, data) => {
  // ...
});
```

**In `consumer.js`:**
```js
const topic = 'my-order-updates'; // <-- Change this to your topic name
// ...
consumer.addTopics([topic], () => {
  // ...
});
```

### 4. Run the Producer
```
node producer.js
```

### 5. Run the Consumer
```

node consumer.js
```

## Files
- `producer.js`: Sends order messages to Kafka.
- `consumer.js`: Listens for order messages, updates MongoDB, and uses Redis for caching.
- `package.json`: Node.js dependencies.

## Learning Points
- How to set up and run Kafka and ZooKeeper on Windows.
- How to produce and consume messages with `kafka-node` in Node.js.
- How to integrate MongoDB and Redis for data storage and caching.
- How to resolve common Kafka startup errors (e.g., cluster ID mismatch).

---
