import { PutCommand, GetCommand, QueryCommand, DeleteCommand, UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import { Game, CreateGameDto, UpdateGameDto } from '../types/game';
import { dynamoDb, TableNames } from '../config/dynamodb';

export class GameService {
  private readonly tableName = TableNames.GAMES;

  async createGame(gameData: CreateGameDto): Promise<Game> {
    const timestamp = new Date().toISOString();
    const game: Game = {
      id: uuidv4(),
      ...gameData,
      teamA: {
        ...gameData.teamA,
        playerGoals: {},
      },
      teamB: {
        ...gameData.teamB,
        playerGoals: {},
      },
      status: 'draft',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await dynamoDb.send(new PutCommand({
      TableName: this.tableName,
      Item: game,
    }));

    return game;
  }

  async getGame(id: string): Promise<Game | null> {
    const result = await dynamoDb.send(new GetCommand({
      TableName: this.tableName,
      Key: { id },
    }));

    return result.Item as Game || null;
  }

  async updateGame(id: string, updateData: UpdateGameDto): Promise<Game | null> {
    const timestamp = new Date().toISOString();
    const updateExpressions: string[] = ['#updatedAt = :updatedAt'];
    const expressionAttributeNames: Record<string, string> = { '#updatedAt': 'updatedAt' };
    const expressionAttributeValues: Record<string, any> = { ':updatedAt': timestamp };

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    const result = await dynamoDb.send(new UpdateCommand({
      TableName: this.tableName,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }));

    return result.Attributes as Game || null;
  }

  async listGames(): Promise<Game[]> {
    const result = await dynamoDb.send(new ScanCommand({
      TableName: this.tableName,
    }));

    return (result.Items || []) as Game[];
  }

  async getRecentGame(): Promise<Game | null> {
    const result = await dynamoDb.send(new ScanCommand({
      TableName: this.tableName,
      FilterExpression: '#status = :status',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':status': 'recent',
      },
    }));

    const games = result.Items as Game[] || [];
    return games.length > 0 ? games[0] : null;
  }

  async archiveGame(id: string): Promise<Game | null> {
    return this.updateGame(id, { status: 'archived' });
  }
} 