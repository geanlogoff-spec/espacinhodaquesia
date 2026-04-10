import React, { useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import Card from '../components/Card';
import { useAppStore } from '../store/useAppStore';
import { Folder, Link as LinkIcon, Download, Search, Plus, Trash2, Copy, Share2, CheckCircle2 } from 'lucide-react';
import './Arquivos.css';

const Arquivos = () => {
  const { arquivos, handleAddArquivo, handleRemoverArquivo } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  // States for new link form
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newPlat, setNewPlat] = useState('Google Drive');

  const filteredArquivos = arquivos.filter(arq => 
    arq.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    arq.tamanho.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitLink = (e) => {
    e.preventDefault();
    if (newTitle && newUrl) {
      const today = new Date();
      const formattedDate = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      
      handleAddArquivo({
        nome: newTitle,
        link: newUrl,
        tamanho: `Link ${newPlat}`,
        data: formattedDate
      });
      
      setNewTitle('');
      setNewUrl('');
      setShowModal(false);
    }
  };

  const copyPortalLink = () => {
    const portalUrl = `${window.location.origin}/portal`;
    navigator.clipboard.writeText(portalUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    });
  };

  return (
    <div className="animate-fade-in" style={{maxWidth: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
      
      {/* HEADER HERO */}
      <div className="arquivos-hero-banner card animate-fade-in">
        <div style={{display:'flex', gap: '1rem', alignItems: 'center'}}>
          <div className="summary-icon sequence-icon" style={{width: 60, height: 60}}><Folder size={28} /></div>
          <div className="welcome-text">
            <h2>Nuvem & Portal</h2>
            <p>Gerencie links na nuvem e modelos liberados para sua equipe.</p>
          </div>
        </div>
        
        {/* Magic Button: Copy Public Portal Link */}
        <div className="portal-action-box">
           <div className="portal-status-badge">
             <span className="live-dot"></span> Portal Online
           </div>
           <button 
             className={`btn ${linkCopied ? 'btn-green' : 'btn-outline'}`} 
             onClick={copyPortalLink}
             style={{display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700}}
           >
             {linkCopied ? <><CheckCircle2 size={18}/> Copiado!</> : <><Share2 size={18}/> Copiar Link do Portal</>}
           </button>
           <small style={{color: 'var(--text-light)', display: 'block', textAlign: 'right', marginTop: '0.5rem', fontSize: '0.75rem'}}>
             Envie no grupo do WhatsApp
           </small>
        </div>
      </div>

      <Card className="stagger-1">
        <div className="arq-toolbar">
          <div className="search-bar" style={{border: '1px solid var(--card-border)', flex: 1, maxWidth: '400px'}}>
              <Search size={18} color="var(--text-light)" />
              <input 
                type="text" 
                placeholder="Buscar links cadastrados..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <button className="btn btn-green" onClick={() => setShowModal(true)}>
             <Plus size={18}/> Anexar Link da Nuvem
          </button>
        </div>

        <div className="table-responsive">
          <table className="custom-table seq-table">
            <thead>
              <tr>
                <th>Nome / Descrição</th>
                <th>Plataforma</th>
                <th>Data</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredArquivos.length === 0 ? (
                <tr><td colSpan="4" style={{textAlign: 'center', padding: '2rem'}}>Nenhum arquivo ou link disponível.</td></tr>
              ) : (
                filteredArquivos.map(arq => (
                  <tr key={arq.id}>
                    <td>
                      <div style={{display:'flex', alignItems:'center', gap: '0.6rem'}}>
                         <LinkIcon size={16} style={{color: 'var(--primary-purple)'}}/> 
                         <span style={{fontWeight: 700}}>{arq.nome}</span>
                      </div>
                    </td>
                    <td><span className="plat-badge">{arq.tamanho}</span></td>
                    <td style={{color: 'var(--text-muted)'}}>{arq.data}</td>
                    <td>
                      <div style={{display:'flex', gap: '0.5rem'}}>
                        <a href={arq.link} target="_blank" rel="noreferrer" className="btn btn-outline btn-small action-btn">
                          <Download size={14}/> Acessar
                        </a>
                        <button className="btn btn-small btn-danger rounded-icon" onClick={() => handleRemoverArquivo(arq.id)}>
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Novo Link */}
      {showModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{maxWidth: '500px'}}>
            <div className="modal-header">
              <h3>Anexar Material à Nuvem</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form className="modal-body" onSubmit={handleSubmitLink}>
              <div className="form-group">
                <label>Título do Material</label>
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="Ex: Calendário Oficial 2024"
                  required
                />
              </div>
              <div className="form-group">
                <label>Onde ele está armazenado?</label>
                <select value={newPlat} onChange={(e) => setNewPlat(e.target.value)}>
                  <option value="Google Drive">Google Drive</option>
                  <option value="OneDrive">OneDrive</option>
                  <option value="Canva">Canva</option>
                  <option value="Link Externo">Outro Link Externo</option>
                </select>
              </div>
              <div className="form-group">
                <label>URL / Link de Compartilhamento</label>
                <input 
                  type="url" 
                  value={newUrl} 
                  onChange={(e)=>setNewUrl(e.target.value)} 
                  placeholder="https://drive.google.com/..."
                  required
                />
                <small style={{color:'var(--text-light)', marginTop:'0.3rem', display:'block'}}>Certifique-se de que o link do seu Drive tem permissão de leitura.</small>
              </div>

              <div className="modal-actions" style={{marginTop: '2rem'}}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-green">Salvar e Liberar no Portal</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Arquivos;
