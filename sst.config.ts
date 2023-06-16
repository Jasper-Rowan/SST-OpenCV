import { SSTConfig } from "sst";
import { Api } from "sst/constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";

export default {
  config(_input) {
    return {
      name: "test-opencv",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      runtime: "python3.8",
    });
    app.stack(function Stack({ stack }) {
      const opencvLayerArn = "arn:aws:lambda:us-east-1:770693421928:layer:Klayers-python38-opencv-python-headless:11";
      const libgthreadLayerArn = "arn:aws:lambda:us-east-1:770693421928:layer:Klayers-python38-libgthread-so:1";
      
      const layer1 = lambda.LayerVersion.fromLayerVersionArn(stack, "OpencvLayer", opencvLayerArn);
      const layer2 = lambda.LayerVersion.fromLayerVersionArn(stack, "LibgthreadLayer", libgthreadLayerArn);

      const api = new Api(stack, "api", {
        routes: {
          "GET /": {
            function: {
              handler: "functions/lambda.handler",
              // The chrome-aws-lambda layer currently does not work in Node.js 16
              runtime: "python3.8",
              // Increase the timeout for generating screenshots
              timeout: 15,
              // Load Layer
              layers: [layer1, layer2],
            },
          },
        },
      });

      stack.addOutputs({
        ApiEndpoint: api.url,
        FunctionName: api.getFunction("GET /")?.functionName,
      });
    });
  },
} satisfies SSTConfig;
