'use strict';

import { DynamoDB } from 'aws-sdk'

const dynamoDb = new DynamoDB.DocumentClient()

module.exports.update = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);

  const params: any = {
    TableName: 'process.env.DYNAMODB_TABLE',
    Key: {
      id: event.pathParameters.id,
    },
    ExpressionAttributeNames: {
      '#userData': 'userData',
    },
    ExpressionAttributeValues: {
      ':userData': data,
      ':updatedAt': timestamp,
    },
    UpdateExpression: 'SET #userData = :userData, updatedAt = :updatedAt',
  };

  dynamoDb.update(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the todo item.',
      });
      return;
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
    callback(null, response);
  });
};