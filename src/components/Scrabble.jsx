import React, { useState, useEffect } from "react";
import wordsData from "../words.json";

const ScrabbleGame = ({ setCurrentPage }) => {
  // Game configuration
  const TOTAL_ROUNDS = 4;
  const TIME_PER_ROUND = 1; // seconds
  const POINTS_PER_WORD = 25;

  // Shuffle function
  const shuffleWord = (word) => {
    return word
      .split("")
      .sort(() => Math.random() - 0.5)
      .join("");
  };

  // Get random words for the game (4 unique words)
  const getRandomWords = () => {
    const shuffled = [...wordsData.words].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, TOTAL_ROUNDS);
  };

  // States
  const [gameWords, setGameWords] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [scrambledWord, setScrambledWord] = useState("");
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [filledWord, setFilledWord] = useState("");
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(TIME_PER_ROUND);
  const [isCorrect, setIsCorrect] = useState(false);
  const [isShake, setIsShake] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isTimeOver, setIsTimeOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [completedRounds, setCompletedRounds] = useState(0);

  // Initialize game
  useEffect(() => {
    if (!gameStarted) {
      const words = getRandomWords();
      setGameWords(words);
    }
  }, [gameStarted]);

  // Scramble current word
  useEffect(() => {
    if (gameWords.length > 0 && currentRound < gameWords.length) {
      setScrambledWord(shuffleWord(gameWords[currentRound]));
    }
  }, [currentRound, gameWords]);

  // Timer
  useEffect(() => {
    if (gameStarted && time > 0 && !isCorrect && !isGameOver) {
      const timer = setTimeout(() => setTime(time - 1), 1000);
      return () => clearTimeout(timer);
    } else if (time === 0 && !isGameOver) {
      setIsTimeOver(true);
      setTimeout(() => handleNextRound(), 2000);
    }
  }, [time, isCorrect, isGameOver, gameStarted]);

  // Handle character click
  const handleCharacterClick = (char, index) => {
    if (selectedIndices.length < gameWords[currentRound].length) {
      setSelectedIndices([...selectedIndices, index]);
      setFilledWord(filledWord + char);
    }
  };

  // Handle clicking on filled word to undo
  const handleFilledWordClick = (clickedIndex) => {
    // Find which scrambled letter corresponds to this position
    const newFilledWord = filledWord.slice(0, clickedIndex) + filledWord.slice(clickedIndex + 1);
    const newSelectedIndices = [...selectedIndices];
    newSelectedIndices.splice(clickedIndex, 1);
    
    setFilledWord(newFilledWord);
    setSelectedIndices(newSelectedIndices);
  };

  // Check if word is complete and correct
  useEffect(() => {
    if (filledWord.length === gameWords[currentRound]?.length) {
      if (filledWord === gameWords[currentRound]) {
        setScore(score + POINTS_PER_WORD);
        setIsCorrect(true);
        setTimeout(() => handleNextRound(), 2000);
      } else {
        triggerShakeEffect();
      }
    }
  }, [filledWord, gameWords, currentRound]);

  // Handle next round
  const handleNextRound = () => {
    // Increment completed rounds count
    setCompletedRounds(completedRounds + 1);

    if (currentRound < TOTAL_ROUNDS - 1) {
      setCurrentRound(currentRound + 1);
      setSelectedIndices([]);
      setFilledWord("");
      setTime(TIME_PER_ROUND);
      setIsCorrect(false);
      setIsTimeOver(false);
    } else {
      setIsGameOver(true);
    }
  };

  // Start game
  const startGame = () => {
    setGameStarted(true);
  };

  // Shake effect
  const triggerShakeEffect = () => {
    setIsShake(true);
    setTimeout(() => {
      setIsShake(false);
      setSelectedIndices([]);
      setFilledWord("");
    }, 500);
  };

  // Render start screen
  if (!gameStarted) {
    return (
      <main className="another-bg uppercase flex flex-col items-center pt-[28rem] h-screen text-[5em] text-white">
        <h1 className="font-black mb-4">scrabble game</h1>
        <p className="text-[0.4em] mb-8 text-center">
          unscramble {TOTAL_ROUNDS} words in {TIME_PER_ROUND} seconds each!
        </p>
        <button
          onClick={startGame}
          className="bg-button rounded-[10rem] px-16 py-4 text-[0.4em] font-bold transition-colors duration-200 hover:bg-[#0f3a7a]"
        >
          start game
        </button>
      </main>
    );
  }

  // Render game over screen
  if (isGameOver) {
    return (
      <main className="another-bg uppercase flex flex-col items-center pt-[20rem] h-screen text-[5em] text-white">
        <h1 className="font-black mb-4 animate-pulse">game over!</h1>
        <p className="text-[0.6em] mb-4">your final score:</p>
        <p className="text-[1.5em] font-black mb-6">{score}</p>
        <p className="text-[0.3em] mb-8 text-center">
          you completed {completedRounds} out of {TOTAL_ROUNDS} rounds
        </p>
        <button
          onClick={() => setCurrentPage(0)}
          className="bg-button rounded-[10rem] px-12 py-3 text-[0.3em] font-bold transition-colors duration-200 hover:bg-[#0f3a7a]"
        >
          play again
        </button>
      </main>
    );
  }

  // Render correct answer screen
  if (isCorrect) {
    return (
      <main className="another-bg uppercase flex flex-col items-center pt-[28rem] h-screen text-[5em] text-white">
        <h1 className="text-[1.5em] font-black animate-bounce">
          awesome!
        </h1>
        <p className="text-[0.4em]">+{POINTS_PER_WORD} points!</p>
      </main>
    );
  }

  // Render time over screen
  if (isTimeOver) {
    return (
      <main className="another-bg uppercase flex flex-col items-center pt-[28rem] h-screen text-[5em] text-white">
        <h1 className="font-black mb-4 animate-pulse">time's up!</h1>
        <p className="text-[0.4em] text-center">
          the word was: {gameWords[currentRound]}
        </p>
      </main>
    );
  }

  // Main game screen
  return (
    <main className="another-bg uppercase flex flex-col items-center pt-[17rem] h-screen text-[5em] text-white blackbones-font">
      {/* Time */}
      <div>
        <p
          className={`text-[3em] font-black ${time <= 2 && "text-red-400 animate-pulse"}`}
        >
          {time}
        </p>
      </div>

      {/* Score */}
      <div className="mb-6">
        <p className="text-[.5em]">score: {score}</p>
      </div>

      {/* Word blanks */}
      <div
        className={`flex justify-center gap-4 mb-8 ${isShake ? "animate-bounce" : ""}`}
      >
        {gameWords[currentRound]?.split("").map((_, index) => (
          <button
            key={index}
            onClick={() => filledWord[index] && handleFilledWordClick(index)}
            className={`w-12 h-12 border-b-4 border-white flex items-center justify-center transition-all duration-200 ${
              filledWord[index] 
                ? "cursor-pointer hover:bg-white/20 hover:scale-105" 
                : "cursor-default"
            }`}
          >
            <span className="text-[0.5em] font-bold">
              {filledWord[index] || ""}
            </span>
          </button>
        ))}
      </div>

      {/* Card-style letter list */}
      <div className="w-full text-center">
        <p className="text-[0.25em] mb-6 text-center">
          tap the letters to unscramble:
        </p>
        <div className="flex justify-center gap-2 flex-wrap mx-auto">
          {scrambledWord.split("").map((char, index) => (
            <button
              key={index}
              onClick={() => handleCharacterClick(char, index)}
              disabled={selectedIndices.includes(index)}
              className={`w-16 h-16 font-bold text-[0.5em] uppercase transition-all duration-300 transform ${
                selectedIndices.includes(index)
                  ? "opacity-40 cursor-not-allowed scale-95 text-white/60"
                  : "text-white hover:scale-105"
              }`}
            >
              {char}
            </button>
          ))}
        </div>
      </div>

      {/* Clear all button */}
      <button
        onClick={() => {
          setSelectedIndices([]);
          setFilledWord("");
        }}
        className="mt-6 bg-button rounded-xl px-8 py-3 text-[0.25em] font-bold transition-colors duration-200"
      >
        clear all
      </button>
    </main>
  );
};

export default ScrabbleGame;
