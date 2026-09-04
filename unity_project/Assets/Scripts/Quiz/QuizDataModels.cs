using System;
using System.Collections.Generic;

namespace EduAR.Quiz
{
    [Serializable]
    public class QuizQuestion
    {
        public int id;
        public string question;
        public List<string> options;
        public int answer;
        public string explanation;
    }

    [Serializable]
    public class QuizData
    {
        public string marker_id;
        public string marker_name;
        public string module_name;
        public int total_questions;
        public List<QuizQuestion> questions;
    }

    [Serializable]
    public class QuizSubmission
    {
        public string marker_id;
        public List<int> answers;
        public int completion_time_seconds;
        public string student_id;
    }

    [Serializable]
    public class QuestionResult
    {
        public int question_index;
        public string question;
        public int user_selected;
        public int correct_answer;
        public bool is_correct;
        public string explanation;
    }

    [Serializable]
    public class QuizResult
    {
        public string marker_id;
        public string marker_name;
        public int total_questions;
        public int correct_answers;
        public float score_percentage;
        public string grade;
        public string feedback;
        public List<QuestionResult> results;
    }
}
