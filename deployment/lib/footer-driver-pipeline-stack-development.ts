import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';
import { CodeBuildStep, CodePipeline, CodePipelineSource, ShellStep } from "@aws-cdk/pipelines";
import { FooterDriverPipelineStage } from './footer-driver-pipeline-stage';

/**
 * The stack that defines the application pipeline
 */
export class FooterDriverPipelineStackDevelopment extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const footerDomain = 'footers.hakkasangroup.com';

    const footerDriverGithubConnection = SecretValue.secretsManager('store-driver-secrets', {
      jsonField: 'github-connection'
    }).toString();

    const pipeline = new CodePipeline(this, 'Pipeline', {
      // The pipeline name
      pipelineName: 'footer-driver-pipeline-development',
      crossAccountKeys: true,

       // How it will be built and synthesized
       synth: new ShellStep('Synth', {
         // Where the source can be found
         input: CodePipelineSource.connection('VenueDriver/footer-driver', 'development', {
          connectionArn: footerDriverGithubConnection, // Created using the AWS console
        }),
         
         // Install dependencies, build and run cdk synth
         commands: [
          'cd ./deployment && npm ci',
          'npx audit-ci --high',
          'npx cdk synth footer-driver-pipeline-development'
        ],
        primaryOutputDirectory: './deployment/cdk.out',
       }),
    });

    /**
     * Stages
     */

     const preProd = pipeline.addWave('PreProd');

    // Production stage
    const developmentStage = preProd.addStage(new FooterDriverPipelineStage(this, 'development', {
      env: { account: '330731243300', region: 'us-east-1' },
      Stage: 'development',
      CloudFrontDomain: `development.${footerDomain}`
    }));

    //developmentStage.addPre(new ManualApprovalStep('approval'));

    developmentStage.addPost(new CodeBuildStep("build-calendar", {
      installCommands: [
        'ls'
      ],
      commands: [
        'ls'
      ],
    }));
  
  }
}