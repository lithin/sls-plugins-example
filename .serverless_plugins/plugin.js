const aws = require('aws-sdk');

const getDynamoDB = serverless => {
  aws.config.update({
    region: serverless.service.provider.region,
    apiVersions: {
      dynamodb: '2012-08-10',
    }
  });
  return new aws.DynamoDB();
}

const getTableName = (serverless, options, isUpload = false) => {
  const table = serverless.service.resources.Resources[options.resource].Properties.TableName;
  if (!isUpload) return table;
  return table.replace(serverless.service.custom.stage, options['target-stage']);
}

const downloadData = (serverless, options) => new Promise((resolve, reject) => {
  const dynamodb = getDynamoDB(serverless);

  const params = {
    TableName: getTableName(serverless, options),
  };

  dynamodb.scan(params, (error, result) => {
    if (error) {
      serverless.cli.log(`Error on downloading data! ${JSON.stringify(error)}`);
      return reject(error);
    }
    serverless.variables.copyData = result;
    serverless.cli.log(`Downloaded ${JSON.stringify(result.Items.length)} items`);
    return resolve(result);
  });
});

const getPutPromise = (dynamodb, params, serverless) => new Promise((resolve, reject) => {
  dynamodb.putItem(params, (error) => {
    if (error) {
      return reject(error);
    }
    serverless.cli.log(`Uploaded: ${JSON.stringify(params)}`);
    return resolve();
  });
});

const uploadData = (serverless, options) => new Promise((resolve, reject) => {
  const dynamodb = getDynamoDB(serverless);
  const uploads = [];

  serverless.variables.copyData.Items.forEach(data => {
    const params = {
      TableName: getTableName(serverless, options, true),
      Item: data
    };
    uploads.push(getPutPromise(dynamodb, params, serverless));
  });

  Promise.all(uploads).then(() => {
    serverless.cli.log('Data uploaded successfully!');
    resolve();
  }).catch(error => {
    serverless.cli.log(`Data upload failed: ${JSON.stringify(error)}`);
    reject(error);
  });
});

class CopyDataPlugin {
  constructor(serverless, options) {
    this.commands = {
      'copy-data': {
        lifecycleEvents: [
          'downloadData',
          'uploadData'
        ],
        usage: 'Pushes data from one database to another',
        options: {
          resource: {
            usage: 'Specify name of resource for your table',
            required: true
          },
          'target-stage': {
            usage: 'Stage you want to upload data to',
            required: true,
            shortcut: 't'
          }
        }
      },
    };

    this.hooks = {
      'copy-data:downloadData': downloadData.bind(null, serverless, options),
      'copy-data:uploadData': uploadData.bind(null, serverless, options),
    };
  }
}

module.exports = CopyDataPlugin;
