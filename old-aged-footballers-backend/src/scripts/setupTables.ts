import { DynamoDB } from 'aws-sdk';
import { TableNames } from '../config/dynamodb';

const isLocal = process.env.NODE_ENV !== 'production';
const dynamodb = new DynamoDB({
  region: process.env.AWS_REGION || 'local',
  endpoint: isLocal ? 'http://localhost:8000' : undefined,
  accessKeyId: isLocal ? 'local' : undefined,
  secretAccessKey: isLocal ? 'local' : undefined,
});

const tables = [
  {
    TableName: TableNames.PLAYERS,
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
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
  },
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