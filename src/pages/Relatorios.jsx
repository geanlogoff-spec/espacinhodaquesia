import React, { useContext } from 'react';
import Card from '../components/Card';
import { AppContext } from '../context/AppContext';
import { BarChart2, TrendingUp, Users, CheckCircle, Clock, Printer, Activity } from 'lucide-react';
import './Relatorios.css';

const Relatorios = () => {
  const { professores, entregas, perfil } = useContext(AppContext);

  // 1. Matemáticas KPI:
  const totalProfessores = professores.length;
  const totalSequencias = entregas.length;
  
  // Taxa Global de Entregas
  const amostraGeral = totalSequencias * totalProfessores;
  let amostraEntregue = 0;
  
  entregas.forEach(ent => {
      Object.values(ent.statusProfessores).forEach(status => {
           if(status === 'entregue') amostraEntregue++;
      });
  });
  
  const taxaGlobal = amostraGeral === 0 ? 0 : Math.round((amostraEntregue / amostraGeral) * 100);

  // 2. Ranking de Performance de Seq
  const performanceProfs = professores.map(prof => {
      let entregou = 0;
      entregas.forEach(ent => {
          if (ent.statusProfessores[prof.id] === 'entregue') {
              entregou++;
          }
      });
      const pct = totalSequencias === 0 ? 0 : Math.round((entregou / totalSequencias) * 100);
      return { ...prof, entregues: entregou, taxa: pct };
  }).sort((a,b) => b.taxa - a.taxa);

  // 3. Carga Horária Executada
  const cargaProfs = professores.map(prof => {
      const execPct = prof.cargaAnual === 0 ? 0 : Math.round((prof.aulasDadas / prof.cargaAnual) * 100);
      return { ...prof, execPct };
  }).sort((a,b) => b.execPct - a.execPct);

  // Helper color bars
  const getProgressColor = (pct) => {
     if(pct >= 80) return 'fill-success';
     if(pct >= 50) return 'fill-warning';
     return 'fill-danger';
  };

  const handlePrint = () => {
      window.print();
  };

  return (
    <div className="report-container animate-fade-in stagger-1">
      {/* Cabeçalho exclusivo para Papel A4 (Invisível na Tela) */}
      <div className="print-only-header">
         <h2>{perfil.tituloDaPlataforma} {perfil.cargo} {perfil.nome}</h2>
         <h3>Relatório Gerencial de Desempenho Docente</h3>
         <p>Data de emissão: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Header & Print Actions */}
      <div className="report-header">
         <div className="seq-header-title" style={{marginBottom: 0}}>
            <div className="summary-icon" style={{width: 50, height: 50, backgroundColor: '#fdf2f2', color: '#e54d60'}}>
               <BarChart2 size={20} />
            </div>
            <h2 className="text-title">Estatísticas do App</h2>
         </div>
         <button className="btn btn-outline" onClick={handlePrint} style={{borderColor: 'var(--primary-purple)', color: 'var(--primary-purple)'}}>
            <Printer size={18}/> Imprimir Relatório
         </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid stagger-2">
         <div className="kpi-card">
            <div className="kpi-icon-wrapper pink">
               <Users size={28}/>
            </div>
            <div className="kpi-info">
               <span className="kpi-title">Educadores</span>
               <span className="kpi-value">{totalProfessores}</span>
            </div>
         </div>
         <div className="kpi-card">
            <div className="kpi-icon-wrapper purple">
               <Activity size={28}/>
            </div>
            <div className="kpi-info">
               <span className="kpi-title">Recolhimentos Cadastrados</span>
               <span className="kpi-value">{totalSequencias}</span>
            </div>
         </div>
         <div className="kpi-card">
            <div className="kpi-icon-wrapper blue">
               <CheckCircle size={28}/>
            </div>
            <div className="kpi-info">
               <span className="kpi-title">Taxa Média de Sucesso</span>
               <span className="kpi-value">{taxaGlobal}%</span>
            </div>
         </div>
      </div>

      {/* Main Graphics Grid */}
      <div className="report-grid-2 stagger-3">
        {/* Gráfico 1: Performance em Prazos */}
        <Card title="Entregas de Sequências" className="report-panel" subtitle="Pontualidade no repasse do planejamento">
           <div className="ranking-list">
             {performanceProfs.map(prof => (
                <div className="ranking-item" key={prof.id}>
                   <div className="rank-item-header">
                      <div className="rank-prof-name">{prof.nome} <span className="rank-prof-meta">({prof.materia})</span></div>
                      <div className="rank-prof-score" style={{color: getProgressColor(prof.taxa).includes('success') ? 'var(--success-green)' : 'inherit'}}>{prof.taxa}%</div>
                   </div>
                   <div className="progress-track" title={`${prof.entregues} de ${totalSequencias} entregues`}>
                      <div className={`progress-fill ${getProgressColor(prof.taxa)}`} style={{width: `${prof.taxa}%`}}></div>
                   </div>
                </div>
             ))}
             {totalSequencias === 0 && <p style={{color: 'var(--text-light)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem'}}>Crie sequências de evento na aba Sequências para este gráfico gerar visuais.</p>}
           </div>
        </Card>
        
        {/* Gráfico 2: Carga Horária Executada */}
        <Card title="Carga Horária Progressão" className="report-panel" subtitle="Avanço da carga letiva global (Dadas / Anual)">
           <div className="ranking-list">
             {cargaProfs.map(prof => (
                <div className="ranking-item" key={prof.id}>
                   <div className="rank-item-header">
                      <div className="rank-prof-name">{prof.nome} <span className="rank-prof-meta">({prof.aulasDadas}/{prof.cargaAnual}h)</span></div>
                      <div className="rank-prof-score">{prof.execPct}%</div>
                   </div>
                   <div className="progress-track" title={`${prof.aulasDadas} de ${prof.cargaAnual} finalizadas`}>
                      <div className="progress-fill" style={{width: `${prof.execPct}%`, background: 'linear-gradient(90deg, #c3b0f5, #9370db)'}}></div>
                   </div>
                </div>
             ))}
             {professores.length === 0 && <p style={{color: 'var(--text-light)', fontSize: '0.9rem', textAlign: 'center', marginTop: '2rem'}}>Sem professores cadastrados para montar o visual de carga.</p>}
           </div>
        </Card>
      </div>

    </div>
  );
};

export default Relatorios;
