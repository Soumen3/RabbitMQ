import amqp from "amqplib";

const sendNotification = async (headers) => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    const exchange = "notification_exchange";
    channel.assertExchange(exchange, "headers", { durable: true });

    const q = await channel.assertQueue("", { durable: true });
    channel.bindQueue(q.queue, exchange, "", headers);
    console.log("Waiting for the message...")
    channel.consume(q.queue, (msg) => {
      if (msg !== null) {
        console.log("Notification received:", msg.content.toString());
        channel.ack(msg);
      }
    });

  } catch (error) {
    console.error("Error sending notification:", error);
    process.exit(1);
  }
}

sendNotification({
  "x-match": "any",
  "notification_type_comment": "comment",
  "notification_type_like": "like",
  "content-type": "vlog"
});