import React from 'react';
import { HackathonAggregatorView } from '../../components/hackathon/HackathonAggregatorView';

export const HackathonModePage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <HackathonAggregatorView />
    </div>
  );
};

export default HackathonModePage;
