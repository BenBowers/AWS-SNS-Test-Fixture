import { SSTConfig } from 'sst';
import { API } from './stacks/MyStack';

export default {
  config(_input) {
    return {
      name: 'AWS-SNS-Test-Fixture',
      region: 'ap-southeast-2',
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      runtime: 'nodejs20.x',
      logRetention: 'one_month',
      tracing: 'active',
      architecture: 'arm_64',
      nodejs: {
        esbuild: {
          keepNames: false,
          minify: true,
          external: ['@aws-sdk/*'],
        },
      },
    });
    app.stack(API);
  },
} satisfies SSTConfig;
