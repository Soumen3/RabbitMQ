import amqp from 'amqplib';

async function notifyOrderPlaced() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const exchange = 'notifications_exchange';
    const queue = 'order_notifications_queue';
  
    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queue, { durable: true });

    await channel.bindQueue(queue, exchange, 'order.*');

    console.log("waiting for message....!");
    channel.consume(queue, (msg) => {
      if (msg !== null) {
        console.log(`Received message: ${msg.content.toString()}`);
        channel.ack(msg);
      }
    }
    , { noAck: false });
  } catch (error) {
    console.error('Error in notifyOrderPlaced:', error);
  }
}

// Example usage
notifyOrderPlaced();