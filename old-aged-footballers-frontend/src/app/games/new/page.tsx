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
  };
  teamB: {
    players: string[];
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
    },
    teamB: {
      players: [],
    },
  });

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        return !!formData.date;
      case 2:
        return formData.teamA.players.length > 0 && formData.teamB.players.length > 0;
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
    if (step === 2) {
      handleSubmit();
    } else {
      setStep(step + 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      
      // First, create the new game as a draft
      const newGame = await createGame(formData);
      
      // Then, get and archive the current recent game if it exists
      const currentRecentGame = await getRecentGame();
      if (currentRecentGame) {
        await archiveGame(currentRecentGame.id);
      }

      // Finally, set the new game as recent
      await updateGame(newGame.id, { 
        status: 'recent',
        teamA: {
          ...newGame.teamA,
          score: 0,
          playerGoals: {},
        },
        teamB: {
          ...newGame.teamB,
          score: 0,
          playerGoals: {},
        }
      });
      
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
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Game Details</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game Notes <span className="text-gray-400 text-sm font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any notes about the game..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    rows={4}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleNextStep}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Team Selection
            </button>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-6">Team Selection</h2>
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
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setStep(1)}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 text-base font-medium text-gray-700 bg-white rounded-lg shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back to Game Details
              </button>
              <button
                onClick={handleNextStep}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Game...' : 'Create Game'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-lg md:max-w-5xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Game</h1>
        
        {/* Progress indicator */}
        <div className="mb-6 max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            {[1, 2].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex items-center ${stepNumber < 2 ? 'flex-1' : ''}`}
              >
                <div
                  className={`h-10 w-10 rounded-full ${
                    step >= stepNumber ? 'bg-indigo-600' : 'bg-gray-200'
                  } flex items-center justify-center text-white font-medium`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 2 && (
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

        <div className={step === 1 ? 'max-w-lg mx-auto' : ''}>
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default GameWizard; 