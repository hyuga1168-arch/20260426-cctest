const TOTAL_POKEMON = 1025;

const cardInner   = document.getElementById('card-inner');
const loading     = document.getElementById('loading');
const imgEl       = document.getElementById('pokemon-img');
const nameEl      = document.getElementById('pokemon-name');
const numberEl    = document.getElementById('pokemon-number');
const typesEl     = document.getElementById('types');
const statsEl     = document.getElementById('stats');
const metaEl      = document.getElementById('meta');
const rollBtn     = document.getElementById('roll-btn');

const STAT_LABELS = {
  hp:               'HP',
  attack:           'こうげき',
  defense:          'ぼうぎょ',
  'special-attack':  'とくこう',
  'special-defense': 'とくぼう',
  speed:            'すばやさ',
};

const STAT_COLORS = {
  hp:               '#ff5f5f',
  attack:           '#f5ac78',
  defense:          '#fae078',
  'special-attack':  '#9db7f5',
  'special-defense': '#a7db8d',
  speed:            '#fa92b2',
};

async function fetchRandomPokemon() {
  const id = Math.floor(Math.random() * TOTAL_POKEMON) + 1;
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  if (!res.ok) throw new Error('fetch failed');
  return res.json();
}

function showLoading() {
  cardInner.classList.add('fade');
  loading.classList.remove('hidden');
  rollBtn.disabled = true;
}

function hideLoading() {
  loading.classList.add('hidden');
  cardInner.classList.remove('fade');
  rollBtn.disabled = false;
}

function renderTypes(types) {
  typesEl.innerHTML = types
    .map(t => `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`)
    .join('');
}

function renderStats(stats) {
  statsEl.innerHTML = stats.map(s => {
    const key   = s.stat.name;
    const label = STAT_LABELS[key] || key;
    const val   = s.base_stat;
    const pct   = Math.min(100, Math.round((val / 255) * 100));
    const color = STAT_COLORS[key] || '#aaa';
    return `
      <div class="stat-row">
        <span class="stat-label">${label}</span>
        <span class="stat-value">${val}</span>
        <div class="stat-bar-wrap">
          <div class="stat-bar" style="width:${pct}%; background:${color};"></div>
        </div>
      </div>`;
  }).join('');
}

function renderMeta(pokemon) {
  const heightM  = (pokemon.height / 10).toFixed(1);
  const weightKg = (pokemon.weight / 10).toFixed(1);
  metaEl.innerHTML = `
    <div class="meta-item">
      <div class="label">たかさ</div>
      <div class="value">${heightM} m</div>
    </div>
    <div class="meta-item">
      <div class="label">おもさ</div>
      <div class="value">${weightKg} kg</div>
    </div>`;
}

async function loadPokemon() {
  showLoading();
  try {
    const pokemon = await fetchRandomPokemon();

    numberEl.textContent = `#${String(pokemon.id).padStart(3, '0')}`;
    nameEl.textContent   = pokemon.name;

    const artwork =
      pokemon.sprites?.other?.['official-artwork']?.front_default ||
      pokemon.sprites?.front_default ||
      '';
    imgEl.src = artwork;
    imgEl.alt = pokemon.name;

    renderTypes(pokemon.types);
    renderStats(pokemon.stats);
    renderMeta(pokemon);

    // tint card bg by primary type
    const primaryType = pokemon.types[0].type.name;
    tintCard(primaryType);
  } catch (e) {
    nameEl.textContent = 'エラー';
  } finally {
    hideLoading();
  }
}

const TYPE_TINTS = {
  fire:     'rgba(255,151,65,0.08)',
  water:    'rgba(54,146,220,0.08)',
  grass:    'rgba(56,191,79,0.08)',
  electric: 'rgba(251,209,0,0.08)',
  psychic:  'rgba(255,102,117,0.08)',
  ice:      'rgba(57,198,192,0.08)',
  dragon:   'rgba(0,111,201,0.08)',
  dark:     'rgba(90,84,101,0.12)',
  fairy:    'rgba(251,137,235,0.08)',
  ghost:    'rgba(78,106,175,0.10)',
  fighting: 'rgba(214,40,40,0.08)',
  poison:   'rgba(165,82,204,0.08)',
  steel:    'rgba(90,142,161,0.08)',
  bug:      'rgba(131,195,0,0.08)',
  rock:     'rgba(201,187,138,0.08)',
  ground:   'rgba(224,192,104,0.08)',
  flying:   'rgba(137,170,227,0.08)',
  normal:   'rgba(144,153,161,0.08)',
};

function tintCard(type) {
  const color = TYPE_TINTS[type] || 'transparent';
  document.querySelector('.card').style.background =
    `linear-gradient(135deg, ${color}, var(--card-bg))`;
}

rollBtn.addEventListener('click', loadPokemon);
loadPokemon();
