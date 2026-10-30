// api base url fallback for fetching or deleting visitor sightings
const API = window.API_BASE || '';

// our insects, their colours and their little names
const insects = {
  ladybug: {
    names: ['ladybird', 'poppy', 'ember'],
    color: 'red',
    nicknames: ['Scarlet Rose', 'Spotty One', 'Cherry Legs', 'Pepper Trail', 'Ruby Red Racer']
  },

  bee: {
    names: ['honeybee', 'bumble', 'nectar'],
    color: 'yellow',
    nicknames: ['Buzzy Bear', 'Sweet Zinger', 'Dusty Pollen', 'Honey Bee', 'Magic Beekeeper']
  },

  butterfly: {
    names: ['flutterby', 'swallowtail', 'monarch'],
    color: 'purple',
    nicknames: ['Fluttershy', 'Cocoon snail', 'Velvet wings', 'Lunar doll', 'Petal wisp']
  },

  dragonfly: {
    names: ['darner', 'skimmer', 'damselfly'],
    color: 'blue',
    nicknames: ['Fiesty Fellow', 'Glimmer Shimmer', 'Hover Lord', 'Firebeam rose']
  },

  grasshopper: {
    names: ['hopper', 'cricket', 'katydid'],
    color: 'green',
    nicknames: ['Cheeky Skipper ', 'Chirpy Green Guy', 'Little Hop', 'Springy Fate', 'Green Earworm']
  },

  spider: {
    names: ['weaver', 'orb', 'spinner'],
    color: 'pink',
    nicknames: ['Little Webster', 'The Great Spindle', 'Silky webster', 'Black Dangle doll', 'Cobweb', 'Charlottes friend']
  },

  firefly: {
    names: ['lantern', 'glowworm', 'flicker'],
    color: 'moss',
    nicknames: ['Sparky fly', 'Lumen one', 'Beacon of light', 'Twilight sky', 'Dusky']
  },

 gardener: {
  names: ['meghan', 'rose', 'caretaker'],
  color: 'teal',
  nicknames: ['Meg', 'Meghan', 'Rose', 'Meghan Rose']
}
};

// master list of all valid color variants supported across the meadow
const colours = [
  'red', 'purple', 'blue',
  'green', 'pink', 'yellow', 'moss', 'teal'
];


// random helpers function to grab a random item from any given array
function random(items) {
  return items[Math.floor(Math.random() * items.length)];
}

// generates a fresh default visitor object with randomized traits
function createVisitor() {
  const insect = random(Object.keys(insects));
  const details = insects[insect];

  return {
    insect,
    name: random(details.nicknames),
    insectName: random(details.names),
    color: details.color,
    strokes: []
  };
}

// converts raw coordinate points drawn by the user into clean svg path strings
function strokesToSvg(strokes = []) {
  return strokes.map(stroke => {
    if (stroke.length < 2) return '';

    const points = stroke
      .map(point => point.join(' '))
      .join(' L ');

    return `<path d="M ${points}" />`;
  }).join('');
}

// escapes text before adding it to the page
// sanitizes raw user strings to protect against cross-site scripting (xss) attacks
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[char]);
}


// compiles individual visitor object data into dynamic html markup for the gallery grid
function cardHTML(card) {
  const details = insects[card.insect] || insects.ladybug;

  const nickname = card.name || random(details.nicknames);
  const insectName = card.insectName || details.names[0];

  const date = new Date(card.createdAt || Date.now())
    .toLocaleDateString('en-IE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });

  const insectLabel = card.insect || 'ladybug';
  const color = card.color || details.color;

  return `
    <article class="vcard" data-color="${escapeHtml(color)}">
    
      <div class="face">
        <h3>Meghan's Meadow</h3>

        <p class="lbl">Little visitor</p>
        <p class="val">${escapeHtml(nickname)}</p>

        <p class="lbl">${escapeHtml(insectLabel)} · ${escapeHtml(insectName)}</p>
        <p class="val">${date}</p>

        <p class="no">${card.number ? 'NO. ' + escapeHtml(card.number) : ''}</p>

        <span class="x">X</span>
        <div class="sigline"></div>

        <div class="sig">
          <svg viewBox="0 0 1 1" preserveAspectRatio="none">
            ${strokesToSvg(card.strokes)}
          </svg>
        </div>
      </div>
    </article>`;
}


// injects the full-screen card creation editor overlay directly into the document body
document.body.insertAdjacentHTML('beforeend', `
  <div class="editor" id="editor">
    <button class="editor-back" id="back">← Back</button>

    <p class="editor-title">Meet your little self.</p>
    <p class="editor-sub">Every visitor belongs in the meadow.</p>

    <div class="name-row">
      <label for="nameInput">Nickname:</label>
      <input id="nameInput" maxlength="28" autocomplete="off">

      <button class="icon-btn" id="shuffle" title="Meet another insect">
        ↻
      </button>
    </div>

    <div id="previewSlot"></div>

    <div class="tools">
      <div class="swatches" id="swatches"></div>
      <button class="btn-ghost" id="clear">Clear signature</button>
    </div>

    <p class="editor-error" id="error" hidden></p>

<button class="btn-dark" id="save" type="button">
  Save to the meadow →
</button>
  </div>
`);


// more page elements
const gallery = document.getElementById('gallery');
const empty = document.getElementById('galleryMsg');
const editor = document.getElementById('editor');
const nameInput = document.getElementById('nameInput');
const preview = document.getElementById('previewSlot');
const swatches = document.getElementById('swatches');
const errorBox = document.getElementById('error');

let card = createVisitor();


// asynchronous function to fetch all saved sightings from the backend api and render them
async function loadCards() {

  if (!gallery) return;

  try {
    const res = await fetch(API + '/api/sightings');

    if (!res.ok) {
      throw new Error('Could not load sightings');
    }

    const data = await res.json();
    const items = data.items || [];

    gallery.innerHTML = items.map(cardHTML).join('');
    empty.hidden = items.length > 0;

  } catch (err) {
    empty.textContent = 'Could not load the log right now.';
    empty.hidden = false;
  }
}

// draws the card preview and handle signatures
// handles pointer/touch drawing inputs
function showPreview() {
  preview.innerHTML = cardHTML(card);

  const svg = preview.querySelector('.sig svg');
  let stroke = null;

  function getPoint(event) {
    const box = svg.getBoundingClientRect();

    return [
      +((event.clientX - box.left) / box.width).toFixed(3),
      +((event.clientY - box.top) / box.height).toFixed(3)
    ];
  }

  svg.onpointerdown = event => {
    if (card.strokes.length >= 40) return;

    event.preventDefault();
    svg.setPointerCapture(event.pointerId);

    stroke = [getPoint(event), getPoint(event)];
    card.strokes.push(stroke);

    svg.innerHTML = strokesToSvg(card.strokes);
  };

  svg.onpointermove = event => {
    if (!stroke) return;

    stroke.push(getPoint(event));
    svg.innerHTML = strokesToSvg(card.strokes);
  };

  svg.onpointerup = () => {
    stroke = null;
  };

  svg.onpointercancel = () => {
    stroke = null;
  };
}


// colour picker- renders clickable color selection swatches inside the editor
function showSwatches() {
  swatches.innerHTML = colours.map(color => `
    <button
      class="swatch ${color === card.color ? 'on' : ''}"
      data-color="${color}"
      aria-label="${color}"
      title="${color}"
      type="button">
    </button>
  `).join('');
}


// opens the editor with a fresh visitor
function openEditor() {
  card = createVisitor();

  nameInput.value = card.name;
  errorBox.hidden = true;

  showPreview();
  showSwatches();

  editor.classList.add('open');
}

// wire up global editor button triggers and nickname input binding
const openBtn = document.getElementById('openEditor');
if (openBtn) openBtn.onclick = openEditor;

document.getElementById('back').onclick = () => {
  editor.classList.remove('open');
};



// generates another complete visitor
document.getElementById('shuffle').onclick = () => {
  const fresh = createVisitor();

  card.insect = fresh.insect;
  card.insectName = fresh.insectName;
  card.name = fresh.name;
  card.color = fresh.color;

  nameInput.value = card.name;

  showPreview();
  showSwatches();
};


// lets visitors personalise their nickname
nameInput.oninput = () => {
  card.name = nameInput.value;
  showPreview();
};


// picking a colour also changes the insect,
// so the visitor's appearance always matches its species.
// swatch click listener: updating color also matches the correct corresponding insect type
swatches.onclick = event => {
  const button = event.target.closest('.swatch');
  const color = button?.dataset.color;

  if (!color || !colours.includes(color)) return;

  const matchingInsects = Object.keys(insects).filter(
    insect => insects[insect].color === color
  );

  if (!matchingInsects.length) return;

  const insect = random(matchingInsects);
  const details = insects[insect];

  card.insect = insect;
  card.insectName = random(details.names);
  card.color = color;
  showSwatches();
  showPreview();
};

// clears the signature
document.getElementById('clear').onclick = () => {
  card.strokes = [];
  showPreview();
};

// saves the visitor
document.getElementById('save').onclick = async () => {
  errorBox.hidden = true;

  const saveButton = document.getElementById('save');
  saveButton.disabled = true;

  try {
    const res = await fetch(API + '/api/sightings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: card.name,
        insect: card.insect,
        insectName: card.insectName,
        color: card.color,
        strokes: card.strokes
      })
    });

    // reads the response as text first as might be empty.
    const responseText = await res.text();
    let data = null;

    if (responseText.trim()) {
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `The server returned something other than JSON (HTTP ${res.status}). Check the server logs.`
        );
      }
    }

    if (!res.ok) {
      throw new Error(
        data?.error || `Could not save your visitor (HTTP ${res.status}).`
      );
    }

    // endpoints return success without a response body.
        if (data?._id) localStorage.setItem('mySightingId', data._id);

    if (gallery && data) gallery.insertAdjacentHTML('afterbegin', cardHTML(data));
    if (empty) empty.hidden = true;

    editor.classList.remove('open');
    if (!data) await loadCards();

  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.hidden = false;
    document.getElementById('back').hidden = false; // let them through if saving fails
  } finally {
    saveButton.disabled = false;
  }
};

// start the gallery

const deleteBtn = document.getElementById('deleteMine');
if (deleteBtn) deleteBtn.onclick = async () => {
  const id = localStorage.getItem('mySightingId');

  if (!id) {
    alert('You have no saved card in this browser yet.');
    return;
  }

  if (!confirm('Delete your card from the meadow?')) return;

  try {
    const res = await fetch(
      `${API}/api/sightings/${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Could not delete your card.');
    }

    localStorage.removeItem('mySightingId');
    await loadCards();
    alert('Your card has been deleted!');
  } catch (err) {
    alert(err.message);
  }
};


// mouse movement tilt and glow effect for visitor gallery cards
document.addEventListener('mousemove', (event) => {
  const card = event.target.closest('.vcard');
  if (!card) return;

  const rect = card.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const xc = ((x / rect.width) * 100).toFixed(2);
  const yc = ((y / rect.height) * 100).toFixed(2);
  card.style.setProperty('--mx', `${xc}%`);
  card.style.setProperty('--my', `${yc}%`);

  
  const centerX = rect.width / 2;
  const centerY = rect.height / 2;
  const rotateX = ((y - centerY) / centerY) * -6;
  const rotateY = ((x - centerX) / centerX) * 6;

  card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(1)}deg) rotateY(${rotateY.toFixed(1)}deg) translateY(-4px)`;
});

document.addEventListener('mouseout', (event) => {
  const card = event.target.closest('.vcard');
  if (!card) return;
  
  if (!card.contains(event.relatedTarget)) {
    card.style.transform = '';
  }
});

loadCards();

if (document.body.hasAttribute('data-gate') && !localStorage.getItem('mySightingId')) {
  document.getElementById('back').hidden = true;
  openEditor();
}