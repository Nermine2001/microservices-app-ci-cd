import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import './App.css';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_URL = 'http://localhost:5000';

function App() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [showCharts, setShowCharts] = useState(false);

  // Charger les stats et l'historique au démarrage
  useEffect(() => {
    loadStats();
    loadHistory();
  }, []);

  const loadStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Erreur stats:', err);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/history?limit=10`);
      setHistory(response.data.data);
    } catch (err) {
      console.error('Erreur historique:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setError('Veuillez entrer du texte');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(`${API_URL}/api/analyze`, {
        text: text
      });

      setResult(response.data);
      setShowCharts(true);
      
      // Recharger les stats et l'historique
      loadStats();
      loadHistory();
      
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'analyse');
    } finally {
      setLoading(false);
    }
  };

  const getSentimentEmoji = (sentiment) => {
    switch (sentiment) {
      case 'positive': return '😊';
      case 'negative': return '😞';
      case 'neutral': return '😐';
      default: return '🤔';
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return '#10b981';
      case 'negative': return '#ef4444';
      case 'neutral': return '#6b7280';
      default: return '#9ca3af';
    }
  };

  // Données pour le graphique en camembert (Sentiment Distribution)
  const pieChartData = result ? {
    labels: ['Positif', 'Neutre', 'Négatif'],
    datasets: [{
      data: [
        result.sentiment.details.positive * 100,
        result.sentiment.details.neutral * 100,
        result.sentiment.details.negative * 100
      ],
      backgroundColor: ['#10b981', '#6b7280', '#ef4444'],
      borderColor: ['#fff', '#fff', '#fff'],
      borderWidth: 2
    }]
  } : null;

  // Données pour le graphique en barres (Émotions)
  const barChartData = result && result.emotions ? {
    labels: result.emotions.map(e => e.label.charAt(0).toUpperCase() + e.label.slice(1)),
    datasets: [{
      label: 'Score d\'émotion (%)',
      data: result.emotions.map(e => e.score * 100),
      backgroundColor: 'rgba(102, 126, 234, 0.6)',
      borderColor: 'rgba(102, 126, 234, 1)',
      borderWidth: 2
    }]
  } : null;

  // Données pour le graphique en ligne (Historique)
  const lineChartData = history.length > 0 ? {
    labels: history.map((_, idx) => `Analyse ${history.length - idx}`).reverse(),
    datasets: [{
      label: 'Score de Sentiment',
      data: history.map(h => {
        const compound = h.sentiment?.compound || 0;
        return (compound + 1) * 50; // Convertir de [-1, 1] à [0, 100]
      }).reverse(),
      fill: true,
      backgroundColor: 'rgba(102, 126, 234, 0.1)',
      borderColor: 'rgba(102, 126, 234, 1)',
      borderWidth: 2,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6
    }]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      }
    }
  };

  return (
    <div className="App">
      <header>
        <h1>🤖 Analyseur de Sentiment avec IA</h1>
        <p>Analyse le sentiment et les émotions de votre texte avec visualisations graphiques</p>
      </header>

      <main>
        {/* Statistiques Globales */}
        {stats && stats.totalAnalyses > 0 && (
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-value">{stats.totalAnalyses}</div>
                <div className="stat-label">Analyses totales</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">😊</div>
              <div className="stat-content">
                <div className="stat-value">{stats.sentimentDistribution.positive || 0}</div>
                <div className="stat-label">Positif</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">😞</div>
              <div className="stat-content">
                <div className="stat-value">{stats.sentimentDistribution.negative || 0}</div>
                <div className="stat-label">Négatif</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">😐</div>
              <div className="stat-content">
                <div className="stat-value">{stats.sentimentDistribution.neutral || 0}</div>
                <div className="stat-label">Neutre</div>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire d'analyse */}
        <div className="analysis-section">
          <form onSubmit={handleSubmit}>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Entrez votre texte ici... (ex: J'adore cette application, elle est incroyable!)"
              rows="6"
              disabled={loading}
            />
            
            <button type="submit" disabled={loading || !text.trim()}>
              {loading ? '⏳ Analyse en cours...' : '🔍 Analyser'}
            </button>
          </form>

          {error && (
            <div className="error">
              ❌ {error}
            </div>
          )}

          {/* Résultats de l'analyse */}
          {result && (
            <div className="result">
              <h2>📊 Résultats de l'analyse</h2>
              
              {/* Sentiment principal */}
              <div 
                className="sentiment-card"
                style={{ borderColor: getSentimentColor(result.sentiment.label) }}
              >
                <div className="sentiment-header">
                  <span className="sentiment-emoji">
                    {getSentimentEmoji(result.sentiment.label)}
                  </span>
                  <h3 style={{ color: getSentimentColor(result.sentiment.label) }}>
                    Sentiment : {result.sentiment.label.toUpperCase()}
                  </h3>
                </div>
                
                <div className="confidence">
                  <div className="confidence-label">
                    Confiance: {(result.sentiment.score * 100).toFixed(1)}%
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${result.sentiment.score * 100}%`,
                        backgroundColor: getSentimentColor(result.sentiment.label)
                      }}
                    />
                  </div>
                </div>

                <div className="sentiment-details">
                  <div className="detail-item">
                    <span>Positif:</span>
                    <strong>{(result.sentiment.details.positive * 100).toFixed(1)}%</strong>
                  </div>
                  <div className="detail-item">
                    <span>Neutre:</span>
                    <strong>{(result.sentiment.details.neutral * 100).toFixed(1)}%</strong>
                  </div>
                  <div className="detail-item">
                    <span>Négatif:</span>
                    <strong>{(result.sentiment.details.negative * 100).toFixed(1)}%</strong>
                  </div>
                </div>
              </div>

              {/* Section Graphiques */}
              {showCharts && (
                <div className="charts-section">
                  <h3>📈 Visualisations Graphiques</h3>
                  
                  <div className="charts-grid">
                    {/* Graphique Camembert - Distribution des sentiments */}
                    <div className="chart-container">
                      <h4>🥧 Distribution des Sentiments</h4>
                      <div className="chart-wrapper">
                        {pieChartData && <Pie data={pieChartData} options={chartOptions} />}
                      </div>
                    </div>

                    {/* Graphique Barres - Émotions */}
                    {result.emotions && result.emotions.length > 0 && (
                      <div className="chart-container">
                        <h4>📊 Émotions Détectées</h4>
                        <div className="chart-wrapper">
                          {barChartData && <Bar data={barChartData} options={chartOptions} />}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Graphique Ligne - Historique */}
                  {history.length > 0 && (
                    <div className="chart-container chart-full">
                      <h4>📉 Évolution de vos Analyses</h4>
                      <div className="chart-wrapper-large">
                        {lineChartData && <Line data={lineChartData} options={chartOptions} />}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Émotions en liste */}
              {result.emotions && result.emotions.length > 0 && (
                <div className="emotions-section">
                  <h3>🎭 Émotions détectées</h3>
                  <div className="emotions-grid">
                    {result.emotions.map((emotion, idx) => (
                      <div key={idx} className="emotion-card">
                        <div className="emotion-label">{emotion.label}</div>
                        <div className="emotion-score">
                          {(emotion.score * 100).toFixed(1)}%
                        </div>
                        <div className="emotion-bar">
                          <div 
                            className="emotion-fill"
                            style={{ width: `${emotion.score * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Métadonnées */}
              <div className="metadata">
                <small>
                  📝 Longueur: {result.metadata.text_length} caractères | 
                  🤖 Modèle: {result.metadata.model} | 
                  ⏰ {new Date(result.timestamp).toLocaleString('fr-FR')}
                </small>
              </div>
            </div>
          )}
        </div>

        {/* Historique récent */}
        {history.length > 0 && (
          <div className="history-section">
            <h2>📜 Historique récent</h2>
            <div className="history-list">
              {history.map((item) => (
                <div key={item.id} className="history-item">
                  <span className="history-emoji">
                    {getSentimentEmoji(item.sentiment?.label)}
                  </span>
                  <div className="history-content">
                    <div className="history-text">
                      {item.text.substring(0, 80)}
                      {item.text.length > 80 ? '...' : ''}
                    </div>
                    <div className="history-meta">
                      <span 
                        className="history-sentiment"
                        style={{ color: getSentimentColor(item.sentiment?.label) }}
                      >
                        {item.sentiment?.label}
                      </span>
                      <span className="history-score">
                        Score: {(item.sentiment?.score * 100).toFixed(0)}%
                      </span>
                      <span className="history-time">
                        {new Date(item.timestamp).toLocaleTimeString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer>
        <p>Microservices Architecture | CI/CD Pipeline | Docker | Jenkins | Chart.js</p>
      </footer>
    </div>
  );
}

export default App;