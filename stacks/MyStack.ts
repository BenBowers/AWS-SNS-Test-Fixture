import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Config, Function, StackContext, Topic } from 'sst/constructs';
export function API({ stack }: StackContext) {
  const topic = new Topic(stack, 'snstpoic', {});
  const publishToMqtt = new Function(stack, 'mqttFunction', {
    handler: 'src/snsToMqtt.handler',
    permissions: [
      new PolicyStatement({
        actions: ['iot:Publish'],
        resources: ['*'],
        effect: Effect.ALLOW,
      }),
    ],
  });
  const { TOPIC } = Config.Parameter.create(stack, {
    TOPIC: topic.topicArn,
  });
  topic.addSubscribers(stack, {
    publishToMqtt,
  });
  stack.addOutputs({
    topic: topic.topicArn,
  });
}
