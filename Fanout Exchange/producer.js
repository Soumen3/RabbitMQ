import amqp from 'amqplib';

async function announceNewProduct(product) {
    try {
        // Connect to RabbitMQ server
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();
        const exchangeName = 'products_exchange';

        // Assert a fanout exchange
        await channel.assertExchange(exchangeName, 'fanout', { durable: false });

        // Publish the product announcement to the exchange
        const message = JSON.stringify(product);
        channel.publish(exchangeName, '', Buffer.from(message), { persistent: true });
        console.log(` [x] Announced new product: ${message}`);

        // Close the channel and connection
        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('Error announcing new product:', error);
    }
}

const newProduct = {
    id: 1,
    name: 'New Product',
    price: 99.99
};

announceNewProduct(newProduct);