import * as acm from '@aws-cdk/aws-certificatemanager';
import * as s3 from '@aws-cdk/aws-s3';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import { Stack, StackProps, Construct, Duration } from '@aws-cdk/core';

export interface FooterDriverStackProps extends StackProps {
  readonly Stage: string;
  readonly CloudFrontDomain: string;
}

export class FooterDriverStack extends Stack {
  constructor(scope: Construct, id: string, props: FooterDriverStackProps) {
    super(scope, id, props);

    // S3 Buckets
    const footerBucket = new s3.Bucket(this, 'FooterDriverApiBucket',{
      bucketName: props.CloudFrontDomain,
    });

    footerBucket.addCorsRule({
      allowedHeaders: ["*"],
      allowedOrigins: ["*"],
      allowedMethods: [s3.HttpMethods.GET],
    });

    const footerCertificate = new acm.Certificate(this, 'ApiCertificate', {
      domainName: props.CloudFrontDomain,
      validation: acm.CertificateValidation.fromDns()
    });
    
    const originRequestPolicy = cloudfront.OriginRequestPolicy.fromOriginRequestPolicyId(this, 'ManagedCorsS3Policy', '88a5eaf4-2fd4-4709-b370-b4c650ea3fcf'); // managed cloudfront s3 cors origin request policy

    new cloudfront.Distribution(this, 'FooterDriverDistribution', {
      defaultBehavior: { 
        origin: new origins.S3Origin(footerBucket),
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED
      },
      domainNames: [props.CloudFrontDomain],
      //defaultRootObject: 'index.html',
      certificate: footerCertificate,
    });

  }
}