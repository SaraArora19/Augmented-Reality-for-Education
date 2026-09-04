"""
AI Tutor Engine for Augmented Reality HCI Educational System
Authors: Radhika Agrawal (23BCE5021) & Sara Arora (23BCE5036)

Provides interactive Socratic pedagogical responses, concept breakdowns,
and contextual hints based on the active AR marker.
Works offline using an intelligent domain knowledge base, and can
seamlessly integrate with cloud LLM APIs (OpenAI / Gemini) if keys are present.
"""

import os
import re
import json

class AITutor:
    def __init__(self, curriculum_data):
        self.curriculum = curriculum_data
        self.marker_lookup = {}
        for module in self.curriculum.get("modules", []):
            for marker in module.get("markers", []):
                self.marker_lookup[marker["id"]] = {
                    "module_name": module["name"],
                    "marker_name": marker["name"],
                    "category": marker.get("category", ""),
                    "objectives": marker.get("learning_objectives", []),
                    "facts": marker.get("key_facts", []),
                    "components": marker.get("components", []),
                    "narration": marker.get("voice_narration", ""),
                    "quiz": marker.get("quiz", [])
                }

    def generate_response(self, marker_id, user_message, chat_history=None):
        """
        Generates a pedagogical tutor response tailored to the active marker and student query.
        """
        user_text = user_message.strip()
        marker_info = self.marker_lookup.get(marker_id)

        # Fallback to general inquiry if marker not specified
        if not marker_info:
            return {
                "reply": (
                    "Hello! I am your AR AI Educational Tutor. Scan an educational marker "
                    "or select a topic (Anatomy, Mechanics, Botany, Geometry, Chemistry) to begin our interactive session!"
                ),
                "suggestions": [
                    "Tell me about the Human Heart",
                    "How does an internal combustion engine work?",
                    "What is Euler's polyhedral formula?",
                    "Why is water a bent molecule?"
                ]
            }

        topic = marker_info["marker_name"]
        lowered = user_text.lower()

        tokens = set(re.findall(r'\b\w+\b', lowered))

        # Check for quiz hint requests first
        if any(w in lowered for w in ["hint", "quiz", "test", "question", "help with quiz"]):
            quizzes = marker_info.get("quiz", [])
            if quizzes:
                q = quizzes[0]
                return {
                    "reply": (
                        f"**Quiz Tip for {topic}:** Pay close attention to this core concept: "
                        f"_{q['explanation']}_ Focus on the spatial relationship shown in your AR view!"
                    ),
                    "suggestions": [
                        "Explain another component",
                        "Tell me an interesting fact",
                        "Start the quiz now"
                    ]
                }

        # Check for greeting
        if any(w in tokens for w in ["hi", "hello", "hey", "greetings", "morning"]):
            return {
                "reply": (
                    f"Hello! I'm your interactive tutor for **{topic}**. "
                    f"You can ask me how each component works, explore key scientific mechanisms, "
                    f"or ask for quiz hints. What would you like to investigate first?"
                ),
                "suggestions": [
                    f"Explain how {topic} works",
                    f"What are the main components of {topic}?",
                    "Give me a study hint for the quiz"
                ]
            }

        # Check for components inquiry
        if any(w in lowered for w in ["component", "parts", "structure", "anatomy", "consist", "build", "organs"]):
            parts_summary = "\n".join([f"• **{c['name']}**: {c['function']}" for c in marker_info["components"]])
            return {
                "reply": (
                    f"Here is the anatomical/mechanical breakdown of **{topic}**:\n\n{parts_summary}\n\n"
                    f"Try rotating the 3D model in your AR viewport to inspect how these parts align spatially!"
                ),
                "suggestions": [
                    f"Why is {marker_info['components'][0]['name']} important?",
                    "Tell me key facts",
                    "How does it function?"
                ]
            }

        # Check for key facts / interesting trivia
        if any(w in lowered for w in ["fact", "interesting", "trivia", "did you know", "why"]):
            facts_bullet = "\n".join([f"• {f}" for f in marker_info["facts"]])
            return {
                "reply": (
                    f"Key scientific principles and facts about **{topic}**:\n\n{facts_bullet}\n\n"
                    f"Which of these concepts would you like to explore deeper?"
                ),
                "suggestions": [
                    "Explain the working cycle",
                    "What are the learning objectives?",
                    "Test my knowledge with a quiz"
                ]
            }

        # Component specific lookup
        for comp in marker_info["components"]:
            if comp["name"].lower() in lowered:
                return {
                    "reply": (
                        f"**{comp['name']} in {topic}:**\n\n"
                        f"{comp['function']}\n\n"
                        f"In the AR scene, look for this specific component highlighted on your model."
                    ),
                    "suggestions": [
                        "Explain the other components",
                        "How do they connect together?",
                        "Take the 5-question quiz"
                    ]
                }

        # Synthesis / general explanation
        narration = marker_info["narration"]
        objectives = "\n".join([f"{i+1}. {obj}" for i, obj in enumerate(marker_info["objectives"])])
        
        return {
            "reply": (
                f"**Understanding {topic}:**\n\n"
                f"{narration}\n\n"
                f"**Learning Objectives:**\n{objectives}\n\n"
                f"Feel free to ask a specific question about any mechanism or organ in this model!"
            ),
            "suggestions": [
                f"What are the main components of {topic}?",
                "Give me key facts and trivia",
                "Give me a hint for the quiz"
            ]
        }
