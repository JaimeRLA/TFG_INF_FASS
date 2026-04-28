import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Activity,
  Calendar,
  ArrowUpCircle,
  ArrowDownCircle,
  RefreshCw
} from 'lucide-react';
import { styles } from '../AppStyles.js';

const DashboardView = ({ usuarioLogueado, setTabActiva }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('all'); // all, 30d, 90d, 365d

  const BASE_URL = "https://tfg-inf-fass.onrender.com";
  const TFG_KEY = import.meta.env.VITE_APP_TFG_KEY;

  useEffect(() => {
    cargarEstadisticas();
  }, [timeRange]);

  const cargarEstadisticas = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/stats`, {
        params: { 
          medico: usuarioLogueado,
          timeRange: timeRange 
        },
        headers: { 'x-tfg-key': TFG_KEY }
      });
      setStats(res.data);
    } catch (err) {
      setError("Error al cargar estadísticas");
      console.error('Error cargarEstadisticas:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        flexDirection: 'column',
        gap: '15px'
      }}>
        <RefreshCw size={40} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Cargando estadísticas...</p>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...styles.cardStyle, textAlign: 'center', padding: '60px 20px' }}>
        <AlertTriangle size={50} color="#f59e0b" style={{ marginBottom: '15px' }} />
        <h3 style={{ color: '#1e293b', marginBottom: '10px' }}>No se pudieron cargar las estadísticas</h3>
        <p style={{ color: '#64748b', marginBottom: '20px' }}>{error}</p>
        <button onClick={cargarEstadisticas} style={styles.primaryBtn}>
          Reintentar
        </button>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, label, value, color, trend, subtitle }) => (
    <div style={{ 
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: '20px',
      border: '1px solid #e2e8f0',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ 
          backgroundColor: '#f1f5f9', 
          padding: '8px', 
          borderRadius: '6px' 
        }}>
          <Icon size={18} color={color} />
        </div>
        {trend && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            fontSize: '0.8rem',
            color: trend > 0 ? '#15803d' : '#b91c1c',
            fontWeight: '600'
          }}>
            {trend > 0 ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#0f172a', marginBottom: '2px', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '0.825rem', color: '#475569', fontWeight: '600', marginTop: '4px' }}>
        {label}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
          {subtitle}
        </div>
      )}
    </div>
  );

  const BarChart = ({ data, label }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '20px', fontWeight: '700' }}>
          {label}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.map((item, idx) => (
            <div key={idx}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '6px',
                fontSize: '0.85rem'
              }}>
                <span style={{ color: '#475569', fontWeight: '600' }}>{item.name}</span>
                <span style={{ color: '#1e293b', fontWeight: '700' }}>{item.value}</span>
              </div>
              <div style={{ 
                height: '10px', 
                backgroundColor: '#f1f5f9', 
                borderRadius: '5px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  height: '100%', 
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: item.color || '#2563eb',
                  borderRadius: '5px',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const PieChart = ({ data, label }) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent) => {
      const x = Math.cos(2 * Math.PI * percent);
      const y = Math.sin(2 * Math.PI * percent);
      return [x, y];
    };

    return (
      <div style={{ padding: '20px' }}>
        <h4 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '20px', fontWeight: '700' }}>
          {label}
        </h4>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <svg width="180" height="180" viewBox="-1 -1 2 2" style={{ transform: 'rotate(-90deg)' }}>
            {data.map((slice, idx) => {
              const [startX, startY] = getCoordinatesForPercent(cumulativePercent);
              cumulativePercent += slice.value / total;
              const [endX, endY] = getCoordinatesForPercent(cumulativePercent);
              const largeArcFlag = slice.value / total > 0.5 ? 1 : 0;
              
              const pathData = [
                `M ${startX} ${startY}`,
                `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                'L 0 0',
              ].join(' ');

              return (
                <path
                  key={idx}
                  d={pathData}
                  fill={slice.color}
                  style={{ transition: 'opacity 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                />
              );
            })}
          </svg>
          <div style={{ flex: 1 }}>
            {data.map((item, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '10px'
              }}>
                <div style={{ 
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: item.color,
                  borderRadius: '3px'
                }}></div>
                <span style={{ fontSize: '0.85rem', color: '#475569', flex: 1 }}>
                  {item.name}
                </span>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#1e293b' }}>
                  {item.value} ({Math.round((item.value / total) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{...styles.infoCard}}>

      {/* CABECERA */}
      <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <p style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.08em', color: '#94a3b8', textTransform: 'uppercase', margin: '0 0 6px 0' }}>Estadísticas</p>
            <h2 style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>
              <BarChart3 size={20} color="#1d4ed8" /> Dashboard Clínico
            </h2>
          </div>

          {/* SELECTOR DE RANGO TEMPORAL */}
          <div style={{ 
            display: 'flex', gap: '2px', backgroundColor: '#f1f5f9', 
            padding: '4px', borderRadius: '6px', border: '1px solid #e2e8f0'
          }}>
            {[
              { value: 'all', label: 'Todo' },
              { value: '365d', label: '1 Año' },
              { value: '90d', label: '90 Días' },
              { value: '30d', label: '30 Días' }
            ].map(option => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value)}
                style={{
                  padding: '5px 12px', borderRadius: '4px', border: 'none',
                  fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer',
                  transition: 'all 0.15s',
                  backgroundColor: timeRange === option.value ? '#0f172a' : 'transparent',
                  color: timeRange === option.value ? '#fff' : '#64748b',
                  fontFamily: '"Inter", sans-serif'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: '16px', marginBottom: '25px'
      }}>
        <StatCard icon={Users}         label="Total Pacientes"       value={stats?.total_patients || 0}              color="#2563eb" subtitle="Pacientes únicos registrados" />
        <StatCard icon={Activity}      label="Evaluaciones Totales"  value={stats?.total_evaluations || 0}           color="#8b5cf6" subtitle="Episodios registrados" />
        <StatCard icon={AlertTriangle} label="Casos de Anafilaxia"   value={stats?.anaphylaxis_count || 0}           color="#dc2626" subtitle={`${stats?.anaphylaxis_percent || 0}% del total`} />
        <StatCard icon={TrendingUp}    label="nFASS Promedio"        value={stats?.avg_nfass?.toFixed(2) || '0.00'}  color="#f59e0b" subtitle="Score medio de severidad" />
      </div>

      {/* GRÁFICOS */}
      <div style={{ 
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', 
        gap: '16px', marginBottom: '16px'
      }}>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <PieChart label="Distribución por Severidad" data={stats?.severity_distribution || []} />
        </div>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <BarChart label="Alérgenos Más Frecuentes" data={stats?.top_allergens || []} />
        </div>
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          <BarChart label="Sistemas Orgánicos Afectados" data={stats?.affected_systems || []} />
        </div>
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontSize: '0.875rem', color: '#475569', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={16} color="#1d4ed8" /> Acciones rápidas
        </span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setTabActiva('app')}
            style={styles.actionBtnBlue}
          >
            Nueva Evaluación
          </button>
          <button 
            onClick={cargarEstadisticas}
            style={styles.actionBtnGray}
          >
            <RefreshCw size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />Actualizar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
