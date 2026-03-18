// src/AppStyles.js

export const styles = {
  // --- ESTILOS GENERALES Y TIPOGRAFÍA ---
  labelStyle: { 
    fontSize: '0.8rem', 
    fontWeight: '700', 
    color: '#64748b', 
    marginBottom: '4px', 
    fontFamily: '"Inter", sans-serif' 
  },
  subLabel: { 
    fontSize: '0.9rem', 
    fontWeight: '700', 
    color: '#1e293b', 
    marginBottom: '10px', 
    fontFamily: '"Inter", sans-serif' 
  },
  subLabelNormal: { 
    fontSize: '0.9rem', 
    color: '#1e293b', 
    fontWeight: '700', 
    fontFamily: '"Inter", sans-serif' 
  },
  inputStyle: { 
    width: '100%', 
    padding: '12px 15px', 
    borderRadius: '10px', 
    border: '1px solid #e2e8f0', 
    backgroundColor: '#f8fafc', 
    color: '#1e293b', 
    fontSize: '0.95rem', 
    fontFamily: '"Inter", sans-serif', 
    boxSizing: 'border-box', 
    outline: 'none' 
  },
  selectStyle: { 
    width: '100%', 
    padding: '12px 15px', 
    borderRadius: '10px', 
    border: '1px solid #e2e8f0', 
    backgroundColor: '#f8fafc', 
    color: '#1e293b', 
    fontSize: '0.95rem', 
    cursor: 'pointer', 
    boxSizing: 'border-box', 
    fontFamily: '"Inter", sans-serif' 
  },

  // --- COMPONENTES DE LOGIN / REGISTRO ---
  loginContainer: { 
    height: '100vh', 
    width: '100vw', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#f1f5f9', 
    margin: 0, 
    padding: 0 
  },
  loginCard: { 
    padding: '50px 40px', 
    backgroundColor: '#ffffff', 
    borderRadius: '28px', 
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', 
    width: '100%', 
    maxWidth: '420px', 
    textAlign: 'center', 
    border: '1px solid #e2e8f0' 
  },
  loginInputGroup: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '12px', 
    border: '2px solid #e2e8f0', 
    padding: '14px 18px', 
    borderRadius: '16px', 
    marginBottom: '20px', 
    backgroundColor: '#f8fafc' 
  },
  loginInput: { 
    border: 'none', 
    outline: 'none', 
    width: '100%', 
    backgroundColor: 'transparent', 
    fontSize: '1rem', 
    color: '#1e293b', 
    fontWeight: '500',
    fontFamily: '"Inter", sans-serif' 
  },
  loginButtonStyle: { 
    width: '100%', 
    padding: '16px', 
    backgroundColor: '#2563eb', 
    color: '#ffffff', 
    border: 'none', 
    borderRadius: '16px', 
    fontWeight: '800', 
    cursor: 'pointer', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: '10px', 
    fontSize: '1.1rem', 
    boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)', 
    marginTop: '10px',
    fontFamily: '"Inter", sans-serif' 
  },
  toggleButtonStyle: { 
    background: 'none', 
    border: 'none', 
    color: '#2563eb', 
    marginTop: '25px', 
    cursor: 'pointer', 
    fontSize: '0.95rem', 
    fontWeight: '700', 
    textDecoration: 'underline',
    fontFamily: '"Inter", sans-serif' 
  },
  errorBox: { 
    backgroundColor: '#fff1f2', 
    color: '#be123c', 
    padding: '12px', 
    borderRadius: '12px', 
    fontSize: '0.9rem', 
    fontWeight: '600', 
    marginBottom: '20px', 
    border: '1px solid #fecdd3' 
  },
  successBox: { 
    backgroundColor: '#f0fdf4', 
    color: '#16a34a', 
    padding: '12px', 
    borderRadius: '12px', 
    fontSize: '0.9rem', 
    fontWeight: '600', 
    marginBottom: '20px', 
    border: '1px solid #bbf7d0' 
  },

  // --- NAVEGACIÓN Y ESTRUCTURA ---
  headerStyle: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    padding: '15px 40px', 
    backgroundColor: '#fff', 
    borderBottom: '1px solid #e2e8f0', 
    alignItems: 'center' 
  },
  optionCard: { 
    backgroundColor: '#fff', 
    padding: '40px', 
    borderRadius: '24px', 
    textAlign: 'center', 
    boxShadow: '0 10px 25px rgba(0,0,0,0.05)', 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center' 
  },
  cardHeading: { color: '#000', fontWeight: '800', margin: '15px 0', fontSize: '1.4rem' },
  avatarStyle: { 
    width: '70px', 
    height: '70px', 
    backgroundColor: '#eff6ff', 
    borderRadius: '50%', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: '10px' 
  },
  startBtn: { 
    padding: '14px 24px', 
    backgroundColor: '#2563eb', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '12px', 
    cursor: 'pointer', 
    fontWeight: 'bold', 
    width: '100%',
    fontFamily: '"Inter", sans-serif'
  },
  cardStyle: { 
    backgroundColor: '#fff', 
    padding: '30px', 
    borderRadius: '20px', 
    boxShadow: '0 2px 10px rgba(0,0,0,0.03)', 
    marginBottom: '20px' 
  },
  backBtn: { background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', marginBottom: '10px', fontWeight: 'bold' },
  logoutBtn: { background: 'none', border: 'none', color: '#be123c', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' },

  // --- CALCULADORA Y RESULTADOS ---
  calculatorLayout: { display: 'flex', gap: '30px', alignItems: 'flex-start' },
  asideStyle: { width: '400px', flexShrink: '0', position: 'sticky', top: '20px' },
  questionBlock: { padding: '15px', backgroundColor: '#fbfcfd', borderRadius: '12px', border: '1px solid #f1f5f9' },
  calcBtn: { 
    width: '100%', 
    padding: '18px', 
    backgroundColor: '#2563eb', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '15px', 
    fontSize: '1.1rem', 
    fontWeight: 'bold', 
    marginTop: '20px', 
    cursor: 'pointer', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: '10px' 
  },
  pacienteBadgeStyle: { 
    backgroundColor: '#eff6ff', 
    color: '#2563eb', 
    padding: '5px 15px', 
    borderRadius: '20px', 
    fontSize: '0.8rem', 
    fontWeight: 'bold' 
  },
  rowYesNo: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '8px 0', 
    borderBottom: '1px solid #f1f5f9' 
  },

  // --- LISTADOS Y BÚSQUEDA ---
  searchBar: { 
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px', 
    backgroundColor: '#f8fafc', 
    padding: '12px', 
    borderRadius: '12px', 
    border: '1px solid #e2e8f0', 
    color: '#1e293b' 
  },
  itemPacienteStyle: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '15px', 
    backgroundColor: '#f8fafc', 
    borderRadius: '12px', 
    border: '1px solid #e2e8f0', 
    color: '#1e293b', 
    fontFamily: '"Inter", sans-serif' 
  },

  // --- BOTONES DE ACCIÓN ---
  actionBtnBlue: { padding: '8px 12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' },
  actionBtnGray: { padding: '8px 12px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' },
  actionBtnRed: { 
    padding: '8px 12px', 
    backgroundColor: '#fef2f2', 
    color: '#dc2626', 
    border: '1px solid #fee2e2', 
    borderRadius: '8px', 
    fontSize: '0.8rem', 
    cursor: 'pointer', 
    fontWeight: '600', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  btnMini: { padding: '4px 12px', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', backgroundColor: '#fff', color: '#64748b', fontWeight: '400', cursor: 'pointer' },
  btnMiniActive: { padding: '4px 12px', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #2563eb', backgroundColor: '#2563eb', color: '#fff', fontWeight: '400', cursor: 'pointer' }
};