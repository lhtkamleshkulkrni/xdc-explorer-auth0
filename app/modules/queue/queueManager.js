import AMQPController from "../../../library/index";
import Config from "../../../config";
import { amqpConstants } from "../../common/constants";
export default class RabbitMQ {
  async insertInQueue(
    exchangeName,
    queueName,
    replyQueue,
    topicKey,
    routingKey,
    replyKey,
    requestKey,
    exchangeType,
    queueType,
    queueData
  ) {
    return await AMQPController.insertInQueue(
      exchangeName,
      queueName,
      replyQueue,
      topicKey,
      routingKey,
      replyKey,
      requestKey,
      exchangeType,
      queueType,
      queueData
    );
  }

    async initializeRabbitMQListener() {
      await AMQPController.getFromQueue(
        Config.NOTIFICATION_EXCHANGE,
        Config.NOTIFICATION_QUEUE,
        amqpConstants.exchangeType.FANOUT,
        amqpConstants.queueType.PUBLISHER_SUBSCRIBER_QUEUE,
        this.queueListener,
        {},
        {},
          true,
          true,
          false,
          false,
          true,
          20
      );
      return true;
    }

  async queueListener(queueData, data) {
    data = JSON.parse(data);
    console.log("queueData - data --> ", data);
    if (!data) return;
    try {
    } catch (err) {
      console.log("queueListener catch", err);
    }
  }
}


