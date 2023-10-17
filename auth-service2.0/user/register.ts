'use strict'

import * as uuid from 'uuid'

import { DynamoDB } from 'aws-sdk'

const dynamoDb = new DynamoDB.DocumentClient()

module.exports.register = (event, context, callback) => {
  const timestamp = new Date().getTime()
  const data = JSON.parse(event.body)
  // if (typeof data.text !== 'string') {
  //   console.error('Validation Failed')
  //   callback(new Error('Couldn\'t create the user.'))
  //   return
  // }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: uuid.v1(),
      ...data,
      createdAt: timestamp,
      updatedAt: timestamp,
      deletedAt: null
    }
  }

  // write the todo to the database
  dynamoDb.put(params, (error, result) => {
    // handle potential errors
    if (error) {
      console.error(error)
      callback(new Error('Couldn\'t create the user'))
      return
    }

    // create a response
    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item)
    }
    callback(null, response)
  })
}
