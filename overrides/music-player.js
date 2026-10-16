/* Local soundtrack player. Audio remains private under .source/assets and is
 * never embedded in the public HTML or committed to GitHub. */
(() => {
  'use strict';
  const player = document.getElementById('dan-media-player');
  const audio = document.getElementById('dan-media-audio');
  if (!player || !audio) return;

  // GitHub Pages cannot access the Git-ignored private soundtrack. Hide the
  // local-only player there rather than showing a broken control or 404.
  const local = location.protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  if (!local) return;

  const toggle = document.getElementById('dan-media-toggle');
  const collapse = document.getElementById('dan-media-collapse');
  const mute = document.getElementById('dan-media-mute');
  const progress = document.getElementById('dan-media-seek');
  const volume = document.getElementById('dan-media-volume');
  const current = document.getElementById('dan-media-current');
  const duration = document.getElementById('dan-media-duration');
  const status = document.getElementById('dan-media-status');
  const audioPath = './.source/assets/The Dark Knight Main Theme - Hans Zimmer.mp3';
  let attemptedFirstGesture = false;
  let trackMissing = false;

  const format = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return '--:--';
    const total = Math.floor(seconds);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
  };

  const setStatus = (value) => { status.textContent = value; };
  const refresh = () => {
    const playing = !audio.paused && !audio.ended;
    player.classList.toggle('is-playing', playing);
    toggle.setAttribute('aria-label', playing ? 'Pause background music' : 'Play background music');
    toggle.setAttribute('aria-pressed', String(playing));
    mute.setAttribute('aria-pressed', String(audio.muted || audio.volume === 0));
    mute.setAttribute('aria-label', audio.muted || audio.volume === 0 ? 'Unmute music' : 'Mute music');
    const hasDuration = Number.isFinite(audio.duration) && audio.duration > 0;
    current.textContent = format(audio.currentTime);
    duration.textContent = hasDuration ? format(audio.duration) : '--:--';
    const percent = hasDuration ? Math.min(100, audio.currentTime / audio.duration * 100) : 0;
    progress.value = String(percent * 10);
    progress.style.setProperty('--dm-progress', `${percent}%`);
  };

  async function tryPlay() {
    if (trackMissing || !audio.paused) return;
    try {
      await audio.play();
      setStatus('NOW PLAYING · LOOP ON');
      refresh();
    } catch (error) {
      if (error?.name === 'NotAllowedError') setStatus('TAP PLAY TO ENABLE AUDIO');
      else if (!trackMissing) setStatus('PRESS PLAY TO START');
    }
  }

  const resumeOnGesture = (event) => {
    if (attemptedFirstGesture || event.target?.closest?.('#dan-media-player') || !audio.paused) return;
    attemptedFirstGesture = true;
    tryPlay();
    document.removeEventListener('pointerdown', resumeOnGesture, true);
    document.removeEventListener('keydown', resumeOnGesture, true);
  };

  toggle.addEventListener('click', () => {
    if (audio.paused) tryPlay();
    else audio.pause();
  });

  collapse.addEventListener('click', () => {
    const reduced = player.classList.toggle('is-collapsed');
    collapse.textContent = reduced ? '+' : '−';
    collapse.setAttribute('aria-label', reduced ? 'Expand music player' : 'Minimize music player');
    collapse.setAttribute('aria-expanded', String(!reduced));
  });

  mute.addEventListener('click', () => {
    audio.muted = !audio.muted;
    refresh();
  });

  volume.addEventListener('input', () => {
    audio.volume = Number(volume.value) / 100;
    audio.muted = audio.volume === 0;
    volume.style.setProperty('--dm-progress', `${volume.value}%`);
    refresh();
  });

  progress.addEventListener('input', () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = Number(progress.value) / 1000 * audio.duration;
      refresh();
    }
  });

  audio.addEventListener('loadedmetadata', refresh);
  audio.addEventListener('timeupdate', refresh);
  audio.addEventListener('durationchange', refresh);
  audio.addEventListener('play', () => { setStatus('NOW PLAYING · LOOP ON'); refresh(); });
  audio.addEventListener('pause', () => { if (!trackMissing) setStatus('PAUSED · LOOP ON'); refresh(); });
  audio.addEventListener('volumechange', refresh);
  audio.addEventListener('error', () => {
    trackMissing = true;
    setStatus('MUSIC FILE NOT FOUND');
    toggle.disabled = true;
  });

  audio.preload = 'metadata';
  audio.autoplay = true;
  audio.loop = true;
  audio.volume = .45;
  audio.src = new URL(audioPath, document.baseURI).href;
  // Keep the interactive GERWIN canvas and portfolio content accessible on
  // narrow screens; the player can be expanded with one tap on the + button.
  if (window.matchMedia('(max-width: 520px)').matches) {
    player.classList.add('is-collapsed');
    collapse.textContent = '+';
    collapse.setAttribute('aria-label', 'Expand music player');
    collapse.setAttribute('aria-expanded', 'false');
  }
  player.hidden = false;
  volume.value = '45';
  volume.style.setProperty('--dm-progress', '45%');
  refresh();

  document.addEventListener('pointerdown', resumeOnGesture, true);
  document.addEventListener('keydown', resumeOnGesture, true);
  tryPlay();
})();
