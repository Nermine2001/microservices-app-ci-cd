# 🤖 Analyseur de Sentiment - Architecture Microservices avec CI/CD

Application complète d'analyse de sentiment basée sur l'IA avec 3 microservices, Docker, et pipeline CI/CD Jenkins.

## 📋 Table des matières

- [Architecture](#architecture)
- [Technologies](#technologies)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [Pipeline CI/CD](#pipeline-cicd)
- [Tests](#tests)
- [Déploiement](#déploiement)
- [API Documentation](#api-documentation)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Client Browser                      │
└───────────────────────────┬─────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   Frontend     │
                    │  (React + Nginx)│
                    │   Port: 3000   │
                    └───────┬────────┘
                            │
                    ┌───────▼────────┐
                    │  Backend API   │
                    │  (Node.js)     │
                    │   Port: 5000   │
                    └───────┬────────┘
                            │
                    ┌───────▼────────┐
                    │  AI Service    │
                    │  (Python+ML)   │
                    │   Port: 8000   │
                    └────────────────┘
```

### Microservices

1. **Frontend** (React)
   - Interface utilisateur moderne et responsive
   - Visualisation des résultats d'analyse
   - Historique et statistiques

2. **Backend API** (Node.js + Express)
   - Orchestration des requêtes
   - Gestion de l'historique
   - Calcul des statistiques

3. **AI Service** (Python + ML)
   - Analyse de sentiment (VADER)
   - Détection d'émotions (DistilRoBERTa)
   - Traitement du langage naturel

---

## 🛠️ Technologies

### Infrastructure
- **VirtualBox** + Extension Pack
- **Vagrant** - Provisioning automatique
- **Ubuntu 24.04 LTS**

### Conteneurisation
- **Docker** - Containerisation
- **Docker Compose** - Orchestration locale

### CI/CD
- **Git** + **GitHub** - Gestion de version
- **Jenkins** - Automatisation CI/CD

### Frontend
- React 18
- Axios
- Nginx

### Backend
- Node.js 20
- Express.js
- Axios

### AI/ML
- Python 3.11
- Flask
- NLTK (VADER)
- Transformers (HuggingFace)
- PyTorch

---

## 📦 Prérequis

### Sur votre machine hôte

1. **VirtualBox** (≥ 7.0)
   ```bash
   https://www.virtualbox.org/wiki/Downloads
   ```

2. **VirtualBox Extension Pack**
   ```bash
   https://www.virtualbox.org/wiki/Downloads
   ```

3. **Vagrant** (≥ 2.4)
   ```bash
   https://www.vagrantup.com/downloads
   ```

4. **Git**
   ```bash
   https://git-scm.com/downloads
   ```

### Configuration minimale
- RAM: 8 GB (4 GB pour la VM)
- Disque: 20 GB libres
- CPU: 2 cœurs minimum

---

## 🚀 Installation

### Étape 1: Cloner le projet

```bash
# Cloner le repository
git clone https://github.com/votre-username/mini-app-microservices.git
cd mini-app-microservices
```

### Étape 2: Créer la structure des dossiers

```bash
# Créer la structure
mkdir -p frontend/src frontend/public
mkdir -p backend-api/src
mkdir -p ai-service/src
mkdir -p jenkins/scripts
mkdir -p docs
```

### Étape 3: Copier les fichiers

Copiez tous les fichiers fournis dans les artifacts dans leurs dossiers respectifs :

```
mini-app-microservices/
├── Vagrantfile
├── docker-compose.yml
├── .gitignore
├── README.md
├── frontend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── nginx.conf
│   └── src/
│       ├── App.jsx
│       └── App.css
├── backend-api/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   └── src/
│       └── server.js
├── ai-service/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── requirements.txt
│   └── src/
│       └── app.py
└── jenkins/
    ├── Jenkinsfile
    └── scripts/
        ├── build.sh
        ├── deploy.sh
        └── test.sh
```

### Étape 4: Démarrer la VM

```bash
# Démarrer Vagrant (10-15 minutes)
vagrant up

# Se connecter à la VM
vagrant ssh
```

### Étape 5: Vérifier l'installation

```bash
# Dans la VM, vérifier Docker
docker --version
docker-compose --version

# Vérifier Jenkins
sudo systemctl status jenkins

# Récupérer le mot de passe initial Jenkins
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

---

## 💻 Utilisation

### Démarrage rapide

```bash

# Démarrer tous les services
docker-compose up -d

# Vérifier les logs
docker-compose logs -f

# Vérifier l'état
docker-compose ps
```

### Accès aux services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://192.168.56.10:3000 | Interface utilisateur |
| Backend API | http://192.168.56.10:5000 | API REST |
| AI Service | http://192.168.56.10:8000 | Service ML |
| Jenkins | http://192.168.56.10:8080 | CI/CD Pipeline |

### Arrêt des services

```bash
# Arrêter les services
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

---

## 🔄 Pipeline CI/CD

### Configuration Jenkins

1. **Accéder à Jenkins**: http://192.168.56.10:8080

2. **Premier démarrage**:
   - Entrer le mot de passe initial
   - Installer les plugins suggérés
   - Créer un utilisateur admin

3. **Plugins requis**:
   - Docker Pipeline
   - Git
   - GitHub Integration
   - Pipeline

4. **Créer un nouveau pipeline**:
   - New Item → Pipeline
   - Configuration → Pipeline
   - Definition: Pipeline script from SCM
   - SCM: Git
   - Repository URL: votre repository
   - Script Path: jenkins/Jenkinsfile

### Déclenchement du pipeline

```bash
# Push vers GitHub
git add .
git commit -m "Update code"
git push origin main

# Jenkins détectera automatiquement le push et lancera le pipeline
```

### Étapes du pipeline

1. **Checkout** - Récupération du code
2. **Build** - Construction des images Docker
3. **Test** - Tests unitaires et d'intégration
4. **Security Scan** - Analyse de sécurité
5. **Push** - Push vers le registry
6. **Deploy** - Déploiement automatique
7. **Health Check** - Vérification de santé

---

## 🧪 Tests

### Tests manuels

```bash
# Tests Backend API
curl http://localhost:5000/health
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "This is amazing!"}'

# Tests AI Service
curl http://localhost:8000/health
curl -X POST http://localhost:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text": "I love this application!"}'
```

### Tests automatisés

```bash
# Exécuter tous les tests
cd jenkins/scripts
chmod +x test.sh
./test.sh
```

---

## 📚 API Documentation

### Backend API Endpoints

#### Health Check
```
GET /health
Response: {"status": "healthy", "service": "backend-api"}
```

#### Analyze Text
```
POST /api/analyze
Body: {
  "text": "Your text here",
  "userId": "optional-user-id"
}
Response: {
  "sentiment": {...},
  "emotions": [...],
  "metadata": {...}
}
```

#### Get History
```
GET /api/history?limit=20
Response: {
  "total": 100,
  "data": [...]
}
```

#### Get Statistics
```
GET /api/stats
Response: {
  "totalAnalyses": 150,
  "sentimentDistribution": {...}
}
```

### AI Service Endpoints

#### Analyze Sentiment
```
POST /analyze
Body: {"text": "Your text"}
Response: {
  "sentiment": {
    "label": "positive",
    "score": 0.95,
    "details": {...}
  },
  "emotions": [...]
}
```

#### Batch Analyze
```
POST /batch-analyze
Body: {"texts": ["text1", "text2"]}
Response: {"results": [...]}
```

---

## 🔧 Commandes utiles

### Docker

```bash
# Voir les conteneurs en cours
docker ps

# Voir les logs d'un service
docker logs ai-service -f

# Entrer dans un conteneur
docker exec -it ai-service bash

# Nettoyer les images inutilisées
docker image prune -a
```

### Vagrant

```bash
# Statut de la VM
vagrant status

# Redémarrer la VM
vagrant reload

# Arrêter la VM
vagrant halt

# Supprimer la VM
vagrant destroy
```

---

## 🐛 Dépannage

### Problème: Services ne démarrent pas

```bash
# Vérifier les logs
docker-compose logs

# Redémarrer les services
docker-compose restart

# Rebuild complet
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Problème: Port déjà utilisé

```bash
# Trouver le processus utilisant le port
sudo lsof -i :8080

# Tuer le processus
sudo kill -9 <PID>
```

### Problème: Jenkins ne démarre pas

```bash
# Vérifier le statut
sudo systemctl status jenkins

# Redémarrer Jenkins
sudo systemctl restart jenkins

# Voir les logs
sudo journalctl -u jenkins -f
```

---

## 📝 Licence

MIT License

---

## 👥 Contributeurs

Chennaoui Nermine

---

## 📞 Support

Pour toute question ou problème:
- Ouvrir une issue sur GitHub
- Contact: nermine.3007@gmail.com