import React from 'react';
import { ManualMatch } from '../types/sports';

interface Props {
  match: ManualMatch;
}

const ManualMatchCard: React.FC<Props> = ({ match }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h2 className="text-xl font-bold mb-2">{match.title}</h2>
      <p className="text-gray-600 mb-4">
        {match.teams.home} vs {match.teams.away} <br />
        {new Date(match.date).toLocaleString()}
      </p>
      <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-300">
        <iframe
          title={match.title}
          className="w-full h-full"
          src={match.embedUrl}
          frameBorder="0"
          allowFullScreen
          allow="encrypted-media; picture-in-picture"
        />
      </div>
    </div>
  );
};

export default ManualMatchCard;
