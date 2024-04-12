import { iot, mqtt5, error } from 'aws-iot-device-sdk-v2';
import { once } from 'events';
import { setTimeout } from 'timers/promises';
import { describe, it } from 'vitest';
import { toUtf8 } from '@aws-sdk/util-utf8-browser';
import { DescribeEndpointCommand, IoTClient } from '@aws-sdk/client-iot';
const iotClient = new IoTClient();
describe('', () => {
  it('', async () => {
    const IOT_ENDPOINT = await iotClient
      .send(
        new DescribeEndpointCommand({
          endpointType: 'iot:Data-ATS',
        })
      )
      .then((result) => {
        return result.endpointAddress;
      });
    const builder =
      iot.AwsIotMqtt5ClientConfigBuilder.newWebsocketMqttBuilderWithSigv4Auth(
        IOT_ENDPOINT!
      );
    const client = new mqtt5.Mqtt5Client(builder.build());

    client.on('error', (error) => {
      console.log('Error event: ' + error.toString());
    });

    client.on(
      'messageReceived',
      (eventData: mqtt5.MessageReceivedEvent): void => {
        console.log(
          'Message Received event: ' + JSON.stringify(eventData.message)
        );
        if (eventData.message.payload) {
          console.log(
            '  with payload: ' +
              toUtf8(new Uint8Array(eventData.message.payload as ArrayBuffer))
          );
        }
      }
    );

    client.on(
      'attemptingConnect',
      (eventData: mqtt5.AttemptingConnectEvent) => {
        console.log('Attempting Connect event');
      }
    );

    client.on(
      'connectionSuccess',
      (eventData: mqtt5.ConnectionSuccessEvent) => {
        console.log('Connection Success event');
        console.log('Connack: ' + JSON.stringify(eventData.connack));
        console.log('Settings: ' + JSON.stringify(eventData.settings));
      }
    );

    client.on(
      'connectionFailure',
      (eventData: mqtt5.ConnectionFailureEvent) => {
        console.log('Connection failure event: ' + eventData.error.toString());
        if (eventData.connack) {
          console.log('Connack: ' + JSON.stringify(eventData.connack));
        }
      }
    );

    client.on('disconnection', (eventData: mqtt5.DisconnectionEvent) => {
      console.log('Disconnection event: ' + eventData.error.toString());
      if (eventData.disconnect !== undefined) {
        console.log(
          'Disconnect packet: ' + JSON.stringify(eventData.disconnect)
        );
      }
    });

    client.on('stopped', (eventData: mqtt5.StoppedEvent) => {
      console.log('Stopped event');
    });
    const connectionSuccess = once(client, 'connectionSuccess');
    client.start();
    await connectionSuccess;

    await client.subscribe({ subscriptions: [{ topicFilter: '#', qos: 1 }] });
    await setTimeout(20000);
    // Shutdown and clean up
    const unsuback = await client.unsubscribe({
      topicFilters: ['#'],
    });
    console.log(JSON.stringify(unsuback));
    const stopped = once(client, mqtt5.Mqtt5Client.STOPPED);
    client.stop();
    await stopped;

    client.close();
    console.log('after close');
  });
});
