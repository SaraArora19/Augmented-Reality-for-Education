"""
Unit Tests for Augmented Reality Backend & HCI Analytics
Authors: Radhika Agrawal (23BCE5021) & Sara Arora (23BCE5036)
"""

import unittest
import json
import os
import sys

# Add python_backend to path
BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "python_backend"))
sys.path.insert(0, BACKEND_DIR)

from ai_tutor import AITutor
from quiz_service import QuizService
from hci_analytics import HCIAnalytics

class TestARBackend(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        data_path = os.path.join(BACKEND_DIR, "data", "modules_data.json")
        with open(data_path, "r", encoding="utf-8") as f:
            cls.curriculum = json.load(f)
        cls.tutor = AITutor(cls.curriculum)
        cls.quiz = QuizService(cls.curriculum)
        cls.temp_store = os.path.join(BACKEND_DIR, "data", "test_analytics_store.json")
        cls.analytics = HCIAnalytics(cls.temp_store)

    @classmethod
    def tearDownClass(cls):
        if os.path.exists(cls.temp_store):
            os.remove(cls.temp_store)

    def test_curriculum_integrity(self):
        """Verify 5 educational modules and markers exist."""
        modules = self.curriculum.get("modules", [])
        self.assertGreaterEqual(len(modules), 4, "Should have at least 4 modules as per DA1 methodology")
        
        module_ids = [m["id"] for m in modules]
        self.assertIn("anatomy", module_ids)
        self.assertIn("mechanics", module_ids)
        self.assertIn("biology", module_ids)
        self.assertIn("geometry", module_ids)
        self.assertIn("chemistry", module_ids)

        # Verify each marker has exactly 5 quiz questions
        for m in modules:
            for marker in m.get("markers", []):
                quizzes = marker.get("quiz", [])
                self.assertEqual(len(quizzes), 5, f"Marker {marker['id']} should have exactly 5 quiz questions")

    def test_quiz_grading(self):
        """Verify quiz evaluation with 100% and partial scores."""
        # marker_heart answers: [3, 1, 2, 1, 1]
        res_perfect = self.quiz.evaluate_submission("marker_heart", [3, 1, 2, 1, 1], completion_time_seconds=30)
        self.assertEqual(res_perfect["correct_answers"], 5)
        self.assertEqual(res_perfect["score_percentage"], 100.0)
        self.assertEqual(res_perfect["grade"], "A")

        res_partial = self.quiz.evaluate_submission("marker_heart", [3, 0, 2, 0, 1])
        self.assertEqual(res_partial["correct_answers"], 3)
        self.assertEqual(res_partial["score_percentage"], 60.0)
        self.assertEqual(res_partial["grade"], "B")

    def test_ai_tutor_responses(self):
        """Verify AI tutor replies for questions."""
        resp = self.tutor.generate_response("marker_heart", "What are the components of the heart?")
        self.assertIn("breakdown of", resp["reply"])
        self.assertIn("Right Atrium", resp["reply"])

        hint_resp = self.tutor.generate_response("marker_heart", "Can you give me a hint for the quiz?")
        self.assertIn("Quiz Tip", hint_resp["reply"])

    def test_sus_calculation(self):
        """Verify standard System Usability Scale (SUS) formula."""
        # Perfect SUS score of 100: all odd questions = 5 (scaled to 4), all even questions = 1 (scaled to 4)
        perfect_responses = [5, 1, 5, 1, 5, 1, 5, 1, 5, 1]
        res = HCIAnalytics.calculate_sus_score(perfect_responses)
        self.assertEqual(res["sus_score"], 100.0)
        self.assertIn("Best Imaginable", res["adjective_rating"])

        # Average SUS score of 68: odd=4 (3), even=2 (3) -> 10*3 * 2.5 = 75
        good_responses = [4, 2, 4, 2, 4, 2, 4, 2, 4, 2]
        res2 = HCIAnalytics.calculate_sus_score(good_responses)
        self.assertEqual(res2["sus_score"], 75.0)
        self.assertTrue(res2["above_industry_average"])

    def test_learning_gain_calculation(self):
        """Verify Hake's normalized learning gain formula g = (post - pre)/(100 - pre)."""
        # Pre = 40, Post = 82 -> Gain = 42 / 60 = 0.70 (High gain)
        gain = HCIAnalytics.calculate_learning_gain(40.0, 82.0)
        self.assertEqual(gain["normalized_gain_g"], 0.7)
        self.assertEqual(gain["gain_category"], "High Gain (g >= 0.7)")

    def test_nasa_tlx_calculation(self):
        """Verify NASA-TLX raw workload score calculation."""
        ratings = {
            "mental": 35,
            "physical": 15,
            "temporal": 25,
            "performance": 20,
            "effort": 30,
            "frustration": 10
        }
        tlx = HCIAnalytics.calculate_nasa_tlx(ratings)
        expected_raw = round((35 + 15 + 25 + 20 + 30 + 10) / 6.0, 2)
        self.assertEqual(tlx["raw_tlx_score"], expected_raw)
        self.assertEqual(tlx["interpretation"], "Low Cognitive Load")

if __name__ == "__main__":
    unittest.main()
