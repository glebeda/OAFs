import { GetCommandOutput, PutCommandOutput, QueryCommandOutput, ScanCommandOutput, UpdateCommandOutput, DeleteCommandOutput } from '@aws-sdk/lib-dynamodb';

export const mockDynamoDb = {
  send: jest.fn(),
};

export const mockPlayer = {
  id: '123',
  name: 'John Doe',
  email: 'john@example.com',
  phoneNumber: '+1234567890',
  isActive: true,
  joinedDate: '2024-02-08',
  gamesPlayed: 0,
  goalsScored: 0,
  createdAt: '2024-02-08T00:00:00.000Z',
  updatedAt: '2024-02-08T00:00:00.000Z',
};

export const mockGetCommandOutput: GetCommandOutput = {
  Item: mockPlayer,
  $metadata: {},
};

export const mockPutCommandOutput: PutCommandOutput = {
  $metadata: {},
};

export const mockQueryCommandOutput: QueryCommandOutput = {
  Items: [mockPlayer],
  $metadata: {},
};

export const mockScanCommandOutput: ScanCommandOutput = {
  Items: [mockPlayer],
  $metadata: {},
};

export const mockUpdateCommandOutput: UpdateCommandOutput = {
  Attributes: mockPlayer,
  $metadata: {},
};

export const mockDeleteCommandOutput: DeleteCommandOutput = {
  $metadata: {},
}; 