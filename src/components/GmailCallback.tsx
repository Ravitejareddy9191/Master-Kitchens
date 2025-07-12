import React, { useEffect } from 'react';

const GmailCallback: React.FC = () => {
  useEffect(() => {
    // Get the authorization code from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
      // Send error message to parent window
      window.opener?.postMessage({
        type: 'GMAIL_OAUTH_ERROR',
        error: error
      }, window.location.origin);
    } else if (code) {
      // Send success message to parent window
      window.opener?.postMessage({
        type: 'GMAIL_OAUTH_SUCCESS',
        code: code,
        state: state
      }, window.location.origin);
    }

    // Close the popup window
    window.close();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing Gmail authorization...</p>
      </div>
    </div>
  );
};

export default GmailCallback;
