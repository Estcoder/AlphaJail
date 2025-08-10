function initializeJailSystem() {
    let jailWrapper, jailZone, freeZone;
    let activeCharacter = null;
    let pointerPos = { x: 0, y: 0 };

    function buildZones() {
        jailWrapper = document.createElement('div');
        jailWrapper.className = 'world';

        freeZone = document.createElement('div');
        freeZone.className = 'outside zone';

        jailZone = document.createElement('div');
        jailZone.className = 'inside zone';

        jailWrapper.appendChild(freeZone);
        jailWrapper.appendChild(jailZone);
        document.body.appendChild(jailWrapper);
    }

    function makeCharacter(letter, x, y) {
        const elm = document.createElement('div');
        elm.classList.add('character', 'follow');
        elm.textContent = letter;
        document.body.appendChild(elm);

        // measure before positioning
        const w = elm.offsetWidth;
        const h = elm.offsetHeight;

        elm.style.left = `${x - w / 2}px`;
        elm.style.top  = `${y - h / 2}px`;
        elm.style.background = 'white';

        return elm;
    }

    function releaseCharacter(charElm) {
        if (!charElm) return;
        charElm.classList.remove('follow');
        activeCharacter = null;
    }

    function clampValue(val, mn, mx) {
        return Math.min(Math.max(val, mn), mx);
    }

    function onKeyDown(evt) {
        if (evt.key === 'Escape') {
            document.querySelectorAll('.character')
                .forEach(c => c.remove());
            activeCharacter = null;
            return;
        }

        if (/^[a-z]$/.test(evt.key)) {
            releaseCharacter(activeCharacter);

            const rect = jailZone.getBoundingClientRect();
            const inJail =
                pointerPos.x >= rect.left + window.scrollX &&
                pointerPos.x <= rect.right + window.scrollX &&
                pointerPos.y >= rect.top + window.scrollY &&
                pointerPos.y <= rect.bottom + window.scrollY;

            const charElm = makeCharacter(evt.key, pointerPos.x, pointerPos.y);
            activeCharacter = charElm;

            if (inJail) {
                activeCharacter.classList.add('trapped');
                activeCharacter.style.background = 'var(--orange)';
            }
        }
    }

    function onPointerMove(evt) {
        pointerPos.x = evt.pageX;
        pointerPos.y = evt.pageY;

        if (!activeCharacter) return;

        const w = activeCharacter.offsetWidth;
        const h = activeCharacter.offsetHeight;
        const rect = jailZone.getBoundingClientRect();

        const leftJ = rect.left + window.scrollX;
        const rightJ= rect.right + window.scrollX;
        const topJ  = rect.top + window.scrollY;
        const botJ  = rect.bottom + window.scrollY;

        const inJail =
            evt.pageX >= leftJ &&
            evt.pageX <= rightJ &&
            evt.pageY >= topJ &&
            evt.pageY <= botJ;

        const isFollowing = activeCharacter.classList.contains('follow');
        const isTrapped   = activeCharacter.classList.contains('trapped');

        // small center‐based clamp
        const centerW = 8, centerH = 8;

        if (isFollowing && isTrapped) {
            // clamp center inside jail
            const cx = clampValue(evt.pageX, leftJ + centerW/2, rightJ - centerW/2);
            const cy = clampValue(evt.pageY, topJ  + centerH/2, botJ  - centerH/2);

            activeCharacter.style.left = `${cx - w/2}px`;
            activeCharacter.style.top  = `${cy - h/2}px`;

            if (!inJail) {
                activeCharacter.classList.remove('follow');
            }

        } else if (isFollowing && !isTrapped) {
            activeCharacter.style.left = `${evt.pageX - w/2}px`;
            activeCharacter.style.top  = `${evt.pageY - h/2}px`;

            if (inJail) {
                activeCharacter.classList.add('trapped');
                activeCharacter.style.background = 'var(--orange)';
            }
        }
    }

    buildZones();
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousemove', onPointerMove);
}

document.addEventListener('DOMContentLoaded', initializeJailSystem);
