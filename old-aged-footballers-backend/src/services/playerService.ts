import { PutCommand, GetCommand, QueryCommand, DeleteCommand, UpdateCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../config/dynamodb';
import { TableNames } from '../config/dynamodb';
import { Player, CreatePlayerDto, UpdatePlayerDto } from '../types/player';
import { v4 as uuidv4 } from 'uuid';

export class PlayerService {
  private readonly tableName = TableNames.PLAYERS;

  async createPlayer(playerData: CreatePlayerDto): Promise<Player> {
    // Check if player with this name already exists
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

    await docClient.send(new PutCommand({
      TableName: this.tableName,
      Item: player,
    }));

    return player;
  }

  async getPlayerById(id: string): Promise<Player | null> {
    const response = await docClient.send(new GetCommand({
      TableName: this.tableName,
      Key: { id },
    }));

    return response.Item as Player || null;
  }

  async getPlayerByName(name: string): Promise<Player | null> {
    const response = await docClient.send(new QueryCommand({
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
    const response = await docClient.send(new ScanCommand({
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

    const response = await docClient.send(new UpdateCommand({
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
    await docClient.send(new DeleteCommand({
      TableName: this.tableName,
      Key: { id },
    }));
  }
} 