import { Game, Player } from '@/types';
import Image from 'next/image';
import { FaFutbol } from 'react-icons/fa';
import { GoalInput } from './GoalInput';

// Static team emblems (we can make these dynamic later)
const TEAM_A_EMBLEM = 'https://resources.premierleague.com/premierleague/badges/rb/t21.svg'; // West Ham
const TEAM_B_EMBLEM = 'https://resources.premierleague.com/premierleague/badges/rb/t6.svg';  // Tottenham

interface GameDisplayProps {
  game: Game;
  players: Record<string, Player>;
  onGoalUpdate?: (playerId: string, team: 'teamA' | 'teamB', goals: number) => void;
  isEditable?: boolean;
}

export function GameDisplay({ game, players, onGoalUpdate, isEditable = false }: GameDisplayProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Match Header */}
      <div className="text-center mb-8">
        <h1 className="text-xl text-gray-600 mb-2">
          {new Date(game.date).toLocaleDateString()}
        </h1>
        {game.notes && <p className="text-sm text-gray-500 mt-1">{game.notes}</p>}
      </div>

      {/* Match Display */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-12">
        {/* Team A */}
        <div className="hidden sm:flex flex-col items-center w-1/3">
          <div className="w-24 h-24 relative mb-4 flex items-center justify-center">
            <div className="relative w-20 h-20">
              <Image
                src={TEAM_A_EMBLEM}
                alt="Bibs"
                fill
                priority
                className="object-contain"
              />
            </div>
          </div>
          <h2 className="text-xl font-semibold">Bibs</h2>
        </div>

        {/* Score Section */}
        <div className="flex items-center justify-center w-full sm:w-1/3">
          {/* Mobile Team Icons + Score */}
          <div className="flex sm:hidden items-center space-x-4">
            <div className="flex items-center">
              <div className="w-12 h-12 relative mr-3 flex items-center justify-center">
                <div className="relative w-10 h-10">
                  <Image
                    src={TEAM_A_EMBLEM}
                    alt="Bibs"
                    fill
                    priority
                    className="object-contain"
                  />
                </div>
              </div>
              <span className="text-4xl font-bold">{game.teamA.score}</span>
            </div>
            <span className="text-3xl font-light text-gray-400">-</span>
            <div className="flex items-center">
              <span className="text-4xl font-bold">{game.teamB.score}</span>
              <div className="w-12 h-12 relative ml-3 flex items-center justify-center">
                <div className="relative w-10 h-10">
                  <Image
                    src={TEAM_B_EMBLEM}
                    alt="Shirts"
                    fill
                    priority
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Desktop Score Only */}
          <div className="hidden sm:flex items-center space-x-8">
            <span className="text-5xl font-bold">{game.teamA.score}</span>
            <span className="text-4xl font-light text-gray-400">-</span>
            <span className="text-5xl font-bold">{game.teamB.score}</span>
          </div>
        </div>

        {/* Team B */}
        <div className="hidden sm:flex flex-col items-center w-1/3">
          <div className="w-24 h-24 relative mb-4 flex items-center justify-center">
            <div className="relative w-20 h-20">
              <Image
                src={TEAM_B_EMBLEM}
                alt="Shirts"
                fill
                priority
                className="object-contain"
              />
            </div>
          </div>
          <h2 className="text-xl font-semibold">Shirts</h2>
        </div>
      </div>

      {/* Players and Goals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mt-8">
        {/* Team Names for Mobile */}
        <div className="sm:hidden text-lg font-semibold mb-2">Bibs</div>
        {/* Team A Players */}
        <div className="space-y-3">
          {game.teamA.players.map((playerId) => (
            <div key={playerId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <span className="font-medium">{players[playerId]?.name}</span>
              <div className="flex items-center space-x-3">
                {isEditable ? (
                  <GoalInput
                    value={game.teamA.playerGoals[playerId] || 0}
                    onChange={(goals) => onGoalUpdate?.(playerId, 'teamA', goals)}
                  />
                ) : (
                  <span className="w-8 text-center font-medium">
                    {game.teamA.playerGoals[playerId] || 0}
                  </span>
                )}
                <FaFutbol className="text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        {/* Team Names for Mobile */}
        <div className="sm:hidden text-lg font-semibold mb-2 mt-6">Shirts</div>
        {/* Team B Players */}
        <div className="space-y-3">
          {game.teamB.players.map((playerId) => (
            <div key={playerId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <span className="font-medium">{players[playerId]?.name}</span>
              <div className="flex items-center space-x-3">
                {isEditable ? (
                  <GoalInput
                    value={game.teamB.playerGoals[playerId] || 0}
                    onChange={(goals) => onGoalUpdate?.(playerId, 'teamB', goals)}
                  />
                ) : (
                  <span className="w-8 text-center font-medium">
                    {game.teamB.playerGoals[playerId] || 0}
                  </span>
                )}
                <FaFutbol className="text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 