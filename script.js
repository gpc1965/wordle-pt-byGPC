const BOARD_ROWS = 6;
const WORD_LENGTH = 5;

let solution = null;
let currentRow = 0;
let currentCol = 0;
let isGameOver = false;
let wordsList = [];

const boardEl = document.getElementById("board");
const keyboardEl = document.getElementById("keyboard");
const messageEl = document.getElementById("message");

const sndKey = document.getElementById("snd-key");
const sndWin = document.getElementById("snd-win");
const sndLose = document.getElementById("snd-lose");

const keyboardLayout = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["enter", "z", "x", "c", "v", "b", "n", "m", "backspace"]
];

const extraKeys = ["á", "à", "ã", "â", "é", "ê", "í", "ó", "ô", "õ", "ú", "ç"];

const sources = [
  "https://raw.githubusercontent.com/lorenbrichter/Words/master/Portuguese.txt",
  "https://raw.githubusercontent.com/fserb/pt-br-wordlist/master/wordlist.txt",
  "https://raw.githubusercontent.com/words/an-array-of-portuguese-words/master/index.json"
];

function normalize(str) {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ç/g, "c");
}

async function loadOnlineWordlist() {
  const url = sources[Math.floor(Math.random() * sources.length)];
  console.log("Lista escolhida:", url);

  const res = await fetch(url);
  const contentType = res.headers.get("content-type") || "";
  let words = [];

  if (contentType.includes("application/json")) {
    const data = await res.json();
    if (Array.isArray(data)) {
      words = data.map(String);
    }
  } else {
    const text = await res.text();
    words = text.split(/\r?\n/);
  }

  words = words
    .map((w) => w.trim().toLowerCase())
    .filter((w) => w.length === WORD_LENGTH && /^[a-záàãâéêíóôõúç]+$/.test(w));

  // remover duplicados
  words = Array.from(new Set(words));

  return words;
}

function pickRandomSolutionFrom(words) {
  const idx = Math.floor(Math.random() * words.length);
  const original = words[idx];
  const normalizado = normalize(original);
  return { original, normalizado };
}

function createBoard() {
  for (let r = 0; r < BOARD_ROWS; r++) {
    const row = document.createElement("div");
    row.classList.add("row");
    row.dataset.row = r;
    for (let c = 0; c < WORD_LENGTH; c++) {
      const tile = document.createElement("div");
      tile.classList.add("tile");
      tile.dataset.row = r;
      tile.dataset.col = c;
      row.appendChild(tile);
    }
    boardEl.appendChild(row);
  }
}

function createKeyboard() {
  keyboardLayout.forEach((rowKeys, rowIndex) => {
    const row = document.createElement("div");
    row.classList.add("keyboard-row");

    rowKeys.forEach((key) => {
      const btn = document.createElement("button");
      btn.classList.add("key");

      if (key === "enter") {
        btn.textContent = "ENTER";
        btn.classList.add("wide");
      } else if (key === "backspace") {
        btn.textContent = "⌫";
        btn.classList.add("wide");
      } else {
        btn.textContent = key;
      }

      btn.dataset.key = key;
      btn.addEventListener("click", () => handleVirtualKey(key));
      row.appendChild(btn);
    });

    keyboardEl.appendChild(row);

    if (rowIndex === 1) {
      const extraRow = document.createElement("div");
      extraRow.classList.add("keyboard-row");
      extraKeys.forEach((k) => {
        const btn = document.createElement("button");
        btn.classList.add("key");
        btn.textContent = k;
        btn.dataset.key = k;
        btn.addEventListener("click", () => handleVirtualKey(k));
        extraRow.appendChild(btn);
      });
      keyboardEl.appendChild(extraRow);
    }
  });
}

function playSound(audio) {
  if (!audio) return;
  audio.currentTime = 0;
  audio.play().catch(() => {});
}

function showMessage(text, duration = 1500) {
  messageEl.textContent = text;
  if (duration > 0) {
    setTimeout(() => {
      if (messageEl.textContent === text) {
        messageEl.textContent = "";
      }
    }, duration);
  }
}

function getCurrentGuess() {
  let guess = "";
  for (let c = 0; c < WORD_LENGTH; c++) {
    const tile = document.querySelector(
      `.tile[data-row="${currentRow}"][data-col="${c}"]`
    );
    guess += tile.textContent || "";
  }
  return guess.toLowerCase();
}

function setTileLetter(row, col, letter) {
  const tile = document.querySelector(
    `.tile[data-row="${row}"][data-col="${col}"]`
  );
  if (!tile) return;
  tile.textContent = letter.toUpperCase();
  if (letter) {
    tile.classList.add("filled");
    tile.classList.add("pop");
    setTimeout(() => tile.classList.remove("pop"), 120);
  } else {
    tile.classList.remove("filled");
  }
}

function handleVirtualKey(key) {
  if (isGameOver) return;
  playSound(sndKey);

  if (key === "enter") {
    submitGuess();
  } else if (key === "backspace") {
    deleteLetter();
  } else {
    addLetter(key);
  }
}

function handlePhysicalKey(e) {
  if (isGameOver) return;

  const key = e.key.toLowerCase();

  if (key === "enter") {
    playSound(sndKey);
    submitGuess();
  } else if (key === "backspace" || key === "delete") {
    playSound(sndKey);
    deleteLetter();
  } else if (/^[a-záàãâéêíóôõúç]$/i.test(key)) {
    playSound(sndKey);
    addLetter(key);
  }
}

function addLetter(letter) {
  if (currentCol >= WORD_LENGTH) return;
  setTileLetter(currentRow, currentCol, letter);
  currentCol++;
}

function deleteLetter() {
  if (currentCol === 0) return;
  currentCol--;
  setTileLetter(currentRow, currentCol, "");
}

function isValidWord(guess) {
  const norm = normalize(guess);
  return wordsList.some((w) => normalize(w) === norm);
}

function updateKeyboardColors(guess, result) {
  for (let i = 0; i < guess.length; i++) {
    const letter = guess[i].toLowerCase();
    const status = result[i];
    const keyBtn = keyboardEl.querySelector(`.key[data-key="${letter}"]`);
    if (!keyBtn) continue;

    if (status === "correct") {
      keyBtn.classList.remove("present", "absent");
      keyBtn.classList.add("correct");
    } else if (status === "present") {
      if (!keyBtn.classList.contains("correct")) {
        keyBtn.classList.remove("absent");
        keyBtn.classList.add("present");
      }
    } else if (status === "absent") {
      if (
        !keyBtn.classList.contains("correct") &&
        !keyBtn.classList.contains("present")
      ) {
        keyBtn.classList.add("absent");
      }
    }
  }
}

function submitGuess() {
  if (currentCol < WORD_LENGTH) {
    shakeRow(currentRow);
    showMessage("Faltam letras.");
    return;
  }

  const guess = getCurrentGuess();
  if (!isValidWord(guess)) {
    shakeRow(currentRow);
    showMessage("Palavra inválida.");
    return;
  }

  const normGuess = normalize(guess);
  const normSolution = solution.normalizado;

  const result = Array(WORD_LENGTH).fill("absent");
  const solutionChars = normSolution.split("");

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (normGuess[i] === normSolution[i]) {
      result[i] = "correct";
      solutionChars[i] = null;
    }
  }

  for (let i = 0; i < WORD_LENGTH; i++) {
    if (result[i] === "correct") continue;
    const idx = solutionChars.indexOf(normGuess[i]);
    if (idx !== -1) {
      result[i] = "present";
      solutionChars[idx] = null;
    }
  }

  revealRow(currentRow, guess, result);
}

function shakeRow(rowIndex) {
  for (let c = 0; c < WORD_LENGTH; c++) {
    const tile = document.querySelector(
      `.tile[data-row="${rowIndex}"][data-col="${c}"]`
    );
    tile.classList.add("shake");
    setTimeout(() => tile.classList.remove("shake"), 300);
  }
}

function revealRow(rowIndex, guess, result) {
  for (let i = 0; i < WORD_LENGTH; i++) {
    const tile = document.querySelector(
      `.tile[data-row="${rowIndex}"][data-col="${i}"]`
    );
    setTimeout(() => {
      tile.classList.add("flip");
      tile.addEventListener(
        "animationend",
        () => {
          tile.classList.remove("flip");
          tile.classList.add(result[i]);
        },
        { once: true }
      );
    }, i * 250);
  }

  setTimeout(() => {
    updateKeyboardColors(guess, result);

    if (result.every((r) => r === "correct")) {
      isGameOver = true;
      playSound(sndWin);
      showMessage(
        `Acertaste! A palavra era "${solution.original.toUpperCase()}".`,
        0
      );
      return;
    }

    currentRow++;
    currentCol = 0;

    if (currentRow >= BOARD_ROWS) {
      isGameOver = true;
      playSound(sndLose);
      showMessage(
        `Fim de jogo. A palavra era "${solution.original.toUpperCase()}".`,
        0
      );
    }
  }, WORD_LENGTH * 260);
}

async function init() {
  createBoard();
  createKeyboard();
  window.addEventListener("keydown", handlePhysicalKey);

  showMessage("A carregar lista de palavras...", 0);
  try {
    wordsList = await loadOnlineWordlist();
    if (!wordsList || wordsList.length === 0) {
      showMessage("Erro ao carregar palavras.", 0);
      isGameOver = true;
      return;
    }
    solution = pickRandomSolutionFrom(wordsList);
    console.log("Solução:", solution.original, `(${solution.normalizado})`);
    showMessage("");
  } catch (e) {
    console.error(e);
    showMessage("Erro ao carregar lista online.", 0);
    isGameOver = true;
  }
}

document.addEventListener("DOMContentLoaded", init);
