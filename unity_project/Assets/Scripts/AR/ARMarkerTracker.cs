using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.XR.ARFoundation;
using UnityEngine.XR.ARSubsystems;

namespace EduAR.AR
{
    /// <summary>
    /// AR Foundation Image Tracking Controller
    /// Authors: Radhika Agrawal (23BCE5021) & Sara Arora (23BCE5036)
    /// Detects printed flashcards/textbook pages and positions 3D educational models.
    /// </summary>
    [RequireComponent(typeof(ARTrackedImageManager))]
    public class ARMarkerTracker : MonoBehaviour
    {
        [Header("Tracked Prefab Mapping")]
        [SerializeField] private List<MarkerPrefabEntry> markerPrefabs = new List<MarkerPrefabEntry>();

        [Header("Events & References")]
        [SerializeField] private UI.UIManager uiManager;

        private ARTrackedImageManager trackedImageManager;
        private readonly Dictionary<string, GameObject> spawnedPrefabs = new Dictionary<string, GameObject>();
        private string currentActiveMarkerId = "";

        [Serializable]
        public struct MarkerPrefabEntry
        {
            public string markerName; // Matches ReferenceImage name, e.g. "marker_heart"
            public GameObject prefab;
        }

        private void Awake()
        {
            trackedImageManager = GetComponent<ARTrackedImageManager>();
        }

        private void OnEnable()
        {
            trackedImageManager.trackedImagesChanged += OnTrackedImagesChanged;
        }

        private void OnDisable()
        {
            trackedImageManager.trackedImagesChanged -= OnTrackedImagesChanged;
        }

        private void OnTrackedImagesChanged(ARTrackedImagesChangedEventArgs eventArgs)
        {
            // Handle newly detected images
            foreach (var trackedImage in eventArgs.added)
            {
                UpdateTrackedImage(trackedImage);
            }

            // Handle updated positions / tracking state
            foreach (var trackedImage in eventArgs.updated)
            {
                UpdateTrackedImage(trackedImage);
            }

            // Handle removed / lost images
            foreach (var trackedImage in eventArgs.removed)
            {
                string markerName = trackedImage.referenceImage.name;
                if (spawnedPrefabs.ContainsKey(markerName))
                {
                    spawnedPrefabs[markerName].SetActive(false);
                }
            }
        }

        private void UpdateTrackedImage(ARTrackedImage trackedImage)
        {
            string markerName = trackedImage.referenceImage.name;

            // Instantiate prefab if not yet created
            if (!spawnedPrefabs.ContainsKey(markerName))
            {
                var entry = markerPrefabs.Find(e => e.markerName == markerName);
                if (entry.prefab != null)
                {
                    GameObject go = Instantiate(entry.prefab, trackedImage.transform.position, trackedImage.transform.rotation);
                    go.transform.parent = trackedImage.transform;
                    spawnedPrefabs[markerName] = go;
                }
            }

            // Update visibility based on AR tracking state
            if (spawnedPrefabs.TryGetValue(markerName, out GameObject modelInstance))
            {
                bool isTracking = trackedImage.trackingState == TrackingState.Tracking;
                modelInstance.SetActive(isTracking);

                if (isTracking && currentActiveMarkerId != markerName)
                {
                    currentActiveMarkerId = markerName;
                    if (uiManager != null)
                    {
                        uiManager.OnMarkerDetected(markerName);
                    }
                }
            }
        }

        public void ManuallySelectMarker(string markerId)
        {
            currentActiveMarkerId = markerId;
            foreach (var kvp in spawnedPrefabs)
            {
                kvp.Value.SetActive(kvp.Key == markerId);
            }
            if (uiManager != null)
            {
                uiManager.OnMarkerDetected(markerId);
            }
        }
    }
}
