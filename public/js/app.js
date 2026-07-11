const GENRES = [
  'Rock', 'Pop', 'Sertanejo', 'Funk', 'Gospel', 'Samba', 'MPB',
  'Forró', 'Pagode', 'Eletrônica', 'Hip Hop', 'Reggae', 'Jazz',
  'Blues', 'Country', 'Axé', 'Brega', 'Bossa Nova', 'Metal'
];

let searchTimeout;
let player;
let playlist = [];
let currentIndex = -1;
let isPlaying = false;

document.addEventListener('DOMContentLoaded', () => {
  renderGenreChips();
  document.getElementById('searchInput').addEventListener('input', onSearchInput);
  document.getElementById('searchInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });
  document.getElementById('searchBtn').addEventListener('click', doSearch);
  document.getElementById('backBtn').addEventListener('click', goHome);
  document.getElementById('playBtn').addEventListener('click', togglePlay);
  document.getElementById('prevBtn').addEventListener('click', playPrevious);
  document.getElementById('nextBtn').addEventListener('click', playNext);

  if (typeof YT !== 'undefined') {
    YT.ready(() => initPlayer());
  } else {
    window.onYouTubeIframeAPIReady = initPlayer;
  }
});

function initPlayer() {
  player = new YT.Player('youtubePlayer', {
    height: '1',
    width: '1',
    events: {
      onReady: () => {},
      onStateChange: onPlayerStateChange,
      onError: onPlayerError
    }
  });
}

function renderGenreChips() {
  const grid = document.getElementById('genreGrid');
  GENRES.forEach(genre => {
    const chip = document.createElement('div');
    chip.className = 'genre-chip';
    chip.textContent = genre;
    chip.addEventListener('click', () => {
      document.getElementById('searchInput').value = genre;
      doSearch();
    });
    grid.appendChild(chip);
  });
}

function onSearchInput() {
  clearTimeout(searchTimeout);
  const query = document.getElementById('searchInput').value.trim();
  if (query.length >= 2) {
    searchTimeout = setTimeout(doSearch, 400);
  }
}

async function doSearch() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query || query.length < 2) return;

  document.getElementById('homeContent').style.display = 'none';
  document.getElementById('resultsContent').style.display = 'block';
  document.getElementById('resultsTitle').textContent = `Resultados para "${query}"`;
  document.getElementById('resultsGrid').innerHTML = '';
  document.getElementById('noResults').style.display = 'none';
  document.getElementById('loadingSpinner').style.display = 'flex';

  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    renderResults(data.results);
  } catch (err) {
    document.getElementById('loadingSpinner').style.display = 'none';
    document.getElementById('noResults').style.display = 'block';
  }
}

function renderResults(results) {
  const grid = document.getElementById('resultsGrid');
  const count = document.getElementById('resultsCount');
  const spinner = document.getElementById('loadingSpinner');
  const noResults = document.getElementById('noResults');

  spinner.style.display = 'none';

  if (!results || results.length === 0) {
    noResults.style.display = 'block';
    count.textContent = '';
    return;
  }

  count.textContent = `${results.length} música(s) encontrada(s)`;
  noResults.style.display = 'none';

  results.forEach((song, idx) => {
    const card = document.createElement('div');
    card.className = 'song-card';
    card.innerHTML = `
      ${song.image
        ? `<img src="${song.image}" alt="" class="song-card-img" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';">`
        : `<div class="song-card-img-placeholder"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div>`}
      <div class="song-card-info">
        <div class="song-card-title">${escapeHtml(song.title)}</div>
        <div class="song-card-artist">${escapeHtml(song.artist || 'Artista desconhecido')}</div>
      </div>
      <div class="song-card-source">
        <span class="source-tag ${song.source}">${song.source === 'kboing' ? 'Kboing' : 'OuvirMúsica'}</span>
      </div>
    `;
    card.addEventListener('click', () => playSong(song, idx, results));
    grid.appendChild(card);
  });
}

async function playSong(song, idx, results) {
  playlist = results;
  currentIndex = idx;

  document.getElementById('playerBar').style.display = 'block';
  document.getElementById('playerTitle').textContent = song.title;
  document.getElementById('playerArtist').textContent = song.artist || 'Artista desconhecido';
  document.getElementById('playerSource').className = `source-tag ${song.source}`;
  document.getElementById('playerSource').textContent = song.source === 'kboing' ? 'Kboing' : 'OuvirMúsica';

  if (song.image) {
    document.getElementById('playerImg').src = song.image;
  } else {
    document.getElementById('playerImg').src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="%23727272" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>');
  }

  updateNavButtons();

  let youtubeId = song.youtubeId;

  if (!youtubeId) {
    document.getElementById('playBtn').disabled = true;
    const url = song.url || song.link;
    if (url) {
      try {
        const response = await fetch(`/api/song?url=${encodeURIComponent(url)}&source=${song.source}`);
        const data = await response.json();
        youtubeId = data.youtubeId;
      } catch (e) {}
    }
  }

  if (youtubeId && player && player.loadVideoById) {
    player.loadVideoById(youtubeId);
    isPlaying = true;
    updatePlayButton();
    document.getElementById('playBtn').disabled = false;
  } else {
    document.getElementById('playBtn').disabled = !!youtubeId;
    updatePlayButton();
  }
}

function togglePlay() {
  if (!player) return;
  if (isPlaying) {
    player.pauseVideo();
  } else {
    player.playVideo();
  }
}

function playPrevious() {
  if (currentIndex > 0) {
    playSong(playlist[currentIndex - 1], currentIndex - 1, playlist);
  }
}

function playNext() {
  if (currentIndex < playlist.length - 1) {
    playSong(playlist[currentIndex + 1], currentIndex + 1, playlist);
  }
}

function updateNavButtons() {
  document.getElementById('prevBtn').disabled = currentIndex <= 0;
  document.getElementById('nextBtn').disabled = currentIndex >= playlist.length - 1;
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    isPlaying = true;
    updatePlayButton();
  } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
    isPlaying = false;
    updatePlayButton();
    if (event.data === YT.PlayerState.ENDED) {
      setTimeout(playNext, 1000);
    }
  }
}

function onPlayerError() {
  isPlaying = false;
  updatePlayButton();
  document.getElementById('playBtn').disabled = true;
}

function updatePlayButton() {
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  if (isPlaying) {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
  } else {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
  }
}

function goHome() {
  document.getElementById('resultsContent').style.display = 'none';
  document.getElementById('homeContent').style.display = 'block';
  document.getElementById('searchInput').value = '';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}