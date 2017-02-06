'use strict';
const AWS = require("aws-sdk");

module.exports.getUsers = (event, context, callback) => {
  AWS.config.update({
    region: "eu-west-1",
    apiVersions: {
      dynamodb: '2012-08-10',
    }
  });
  const dynamodb = new AWS.DynamoDB();

  const params = {
    TableName: event.table
  };

  dynamodb.scan(params, function(err, data) {
    if (err) {
      callback("Unable to get items. Error JSON: " + JSON.stringify(err));
    } else {
      callback(null, data);
    }
  });
};

module.exports.createUser = (event, context, callback) => {
  AWS.config.update({
    region: "eu-west-1",
    apiVersions: {
      dynamodb: '2012-08-10',
    }
  });
  const dynamodb = new AWS.DynamoDB();

  const params = {
    TableName: event.table,
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
      callback(null, "Added item: " + JSON.stringify(data));
    }
  });
};
