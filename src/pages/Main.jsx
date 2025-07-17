import { useState } from "react";
import Start from "../components/Start";
import Register from "../components/Register";
import Scrabble from "../components/Scrabble";

export default function Game() {
  const [currentPage, setCurrentPage] = useState(0);
  const [userData, setUserData] = useState({
    name: "",
    phone: "",
  });

  const pages = [
    <Start setCurrentPage={setCurrentPage} />,
    <Register 
      setCurrentPage={setCurrentPage}
      userData={userData}
      setUserData={setUserData}
    />,
    <Scrabble 
      setCurrentPage={setCurrentPage} 
      userData={userData}
      setUserData={setUserData}
    />,
  ];

  return <div className="blackbones-font">{pages[currentPage]}</div>;
}
