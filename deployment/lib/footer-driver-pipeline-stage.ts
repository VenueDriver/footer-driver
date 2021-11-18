import { CfnOutput, Construct, Stage, StageProps } from '@aws-cdk/core';
import { FooterDriverStack } from './footer-driver-stack';

export interface FooterDriverStackProps extends StageProps {
  readonly CloudFrontDomain: string;
  readonly Stage: string;
}

/**
 * Deployable unit of web service app
 */
export class FooterDriverPipelineStage extends Stage {
  public readonly urlOutput: CfnOutput;
  
  constructor(scope: Construct, id: string, props: FooterDriverStackProps) {
    super(scope, id, props);

    new FooterDriverStack(this, 'footer-driver',{
      env: { account: props.env?.account, region: props.env?.region },
      Stage: props.Stage,
      CloudFrontDomain: props.CloudFrontDomain
    });
    
    // Expose CdkpipelinesDemoStack's output one level higher
    //this.urlOutput = service.urlOutput;
  }
}