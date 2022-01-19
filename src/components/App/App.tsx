import React from 'react';
import Calendar from '../Calendar';
import Recorder from '../Recorder';
import './App.css';

function App() {
  return (
    <div className="App">
      <Recorder />
      <Calendar />
    </div>
  );
}

export default App;
