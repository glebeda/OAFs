import { DynamoDB } from 'aws-sdk';
import { TableNames } from '../config/dynamodb';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables based on NODE_ENV
const isLocal = process.env.NODE_ENV !== 'production';
const envFile = isLocal ? '.env' : '.env.production';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

console.log('Using AWS Region:', process.env.AWS_REGION);

const dynamodb = new DynamoDB({
  region: process.env.AWS_REGION,
  ...(isLocal ? {
    endpoint: 'http://localhost:8000',
    accessKeyId: 'local',
    secretAccessKey: 'local'
  } : {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  })
});

const tables = [
  {
    TableName: TableNames.PLAYERS,
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'name', AttributeType: 'S' }
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'NameIndex',
        KeySchema: [{ AttributeName: 'name', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      }
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  },
  {
    TableName: TableNames.GAMES,
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'status', AttributeType: 'S' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'StatusIndex',
        KeySchema: [{ AttributeName: 'status', KeyType: 'HASH' }],
        Projection: { ProjectionType: 'ALL' },
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
      },
    ],
    ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 },
  }
];

async function createTables() {
  for (const tableConfig of tables) {
    try {
      console.log(`Creating table: ${tableConfig.TableName}`);
      await dynamodb.createTable(tableConfig).promise();
      console.log(`Table ${tableConfig.TableName} created successfully`);
    } catch (error: any) {
      if (error.code === 'ResourceInUseException') {
        console.log(`Table ${tableConfig.TableName} already exists`);
      } else {
        console.error(`Error creating table ${tableConfig.TableName}:`, error);
      }
    }
  }
}

createTables(); 