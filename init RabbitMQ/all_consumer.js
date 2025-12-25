import amqp from 'amqplib';

async function consumeAllUserMessages() {
  try {
    // Connect to RabbitMQ server
    const connection = await amqp.connect('amqp://localhost:5672');
    const channel = await connection.createChannel();
    const queue = 'all_user_mail_queue';

    // Assert queue exists
    await channel.assertQueue(queue, { durable: true });
    console.log(`Waiting for messages in ${queue}...`);

    // Consume messages
    channel.consume(queue, (message) => {
      if (message !== null) {
        const content = message.content.toString();
        console.log('Received (All Users):', content);
        // Acknowledge the message
        channel.ack(message);
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

consumeAllUserMessages();