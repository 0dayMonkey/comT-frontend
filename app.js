document.addEventListener('DOMContentLoaded', () => {
    // L'URL de base de votre serveur reste la même
    const SOCKET_URL = 'https://miaou.vps.webdock.cloud';

    // --- MODIFICATION ICI : On spécifie le chemin dédié à notre application ---
    const socket = io(SOCKET_URL, {
        path: '/com/socket.io' // C'est cette ligne qui dit au client d'utiliser la nouvelle route
    });

    // --- Sélection des éléments du DOM ---
    const pseudoInput = document.getElementById('pseudo-input');
    const btnOnVaDire = document.getElementById('btn-on-va-dire');
    const btnNotamment = document.getElementById('btn-notamment');
    const countOnVaDire = document.getElementById('count-on-va-dire');
    const countNotamment = document.getElementById('count-notamment');
    const notificationEl = document.getElementById('notification');
    const modeStatusEl = document.getElementById('mode-status');

    let currentPseudo = '';

    // --- Événements émis vers le serveur (inchangés) ---
    pseudoInput.addEventListener('input', (e) => {
        currentPseudo = e.target.value;
        socket.emit('setPseudo', currentPseudo);
    });

    const handleIncrement = (button) => {
        if (!currentPseudo) {
            alert('Veuillez choisir un pseudo avant de jouer !');
            return;
        }
        const phrase = button.dataset.phrase;
        socket.emit('incrementCounter', { phrase });
    };

    btnOnVaDire.addEventListener('click', () => handleIncrement(btnOnVaDire));
    btnNotamment.addEventListener('click', () => handleIncrement(btnNotamment));

    // --- Événements reçus du serveur (inchangés) ---
    socket.on('updateState', (state) => {
        countOnVaDire.textContent = state.compteurs['on va dire'];
        countNotamment.textContent = state.compteurs['notamment'];

        if (state.lastScorer.pseudo) {
            notificationEl.textContent = `${state.lastScorer.pseudo} a marqué le point !`;
            setTimeout(() => { notificationEl.textContent = ''; }, 2500);
        }
        
        const buttonsDisabled = !state.isLiveMode;
        btnOnVaDire.disabled = buttonsDisabled;
        btnNotamment.disabled = buttonsDisabled;
        
        if (buttonsDisabled) {
            modeStatusEl.textContent = 'Mode Scoreboard : les compteurs sont en pause.';
        } else {
            modeStatusEl.textContent = '';
        }
    });

    socket.on('error', (error) => {
        alert(`Erreur : ${error.message}`);
    });
});