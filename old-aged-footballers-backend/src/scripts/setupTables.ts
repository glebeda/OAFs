import { CreateTableCommand, DynamoDBClient, ListTablesCommand, DeleteTableCommand } from '@aws-sdk/client-dynamodb';
import { TableNames } from '../config/dynamodb';

const client = new DynamoDBClient({
  region: 'local',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy'
  }
});

async function deleteTableIfExists(tableName: string) {
  try {
    const command = new DeleteTableCommand({
      TableName: tableName
    });
    await client.send(command);
    console.log(`Table ${tableName} deleted successfully`);
  } catch (error) {
    if ((error as any).name === 'ResourceNotFoundException') {
      console.log(`Table ${tableName} does not exist`);
    } else {
      throw error;
    }
  }
}

async function createPlayersTable() {
  const command = new CreateTableCommand({
    TableName: TableNames.PLAYERS,
    AttributeDefinitions: [
      { AttributeName: 'id', AttributeType: 'S' },
      { AttributeName: 'name', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'id', KeyType: 'HASH' },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: 'NameIndex',
        KeySchema: [
          { AttributeName: 'name', KeyType: 'HASH' },
        ],
        Projection: {
          ProjectionType: 'ALL'
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    ],
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  });

  try {
    const response = await client.send(command);
    console.log('Players table created successfully:', response);
  } catch (error) {
    if ((error as any).name === 'ResourceInUseException') {
      console.log('Players table already exists');
    } else {
      console.error('Error creating players table:', error);
      throw error;
    }
  }
}

async function setupTables() {
  try {
    // List existing tables
    const listTablesResponse = await client.send(new ListTablesCommand({}));
    console.log('Existing tables:', listTablesResponse.TableNames);

    // Delete existing players table if it exists
    await deleteTableIfExists(TableNames.PLAYERS);

    // Create tables
    await createPlayersTable();

    console.log('Table setup completed successfully');
  } catch (error) {
    console.error('Error setting up tables:', error);
    process.exit(1);
  }
}

// Run the setup
setupTables(); 