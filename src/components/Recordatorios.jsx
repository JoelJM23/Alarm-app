import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './Recordatorios.css';

export default function Recordatorios() {
  const [recordatorios, setRecordatorios] = useState([]);
  const [fechaPicker, setFechaPicker] = useState(new Date());
  const [form, setForm] = useState({
    texto: '',
    hora: '12',
    minuto: '00',
    meridiano: 'AM',
  });

  const recordatoriosRef = useRef([]);

  useEffect(() => {
    const data = localStorage.getItem('recordatorios');
    if (data) {
      const parsed = JSON.parse(data);
      setRecordatorios(parsed);
      recordatoriosRef.current = parsed;
    }
  }, []);

  const updateRecordatorios = (nuevos) => {
    setRecordatorios(nuevos);
    recordatoriosRef.current = nuevos;
    localStorage.setItem('recordatorios', JSON.stringify(nuevos));
  };

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      fecha: fechaPicker.toISOString().split('T')[0]
    }));
  }, [fechaPicker]);

  useEffect(() => {
    Notification.requestPermission();

    const interval = setInterval(() => {
      const ahora = new Date();

      recordatoriosRef.current.forEach((r) => {
        const horaNum = parseInt(r.hora);
        const hora24 = r.meridiano === 'PM' && horaNum < 12
          ? horaNum + 12
          : r.meridiano === 'AM' && horaNum === 12
          ? 0
          : horaNum;

        const fechaHora = new Date(`${r.fecha}T${hora24.toString().padStart(2, '0')}:${r.minuto}`);

        const diff = Math.abs(ahora - fechaHora);
        if (diff < 60000 && !r.notificado) {
          const audio = document.getElementById('alarma-audio');
          if (audio) audio.play();

          if (Notification.permission === 'granted') {
            new Notification('📌 Recordatorio', { body: r.texto });
          }

          const actualizados = recordatoriosRef.current.map((el) =>
            el.id === r.id ? { ...el, notificado: true } : el
          );
          updateRecordatorios(actualizados);
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const agregar = () => {
    if (!form.texto || !form.fecha || !form.hora || !form.minuto) return;

    const nuevo = {
      id: Date.now(),
      ...form,
      notificado: false,
    };

    const actualizados = [...recordatoriosRef.current, nuevo];
    updateRecordatorios(actualizados);
    setForm({
      texto: '',
      hora: '12',
      minuto: '00',
      meridiano: 'AM',
    });
    setFechaPicker(new Date());
  };
  const eliminarRecordatorio = (id) => {
    const filtrados = recordatorios.filter((r) => r.id !== id);
    updateRecordatorios(filtrados);
  };


  return (
    <div className="recordatorio-contenedor">
      <h2>Recordatorios</h2>
      <div className="formulario">
        <label>¿Qué debo recordar?</label>
        <input
          type="text"
          value={form.texto}
          onChange={(e) => setForm({ ...form, texto: e.target.value })}
        />

        <label>Fecha:</label>
        <DatePicker
          selected={fechaPicker}
          onChange={(date) => setFechaPicker(date)}
          dateFormat="yyyy-MM-dd"
          className="datepicker-input"
        />

        <label>Hora:</label>
        <div className="hora-selector">
          <select value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })}>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
            ))}
          </select>
          <span>:</span>
          <select value={form.minuto} onChange={(e) => setForm({ ...form, minuto: e.target.value })}>
            {[...Array(60)].map((_, i) => (
              <option key={i} value={String(i).padStart(2, '0')}>{String(i).padStart(2, '0')}</option>
            ))}
          </select>
          <select value={form.meridiano} onChange={(e) => setForm({ ...form, meridiano: e.target.value })}>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>

        <button onClick={agregar}>Agregar</button>
      </div>

      {recordatorios.map((r) => (
        <div key={r.id} className="recordatorio-card card">
          <div className="contenido-recordatorio">
            <h3>{r.texto}</h3>
            <p>
              📅 {new Date(r.fecha).toLocaleDateString()}<br />
              🕒 {r.hora}:{r.minuto} {r.meridiano}
            </p>
          </div>

          {/* ✅ Botón fuera del flujo, al fondo a la derecha */}
          <button
            className="btn-eliminar abajo"
            onClick={() => eliminarRecordatorio(r.id)}
          >
            🗑️
          </button>
        </div>
      ))}
    </div>
  );
}
