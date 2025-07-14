import React, { useState, useEffect } from "react";
import wordsData from "../words.json";

const ScrabbleGame = ({ setCurrentPage }) => {
  // Game configuration
  const TOTAL_ROUNDS = 4;
  const TIME_PER_ROUND = 5; // seconds
  const POINTS_PER_WORD = 10;

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

  // Reset game
  const resetGame = () => {
    setCurrentPage((prevState) => prevState + 1);
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
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-8 animate-bounce">
            SCRABBLE GAME
          </h1>
          <p className="text-2xl mb-8">
            Unscramble {TOTAL_ROUNDS} words in {TIME_PER_ROUND} seconds each!
          </p>
          <button
            onClick={startGame}
            className="bg-yellow-400 text-black text-2xl px-8 py-4 rounded-lg hover:bg-yellow-300 transition-colors transform hover:scale-105"
          >
            START GAME
          </button>
        </div>
      </div>
    );
  }

  // Render game over screen
  if (isGameOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-8 animate-pulse">GAME OVER!</h1>
          <p className="text-3xl mb-4">Your Final Score:</p>
          <p className="text-8xl font-bold mb-8 text-yellow-300">{score}</p>
          <p className="text-xl mb-8">
            You completed {currentRound + (isCorrect ? 1 : 0)} out of{" "}
            {TOTAL_ROUNDS} rounds
          </p>
          <button
            onClick={resetGame}
            className="bg-yellow-400 text-black text-2xl px-8 py-4 rounded-lg hover:bg-yellow-300 transition-colors transform hover:scale-105"
          >
            PLAY AGAIN
          </button>
        </div>
      </div>
    );
  }

  // Render correct answer screen
  if (isCorrect) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-8xl font-bold animate-bounce text-yellow-300">
            AWESOME!
          </h1>
          <p className="text-2xl mt-4">+{POINTS_PER_WORD} points!</p>
        </div>
      </div>
    );
  }

  // Render time over screen
  if (isTimeOver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold mb-4 animate-pulse">TIME'S UP!</h1>
          <p className="text-2xl">The word was: {gameWords[currentRound]}</p>
        </div>
      </div>
    );
  }

  // Main game screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-pink-600 p-8">
      <div className="max-w-4xl mx-auto text-center text-white">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="text-2xl font-bold">
              Round {currentRound + 1}/{TOTAL_ROUNDS}
            </div>
            <div className="text-2xl font-bold">Score: {score}</div>
          </div>

          {/* Timer */}
          <div
            className={`text-6xl font-bold mb-4 ${time <= 10 ? "text-red-300 animate-pulse" : "text-yellow-300"}`}
          >
            {time}s
          </div>
        </div>

        {/* Word blanks */}
        <div
          className={`flex justify-center gap-4 mb-8 ${isShake ? "animate-shake" : ""}`}
        >
          {gameWords[currentRound]?.split("").map((_, index) => (
            <div
              key={index}
              className="w-16 h-16 border-b-4 border-white flex items-center justify-center"
            >
              <span className="text-3xl font-bold">
                {filledWord[index] || ""}
              </span>
            </div>
          ))}
        </div>

        {/* Scrambled letters */}
        <div className="text-center">
          <p className="text-xl mb-4">Click the letters to unscramble:</p>
          <div className="flex justify-center gap-2 flex-wrap">
            {scrambledWord.split("").map((char, index) => (
              <button
                key={index}
                onClick={() => handleCharacterClick(char, index)}
                disabled={selectedIndices.includes(index)}
                className={`w-16 h-16 text-2xl font-bold rounded-lg transition-all transform hover:scale-105 ${
                  selectedIndices.includes(index)
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed opacity-50"
                    : "bg-yellow-400 text-black hover:bg-yellow-300 shadow-lg"
                }`}
              >
                {char}
              </button>
            ))}
          </div>
        </div>

        {/* Reset button */}
        <button
          onClick={() => {
            setSelectedIndices([]);
            setFilledWord("");
          }}
          className="mt-8 bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-400 transition-colors"
        >
          Clear Word
        </button>
      </div>

      {/* CSS for shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default ScrabbleGame;
