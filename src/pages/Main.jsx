import { useState } from "react";
import Start from "../components/Start";
import Register from "../components/Register";
import Scrabble from "../components/Scrabble";
import Score from "../components/Score";

export default function Game() {
  const [currentPage, setCurrentPage] = useState(0);

  const pages = [
    <Start setCurrentPage={setCurrentPage} />,
    <Register currentPage={currentPage} setCurrentPage={setCurrentPage} />,
    <Scrabble setCurrentPage={setCurrentPage} />,
    <Score setCurrentPage={setCurrentPage} />,
  ];

  return <div>{pages[currentPage]}</div>;
}
