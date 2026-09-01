using Godot;
using System;
using System.Collections.Generic;

namespace Mdg.Client.Godot.Scripts.Audio
{
    public partial class AudioManager : Node
    {
        public static AudioManager Instance { get; private set; } = default!;

        private AudioStreamPlayer? _sfxPlayer;
        private AudioStreamGeneratorPlayback? _generatorPlayback;
        private float _sampleRate = 44100f;
        private float _masterVolume = 1.0f;
        private float _sfxVolume = 1.0f;
        private double _lastHitTime = 0;

        public override void _Ready()
        {
            Instance = this;

            _sfxPlayer = new AudioStreamPlayer();
            var generator = new AudioStreamGenerator
            {
                MixRate = _sampleRate,
                BufferLength = 0.5f
            };

            _sfxPlayer.Stream = generator;
            AddChild(_sfxPlayer);
            _sfxPlayer.Play();
            _generatorPlayback = _sfxPlayer.GetStreamPlayback() as AudioStreamGeneratorPlayback;
        }

        public void PlayTone(float frequency, string waveType, float duration, float gain = 0.15f)
        {
            if (_generatorPlayback == null) return;

            int totalSamples = (int)(_sampleRate * duration);
            int availableFrames = _generatorPlayback.GetFramesAvailable();
            int framesToWrite = Math.Min(totalSamples, availableFrames);

            for (int i = 0; i < framesToWrite; i++)
            {
                float time = i / _sampleRate;
                float progress = (float)i / totalSamples;
                float envelope = 1f - progress; // Linear decay

                float sample = 0f;
                float phase = time * frequency * Mathf.Tau;

                switch (waveType.ToLower())
                {
                    case "sine":
                        sample = MathF.Sin(phase);
                        break;
                    case "square":
                        sample = MathF.Sin(phase) >= 0 ? 1f : -1f;
                        break;
                    case "triangle":
                        sample = MathF.Asin(MathF.Sin(phase)) * (2f / Mathf.Pi);
                        break;
                    case "sawtooth":
                        sample = (float)(2.0 * (time * frequency - Math.Floor(time * frequency + 0.5)));
                        break;
                    default:
                        sample = MathF.Sin(phase);
                        break;
                }

                float finalVolume = sample * envelope * gain * _masterVolume * _sfxVolume;
                _generatorPlayback.PushFrame(new Vector2(finalVolume, finalVolume));
            }
        }

        public void PlayHit(bool isCrit)
        {
            double now = Time.GetTicksMsec();
            if (now - _lastHitTime < 40) return;
            _lastHitTime = now;

            if (isCrit)
            {
                PlayTone(180f, "sawtooth", 0.2f, 0.25f);
            }
            else
            {
                PlayTone(120f, "square", 0.1f, 0.12f);
            }
        }

        public void PlayLootDrop(string rarity)
        {
            if (rarity == "Unique" || rarity == "Rare")
            {
                PlayTone(880f, "sine", 0.35f, 0.2f);
            }
            else
            {
                PlayTone(440f, "triangle", 0.18f, 0.1f);
            }
        }

        public void PlayPickup()
        {
            PlayTone(600f, "sine", 0.15f, 0.15f);
        }

        public void PlayLevelUp()
        {
            PlayTone(523.25f, "triangle", 0.3f, 0.2f);
        }

        public void PlayPortal()
        {
            PlayTone(360f, "sine", 0.3f, 0.18f);
        }
    }
}
