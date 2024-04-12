import {
  IoTDataPlaneClient,
  PublishCommand,
} from '@aws-sdk/client-iot-data-plane';
import { SNSHandler } from 'aws-lambda';
const iotClient = new IoTDataPlaneClient({});
export const handler: SNSHandler = (event) =>
  Promise.allSettled(
    event.Records.map((snsEvent) =>
      iotClient.send(
        new PublishCommand({
          topic: snsEvent.Sns.TopicArn,
          qos: 1,
          payload: JSON.stringify(snsEvent.Sns),
        })
      )
    )
  ).then(() => {});
