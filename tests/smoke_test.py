"""
Smoke Test for Flask Backend Server and Client Asset Serving
Authors: Radhika Agrawal (23BCE5021) & Sara Arora (23BCE5036)
"""

import unittest
import json
import os
import sys

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "python_backend"))
sys.path.insert(0, BACKEND_DIR)

from app import app

class TestServerSmoke(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_static_routes(self):
        # 1. Main WebAR client index
        res_index = self.client.get('/')
        self.assertEqual(res_index.status_code, 200)
        self.assertIn(b"EduAR-HCI", res_index.data)

        # 2. Flashcards printable page
        res_flash = self.client.get('/flashcards')
        self.assertEqual(res_flash.status_code, 200)
        self.assertIn(b"Printable Marker Flashcards", res_flash.data)

        # 3. Evaluation portal
        res_eval = self.client.get('/evaluation')
        self.assertEqual(res_eval.status_code, 200)
        self.assertIn(b"HCI Evaluation Protocol", res_eval.data)

    def test_api_endpoints(self):
        # /api/modules
        res_mods = self.client.get('/api/modules')
        self.assertEqual(res_mods.status_code, 200)
        data = json.loads(res_mods.data)
        self.assertEqual(len(data['modules']), 5)

        # /api/chat
        res_chat = self.client.post('/api/chat', json={
            'marker_id': 'marker_engine',
            'message': 'How does the spark plug work?'
        })
        self.assertEqual(res_chat.status_code, 200)
        chat_data = json.loads(res_chat.data)
        self.assertIn('reply', chat_data)

        # /api/quiz/<marker_id>
        res_quiz = self.client.get('/api/quiz/marker_heart')
        self.assertEqual(res_quiz.status_code, 200)
        quiz_data = json.loads(res_quiz.data)
        self.assertEqual(quiz_data['total_questions'], 5)

        # /api/quiz/submit
        res_sub = self.client.post('/api/quiz/submit', json={
            'marker_id': 'marker_heart',
            'answers': [3, 1, 2, 1, 1],
            'completion_time_seconds': 35
        })
        self.assertEqual(res_sub.status_code, 200)
        sub_data = json.loads(res_sub.data)
        self.assertEqual(sub_data['score_percentage'], 100.0)

        # /api/analytics/summary
        res_summ = self.client.get('/api/analytics/summary')
        self.assertEqual(res_summ.status_code, 200)

if __name__ == '__main__':
    unittest.main()
