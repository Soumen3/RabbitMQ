import amqp from 'amqplib';

const sendMessage = async () => {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const queue = 'priority_queue';
    const exchange = 'priority_exchange';
    const routing_key = "kuchvi"

    await channel.assertExchange(exchange, 'direct', { durable: true });
    await channel.assertQueue(queue, {
      durable: true,
      arguments: {
        "x-max-priority": 10
      }
    });

    await channel.bindQueue(queue, exchange, routing_key);

    const data = [
      {
        priority: 5,
        message: "Hello World"
      },
      {
        priority: 10,
        message: "Hello World 2"
      },
      {
        priority: 1,
        message: "Hello World 3"
      }
    ]
    data.forEach((msg) => {
      channel.sendToQueue(queue, Buffer.from(msg.message), { priority: msg.priority });
    })
    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 5000);
  } catch (error) {
    console.log(error);
  }
}

sendMessage();