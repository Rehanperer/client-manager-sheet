import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  LayoutGrid,
  Table as TableIcon,
  History,
  Briefcase,
  BarChart3,
  ChevronRight,
  MoreVertical,
  Bell,
  Link as LinkIcon,
  MessageSquare,
  Trash2,
  Settings
} from 'lucide-react';
import './App.css';

// Initial dynamic columns
const DEFAULT_COLUMNS = [
  { id: 'company', label: 'Company', type: 'text' },
  { id: 'industry', label: 'Industry', type: 'text' },
  { id: 'contact', label: 'Contact Person', type: 'text' },
  { id: 'email', label: 'Email', type: 'email' },
  { id: 'status', label: 'Status', type: 'select', options: ['Lead', 'Contacted', 'Demo Built', 'Won', 'Lost'] },
  { id: 'lastContact', label: 'Last Contact', type: 'date' },
  { id: 'demoLink', label: 'Demo Link', type: 'url' },
];

function App() {
  const [view, setView] = useState('spreadsheet'); // spreadsheet, kanban, stats, vault
  const [clients, setClients] = useState(() => {
    const saved = localStorage.getItem('ot_clients');
    return saved ? JSON.parse(saved) : [];
  });
  const [columns, setColumns] = useState(() => {
    const saved = localStorage.getItem('ot_columns');
    return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
  });
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedClient, setSelectedClient] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const [newLog, setNewLog] = useState('');
  const [showVault, setShowVault] = useState(false);
  const [assets, setAssets] = useState(() => {
    const saved = localStorage.getItem('ot_assets');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('ot_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('ot_columns', JSON.stringify(columns));
  }, [columns]);

  useEffect(() => {
    localStorage.setItem('ot_assets', JSON.stringify(assets));
  }, [assets]);

  const addClient = () => {
    const newClient = {
      id: Date.now().toString(),
      company: '',
      industry: '',
      contact: '',
      email: '',
      status: 'Lead',
      lastContact: new Date().toISOString().split('T')[0],
      demoLink: '',
      logs: []
    };
    setClients([newClient, ...clients]);
  };

  const updateClient = (id, field, value) => {
    setClients(clients.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const addLog = (clientId) => {
    if (!newLog.trim()) return;
    const log = {
      id: Date.now(),
      date: new Date().toLocaleString(),
      text: newLog
    };
    setClients(clients.map(c =>
      c.id === clientId ? { ...c, logs: [log, ...(c.logs || [])], lastContact: new Date().toISOString().split('T')[0] } : c
    ));
    setNewLog('');
  };

  const addAsset = (name, url) => {
    const asset = { id: Date.now(), name, url };
    setAssets([asset, ...assets]);
  };

  const deleteClient = (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      setClients(clients.filter(c => c.id !== id));
    }
  };

  const addColumn = (position) => {
    const label = prompt('Column Name?');
    if (!label) return;
    const newCol = {
      id: label.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now(),
      label,
      type: 'text'
    };
    const newColumns = [...columns];
    newColumns.splice(position, 0, newCol);
    setColumns(newColumns);
  };

  const deleteColumn = (id) => {
    if (columns.length <= 1) {
      alert('You must have at least one column.');
      return;
    }
    if (window.confirm('Delete this column? This will hide the data for all clients.')) {
      setColumns(columns.filter(c => c.id !== id));
    }
  };

  const filteredClients = clients.filter(c =>
    Object.values(c).some(val =>
      val?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="app-container">
      {/* Sidebar */}
      <nav className="sidebar">
        <div className="logo">
          <div className="logo-icon">AG</div>
          <span>Antigravity CRM</span>
        </div>

        <div className="nav-items">
          <button
            className={`nav-item ${view === 'spreadsheet' ? 'active' : ''}`}
            onClick={() => setView('spreadsheet')}
          >
            <TableIcon size={20} /> Spreadsheet
          </button>
          <button
            className={`nav-item ${view === 'kanban' ? 'active' : ''}`}
            onClick={() => setView('kanban')}
          >
            <LayoutGrid size={20} /> Kanban Board
          </button>
          <button
            className={`nav-item ${view === 'vault' ? 'active' : ''}`}
            onClick={() => setView('vault')}
          >
            <Briefcase size={20} /> Asset Vault
          </button>
          <button
            className={`nav-item ${view === 'stats' ? 'active' : ''}`}
            onClick={() => setView('stats')}
          >
            <BarChart3 size={20} /> Metrics
          </button>
        </div>
      </nav>

      <main className="main-content">
        <header className="top-header">
          <div className="search-bar">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search companies, contacts, industries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="header-actions">
            <button className="btn-secondary">
              <Bell size={18} />
            </button>
            <button className="btn-primary" onClick={addClient}>
              <Plus size={18} /> Add Client
            </button>
          </div>
        </header>

        <section className="view-container">
          {view === 'spreadsheet' && (
            <div className="table-container fade-in">
              <table>
                <thead>
                  <tr>
                    {columns.map((col, index) => (
                      <th key={col.id} className="group">
                        <div className="th-content">
                          {col.label}
                          <div className="th-actions">
                            <button className="btn-mini" onClick={() => addColumn(index)} title="Add column before">
                              <Plus size={10} />
                            </button>
                            <button className="btn-mini btn-delete" onClick={() => deleteColumn(col.id)} title="Delete column">
                              <Trash2 size={10} />
                            </button>
                            <button className="btn-mini" onClick={() => addColumn(index + 1)} title="Add column after">
                              <Plus size={10} />
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map(client => (
                    <tr key={client.id}>
                      {columns.map(col => (
                        <td key={col.id}>
                          {col.type === 'select' ? (
                            <select
                              className={`status-badge status-${client[col.id]?.toLowerCase().replace(' ', '-')}`}
                              value={client[col.id]}
                              onChange={(e) => updateClient(client.id, col.id, e.target.value)}
                            >
                              {col.options.map(opt => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={col.type}
                              value={client[col.id] || ''}
                              placeholder={`Enter ${col.label.toLowerCase()}...`}
                              onChange={(e) => updateClient(client.id, col.id, e.target.value)}
                            />
                          )}
                        </td>
                      ))}
                      <td>
                        <div className="row-actions">
                          <button
                            className="btn-icon"
                            onClick={() => {
                              setSelectedClient(client);
                              setShowLogs(true);
                            }}
                          >
                            <MessageSquare size={16} />
                            {client.logs?.length > 0 && <span className="log-count">{client.logs.length}</span>}
                          </button>
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => deleteClient(client.id)}
                            title="Delete Row"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredClients.length === 0 && (
                <div className="empty-state">
                  No clients found. Click "Add Client" to get started.
                </div>
              )}
            </div>
          )}

          {view === 'kanban' && (
            <div className="kanban-container fade-in">
              {['Lead', 'Contacted', 'Demo Built', 'Won'].map(status => (
                <div key={status} className="kanban-column">
                  <h3>{status} <span className="count">{clients.filter(c => c.status === status).length}</span></h3>
                  <div className="kanban-cards">
                    {clients.filter(c => c.status === status).map(client => (
                      <div key={client.id} className="kanban-card glass-card">
                        <h4>{client.company || 'Unnamed Company'}</h4>
                        <p>{client.contact || 'No contact'}</p>
                        <div className="card-footer">
                          {client.demoLink && <LinkIcon size={14} />}
                          <span className="industry-tag">{client.industry}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {view === 'vault' && (
            <div className="vault-container fade-in">
              <div className="vault-header">
                <h2>Asset Vault</h2>
                <button className="btn-primary" onClick={() => {
                  const name = prompt('Asset Name?');
                  const url = prompt('URL?');
                  if (name && url) addAsset(name, url);
                }}>
                  <Plus size={18} /> Add Asset
                </button>
              </div>
              <div className="assets-grid">
                {assets.map(asset => (
                  <div key={asset.id} className="asset-card glass-card">
                    <div className="asset-icon"><LinkIcon size={24} /></div>
                    <div className="asset-info">
                      <h4>{asset.name}</h4>
                      <a href={asset.url} target="_blank" rel="noreferrer">{asset.url}</a>
                    </div>
                  </div>
                ))}
                {assets.length === 0 && <div className="empty-state">Your vault is empty.</div>}
              </div>
            </div>
          )}

          {view === 'stats' && (
            <div className="stats-container fade-in">
              <div className="stats-grid">
                <div className="stat-card glass-card">
                  <p>Total Leads</p>
                  <h2>{clients.length}</h2>
                </div>
                <div className="stat-card glass-card">
                  <p>Demo Built</p>
                  <h2>{clients.filter(c => c.status === 'Demo Built').length}</h2>
                </div>
                <div className="stat-card glass-card">
                  <p>Won Deals</p>
                  <h2 className="text-success">{clients.filter(c => c.status === 'Won').length}</h2>
                </div>
                <div className="stat-card glass-card">
                  <p>Conversion Rate</p>
                  <h2>{clients.length ? Math.round((clients.filter(c => c.status === 'Won').length / clients.length) * 100) : 0}%</h2>
                </div>
              </div>

              <div className="stats-charts">
                <div className="chart-card glass-card">
                  <h3>Pipeline Health</h3>
                  <div className="pipeline-chart">
                    {['Lead', 'Contacted', 'Demo Built', 'Won'].map(status => {
                      const count = clients.filter(c => c.status === status).length;
                      const percentage = clients.length ? (count / clients.length) * 100 : 0;
                      return (
                        <div key={status} className="pipeline-bar-wrapper">
                          <div className="pipeline-label">{status}</div>
                          <div className="pipeline-bar-container">
                            <div className="pipeline-bar" style={{ width: `${percentage}%`, background: `var(--status-${status.toLowerCase().replace(' ', '-')})` }}></div>
                          </div>
                          <div className="pipeline-value">{count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Logs Modal */}
        {showLogs && selectedClient && (
          <div className="modal-overlay" onClick={() => setShowLogs(false)}>
            <div className="modal-content glass-card" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Logs for {selectedClient.company || 'Client'}</h3>
                <button className="btn-close" onClick={() => setShowLogs(false)}>×</button>
              </div>
              <div className="modal-body">
                <div className="log-input">
                  <textarea
                    placeholder="Type a new log entry..."
                    value={newLog}
                    onChange={(e) => setNewLog(e.target.value)}
                  />
                  <button className="btn-primary" onClick={() => addLog(selectedClient.id)}>Add Log</button>
                </div>
                <div className="logs-list">
                  {(clients.find(c => c.id === selectedClient.id)?.logs || []).map(log => (
                    <div key={log.id} className="log-item">
                      <div className="log-date">{log.date}</div>
                      <div className="log-text">{log.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
