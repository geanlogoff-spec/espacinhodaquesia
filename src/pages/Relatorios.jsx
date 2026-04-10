import React, { useContext } from 'react';
import Card from '../components/Card';
import { useAppStore } from '../store/useAppStore';
import { BarChart3, TrendingUp, Users, CheckCircle, FileText, Printer, School, Library, Award } from 'lucide-react';
import './Relatorios.css';

const Relatorios = () => {
  const { escolas, turmas, professores, entregas, perfil } = useAppStore();

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

  return (
    <div className="report-container animate-fade-in stagger-1">
      {/* Cabeçalho de Impressão Oficial */}
      <div className="print-only-header">
         <div className="print-logo-circle"><Award size={34} /></div>
         <h2>Relatório Estatístico e Pedagógico</h2>
         <h3 style={{wordSpacing: '2px'}}>{perfil.tituloDaPlataforma.toUpperCase()}</h3>
         <hr/>
         <div className="print-meta-grid">
            <p><strong>Emissor:</strong> {perfil.cargo} {perfil.nome}</p>
            <p><strong>Data de Emissão:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Unidades na Rede:</strong> {totalEscolas}</p>
            <p><strong>Total de Turmas:</strong> {totalTurmas}</p>
         </div>
      </div>

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
    </div>
  );
};

export default Relatorios;
