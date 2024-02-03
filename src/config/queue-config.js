const { MESSAGE_QUEUE } = require("./server-config");

const amqplib = require("amqplib");

let channel , connection;

async function connectQueue(){
  try {
    connection = await amqplib.connect("amqp://localhost");
    channel = await connection.createChannel();

    await channel.assertQueue(MESSAGE_QUEUE);

  } catch (error) {
    console.log(error);
  }
}

async function sendData(data){
    try {
        await channel.sendToQueue(MESSAGE_QUEUE, Buffer.from(JSON.stringify(data)));
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    connectQueue,
    sendData,
    
}