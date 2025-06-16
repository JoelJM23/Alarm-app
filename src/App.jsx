import React, { useState } from 'react';
import Alarmas from './components/Alarmas';
import Recordatorios from './components/Recordatorios';
import BottomNav from './components/BottomNav';

function App() {
  const [vista, setVista] = useState('alarmas');

  return (
    <div style={{ paddingBottom: '4rem' }}>
      {vista === 'alarmas' ? <Alarmas /> : <Recordatorios />}
      <BottomNav currentView={vista} setView={setVista} />
    </div>
  );
}

export default App;
