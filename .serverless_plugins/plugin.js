import aws from 'aws-sdk';

const downloadData = () => {
  aws.scan(serverless.tableName, () => {
    // put the data somewhere
  });
};

const uploadData = () => {
  //pick up the data from somewhere
  data.forEach(d => {
    aws.putItem(serverless.tableName, () => {});
  });
};

class MyPlugin {
  constructor() {
    this.commands = {
      backup: {
        lifecycleEvents: [
          'downloadData',
          'uploadData'
        ]
      },
    };

    this.hooks = {
      'backup:downloadData': downloadData,
      'backup:uploadData': uploadData,
    };
  }
}

module.exports = MyPlugin;
