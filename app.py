#!/usr/bin/env python3
"""
English SAS - Sistema de Gestão Escolar com Questões de Inglês
Sistema self-hosted com Flask + HTML + JavaScript vanilla
"""

from flask import Flask, render_template, request, jsonify, session, send_file, redirect, url_for
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import json
import os
import uuid
from functools import wraps

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'english-sas-secret-key-2025-dev')

# Mock database - will be replaced with SQLite later
data_store = {
    'users': [
        {
            'id': 1,
            'email': 'admin@englishsas.com',
            'password': generate_password_hash('admin123'),
            'name': 'Administrador',
            'role': 'admin',
            'created_at': datetime.now().isoformat()
        }
    ],
    'professores': [],
    'turmas': [],
    'alunos': [],
    'matriculas': [],
    'etapas': [],
    'atividades': [],
    'notas': [],
    'feedbacks': [],
    'questoes_ingles': [],
    'bancos_questoes': [],
    'respostas_alunos': [],
    'configuracoes': {}
}

# English question templates for different levels and types
ENGLISH_QUESTION_TEMPLATES = {
    'A1': {
        'Reading': [
            {
                'titulo': 'Simple Present - Daily Routine',
                'enunciado': 'Read the text and answer the question:',
                'texto': 'Tom wakes up at 7 AM every day. He eats breakfast at 8 AM and goes to work at 9 AM.',
                'alternativas': ['At 7 AM', 'At 8 AM', 'At 9 AM', 'At 10 AM'],
                'resposta_correta': 0,
                'explicacao': 'The text says "Tom wakes up at 7 AM every day"'
            }
        ],
        'Grammar': [
            {
                'titulo': 'Present Simple - Basic',
                'enunciado': 'Choose the correct verb form:',
                'texto': 'She _____ to school every day.',
                'alternativas': ['go', 'goes', 'going', 'went'],
                'resposta_correta': 1,
                'explicacao': 'Third person singular adds -s to the verb in present simple.'
            }
        ],
        'Vocabulary': [
            {
                'titulo': 'Family Members',
                'enunciado': 'What do you call your father\'s brother?',
                'alternativas': ['Cousin', 'Uncle', 'Nephew', 'Grandfather'],
                'resposta_correta': 1,
                'explicacao': 'Your father\'s brother is your uncle.'
            }
        ]
    },
    'A2': {
        'Reading': [
            {
                'titulo': 'Shopping Experience',
                'enunciado': 'Read the text and answer:',
                'texto': 'Maria went to the supermarket yesterday. She bought milk, bread, and fruits. The total was $25.',
                'alternativas': ['$20', '$25', '$30', '$35'],
                'resposta_correta': 1,
                'explicacao': 'The text clearly states "The total was $25".'
            }
        ],
        'Grammar': [
            {
                'titulo': 'Past Simple - Regular Verbs',
                'enunciado': 'Complete with the correct past form:',
                'texto': 'Yesterday, I _____ (walk) to the park.',
                'alternativas': ['walk', 'walks', 'walked', 'walking'],
                'resposta_correta': 2,
                'explicacao': 'Regular verbs add -ed for past simple.'
            }
        ]
    },
    'B1': {
        'Reading': [
            {
                'titulo': 'Environmental Issues',
                'enunciado': 'According to the text, what is the main environmental concern?',
                'texto': 'Climate change is affecting weather patterns worldwide. Scientists warn that rising temperatures may lead to more extreme weather events.',
                'alternativas': ['Air pollution', 'Climate change', 'Water shortage', 'Deforestation'],
                'resposta_correta': 1,
                'explicacao': 'The text focuses on climate change and its effects.'
            }
        ],
        'Grammar': [
            {
                'titulo': 'Conditional Type 1',
                'enunciado': 'Choose the correct conditional form:',
                'texto': 'If it _____ tomorrow, we will go to the beach.',
                'alternativas': ['is sunny', 'will be sunny', 'was sunny', 'were sunny'],
                'resposta_correta': 0,
                'explicacao': 'First conditional: If + present simple, will + base verb.'
            }
        ]
    },
    'B2': {
        'Reading': [
            {
                'titulo': 'Technology Impact',
                'enunciado': 'What does the author suggest about social media?',
                'texto': 'While social media connects people globally, it also raises concerns about privacy and the quality of interpersonal relationships.',
                'alternativas': ['It only has positive effects', 'It has both positive and negative aspects', 'It should be banned', 'It is completely safe'],
                'resposta_correta': 1,
                'explicacao': 'The text presents both benefits (connects people) and concerns (privacy, relationships).'
            }
        ],
        'Grammar': [
            {
                'titulo': 'Passive Voice',
                'enunciado': 'Choose the correct passive form:',
                'texto': 'The book _____ by many students every year.',
                'alternativas': ['reads', 'is read', 'was read', 'has read'],
                'resposta_correta': 1,
                'explicacao': 'Present passive: is/am/are + past participle.'
            }
        ]
    },
    'B2+': {
        'Reading': [
            {
                'titulo': 'Economic Globalization',
                'enunciado': 'What is the author\'s main argument about globalization?',
                'texto': 'Globalization has created unprecedented economic interdependence, but it has also exacerbated inequality within and between nations, requiring careful policy intervention.',
                'alternativas': ['It only benefits rich countries', 'It creates both opportunities and challenges', 'It should be completely reversed', 'It has no negative effects'],
                'resposta_correta': 1,
                'explicacao': 'The text acknowledges both benefits (economic interdependence) and problems (inequality).'
            }
        ],
        'Writing': [
            {
                'titulo': 'Opinion Essay',
                'enunciado': 'Write an essay (200-250 words) discussing whether smartphones should be banned in schools.',
                'texto': 'Provide arguments for and against, and give your opinion.',
                'resposta_correta': None,
                'explicacao': 'Essay should have clear structure: introduction, body paragraphs, conclusion.'
            }
        ]
    }
}

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Login required'}), 401
        return f(*args, **kwargs)
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Login required'}), 401
        
        user = next((u for u in data_store['users'] if u['id'] == session['user_id']), None)
        if not user or user['role'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

def professor_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Login required'}), 401
        
        user = next((u for u in data_store['users'] if u['id'] == session['user_id']), None)
        if not user or user['role'] not in ['admin', 'professor']:
            return jsonify({'error': 'Professor access required'}), 403
        
        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login')
def login_page():
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

# API Routes
@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email e senha são obrigatórios'}), 400
        
        user = next((u for u in data_store['users'] if u['email'] == email), None)
        if not user or not check_password_hash(user['password'], password):
            return jsonify({'error': 'Credenciais inválidas'}), 401
        
        session['user_id'] = user['id']
        session['user_role'] = user['role']
        session['user_name'] = user['name']
        
        return jsonify({
            'success': True,
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'role': user['role']
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        
        if not name or not email or not password:
            return jsonify({'error': 'Nome, email e senha são obrigatórios'}), 400
        
        # Check if user exists
        existing_user = next((u for u in data_store['users'] if u['email'] == email), None)
        if existing_user:
            return jsonify({'error': 'Email já cadastrado'}), 400
        
        # Create new user
        new_user = {
            'id': len(data_store['users']) + 1,
            'email': email,
            'password': generate_password_hash(password),
            'name': name,
            'role': 'professor',  # Default role
            'created_at': datetime.now().isoformat()
        }
        
        data_store['users'].append(new_user)
        
        # Create professor record
        new_professor = {
            'id': len(data_store['professores']) + 1,
            'userId': new_user['id'],
            'nome': name,
            'email': email,
            'created_at': datetime.now().isoformat()
        }
        data_store['professores'].append(new_professor)
        
        return jsonify({
            'success': True,
            'user': {
                'id': new_user['id'],
                'email': new_user['email'],
                'name': new_user['name'],
                'role': new_user['role']
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    session.clear()
    return jsonify({'success': True})

@app.route('/api/auth/me')
@login_required
def get_current_user():
    user = next((u for u in data_store['users'] if u['id'] == session['user_id']), None)
    if user:
        return jsonify({
            'user': {
                'id': user['id'],
                'email': user['email'],
                'name': user['name'],
                'role': user['role']
            }
        })
    return jsonify({'user': None})

# Turmas routes
@app.route('/api/turmas', methods=['GET'])
@professor_required
def get_turmas():
    user_role = session.get('user_role')
    user_id = session.get('user_id')
    
    if user_role == 'admin':
        return jsonify({'turmas': data_store['turmas']})
    else:
        # Professor sees only their classes
        professor = next((p for p in data_store['professores'] if p['userId'] == user_id), None)
        if professor:
            turmas = [t for t in data_store['turmas'] if t['professorId'] == professor['id']]
            return jsonify({'turmas': turmas})
        return jsonify({'turmas': []})

@app.route('/api/turmas', methods=['POST'])
@admin_required
def create_turma():
    try:
        data = request.get_json()
        nome = data.get('nome')
        nivel = data.get('nivel')
        ano = data.get('ano')
        professor_id = data.get('professorId')
        
        if not all([nome, nivel, ano, professor_id]):
            return jsonify({'error': 'Todos os campos são obrigatórios'}), 400
        
        # Create turma
        new_turma = {
            'id': len(data_store['turmas']) + 1,
            'nome': nome,
            'nivel': nivel,
            'ano': ano,
            'professorId': professor_id,
            'ativa': True,
            'created_at': datetime.now().isoformat()
        }
        data_store['turmas'].append(new_turma)
        
        # Create default etapas (30/35/35)
        etapas = [
            {'numero': 1, 'nome': 'Etapa 1', 'pontosMaximos': 30},
            {'numero': 2, 'nome': 'Etapa 2', 'pontosMaximos': 35},
            {'numero': 3, 'nome': 'Etapa 3', 'pontosMaximos': 35}
        ]
        
        for etapa in etapas:
            new_etapa = {
                'id': len(data_store['etapas']) + 1,
                'turmaId': new_turma['id'],
                'numero': etapa['numero'],
                'nome': etapa['nome'],
                'pontosMaximos': etapa['pontosMaximos'],
                'created_at': datetime.now().isoformat()
            }
            data_store['etapas'].append(new_etapa)
        
        return jsonify({'success': True, 'id': new_turma['id']})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Questões de Inglês routes
@app.route('/api/questoes-ingles', methods=['GET'])
@professor_required
def get_questoes_ingles():
    return jsonify({'questoes': data_store['questoes_ingles']})

@app.route('/api/questoes-ingles', methods=['POST'])
@professor_required
def create_questao_ingles():
    try:
        data = request.get_json()
        
        new_questao = {
            'id': len(data_store['questoes_ingles']) + 1,
            'titulo': data.get('titulo'),
            'tipo': data.get('tipo'),
            'nivel': data.get('nivel'),
            'enunciado': data.get('enunciado'),
            'texto': data.get('texto'),
            'alternativas': json.dumps(data.get('alternativas', [])),
            'respostaCorreta': data.get('respostaCorreta'),
            'explicacao': data.get('explicacao'),
            'professorId': data.get('professorId'),
            'ativa': True,
            'created_at': datetime.now().isoformat()
        }
        
        data_store['questoes_ingles'].append(new_questao)
        return jsonify({'success': True, 'id': new_questao['id']})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Template routes
@app.route('/templates/<path:filename>')
def serve_template(filename):
    return render_template(filename)

# Static files
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('static', filename)

# Initialize some sample data
def init_sample_data():
    # Add sample English questions if none exist
    if not data_store['questoes_ingles']:
        for nivel, tipos in ENGLISH_QUESTION_TEMPLATES.items():
            for tipo, questoes in tipos.items():
                for questao in questoes:
                    new_questao = {
                        'id': len(data_store['questoes_ingles']) + 1,
                        'titulo': questao['titulo'],
                        'tipo': tipo,
                        'nivel': nivel,
                        'enunciado': questao['enunciado'],
                        'texto': questao.get('texto', ''),
                        'alternativas': json.dumps(questao['alternativas']),
                        'respostaCorreta': questao['resposta_correta'],
                        'explicacao': questao['explicacao'],
                        'professorId': 1,
                        'ativa': True,
                        'created_at': datetime.now().isoformat()
                    }
                    data_store['questoes_ingles'].append(new_questao)

if __name__ == '__main__':
    init_sample_data()
    print("English SAS Server starting...")
    print("Admin credentials: admin@englishsas.com / admin123")
    app.run(host='0.0.0.0', port=3003, debug=True)