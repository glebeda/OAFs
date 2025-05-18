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

  private calculateTeamScore(playerGoals: Record<string, number>, oppositeTeamGoals: Record<string, number>): number {
    // Sum up all positive goals for this team
    const positiveGoals = Object.values(playerGoals).reduce((sum, goals) => sum + Math.max(0, goals), 0);
    // Sum up all negative goals (own goals) from the opposite team
    const ownGoalsFromOpposite = Object.values(oppositeTeamGoals).reduce((sum, goals) => sum + Math.abs(Math.min(0, goals)), 0);
    return positiveGoals + ownGoalsFromOpposite;
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
        playerGoals: {
          ...currentGame.teamA.playerGoals,
          ...(updateData.teamA?.playerGoals || {}),
        },
      },
      teamB: {
        ...currentGame.teamB,
        ...(updateData.teamB || {}),
        playerGoals: {
          ...currentGame.teamB.playerGoals,
          ...(updateData.teamB?.playerGoals || {}),
        },
      },
      updatedAt: timestamp,
    };

    // Clean up goals for removed players
    if (updateData.teamA?.players) {
      const newPlayerGoals: Record<string, number> = {};
      updateData.teamA.players.forEach(playerId => {
        if (updatedGame.teamA.playerGoals[playerId] !== undefined) {
          newPlayerGoals[playerId] = updatedGame.teamA.playerGoals[playerId];
        }
      });
      updatedGame.teamA.playerGoals = newPlayerGoals;
    }

    if (updateData.teamB?.players) {
      const newPlayerGoals: Record<string, number> = {};
      updateData.teamB.players.forEach(playerId => {
        if (updatedGame.teamB.playerGoals[playerId] !== undefined) {
          newPlayerGoals[playerId] = updatedGame.teamB.playerGoals[playerId];
        }
      });
      updatedGame.teamB.playerGoals = newPlayerGoals;
    }

    // Recalculate scores if playerGoals were updated for either team
    if (updateData.teamA?.playerGoals || updateData.teamB?.playerGoals) {
      updatedGame.teamA.score = this.calculateTeamScore(
        updatedGame.teamA.playerGoals,
        updatedGame.teamB.playerGoals
      );
      updatedGame.teamB.score = this.calculateTeamScore(
        updatedGame.teamB.playerGoals,
        updatedGame.teamA.playerGoals
      );
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