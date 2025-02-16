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
        players: gameData.teamA.players,
        playerGoals: {},
        score: 0,
      },
      teamB: {
        players: gameData.teamB.players,
        playerGoals: {},
        score: 0,
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

  private calculateTeamScore(playerGoals: Record<string, number>): number {
    return Object.values(playerGoals).reduce((sum, goals) => sum + goals, 0);
  }

  async updateGame(id: string, updateData: UpdateGameDto): Promise<Game> {
    const timestamp = new Date().toISOString();
    
    // Get the current game state
    const currentGame = await this.getGame(id);
    if (!currentGame) {
      throw new Error('Game not found');
    }

    // Prepare the update with score calculations if playerGoals are being updated
    const updatedGame: Game = {
      ...currentGame,
      ...updateData,
      teamA: {
        ...currentGame.teamA,
        ...(updateData.teamA || {}),
      },
      teamB: {
        ...currentGame.teamB,
        ...(updateData.teamB || {}),
      },
      updatedAt: timestamp,
    };

    // Recalculate scores if playerGoals were updated
    if (updateData.teamA?.playerGoals) {
      updatedGame.teamA.score = this.calculateTeamScore(updatedGame.teamA.playerGoals);
    }
    if (updateData.teamB?.playerGoals) {
      updatedGame.teamB.score = this.calculateTeamScore(updatedGame.teamB.playerGoals);
    }

    await dynamoDb.send(new PutCommand({
      TableName: this.tableName,
      Item: updatedGame,
    }));

    return updatedGame;
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