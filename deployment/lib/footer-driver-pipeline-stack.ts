import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';
import { CodeBuildStep, CodePipeline, CodePipelineSource, ShellStep } from "@aws-cdk/pipelines";
import { FooterDriverPipelineStage } from './footer-driver-pipeline-stage';

/**
 * The stack that defines the application pipeline
 */
export class FooterDriverPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const footerDomain = 'footers.taogroup.com';

    const footerDriverGithubConnection = SecretValue.secretsManager('store-driver-secrets', {
      jsonField: 'github-connection'
    }).toString();

    const pipeline = new CodePipeline(this, 'Pipeline', {
      // The pipeline name
      pipelineName: 'footer-driver-pipeline',
      crossAccountKeys: true,

       // How it will be built and synthesized
       synth: new ShellStep('Synth', {
         // Where the source can be found
         input: CodePipelineSource.connection('VenueDriver/footer-driver', 'production', {
          connectionArn: footerDriverGithubConnection, // Created using the AWS console
        }),
         
         // Install dependencies, build and run cdk synth
         commands: [
           'npx cdk synth footer-driver-pipeline-production'
         ],
         primaryOutputDirectory: './server/cdk.out',
       }),
    });

    /**
     * Stages
     */

     const preProd = pipeline.addWave('PreProd');

    // Test Stage
    const testStage = preProd.addStage(new FooterDriverPipelineStage(this, 'test', {
        env: { account: '188661444164', region: 'us-east-1' },
        Stage: 'test',
        CloudFrontDomain: `test.${footerDomain}`
    }));


    testStage.addPost(new CodeBuildStep("build-calendar", {
      installCommands: [
        'ls'
      ],
      commands: [
        'ls'
      ],
    }));

    // Production stage
    const productionStage = preProd.addStage(new FooterDriverPipelineStage(this, 'production', {
      env: { account: '848430332553', region: 'us-east-1' },
      Stage: 'production',
      CloudFrontDomain: `${footerDomain}`
    }));

    //productionStage.addPre(new ManualApprovalStep('approval'));

    productionStage.addPost(new CodeBuildStep("build-calendar", {
      installCommands: [
        'ls'
      ],
      commands: [
        'ls'
      ],
    }));
  
  }
}