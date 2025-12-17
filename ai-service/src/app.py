from flask import Flask, request, jsonify
from flask_cors import CORS
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from transformers import pipeline
import logging
import os

# Configuration logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Télécharger les données NLTK nécessaires
try:
    nltk.download('vader_lexicon', quiet=True)
    nltk.download('punkt', quiet=True)
except Exception as e:
    logger.error(f"Erreur téléchargement NLTK: {e}")

# Initialiser l'analyseur de sentiment VADER (rapide et efficace)
sia = SentimentIntensityAnalyzer()

# Initialiser le modèle de détection d'émotions (HuggingFace)
try:
    emotion_classifier = pipeline(
        "text-classification",
        model="j-hartmann/emotion-english-distilroberta-base",
        top_k=None
    )
    logger.info("✅ Modèle d'émotions chargé avec succès")
except Exception as e:
    logger.error(f"❌ Erreur chargement modèle: {e}")
    emotion_classifier = None


@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint pour vérifier si le service est actif"""
    return jsonify({
        'status': 'healthy',
        'service': 'ai-service',
        'model_loaded': emotion_classifier is not None
    }), 200


@app.route('/analyze', methods=['POST'])
def analyze_sentiment():
    """
    Analyse le sentiment et les émotions d'un texte
    
    Body JSON:
    {
        "text": "Le texte à analyser"
    }
    
    Retour:
    {
        "text": "...",
        "sentiment": {
            "label": "positive/negative/neutral",
            "score": 0.95,
            "compound": 0.8,
            "details": {...}
        },
        "emotions": [
            {"label": "joy", "score": 0.95},
            ...
        ]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'text' not in data:
            return jsonify({'error': 'Le champ "text" est requis'}), 400
        
        text = data['text'].strip()
        
        if not text:
            return jsonify({'error': 'Le texte ne peut pas être vide'}), 400
        
        if len(text) > 5000:
            return jsonify({'error': 'Le texte est trop long (max 5000 caractères)'}), 400
        
        logger.info(f"Analyse du texte: {text[:50]}...")
        
        # Analyse de sentiment avec VADER
        sentiment_scores = sia.polarity_scores(text)
        
        # Déterminer le label du sentiment
        compound = sentiment_scores['compound']
        if compound >= 0.05:
            sentiment_label = 'positive'
        elif compound <= -0.05:
            sentiment_label = 'negative'
        else:
            sentiment_label = 'neutral'
        
        # Analyse des émotions avec le modèle transformer
        emotions = []
        if emotion_classifier:
            try:
                emotion_results = emotion_classifier(text[:512])[0]  # Limiter à 512 tokens
                emotions = [
                    {'label': e['label'], 'score': round(e['score'], 4)}
                    for e in sorted(emotion_results, key=lambda x: x['score'], reverse=True)
                ]
            except Exception as e:
                logger.error(f"Erreur analyse émotions: {e}")
                emotions = [{'label': 'error', 'score': 0}]
        
        # Construire la réponse
        response = {
            'text': text,
            'sentiment': {
                'label': sentiment_label,
                'score': round(abs(compound), 4),
                'compound': round(compound, 4),
                'details': {
                    'positive': round(sentiment_scores['pos'], 4),
                    'neutral': round(sentiment_scores['neu'], 4),
                    'negative': round(sentiment_scores['neg'], 4)
                }
            },
            'emotions': emotions[:5],  # Top 5 émotions
            'metadata': {
                'text_length': len(text),
                'model': 'VADER + DistilRoBERTa'
            }
        }
        
        logger.info(f"✅ Analyse terminée: {sentiment_label}")
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"Erreur lors de l'analyse: {str(e)}")
        return jsonify({'error': f'Erreur serveur: {str(e)}'}), 500


@app.route('/batch-analyze', methods=['POST'])
def batch_analyze():
    """
    Analyse plusieurs textes en une seule requête
    
    Body JSON:
    {
        "texts": ["texte1", "texte2", ...]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'texts' not in data:
            return jsonify({'error': 'Le champ "texts" est requis'}), 400
        
        texts = data['texts']
        
        if not isinstance(texts, list):
            return jsonify({'error': '"texts" doit être une liste'}), 400
        
        if len(texts) > 50:
            return jsonify({'error': 'Maximum 50 textes par requête'}), 400
        
        results = []
        for idx, text in enumerate(texts):
            if not text or not text.strip():
                continue
                
            sentiment_scores = sia.polarity_scores(text)
            compound = sentiment_scores['compound']
            
            if compound >= 0.05:
                label = 'positive'
            elif compound <= -0.05:
                label = 'negative'
            else:
                label = 'neutral'
            
            results.append({
                'index': idx,
                'text': text[:100] + '...' if len(text) > 100 else text,
                'sentiment': label,
                'score': round(abs(compound), 4)
            })
        
        return jsonify({'results': results, 'total': len(results)}), 200
        
    except Exception as e:
        logger.error(f"Erreur batch analyse: {str(e)}")
        return jsonify({'error': f'Erreur serveur: {str(e)}'}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)