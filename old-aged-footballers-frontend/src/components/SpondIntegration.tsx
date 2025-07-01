'use client';

import { useState } from 'react';
import { FaDownload, FaExclamationTriangle } from 'react-icons/fa';
import { importSpondPlayers, getSpondRateLimit, SpondImportResult, RateLimitInfo } from '@/services/spondService';
import { Spinner } from './Spinner';
import toast from 'react-hot-toast';

interface SpondIntegrationProps {
  gameDate: string;
  onPlayersImported: (playerIds: string[]) => void;
  onRateLimitExceeded?: () => void;
}

export default function SpondIntegration({ 
  gameDate, 
  onPlayersImported, 
  onRateLimitExceeded 
}: SpondIntegrationProps) {
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<SpondImportResult | null>(null);
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);

  const handleImportPlayers = async () => {
    setLoading(true);
    setImportResult(null);
    
    try {
      // Check rate limit first
      const rateLimit = await getSpondRateLimit();
      setRateLimitInfo(rateLimit);
      
      if (rateLimit.remaining <= 0) {
        toast.error('Spond API rate limit exceeded. Please try again later.');
        onRateLimitExceeded?.();
        return;
      }

      // Import players from Spond
      const result = await importSpondPlayers(gameDate);
      setImportResult(result);
      
      if (result.totalMatched > 0) {
        const matchedPlayerIds = result.matchedPlayers
          .filter(p => p.oafPlayerId)
          .map(p => p.oafPlayerId!);
        
        onPlayersImported(matchedPlayerIds);
        toast.success(`Imported ${result.totalMatched} players from Spond!`);
      } else {
        toast.error('No players found for this date in Spond');
      }
      
      if (result.totalUnmatched > 0) {
        toast.error(`${result.totalUnmatched} players not found in OAF app`);
      }
      
    } catch (error) {
      console.error('Error importing from Spond:', error);
      toast.error('Failed to import players from Spond');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FaDownload className="text-blue-600" />
          Import from Spond
        </h3>
        <p className="text-sm text-gray-600">
          Import players who accepted the game on {formatDate(gameDate)}
        </p>
      </div>

      <button
        onClick={handleImportPlayers}
        disabled={loading || (rateLimitInfo?.remaining === 0)}
        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
          loading || rateLimitInfo?.remaining === 0
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <Spinner size="sm" />
            Importing from Spond...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <FaDownload />
            Import Players from Spond
          </div>
        )}
      </button>

      {importResult && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-3">Import Results</h4>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{importResult.totalMatched}</div>
              <div className="text-gray-600">Matched</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{importResult.totalUnmatched}</div>
              <div className="text-gray-600">Not Found</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{importResult.totalSpondPlayers}</div>
              <div className="text-gray-600">Total</div>
            </div>
          </div>
        </div>
      )}

      {rateLimitInfo?.remaining === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800">
            <FaExclamationTriangle className="text-sm" />
            <span className="text-sm font-medium">Rate limit exceeded</span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            Spond API limit reached. Resets at {new Date(rateLimitInfo.resetTime).toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
} 