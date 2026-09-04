using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;
using TMPro;
using UnityEngine.Networking;

namespace EduAR.Backend
{
    [Serializable]
    public class TutorChatPayload
    {
        public string marker_id;
        public string message;
    }

    [Serializable]
    public class TutorChatResponse
    {
        public string reply;
        public List<string> suggestions;
    }

    /// <summary>
    /// Unity AI Tutor REST Client communicating with the Python Flask Backend
    /// Authors: Radhika Agrawal (23BCE5021) & Sara Arora (23BCE5036)
    /// </summary>
    public class AITutorClient : MonoBehaviour
    {
        [Header("Endpoint Configuration")]
        [SerializeField] private string chatApiUrl = "http://localhost:5000/api/chat";

        [Header("Chat UI References")]
        [SerializeField] private GameObject tutorDrawerRoot;
        [SerializeField] private TMP_InputField messageInputField;
        [SerializeField] private Button sendButton;
        [SerializeField] private TextMeshProUGUI chatHistoryText;
        [SerializeField] private TextMeshProUGUI markerContextText;

        private string activeMarkerId = "marker_heart";

        private void Start()
        {
            if (tutorDrawerRoot != null) tutorDrawerRoot.SetActive(false);
            if (sendButton != null) sendButton.onClick.AddListener(OnSendMessage);
        }

        public void OpenTutor(string markerId)
        {
            activeMarkerId = markerId;
            if (tutorDrawerRoot != null) tutorDrawerRoot.SetActive(true);
            if (markerContextText != null) markerContextText.text = $"Context: {markerId.Replace("marker_", "").ToUpper()}";

            AppendMessage("AI Tutor", "Hello! I am your pedagogical guide. Ask me any question regarding this model!");
        }

        public void CloseTutor()
        {
            if (tutorDrawerRoot != null) tutorDrawerRoot.SetActive(false);
        }

        private void OnSendMessage()
        {
            if (string.IsNullOrEmpty(messageInputField.text)) return;

            string query = messageInputField.text;
            messageInputField.text = "";

            AppendMessage("You", query);
            StartCoroutine(SendChatRequest(query));
        }

        private IEnumerator SendChatRequest(string query)
        {
            TutorChatPayload payload = new TutorChatPayload
            {
                marker_id = activeMarkerId,
                message = query
            };

            string json = JsonUtility.ToJson(payload);

            using (UnityWebRequest req = new UnityWebRequest(chatApiUrl, "POST"))
            {
                byte[] body = System.Text.Encoding.UTF8.GetBytes(json);
                req.uploadHandler = new UploadHandlerRaw(body);
                req.downloadHandler = new DownloadHandlerBuffer();
                req.SetRequestHeader("Content-Type", "application/json");

                yield return req.SendWebRequest();

                if (req.result == UnityWebRequest.Result.Success)
                {
                    TutorChatResponse resp = JsonUtility.FromJson<TutorChatResponse>(req.downloadHandler.text);
                    AppendMessage("AI Tutor", resp.reply);
                }
                else
                {
                    AppendMessage("AI Tutor", "Examine the 3D model orientation to understand its physiological or mechanical role!");
                }
            }
        }

        private void AppendMessage(string sender, string msg)
        {
            if (chatHistoryText != null)
            {
                chatHistoryText.text += $"\n<b>{sender}:</b> {msg}\n";
            }
        }
    }
}
