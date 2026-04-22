import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmDeleteModal = ({ isOpen, title, message, onConfirm, onCancel, itemName }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay animate-fade-in" style={{ zIndex: 9999 }}>
      <div className="modal-content animate-slide-up" style={{ maxWidth: '400px' }}>
        <div className="modal-header" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e74c3c' }}>
            <AlertTriangle size={24} />
            <h3 style={{ margin: 0, color: '#e74c3c' }}>{title || 'Confirmar Exclusão'}</h3>
          </div>
          <button className="icon-btn-close" onClick={onCancel}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <p style={{ margin: '10px 0 20px', color: 'var(--text-secondary, #666)', lineHeight: '1.5' }}>
            {message || `Tem certeza que deseja excluir "${itemName}"? Esta ação não poderá ser desfeita e pode apagar dados vinculados a este registro.`}
          </p>
          <div className="modal-actions" style={{ marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={onCancel}>Cancelar</button>
            <button type="button" className="btn btn-green" style={{ background: '#e74c3c', borderColor: '#e74c3c', color: 'white' }} onClick={onConfirm}>
              Sim, Excluir
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmDeleteModal;
