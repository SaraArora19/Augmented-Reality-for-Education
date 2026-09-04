using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;

namespace EduAR.Backend
{
    /// <summary>
    /// Firebase Cloud Firestore & Authentication REST Sync Manager
    /// Authors: Radhika Agrawal (23BCE5021) & Sara Arora (23BCE5036)
    /// Connects the Unity AR mobile app to Firebase Firestore BaaS.
    /// </summary>
    public class FirebaseSyncManager : MonoBehaviour
    {
        [Header("Firebase Project Config")]
        [SerializeField] private string firebaseProjectId = "edu-ar-hci";
        [SerializeField] private string firebaseApiKey = "AIzaSy_MOCK_STUDENT_PROJECT_KEY";
        [SerializeField] private bool useLocalFallback = true;

        [Header("Student Session Profile")]
        [SerializeField] private string studentId = "23BCE5021";
        [SerializeField] private string studentEmail = "student@vitstudent.ac.in";

        private string idToken = "";
        private string localId = "";

        private void Start()
        {
            StartCoroutine(AuthenticateStudent());
        }

        private IEnumerator AuthenticateStudent()
        {
            // Anonymous or Email Auth via Firebase Identity Toolkit REST API
            string authUrl = $"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={firebaseApiKey}";
            string body = "{\"returnSecureToken\":true}";

            using (UnityWebRequest req = new UnityWebRequest(authUrl, "POST"))
            {
                byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(body);
                req.uploadHandler = new UploadHandlerRaw(bodyRaw);
                req.downloadHandler = new DownloadHandlerBuffer();
                req.SetRequestHeader("Content-Type", "application/json");

                yield return req.SendWebRequest();

                if (req.result == UnityWebRequest.Result.Success)
                {
                    Debug.Log("[Firebase] Student authenticated successfully.");
                }
                else
                {
                    Debug.LogWarning("[Firebase] Running in offline local storage mode.");
                }
            }
        }

        public void UploadQuizScore(string markerId, float percentage, float durationSeconds)
        {
            StartCoroutine(PostFirestoreDocument(markerId, percentage, durationSeconds));
        }

        private IEnumerator PostFirestoreDocument(string markerId, float percentage, float duration)
        {
            string firestoreUrl = $"https://firestore.googleapis.com/v1/projects/{firebaseProjectId}/databases/(default)/documents/student_scores";

            string jsonDocument = $@"
            {{
                ""fields"": {{
                    ""student_id"": {{ ""stringValue"": ""{studentId}"" }},
                    ""marker_id"": {{ ""stringValue"": ""{markerId}"" }},
                    ""score_percentage"": {{ ""doubleValue"": {percentage} }},
                    ""duration_seconds"": {{ ""doubleValue"": {duration} }},
                    ""timestamp"": {{ ""stringValue"": ""{DateTime.UtcNow:o}"" }}
                }}
            }}";

            using (UnityWebRequest req = new UnityWebRequest(firestoreUrl, "POST"))
            {
                byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonDocument);
                req.uploadHandler = new UploadHandlerRaw(bodyRaw);
                req.downloadHandler = new DownloadHandlerBuffer();
                req.SetRequestHeader("Content-Type", "application/json");

                yield return req.SendWebRequest();

                if (req.result == UnityWebRequest.Result.Success)
                {
                    Debug.Log($"[Firebase] Score logged to cloud: {markerId} -> {percentage}%");
                }
                else
                {
                    // Fallback to local PlayerPrefs storage
                    PlayerPrefs.SetFloat($"score_{markerId}", percentage);
                    PlayerPrefs.Save();
                    Debug.Log($"[Firebase Offline] Score saved locally: {markerId} -> {percentage}%");
                }
            }
        }
    }
}
