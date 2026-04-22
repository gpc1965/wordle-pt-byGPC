let secretWord = "";
let wordList = [];
let currentRow = 0;
let currentCol = 0;

async function loadWords() {
    try {
        const response = await fetch("words.txt");
        const text = await response.text();
        wordList = text.split(/\r?\n/).map(w => w.trim()).filter(w => w.length === 5);

        if (wordList.length === 0) {
            throw new Error("Lista vazia");
        }

        secretWord = wordList[Math.floor(Math.random() * wordList.length)].toLowerCase();
        console.log("Palavra secreta:", secretWord);
    } catch (e) {
        alert("Erro ao carregar as palavras.");
        console.error(e);
    }
}

function handleKey(letter) {
    if (currentCol < 5) {
        const cell = document.getElementById(`cell-${currentRow}-${currentCol}`);
        cell.textContent = letter;
        currentCol++;
    }
}

function handleBackspace() {
    if (currentCol > 0) {
        currentCol--;
        const cell = document.getElementById(`cell-${currentRow}-${currentCol}`);
        cell.textContent = "";
    }
}

function handleEnter() {
    if (currentCol < 5) return;

    let guess = "";
    for (let i = 0; i < 5; i++) {
        guess += document.getElementById(`cell-${currentRow}-${i}`).textContent.toLowerCase();
    }

    if (!wordList.includes(guess)) {
        alert("Palavra inválida.");
        return;
    }

    for (let i = 0; i < 5; i++) {
        const cell = document.getElementById(`cell-${currentRow}-${i}`);
        const letter = guess[i];

        if (letter === secretWord[i]) {
            cell.classList.add("correct");
        } else if (secretWord.includes(letter)) {
            cell.classList.add("present");
        } else {
            cell.classList.add("absent");
        }
    }

    if (guess === secretWord) {
        alert("Parabéns! Acertaste!");
        return;
    }

    currentRow++;
    currentCol = 0;

    if (currentRow === 6) {
        alert("Fim de jogo! A palavra era: " + secretWord);
    }
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleEnter();
    else if (e.key === "Backspace") handleBackspace();
    else if (/^[a-zA-Z]$/.test(e.key)) handleKey(e.key.toUpperCase());
});

loadWords();
