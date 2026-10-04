import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, ArrowRight, Sparkles } from 'lucide-react';

export default function IntroSplash() {
  const [isOpen, setIsOpen] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    // Check if user already dismissed intro in this browser tab session
    const seen = sessionStorage.getItem('nanneram_intro_played');
    if (seen === 'true') {
      setIsOpen(false);
      return;
    }

    // Attempt video playback
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback if browser blocks sound autoplay: ensure muted and retry
          if (videoRef.current) {
            videoRef.current.muted = true;
            setIsMuted(true);
            videoRef.current.play().catch(() => {});
          }
        });
      }
    }
  }, []);

  const handleFinish = () => {
    setIsFading(true);
    sessionStorage.setItem('nanneram_intro_played', 'true');
    setTimeout(() => {
      setIsOpen(false);
    }, 700);
  };

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      className={`intro-splash-overlay ${isFading ? 'intro-fading' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome video"
    >
      {/* Atmospheric blurred ambient backdrop */}
      <div className="intro-ambient-bg" aria-hidden="true">
        <video
          src="/assets/video/intro-video.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      <div className="intro-inner">
        {/* Cinematic Video Card */}
        <div className="intro-video-wrapper">
          <video
            ref={videoRef}
            className="intro-video"
            src="/assets/video/intro-video.mp4"
            poster="/assets/video/intro-poster.png"
            autoPlay
            playsInline
            muted={isMuted}
            preload="auto"
            onEnded={handleFinish}
          />
        </div>

        {/* Action Controls & Skip */}
        <div className="intro-actions">
          <button
            type="button"
            className="intro-ctrl-btn sound-btn"
            onClick={toggleSound}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
            <span>{isMuted ? 'Unmute' : 'Mute'}</span>
          </button>

          <button
            type="button"
            className="intro-ctrl-btn skip-btn"
            onClick={handleFinish}
            title="Enter Nanneram"
          >
            <span>Enter Website</span>
            <ArrowRight size={17} />
          </button>
        </div>

        {/* Subtle Sacred Footer Tagline */}
        <div className="intro-kicker">
          <Sparkles size={14} className="intro-sparkle" />
          <span>Sri Venkateswara · Lord of Time & Auspicious Beginnings</span>
        </div>
      </div>
    </aside>
  );
}
