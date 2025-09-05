document.addEventListener('DOMContentLoaded', () => {
    // URL directe vers votre serveur WebSocket
    // wss:// est pour une connexion sécurisée (équivalent de https://)
    const WS_URL = 'wss://miaou.vps.webdock.cloud/com/';

    // Éléments du DOM (inchangés)
    const pseudoInput = document.getElementById('pseudo-input');
    const btnOnVaDire = document.getElementById('btn-on-va-dire');
    const btnNotamment = document.getElementById('btn-notamment');
    const countOnVaDire = document.getElementById('count-on-va-dire');
    const countNotamment = document.getElementById('count-notamment');
    const notificationEl = document.getElementById('notification');
    const modeStatusEl = document.getElementById('mode-status');

    let ws; // Variable pour contenir notre connexion WebSocket
    
    function connect() {
        ws = new WebSocket(WS_URL);

        ws.onopen = () => {
            console.log('Connecté au serveur WebSocket !');
            modeStatusEl.textContent = '';
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            // On écoute un seul événement et on regarde le type
            if (data.type === 'updateState') {
                const state = data.payload;
                
                countOnVaDire.textContent = state.compteurs['on va dire'];
                countNotamment.textContent = state.compteurs['notamment'];

                if (state.lastScorer.pseudo) {
                    notificationEl.textContent = `${state.lastScorer.pseudo} a marqué le point !`;
                    setTimeout(() => { notificationEl.textContent = ''; }, 2500);
                }
                
                const buttonsDisabled = !state.isLiveMode;
                btnOnVaDire.disabled = buttonsDisabled;
                btnNotamment.disabled = buttonsDisabled;
                
                modeStatusEl.textContent = buttonsDisabled ? 'Mode Scoreboard : les compteurs sont en pause.' : '';
            }
        };

        ws.onclose = () => {
            console.log('Déconnecté du serveur WebSocket. Tentative de reconnexion dans 3 secondes...');
            modeStatusEl.textContent = 'Déconnecté. Reconnexion en cours...';
            // Simple logique de reconnexion
            setTimeout(connect, 3000);
        };

        ws.onerror = (error) => {
            console.error('Erreur WebSocket:', error);
            ws.close();
        };
    }

    // Helper pour envoyer des messages au serveur
    function sendMessage(type, payload) {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type, payload }));
        }
    }

    pseudoInput.addEventListener('input', (e) => {
        sendMessage('setPseudo', e.target.value);
    });

    const handleIncrement = (button) => {
        if (!pseudoInput.value) {
            alert('Veuillez choisir un pseudo avant de jouer !');
            return;
        }
        const phrase = button.dataset.phrase;
        sendMessage('incrementCounter', { phrase });
    };

    btnOnVaDire.addEventListener('click', () => handleIncrement(btnOnVaDire));
    btnNotamment.addEventListener('click', () => handleIncrement(btnNotamment));

    // Lancer la connexion initiale
    connect();
});