const aws = require('aws-sdk');

const downloadData = (serverless, options) => {
  const { Resources } = serverless.service.resources;
  const { resource } = options;
  console.log(options);
  console.log('aws', Resources[resource].Properties.TableName);
  // console.log('variables', serverless.variables);
  // console.log('config', serverless.config);
  return;

  AWS.config.update({
    region: serverless.service.provider.region,
    apiVersions: {
      dynamodb: '2012-08-10',
    }
  });
  const dynamodb = new AWS.DynamoDB();

  const params = {
    tableName: serverless.tableName
  };

  dynamodb.scan(params, (err, result) => {
    if (err) {
      serverless.cli('Oh no down! ', err);
    }
    serverless.data = result;
    serverless.cli('All good down! ', result);
  });
};

const uploadData = () => {
  console.log('upload');
  return;

  AWS.config.update({
    region: "eu-west-1",
    apiVersions: {
      dynamodb: '2012-08-10',
    }
  });
  const dynamodb = new AWS.DynamoDB();

  serverless.data.forEach(d => {
    const params = {
      tableName: serverless.tableName,
      Key: {
       'Name': {
         S: d.Name
        },
       'EmailAddress': {
         S: d.EmailAddress
        }
      }
    };
    dynamodb.putItem(params, (err, result) => {
      if (err) {
        serverless.cli('Oh no up! ', err);
      }
      serverless.cli('All good up! ', result);
    });
  });
};

class MyPlugin {
  constructor(serverless, options) {
    this.commands = {
      backup: {
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
          stage: {
            usage: 'Stage you want to get data from',
            required: true,
            shortcut: 's'
          },
          backup: {
            usage: 'Stage you want to get data from',
            required: true,
            shortcut: 'b'
          }
        }
      },
    };

    this.hooks = {
      'backup:downloadData': downloadData.bind(null, serverless, options),
      'backup:uploadData': uploadData.bind(null, serverless, options),
    };
  }
}

module.exports = MyPlugin;
