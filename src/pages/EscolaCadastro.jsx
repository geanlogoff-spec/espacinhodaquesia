import React, { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import Card from '../components/Card';
import { useAppStore } from '../store/useAppStore';
import { School, Plus, X, CheckCircle2, MapPin, Phone, Mail, Pencil, Trash2 } from 'lucide-react';
import './Escola.css';

const EscolaCadastro = () => {
  const { escolas = [], handleAddEscola, handleEditEscola, handleRemoverEscola } = useAppStore();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEscola, setEditingEscola] = useState(null);
  const [formData, setFormData] = useState({ nome: '', endereco: '', telefone: '', email: '', diretor: '' });

  const resetForm = () => {
    setFormData({ nome: '', endereco: '', telefone: '', email: '', diretor: '' });
    setEditingEscola(null);
    setShowAddForm(false);
  };

  const openAdd = () => {
    setFormData({ nome: '', endereco: '', telefone: '', email: '', diretor: '' });
    setEditingEscola(null);
    setShowAddForm(true);
  };

  const openEdit = (escola) => {
    setFormData({
      nome: escola.nome || '',
      endereco: escola.endereco || '',
      telefone: escola.telefone || '',
      email: escola.email || '',
      diretor: escola.diretor || ''
    });
    setEditingEscola(escola.id);
    setShowAddForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome) return;

    if (editingEscola) {
      handleEditEscola(editingEscola, formData);
    } else {
      handleAddEscola(formData);
    }

    resetForm();
  };

  return (
    <div className="escola-container animate-fade-in stagger-1">
      {/* Header */}
      <div className="seq-header-title" style={{ marginBottom: '1rem' }}>
        <div className="summary-icon" style={{ width: 50, height: 50, background: 'linear-gradient(135deg, #9adbf6 0%, #7ec8e3 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}><School size={20} /></div>
        <h2 className="text-title">Cadastro de Escola</h2>
      </div>

      <Card>
        <div className="escola-toolbar">
          <p className="text-body" style={{ marginBottom: '1rem' }}>Cadastre e gerencie as informações da(s) escola(s) vinculadas ao sistema.</p>
          <button className="btn btn-green mobile-full-width" onClick={openAdd}>
            <Plus size={16} /> Cadastrar Escola
          </button>
        </div>

        <div className="escola-list">
          {escolas.map(escola => (
            <div key={escola.id} className="escola-card-item">
              <div className="escola-header">
                <div className="escola-info">
                  <div className="escola-avatar">
                    <School size={20} />
                  </div>
                  <div>
                    <h4 className="escola-name">{escola.nome}</h4>
                    {escola.diretor && <span className="escola-detail"><strong>Diretor(a):</strong> {escola.diretor}</span>}
                  </div>
                </div>

                <div className="escola-actions">
                  <button className="icon-btn-edit" onClick={() => openEdit(escola)} title="Editar escola">
                    <Pencil size={16} />
                  </button>
                  <button className="icon-btn-delete" onClick={() => handleRemoverEscola(escola.id)} title="Remover escola">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="escola-meta">
                {escola.endereco && (
                  <span className="escola-meta-item">
                    <MapPin size={14} /> {escola.endereco}
                  </span>
                )}
                {escola.telefone && (
                  <span className="escola-meta-item">
                    <Phone size={14} /> {escola.telefone}
                  </span>
                )}
                {escola.email && (
                  <span className="escola-meta-item">
                    <Mail size={14} /> {escola.email}
                  </span>
                )}
              </div>
            </div>
          ))}
          {escolas.length === 0 && (
            <div className="empty-state">Nenhuma escola cadastrada ainda.</div>
          )}
        </div>
      </Card>

      {/* Modal de Cadastro / Edição */}
      {showAddForm && createPortal(
        <div className="modal-overlay animate-fade-in">
          <div className="modal-content animate-slide-up">
            <div className="modal-header">
              <h3>{editingEscola ? 'Editar Escola' : 'Cadastrar Escola'}</h3>
              <button className="icon-btn-close" onClick={resetForm}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit} className="add-prof-form-modal">
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Nome da Escola *</label>
                    <input type="text" className="custom-input" placeholder="Ex: Escola Municipal São José" value={formData.nome} onChange={e => setFormData({ ...formData, nome: e.target.value })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Endereço</label>
                    <input type="text" className="custom-input" placeholder="Ex: Rua das Flores, 123" value={formData.endereco} onChange={e => setFormData({ ...formData, endereco: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Telefone</label>
                    <input type="text" className="custom-input" placeholder="(00) 0000-0000" value={formData.telefone} onChange={e => setFormData({ ...formData, telefone: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label>E-mail</label>
                    <input type="text" className="custom-input" placeholder="escola@email.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group full-width">
                    <label>Diretor(a) Responsável</label>
                    <input type="text" className="custom-input" placeholder="Nome do(a) diretor(a)" value={formData.diretor} onChange={e => setFormData({ ...formData, diretor: e.target.value })} />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={resetForm}>Cancelar</button>
                  <button type="submit" className="btn btn-green">
                    <CheckCircle2 size={16} /> {editingEscola ? 'Salvar Alterações' : 'Salvar Escola'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default EscolaCadastro;
