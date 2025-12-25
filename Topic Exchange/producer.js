import amqp from "amqplib";

async function produceMessage(routingKey, message) {
  try{
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const exchange = "notifications_exchange";
    const exchangeType = "topic";
    
    await channel.assertExchange(exchange, exchangeType, { durable: true });
    channel.publish(exchange, routingKey, Buffer.from(message));
    console.log(`Message sent to exchange '${exchange}' with routing key '${routingKey}': ${message}`);

    await channel.close();
    await connection.close();

  } catch (error) {
    console.error("Error producing message:", error);
  }
}

// Example usage
produceMessage("order.placed", "Order #12345 has been placed.");
produceMessage("payment.completed", "Payment for Order #12345 has been completed.");
