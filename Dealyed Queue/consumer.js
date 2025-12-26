import amqp from "amqplib";

async function consumeDelayedQueue() {
  try {
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

    console.log("Waiting for delayed messages...");

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString());
        console.log(`Received delayed message:`);
        console.log(`  Batch ID: ${content.batchId}`);
        console.log(`  Delay: ${content.delay}ms`);
        console.log(`  Orders:`, content.orders);

        // Process the delayed order updates here
        processDelayedOrderUpdates(content);

        channel.ack(msg);
      }
    });

    // Handle graceful shutdown
    process.on("SIGINT", async () => {
      console.log("\nClosing connection...");
      await channel.close();
      await connection.close();
      process.exit(0);
    });

  } catch (error) {
    console.error("Error in consumer:", error);
  }
}

function processDelayedOrderUpdates(content) {
  const { batchId, orders, delay } = content;

  console.log(`\nProcessing batch ${batchId} after ${delay}ms delay:`);

  orders.forEach((order) => {
    console.log(`  - Order ${order.orderId}: ${order.item} x${order.quantity} @ $${order.price}`);
    // Add your order update logic here (e.g., send notifications, update database)
  });

  console.log(`Batch ${batchId} processed successfully!\n`);
}

consumeDelayedQueue();
