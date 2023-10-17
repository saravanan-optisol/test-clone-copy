'use strict';

import { DynamoDB } from 'aws-sdk';
import * as jwt from 'jsonwebtoken';

const dynamoDb = new DynamoDB.DocumentClient()


module.exports.get = (event, context, callback) => {
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
        body: 'Couldn\'t fetch the book data.',
      });
      return;
    }

    const token = event.headers.Authorization;
    const { subscription_type } = jwt.verify(token, 'jwt-secret');
    let response: {statusCode: number, body: string};

    const prize = result.Item.prize.slice(1);
    console.log(subscription_type, '--ST--');
    if (subscription_type === 'free' && prize > 399) {
      response = {
        statusCode: 400,
        body: 'Please upgrade your subscription level to access this book',
      };
    } else if (subscription_type === 'pro' && prize > 799) {
      response = {
        statusCode: 400,
        body: 'Please upgrade your subscription level to access this book',
      };
    } else {
      response = {
        statusCode: 200,
        body: JSON.stringify(result.Item),
      };
    }

    callback(null, response);
  });
};