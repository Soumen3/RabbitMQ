import amqp from "amqplib";

const sendNotification = async (headers, message) => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();
    const exchange = "notification_exchange";
    channel.assertExchange(exchange, "headers", { durable: true });

    channel.publish(exchange, "", Buffer.from(message), {
      persistent: true,
      headers
    });
    console.log("Notification sent:", message);

    setTimeout(() => {
      channel.close()
      connection.close();
      process.exit(0);
    }, 5000);
  } catch (error) {
    console.error("Error sending notification:", error);
    process.exit(1);
  }
}

sendNotification({
  "x-match": "all",
  "notification_type": "new_video",
  "content-type": "video"
}, "New video uploaded");

sendNotification({
  "x-match": "all",
  "notification_type": "live_stream",
  "content-type": "gaming"
}, "Live stream started");

sendNotification({
  "x-match": "any",
  "notification_type_comment": "comment",
  "content-type": "vlog"
}, "New comment");

sendNotification({
  "x-match": "any",
  "notification_type_like": "like",
  "content-type": "vlog"
}, "New like");
