let words = [];
let secret = "";
let row = 0;
let col = 0;
const maxRows = 6;

async function loadWords() {
    const response = await fetch("words.txt");
    const text = await response.text();
    words = text.split(/\r?\n/).map(w => w.trim().toLowerCase()).filter(w => w.length === 5);
    secret = words[Math.floor(Math.random() * words.length)];
    console.log("Palavra secreta:", secret);
}

function createBoard() {
    const boardDiv = document.getElementById("board");

    for (let r = 0; r < maxRows; r++) {
        for (let c = 0; c < 5; c++) {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            tile.id = `tile-${r}-${c}`;
            boardDiv.appendChild(tile);
        }
    }
}

function createKeyboard() {
    const keys = "QWERTYUIOPASDFGHJKLZXCVBNM";
    const kb = document.getElementById("keyboard");

    [...keys].forEach(k => {
        const key = document.createElement("div");
        key.classList.add("key");
        key.textContent = k;
        key.onclick = () => pressKey(k);
        kb.appendChild(key);
    });

    const enter = document.createElement("div");
    enter.classList.add("key");
    enter.textContent = "ENTER";
    enter.onclick = submitWord;
    kb.appendChild(enter);

    const del = document.createElement("div");
    del.classList.add("key");
    del.textContent = "⌫";
    del.onclick = deleteKey;
    kb.appendChild(del);
}

function pressKey(letter) {
    if (col < 5) {
        const tile = document.getElementById(`tile-${row}-${col}`);
        tile.textContent = letter;
        col++;
    }
}

function deleteKey() {
    if (col > 0) {
        col--;
        const tile = document.getElementById(`tile-${row}-${col}`);
        tile.textContent = "";
    }
}

function submitWord() {
    if (col < 5) return;

    const guess = [];
    for (let c = 0; c < 5; c++) {
        guess.push(document.getElementById(`tile-${row}-${c}`).textContent.toLowerCase());
    }

    const guessWord = guess.join("");

    if (!words.includes(guessWord)) {
        alert("Palavra inválida!");
        return;
    }

    checkGuess(guessWord);
}

function checkGuess(guess) {
    const secretArr = secret.split("");
    const guessArr = guess.split("");

    for (let i = 0; i < 5; i++) {
        const tile = document.getElementById(`tile-${row}-${i}`);

        setTimeout(() => {
            tile.classList.add("flip");

            if (guessArr[i] === secretArr[i]) {
                tile.classList.add("correct");
            } else if (secretArr.includes(guessArr[i])) {
                tile.classList.add("present");
            } else {
                tile.classList.add("absent");
            }
        }, i * 300);
    }

    if (guess === secret) {
        setTimeout(() => alert("🎉 GANHASTE!"), 1600);
        return;
    }

    row++;
    col = 0;

    if (row === maxRows) {
        setTimeout(() => alert("💀 Perdeste! A palavra era: " + secret), 1600);
    }
}

window.onload = async () => {
    await loadWords();
    createBoard();
    createKeyboard();
};
