import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// Table names with project prefix
export const TableNames = {
  PLAYERS: 'oaf_players',
  GAMES: 'oaf_games',
  SIGNUPS: 'oaf_signups'
} as const;

// Create DynamoDB client
const client = new DynamoDBClient({
  region: 'local',
  endpoint: 'http://localhost:8000',
  credentials: {
    accessKeyId: 'dummy',
    secretAccessKey: 'dummy'
  }
});

// Create DocumentClient for easier DynamoDB interactions
export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
}); 