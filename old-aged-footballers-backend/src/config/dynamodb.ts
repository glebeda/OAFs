import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const isLocal = process.env.NODE_ENV !== 'production';

// Table names with project prefix
export const TableNames = {
  PLAYERS: 'oaf_players',
  GAMES: 'oaf_games'
} as const;

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  ...(isLocal ? {
    endpoint: 'http://localhost:8000',
    credentials: {
      accessKeyId: 'local',
      secretAccessKey: 'local'
    }
  } : {
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
    }
  })
});

export const dynamoDb = DynamoDBDocumentClient.from(client); 