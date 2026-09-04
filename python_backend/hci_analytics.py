"""
HCI Evaluation & Analytics Service (DA1 Stage M3 Methodology)
Authors: Radhika Agrawal (23BCE5021) & Sara Arora (23BCE5036)

Implements psychometric and learning evaluation protocols:
1. System Usability Scale (SUS - Brooke 1996) with adjective & percentile rankings.
2. NASA-TLX 6-dimension Cognitive Workload Assessment (Hart & Staveland 1988).
3. Keller's ARCS Motivation Model (Attention, Relevance, Confidence, Satisfaction).
4. Pre/Post-Test Normalized Learning Gain (Hake's g = (Post - Pre) / (100 - Pre)).
5. Session Telemetry: Task completion times, error rates, and interaction counts.
"""

import json
import os
import math
from datetime import datetime

class HCIAnalytics:
    def __init__(self, storage_path):
        self.storage_path = storage_path
        self.sessions = self._load_storage()

    def _load_storage(self):
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return []
        return []

    def _save_storage(self):
        try:
            with open(self.storage_path, "w", encoding="utf-8") as f:
                json.dump(self.sessions, f, indent=2)
        except Exception as e:
            print(f"Error saving analytics store: {e}")

    @staticmethod
    def calculate_sus_score(responses):
        """
        Computes the standard System Usability Scale (SUS) score from 10 items (1-5 Likert scale).
        Brooke (1996):
        - Odd questions (1,3,5,7,9): response - 1
        - Even questions (2,4,6,8,10): 5 - response
        - Sum of scaled values * 2.5 -> Result between 0 and 100.
        """
        if len(responses) != 10:
            raise ValueError(f"SUS requires exactly 10 item responses, got {len(responses)}")

        scaled_sum = 0
        for i, val in enumerate(responses):
            val = float(val)
            if i % 2 == 0:  # Odd item (0-indexed 0, 2, 4, 6, 8 -> questions 1, 3, 5, 7, 9)
                scaled_sum += (val - 1.0)
            else:          # Even item (0-indexed 1, 3, 5, 7, 9 -> questions 2, 4, 6, 8, 10)
                scaled_sum += (5.0 - val)

        sus_score = round(scaled_sum * 2.5, 2)

        # Adjective rating (Bangor, Kortum & Miller 2009)
        if sus_score >= 85.0:
            adjective = "Best Imaginable (Grade A+)"
        elif sus_score >= 80.3:
            adjective = "Excellent (Grade A)"
        elif sus_score >= 68.0:
            adjective = "Good / Above Average (Grade B)"
        elif sus_score >= 51.0:
            adjective = "OK / Fair (Grade C)"
        else:
            adjective = "Poor / Sub-standard (Grade F)"

        return {
            "sus_score": sus_score,
            "adjective_rating": adjective,
            "above_industry_average": sus_score >= 68.0
        }

    @staticmethod
    def calculate_nasa_tlx(ratings):
        """
        Computes NASA-TLX raw workload score across 6 subscales (0-100 scale each):
        - Mental Demand
        - Physical Demand
        - Temporal Demand
        - Performance (inversed for workload: higher score = worse performance)
        - Effort
        - Frustration
        """
        keys = ["mental", "physical", "temporal", "performance", "effort", "frustration"]
        total = sum(float(ratings.get(k, 0)) for k in keys)
        raw_score = round(total / len(keys), 2)
        
        category = "Low Cognitive Load" if raw_score < 40 else ("Moderate Workload" if raw_score < 65 else "High Cognitive Load")
        return {
            "raw_tlx_score": raw_score,
            "dimensions": {k: float(ratings.get(k, 0)) for k in keys},
            "interpretation": category
        }

    @staticmethod
    def calculate_learning_gain(pre_score, post_score, max_possible=100.0):
        """
        Calculates absolute gain and Richard Hake's normalized learning gain (g):
        g = (post - pre) / (max - pre)
        Interpretation (Hake 1998):
        - High gain: g >= 0.7
        - Medium gain: 0.3 <= g < 0.7
        - Low gain: g < 0.3
        """
        pre = float(pre_score)
        post = float(post_score)
        denom = max_possible - pre

        abs_gain = round(post - pre, 2)
        if denom <= 0:
            norm_gain = 1.0 if post >= max_possible else 0.0
        else:
            norm_gain = round(abs_gain / denom, 3)

        category = "High Gain (g >= 0.7)" if norm_gain >= 0.7 else (
            "Medium Gain (0.3 <= g < 0.7)" if norm_gain >= 0.3 else "Low Gain (g < 0.3)"
        )

        return {
            "pre_score": pre,
            "post_score": post,
            "absolute_gain": abs_gain,
            "normalized_gain_g": norm_gain,
            "gain_category": category
        }

    def record_study_session(self, session_data):
        """Stores a complete student evaluation record."""
        session_id = session_data.get("session_id", f"STU_{len(self.sessions) + 1:03d}")
        participant_name = session_data.get("participant_name", "Anonymous Student")
        timestamp = datetime.now().isoformat()

        # SUS
        sus_resp = session_data.get("sus_responses")
        sus_analysis = self.calculate_sus_score(sus_resp) if sus_resp and len(sus_resp) == 10 else None

        # NASA-TLX
        tlx_resp = session_data.get("nasa_tlx_ratings")
        tlx_analysis = self.calculate_nasa_tlx(tlx_resp) if tlx_resp else None

        # Learning Gain
        pre = session_data.get("pre_test_score", 0)
        post = session_data.get("post_test_score", 0)
        gain_analysis = self.calculate_learning_gain(pre, post)

        # Keller ARCS Motivation
        arcs = session_data.get("arcs_motivation", {})
        arcs_summary = {
            "attention": float(arcs.get("attention", 4.0)),
            "relevance": float(arcs.get("relevance", 4.0)),
            "confidence": float(arcs.get("confidence", 4.0)),
            "satisfaction": float(arcs.get("satisfaction", 4.0))
        }
        arcs_summary["mean"] = round(sum(arcs_summary.values()) / 4.0, 2)

        record = {
            "session_id": session_id,
            "participant_name": participant_name,
            "timestamp": timestamp,
            "active_module": session_data.get("active_module", "All Modules"),
            "task_completion_time_sec": session_data.get("completion_time_sec", 0),
            "interactions_count": session_data.get("interactions_count", 0),
            "sus": sus_analysis,
            "nasa_tlx": tlx_analysis,
            "learning_gain": gain_analysis,
            "arcs_motivation": arcs_summary
        }

        self.sessions.append(record)
        self._save_storage()
        return record

    def get_summary_statistics(self):
        """Computes cohort summary statistics (Mean, Std Dev, Confidence Intervals)."""
        if not self.sessions:
            return {"count": 0, "message": "No participant sessions recorded yet."}

        n = len(self.sessions)
        sus_scores = [s["sus"]["sus_score"] for s in self.sessions if s.get("sus")]
        tlx_scores = [s["nasa_tlx"]["raw_tlx_score"] for s in self.sessions if s.get("nasa_tlx")]
        g_scores = [s["learning_gain"]["normalized_gain_g"] for s in self.sessions if s.get("learning_gain")]
        pre_scores = [s["learning_gain"]["pre_score"] for s in self.sessions if s.get("learning_gain")]
        post_scores = [s["learning_gain"]["post_score"] for s in self.sessions if s.get("learning_gain")]
        arcs_scores = [s["arcs_motivation"]["mean"] for s in self.sessions if s.get("arcs_motivation")]

        def mean_std(arr):
            if not arr:
                return {"mean": 0, "std_dev": 0}
            m = sum(arr) / len(arr)
            variance = sum((x - m) ** 2 for x in arr) / max(1, len(arr) - 1)
            return {"mean": round(m, 2), "std_dev": round(math.sqrt(variance), 2)}

        return {
            "sample_size_N": n,
            "system_usability_scale": mean_std(sus_scores),
            "nasa_tlx_workload": mean_std(tlx_scores),
            "pre_test": mean_std(pre_scores),
            "post_test": mean_std(post_scores),
            "normalized_gain_g": mean_std(g_scores),
            "arcs_motivation_overall": mean_std(arcs_scores)
        }
