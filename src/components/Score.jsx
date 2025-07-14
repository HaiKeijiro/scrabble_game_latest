import React, { useState, useEffect } from "react";

export default function Score({ setCurrentPage }) {
  const [userScore, setUserScore] = useState(0);

  useEffect(() => {
    // Get score and name from localStorage
    const savedScore = localStorage.getItem("userScore");

    if (savedScore) {
      setUserScore(parseInt(savedScore));
    }
  }, []);

  const handleContinue = () => {
    if (setCurrentPage) {
      setCurrentPage((prevState) => prevState + 1);
    }
  };

  const handlePlayAgain = () => {
    // Reset to the starting page
    if (setCurrentPage) {
      setCurrentPage(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-400 to-orange-600 flex items-center justify-center">
      <div className="text-center text-white max-w-2xl mx-auto p-8">
        <h1 className="text-6xl font-bold mb-8 animate-bounce">FINAL SCORE</h1>

        <div className="bg-white bg-opacity-20 rounded-3xl p-8 mb-8 backdrop-blur-sm">
          <p className="text-2xl mb-4">Your Scrabble Score:</p>
          <p className="text-8xl font-bold text-yellow-300 mb-4 animate-pulse">
            {userScore}
          </p>
          <p className="text-xl opacity-80">
            {userScore >= 40
              ? "Perfect Game! 🎉"
              : userScore >= 30
                ? "Excellent! 👏"
                : userScore >= 20
                  ? "Good Job! 👍"
                  : userScore >= 10
                    ? "Not bad! 😊"
                    : "Keep practicing! 💪"}
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={handlePlayAgain}
            className="bg-green-500 text-white text-xl px-8 py-4 rounded-lg hover:bg-green-400 transition-colors transform hover:scale-105"
          >
            PLAY AGAIN
          </button>

          {setCurrentPage && (
            <button
              onClick={handleContinue}
              className="bg-blue-500 text-white text-xl px-8 py-4 rounded-lg hover:bg-blue-400 transition-colors transform hover:scale-105"
            >
              CONTINUE
            </button>
          )}
        </div>

        <div className="mt-8 text-sm opacity-70">
          <p>Game Statistics:</p>
          <p>Maximum possible score: 40 points</p>
          <p>Points per word: 10</p>
        </div>
      </div>
    </div>
  );
}
