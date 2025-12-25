import amqp from 'amqplib';

async function smsNotification() {
    try {
        // Connect to RabbitMQ server
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        const exchangeName = 'products_exchange';
        
        // Assert a fanout exchange
        await channel.assertExchange(exchangeName, 'fanout', { durable: false });
        
        // Create a temporary queue for this consumer
        const q = await channel.assertQueue('', { exclusive: true });
        
        // Bind the queue to the exchange
        await channel.bindQueue(q.queue, exchangeName, '');
        console.log(' [*] Waiting for product announcements.',q.queue, 'To exit press CTRL+C');
        
        // Consume messages from the queue
        channel.consume(q.queue, (msg) => {
            if (msg.content) {
                const product = JSON.parse(msg.content.toString());
                console.log(` [x] Push Notification - New Product Announced: ID=${product.id}, Name=${product.name}, Price=${product.price}`);
            }
        }, { noAck: true });
    } catch (error) {
        console.error('Error in Push Notification:', error);
    }
}

smsNotification();