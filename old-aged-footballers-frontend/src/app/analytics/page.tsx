import { Suspense } from 'react';
import { Spinner } from '@/components/Spinner';
import AnalyticsContent from './AnalyticsContent';

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-gray-600">Loading analytics data...</p>
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  );
} 