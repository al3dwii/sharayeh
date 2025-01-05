// components/UserProfile.tsx

'use client';

import React from 'react';
import { useUserData } from '../context/UserContext';

const UserProfile: React.FC = () => {
  const user = useUserData();

  if (!user) {
    return <div>Please log in to see your profile.</div>;
  }

  const { userCredits, userPackages, creditTransactions, files } = user;

  return (
    <div className='p=16 m-16 min-h-screen bg-gray-100'>
      <h2>User Profile</h2>

      {userCredits && (
        <div>
          <h3>Credits</h3>
          <p><strong>ID:</strong> {userCredits.id}</p>
          <p><strong>Credits:</strong> {userCredits.credits}</p>
          <p><strong>Used Credits:</strong> {userCredits.usedCredits}</p>
        </div>
      )}

      {userPackages && userPackages.length > 0 && (
        <div>
          <h3>Packages</h3>
          <ul>
            {userPackages.map((pkg) => (
              <li key={pkg.id}>
                <strong>{pkg.package.name}</strong> - {pkg.package.tier} Tier
                <br />
                Acquired At: {new Date(pkg.acquiredAt).toLocaleDateString()}
                {pkg.expiresAt && (
                  <>
                    <br />
                    Expires At: {new Date(pkg.expiresAt).toLocaleDateString()}
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {creditTransactions && creditTransactions.length > 0 && (
        <div>
          <h3>Credit Transactions</h3>
          <ul>
            {creditTransactions.map((tx) => (
              <li key={tx.id}>
                <strong>{tx.type}</strong>: {tx.amount} - {tx.description} on{' '}
                {new Date(tx.timestamp).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
      )}

      {files && files.length > 0 && (
        <div>
          <h3>Files</h3>
          <ul>
            {files.map((file) => (
              <li key={file.id}>
                <strong>{file.fileName}</strong> - {file.type} - {file.status}
                {file.fileGenerations && file.fileGenerations.length > 0 && (
                  <ul>
                    {file.fileGenerations.map((gen) => (
                      <li key={gen.requestId}>
                        Generation Status: {gen.status}
                        {gen.downloadUrl && (
                          <>
                            {' '}
                            - <a href={gen.downloadUrl}>Download</a>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
