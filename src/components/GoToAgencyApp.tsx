// frontend-main/src/components/GoToAgencyApp.tsx
import React from 'react';

const GoToAgencyApp: React.FC = () => {
  const handleRedirect = () => {
    window.location.href = 'http://localhost:3001/'; // Token is reused from localStorage
  };

  return (
    <button
      onClick={handleRedirect}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Go to Agency App
    </button>
  );
};

export default GoToAgencyApp;