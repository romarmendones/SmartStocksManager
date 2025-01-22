import React, { useState, useEffect } from 'react';
import { supabase } from '../Back-end/supabaseClient';
import Sidebar from '../components/Sidebar';
import '../styles/Branches.css';

const Branches = () => {
  const [branchData, setBranchData] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [requestQuantity, setRequestQuantity] = useState({});
  const [requestBranch, setRequestBranch] = useState({});
  const [messageLoading, setMessageLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
const [password, setPassword] = useState('');
const [passwordError, setPasswordError] = useState('');
const [pendingRequestItem, setPendingRequestItem] = useState(null);
const [pendingRequestId, setPendingRequestId] = useState(null);

  const branches = [
    'Lucena Branch',
    'Sariaya Branch',
    'Mauban Branch',
    'Tiaong Branch'
  ];

  useEffect(() => {
    const initialize = async () => {
      try {
        await Promise.all([
          getUserAndBranchData(),
          fetchInventory()
        ]);
        setupRealtimeSubscription();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (selectedBranch && branchData?.branch) {
      fetchMessages();
    }
  }, [selectedBranch, branchData]);

  const handleBranchSelect = async (e) => {
    const selectedValue = e.target.value;
    setSelectedBranch(selectedValue);
    setMessageLoading(true);
  
    try {
      if (selectedValue) {
        const { data, error } = await supabase
          .from('branch_messages')
          .select('*')
          .or(
            `and(from_branch.eq.'${branchData.branch}',to_branch.eq.'${selectedValue}')`,
            `and(from_branch.eq.'${selectedValue}',to_branch.eq.'${branchData.branch}')`
          )
          .order('created_at', { ascending: true });
  
        if (error) throw error;
        console.log('Fetched messages:', data);
        setMessages(data || []);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(error.message);
    } finally {
      setMessageLoading(false);
    }
  };
  

  const getUserAndBranchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session found');

      const { data, error } = await supabase
        .from('branch_admins')
        .select('branch, role')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('No branch assignment found');
      setBranchData(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('id, code, product, type, stock')
        .order('product');

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      
      // Get messages where current branch is either sender or receiver
      const { data, error } = await supabase
        .from('branch_messages')
        .select('*')
        .or(`from_branch.eq.${branchData.branch},to_branch.eq.${branchData.branch}`)
        .order('created_at', { ascending: false });
  
      if (error) throw error;
  
      // Filter messages to show only conversation with selected branch
      const filteredMessages = data.filter(msg => 
        (msg.from_branch === selectedBranch && msg.to_branch === branchData.branch) ||
        (msg.from_branch === branchData.branch && msg.to_branch === selectedBranch)
      );
  
      console.log('Filtered Messages:', {
        selectedBranch,
        currentBranch: branchData.branch,
        messageCount: filteredMessages.length
      });
  
      setMessages(filteredMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };


  const setupRealtimeSubscription = () => {
    if (!branchData?.branch) return;
  
    const subscription = supabase
      .channel('branch-messages')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'branch_messages',
          filter: `or(to_branch.eq.'${branchData.branch}',from_branch.eq.'${branchData.branch}')`
        },
        (payload) => {
          console.log('New message received:', payload);
          fetchMessages();
        }
      )
      .subscribe();
  
    return () => subscription.unsubscribe();
  };

  const sendMessage = async (event) => {
    try {
      if (event) event.preventDefault();
  
      if (!newMessage || !selectedBranch || !branchData?.branch) {
        console.log('Missing required data:', {
          message: newMessage,
          selectedBranch,
          currentBranch: branchData?.branch
        });
        return;
      }
  
      const messageData = {
        message: newMessage.trim(),
        from_branch: branchData.branch,
        to_branch: selectedBranch,
        created_at: new Date().toISOString()
      };
  
      console.log('Sending message:', messageData);
  
      const { data, error } = await supabase
        .from('branch_messages')
        .insert([messageData])
        .select();
  
      if (error) throw error;
  
      console.log('Message sent:', data);
      setNewMessage('');
      setMessages(prev => [...prev, data[0]]);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get ALL user data including password
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')  // Get all columns
        .eq('id', user.id)
        .single();
  
      if (error) throw error;
  
      // Debug logging
      console.log('Database Response:', {
        fullData: userData,
        storedPassword: userData?.password,
        enteredPassword: password,
        match: userData?.password === password
      });

  
      // Process stock request
      const quantity = requestQuantity[pendingRequestItem];
      const targetBranch = requestBranch[pendingRequestItem];
      const item = inventory.find(i => i.id === pendingRequestItem);
  
      if (!quantity || !targetBranch || !item) {
        throw new Error('Missing request details');
      }
  
      const requestDetails = `${quantity} units of ${item.product} from ${branchData.branch}`;
  
      const { error: requestError } = await supabase
        .from('branch_requests')
        .insert({
          request_id: pendingRequestId,
          product_id: pendingRequestItem,
          branch: branchData.branch,
          target_branch: targetBranch,
          details: requestDetails,
          quantity: quantity,
          status: 'pending',
          created_at: new Date().toISOString()
        });
  
      if (requestError) throw requestError;
  
      // Reset states after successful request
      setRequestQuantity(prev => ({ ...prev, [pendingRequestItem]: '' }));
      setRequestBranch(prev => ({ ...prev, [pendingRequestItem]: '' }));
      setShowPasswordModal(false);
      setPassword('');
      setPendingRequestItem(null);
      setPendingRequestId(null);
  
  } catch (error) {
    console.error('Error:', error);
    setError(error.message);
    setPasswordError(error.message);
  }
  };

  

  const handleStockRequest = (itemId) => {
    const quantity = requestQuantity[itemId];
    const targetBranch = requestBranch[itemId];
  
    // Validate input before showing password modal
    if (!quantity || !targetBranch) {
      setError('Please select both quantity and target branch');
      return;
    }
  
    // Generate unique request ID
    const requestId = 'REQ-' + Date.now() + '-' + Math.random().toString(36).substring(2, 15);
    
    // Set pending states
    setPendingRequestId(requestId);
    setPendingRequestItem(itemId);
    
    // Show password modal
    setShowPasswordModal(true);
    
    // Clear any existing errors
    setError(null);
    setPasswordError(null);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="branches-container">
      <Sidebar />
      <main className="branches-content">
        <div className="branch-header">
          <h1>Branch Communication</h1>
          <div className="branch-info">
            <p>Your Branch: {branchData?.branch}</p>
            <select
              value={selectedBranch}
              onChange={handleBranchSelect}
              className="branch-selector"
            >
              <option value="">Select Branch to Message</option>
              {branches
                .filter(branch => branch !== branchData?.branch)
                .map(branch => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                )
                
                
                )}
            </select>
          </div>
        </div>
  
        <div className="content-grid">
          <div className="inventory-section">
            <h2>Inventory Items</h2>
            <div className="inventory-grid">
              <div className="inventory-header">
                <span>Product</span>
                <span>Type</span>
                <span>Code</span>
                <span>Stock</span>
                <span>Actions</span>
              </div>
              {inventory.map(item => (
                <div key={item.id} className="inventory-item">
                  <span className="product-name">{item.product}</span>
                  <span className="product-type">{item.type}</span>
                  <span className="product-code">{item.code}</span>
                  <span className="product-stock">{item.stock}</span>
                  <div className="request-controls">
                    <select
                      value={requestBranch[item.id] || ''}
                      onChange={(e) => setRequestBranch(prev => ({
                        ...prev,
                        [item.id]: e.target.value
                      }))}
                      className="branch-selector"
                    >
                      <option value="">Select Branch</option>
                      {branches
                        .filter(branch => branch !== branchData?.branch)
                        .map(branch => (
                          <option key={branch} value={branch}>
                            {branch}
                          </option>
                        ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={requestQuantity[item.id] || ''}
                      onChange={(e) => setRequestQuantity(prev => ({
                        ...prev,
                        [item.id]: e.target.value
                      }))}
                      placeholder="Qty"
                    />
                    <button
                      onClick={() => handleStockRequest(item.id)}
                      disabled={!requestBranch[item.id] || !requestQuantity[item.id]}
                      className="request-btn"
                    >
                      Request
                    </button>
                  </div>
                </div>
              ))}
              {showPasswordModal && (
                <div className="password-modal">
                  <div className="modal-content">
                    <h3>Enter Admin Password</h3>
                    <form onSubmit={handlePasswordSubmit}>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                      />
                      {passwordError && <p className="error">{passwordError}</p>}
                      <div className="modal-buttons">
                        <button type="submit">Submit</button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowPasswordModal(false);
                            setPassword('');
                            setPendingRequestItem(null);
                            setPasswordError('');
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
      )}
            </div>
          </div>
  
          <div className="messages-section">
            <h2>Messages {selectedBranch && `with ${selectedBranch}`}</h2>
            <div className="messages-list">
              {messageLoading ? (
                <div className="loading-messages">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="no-messages">No messages yet</div>
              ) : (
                messages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`message-item ${msg.from_branch === branchData?.branch ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <p>{msg.message}</p>
                      <small>From: {msg.from_branch}</small>
                      <span className="timestamp">
                        {new Date(msg.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="message-input">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={selectedBranch ? "Type your message..." : "Select a branch to start messaging"}
                disabled={!selectedBranch}
              />
              <button
                onClick={sendMessage}
                disabled={!selectedBranch || !newMessage}
                className="send-btn"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Branches;