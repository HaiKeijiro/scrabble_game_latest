import { Route, Routes } from "react-router-dom";
import Main from "./pages/Main";
import Database from "./pages/Database";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Main />} />
      <Route path="/database" element={<Database />} />
    </Routes>
  );
}

export default App;
