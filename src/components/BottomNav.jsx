import React from 'react';
import { FaBell, FaStickyNote } from 'react-icons/fa';
import './BottomNav.css';

export default function BottomNav({ currentView, setView }) {
  return (
    <div className="bottom-nav">
      <button
        className={currentView === 'alarmas' ? 'nav-btn activo' : 'nav-btn'}
        onClick={() => setView('alarmas')}
      >
        <FaBell size={24} />
        <span className="nav-label">Alarmas</span>
      </button>
      <button
        className={currentView === 'recordatorios' ? 'nav-btn activo' : 'nav-btn'}
        onClick={() => setView('recordatorios')}
      >
        <FaStickyNote size={24} />
        <span className="nav-label">Recordatorios</span>
      </button>
    </div>
  );
}
  