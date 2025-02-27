import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Moon, Sun } from 'lucide-react';

// Main app component
const BiomarkerTracker = () => {
  // Define biomarkers
  const biomarkerTypes = [
    'Sleep', 'Mood', 'Energy', 'Digestion', 'Mind'
  ];

  // Colors for biomarkers
  const colors = {
    'Sleep': '#8884d8', // Purple
    'Mood': '#FFCE56', // Yellow
    'Energy': '#FF6384', // Pink
    'Digestion': '#FFD700', // Gold
    'Mind': '#4CAF50', // Green
  };

  // State hooks
  const [entries, setEntries] = useState([]);
  const [selectedBiomarkers, setSelectedBiomarkers] = useState(['Sleep', 'Mood', 'Energy']);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentUser, setCurrentUser] = useState({ name: 'Demo User' });
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [saveButtonText, setSaveButtonText] = useState("Save Entry");
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // Add Entry form state
  const [biomarkerValues, setBiomarkerValues] = useState({
    Sleep: 5,
    Mood: 5,
    Energy: 5,
    Digestion: 5,
    Mind: 5
  });
  
  // Theme state
  const [darkMode, setDarkMode] = useState(false);

  // Format date for display
  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split('-');
    return `${month}-${day}-${year.slice(2)}`;
  };

  // Initialize the app on first render
  useEffect(() => {
    // Load demo data
    setEntries(generateDemoData());
    
    // Set default date range to last 30 days
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setDateRange({
      start: thirtyDaysAgo.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0]
    });
  }, []);

  // Generate demo data
  const generateDemoData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 30; i >= 0; i--) {
      const entryDate = new Date();
      entryDate.setDate(today.getDate() - i);
      
      const entry = {
        date: entryDate.toISOString().split('T')[0],
      };
      
      biomarkerTypes.forEach(biomarker => {
        // Generate random value between 1-10 with some patterns
        let value;
        if (biomarker === 'Sleep') {
          // Sleep gradually improves
          value = Math.min(10, Math.max(1, 5 + i/6 + (Math.random() * 2 - 1)));
        } else if (biomarker === 'Mood') {
          // Mood fluctuates but follows sleep pattern with 1-day lag
          const sleepEffect = i < 30 ? data[data.length-1]['Sleep'] * 0.7 : 5;
          value = Math.min(10, Math.max(1, sleepEffect + (Math.random() * 3 - 1.5)));
        } else if (biomarker === 'Energy') {
          // Energy correlates with sleep and has weekly pattern
          const dayOfWeek = (entryDate.getDay() + 1) % 7;
          const weekendBoost = dayOfWeek >= 5 ? 1.5 : 0;
          const sleepEffect = i < 30 ? data[data.length-1]['Sleep'] * 0.5 : 5;
          value = Math.min(10, Math.max(1, sleepEffect + weekendBoost + (Math.random() * 2 - 1)));
        } else {
          // Other metrics follow random patterns
          value = Math.floor(Math.random() * 6) + 3;
        }
        
        entry[biomarker] = Math.round(value * 10) / 10;
      });
      
      data.push(entry);
    }
    
    return data;
  };

  // Handle biomarker selection
  const toggleBiomarker = (biomarker) => {
    if (selectedBiomarkers.includes(biomarker)) {
      setSelectedBiomarkers(selectedBiomarkers.filter(b => b !== biomarker));
    } else {
      setSelectedBiomarkers([...selectedBiomarkers, biomarker]);
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  // Filter entries by date range and sort chronologically
  const filteredEntries = entries
    .filter(entry => {
      if (!dateRange.start || !dateRange.end) return true;
      return entry.date >= dateRange.start && entry.date <= dateRange.end;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Handle tab changing
  const changeTab = (tab) => {
    // Clear any error message when changing tabs
    setErrorMessage(null);
    setActiveTab(tab);
  };
  
  // Handle saving a new entry
  const handleSaveEntry = () => {
    // Clear any previous error messages
    setErrorMessage(null);
    
    // Prevent multiple clicks
    if (isSaving) return;
    
    // Check if entry for this date already exists
    const existingEntryIndex = entries.findIndex(entry => entry.date === entryDate);
    
    if (existingEntryIndex !== -1) {
      // Show error message
      setErrorMessage(`An entry already exists for ${formatDate(entryDate)}. Please delete the existing entry first.`);
      return;
    }
    
    setIsSaving(true);
    setSaveButtonText("Saving...");
    
    // Create new entry
    const newEntry = {
      date: entryDate,
      ...biomarkerValues
    };
    
    // Add new entry
    setEntries([...entries, newEntry]);
    
    // Show success
    setTimeout(() => {
      setSaveButtonText("Saved!");
      
      setTimeout(() => {
        setSaveButtonText("Save Entry");
        setIsSaving(false);
        
        // Switch to dashboard tab to show the updated chart
        setActiveTab('dashboard');
      }, 1000);
    }, 500);
  };

  // Handle deleting an entry
  const handleDeleteEntry = (dateToDelete) => {
    setEntries(entries.filter(entry => entry.date !== dateToDelete));
    
    // If we're currently on the delete tab, show a brief success message
    if (activeTab === 'delete') {
      setErrorMessage(`Entry for ${formatDate(dateToDelete)} deleted successfully.`);
      
      // Clear the message after 2 seconds
      setTimeout(() => {
        setErrorMessage(null);
      }, 2000);
    }
  };

  return (
    <div className={`${darkMode ? 'dark bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} min-h-screen p-4 transition-colors duration-200`}>
      <div className={`max-w-6xl mx-auto ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 transition-colors duration-200`}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Biomarker Tracker</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} transition-colors duration-200`}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} className="text-gray-600" />
              )}
            </button>
            
            <div className="flex items-center gap-4">
              <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Welcome, {currentUser.name}</span>
            </div>
          </div>
        </div>
        
        <div className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} mb-6`}>
          <button 
            className={`px-4 py-2 ${activeTab === 'dashboard' 
              ? `border-b-2 border-blue-500 text-blue-500` 
              : darkMode ? 'text-gray-400' : 'text-gray-500'}`}
            onClick={() => changeTab('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'add' 
              ? `border-b-2 border-blue-500 text-blue-500` 
              : darkMode ? 'text-gray-400' : 'text-gray-500'}`}
            onClick={() => changeTab('add')}
          >
            Add Entry
          </button>
          <button 
            className={`px-4 py-2 ${activeTab === 'delete' 
              ? `border-b-2 border-blue-500 text-blue-500` 
              : darkMode ? 'text-gray-400' : 'text-gray-500'}`}
            onClick={() => changeTab('delete')}
          >
            Manage Entries
          </button>
        </div>
        
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Biomarker Dashboard</h2>
              
              {/* Date Range Selector */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Start Date
                  </label>
                  <input 
                    type="date"
                    value={dateRange.start || ''}
                    className={`border rounded p-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    End Date
                  </label>
                  <input 
                    type="date"
                    value={dateRange.end || ''}
                    className={`border rounded p-2 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              
              {/* Biomarker Selection */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Select Biomarkers to Display</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {biomarkerTypes.map((biomarker) => (
                    <button
                      key={biomarker}
                      onClick={() => toggleBiomarker(biomarker)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedBiomarkers.includes(biomarker)
                          ? `bg-opacity-90 text-white`
                          : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-800'
                      }`}
                      style={{
                        backgroundColor: selectedBiomarkers.includes(biomarker) 
                          ? colors[biomarker]
                          : undefined
                      }}
                    >
                      {biomarker}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Chart */}
              <div className={`h-64 w-full mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg`}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={filteredEntries}
                    margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#444" : "#ccc"} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                      stroke={darkMode ? "#ccc" : "#666"}
                    />
                    <YAxis 
                      domain={[0, 10]} 
                      ticks={[0, 2, 4, 6, 8, 10]} 
                      allowDataOverflow={false}
                      stroke={darkMode ? "#ccc" : "#666"}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: darkMode ? '#333' : '#fff',
                        borderColor: darkMode ? '#555' : '#ccc',
                        color: darkMode ? '#fff' : '#000'
                      }}
                    />
                    {selectedBiomarkers.map((biomarker) => (
                      <Line
                        key={biomarker}
                        type="monotone"
                        dataKey={biomarker}
                        stroke={colors[biomarker]}
                        strokeWidth={3}
                        activeDot={{ r: 8 }}
                        dot={{ r: 4, strokeWidth: 1, fill: colors[biomarker] }}
                        connectNulls={true}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedBiomarkers.map(biomarker => {
                  const values = filteredEntries.map(entry => entry[biomarker]);
                  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
                  const max = Math.max(...values);
                  const min = Math.min(...values);
                  
                  return (
                    <div 
                      key={biomarker} 
                      className="p-4 rounded-lg shadow-sm"
                      style={{ backgroundColor: darkMode ? '#333' : '#f9f9f9', borderLeft: `4px solid ${colors[biomarker]}` }}
                    >
                      <h3 className="font-bold mb-2">{biomarker} Stats</h3>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <div className="text-xs text-gray-500">Average</div>
                          <div className="text-xl font-semibold">{avg.toFixed(1)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Highest</div>
                          <div className="text-xl font-semibold">{max.toFixed(1)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Lowest</div>
                          <div className="text-xl font-semibold">{min.toFixed(1)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        
        {/* Add Entry Tab */}
        {activeTab === 'add' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Add New Entry</h2>
            
            <div className="mb-4">
              <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Date</label>
              <input 
                type="date" 
                value={entryDate}
                max={new Date().toISOString().split('T')[0]} // Prevent future dates
                onChange={(e) => setEntryDate(e.target.value)}
                className={`border rounded p-2 w-full md:w-1/4 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            
            {errorMessage && (
              <div className={`p-3 mb-4 rounded ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'}`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm">
                      {errorMessage}
                    </p>
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTab('delete');
                          setErrorMessage(null);
                        }}
                        className={`px-2 py-1 rounded text-xs font-medium ${darkMode ? 'bg-red-800 hover:bg-red-700' : 'bg-red-200 hover:bg-red-300'}`}
                      >
                        Go to Manage Entries
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {biomarkerTypes.map((biomarker) => (
                <div key={biomarker} className="mb-2">
                  <label className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {biomarker}
                  </label>
                  <div className="flex items-center mt-1 gap-2">
                    <div className="w-24 relative">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={biomarkerValues[biomarker]}
                        onChange={(e) => handleSliderChange(biomarker, e.target.value)}
                        className="w-full cursor-pointer"
                        style={{
                          height: '9px',
                          borderRadius: '5px',
                          background: `linear-gradient(to right, #FF5733 0%, #FF5733 ${(biomarkerValues[biomarker] - 1) * 11.1}%, ${darkMode ? '#444' : '#e2e8f0'} ${(biomarkerValues[biomarker] - 1) * 11.1}%, ${darkMode ? '#444' : '#e2e8f0'} 100%)`,
                          WebkitAppearance: 'none',
                          appearance: 'none',
                          outline: 'none'
                        }}
                      />
                      <style>
                        {`
                          input[type=range]::-webkit-slider-thumb {
                            -webkit-appearance: none;
                            appearance: none;
                            width: 15px;
                            height: 15px;
                            border-radius: 50%;
                            background: #FF5733;
                            cursor: pointer;
                            border: 1px solid ${darkMode ? '#666' : 'white'};
                          }
                          
                          input[type=range]::-moz-range-thumb {
                            width: 15px;
                            height: 15px;
                            border-radius: 50%;
                            background: #FF5733;
                            cursor: pointer;
                            border: 1px solid ${darkMode ? '#666' : 'white'};
                          }
                        `}
                      </style>
                    </div>
                    <div 
                      className="text-xs text-white font-medium rounded-full w-7 h-7 flex items-center justify-center" 
                      style={{
                        backgroundColor: colors[biomarker]
                      }}
                    >
                      {biomarkerValues[biomarker]}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={handleSaveEntry}
              disabled={isSaving}
              className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded ${isSaving ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {saveButtonText}
            </button>
          </div>
        )}
        
        {/* Manage Entries Tab */}
        {activeTab === 'delete' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Manage Entries</h2>
            <div className="overflow-x-auto">
              <table className={`min-w-full ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-100'}>
                  <tr>
                    <th className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'} text-left`}>
                      Date
                    </th>
                    <th className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'} text-left`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {entries.slice(-5).sort((a, b) => new Date(b.date) - new Date(a.date)).map(entry => (
                    <tr key={entry.date} className={darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        {formatDate(entry.date)}
                      </td>
                      <td className={`py-2 px-4 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <button
                          className="bg-red-500 hover:bg-red-600 text-white font-medium py-1 px-3 rounded text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BiomarkerTracker;
