const express = require('express');
const cors = require('cors');
const axios = require('axios');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://ai-service:8000';

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Store pour l'historique (en production, utiliser une vraie DB)
const analysisHistory = [];

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'backend-api',
    timestamp: new Date().toISOString()
  });
});

// Route principale: analyser un texte
app.post('/api/analyze', async (req, res) => {
  try {
    const { text, userId } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Le champ "text" est requis' });
    }

    console.log(`📝 Nouvelle demande d'analyse: ${text.substring(0, 50)}...`);

    // Appeler le service IA
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/analyze`, {
      text: text
    }, {
      timeout: 30000 // 30 secondes timeout
    });

    const result = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      userId: userId || 'anonymous',
      ...aiResponse.data
    };

    // Sauvegarder dans l'historique
    analysisHistory.unshift(result);
    if (analysisHistory.length > 100) {
      analysisHistory.pop(); // Garder seulement les 100 derniers
    }

    console.log(`✅ Analyse terminée: ${result.sentiment.label}`);
    
    res.json(result);

  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({
        error: 'Le service IA n\'est pas disponible',
        details: 'Veuillez réessayer plus tard'
      });
    }

    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data.error || 'Erreur du service IA'
      });
    }

    res.status(500).json({
      error: 'Erreur serveur',
      details: error.message
    });
  }
});

// Analyse en batch
app.post('/api/batch-analyze', async (req, res) => {
  try {
    const { texts } = req.body;

    if (!texts || !Array.isArray(texts)) {
      return res.status(400).json({ error: 'Le champ "texts" doit être un tableau' });
    }

    if (texts.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 textes par requête' });
    }

    console.log(`📝 Analyse batch de ${texts.length} textes`);

    const aiResponse = await axios.post(`${AI_SERVICE_URL}/batch-analyze`, {
      texts: texts
    }, {
      timeout: 60000
    });

    res.json({
      ...aiResponse.data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur batch analyse:', error.message);
    res.status(500).json({
      error: 'Erreur serveur',
      details: error.message
    });
  }
});

// Récupérer l'historique des analyses
app.get('/api/history', (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const history = analysisHistory.slice(0, limit);
  
  res.json({
    total: analysisHistory.length,
    limit: limit,
    data: history
  });
});

// Statistiques
app.get('/api/stats', (req, res) => {
  const totalAnalyses = analysisHistory.length;
  
  const sentimentCounts = analysisHistory.reduce((acc, item) => {
    const sentiment = item.sentiment?.label || 'unknown';
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {});

  const avgScore = analysisHistory.reduce((sum, item) => {
    return sum + (item.sentiment?.score || 0);
  }, 0) / (totalAnalyses || 1);

  res.json({
    totalAnalyses,
    sentimentDistribution: sentimentCounts,
    averageConfidence: parseFloat(avgScore.toFixed(4)),
    timestamp: new Date().toISOString()
  });
});

// Vérifier la connexion au service IA
app.get('/api/ai-status', async (req, res) => {
  try {
    const response = await axios.get(`${AI_SERVICE_URL}/health`, { timeout: 5000 });
    res.json({
      aiService: 'connected',
      details: response.data
    });
  } catch (error) {
    res.status(503).json({
      aiService: 'disconnected',
      error: error.message
    });
  }
});

// Route 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route non trouvée' });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('Erreur non gérée:', err);
  res.status(500).json({
    error: 'Erreur serveur interne',
    details: err.message
  });
});

// Démarrer le serveur
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend API en écoute sur le port ${PORT}`);
  console.log(`🤖 Service IA configuré sur: ${AI_SERVICE_URL}`);
});

// Gestion de l'arrêt propre
process.on('SIGTERM', () => {
  console.log('SIGTERM reçu. Arrêt du serveur...');
  process.exit(0);
});