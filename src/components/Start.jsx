export default function Start({ setCurrentPage }) {
  return (
    <main className="another-bg uppercase flex flex-col items-center pt-[26.5rem] h-screen text-[5em] text-white">
      <h1 className="font-black">fast!</h1>
      <h1 className="font-black">and get the price</h1>
      <button
        className="bg-button rounded-[10rem] px-52 py-2 mt-4"
        onClick={() => setCurrentPage((prevState) => prevState + 1)}
      >
        join now
      </button>
    </main>
  );
}
