import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  Activity,
  Calendar,
  PieChart as PieChartIcon,
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
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.08)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
    }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        <div style={{ 
          backgroundColor: `${color}15`, 
          padding: '12px', 
          borderRadius: '12px' 
        }}>
          <Icon size={24} color={color} />
        </div>
        {trend && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px',
            fontSize: '0.85rem',
            color: trend > 0 ? '#16a34a' : '#dc2626',
            fontWeight: '600'
          }}>
            {trend > 0 ? <ArrowUpCircle size={16} /> : <ArrowDownCircle size={16} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '500' }}>
        {label}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>
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
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>
      {/* HEADER */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
          <div>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0' }}>
              Dashboard Clínico
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.95rem' }}>
              Estadísticas de tus pacientes con alergias alimentarias
            </p>
          </div>
          
          {/* SELECTOR DE RANGO TEMPORAL */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            backgroundColor: '#f8fafc', 
            padding: '6px', 
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
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
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: timeRange === option.value ? '#1e293b' : 'transparent',
                  color: timeRange === option.value ? '#fff' : '#64748b'
                }}
              >
                <Calendar size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS PRINCIPALES */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <StatCard
          icon={Users}
          label="Total Pacientes"
          value={stats?.total_patients || 0}
          color="#2563eb"
          subtitle="Pacientes únicos registrados"
        />
        <StatCard
          icon={Activity}
          label="Evaluaciones Totales"
          value={stats?.total_evaluations || 0}
          color="#8b5cf6"
          subtitle="Episodios registrados"
        />
        <StatCard
          icon={AlertTriangle}
          label="Casos de Anafilaxia"
          value={stats?.anaphylaxis_count || 0}
          color="#dc2626"
          subtitle={`${stats?.anaphylaxis_percent || 0}% del total`}
        />
        <StatCard
          icon={TrendingUp}
          label="nFASS Promedio"
          value={stats?.avg_nfass?.toFixed(2) || '0.00'}
          color="#f59e0b"
          subtitle="Score medio de severidad"
        />
      </div>

      {/* GRÁFICOS */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* DISTRIBUCIÓN POR SEVERIDAD */}
        <div style={{ 
          backgroundColor: '#fff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <PieChart
            label="Distribución por Severidad"
            data={stats?.severity_distribution || []}
          />
        </div>

        {/* TOP ALÉRGENOS */}
        <div style={{ 
          backgroundColor: '#fff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <BarChart
            label="Alérgenos Más Frecuentes"
            data={stats?.top_allergens || []}
          />
        </div>

        {/* SISTEMAS MÁS AFECTADOS */}
        <div style={{ 
          backgroundColor: '#fff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <BarChart
            label="Sistemas Orgánicos Afectados"
            data={stats?.affected_systems || []}
          />
        </div>
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div style={{ ...styles.cardStyle, padding: '30px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#1e293b', marginBottom: '20px' }}>
          Acciones Rápidas
        </h3>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setTabActiva('app')}
            style={{
              ...styles.primaryBtn,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Users size={18} /> Nueva Evaluación
          </button>
          <button 
            onClick={cargarEstadisticas}
            style={{
              padding: '12px 24px',
              borderRadius: '10px',
              border: '1px solid #e2e8f0',
              backgroundColor: '#fff',
              color: '#475569',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
          >
            <RefreshCw size={18} /> Actualizar Datos
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
