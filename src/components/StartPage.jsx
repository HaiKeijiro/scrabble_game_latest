export default function StartPage({ setCurrentPage }) {
  return (
    <button className="bg-blue-500 p-10 text-white" onClick={() => setCurrentPage((prevState) => prevState + 1)}>
      Start
    </button>
  );
}
