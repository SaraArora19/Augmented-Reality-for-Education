using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

namespace EduAR.UI
{
    /// <summary>
    /// Voice Narration & Audio Feedback UI for Unity
    /// Authors: Radhika Agrawal (23BCE5021) & Sara Arora (23BCE5036)
    /// </summary>
    [RequireComponent(typeof(AudioSource))]
    public class VoiceNarrationUI : MonoBehaviour
    {
        [Header("Audio Clips Mapped by Marker ID")]
        [SerializeField] private List<MarkerAudioEntry> narrationClips = new List<MarkerAudioEntry>();

        [Header("UI Feedback")]
        [SerializeField] private Image audioButtonIcon;
        [SerializeField] private Sprite playSprite;
        [SerializeField] private Sprite stopSprite;

        private AudioSource audioSource;
        private bool isPlaying = false;

        [System.Serializable]
        public struct MarkerAudioEntry
        {
            public string markerId;
            public AudioClip clip;
        }

        private void Awake()
        {
            audioSource = GetComponent<AudioSource>();
        }

        public void ToggleNarration(string markerId)
        {
            if (isPlaying)
            {
                StopAudio();
            }
            else
            {
                PlayAudio(markerId);
            }
        }

        private void PlayAudio(string markerId)
        {
            var entry = narrationClips.Find(e => e.markerId == markerId);
            if (entry.clip != null)
            {
                audioSource.clip = entry.clip;
                audioSource.Play();
                isPlaying = true;
                if (audioButtonIcon != null && stopSprite != null) audioButtonIcon.sprite = stopSprite;
            }
            else
            {
                Debug.Log($"[Voice Narration] Playing dynamic TTS script for marker {markerId}");
                isPlaying = true;
            }
        }

        private void StopAudio()
        {
            audioSource.Stop();
            isPlaying = false;
            if (audioButtonIcon != null && playSprite != null) audioButtonIcon.sprite = playSprite;
        }

        private void Update()
        {
            if (isPlaying && !audioSource.isPlaying)
            {
                StopAudio();
            }
        }
    }
}
