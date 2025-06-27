'use client';

import { useState, useEffect, useRef } from 'react';
import { Player } from '@/types';
import { 
  getTeamSuggestions, 
  getPlayerRatings, 
  TeamSuggestion, 
  PlayerRating, 
  TeamBalancingOptions 
} from '@/services/teamBalancingService';
import { listPlayers } from '@/services/playerService';
import { FaMagic, FaCog, FaCheck } from 'react-icons/fa';
import { Spinner } from './Spinner';
import { useSearchParams } from 'next/navigation';

interface AutoTeamSelectorProps {
  onTeamSelection: (teamA: string[], teamB: string[]) => void;
  initialTeamA?: string[];
  initialTeamB?: string[];
  onEffortIllusionChange?: (active: boolean) => void;
  onEffortIllusionMessageChange?: (message: string) => void;
}

const FUNNY_MESSAGES = [
  'Calling Gurt to confirm the teams...',
  'Consulting the football gods...',
  'Crunching numbers and egos...'
];

export default function AutoTeamSelector({ 
  onTeamSelection, 
  initialTeamA = [], 
  initialTeamB = [], 
  onEffortIllusionChange,
  onEffortIllusionMessageChange
}: AutoTeamSelectorProps) {
  const [loading, setLoading] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<TeamSuggestion[]>([]);
  const [playerRatings, setPlayerRatings] = useState<PlayerRating[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<TeamBalancingOptions>({
    skillWeight: 0.4,
    chemistryWeight: 0.3,
    rotationWeight: 0.3,
    maxSuggestions: 3,
  });
  const searchParams = useSearchParams();
  const showRatings = searchParams.get('showRatings') === '1';
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState<number | null>(null);
  const firstSuggestionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Initialize selected players from initial teams
    const allInitialPlayers = [...initialTeamA, ...initialTeamB];
    if (allInitialPlayers.length > 0) {
      setSelectedPlayers(allInitialPlayers);
    }
  }, [initialTeamA, initialTeamB]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [playersData, ratingsData] = await Promise.all([
        listPlayers(),
        getPlayerRatings(),
      ]);
      
      setPlayers(playersData);
      setPlayerRatings(ratingsData.playerRatings);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = async () => {
    if (selectedPlayers.length < 6) {
      alert('Please select at least 6 players for team suggestions');
      return;
    }

    // Calculate team size based on number of selected players
    const teamSize = Math.floor(selectedPlayers.length / 2);

    if (typeof onEffortIllusionChange === 'function') onEffortIllusionChange(true);
    if (typeof onEffortIllusionMessageChange === 'function') onEffortIllusionMessageChange(FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)]);
    setLoading(true);
    try {
      const resultPromise = getTeamSuggestions(selectedPlayers, {
        ...options,
        minTeamSize: teamSize,
        maxTeamSize: teamSize,
      });
      // Wait for both: backend and at least 3 seconds
      const [result] = await Promise.all([
        resultPromise,
        new Promise(res => setTimeout(res, 3000))
      ]);
      setSuggestions(result.suggestions);
      setTimeout(() => {
        if (firstSuggestionRef.current) {
          firstSuggestionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100); // slight delay to ensure DOM update
    } catch (error) {
      console.error('Error generating suggestions:', error);
      alert('Failed to generate team suggestions');
    } finally {
      setLoading(false);
      if (typeof onEffortIllusionChange === 'function') onEffortIllusionChange(false);
      if (typeof onEffortIllusionMessageChange === 'function') onEffortIllusionMessageChange('');
    }
  };

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleSuggestionSelect = (suggestion: TeamSuggestion, index: number) => {
    setSelectedSuggestionIndex(index);
    onTeamSelection(suggestion.teamA, suggestion.teamB);
  };

  const getPlayerRating = (playerId: string) => {
    return playerRatings.find(r => r.id === playerId);
  };

  const getSkillLevel = (rating: number) => {
    if (rating >= 70) return { level: 'High', color: 'text-green-600', bg: 'bg-green-50' };
    if (rating >= 40) return { level: 'Medium', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { level: 'Low', color: 'text-red-600', bg: 'bg-red-50' };
  };

  if (loading && !players.length) {
    return (
      <div className="flex flex-col items-center gap-4 p-8">
        <Spinner size="lg" />
        <p className="text-gray-600">Loading team balancing data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <FaMagic className="h-6 w-6" />
          <h2 className="text-xl font-bold">Auto Team Selector</h2>
        </div>
        <p className="text-blue-100">
          Team balancing based on historical performance, chemistry, and player rotation
        </p>
      </div>

      {/* Player Selection */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Select Players</h3>
          <div className="text-sm text-gray-600">
            {selectedPlayers.length} selected
            {selectedPlayers.length >= 6 && (
              <span className="ml-2 text-blue-600 font-medium">
                → {Math.floor(selectedPlayers.length / 2)} per team
              </span>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
          {[...players].sort((a, b) => a.name.localeCompare(b.name)).map(player => {
            const rating = getPlayerRating(player.id);
            const skillLevel = rating ? getSkillLevel(rating.skillRating) : null;
            const isSelected = selectedPlayers.includes(player.id);
            
            return (
              <div
                key={player.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handlePlayerToggle(player.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{player.name}</p>
                    {showRatings && rating && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded ${skillLevel?.bg} ${skillLevel?.color}`}>
                          {skillLevel?.level}
                        </span>
                        <span className="text-xs text-gray-500">
                          {rating.skillRating.toFixed(0)} pts
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {isSelected && <FaCheck className="w-3 h-3 text-white" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Advanced Options */}
      <div className="sm:bg-white sm:rounded-lg sm:shadow-sm sm:border sm:p-6 p-0 mb-2">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-2 py-1 text-sm rounded-md w-auto"
        >
          <FaCog className="h-4 w-4" />
          <span>Advanced Options</span>
        </button>
        {showAdvanced && (
          <div className="mt-3 sm:mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Skill Weight
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={options.skillWeight || 0.4}
                  onChange={(e) => setOptions(prev => ({ 
                    ...prev, 
                    skillWeight: parseFloat(e.target.value) 
                  }))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {(options.skillWeight || 0.4) * 100}%
                </div>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Chemistry Weight
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={options.chemistryWeight || 0.3}
                  onChange={(e) => setOptions(prev => ({ 
                    ...prev, 
                    chemistryWeight: parseFloat(e.target.value) 
                  }))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {(options.chemistryWeight || 0.3) * 100}%
                </div>
              </div>
              
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Rotation Weight
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={options.rotationWeight || 0.3}
                  onChange={(e) => setOptions(prev => ({ 
                    ...prev, 
                    rotationWeight: parseFloat(e.target.value) 
                  }))}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {(options.rotationWeight || 0.3) * 100}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="flex justify-center">
        <button
          onClick={generateSuggestions}
          disabled={loading || selectedPlayers.length < 6}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              Generating Suggestions...
            </>
          ) : (
            <>
              <FaMagic className="h-4 w-4" />
              Generate Team Suggestions
            </>
          )}
        </button>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Team Suggestions</h3>
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              ref={index === 0 ? firstSuggestionRef : undefined}
              className={`bg-white rounded-lg shadow-sm border p-6 transition-all relative ${
                selectedSuggestionIndex === index
                  ? 'border-blue-600 ring-2 ring-blue-200'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2 sm:gap-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">Suggestion {index + 1}</span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                    Score: {suggestion.totalScore.toFixed(1)}
                  </span>
                </div>
                <button
                  onClick={() => handleSuggestionSelect(suggestion, index)}
                  className={`px-4 py-2 rounded-lg text-sm mt-2 sm:mt-0 transition-colors flex items-center justify-center gap-2
                    ${selectedSuggestionIndex === index
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed opacity-80'
                      : 'bg-blue-600 text-white hover:bg-blue-700'}
                  `}
                  disabled={selectedSuggestionIndex === index}
                >
                  {selectedSuggestionIndex === index ? (
                    <><FaCheck className="w-4 h-4" /> Teams Selected</>
                  ) : (
                    'Use These Teams'
                  )}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team A */}
                <div>
                  <h4 className="font-medium text-blue-600 mb-3">Bibs</h4>
                  <div className="space-y-2">
                    {suggestion.teamA.map(playerId => {
                      const player = players.find(p => p.id === playerId);
                      const rating = getPlayerRating(playerId);
                      return (
                        <div key={playerId} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                          <span className="font-medium">{player?.name}</span>
                          {showRatings && rating && (
                            <span className="text-sm text-gray-600">
                              {rating.skillRating.toFixed(0)} pts
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Team B */}
                <div>
                  <h4 className="font-medium text-red-600 mb-3">Shirts</h4>
                  <div className="space-y-2">
                    {suggestion.teamB.map(playerId => {
                      const player = players.find(p => p.id === playerId);
                      const rating = getPlayerRating(playerId);
                      return (
                        <div key={playerId} className="flex items-center justify-between p-2 bg-red-50 rounded">
                          <span className="font-medium">{player?.name}</span>
                          {showRatings && rating && (
                            <span className="text-sm text-gray-600">
                              {rating.skillRating.toFixed(0)} pts
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* Scores */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Balance</p>
                  <p className="text-lg font-bold text-blue-600">{suggestion.balanceScore.toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Chemistry</p>
                  <p className="text-lg font-bold text-green-600">{suggestion.chemistryScore.toFixed(1)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Rotation</p>
                  <p className="text-lg font-bold text-purple-600">{suggestion.rotationScore.toFixed(1)}</p>
                </div>
              </div>
              
              {/* Reasoning */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium text-gray-700 mb-2">Why this team?</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {suggestion.reasoning.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <FaCheck className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 