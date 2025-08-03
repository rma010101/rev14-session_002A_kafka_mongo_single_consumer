// import the kafka library. check if it is installed before you use it here
// npm install kafka-node
const kafka = require('kafka-node');

// connect to kafka server
const kafkaClient = new kafka.KafkaClient({ kafkaHost: 'localhost:9092' });

// create producer
const producer = new kafka.Producer(kafkaClient);

producer.on('ready', () => {
    console.log('Kafka Producer is connected and ready.');
});

producer.on('error', (err) => {
    console.error('Error in Kafka Producer:', err);
});

// Original simple producer function
function sendOrderMessage(order) {
    const orderMessage = JSON.stringify(order);
    producer.send([{ topic: 'my-order-updates', messages: orderMessage, partition: 0 }], (err, data) => {
        if (err) console.error('Error sending order message:', err);
        else console.log('Order message sent successfully:', data);
    });
}

// Example order data
sendOrderMessage({ orderId: 1, productId: 101, quantity: 3 });
//sendOrderMessage({ orderId: 2, productId: 101, quantity: 2 });
//sendOrderMessage({ orderId: 3, productId: 101, quantity: 3 });

/* 
// === MULTIPLE PARTITION PRODUCER (COMMENTED OUT) ===

function sendOrderMessageMultiPartition(order, partition = null) {
    const orderMessage = JSON.stringify(order);
    
    // Option 1: Send to specific partition
    if (partition !== null) {
        producer.send([{ topic: 'my-order-updates', messages: orderMessage, partition: partition }], (err, data) => {
            if (err) console.error('Error sending order message:', err);
            else console.log(`Order message sent successfully to partition ${partition}:`, data);
        });
    } else {
        // Option 2: Let Kafka automatically distribute across partitions (round-robin)
        producer.send([{ topic: 'my-order-updates', messages: orderMessage }], (err, data) => {
            if (err) console.error('Error sending order message:', err);
            else console.log('Order message sent successfully (auto-partition):', data);
        });
    }
}

// Function to send to multiple partitions
function sendOrderToMultiplePartitions(order, partitions) {
    partitions.forEach(partition => {
        sendOrderMessageMultiPartition(order, partition);
    });
}

// Function to distribute orders based on customer ID (hash partitioning)
function sendOrderWithCustomerPartitioning(order, totalPartitions = 3) {
    const customerId = order.customerId || order.orderId;
    const partition = customerId % totalPartitions; // Simple hash function
    sendOrderMessageMultiPartition(order, partition);
}

// Example usage for multiple partitions:

// 1. Send to specific partition
sendOrderMessageMultiPartition({ orderId: 1, productId: 101, quantity: 5 }, 0);
sendOrderMessageMultiPartition({ orderId: 2, productId: 102, quantity: 3 }, 1);
sendOrderMessageMultiPartition({ orderId: 3, productId: 103, quantity: 2 }, 2);

// 2. Auto-partition (Kafka decides)
sendOrderMessageMultiPartition({ orderId: 4, productId: 104, quantity: 1 });

// 3. Send to multiple partitions
sendOrderToMultiplePartitions({ orderId: 5, productId: 105, quantity: 4 }, [0, 1, 2]);

// 4. Customer-based partitioning
sendOrderWithCustomerPartitioning({ orderId: 6, customerId: 12345, productId: 106, quantity: 2 });
sendOrderWithCustomerPartitioning({ orderId: 7, customerId: 67890, productId: 107, quantity: 1 });

*/
