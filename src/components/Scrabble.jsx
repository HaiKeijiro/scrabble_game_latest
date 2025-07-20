import React, { useState, useEffect, useCallback, useReducer } from "react";
import wordsData from "../words.json";

const ScrabbleGame = ({ setCurrentPage, userData, setUserData }) => {
  // Game configuration
  const TOTAL_ROUNDS = 4;
  const TIME_PER_ROUND = 15; // seconds
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

  // Consolidated game state using useReducer for better performance
  const initialGameState = {
    gameWords: [],
    currentRound: 0,
    scrambledWord: "",
    selectedIndices: [],
    filledWord: "",
    score: 0,
    time: TIME_PER_ROUND,
    isCorrect: false,
    isEarthquake: false,
    isGameOver: false,
    isTimeOver: false,
    gameStarted: false,
    completedRounds: 0,
  };

  const gameReducer = (state, action) => {
    switch (action.type) {
      case 'SET_GAME_WORDS':
        return { ...state, gameWords: action.payload };
      case 'START_GAME':
        return { ...state, gameStarted: true };
      case 'NEXT_ROUND':
        return {
          ...state,
          currentRound: state.currentRound + 1,
          selectedIndices: [],
          filledWord: "",
          time: TIME_PER_ROUND,
          isCorrect: false,
          isTimeOver: false,
          completedRounds: state.completedRounds + 1,
        };
      case 'GAME_OVER':
        return { ...state, isGameOver: true };
      case 'SET_SCRAMBLED_WORD':
        return { ...state, scrambledWord: action.payload };
      case 'SELECT_CHARACTER':
        return {
          ...state,
          selectedIndices: [...state.selectedIndices, action.index],
          filledWord: state.filledWord + action.char,
        };
      case 'REMOVE_CHARACTER': {
        const newIndices = [...state.selectedIndices];
        newIndices.splice(action.clickedIndex, 1);
        return {
          ...state,
          selectedIndices: newIndices,
          filledWord: state.filledWord.slice(0, action.clickedIndex) + 
                      state.filledWord.slice(action.clickedIndex + 1),
        };
      }
      case 'CLEAR_SELECTION':
        return { ...state, selectedIndices: [], filledWord: "" };
      case 'CORRECT_ANSWER':
        return { 
          ...state, 
          score: state.score + POINTS_PER_WORD, 
          isCorrect: true 
        };
      case 'EARTHQUAKE':
        return { ...state, isEarthquake: action.payload };
      case 'TIME_TICK':
        return { ...state, time: state.time - 1 };
      case 'TIME_OVER':
        return { ...state, isTimeOver: true };
      case 'RESET_GAME':
        return initialGameState;
      default:
        return state;
    }
  };

  const [gameState, dispatch] = useReducer(gameReducer, initialGameState);
  
  // UI state (keep separate as these are independent)
  const [saveError, setSaveError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);

  // Function to save user data with score to database
  const saveUserData = async () => {
    const userDataWithScore = {
      name: userData.name,
      phone: userData.phone,
      score: gameState.score
    };

    try {
      const response = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userDataWithScore),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        console.log("User data saved successfully");
        return { success: true };
      } else {
        console.error("Failed to save user data:", data.error || `HTTP ${response.status}`);
        return { success: false, error: data.error || `HTTP ${response.status}` };
      }
    } catch (error) {
      console.error("Error saving user data:", error);
      return { success: false, error: "Network error - please check your connection" };
    }
  };

  // Handle play again button click
  const handlePlayAgain = async () => {
    setIsSaving(true);
    setSaveError(null);
    
    const result = await saveUserData();
    
    setIsSaving(false);
    
    if (result.success) {
      // Clear the user data state
      setUserData({
        name: "",
        phone: "",
      });
      setCurrentPage(0);
    } else {
      setSaveError(result.error);
    }
  };

  // Handle next round
  const handleNextRound = useCallback(() => {
    if (gameState.currentRound < TOTAL_ROUNDS - 1) {
      dispatch({ type: 'NEXT_ROUND' });
    } else {
      dispatch({ type: 'GAME_OVER' });
    }
  }, [gameState.currentRound, TOTAL_ROUNDS]);

  // Initialize game
  useEffect(() => {
    if (!gameState.gameStarted) {
      const words = getRandomWords();
      dispatch({ type: 'SET_GAME_WORDS', payload: words });
    }
  }, [gameState.gameStarted]);

  // Scramble current word
  useEffect(() => {
    if (gameState.gameWords.length > 0 && gameState.currentRound < gameState.gameWords.length) {
      dispatch({ type: 'SET_SCRAMBLED_WORD', payload: shuffleWord(gameState.gameWords[gameState.currentRound]) });
    }
  }, [gameState.currentRound, gameState.gameWords]);

  // Timer
  useEffect(() => {
    if (gameState.gameStarted && gameState.time > 0 && !gameState.isCorrect && !gameState.isGameOver) {
      const timer = setTimeout(() => dispatch({ type: 'TIME_TICK' }), 1000);
      return () => clearTimeout(timer);
    } else if (gameState.time === 0 && !gameState.isGameOver && !gameState.isTimeOver) {
      dispatch({ type: 'TIME_OVER' });
    }
  }, [gameState.time, gameState.isCorrect, gameState.isGameOver, gameState.gameStarted, gameState.isTimeOver]);

  // Handle time over progression
  useEffect(() => {
    if (gameState.isTimeOver) {
      const timeoutId = setTimeout(() => handleNextRound(), 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [gameState.isTimeOver, handleNextRound]);

  // Handle character click with debouncing
  const handleCharacterClick = useCallback((char, index) => {
    const now = Date.now();
    if (now - lastClickTime < 50) return; // Prevent spam clicks within 50ms
    
    if (gameState.selectedIndices.length < gameState.gameWords[gameState.currentRound]?.length && !gameState.selectedIndices.includes(index)) {
      setLastClickTime(now);
      dispatch({ type: 'SELECT_CHARACTER', char: char, index: index });
    }
  }, [gameState.selectedIndices, gameState.gameWords, gameState.currentRound, lastClickTime]);

  // Handle clicking on filled word to undo
  const handleFilledWordClick = useCallback((clickedIndex) => {
    dispatch({ type: 'REMOVE_CHARACTER', clickedIndex: clickedIndex });
  }, []);

  // Earthquake effect
  const triggerEarthquakeEffect = useCallback(() => {
    dispatch({ type: 'EARTHQUAKE', payload: true });
    setTimeout(() => {
      dispatch({ type: 'EARTHQUAKE', payload: false });
      dispatch({ type: 'CLEAR_SELECTION' });
    }, 800);
  }, []);

  // Check if word is complete and correct
  useEffect(() => {
    if (gameState.filledWord.length === gameState.gameWords[gameState.currentRound]?.length) {
      if (gameState.filledWord === gameState.gameWords[gameState.currentRound]) {
        dispatch({ type: 'CORRECT_ANSWER' });
        const timeoutId = setTimeout(() => handleNextRound(), 2000);
        return () => clearTimeout(timeoutId); // ✅ CLEANUP ADDED
      } else {
        triggerEarthquakeEffect();
      }
    }
  }, [gameState.filledWord, gameState.gameWords, gameState.currentRound, handleNextRound, POINTS_PER_WORD, triggerEarthquakeEffect]);

  // Start game
  const startGame = () => {
    dispatch({ type: 'START_GAME' });
  };

  // Render start screen
  if (!gameState.gameStarted) {
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
  if (gameState.isGameOver) {
    return (
      <main className="another-bg uppercase flex flex-col items-center pt-[20rem] h-screen text-[5em] text-white">
        <h1 className="font-black mb-4 animate-pulse">game over!</h1>
        <p className="text-[0.6em] mb-4">your final score:</p>
        <p className="text-[1.5em] font-black mb-6">{gameState.score}</p>
        <p className="text-[0.3em] mb-8 text-center">
          you completed {gameState.completedRounds} out of {TOTAL_ROUNDS} rounds
        </p>
        {saveError && (
          <div className="mb-4 text-[0.3em] text-red-400 bg-black/30 rounded-2xl px-8 py-3 backdrop-blur-sm">
            ⚠️ Save failed: {saveError}
          </div>
        )}
        <button
          onClick={handlePlayAgain}
          disabled={isSaving}
          className={`bg-button rounded-[10rem] px-12 py-3 text-[0.3em] font-bold transition-colors duration-200 ${
            isSaving 
              ? "opacity-50 cursor-not-allowed" 
              : "hover:bg-[#0f3a7a]"
          }`}
        >
          {isSaving ? "Saving..." : "Home"}
        </button>
      </main>
    );
  }

  // Render correct answer screen
  if (gameState.isCorrect) {
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
  if (gameState.isTimeOver) {
    return (
      <main className="another-bg uppercase flex flex-col items-center pt-[28rem] h-screen text-[5em] text-white">
        <h1 className="font-black mb-4 animate-pulse">time's up!</h1>
        <p className="text-[0.4em] text-center">
          the word was: {gameState.gameWords[gameState.currentRound]}
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
          className={`text-[3em] font-black ${gameState.time <= 2 && "text-red-400 animate-pulse"}`}
        >
          {gameState.time}
        </p>
      </div>

      {/* Score */}
      <div className="mb-6">
        <p className="text-[.5em]">score: {gameState.score}</p>
      </div>

      {/* Word blanks */}
      <div
        className={`flex justify-center gap-4 mb-8 ${gameState.isEarthquake ? "earthquake" : ""}`}
      >
        {gameState.gameWords[gameState.currentRound]?.split("").map((_, index) => (
          <button
            key={index}
            onClick={() => gameState.filledWord[index] && handleFilledWordClick(index)}
            className={`w-12 h-12 border-b-4 border-white flex items-center justify-center transition-all duration-200 ${
              gameState.filledWord[index] 
                ? "cursor-pointer hover:bg-white/20 hover:scale-105" 
                : "cursor-default"
            }`}
          >
            <span className="text-[0.5em] font-bold">
              {gameState.filledWord[index] || ""}
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
          {gameState.scrambledWord.split("").map((char, index) => (
            <button
              key={index}
              onClick={() => handleCharacterClick(char, index)}
              disabled={gameState.selectedIndices.includes(index)}
              className={`w-16 h-16 font-bold text-[0.5em] uppercase transition-all duration-300 transform ${
                gameState.selectedIndices.includes(index)
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
          dispatch({ type: 'CLEAR_SELECTION' });
        }}
        className="mt-6 bg-button rounded-xl px-8 py-3 text-[0.25em] font-bold transition-colors duration-200"
      >
        clear all
      </button>
    </main>
  );
};

export default ScrabbleGame;
