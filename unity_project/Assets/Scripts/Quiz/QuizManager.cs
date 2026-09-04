using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using UnityEngine.Networking;

namespace EduAR.Quiz
{
    /// <summary>
    /// 5-Question Quiz State Machine & Evaluation Engine for Unity
    /// Authors: Radhika Agrawal (23BCE5021) & Sara Arora (23BCE5036)
    /// </summary>
    public class QuizManager : MonoBehaviour
    {
        [Header("Backend API Configuration")]
        [SerializeField] private string apiBaseUrl = "http://localhost:5000/api";

        [Header("UI Dialog Panels")]
        [SerializeField] private GameObject quizModalRoot;
        [SerializeField] private GameObject quizQuestionPanel;
        [SerializeField] private GameObject quizResultsPanel;

        [Header("Question UI References")]
        [SerializeField] private TextMeshProUGUI titleText;
        [SerializeField] private TextMeshProUGUI progressText;
        [SerializeField] private TextMeshProUGUI timerText;
        [SerializeField] private TextMeshProUGUI questionBodyText;
        [SerializeField] private Image progressBarFill;
        [SerializeField] private List<Button> optionButtons = new List<Button>();
        [SerializeField] private List<TextMeshProUGUI> optionTexts = new List<TextMeshProUGUI>();

        [Header("Navigation Buttons")]
        [SerializeField] private Button prevButton;
        [SerializeField] private Button nextButton;
        [SerializeField] private Button submitButton;
        [SerializeField] private Button retryButton;

        [Header("Results UI References")]
        [SerializeField] private TextMeshProUGUI scorePercentageText;
        [SerializeField] private TextMeshProUGUI gradeText;
        [SerializeField] private TextMeshProUGUI feedbackText;

        [Header("Firebase Bridge")]
        [SerializeField] private Backend.FirebaseSyncManager firebaseManager;

        private QuizData currentQuiz;
        private int currentQuestionIndex = 0;
        private readonly Dictionary<int, int> selectedAnswers = new Dictionary<int, int>();
        private float quizStartTime;
        private bool isQuizActive = false;
        private string activeMarkerId = "marker_heart";

        private void Start()
        {
            if (quizModalRoot != null) quizModalRoot.SetActive(false);

            if (prevButton != null) prevButton.onClick.AddListener(OnPrevClicked);
            if (nextButton != null) nextButton.onClick.AddListener(OnNextClicked);
            if (submitButton != null) submitButton.onClick.AddListener(OnSubmitClicked);
            if (retryButton != null) retryButton.onClick.AddListener(() => StartQuiz(activeMarkerId));

            for (int i = 0; i < optionButtons.Count; i++)
            {
                int optionIndex = i;
                optionButtons[i].onClick.AddListener(() => SelectOption(optionIndex));
            }
        }

        private void Update()
        {
            if (isQuizActive && timerText != null)
            {
                float elapsed = Time.time - quizStartTime;
                int mins = Mathf.FloorToInt(elapsed / 60.0f);
                int secs = Mathf.FloorToInt(elapsed % 60.0f);
                timerText.text = $"{mins:D2}:{secs:D2}";
            }
        }

        public void StartQuiz(string markerId)
        {
            activeMarkerId = markerId;
            selectedAnswers.Clear();
            currentQuestionIndex = 0;
            quizStartTime = Time.time;
            isQuizActive = true;

            quizModalRoot.SetActive(true);
            quizQuestionPanel.SetActive(true);
            quizResultsPanel.SetActive(false);

            StartCoroutine(FetchQuizData(markerId));
        }

        private IEnumerator FetchQuizData(string markerId)
        {
            string url = $"{apiBaseUrl}/quiz/{markerId}";
            using (UnityWebRequest req = UnityWebRequest.Get(url))
            {
                yield return req.SendWebRequest();

                if (req.result == UnityWebRequest.Result.Success)
                {
                    currentQuiz = JsonUtility.FromJson<QuizData>(req.downloadHandler.text);
                }
                else
                {
                    // Fallback local quiz
                    currentQuiz = CreateFallbackQuiz(markerId);
                }
                RenderQuestion();
            }
        }

        private void RenderQuestion()
        {
            if (currentQuiz == null || currentQuiz.questions == null || currentQuiz.questions.Count == 0) return;

            var q = currentQuiz.questions[currentQuestionIndex];
            int total = currentQuiz.questions.Count;

            if (titleText != null) titleText.text = $"{currentQuiz.marker_name} — 5-Question Quiz";
            if (progressText != null) progressText.text = $"Question {currentQuestionIndex + 1} of {total}";
            if (progressBarFill != null) progressBarFill.fillAmount = (float)(currentQuestionIndex + 1) / total;
            if (questionBodyText != null) questionBodyText.text = q.question;

            for (int i = 0; i < optionButtons.Count; i++)
            {
                if (i < q.options.Count)
                {
                    optionButtons[i].gameObject.SetActive(true);
                    optionTexts[i].text = q.options[i];

                    // Highlight selected
                    bool isSelected = selectedAnswers.ContainsKey(currentQuestionIndex) && selectedAnswers[currentQuestionIndex] == i;
                    optionButtons[i].image.color = isSelected ? new Color(0.96f, 0.62f, 0.04f) : new Color(0.15f, 0.23f, 0.42f);
                }
                else
                {
                    optionButtons[i].gameObject.SetActive(false);
                }
            }

            if (prevButton != null) prevButton.interactable = currentQuestionIndex > 0;
            bool isLast = (currentQuestionIndex == total - 1);
            if (nextButton != null) nextButton.gameObject.SetActive(!isLast);
            if (submitButton != null) submitButton.gameObject.SetActive(isLast);
        }

        private void SelectOption(int optionIndex)
        {
            selectedAnswers[currentQuestionIndex] = optionIndex;
            RenderQuestion();
        }

        private void OnPrevClicked()
        {
            if (currentQuestionIndex > 0)
            {
                currentQuestionIndex--;
                RenderQuestion();
            }
        }

        private void OnNextClicked()
        {
            if (currentQuestionIndex < currentQuiz.questions.Count - 1)
            {
                currentQuestionIndex++;
                RenderQuestion();
            }
        }

        private void OnSubmitClicked()
        {
            isQuizActive = false;
            float elapsedSecs = Time.time - quizStartTime;

            // Submit to backend
            StartCoroutine(PostQuizSubmission(elapsedSecs));
        }

        private IEnumerator PostQuizSubmission(float durationSecs)
        {
            List<int> answers = new List<int>();
            for (int i = 0; i < currentQuiz.questions.Count; i++)
            {
                answers.Add(selectedAnswers.ContainsKey(i) ? selectedAnswers[i] : -1);
            }

            QuizSubmission sub = new QuizSubmission
            {
                marker_id = activeMarkerId,
                answers = answers,
                completion_time_seconds = Mathf.RoundToInt(durationSecs),
                student_id = "UnityStudent_23BCE"
            };

            string jsonPayload = JsonUtility.ToJson(sub);
            string url = $"{apiBaseUrl}/quiz/submit";

            using (UnityWebRequest req = new UnityWebRequest(url, "POST"))
            {
                byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonPayload);
                req.uploadHandler = new UploadHandlerRaw(bodyRaw);
                req.downloadHandler = new DownloadHandlerBuffer();
                req.SetRequestHeader("Content-Type", "application/json");

                yield return req.SendWebRequest();

                QuizResult res;
                if (req.result == UnityWebRequest.Result.Success)
                {
                    res = JsonUtility.FromJson<QuizResult>(req.downloadHandler.text);
                }
                else
                {
                    // Evaluate locally
                    res = EvaluateLocally(answers, Mathf.RoundToInt(durationSecs));
                }

                DisplayResults(res);

                // Sync with Firebase
                if (firebaseManager != null)
                {
                    firebaseManager.UploadQuizScore(res.marker_id, res.score_percentage, durationSecs);
                }
            }
        }

        private void DisplayResults(QuizResult res)
        {
            quizQuestionPanel.SetActive(false);
            quizResultsPanel.SetActive(true);

            if (scorePercentageText != null) scorePercentageText.text = $"{res.score_percentage}%";
            if (gradeText != null) gradeText.text = $"Grade {res.grade}";
            if (feedbackText != null) feedbackText.text = res.feedback;
        }

        private QuizResult EvaluateLocally(List<int> answers, int elapsed)
        {
            int correct = 0;
            for (int i = 0; i < currentQuiz.questions.Count; i++)
            {
                if (i < answers.Count && answers[i] == currentQuiz.questions[i].answer)
                {
                    correct++;
                }
            }
            float pct = Mathf.Round((float)correct / currentQuiz.questions.Count * 100.0f);
            return new QuizResult
            {
                marker_id = activeMarkerId,
                marker_name = currentQuiz.marker_name,
                total_questions = currentQuiz.questions.Count,
                correct_answers = correct,
                score_percentage = pct,
                grade = pct >= 80 ? "A" : (pct >= 60 ? "B" : "C"),
                feedback = $"Completed in {elapsed} seconds."
            };
        }

        private QuizData CreateFallbackQuiz(string markerId)
        {
            QuizData qd = new QuizData
            {
                marker_id = markerId,
                marker_name = markerId.Replace("marker_", "").ToUpper(),
                total_questions = 5,
                questions = new List<QuizQuestion>()
            };

            for (int i = 0; i < 5; i++)
            {
                qd.questions.Add(new QuizQuestion
                {
                    id = i,
                    question = $"Key concept question #{i + 1} regarding {qd.marker_name}:",
                    options = new List<string> { "Primary function", "Secondary mechanism", "Thermal constraint", "Spatial orientation" },
                    answer = 0,
                    explanation = "Fundamental principle covered in the 3D model exploration."
                });
            }
            return qd;
        }

        public void CloseQuiz()
        {
            isQuizActive = false;
            if (quizModalRoot != null) quizModalRoot.SetActive(false);
        }
    }
}
