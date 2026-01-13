import React, { useState } from 'react';
// Import from the library alias to simulate real usage
import { createBaseRequest } from 'rxtutils';

const request = createBaseRequest({
  baseURL: 'https://jsonplaceholder.typicode.com',
  responseTransfer: (data) => data
});

const App = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await request<any, any>({
        method: 'GET',
        url: '/todos/1'
      });
      console.log('Response:', res);
      setData(res);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1>RUtils Playground</h1>
      <p>This is a dev environment to test your library hooks and utilities.</p>
      
      <div style={{ 
        border: '1px solid #ddd', 
        padding: '20px', 
        borderRadius: '8px',
        marginTop: '20px'
      }}>
        <h2>Request Demo</h2>
        <button 
          onClick={handleClick} 
          disabled={loading}
          style={{
            padding: '8px 16px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Test Request'}
        </button>
        
        {data && (
          <div style={{ marginTop: '20px' }}>
            <h3>Response Data:</h3>
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '15px', 
              borderRadius: '4px',
              overflow: 'auto'
            }}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
