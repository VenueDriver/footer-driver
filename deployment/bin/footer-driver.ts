import { App, SecretValue } from '@aws-cdk/core';
import { FooterDriverPipelineStack } from '../lib/footer-driver-pipeline-stack';
import { FooterDriverPipelineStackDevelopment } from '../lib/footer-driver-pipeline-stack-development';
import { FooterDriverPipelineStackStaging } from '../lib/footer-driver-pipeline-stack-staging';

const app = new App();

const footerDriverDeployAccount = SecretValue.secretsManager('aws-account-ids', {
  jsonField: 'deploy_account'
}).toString();

new FooterDriverPipelineStack(app, 'footer-driver-pipeline-production', {
  env: { 
    account: footerDriverDeployAccount, region: 'us-east-1' },
});

new FooterDriverPipelineStackStaging(app, 'footer-driver-pipeline-staging', {
  env: { 
    account: footerDriverDeployAccount, region: 'us-east-1' },
});

new FooterDriverPipelineStackDevelopment(app, 'footer-driver-pipeline-development', {
  env: { 
    account: footerDriverDeployAccount, region: 'us-east-1' },
});

app.synth();

