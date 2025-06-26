'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createGame, updateGame, getRecentGame, archiveGame } from '@/services/gameService';
import TeamSelection from '@/components/TeamSelection';
import AutoTeamSelector from '@/components/AutoTeamSelector';
import toast from 'react-hot-toast';
import { FaMagic, FaUsers } from 'react-icons/fa';

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
  const [teamSelectionMode, setTeamSelectionMode] = useState<'manual' | 'auto' | null>(null);
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
        return teamSelectionMode !== null;
      case 3:
        return formData.teamA.players.length > 0 && formData.teamB.players.length > 0;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (!validateStep(step)) {
      if (step === 2) {
        toast.error('Please select a team selection method');
      } else if (step === 3) {
        toast.error('Please select players for both teams');
      } else {
        toast.error('Please fill in all required fields');
      }
      return;
    }
    if (step === 3) {
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

  const handleAutoTeamSelection = (teamA: string[], teamB: string[]) => {
    setFormData({
      ...formData,
      teamA: { ...formData.teamA, players: teamA },
      teamB: { ...formData.teamB, players: teamB },
    });
    toast.success('Teams selected automatically!');
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
              <h2 className="text-xl font-semibold mb-6">Choose Team Selection Method</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Manual Selection */}
                <div
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    teamSelectionMode === 'manual'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setTeamSelectionMode('manual')}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-lg ${
                      teamSelectionMode === 'manual' ? 'bg-indigo-100' : 'bg-gray-100'
                    }`}>
                      <FaUsers className={`h-6 w-6 ${
                        teamSelectionMode === 'manual' ? 'text-indigo-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Manual Selection</h3>
                      <p className="text-sm text-gray-600">Choose players manually for each team</p>
                    </div>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Full control over team composition</li>
                    <li>• Traditional selection method</li>
                    <li>• Good for small groups</li>
                  </ul>
                </div>

                {/* Auto Selection */}
                <div
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                    teamSelectionMode === 'auto'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setTeamSelectionMode('auto')}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-lg ${
                      teamSelectionMode === 'auto' ? 'bg-indigo-100' : 'bg-gray-100'
                    }`}>
                      <FaMagic className={`h-6 w-6 ${
                        teamSelectionMode === 'auto' ? 'text-indigo-600' : 'text-gray-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Auto Team Balancing</h3>
                      <p className="text-sm text-gray-600">Balanced team selection</p>
                    </div>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Based on historical performance</li>
                    <li>• Considers team chemistry</li>
                    <li>• Ensures player rotation</li>
                  </ul>
                </div>
              </div>
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
                disabled={loading || teamSelectionMode === null}
                className="w-full sm:w-auto px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            {teamSelectionMode === 'manual' ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Manual Team Selection</h2>
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
            ) : (
              <AutoTeamSelector
                onTeamSelection={handleAutoTeamSelection}
                initialTeamA={formData.teamA.players}
                initialTeamB={formData.teamB.players}
              />
            )}

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setStep(2)}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 text-base font-medium text-gray-700 bg-white rounded-lg shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back to Selection Method
              </button>
              <button
                onClick={handleNextStep}
                disabled={loading || formData.teamA.players.length === 0 || formData.teamB.players.length === 0}
                className="w-full sm:w-auto px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
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
            {[1, 2, 3].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex items-center ${stepNumber < 3 ? 'flex-1' : ''}`}
              >
                <div
                  className={`h-10 w-10 rounded-full ${
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

        <div className={step === 1 ? 'max-w-lg mx-auto' : ''}>
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default GameWizard; 