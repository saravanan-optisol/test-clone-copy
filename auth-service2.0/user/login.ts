'use strict';

import { DynamoDB } from 'aws-sdk';
import * as jwt from 'jsonwebtoken';

const dynamoDb = new DynamoDB.DocumentClient()


module.exports.login = (event, context, callback) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
  };

  // fetch todo from the database
  dynamoDb.get(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Couldn\'t fetch the user data.',
      });
      return;
    }

    let payload = {
      id: result.Item.id, 
      subscription_type: result.Item.subscription_type
    };

    jwt.sign(
      payload,
      'jwt-secret',
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;

        const response = {
          statusCode: 200,
          body: JSON.stringify(token),
        };
        callback(null, response);
      }
    );
  });
};