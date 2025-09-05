import React, { useState, useEffect } from 'react';
import { database } from './firebase';
import { ref, set, onDisconnect } from 'firebase/database';

const FirebaseConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const testRef = ref(database, 'connection_tests/status');
        await set(testRef, { timestamp: Date.now(), status: 'connected' });
        onDisconnect(testRef).remove(); // Clean up when the user leaves
        setStatus('success');
      } catch (e: any) {
        setStatus('failed');
        setError(e.message);
      }
    };

    testConnection();
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  return (
    <div className={`absolute top-2 left-1/2 -translate-x-1/2 bg-gray-800 p-2 rounded-md text-center text-xs font-mono z-50 ${getStatusColor()}`}>
      <p>
        <strong>Firebase Connection: </strong>
        {status === 'pending' && 'PENDING...'}
        {status === 'success' && 'SUCCESSFUL'}
        {status === 'failed' && `FAILED`}
      </p>
      {error && <p className="mt-1">Error: {error}</p>}
    </div>
  );
};

export default FirebaseConnectionTest;
