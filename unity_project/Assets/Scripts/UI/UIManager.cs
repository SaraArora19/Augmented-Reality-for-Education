using UnityEngine;
using UnityEngine.UI;
using TMPro;

namespace EduAR.UI
{
    /// <summary>
    /// Master UI Manager for Unity AR Application
    /// Authors: Radhika Agrawal (23BCE5021) & Sara Arora (23BCE5036)
    /// </summary>
    public class UIManager : MonoBehaviour
    {
        [Header("HUD Panels")]
        [SerializeField] private GameObject hudRoot;
        [SerializeField] private GameObject infoCardPanel;
        [SerializeField] private GameObject hotspotDialog;

        [Header("HUD Text Labels")]
        [SerializeField] private TextMeshProUGUI activeModuleText;
        [SerializeField] private TextMeshProUGUI trackingStatusText;
        [SerializeField] private TextMeshProUGUI hotspotTitleText;
        [SerializeField] private TextMeshProUGUI hotspotDescText;

        [Header("Action Buttons")]
        [SerializeField] private Button quizLaunchButton;
        [SerializeField] private Button aiTutorLaunchButton;
        [SerializeField] private Button voiceGuideButton;
        [SerializeField] private Button closeHotspotButton;

        [Header("Subsystem References")]
        [SerializeField] private Quiz.QuizManager quizManager;
        [SerializeField] private Backend.AITutorClient aiTutorClient;
        [SerializeField] private VoiceNarrationUI voiceNarrationUI;

        private string currentMarkerId = "marker_heart";

        private void Start()
        {
            if (quizLaunchButton != null)
                quizLaunchButton.onClick.AddListener(() => quizManager.StartQuiz(currentMarkerId));

            if (aiTutorLaunchButton != null)
                aiTutorLaunchButton.onClick.AddListener(() => aiTutorClient.OpenTutor(currentMarkerId));

            if (voiceGuideButton != null)
                voiceGuideButton.onClick.AddListener(() => voiceNarrationUI.ToggleNarration(currentMarkerId));

            if (closeHotspotButton != null)
                closeHotspotButton.onClick.AddListener(() => hotspotDialog.SetActive(false));

            if (hotspotDialog != null) hotspotDialog.SetActive(false);
        }

        public void OnMarkerDetected(string markerId)
        {
            currentMarkerId = markerId;

            if (trackingStatusText != null)
                trackingStatusText.text = $"Tracking: {markerId.Replace("marker_", "").ToUpper()}";

            if (activeModuleText != null)
                activeModuleText.text = markerId.Replace("marker_", "").ToUpper();
        }

        public void ShowHotspotDetails(string title, string description)
        {
            if (hotspotDialog != null)
            {
                hotspotDialog.SetActive(true);
                if (hotspotTitleText != null) hotspotTitleText.text = title;
                if (hotspotDescText != null) hotspotDescText.text = description;
            }
        }
    }
}
