import { useState, useMemo } from "react";
import Start from "../components/Start";
import Register from "../components/Register";
import Scrabble from "../components/Scrabble";

export default function Game() {
  const [currentPage, setCurrentPage] = useState(0);
  const [userData, setUserData] = useState({
    name: "",
    phone: "",
  });

  // Memoize pages array to prevent unnecessary re-renders
  const pages = useMemo(() => [
    <Start key="start" setCurrentPage={setCurrentPage} />,
    <Register 
      key="register"
      setCurrentPage={setCurrentPage}
      userData={userData}
      setUserData={setUserData}
    />,
    <Scrabble 
      key="scrabble"
      setCurrentPage={setCurrentPage} 
      userData={userData}
      setUserData={setUserData}
    />,
  ], [userData]);

  return <div className="blackbones-font">{pages[currentPage]}</div>;
}
