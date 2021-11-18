import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as FooterDriver from '../lib/footer-driver-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new FooterDriver.FooterDriverStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT));
});
