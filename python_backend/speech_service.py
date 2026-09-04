"""
Speech & Audio Service for Augmented Reality Educational System
Authors: Radhika Agrawal (23BCE5021) & Sara Arora (23BCE5036)

Provides text-to-speech script generation, audio narration mappings,
and simulated or API-based speech transcription for voice-driven AR interaction.
"""

class SpeechService:
    def __init__(self, curriculum_data):
        self.curriculum = curriculum_data
        self.narrations = {}
        for module in self.curriculum.get("modules", []):
            for marker in module.get("markers", []):
                self.narrations[marker["id"]] = {
                    "title": marker["name"],
                    "script": marker.get("voice_narration", ""),
                    "key_facts": marker.get("key_facts", [])
                }

    def get_narration_script(self, marker_id):
        """Returns the curated audio narration script for on-device TTS (Web Speech API / Unity Audio)."""
        data = self.narrations.get(marker_id)
        if not data:
            return {
                "title": "Educational Module",
                "script": "Explore this 3D model using touch gestures to rotate, pan, and examine internal structures."
            }
        return data

    def process_speech_query(self, transcript, active_marker_id, ai_tutor):
        """Processes a spoken query transcribed by client ASR and routes it to the AI Tutor."""
        clean_text = transcript.strip()
        if not clean_text:
            return {"reply": "I couldn't hear your question clearly. Please try speaking again or type your question."}
        
        response = ai_tutor.generate_response(active_marker_id, clean_text)
        response["input_transcription"] = clean_text
        return response
