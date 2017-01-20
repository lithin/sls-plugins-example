'use strict';
const AWS = require("aws-sdk");

module.exports.getUsers = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'get user',
      input: event,
    }),
  };

  callback(null, response);
};

module.exports.createUser = (event, context, callback) => {
  AWS.config.update({
    region: "eu-west-1",
    apiVersions: {
      dynamodb: '2012-08-10',
    }
  });
  const dynamodb = new AWS.DynamoDB();
  console.log(event);

  const params = {
    TableName: 'users',
    Key: {
     'Name': {
       S: event.name
      },
     'EmailAddress': {
       S: event.email
      }
    },
  };

  dynamodb.updateItem(params, function(err, data) {
    if (err) {
      callback("Unable to add item. Error JSON: " + JSON.stringify(err));
    } else {
      callback(null, "Added item:", JSON.stringify(data));
    }
  });
};
