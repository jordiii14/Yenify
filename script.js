/**
 * ==========================================================================
 * YENIFY — Music Streaming Web Application (Phase 3: Complete JavaScript)
 * Architecture: Modular state management, robust audio engine event synchronization,
 * rotating vinyl player synchronization, real-time search, local storage, & accessibility.
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  /* ==========================================================================
     1. APPLICATION STATE & DATA CATALOGUE (Strict Asset Paths)
     ========================================================================== */
  const state = {
    currentIndex: 0,
    isPlaying: false,
    isShuffle: false,
    repeatMode: 'off', // 'off' | 'all' | 'one'
    volume: 0.8,
    isMuted: false,
    previousVolume: 0.8,
    currentView: 'all', // 'all' | 'explore' | 'liked' | 'recent'
    searchQuery: '',
    likedTracks: JSON.parse(localStorage.getItem('yenify_liked_tracks')) || [],
    recentTracks: JSON.parse(localStorage.getItem('yenify_recent_tracks')) || []
  };

  const tracks = [
    {
      id: 0,
      title: 'Risk It All',
      artist: 'Bruno Mars',
      album: 'Silk & Neon Sessions',
      genre: 'R&B / Soul',
      audio: 'assets/audio/risk-it-all.mp3',
      cover: 'assets/images/risk-it-all-cover.jpg',
      duration: 0
    },
    {
      id: 1,
      title: 'Na Para Bang',
      artist: 'Mariah Deborah',
      album: 'OPM Acoustic Feels',
      genre: 'OPM Pop',
      audio: 'assets/audio/na-para-bang.mp3',
      cover: 'assets/images/na-para-bang-cover.jpg',
      duration: 0
    },
    {
      id: 2,
      title: 'Here With Me',
      artist: 'd4vd',
      album: 'Late Night Indie Ballads',
      genre: 'Indie / Alternative',
      audio: 'assets/audio/here-with-me.mp3',
      cover: 'assets/images/here-with-me-cover.jpg',
      duration: 0
    }
  ];

  /* ==========================================================================
     2. DOM ELEMENT REFERENCES
     ========================================================================== */
  const audio = document.getElementById('audioPlayer');

  // Navigation & Sidebar
  const sidebar = document.getElementById('sidebar');
  const sidebarBackdrop = document.getElementById('sidebarBackdrop');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');

  // Navigation View Buttons
  const navHomeBtn = document.getElementById('navHomeBtn');
  const navExploreBtn = document.getElementById('navExploreBtn');
  const navLikedBtn = document.getElementById('navLikedBtn');
  const navRecentBtn = document.getElementById('navRecentBtn');
  const tabAll = document.getElementById('tabAll');
  const tabLiked = document.getElementById('tabLiked');
  const tabRecent = document.getElementById('tabRecent');

  // Search Elements
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const resultsSummary = document.getElementById('resultsSummary');
  const emptyState = document.getElementById('emptyState');
  const resetFilterBtn = document.getElementById('resetFilterBtn');

  // Hero Section
  const featuredHeading = document.getElementById('featuredHeading');
  const heroArtwork = document.getElementById('heroArtwork');
  const heroArtist = document.getElementById('heroArtist');
  const heroAlbum = document.getElementById('heroAlbum');
  const heroDescription = document.getElementById('heroDescription');
  const heroPlayBtn = document.getElementById('heroPlayBtn');
  const heroPlayBtnText = document.getElementById('heroPlayBtnText');
  const heroLikeBtn = document.getElementById('heroLikeBtn');

  // Rotating Vinyl Showcase Elements
  const vinylShowcaseCard = document.querySelector('.vinyl-showcase-card');
  const vinylDisc = document.getElementById('vinylDisc');
  const vinylLabelImg = document.getElementById('vinylLabelImg');
  const vinylSongTitle = document.getElementById('vinylSongTitle');
  const vinylArtistName = document.getElementById('vinylArtistName');

  // Player Bar Elements
  const playerCover = document.getElementById('playerCover');
  const playerTitle = document.getElementById('playerTitle');
  const playerArtist = document.getElementById('playerArtist');
  const playerLikeBtn = document.getElementById('playerLikeBtn');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const shuffleBtn = document.getElementById('shuffleBtn');
  const repeatBtn = document.getElementById('repeatBtn');
  const progressBar = document.getElementById('progressBar');
  const currentTimeLabel = document.getElementById('currentTime');
  const totalDurationLabel = document.getElementById('totalDuration');
  const volumeSlider = document.getElementById('volumeSlider');
  const muteBtn = document.getElementById('muteBtn');
  const audioErrorMsg = document.getElementById('audioErrorMsg');
  const playbackStatusPill = document.getElementById('playbackStatusPill');

  // Sidebar Now Playing & Badges
  const sidebarNpTitle = document.getElementById('sidebarNpTitle');
  const sidebarNpArtist = document.getElementById('sidebarNpArtist');
  const likedCountBadge = document.getElementById('likedCountBadge');
  const recentCountBadge = document.getElementById('recentCountBadge');
  const allTracksCount = document.getElementById('allTracksCount');
  const likedTabCount = document.getElementById('likedTabCount');
  const recentTabCount = document.getElementById('recentTabCount');

  // Containers
  const musicGrid = document.getElementById('musicGrid');
  const tracklistBody = document.getElementById('tracklistBody');
  const recentList = document.getElementById('recentList');
  const clearRecentBtn = document.getElementById('clearRecentBtn');

  /* ==========================================================================
     3. INITIALIZATION & STORAGE SYNCHRONIZATION
     ========================================================================== */
  function initApp() {
    audio.volume = state.volume;
    volumeSlider.value = state.volume;
    updateLikeButtonsUI();
    updateBadges();
    renderRecentList();
    filterAndRenderContent();

    // Load initial track metadata without autoplay
    loadTrack(state.currentIndex, false);
  }

  function persistState() {
    localStorage.setItem('yenify_liked_tracks', JSON.stringify(state.likedTracks));
    localStorage.setItem('yenify_recent_tracks', JSON.stringify(state.recentTracks));
  }

  /* ==========================================================================
     4. AUDIO ENGINE & ROTATING VINYL SYNCHRONIZATION
     ========================================================================== */
  function loadTrack(index, shouldPlay = true) {
    if (index < 0 || index >= tracks.length) return;
    state.currentIndex = index;
    const track = tracks[index];

    audio.src = track.audio;
    audio.load();

    // Update Player & Header UI
    playerCover.src = track.cover;
    playerTitle.textContent = track.title;
    playerArtist.textContent = track.artist;
    sidebarNpTitle.textContent = track.title;
    sidebarNpArtist.textContent = track.artist;

    // Update Rotating Vinyl Showcase UI
    vinylLabelImg.src = track.cover;
    vinylSongTitle.textContent = track.title;
    vinylArtistName.textContent = track.artist;

    updatePlayerLikeButtonState();
    updateActiveRowAndCardUI();

    if (shouldPlay) {
      playAudio();
    } else {
      pauseAudio();
      playbackStatusPill.textContent = 'Ready to Stream';
    }
  }

  function playAudio() {
    audio.play().then(() => {
      state.isPlaying = true;
      updatePlayPauseUI(true);
      playbackStatusPill.textContent = 'Now Playing';
      addToRecentlyPlayed(state.currentIndex);
    }).catch(err => {
      console.warn('Playback prevented or file missing:', err);
      state.isPlaying = false;
      updatePlayPauseUI(false);
      audioErrorMsg.textContent = 'Audio file missing';
      playbackStatusPill.textContent = 'Playback Error';
    });
  }

  function pauseAudio() {
    audio.pause();
    state.isPlaying = false;
    updatePlayPauseUI(false);
    playbackStatusPill.textContent = 'Paused';
  }

  function togglePlayPause() {
    if (audio.paused) {
      playAudio();
    } else {
      pauseAudio();
    }
  }

  function updatePlayPauseUI(isPlaying) {
    if (isPlaying) {
      playPauseBtn.classList.add('is-playing');
      playPauseBtn.setAttribute('aria-label', 'Pause');
      vinylDisc.classList.add('rotating');
      if (vinylShowcaseCard) vinylShowcaseCard.classList.add('playing');
    } else {
      playPauseBtn.classList.remove('is-playing');
      playPauseBtn.setAttribute('aria-label', 'Play');
      vinylDisc.classList.remove('rotating');
      if (vinylShowcaseCard) vinylShowcaseCard.classList.remove('playing');
    }

    updateActiveRowAndCardUI();
  }

  function playNextTrack() {
    if (state.isShuffle) {
      let nextIdx;
      do {
        nextIdx = Math.floor(Math.random() * tracks.length);
      } while (nextIdx === state.currentIndex && tracks.length > 1);
      loadTrack(nextIdx, true);
    } else {
      const nextIdx = (state.currentIndex + 1) % tracks.length;
      loadTrack(nextIdx, true);
    }
  }

  function playPrevTrack() {
    if (audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const prevIdx = (state.currentIndex - 1 + tracks.length) % tracks.length;
    loadTrack(prevIdx, true);
  }

  function toggleShuffle() {
    state.isShuffle = !state.isShuffle;
    shuffleBtn.classList.toggle('active', state.isShuffle);
    shuffleBtn.setAttribute('aria-pressed', state.isShuffle);
    playbackStatusPill.textContent = state.isShuffle ? 'Shuffle: On' : 'Shuffle: Off';
  }

  function toggleRepeat() {
    if (state.repeatMode === 'off') {
      state.repeatMode = 'all';
      repeatBtn.setAttribute('data-repeat-mode', 'all');
      repeatBtn.classList.add('active');
      repeatBtn.setAttribute('aria-pressed', 'true');
      repeatBtn.title = 'Repeat: All';
      playbackStatusPill.textContent = 'Repeat: All';
    } else if (state.repeatMode === 'all') {
      state.repeatMode = 'one';
      repeatBtn.setAttribute('data-repeat-mode', 'one');
      repeatBtn.title = 'Repeat: One';
      playbackStatusPill.textContent = 'Repeat: One';
    } else {
      state.repeatMode = 'off';
      repeatBtn.setAttribute('data-repeat-mode', 'off');
      repeatBtn.classList.remove('active');
      repeatBtn.setAttribute('aria-pressed', 'false');
      repeatBtn.title = 'Repeat: Off';
      playbackStatusPill.textContent = 'Repeat: Off';
    }
  }

  /* ==========================================================================
     5. TIME FORMATTING & SEEKING
     ========================================================================== */
  function formatTime(seconds) {
    if (isNaN(seconds) || seconds === 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  audio.addEventListener('loadedmetadata', () => {
    const dur = audio.duration;
    tracks[state.currentIndex].duration = dur;
    totalDurationLabel.textContent = formatTime(dur);

    const cardDurEl = document.querySelector(`[data-duration-id="${state.currentIndex}"]`);
    if (cardDurEl) cardDurEl.textContent = formatTime(dur);

    const rowDurEl = document.querySelector(`[data-row-duration-id="${state.currentIndex}"]`);
    if (rowDurEl) rowDurEl.textContent = formatTime(dur);

    audioErrorMsg.textContent = '';
  });

  audio.addEventListener('timeupdate', () => {
    if (!audio.duration) return;
    const progressPercent = (audio.currentTime / audio.duration) * 100;
    progressBar.value = progressPercent;
    currentTimeLabel.textContent = formatTime(audio.currentTime);
  });

  audio.addEventListener('ended', () => {
    if (state.repeatMode === 'one') {
      audio.currentTime = 0;
      playAudio();
    } else if (state.repeatMode === 'all' || state.currentIndex < tracks.length - 1) {
      playNextTrack();
    } else {
      pauseAudio();
      audio.currentTime = 0;
    }
  });

  audio.addEventListener('error', (e) => {
    console.warn('Audio element error:', e);
    audioErrorMsg.textContent = 'Audio file missing';
    playbackStatusPill.textContent = 'Error';
  });

  progressBar.addEventListener('input', (e) => {
    if (!audio.duration) return;
    const seekTime = (e.target.value / 100) * audio.duration;
    audio.currentTime = seekTime;
  });

  /* ==========================================================================
     6. VOLUME & MUTE CONTROLS
     ========================================================================== */
  volumeSlider.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    state.volume = val;
    audio.volume = val;
    if (val === 0) {
      state.isMuted = true;
      muteBtn.classList.add('is-muted');
      muteBtn.setAttribute('aria-pressed', 'true');
    } else {
      state.isMuted = false;
      muteBtn.classList.remove('is-muted');
      muteBtn.setAttribute('aria-pressed', 'false');
      state.previousVolume = val;
    }
  });

  muteBtn.addEventListener('click', () => {
    state.isMuted = !state.isMuted;
    if (state.isMuted) {
      state.previousVolume = audio.volume;
      audio.volume = 0;
      volumeSlider.value = 0;
      muteBtn.classList.add('is-muted');
      muteBtn.setAttribute('aria-pressed', 'true');
      playbackStatusPill.textContent = 'Muted';
    } else {
      audio.volume = state.previousVolume || 0.8;
      volumeSlider.value = audio.volume;
      muteBtn.classList.remove('is-muted');
      muteBtn.setAttribute('aria-pressed', 'false');
      playbackStatusPill.textContent = 'Volume Restored';
    }
  });

  /* ==========================================================================
     7. LIKED SONGS & RECENTLY PLAYED MANAGEMENT
     ========================================================================== */
  function toggleLike(trackId) {
    const id = parseInt(trackId, 10);
    const index = state.likedTracks.indexOf(id);

    if (index === -1) {
      state.likedTracks.push(id);
      playbackStatusPill.textContent = 'Added to Liked Songs';
    } else {
      state.likedTracks.splice(index, 1);
      playbackStatusPill.textContent = 'Removed from Liked Songs';
    }

    persistState();
    updateLikeButtonsUI();
    updateBadges();

    if (state.currentView === 'liked') {
      filterAndRenderContent();
    }
  }

  function updateLikeButtonsUI() {
    document.querySelectorAll('[data-action="toggle-like"]').forEach(btn => {
      const tid = parseInt(btn.getAttribute('data-track-id'), 10);
      const isLiked = state.likedTracks.includes(tid);
      if (isLiked) {
        btn.classList.add('liked');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('liked');
        btn.setAttribute('aria-pressed', 'false');
      }
    });

    updatePlayerLikeButtonState();
  }

  function updatePlayerLikeButtonState() {
    const currentTrackId = tracks[state.currentIndex].id;
    const isLiked = state.likedTracks.includes(currentTrackId);
    if (isLiked) {
      playerLikeBtn.classList.add('liked');
      playerLikeBtn.setAttribute('aria-pressed', 'true');
      heroLikeBtn.classList.add('liked');
      heroLikeBtn.setAttribute('aria-pressed', 'true');
      heroLikeBtn.querySelector('span:last-child').textContent = 'Saved in Liked';
    } else {
      playerLikeBtn.classList.remove('liked');
      playerLikeBtn.setAttribute('aria-pressed', 'false');
      heroLikeBtn.classList.remove('liked');
      heroLikeBtn.setAttribute('aria-pressed', 'false');
      heroLikeBtn.querySelector('span:last-child').textContent = 'Save to Liked';
    }
  }

  function addToRecentlyPlayed(trackId) {
    const id = parseInt(trackId, 10);
    state.recentTracks = state.recentTracks.filter(item => item !== id);
    state.recentTracks.unshift(id);

    if (state.recentTracks.length > 10) {
      state.recentTracks.pop();
    }

    persistState();
    updateBadges();
    renderRecentList();
  }

  function renderRecentList() {
    recentList.innerHTML = '';
    if (state.recentTracks.length === 0) {
      const placeholder = document.createElement('p');
      placeholder.className = 'recent-placeholder';
      placeholder.id = 'recentPlaceholder';
      placeholder.textContent = 'Start playing any track to build your Recently Played history.';
      recentList.appendChild(placeholder);
      clearRecentBtn.hidden = true;
      return;
    }

    clearRecentBtn.hidden = false;
    state.recentTracks.forEach(id => {
      const track = tracks.find(t => t.id === id);
      if (!track) return;

      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'recent-chip';
      chip.setAttribute('data-track-id', track.id);
      chip.innerHTML = `
        <img src="${track.cover}" alt="${track.title}" class="recent-chip-cover" />
        <div class="recent-chip-info">
          <p class="recent-chip-title">${track.title}</p>
          <p class="recent-chip-artist">${track.artist}</p>
        </div>
      `;

      chip.addEventListener('click', () => {
        loadTrack(track.id, true);
      });

      recentList.appendChild(chip);
    });
  }

  clearRecentBtn.addEventListener('click', () => {
    state.recentTracks = [];
    persistState();
    renderRecentList();
    updateBadges();
    playbackStatusPill.textContent = 'Listening history cleared';
  });

  function updateBadges() {
    likedCountBadge.textContent = state.likedTracks.length;
    recentCountBadge.textContent = state.recentTracks.length;
    likedTabCount.textContent = state.likedTracks.length;
    recentTabCount.textContent = state.recentTracks.length;
    allTracksCount.textContent = tracks.length;
  }

  /* ==========================================================================
     8. SEARCH, FILTERING & VIEW NAVIGATION
     ========================================================================== */
  function filterAndRenderContent() {
    const query = state.searchQuery.toLowerCase().trim();
    const currentView = state.currentView;

    let filtered = tracks.filter(track => {
      const matchesSearch =
        track.title.toLowerCase().includes(query) ||
        track.artist.toLowerCase().includes(query) ||
        track.genre.toLowerCase().includes(query) ||
        track.album.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (currentView === 'liked') {
        return state.likedTracks.includes(track.id);
      }
      if (currentView === 'recent') {
        return state.recentTracks.includes(track.id);
      }
      return true;
    });

    const cardElements = musicGrid.querySelectorAll('.music-card');
    let visibleCardsCount = 0;

    cardElements.forEach(card => {
      const tid = parseInt(card.getAttribute('data-track-id'), 10);
      const isMatch = filtered.some(t => t.id === tid);
      if (isMatch) {
        card.hidden = false;
        visibleCardsCount++;
      } else {
        card.hidden = true;
      }
    });

    const rowElements = tracklistBody.querySelectorAll('.track-row');
    rowElements.forEach(row => {
      const tid = parseInt(row.getAttribute('data-track-id'), 10);
      const isMatch = filtered.some(t => t.id === tid);
      if (isMatch) {
        row.hidden = false;
      } else {
        row.hidden = true;
      }
    });

    if (visibleCardsCount === 0) {
      emptyState.hidden = false;
    } else {
      emptyState.hidden = true;
    }

    resultsSummary.textContent = `Showing ${visibleCardsCount} of ${tracks.length} tracks`;
  }

  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    searchClearBtn.hidden = state.searchQuery.length === 0;
    filterAndRenderContent();
  });

  searchClearBtn.addEventListener('click', () => {
    searchInput.value = '';
    state.searchQuery = '';
    searchClearBtn.hidden = true;
    filterAndRenderContent();
    searchInput.focus();
  });

  resetFilterBtn.addEventListener('click', () => {
    searchInput.value = '';
    state.searchQuery = '';
    state.currentView = 'all';
    searchClearBtn.hidden = true;
    setActiveViewTab('all');
    filterAndRenderContent();
  });

  function setActiveViewTab(view) {
    state.currentView = view;

    [navHomeBtn, navExploreBtn, navLikedBtn, navRecentBtn].forEach(btn => {
      btn.classList.remove('active');
      btn.removeAttribute('aria-current');
    });

    [tabAll, tabLiked, tabRecent].forEach(tab => {
      tab.classList.remove('active');
      tab.setAttribute('aria-selected', 'false');
    });

    if (view === 'all' || view === 'explore') {
      navHomeBtn.classList.add('active');
      navHomeBtn.setAttribute('aria-current', 'page');
      tabAll.classList.add('active');
      tabAll.setAttribute('aria-selected', 'true');
    } else if (view === 'liked') {
      navLikedBtn.classList.add('active');
      navLikedBtn.setAttribute('aria-current', 'page');
      tabLiked.classList.add('active');
      tabLiked.setAttribute('aria-selected', 'true');
    } else if (view === 'recent') {
      navRecentBtn.classList.add('active');
      navRecentBtn.setAttribute('aria-current', 'page');
      tabRecent.classList.add('active');
      tabRecent.setAttribute('aria-selected', 'true');
    }

    filterAndRenderContent();
  }

  navHomeBtn.addEventListener('click', () => setActiveViewTab('all'));
  navExploreBtn.addEventListener('click', () => setActiveViewTab('explore'));
  navLikedBtn.addEventListener('click', () => setActiveViewTab('liked'));
  navRecentBtn.addEventListener('click', () => setActiveViewTab('recent'));

  tabAll.addEventListener('click', () => setActiveViewTab('all'));
  tabLiked.addEventListener('click', () => setActiveViewTab('liked'));
  tabRecent.addEventListener('click', () => setActiveViewTab('recent'));

  /* ==========================================================================
     9. UI SYNCHRONIZATION & ACTIVE STATE HIGHLIGHTS
     ========================================================================== */
  function updateActiveRowAndCardUI() {
    const currentTrackId = state.currentIndex;

    document.querySelectorAll('.music-card').forEach(card => {
      const tid = parseInt(card.getAttribute('data-track-id'), 10);
      if (tid === currentTrackId) {
        card.classList.add('active-track');
        if (state.isPlaying) {
          card.classList.add('is-playing');
        } else {
          card.classList.remove('is-playing');
        }
      } else {
        card.classList.remove('active-track', 'is-playing');
      }
    });

    document.querySelectorAll('.track-row').forEach(row => {
      const tid = parseInt(row.getAttribute('data-track-id'), 10);
      if (tid === currentTrackId) {
        row.classList.add('active-track');
        if (state.isPlaying) {
          row.classList.add('is-playing');
        } else {
          row.classList.remove('is-playing');
        }
      } else {
        row.classList.remove('active-track', 'is-playing');
      }
    });

    if (currentTrackId === 0 && state.isPlaying) {
      heroPlayBtnText.textContent = 'Pause Featured';
    } else {
      heroPlayBtnText.textContent = 'Play Featured';
    }
  }

  /* ==========================================================================
     10. EVENT DELEGATION & GLOBAL INTERACTION BINDINGS
     ========================================================================== */
  playPauseBtn.addEventListener('click', togglePlayPause);
  nextBtn.addEventListener('click', playNextTrack);
  prevBtn.addEventListener('click', playPrevTrack);
  shuffleBtn.addEventListener('click', toggleShuffle);
  repeatBtn.addEventListener('click', toggleRepeat);

  heroPlayBtn.addEventListener('click', () => {
    const tid = parseInt(heroPlayBtn.getAttribute('data-track-id'), 10);
    if (state.currentIndex === tid) {
      togglePlayPause();
    } else {
      loadTrack(tid, true);
    }
  });

  heroLikeBtn.addEventListener('click', () => {
    const tid = parseInt(heroLikeBtn.getAttribute('data-track-id'), 10);
    toggleLike(tid);
  });

  playerLikeBtn.addEventListener('click', () => {
    const tid = tracks[state.currentIndex].id;
    toggleLike(tid);
  });

  document.addEventListener('click', (e) => {
    const playTrigger = e.target.closest('[data-action="play-track"]');
    if (playTrigger) {
      e.stopPropagation();
      const tid = parseInt(playTrigger.getAttribute('data-track-id'), 10);
      if (state.currentIndex === tid) {
        togglePlayPause();
      } else {
        loadTrack(tid, true);
      }
      return;
    }

    const likeTrigger = e.target.closest('[data-action="toggle-like"]');
    if (likeTrigger) {
      e.stopPropagation();
      const tid = parseInt(likeTrigger.getAttribute('data-track-id'), 10);
      toggleLike(tid);
      return;
    }

    const card = e.target.closest('.music-card');
    if (card && !e.target.closest('button')) {
      const tid = parseInt(card.getAttribute('data-track-id'), 10);
      if (state.currentIndex === tid) {
        togglePlayPause();
      } else {
        loadTrack(tid, true);
      }
      return;
    }

    const row = e.target.closest('.track-row');
    if (row && !e.target.closest('button')) {
      const tid = parseInt(row.getAttribute('data-track-id'), 10);
      if (state.currentIndex === tid) {
        togglePlayPause();
      } else {
        loadTrack(tid, true);
      }
      return;
    }

    const playlistLink = e.target.closest('.playlist-link');
    if (playlistLink) {
      const tid = parseInt(playlistLink.getAttribute('data-track-id'), 10);
      loadTrack(tid, true);
      closeMobileSidebar();
    }
  });

  function openMobileSidebar() {
    sidebar.classList.add('open');
    sidebarBackdrop.classList.add('active');
    mobileMenuBtn.setAttribute('aria-expanded', 'true');
  }

  function closeMobileSidebar() {
    sidebar.classList.remove('open');
    sidebarBackdrop.classList.remove('active');
    mobileMenuBtn.setAttribute('aria-expanded', 'false');
  }

  mobileMenuBtn.addEventListener('click', () => {
    if (sidebar.classList.contains('open')) {
      closeMobileSidebar();
    } else {
      openMobileSidebar();
    }
  });

  sidebarCloseBtn.addEventListener('click', closeMobileSidebar);
  sidebarBackdrop.addEventListener('click', closeMobileSidebar);

  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && document.activeElement.tagName !== 'INPUT') {
      e.preventDefault();
      togglePlayPause();
    }
  });

  // Initialize application execution
  initApp();
});