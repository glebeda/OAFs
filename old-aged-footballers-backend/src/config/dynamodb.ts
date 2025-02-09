import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const isLocal = process.env.NODE_ENV !== 'production';

// Table names with project prefix
export const TableNames = {
  PLAYERS: 'oaf_players',
  GAMES: 'oaf_games',
  SIGNUPS: 'oaf_signups'
} as const;

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'local',
  endpoint: isLocal ? 'http://localhost:8000' : undefined,
  credentials: isLocal ? {
    accessKeyId: 'local',
    secretAccessKey: 'local'
  } : undefined,
});

export const dynamoDb = DynamoDBDocumentClient.from(client); 