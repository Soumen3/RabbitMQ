import amqp from "amqplib";


async function sendtoDelayedQueue(batchId, orders, delay) {
  const connection = await amqp.connect("amqp://localhost");
  const channel = await connection.createChannel();

  const exchange = "delayed_exchange";
  await channel.assertExchange(exchange, "x-delayed-message", {
    arguments: {
      "x-delayed-type": "direct"
    }
  });

  const queue = "delayed_order_updates_queue";
  await channel.assertQueue(queue, {
    durable: true
  });

  await channel.bindQueue(queue, exchange, "");

  const message = JSON.stringify({
    batchId,
    orders,
    delay
  });

  channel.publish(exchange, "", Buffer.from(message), {
    headers: {
      "x-delay": delay
    }
  });

  console.log(`Sent message to delayed queue: ${message}`);

  setTimeout(() => {
    connection.close();
  }, delay);

}


async function processBatchOrders() {
  const batchId = generateBatchId();
  const orders = collectOrdersForBatch();

  console.log(`Processing batch ${batchId} with orders: ${orders}`);

  await processOrders(orders);
  const delay = 10000;

  sendtoDelayedQueue(batchId, orders, delay);
}

async function processOrders(orders) {
  console.log(`Processing orders: ${orders}`);
}

function generateBatchId() {
  return "batch-" + Date.now();
}

function collectOrdersForBatch() {
  return [
    {
      orderId: 1, item: "Laptop", price: 1000, quantity: 1
    },
    {
      orderId: 2, item: "Mobile", price: 500, quantity: 2
    },
    {
      orderId: 3, item: "Tablet", price: 300, quantity: 3
    }
  ];
}

processBatchOrders();
