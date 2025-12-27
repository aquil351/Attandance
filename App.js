import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './App.css';



const people = ["Shreya Bajpayee",  "Arun Yadav",  "Urooz Siddiqui",  "Sahil Sharma",  "Aquil Siddiqiui",  "Harshit"];

function App() {
  const [log, setLog] = useState(() => {
    const saved = localStorage.getItem('attendanceLog');
    return saved ? JSON.parse(saved) : [];
  });

  const [statuses, setStatuses] = useState(() => {
    const saved = localStorage.getItem('statuses');
    return saved ? JSON.parse(saved) : {};
  });

  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAttendance = (name, type) => {
    const entry = {
      name,
      type,
      timestamp: new Date().toLocaleString(), // Example: 9/29/2025, 10:00:00 AM
    };

    const updatedLog = [...log, entry];
    const updatedStatuses = { ...statuses, [name]: type };

    setLog(updatedLog);
    setStatuses(updatedStatuses);

    localStorage.setItem('attendanceLog', JSON.stringify(updatedLog));
    localStorage.setItem('statuses', JSON.stringify(updatedStatuses));
  };

  const clearLog = () => {
    setLog([]);
    setStatuses({});
    localStorage.removeItem('attendanceLog');
    localStorage.removeItem('statuses');
  };

  const exportToExcel = () => {
  const rows = [];
  const temp = {};

  log.forEach(entry => {
    const [date, time] = entry.timestamp.split(', ');

    if (!temp[entry.name]) {
      temp[entry.name] = {};
    }

    if (!temp[entry.name][date]) {
      temp[entry.name][date] = [];
    }

    if (entry.type === 'Check In') {
      temp[entry.name][date].push({
        CheckIn: time,
        CheckOut: ''
      });
    }

    if (
      entry.type === 'Check Out' &&
      temp[entry.name][date].length > 0
    ) {
      const last =
        temp[entry.name][date][temp[entry.name][date].length - 1];

      if (last.CheckOut === '') {
        last.CheckOut = time;
      }
    }
  });

  // Convert to Excel rows
  Object.keys(temp).forEach(name => {
    Object.keys(temp[name]).forEach(date => {
      temp[name][date].forEach(record => {
        rows.push({
          Name: name,
          Date: date,
          'Check-In': record.CheckIn,
          'Check-Out': record.CheckOut
        });
      });
    });
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const file = new Blob([excelBuffer], {
    type:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const today = new Date().toISOString().split('T')[0];
  saveAs(file, `attendance_${today}.xlsx`);
};

  return (
    <div className="App">
      <h1>🏠 Home Attendance System</h1>
      <h2>Current Time: {time.toLocaleTimeString()}</h2>

      {people.map((person) => {
        const lastStatus = statuses[person];

        return (
          <div key={person} className="person-section">
         
            <h3>{person}</h3>
      
           
            {lastStatus !== 'Check In' ? (
              <button onClick={() => handleAttendance(person, 'Check In')}>✅ Check In</button>
            ) : (
              <button onClick={() => handleAttendance(person, 'Check Out')}>❌ Check Out</button>
            )}
          </div>
        );
      })}

      <hr />

      <button onClick={exportToExcel} disabled={log.length === 0}>
        📁 Export to Excel
      </button>
      <button onClick={clearLog}>
        🗑️ Clear All Logs
      </button>

      <h3>📋 Attendance Log:</h3>
      <ul>
        {log.map((entry, index) => (
          <li key={index}>
            <strong>{entry.name}</strong> - {entry.type} at {entry.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
