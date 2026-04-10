import React, { useState } from 'react';
import Card from '../components/Card';
import { useAppStore } from '../store/useAppStore';
import { BarChart3, TrendingUp, Users, CheckCircle, FileText, Printer, School, Library, Award, Filter, Calendar } from 'lucide-react';
import './Relatorios.css';

const Relatorios = () => {
  const { escolas, turmas, professores, entregas, perfil } = useAppStore();

  const [filtroProfId, setFiltroProfId] = useState('');
  const [filtroEscolaId, setFiltroEscolaId] = useState('');
  const [filtroTurmaId, setFiltroTurmaId] = useState('');

  // 1. Resumo Pedagógico Geral
  const totalEscolas = escolas.length;
  const totalTurmas = turmas.length;
  const totalProfessores = professores.length;

  // Calculo de aulas dadas vs planejadas
  let matriculaTotalAulasPlanejadas = 0;
  let totalAulasDadas = 0;

  // Mapa de turmas para facilitar busca
  const mapTurmas = {};
  turmas.forEach(t => {
      mapTurmas[t.id] = t;
  });

  const desempenhoProfs = professores.map(prof => {
      // Calculo SD
      let totalVincSD = 0;
      let entregouSD = 0;

      entregas.forEach(ent => {
          const sv = ent.statusVinculos || {};
          Object.entries(sv).forEach(([k, v]) => {
            if (k.startsWith(`${prof.id}|`)) {
              totalVincSD++;
              if (v === 'entregue') entregouSD++;
            }
          });
      });
      const taxaSD = totalVincSD === 0 ? 0 : Math.round((entregouSD / totalVincSD) * 100);

      // Calculo Aulas (Carga progressão)
      let profAulasDadas = 0;
      let profCargaPlanejada = 0;

      if(prof.registroAulas) {
         Object.values(prof.registroAulas).forEach(arr => {
            profAulasDadas += arr.length;
         });
      }

      (prof.vinculos || []).forEach(v => {
          const t = mapTurmas[v.turmaId];
          if(t) {
              v.disciplinas.forEach(dNome => {
                  const disc = t.disciplinas.find(d => d.nome === dNome);
                  if(disc) profCargaPlanejada += parseInt(disc.cargaHoraria) || 0;
              });
          }
      });

      const execPctObj = profCargaPlanejada === 0 ? 0 : Math.round((profAulasDadas / profCargaPlanejada) * 100);

      totalAulasDadas += profAulasDadas;
      matriculaTotalAulasPlanejadas += profCargaPlanejada;

      return {
          id: prof.id,
          nome: prof.nome,
          entreguesSD: entregouSD,
          totalVincSD,
          taxaSD,
          aulasDadas: profAulasDadas,
          cargaPlanejada: profCargaPlanejada,
          execPct: execPctObj
      };
  });

  // Sort rankings
  const rankSD = [...desempenhoProfs].sort((a,b) => b.taxaSD - a.taxaSD);
  const rankProgresso = [...desempenhoProfs].sort((a,b) => b.execPct - a.execPct);

  // Panorama Sequências (SD)
  let amostraSDEntregue = 0;
  let amostraSDPendente = 0;
  let amostraSDTotal = 0;
  
  entregas.forEach(ent => {
      const sv = ent.statusVinculos || {};
      Object.values(sv).forEach(status => {
           amostraSDTotal++;
           if(status === 'entregue') amostraSDEntregue++;
           else amostraSDPendente++;
      });
  });

  const percentGarantido = amostraSDTotal === 0 ? 0 : Math.round((amostraSDEntregue / amostraSDTotal) * 100);

  const getProgressColor = (pct) => {
     if(pct >= 80) return 'success-gradient';
     if(pct >= 50) return 'warning-gradient';
     return 'danger-gradient';
  };

  const handlePrint = () => {
      window.print();
  };

  // 2. Relatório de Aulas Lecionadas
  const getRelatorioAulas = () => {
    let result = [];
    professores.forEach(prof => {
      if (filtroProfId && prof.id !== filtroProfId) return;
      if (filtroEscolaId && prof.escolaId !== filtroEscolaId) return;

      const profRegistroAulas = prof.registroAulas || {};
      
      (prof.vinculos || []).forEach(v => {
        if (filtroTurmaId && v.turmaId !== filtroTurmaId) return;
        
        const turmaRef = mapTurmas[v.turmaId];
        if (!turmaRef) return;
        
        // Se filtramos escola mas a turma nao é da escola, pula (caso prof.escolaId seja global mas a turma tem outro ID, garantir filtro cruzado)
        if (filtroEscolaId && turmaRef.escolaId !== filtroEscolaId) return;

        const escolaRef = escolas.find(e => e.id === turmaRef.escolaId);
        
        v.disciplinas.forEach(dNome => {
           const discDetails = turmaRef.disciplinas.find(d => d.nome === dNome);
           const cargaPrevista = discDetails ? parseInt(discDetails.cargaHoraria) || 0 : 0;
           
           const aulasKey = `${v.turmaId}|${dNome}`;
           const registros = profRegistroAulas[aulasKey] || [];
           
           const datas = registros.map(r => {
             // ensure correct timezone formatting if saved as iso string
             return new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR');
           }).sort();
           
           result.push({
             profId: prof.id,
             profNome: prof.nome,
             escolaNome: escolaRef ? escolaRef.nome : 'Sem Escola Associada',
             turmaNome: turmaRef.nome,
             disciplina: dNome,
             cargaPrevista: cargaPrevista,
             aulasDadas: registros.length,
             restam: Math.max(cargaPrevista - registros.length, 0),
             datas: datas
           });
        });
      });
    });
    return result;
  };

  const dadosRelatorioAulas = getRelatorioAulas();

  return (
    <>
    <div className="report-container web-view animate-fade-in stagger-1">
      <div className="report-header">
         <div className="seq-header-title" style={{marginBottom: 0}}>
            <div className="summary-icon" style={{width: 50, height: 50, backgroundColor: '#fdf2f2', color: '#e54d60'}}>
               <BarChart3 size={20} />
            </div>
            <div>
               <h2 className="text-title">Estatísticas e Relatórios</h2>
               <span style={{color: 'var(--text-light)', fontSize: '0.9rem', wordSpacing: '1px'}}>Painel gerencial para reuniões pedagógicas</span>
            </div>
         </div>
         <button className="btn btn-outline print-btn" onClick={handlePrint} style={{borderColor: 'var(--primary-purple)', color: 'var(--primary-purple)'}}>
            <Printer size={18}/> Imprimir Painel
         </button>
      </div>

      {/* KPI Geral da Escola */}
      <div className="kpi-grid print-kpi">
         <div className="kpi-card stagger-1">
            <div className="kpi-icon-wrapper kpi-green">
               <School size={28}/>
            </div>
            <div className="kpi-info">
               <span className="kpi-title">Rede / Escolas</span>
               <span className="kpi-value">{totalEscolas}</span>
            </div>
         </div>
         <div className="kpi-card stagger-2">
            <div className="kpi-icon-wrapper kpi-yellow">
               <Library size={28}/>
            </div>
            <div className="kpi-info">
               <span className="kpi-title">Salas e Turmas</span>
               <span className="kpi-value">{totalTurmas}</span>
            </div>
         </div>
         <div className="kpi-card stagger-3">
            <div className="kpi-icon-wrapper kpi-pink">
               <Users size={28}/>
            </div>
            <div className="kpi-info">
               <span className="kpi-title">Corpo Docente</span>
               <span className="kpi-value">{totalProfessores}</span>
            </div>
         </div>
         <div className="kpi-card stagger-4">
            <div className="kpi-icon-wrapper kpi-purple">
               <TrendingUp size={28}/>
            </div>
            <div className="kpi-info">
               <span className="kpi-title">Aulas Lançadas</span>
               <span className="kpi-value">{totalAulasDadas}</span>
            </div>
         </div>
      </div>

      {/* Visão Macro - SDs */}
      <div className="macro-sd-panel stagger-5">
         <div className="macro-header">
            <h3>Controle Global de Sequências Didáticas (Planejamentos)</h3>
            <span className={`macro-badge ${getProgressColor(percentGarantido)}`}>{percentGarantido}% Entregues</span>
         </div>
         
         <div className="macro-bar-container">
            <div className={`macro-bar-fill ${getProgressColor(percentGarantido)}`} style={{width: `${percentGarantido}%`}}></div>
         </div>
         
         <div className="macro-stats-row">
            <div className="macro-stat">
                <span className="stat-label">Total Cobrados</span>
                <span className="stat-num">{amostraSDTotal}</span>
            </div>
            <div className="macro-stat">
                <span className="stat-label" style={{color: '#10b981'}}>Em dias</span>
                <span className="stat-num" style={{color: '#10b981'}}>{amostraSDEntregue}</span>
            </div>
            <div className="macro-stat">
                <span className="stat-label" style={{color: '#ef4444'}}>Atrasos</span>
                <span className="stat-num" style={{color: '#ef4444'}}>{amostraSDPendente}</span>
            </div>
         </div>
      </div>

      {/* Grids Relatórios de Professores */}
      <div className="report-grid-2 stagger-6">
        
        {/* Controle SD */}
        <Card title="Assiduidade de Entregas (SD)" className="report-panel print-panel" subtitle="Percentual de material pedagógico entregue no prazo">
           <div className="ranking-list">
             {rankSD.map(prof => (
                <div className="ranking-item" key={`sd-${prof.id}`}>
                   <div className="rank-item-header">
                      <div className="rank-prof-group">
                         <div className="rank-prof-name">{prof.nome}</div>
                         <div className="rank-prof-meta">({prof.entreguesSD}/{prof.totalVincSD})</div>
                      </div>
                      <div className="rank-prof-score">
                         <span className={`score-badge ${getProgressColor(prof.taxaSD)}`}>{prof.taxaSD}%</span>
                      </div>
                   </div>
                   <div className="progress-track">
                      <div className={`progress-fill ${getProgressColor(prof.taxaSD)}`} style={{width: `${Math.min(prof.taxaSD, 100)}%`}}></div>
                   </div>
                </div>
             ))}
             {totalProfessores === 0 && <p className="empty-report">Nenhum professor cadastrado.</p>}
           </div>
        </Card>

        {/* Cobertura Carga Horária */}
        <Card title="Progresso Curricular" className="report-panel print-panel" subtitle="Comparativo de Aulas Dadas x Carga Horária Estipulada">
           <div className="ranking-list">
             {rankProgresso.map(prof => (
                <div className="ranking-item" key={`prog-${prof.id}`}>
                   <div className="rank-item-header">
                      <div className="rank-prof-group">
                         <div className="rank-prof-name">{prof.nome}</div>
                         <div className="rank-prof-meta">({prof.aulasDadas}/{prof.cargaPlanejada}h)</div>
                      </div>
                      <div className="rank-prof-score">
                         <span className="score-badge purple-gradient">{prof.execPct}%</span>
                      </div>
                   </div>
                   <div className="progress-track">
                      <div className="progress-fill purple-gradient" style={{width: `${Math.min(prof.execPct, 100)}%`}}></div>
                   </div>
                </div>
             ))}
             {totalProfessores === 0 && <p className="empty-report">Nenhum professor cadastrado para monitoramento.</p>}
           </div>
        </Card>

      </div>

      {/* Visão Detalhada de Aulas (Filtros e Relatório) */}
      <div className="detailed-report-section no-print-if-empty stagger-7" style={{ marginTop: '3rem' }}>
        <div className="detailed-report-header">
           <div className="seq-header-title">
              <div className="summary-icon" style={{width: 44, height: 44, backgroundColor: '#f0f5ff', color: '#3b82f6'}}>
                 <Filter size={18} />
              </div>
              <div>
                 <h2 className="text-title">Aulas Lecionadas - Detalhado</h2>
                 <span style={{color: 'var(--text-light)', fontSize: '0.85rem'}}>Filtre por professor, escola ou turma para ver as aulas ministradas</span>
              </div>
           </div>
           <button className="btn btn-outline print-btn no-print" onClick={() => {
              document.body.classList.add('print-detailed-only');
              window.print();
              setTimeout(() => document.body.classList.remove('print-detailed-only'), 500);
           }} style={{borderColor: '#3b82f6', color: '#3b82f6'}}>
              <Printer size={18}/> Imprimir Filtro
           </button>
        </div>

        <Card className="no-print filter-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
           <div className="filter-bar">
             <div className="filter-group">
                <label>Professor</label>
                <select className="form-input" value={filtroProfId} onChange={e => setFiltroProfId(e.target.value)}>
                   <option value="">Todos os Professores</option>
                   {professores.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
             </div>
             <div className="filter-group">
                <label>Escola</label>
                <select className="form-input" value={filtroEscolaId} onChange={e => {
                  setFiltroEscolaId(e.target.value);
                  setFiltroTurmaId(''); // Reset turma when changing escola
                }}>
                   <option value="">Todas as Escolas</option>
                   {escolas.map(e => <option key={e.id} value={e.id}>{e.nome}</option>)}
                </select>
             </div>
             <div className="filter-group">
                <label>Turma</label>
                <select className="form-input" value={filtroTurmaId} onChange={e => setFiltroTurmaId(e.target.value)}>
                   <option value="">Todas as Turmas</option>
                   {turmas.filter(t => !filtroEscolaId || t.escolaId === filtroEscolaId).map(t => (
                     <option key={t.id} value={t.id}>{t.nome}</option>
                   ))}
                </select>
             </div>
           </div>
        </Card>

        <div className="detailed-results-container">
           {dadosRelatorioAulas.length > 0 ? (
             <div className="detailed-table-wrapper">
               <table className="detailed-table">
                 <thead>
                   <tr>
                     <th>Professor</th>
                     <th>Escola / Turma</th>
                     <th>Disciplina</th>
                     <th className="center-cell">CH</th>
                     <th className="center-cell">Dadas</th>
                     <th className="center-cell">Faltam</th>
                     <th>Datas das Aulas</th>
                   </tr>
                 </thead>
                 <tbody>
                   {dadosRelatorioAulas.map((row, i) => (
                     <tr key={i}>
                       <td><strong>{row.profNome}</strong></td>
                       <td>
                          <div className="row-escola">{row.escolaNome}</div>
                          <div className="row-turma" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{row.turmaNome}</div>
                       </td>
                       <td>{row.disciplina}</td>
                       <td className="center-cell"><span style={{ fontWeight: 800, color: 'var(--text-main)' }}>{row.cargaPrevista}h</span></td>
                       <td className="center-cell"><span style={{ fontWeight: 800, color: '#10b981' }}>{row.aulasDadas}</span></td>
                       <td className="center-cell">
                         <span style={{ fontWeight: 800, color: row.restam === 0 ? 'var(--text-muted)' : '#ef4444' }}>
                           {row.restam}
                         </span>
                       </td>
                       <td className="dates-cell" style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                          {row.datas.length > 0 ? row.datas.join(', ') : <span style={{ color: 'var(--text-light)' }}>Nenhuma</span>}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           ) : (
             <div className="empty-filter-state no-print" style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-lg)' }}>
               <Calendar size={40} style={{opacity: 0.2, margin: '0 auto 1rem', display: 'block'}} />
               <p style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Nenhuma aula encontrada para os filtros selecionados.</p>
             </div>
           )}
        </div>
      </div>
    </div>

    {/* =========================================
        DUAL RENDER: THE PRINT DOCUMENT
    ========================================= */}
    <div className="print-document only-print" style={{ display: 'none' }}>
      <div className="print-doc-header">
        <h1>RELATÓRIO DE DESEMPENHO PEDAGÓGICO</h1>
        <h2>{perfil.tituloDaPlataforma.toUpperCase()}</h2>
        <table className="print-meta-table">
          <tbody>
            <tr>
              <td><strong>Emissor:</strong> {perfil.cargo} {perfil.nome}</td>
              <td><strong>Data:</strong> {new Date().toLocaleDateString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="print-section">
        <h3>1. RESUMO EXECUTIVO</h3>
        <table className="print-data-table">
          <thead>
            <tr>
              <th>Unidades de Ensino</th>
              <th>Total de Turmas</th>
              <th>Corpo Docente</th>
              <th>Aulas Lançadas (Global)</th>
              <th>Garantia de SDs</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{textAlign: 'center'}}>{totalEscolas}</td>
              <td style={{textAlign: 'center'}}>{totalTurmas}</td>
              <td style={{textAlign: 'center'}}>{totalProfessores}</td>
              <td style={{textAlign: 'center'}}>{totalAulasDadas}</td>
              <td style={{textAlign: 'center'}}>{percentGarantido}% Entregues</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="print-section">
        <h3>2. DESEMPENHO POR PROFESSOR (Visão Geral)</h3>
        <table className="print-data-table">
          <thead>
            <tr>
              <th>Professor</th>
              <th>Assiduidade SD</th>
              <th>Taxa SD</th>
              <th>Carga Horária Dadas/Prevista</th>
              <th>Progresso Curricular</th>
            </tr>
          </thead>
          <tbody>
            {desempenhoProfs.sort((a,b) => b.execPct - a.execPct).map(prof => (
              <tr key={prof.id}>
                <td>{prof.nome}</td>
                <td style={{textAlign: 'center'}}>{prof.entreguesSD} / {prof.totalVincSD}</td>
                <td style={{textAlign: 'center'}}>{prof.taxaSD}%</td>
                <td style={{textAlign: 'center'}}>{prof.aulasDadas} / {prof.cargaPlanejada}h</td>
                <td style={{textAlign: 'center'}}>{prof.execPct}%</td>
              </tr>
            ))}
            {desempenhoProfs.length === 0 && <tr><td colSpan="5">Nenhum professor cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="print-section">
        <h3>3. DETALHAMENTO DE AULAS</h3>
        {filtroProfId || filtroEscolaId || filtroTurmaId ? (
          <p className="print-filter-text">
            <strong>Filtros aplicados:</strong> 
            {filtroProfId && ` Professor: ${professores.find(p=>p.id===filtroProfId)?.nome} |`}
            {filtroEscolaId && ` Escola: ${escolas.find(e=>e.id===filtroEscolaId)?.nome} |`}
            {filtroTurmaId && ` Turma: ${turmas.find(t=>t.id===filtroTurmaId)?.nome}`}
          </p>
        ) : (
          <p className="print-filter-text">Visão Geral (Todos os registros)</p>
        )}
        <table className="print-data-table">
          <thead>
            <tr>
              <th>Professor</th>
              <th>Escola / Turma</th>
              <th>Disciplina</th>
              <th>CH</th>
              <th>Dadas</th>
              <th>Restam</th>
              <th>Datas</th>
            </tr>
          </thead>
          <tbody>
            {dadosRelatorioAulas.map((row, i) => (
              <tr key={`print-row-${i}`}>
                <td><strong>{row.profNome}</strong></td>
                <td>
                  <div>{row.escolaNome}</div>
                  <div style={{fontSize: '0.8rem', color: '#555'}}>{row.turmaNome}</div>
                </td>
                <td>{row.disciplina}</td>
                <td style={{textAlign: 'center'}}>{row.cargaPrevista}h</td>
                <td style={{textAlign: 'center'}}>{row.aulasDadas}</td>
                <td style={{textAlign: 'center'}}>{row.restam}</td>
                <td style={{fontSize: '0.8rem'}}>{row.datas.join(', ') || '-'}</td>
              </tr>
            ))}
            {dadosRelatorioAulas.length === 0 && (
              <tr><td colSpan="7" style={{textAlign: 'center'}}>Nenhum dado encontrado com os filtros atuais.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="print-footer">
        <p>Documento gerado pelo sistema Espacinho de Controle Pedagógico</p>
      </div>
    </div>
    </>
  );
};

export default Relatorios;
