using UnityEngine;
using TMPro;

namespace EduAR.AR
{
    /// <summary>
    /// Interactive 3D Hotspot & Billboarding Annotation
    /// Authors: Radhika Agrawal (23BCE5021) & Sara Arora (23BCE5036)
    /// Displays floating anatomical/mechanical callouts that face the camera and handle taps.
    /// </summary>
    public class HotspotAnnotation : MonoBehaviour
    {
        [Header("Annotation Content")]
        [SerializeField] private string componentTitle;
        [TextArea(2, 4)]
        [SerializeField] private string componentDescription;

        [Header("UI Elements")]
        [SerializeField] private TextMeshPro labelTextMesh;
        [SerializeField] private GameObject pulseRing;

        private Camera mainCamera;

        private void Start()
        {
            mainCamera = Camera.main;
            if (labelTextMesh != null && !string.IsNullOrEmpty(componentTitle))
            {
                labelTextMesh.text = componentTitle;
            }
        }

        private void LateUpdate()
        {
            // Billboarding: Ensure the annotation always faces the AR Camera
            if (mainCamera != null)
            {
                transform.LookAt(transform.position + mainCamera.transform.rotation * Vector3.forward,
                                 mainCamera.transform.rotation * Vector3.up);
            }

            // Subtle pulsing animation on the hotspot marker
            if (pulseRing != null)
            {
                float s = 1.0f + Mathf.Sin(Time.time * 4.0f) * 0.15f;
                pulseRing.transform.localScale = new Vector3(s, s, s);
            }
        }

        private void OnMouseDown()
        {
            // Triggered when student taps this hotspot on screen
            var ui = FindObjectOfType<UI.UIManager>();
            if (ui != null)
            {
                ui.ShowHotspotDetails(componentTitle, componentDescription);
            }
        }
    }
}
