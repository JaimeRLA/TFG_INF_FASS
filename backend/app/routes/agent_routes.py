from flask import Blueprint, request, jsonify
from ..agent_logic import process_medical_query, get_symptom_guidance

agent_bp = Blueprint('agent', __name__)

@agent_bp.route('/api/agent/query', methods=['POST'])
def handle_agent_query():
    """Endpoint para consultas al agente médico"""
    data = request.json
    user_query = data.get('query', '')
    
    if not user_query:
        return jsonify({"error": "Query is required"}), 400
    
    response = process_medical_query(user_query)
    return jsonify(response)

@agent_bp.route('/api/agent/symptom-guidance', methods=['POST'])
def get_symptom_help():
    """Endpoint para obtener guía de clasificación de síntoma"""
    data = request.json
    symptom = data.get('symptom')
    organ_system = data.get('organ_system')
    
    if not symptom or not organ_system:
        return jsonify({"error": "Symptom and organ_system required"}), 400
    
    guidance = get_symptom_guidance(symptom, organ_system)
    return jsonify(guidance)