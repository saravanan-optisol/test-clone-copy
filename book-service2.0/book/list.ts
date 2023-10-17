'use strict';

import { DynamoDB } from 'aws-sdk'
import axios from 'axios';
import * as jwt from 'jsonwebtoken';

const dynamoDb = new DynamoDB.DocumentClient()

module.exports.list = (event, context, callback) => {
  const token = event.headers.Authorization;
  const { id } = jwt.verify(token, 'jwt-secret');

  axios.get(`https://yqlqb4f5xd.execute-api.eu-west-2.amazonaws.com/dev/user/${id}`)
  .then((data) => {
    const userSubscriptions = data.data.subscriptions;
    const results = [];

    for (const subscription of userSubscriptions) {
      const params = {
        TableName: process.env.DYNAMODB_TABLE,
        FilterExpression: 'publication = :subscription',
        ExpressionAttributeValues: {
          ':subscription': subscription,
        },
      };
      
      dynamoDb.scan(params, (error, result): any => {
        if (error) {
          console.error(error);
          callback(null, {
            statusCode: error.statusCode || 501,
            headers: { 'Content-Type': 'text/plain' },
            body: 'Couldn\'t fetch the todos.',
          });
          return;
        }

        results.push(result.Items);
      });
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(results),
    };

    callback(null, response);
  }).catch((err) => {
    callback(null, {
      statusCode: 501,
      headers: { 'Content-Type': 'text/plain' },
      body: {Err:err, msg: 'Catch the error.'}
    });
  });
};
