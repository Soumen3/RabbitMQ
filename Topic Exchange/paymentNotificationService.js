import amqp from 'amqplib';

async function notifyPaymentProcessed() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const exchange = 'notifications_exchange';
    const queue = 'payment_notifications_queue';

    await channel.assertExchange(exchange, 'topic', { durable: true });
    await channel.assertQueue(queue, { durable: true });

    await channel.bindQueue(queue, exchange, 'payment.*');
    console.log("waiting for payment messages....!");

    channel.consume(queue, (msg) => {
      if (msg !== null) {
        console.log(`Received payment message: ${msg.content.toString()}`);
        channel.ack(msg);
      }
    }, { noAck: false });
  } catch (error) {
    console.error('Error in notifyPaymentProcessed:', error);
  }
}

notifyPaymentProcessed();