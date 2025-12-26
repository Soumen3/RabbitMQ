import amqp from 'amqplib';

const receiveMessage = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'priority_queue';
    const exchange = 'priority_exchange';
    const routing_key = 'kuchvi';
    await channel.assertExchange(exchange, 'direct', { durable: true });
    await channel.assertQueue(queue, {
      durable: true,
      arguments: {
        "x-max-priority": 10
      }
    })
    await channel.bindQueue(queue, exchange, routing_key);
    console.log("Waiting for messages");
    channel.consume(queue, (msg) => {
      if (msg !== null) {
        console.log("Received message", msg.content.toString());
        channel.ack(msg);
      }
    })
  } catch (error) {
    console.log(error);
  }
}
receiveMessage();