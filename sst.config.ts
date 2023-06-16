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

      const api = new Api(stack, "api", {
        routes: {
          "GET /": "functions/lambda.handler",
        },
        functionProps: {
          layers: [
            lambda.LayerVersion.fromLayerVersionArn(stack, "OpencvLayer", opencvLayerArn),
            lambda.LayerVersion.fromLayerVersionArn(stack, "LibgthreadLayer", libgthreadLayerArn),
          ],
        },
      });

      stack.addOutputs({
        ApiEndpoint: api.url,
        Funcname: api.getFunction.name,
      });
    });
  },
} satisfies SSTConfig;
