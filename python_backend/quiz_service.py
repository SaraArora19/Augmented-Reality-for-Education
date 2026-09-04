"""
Quiz Service for Augmented Reality Educational System
Authors: Radhika Agrawal (23BCE5021) & Sara Arora (23BCE5036)

Manages 5-question quiz delivery, submission verification, scoring,
and detailed pedagogical feedback.
"""

import time

class QuizService:
    def __init__(self, curriculum_data):
        self.curriculum = curriculum_data
        self.quiz_map = {}
        for module in self.curriculum.get("modules", []):
            for marker in module.get("markers", []):
                self.quiz_map[marker["id"]] = {
                    "module_id": module["id"],
                    "module_name": module["name"],
                    "marker_id": marker["id"],
                    "marker_name": marker["name"],
                    "questions": marker.get("quiz", [])
                }

    def get_quiz_for_marker(self, marker_id):
        """Returns the 5-question quiz for the specified marker without exposing correct answers."""
        marker_data = self.quiz_map.get(marker_id)
        if not marker_data:
            return None

        client_questions = []
        for idx, q in enumerate(marker_data["questions"]):
            client_questions.append({
                "id": idx,
                "question": q["question"],
                "options": q["options"]
            })

        return {
            "marker_id": marker_id,
            "marker_name": marker_data["marker_name"],
            "module_name": marker_data["module_name"],
            "total_questions": len(client_questions),
            "questions": client_questions
        }

    def evaluate_submission(self, marker_id, user_answers, completion_time_seconds=0):
        """
        Evaluates submitted answers against the true answer keys.
        user_answers: dict or list of selected index values, e.g. {0: 3, 1: 1, 2: 2, 3: 1, 4: 1} or [3, 1, 2, 1, 1]
        """
        marker_data = self.quiz_map.get(marker_id)
        if not marker_data:
            return {"error": f"Invalid marker ID: {marker_id}"}

        questions = marker_data["questions"]
        total = len(questions)
        correct_count = 0
        detailed_results = []

        for idx, q in enumerate(questions):
            expected = q["answer"]
            # Support both dict and list
            if isinstance(user_answers, dict):
                user_ans = user_answers.get(str(idx), user_answers.get(idx, None))
            elif isinstance(user_answers, list) and idx < len(user_answers):
                user_ans = user_answers[idx]
            else:
                user_ans = None

            is_correct = (user_ans is not None and int(user_ans) == expected)
            if is_correct:
                correct_count += 1

            detailed_results.append({
                "question_index": idx,
                "question": q["question"],
                "options": q["options"],
                "user_selected": user_ans,
                "correct_answer": expected,
                "is_correct": is_correct,
                "explanation": q["explanation"]
            })

        percentage = round((correct_count / total) * 100, 1) if total > 0 else 0
        grade = "A" if percentage >= 80 else ("B" if percentage >= 60 else ("C" if percentage >= 40 else "Needs Review"))

        return {
            "marker_id": marker_id,
            "marker_name": marker_data["marker_name"],
            "total_questions": total,
            "correct_answers": correct_count,
            "score_percentage": percentage,
            "grade": grade,
            "completion_time_seconds": completion_time_seconds,
            "results": detailed_results,
            "feedback": (
                f"Outstanding mastery! You scored {percentage}% ({correct_count}/{total})." if percentage >= 80 else
                f"Good effort! You scored {percentage}% ({correct_count}/{total}). Review the explanations to reinforce concepts."
            )
        }
