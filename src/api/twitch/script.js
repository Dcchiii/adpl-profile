const CHANNEL_NAME = 'supertf';
const chatBox = document.getElementById('twitch-chat-box');


const statusEl = document.getElementById('streamStatus');
async function checkStreamStatus() {
  try {
    const res = await fetch(`https://decapi.me/twitch/uptime/${CHANNEL_NAME}`);
    const text = (await res.text()).trim();
    const isOffline = text.toLowerCase().includes('offline');

    if (isOffline) {
      statusEl.textContent = '(offline)';
    } else {
      statusEl.textContent = '(live)';
    }

    return isOffline;
  } catch (err) {
    console.error('Failed to check stream status:', err);
    return false;
  }
}


const emoteMap = new Map();
async function loadAllEmotes() {
  try {
    const userRes = await fetch(`https://decapi.me/twitch/id/${CHANNEL_NAME}`);
    const userId = (await userRes.text()).trim();
    if (!userId || userId.includes('User not found')) return;

    const fetch7TV = fetch(`https://7tv.io/v3/users/twitch/${userId}`)
      .then(res => res.json())
      .then(data => {
        const emotes = data?.emote_set?.emotes || [];
        emotes.forEach(e => emoteMap.set(e.name, `https:${e.data.host.url}/1x.webp`));
      })
      .catch(() => {});

    const fetchBTTV = fetch(`https://api.betterttv.net/3/cached/users/twitch/${userId}`)
      .then(res => res.json())
      .then(data => {
        const bttvEmotes = [...(data.channelEmotes || []), ...(data.sharedEmotes || [])];
        bttvEmotes.forEach(e => {
          emoteMap.set(e.code, `https://cdn.betterttv.net/emote/${e.id}/1x`);
        });
      })
      .catch(() => {});

    const fetchFFZ = fetch(`https://api.frankerfacez.com/v1/room/id/${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.sets) {
          Object.values(data.sets).forEach(set => {
            set.emotes.forEach(e => {
              const url = e.urls['1'] || Object.values(e.urls)[0];
              emoteMap.set(e.name, url.startsWith('//') ? `https:${url}` : url);
            });
          });
        }
      })
      .catch(() => {});

    await Promise.all([fetch7TV, fetchBTTV, fetchFFZ]);
  } catch (err) {
    console.error('Failed to load emote list:', err);
  }
}

// 2. Fungsi Parser Teks ke Tag Gambar Emote
function parseEmotes(text) {
  const words = text.split(' ');
  const parsedWords = words.map(word => {
    // Jika kata ada di dalam daftar emote 7TV, ubah jadi tag <img>
    if (emoteMap.has(word)) {
      const imgUrl = emoteMap.get(word);
      return `<img class="twitch-emote" src="${imgUrl}" alt="${word}" title="${word}">`;
    }
    // Jika bukan emote, kembalikan teks asli (escape HTML demi keamanan)
    return escapeHTML(word);
  });

  return parsedWords.join(' ');
}

// Helper untuk Mencegah XSS pada Teks Chat
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

// 3. Tambah Pesan ke Window
function appendChatMessage(user, text, color) {
  if (!chatBox) return;

  if (chatBox.children.length === 0 || chatBox.innerText.includes('Connected') || chatBox.innerText.includes('Initializing')) {
    chatBox.innerHTML = '';
  }

  const msgElement = document.createElement('div');
  msgElement.className = 'chat-line';
  
  const parsedText = parseEmotes(text);
  
  msgElement.innerHTML = `<span class="user" style="color: ${color}; font-weight: bold;">${user}:</span> <span class="text">${parsedText}</span>`;

  chatBox.appendChild(msgElement);

  // 2. Batasi pesan yang tampil di layar (misal: Maksimal 25-30 pesan)
  const MAX_MESSAGES = 15; 
  
  // Selama jumlah elemen melebihi batas, hapus elemen teratas (pesan tertua)
  while (chatBox.children.length > MAX_MESSAGES) {
    chatBox.removeChild(chatBox.firstElementChild); // Menggunakan firstElementChild agar pasti menghapus elemen tag div
  }

  // Auto-scroll ke paling bawah
  chatBox.scrollTop = chatBox.scrollHeight;
}

// 4. Inisialisasi WebSocket & Emote
async function initChat() {
  await loadAllEmotes();

  const ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');

  ws.onopen = async () => {
    const chatBox = document.getElementById('twitch-chat-box');
    chatBox.innerText = 'Connected to Twitch!';
    
    const isOffline = await checkStreamStatus(); // ← panggil & tunggu hasilnya di sini

    if (isOffline) {
      chatBox.innerText += '\nStream is offline!';
    }

    ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
    ws.send('PASS SCHMOOPIIE');
    ws.send(`NICK justinfan${Math.floor(10000 + Math.random() * 90000)}`);
    ws.send(`JOIN #${CHANNEL_NAME.toLowerCase()}`);
  };

  ws.onerror = (error) => {
    const chatBox = document.getElementById('twitch-chat-box');
    chatBox.innerText = 'Connection Failed!';
  };

  ws.onclose = () => {
    const chatBox = document.getElementById('twitch-chat-box');
    chatBox.innerText = 'Disconnected from Twitch';
  };

  ws.onmessage = (event) => {
    const message = event.data;

    if (message.startsWith('PING')) {
      ws.send('PONG :tmi.twitch.tv');
      return;
    }

    if (message.includes('PRIVMSG')) {
      const displayNameMatch = message.match(/display-name=([^;]+)/);
      const colorMatch = message.match(/color=([^;]+)/);
      
      const username = displayNameMatch ? displayNameMatch[1] : 'Anonymous';
      const userColor = colorMatch && colorMatch[1] ? colorMatch[1] : '#29313a';

      const textParts = message.split(`PRIVMSG #${CHANNEL_NAME.toLowerCase()} :`);
      if (textParts.length > 1) {
        const chatText = textParts[1].trim();
        appendChatMessage(username, chatText, userColor);
      }
    }
  };
}


checkStreamStatus();
setInterval(checkStreamStatus, 60000);
initChat();