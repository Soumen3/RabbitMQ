import amqp from 'amqplib';

async function sendMail(){
  try{
    const connection = await amqp.connect('amqp://localhost:5672');
    const channel = await connection.createChannel();

    const exchange = "mail_exchange";
    const routingKeyForSubUser = "mail_routingKeyForSubUser";
    const routingKeyForAllUser = "mail_routingKeyForAllUser";

    const messageForSubUser ={
      to: "abc@gamil.com",
      from:"xyz@gmail.com",
      subject: "Test Mail",
      body: "This is a test mail for subscription user"
    }
    const messageForAllUser ={
      to: "all@gamil.com",
      from:"xyz@gmail.com",
      subject: "Test Mail",
      body: "This is a test mail for all users"
    }

    await channel.assertExchange(exchange, 'direct', { durable: true });

    await channel.assertQueue('subscribe_user_mail_queue', { durable: true });
    await channel.assertQueue('all_user_mail_queue', { durable: true });

    await channel.bindQueue('subscribe_user_mail_queue', exchange, routingKeyForSubUser);
    await channel.bindQueue('all_user_mail_queue', exchange, routingKeyForAllUser);

    channel.publish(exchange, routingKeyForSubUser, Buffer.from(JSON.stringify(messageForSubUser)));
    channel.publish(exchange, routingKeyForAllUser, Buffer.from(JSON.stringify(messageForAllUser)));

    console.log("Message sent successfully");
    setTimeout(() => {
      connection.close();
    }, 500);
  }
  catch(err){
    console.error("Error in sending message", err);
  }
}

sendMail();