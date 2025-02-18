import { PutCommand, GetCommand, QueryCommand, DeleteCommand, UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from '../config/dynamodb';
import { TableNames } from '../config/dynamodb';
import { Player, CreatePlayerDto, UpdatePlayerDto } from '../types/player';
import { v4 as uuidv4 } from 'uuid';

export class PlayerService {
  private readonly tableName = TableNames.PLAYERS;

  async createPlayer(playerData: CreatePlayerDto): Promise<Player> {
    try {
      console.log('PlayerService: Starting player creation');
      
      // Check if player with this name already exists
      console.log('PlayerService: Checking for existing player with name:', playerData.name);
      const existingPlayer = await this.getPlayerByName(playerData.name);
      if (existingPlayer) {
        throw new Error('Player with this name already exists');
      }

      const now = new Date().toISOString();
      const player: Player = {
        id: uuidv4(),
        ...playerData,
        gamesPlayed: 0,
        goalsScored: 0,
        createdAt: now,
        updatedAt: now,
      };

      console.log('PlayerService: Attempting to save player:', JSON.stringify(player, null, 2));
      console.log('PlayerService: Using table:', this.tableName);

      await dynamoDb.send(new PutCommand({
        TableName: this.tableName,
        Item: player,
      }));

      console.log('PlayerService: Player created successfully');
      return player;
    } catch (error) {
      console.error('PlayerService: Error in createPlayer:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        playerData,
        tableName: this.tableName
      });
      throw error;
    }
  }

  async getPlayerById(id: string): Promise<Player | null> {
    const response = await dynamoDb.send(new GetCommand({
      TableName: this.tableName,
      Key: { id },
    }));

    return response.Item as Player || null;
  }

  async getPlayerByName(name: string): Promise<Player | null> {
    const response = await dynamoDb.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: 'NameIndex',
      KeyConditionExpression: '#name = :name',
      ExpressionAttributeNames: {
        '#name': 'name',
      },
      ExpressionAttributeValues: {
        ':name': name,
      },
    }));

    return response.Items?.[0] as Player || null;
  }

  async getAllPlayers(): Promise<Player[]> {
    const response = await dynamoDb.send(new ScanCommand({
      TableName: this.tableName,
    }));

    return (response.Items || []) as Player[];
  }

  async updatePlayer(id: string, updateData: UpdatePlayerDto): Promise<Player> {
    // Check if player exists
    const existingPlayer = await this.getPlayerById(id);
    if (!existingPlayer) {
      throw new Error('Player not found');
    }

    // If name is being updated, check for uniqueness
    if (updateData.name && updateData.name !== existingPlayer.name) {
      const playerWithNewName = await this.getPlayerByName(updateData.name);
      if (playerWithNewName) {
        throw new Error('Player with this name already exists');
      }
    }

    // Build update expression
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    // Add updatedAt
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const response = await dynamoDb.send(new UpdateCommand({
      TableName: this.tableName,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }));

    return response.Attributes as Player;
  }

  async deletePlayer(id: string): Promise<void> {
    await dynamoDb.send(new DeleteCommand({
      TableName: this.tableName,
      Key: { id },
    }));
  }
} 