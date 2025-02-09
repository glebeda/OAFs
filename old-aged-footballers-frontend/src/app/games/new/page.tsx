'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGame, updateGame, getRecentGame, archiveGame } from '@/services/gameService';
import TeamSelection from '@/components/TeamSelection';
import toast from 'react-hot-toast';

interface GameFormData {
  date: string;
  notes?: string;
  teamA: {
    players: string[];
    score: number;
  };
  teamB: {
    players: string[];
    score: number;
  };
}

const GameWizard = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<GameFormData>({
    date: new Date().toISOString().split('T')[0],
    notes: '',
    teamA: {
      players: [],
      score: 0,
    },
    teamB: {
      players: [],
      score: 0,
    },
  });

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return !!formData.date;
      case 2:
        return formData.teamA.players.length > 0 && formData.teamB.players.length > 0;
      case 3:
        return true; // Scores can be 0
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (!validateStep(step)) {
      if (step === 2) {
        toast.error('Please select players for both teams');
      } else {
        toast.error('Please fill in all required fields');
      }
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      // First, get the current recent game
      const currentRecentGame = await getRecentGame();
      
      // If there is a recent game, archive it
      if (currentRecentGame) {
        await archiveGame(currentRecentGame.id);
      }

      // Create the new game
      const game = await createGame(formData);
      // Set it as the recent game
      await updateGame(game.id, { status: 'recent' });
      
      toast.success('Game created successfully');
      router.push('/games/recent');
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error('Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 1: Basic Game Info</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                rows={3}
              />
            </div>
            <button
              onClick={handleNextStep}
              disabled={loading}
              className="mt-4 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 2: Team Selection</h2>
            <TeamSelection
              teamAPlayers={formData.teamA.players}
              teamBPlayers={formData.teamB.players}
              onTeamAChange={(players) =>
                setFormData({
                  ...formData,
                  teamA: { ...formData.teamA, players },
                })
              }
              onTeamBChange={(players) =>
                setFormData({
                  ...formData,
                  teamB: { ...formData.teamB, players },
                })
              }
            />
            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                disabled={loading}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleNextStep}
                disabled={loading}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Step 3: Final Score</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Team A Score</label>
                <input
                  type="number"
                  min="0"
                  value={formData.teamA.score}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      teamA: { ...formData.teamA, score: parseInt(e.target.value) || 0 },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Team B Score</label>
                <input
                  type="number"
                  min="0"
                  value={formData.teamB.score}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      teamB: { ...formData.teamB, score: parseInt(e.target.value) || 0 },
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                disabled={loading}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Game'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Create New Game</h1>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((stepNumber) => (
            <div
              key={stepNumber}
              className={`flex items-center ${stepNumber < 3 ? 'flex-1' : ''}`}
            >
              <div
                className={`h-8 w-8 rounded-full ${
                  step >= stepNumber ? 'bg-indigo-600' : 'bg-gray-200'
                } flex items-center justify-center text-white font-medium`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && (
                <div
                  className={`h-1 flex-1 mx-4 ${
                    step > stepNumber ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      {renderStep()}
    </div>
  );
};

export default GameWizard; 