import React, { useState, useEffect } from 'react';
import { Mail, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface EmailAccount {
  id: number;
  email: string;
  is_connected: boolean;
  last_sync: string | null;
}

interface GmailIntegrationProps {
  onProcessComplete?: () => void;
}

const GmailIntegration: React.FC<GmailIntegrationProps> = ({ onProcessComplete }) => {
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [processingResults, setProcessingResults] = useState<any>(null);

  useEffect(() => {
    fetchEmailAccounts();
  }, []);

  const fetchEmailAccounts = async () => {
    try {
      const token = localStorage.getItem('access');
      const response = await fetch('http://localhost:8000/api/gmail/accounts/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const accounts = await response.json();
        setEmailAccounts(accounts);
      }
    } catch (error) {
      console.error('Error fetching email accounts:', error);
    }
  };

  const connectGmail = async () => {
    try {
      setIsConnecting(true);
      setStatus(null);

      const token = localStorage.getItem('access');
      const response = await fetch('http://localhost:8000/api/gmail/auth-url/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Open Gmail OAuth in a popup
        const popup = window.open(
          data.auth_url,
          'gmail-oauth',
          'width=600,height=600,scrollbars=yes,resizable=yes'
        );

        // Listen for the callback
        const handleCallback = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'GMAIL_OAUTH_SUCCESS') {
            popup?.close();
            handleOAuthCallback(event.data.code, data.state);
            window.removeEventListener('message', handleCallback);
          } else if (event.data.type === 'GMAIL_OAUTH_ERROR') {
            popup?.close();
            setStatus({ type: 'error', message: 'Failed to connect Gmail account' });
            setIsConnecting(false);
            window.removeEventListener('message', handleCallback);
          }
        };

        window.addEventListener('message', handleCallback);

        // Handle popup closed manually
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            setIsConnecting(false);
            window.removeEventListener('message', handleCallback);
          }
        }, 1000);

      } else {
        setStatus({ type: 'error', message: 'Failed to get authorization URL' });
        setIsConnecting(false);
      }
    } catch (error) {
      console.error('Error connecting Gmail:', error);
      setStatus({ type: 'error', message: 'Failed to connect Gmail account' });
      setIsConnecting(false);
    }
  };

  const handleOAuthCallback = async (code: string, state: string) => {
    try {
      const token = localStorage.getItem('access');
      const response = await fetch('http://localhost:8000/api/gmail/callback/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state }),
      });

      if (response.ok) {
        const data = await response.json();
        setStatus({ type: 'success', message: `Gmail account ${data.email} connected successfully!` });
        fetchEmailAccounts();
      } else {
        const errorData = await response.json();
        setStatus({ type: 'error', message: errorData.error || 'Failed to connect Gmail account' });
      }
    } catch (error) {
      console.error('Error in OAuth callback:', error);
      setStatus({ type: 'error', message: 'Failed to connect Gmail account' });
    } finally {
      setIsConnecting(false);
    }
  };

  const processEmails = async () => {
    try {
      setIsProcessing(true);
      setStatus(null);
      setProcessingResults(null);

      const token = localStorage.getItem('access');
      const response = await fetch('http://localhost:8000/api/gmail/process-emails/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProcessingResults(data);
        setStatus({ 
          type: 'success', 
          message: `Processing complete! ${data.total_processed} orders processed from ${data.accounts_processed} accounts.` 
        });
        
        if (onProcessComplete) {
          onProcessComplete();
        }
      } else {
        const errorData = await response.json();
        setStatus({ type: 'error', message: errorData.error || 'Failed to process emails' });
      }
    } catch (error) {
      console.error('Error processing emails:', error);
      setStatus({ type: 'error', message: 'Failed to process emails' });
    } finally {
      setIsProcessing(false);
    }
  };

  const disconnectAccount = async (accountId: number) => {
    try {
      const token = localStorage.getItem('access');
      const response = await fetch(`http://localhost:8000/api/gmail/accounts/${accountId}/disconnect/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setStatus({ type: 'success', message: 'Email account disconnected successfully' });
        fetchEmailAccounts();
      } else {
        setStatus({ type: 'error', message: 'Failed to disconnect email account' });
      }
    } catch (error) {
      console.error('Error disconnecting account:', error);
      setStatus({ type: 'error', message: 'Failed to disconnect email account' });
    }
  };

  const connectedAccounts = emailAccounts.filter(account => account.is_connected);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Gmail Integration</h3>
      </div>

      {/* Status Messages */}
      {status && (
        <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
          status.type === 'success' ? 'bg-green-50 text-green-700' :
          status.type === 'error' ? 'bg-red-50 text-red-700' :
          'bg-blue-50 text-blue-700'
        }`}>
          {status.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span className="text-sm">{status.message}</span>
        </div>
      )}

      {/* Connected Accounts */}
      {connectedAccounts.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Connected Accounts</h4>
          <div className="space-y-2">
            {connectedAccounts.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">{account.email}</span>
                  {account.last_sync && (
                    <span className="text-xs text-gray-500">
                      Last sync: {new Date(account.last_sync).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => disconnectAccount(account.id)}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Disconnect
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={connectGmail}
          disabled={isConnecting}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          <Mail className="w-4 h-4" />
          {isConnecting ? 'Connecting...' : 'Connect Gmail Account'}
        </button>

        {connectedAccounts.length > 0 && (
          <button
            onClick={processEmails}
            disabled={isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            {isProcessing ? 'Processing...' : 'Process Emails'}
          </button>
        )}
      </div>

      {/* Processing Results */}
      {processingResults && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Processing Results</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Orders Processed:</span>
              <span className="ml-2 font-medium text-green-600">{processingResults.total_processed}</span>
            </div>
            <div>
              <span className="text-gray-600">Errors:</span>
              <span className="ml-2 font-medium text-red-600">{processingResults.total_errors}</span>
            </div>
            <div>
              <span className="text-gray-600">Accounts:</span>
              <span className="ml-2 font-medium text-blue-600">{processingResults.accounts_processed}</span>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {connectedAccounts.length === 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            Connect your Gmail account to automatically fetch and parse food delivery orders from platforms like Zoop, Spicy Wagon, Yatri Restro, and RajBhog Khana.
          </p>
        </div>
      )}
    </div>
  );
};

export default GmailIntegration;
