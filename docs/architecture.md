# 🏗️ Architecture Technique Détaillée

Documentation complète de l'architecture de l'application microservices avec IA et CI/CD.

---

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture des microservices](#architecture-des-microservices)
3. [Technologies utilisées](#technologies-utilisées)
4. [Pipeline CI/CD](#pipeline-cicd)
5. [Sécurité](#sécurité)
6. [Performance et scalabilité](#performance-et-scalabilité)
7. [Monitoring et logs](#monitoring-et-logs)

---

## 🎯 Vue d'ensemble

### Objectif du Projet

Créer une application d'analyse de sentiment basée sur l'IA avec une architecture microservices moderne, incluant:
- Conteneurisation Docker
- Pipeline CI/CD automatisé
- Tests automatisés
- Déploiement continu

### Principes Architecturaux

- **Séparation des responsabilités**: Chaque microservice a un rôle unique
- **Indépendance**: Les services peuvent être déployés indépendamment
- **Scalabilité**: Chaque service peut être scalé horizontalement
- **Résilience**: Failure isolation entre les services
- **Observabilité**: Logs centralisés et health checks

---

## 🔧 Architecture des Microservices

### Diagramme d'Architecture

```
                        Internet/Users
                              │
                              ▼
                    ┌─────────────────┐
                    │   Load Balancer │
                    │   (Nginx/HAProxy)│
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │                  │
         ┌──────────▼────────┐  ┌─────▼────────┐
         │   Frontend         │  │   Jenkins    │
         │   React + Nginx    │  │   CI/CD      │
         │   Port: 3000       │  │   Port: 8080 │
         └──────────┬─────────┘  └──────────────┘
                    │
         ┌──────────▼─────────┐
         │   Backend API      │
         │   Node.js/Express  │
         │   Port: 5000       │
         └──────────┬─────────┘
                    │
         ┌──────────▼─────────┐
         │   AI Service       │
         │   Python + ML      │
         │   Port: 8000       │
         └────────────────────┘
```

### Communication entre Services

```
Frontend  ──HTTP──▶  Backend API  ──HTTP──▶  AI Service
          ◀────────           ◀────────

Format: JSON
Protocol: REST API
Timeout: 30s
Retry: 3 attempts
```

---

## 🎨 Microservice 1: Frontend

### Technologies
- **Framework**: React 18
- **Build Tool**: Create React App
- **HTTP Client**: Axios
- **Web Server**: Nginx
- **Styling**: CSS3 avec gradients

### Responsabilités
- Interface utilisateur
- Formulaire d'analyse
- Affichage des résultats
- Visualisation des statistiques
- Historique des analyses

### Structure des Fichiers
```
frontend/
├── Dockerfile
├── nginx.conf
├── package.json
├── public/
│   └── index.html
└── src/
    ├── App.jsx          # Composant principal
    ├── App.css          # Styles
    └── index.js         # Point d'entrée
```

### API Endpoints Utilisés
```javascript
GET  /health                  # Health check
POST /api/analyze            # Analyser un texte
POST /api/batch-analyze      # Analyser plusieurs textes
GET  /api/history            # Récupérer l'historique
GET  /api/stats              # Récupérer les statistiques
```

### Gestion d'État
```javascript
- text: String              # Texte à analyser
- result: Object           # Résultat de l'analyse
- loading: Boolean         # État de chargement
- error: String|null       # Messages d'erreur
- history: Array           # Historique des analyses
- stats: Object            # Statistiques globales
```

### Build Process
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
COPY package*.json ./
RUN npm ci
COPY src/ ./src/
RUN npm run build

# Stage 2: Production
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

---

## ⚙️ Microservice 2: Backend API

### Technologies
- **Runtime**: Node.js 20
- **Framework**: Express.js
- **HTTP Client**: Axios
- **Logging**: Morgan

### Responsabilités
- Orchestration des requêtes
- Gestion de l'historique (en mémoire)
- Calcul des statistiques
- Proxy vers le service IA
- Gestion des erreurs

### Structure des Fichiers
```
backend-api/
├── Dockerfile
├── package.json
└── src/
    └── server.js        # Serveur Express
```

### Endpoints API

#### POST /api/analyze
```javascript
Request:
{
  "text": "Texte à analyser",
  "userId": "optional-user-id"
}

Response:
{
  "id": "1234567890",
  "timestamp": "2025-10-07T10:30:00Z",
  "userId": "user-123",
  "text": "...",
  "sentiment": {
    "label": "positive",
    "score": 0.95,
    "compound": 0.8,
    "details": {...}
  },
  "emotions": [...]
}
```

#### GET /api/history
```javascript
Query Parameters:
- limit: Number (default: 20)

Response:
{
  "total": 150,
  "limit": 20,
  "data": [...]
}
```

#### GET /api/stats
```javascript
Response:
{
  "totalAnalyses": 150,
  "sentimentDistribution": {
    "positive": 80,
    "negative": 40,
    "neutral": 30
  },
  "averageConfidence": 0.85
}
```

### Gestion des Erreurs
```javascript
// Timeout handling
timeout: 30000  // 30 secondes

// Retry logic
maxRetries: 3
retryDelay: 1000  // 1 seconde

// Error codes
400: Bad Request
503: Service Unavailable (AI Service down)
500: Internal Server Error
```

---

## 🤖 Microservice 3: AI Service

### Technologies
- **Language**: Python 3.11
- **Framework**: Flask
- **ML Libraries**:
  - NLTK (VADER) - Sentiment Analysis
  - Transformers (HuggingFace) - Emotion Detection
  - PyTorch - Deep Learning Backend
- **Server**: Gunicorn

### Responsabilités
- Analyse de sentiment (positif/négatif/neutre)
- Détection d'émotions (joie, tristesse, colère, etc.)
- Traitement du langage naturel
- Scoring de confiance

### Modèles Utilisés

#### VADER (Valence Aware Dictionary and sEntiment Reasoner)
```python
Model: NLTK VADER Lexicon
Type: Rule-based
Speed: Very Fast (~0.01s per text)
Accuracy: 80-85%
Language: English (primarily)

Scores:
- positive: 0.0 to 1.0
- neutral: 0.0 to 1.0
- negative: 0.0 to 1.0
- compound: -1.0 to +1.0
```

#### DistilRoBERTa (Emotion Classification)
```python
Model: j-hartmann/emotion-english-distilroberta-base
Type: Transformer (BERT-based)
Speed: Medium (~0.5s per text)
Accuracy: 90-95%
Emotions: joy, sadness, anger, fear, surprise, disgust, neutral

Max Input: 512 tokens
Output: Probability distribution over emotions
```

### Structure des Fichiers
```
ai-service/
├── Dockerfile
├── requirements.txt
└── src/
    └── app.py           # Application Flask
```

### Endpoints API

#### POST /analyze
```python
Request:
{
  "text": "Your text here"
}

Response:
{
  "text": "Your text here",
  "sentiment": {
    "label": "positive",
    "score": 0.95,
    "compound": 0.8642,
    "details": {
      "positive": 0.75,
      "neutral": 0.20,
      "negative": 0.05
    }
  },
  "emotions": [
    {"label": "joy", "score": 0.92},
    {"label": "surprise", "score": 0.05},
    ...
  ],
  "metadata": {
    "text_length": 50,
    "model": "VADER + DistilRoBERTa"
  }
}
```

#### POST /batch-analyze
```python
Request:
{
  "texts": ["text1", "text2", ...]
}

Response:
{
  "results": [
    {"index": 0, "text": "...", "sentiment": "positive", ...},
    ...
  ],
  "total": 10
}
```

### Performance Optimization
```python
# Model loading
- Models loaded once at startup
- Kept in memory for fast inference

# Batch processing
- Up to 50 texts per request
- Parallel processing for batch

# Caching
- Results cached for 1 hour
- Cache key: hash(text)
```

---

## 🔄 Pipeline CI/CD

### Architecture Jenkins

```
GitHub Push
     │
     ▼
GitHub Webhook
     │
     ▼
Jenkins Trigger
     │
     ├─▶ Checkout Code
     │
     ├─▶ Build (Parallel)
     │   ├─ AI Service
     │   ├─ Backend API
     │   └─ Frontend
     │
     ├─▶ Test (Parallel)
     │   ├─ Unit Tests
     │   ├─ Integration Tests
     │   └─ Lint
     │
     ├─▶ Security Scan
     │   └─ Trivy (optional)
     │
     ├─▶ Push to Registry
     │   └─ Docker Hub/Local
     │
     ├─▶ Deploy
     │   └─ Docker Compose
     │
     └─▶ Health Check
         └─ Verify Services
```

### Étapes du Pipeline

#### 1. Checkout
```groovy
stage('Checkout') {
  steps {
    checkout scm
    sh 'git rev-parse --short HEAD > .git/commit-id'
  }
}
```

#### 2. Build (Parallel)
```groovy
stage('Build Images') {
  parallel {
    stage('AI Service') { ... }
    stage('Backend API') { ... }
    stage('Frontend') { ... }
  }
}
```

#### 3. Test
```groovy
stage('Test') {
  steps {
    sh 'jenkins/scripts/test.sh'
  }
}
```

#### 4. Deploy
```groovy
stage('Deploy') {
  when { branch 'main' }
  steps {
    sh 'jenkins/scripts/deploy.sh'
  }
}
```

### Temps d'Exécution Typiques
```
Checkout:        10-30s
Build:           5-10 min
Test:            1-2 min
Security Scan:   2-5 min
Deploy:          1-2 min
Health Check:    30s

Total:           10-20 min
```

---

## 🔒 Sécurité

### Mesures Implémentées

#### 1. Conteneurs
```dockerfile
# Non-root user
USER node  # ou www-data

# Read-only filesystem
read_only: true

# No privileged mode
privileged: false
```

#### 2. Réseau
```yaml
# Network isolation
networks:
  - app-network  # Internal only

# Port exposure
ports:
  - "3000:3000"  # Frontend only
  - "127.0.0.1:5000:5000"  # Backend internal
```

#### 3. Headers de Sécurité
```nginx
# Nginx configuration
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
```

#### 4. Input Validation
```javascript
// Backend validation
- Max text length: 5000 characters
- Required fields check
- SQL injection prevention
- XSS protection
```

#### 5. CORS Policy
```javascript
cors({
  origin: ['http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
})
```

---

## 📈 Performance et Scalabilité

### Métriques de Performance

#### Temps de Réponse
```
Frontend Load:     < 2s
API Response:      < 100ms
AI Analysis:       < 2s
Total Round-trip:  < 3s
```

#### Throughput
```
AI Service:        ~20 requests/second
Backend API:       ~100 requests/second
Frontend:          ~500 concurrent users
```

### Stratégies de Scalabilité

#### Horizontal Scaling
```yaml
# Docker Compose
services:
  ai-service:
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 2G
```

#### Load Balancing
```nginx
upstream ai_backend {
  server ai-service-1:8000;
  server ai-service-2:8000;
  server ai-service-3:8000;
}
```

#### Caching
```javascript
// Response caching
Cache-Control: public, max-age=3600

// Redis (future enhancement)
cache.set(hash(text), result, 3600)
```

---

## 📊 Monitoring et Logs

### Health Checks

#### Frontend
```bash
GET /
Status: 200 OK
Content-Type: text/html
```

#### Backend API
```bash
GET /health
Response:
{
  "status": "healthy",
  "service": "backend-api",
  "timestamp": "2025-10-07T10:30:00Z"
}
```

#### AI Service
```bash
GET /health
Response:
{
  "status": "healthy",
  "service": "ai-service",
  "model_loaded": true
}
```

### Logging Strategy

#### Log Levels
```
ERROR:   Critical failures
WARN:    Potential issues
INFO:    Important events
DEBUG:   Detailed information
```

#### Log Format
```json
{
  "timestamp": "2025-10-07T10:30:00Z",
  "level": "INFO",
  "service": "backend-api",
  "message": "Analyse completed",
  "duration": "1.5s",
  "status": "success"
}
```

#### Log Aggregation
```bash
# Docker logs
docker-compose logs -f

# Centralized (future)
- ELK Stack (Elasticsearch, Logstash, Kibana)
- Grafana Loki
- Splunk
```

---

## 🚀 Évolutions Futures

### Phase 2
- [ ] Kubernetes deployment
- [ ] Database persistence (PostgreSQL/MongoDB)
- [ ] Redis caching
- [ ] User authentication (JWT)
- [ ] Rate limiting

### Phase 3
- [ ] Prometheus + Grafana monitoring
- [ ] Distributed tracing (Jaeger)
- [ ] Message queue (RabbitMQ/Kafka)
- [ ] Multi-language support
- [ ] Advanced ML models

### Phase 4
- [ ] Microservices mesh (Istio)
- [ ] Auto-scaling (HPA)
- [ ] Disaster recovery
- [ ] Multi-region deployment
- [ ] A/B testing framework

---

## 📚 Références

### Documentation
- Docker: https://docs.docker.com
- Kubernetes: https://kubernetes.io/docs
- Jenkins: https://www.jenkins.io/doc
- React: https://react.dev
- Flask: https://flask.palletsprojects.com

### Modèles ML
- VADER: https://github.com/cjhutto/vaderSentiment
- HuggingFace: https://huggingface.co/j-hartmann/emotion-english-distilroberta-base

---

**Dernière mise à jour**: 7 Octobre 2025