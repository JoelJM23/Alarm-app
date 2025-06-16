import React, { useState, useEffect, useRef } from 'react';
import './Alarmas.css';

export default function Alarmas() {
  const [alarmas, setAlarmas] = useState([]);
  const [form, setForm] = useState({
    hora: '12',
    minuto: '00',
    meridiano: 'AM',
    etiqueta: '',
    dias: []
  });

  const diasSemana = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
  const nowDia = () => diasSemana[(new Date().getDay() + 6) % 7]; // Ajustar para que 0=Domingo

  const alarmasRef = useRef([]);

  // Cargar alarmas desde localStorage
  useEffect(() => {
    const data = localStorage.getItem('alarmas');
    if (data) {
      const parsed = JSON.parse(data);
      setAlarmas(parsed);
      alarmasRef.current = parsed;
    }
  }, []);

  // Guardar alarmas en localStorage
  const updateAlarmas = (nuevasAlarmas) => {
    setAlarmas(nuevasAlarmas);
    alarmasRef.current = nuevasAlarmas;
    localStorage.setItem('alarmas', JSON.stringify(nuevasAlarmas));
  };

  // Revisión de alarmas cada 10 segundos
  useEffect(() => {
    Notification.requestPermission();

    const interval = setInterval(() => {
      const ahora = new Date();
      const dia = nowDia();

      alarmasRef.current.forEach((a) => {
        if (!a.activa || !a.dias.includes(dia)) return;

        let horaNum = parseInt(a.hora);
        if (a.meridiano === 'PM' && horaNum < 12) horaNum += 12;
        if (a.meridiano === 'AM' && horaNum === 12) horaNum = 0;

        const ahoraH = ahora.getHours();
        const ahoraM = ahora.getMinutes();

        if (ahoraH === horaNum && ahoraM === parseInt(a.minuto)) {
          if (!a.lastTriggered || a.lastTriggered !== ahora.toDateString()) {
            const audio = document.getElementById('alarma-audio');
            if (audio) audio.play();

            if (Notification.permission === 'granted') {
              new Notification('⏰ Alarma', { body: a.etiqueta });
            }

            const actualizadas = alarmasRef.current.map((al) =>
              al.id === a.id ? { ...al, lastTriggered: ahora.toDateString() } : al
            );
            updateAlarmas(actualizadas);
          }
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const toggleDia = (dia) => {
    setForm((prev) => {
      const dias = prev.dias.includes(dia)
        ? prev.dias.filter((d) => d !== dia)
        : [...prev.dias, dia];
      return { ...prev, dias };
    });
  };

  const agregarAlarma = () => {
    const nueva = {
      id: Date.now(),
      ...form,
      activa: true,
      lastTriggered: null
    };
    const actualizadas = [...alarmasRef.current, nueva];
    updateAlarmas(actualizadas);
    setForm({ hora: '12', minuto: '00', meridiano: 'AM', etiqueta: '', dias: [] });
  };

  const toggleAlarma = (id) => {
    const actualizadas = alarmas.map(a => a.id === id ? { ...a, activa: !a.activa } : a);
    updateAlarmas(actualizadas);
  };
  const eliminarAlarma = (id) => {
    const filtradas = alarmas.filter((a) => a.id !== id);
    updateAlarmas(filtradas);
  };


  return (
    <div className="alarma-contenedor">
      <h2>Alarmas</h2>
      <div className="formulario">
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

        <label>Nombre:</label>
        <input type="text" placeholder="Nombre de la alarma" value={form.etiqueta} onChange={(e) => setForm({ ...form, etiqueta: e.target.value })} />

        <label>Días:</label>
        <div className="dias-selector">
          {diasSemana.map((d, i) => (
            <button
              key={i}
              className={form.dias.includes(d) ? 'activo' : ''}
              onClick={() => toggleDia(d)}
            >
              {d}
            </button>
          ))}
        </div>

        <button onClick={agregarAlarma}>Agregar</button>
      </div>

      {alarmas.map((a) => (
        <div key={a.id} className="alarma-card card">
          <div className="alarma-hora">{a.hora}:{a.minuto} {a.meridiano}</div>
          <div className="alarma-detalles">
            <span>{a.etiqueta}</span>
            <div className="alarma-dias">
              {diasSemana.map((d, i) => (
                <span key={i} className={a.dias.includes(d) ? 'seleccionado' : ''}>{d}</span>
              ))}
            </div>
          </div>
          <div className="acciones-alarma">
            <label className="switch">
                <input type="checkbox" checked={a.activa} onChange={() => toggleAlarma(a.id)} />
                <span className="slider"></span>
            </label>
            <button className="btn-eliminar" onClick={() => eliminarAlarma(a.id)}>🗑️</button>
           </div>
        </div>
      ))}
    </div>
  );
}
