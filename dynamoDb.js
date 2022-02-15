const DynamoDB = require("aws-sdk/clients/dynamodb")
const { nanoid } = require('nanoid')

const region = process.env.AWS_BUCKET_REGION
const accessKeyId = process.env.AWS_ACCESS_KEY
const secretAccessKey = process.env.AWS_SECRET_KEY
const table = process.env.AWS_DYNAMODB_TABLE

const dynamoDb = new DynamoDB.DocumentClient({
    region,
    accessKeyId,
    secretAccessKey
})

const getWalletInfo = async () => {
    const params = {
        TableName: table,
    }
    const data = await dynamoDb.scan(params).promise()
    console.log(data);
    return data
}

const createWalletInfo = async (wallet_address) => {
    const params = {
        TableName: table,
        Item: {
            "wallet_id": wallet_address,
            // "wallet_address": wallet_address,
        }
    }
    return await dynamoDb.put(params).promise()
}


const getWalletInfobyId = async (wallet_id) => {
    const params = {
        TableName: table,
        Key: { wallet_id }
    }

    const data = await dynamoDb.get(params).promise()
    console.log(data);
    return data
}

const deleteWalletInfobyId = async (wallet_id) => {
    const params = {
        TableName: table,
        Key: { wallet_id }
    }
    return await dynamoDb.delete(params).promise()
}

module.exports = { getWalletInfo, createWalletInfo, getWalletInfobyId, deleteWalletInfobyId }