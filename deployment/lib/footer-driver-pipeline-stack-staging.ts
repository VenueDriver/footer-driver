import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';
import { CodeBuildStep, CodePipeline, CodePipelineSource, ShellStep } from "@aws-cdk/pipelines";
import { FooterDriverPipelineStage } from './footer-driver-pipeline-stage';

/**
 * The stack that defines the application pipeline
 */
export class FooterDriverPipelineStackStaging extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const footerDomain = 'footers.taogroup.com';

    const footerDriverGithubConnection = SecretValue.secretsManager('footer-driver-secrets', {
      jsonField: 'github-connection'
    }).toString();

    const pipeline = new CodePipeline(this, 'Pipeline', {
      // The pipeline name
      pipelineName: 'footer-driver-pipeline-staging',
      crossAccountKeys: true,

       // How it will be built and synthesized
       synth: new ShellStep('Synth', {
         // Where the source can be found
         input: CodePipelineSource.connection('VenueDriver/footer-driver', 'staging', {
          connectionArn: footerDriverGithubConnection, // Created using the AWS console
        }),
         
         // Install dependencies, build and run cdk synth
         commands: [
           'cd ./server && npm ci',
           'npx audit-ci --high',
           'npm run build',
           'npx cdk synth footer-driver-pipeline-staging'
         ],
         primaryOutputDirectory: './server/cdk.out',
       }),
    });

    /**
     * Stages
     */

     const preProd = pipeline.addWave('PreProd');

    // Production stage
    const stagingStage = preProd.addStage(new FooterDriverPipelineStage(this, 'staging', {
      env: { account: '848430332553', region: 'us-east-1' },
      Stage: 'staging',
      CloudFrontDomain: `staging.${footerDomain}`
    }));

    //stagingStage.addPre(new ManualApprovalStep('approval'));

    stagingStage.addPost(new CodeBuildStep("build-calendar", {
      installCommands: [
        'ls'
      ],
      commands: [
        'ls'
      ],
    }));
  
  }
}