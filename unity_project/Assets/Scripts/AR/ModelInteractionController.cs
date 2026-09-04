using System.Collections.Generic;
using UnityEngine;

namespace EduAR.AR
{
    /// <summary>
    /// Multi-Touch 3D Model Interaction Controller for Android
    /// Authors: Radhika Agrawal (23BCE5021) & Sara Arora (23BCE5036)
    /// Provides 1-finger drag rotation, 2-finger pinch-zoom, and component explosion views.
    /// </summary>
    public class ModelInteractionController : MonoBehaviour
    {
        [Header("Rotation Settings")]
        [SerializeField] private float rotationSpeed = 0.25f;
        [SerializeField] private bool autoRotate = true;
        [SerializeField] private float autoRotateSpeed = 20.0f;

        [Header("Pinch-to-Zoom Settings")]
        [SerializeField] private float minScale = 0.3f;
        [SerializeField] private float maxScale = 3.0f;
        [SerializeField] private float zoomSpeed = 0.005f;

        [Header("Explode View Settings")]
        [SerializeField] private float explodeFactor = 1.5f;
        [SerializeField] private float explodeLerpSpeed = 5.0f;

        private bool isExploded = false;
        private readonly List<Transform> childComponents = new List<Transform>();
        private readonly List<Vector3> originalPositions = new List<Vector3>();

        private Vector2 previousTouchPos;

        private void Start()
        {
            RecordOriginalHierarchy();
        }

        private void RecordOriginalHierarchy()
        {
            childComponents.Clear();
            originalPositions.Clear();

            for (int i = 0; i < transform.childCount; i++)
            {
                Transform child = transform.GetChild(i);
                childComponents.Add(child);
                originalPositions.Add(child.localPosition);
            }
        }

        private void Update()
        {
            HandleTouchInput();
            HandleExplodeAnimation();

            if (autoRotate && Input.touchCount == 0 && !Input.GetMouseButton(0))
            {
                transform.Rotate(Vector3.up, autoRotateSpeed * Time.deltaTime, Space.World);
            }
        }

        private void HandleTouchInput()
        {
            // Single-touch: 3D Orbit Rotation
            if (Input.touchCount == 1)
            {
                Touch touch = Input.GetTouch(0);

                if (touch.phase == TouchPhase.Moved)
                {
                    float deltaX = touch.deltaPosition.x * rotationSpeed;
                    float deltaY = touch.deltaPosition.y * rotationSpeed;

                    transform.Rotate(Vector3.up, -deltaX, Space.World);
                    transform.Rotate(Vector3.right, deltaY, Space.World);
                }
            }
            // Dual-touch: Pinch-to-Zoom
            else if (Input.touchCount == 2)
            {
                Touch touchZero = Input.GetTouch(0);
                Touch touchOne = Input.GetTouch(1);

                Vector2 touchZeroPrevPos = touchZero.position - touchZero.deltaPosition;
                Vector2 touchOnePrevPos = touchOne.position - touchOne.deltaPosition;

                float prevTouchDeltaMag = (touchZeroPrevPos - touchOnePrevPos).magnitude;
                float touchDeltaMag = (touchZero.position - touchOne.position).magnitude;

                float deltaMagnitudeDiff = touchDeltaMag - prevTouchDeltaMag;

                Vector3 newScale = transform.localScale + Vector3.one * (deltaMagnitudeDiff * zoomSpeed);
                float clampedScale = Mathf.Clamp(newScale.x, minScale, maxScale);
                transform.localScale = Vector3.one * clampedScale;
            }
        }

        private void HandleExplodeAnimation()
        {
            for (int i = 0; i < childComponents.Count; i++)
            {
                Vector3 target = isExploded ? originalPositions[i] * explodeFactor : originalPositions[i];
                childComponents[i].localPosition = Vector3.Lerp(
                    childComponents[i].localPosition,
                    target,
                    Time.deltaTime * explodeLerpSpeed
                );
            }
        }

        public void ToggleAutoRotate()
        {
            autoRotate = !autoRotate;
        }

        public void ToggleExplodeView()
        {
            isExploded = !isExploded;
        }

        public void ResetModelTransform()
        {
            transform.localScale = Vector3.one;
            transform.localRotation = Quaternion.identity;
            isExploded = false;
        }
    }
}
