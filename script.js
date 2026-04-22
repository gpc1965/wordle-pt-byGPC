let words = [];
let secret = "";
let row = 0;
let col = 0;
let board = [];
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
        board[r] = [];
        for (let c = 0; c < 5; c++) {
            const tile = document.createElement("div");
            tile.classList.add("tile");
            tile.id = `tile-${r}-${c}`;
            board[r][c] = tile;
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
        board[row][col].textContent = letter;
        col++;
    }
}

function deleteKey() {
    if (col > 0) {
        col--;
        board[row][col].textContent = "";
    }
}

function submitWord() {
    if (col < 5) return;

    const guess = board[row].map(t => t.textContent.toLowerCase()).join("");

    if (!words.includes(guess)) {
        alert("Palavra inválida!");
        return;
    }

    checkGuess(guess);
}

function checkGuess(guess) {
    const secretArr = secret.split("");
    const guessArr = guess.split("");

    for (let i = 0; i < 5; i++) {
        const tile = board[row][i];

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
