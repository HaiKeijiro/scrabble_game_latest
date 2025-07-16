import { useState } from "react";

export default function Register({ currentPage, setCurrentPage }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const saveData = async () => {
    const userdata = {
      name: name.trim(),
      phone: phone.trim(),
    };

    try {
      const response = await fetch("http://localhost:3001/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userdata),
      });

      if (response.ok) {
        console.log("User registered successfully");
        return true;
      }
    } catch (error) {
      console.error("Error registering user:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentPage === 1) {
      const success = await saveData();
      if (!success) {
        return; // Don't proceed to next page if registration failed
      }
    }

    setCurrentPage((prevState) => prevState + 1);
  };

  return (
    <main className="register-bg uppercase flex flex-col items-center pt-[28rem] h-screen text-[5em] text-white">
      <h1 className="font-black">fast!</h1>
      <h1 className="font-black">and get the price</h1>

      <form onSubmit={handleSubmit} className="text-black w-[75%] flex flex-col gap-6 text-[.5em]">
        <input
          type="text"
          name="name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          required
          className="bg-white/90 rounded-[10rem] pl-10 pr-6 py-2 mx-auto w-full font-medium placeholder-black border-none outline-none"
        />

        <input
          type="number"
          name="phone"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number"
          required
          className="bg-white/90 rounded-[10rem] pl-10 pr-6 py-2 mx-auto w-full font-medium placeholder-black border-none outline-none"
        />

        <button
          type="submit"
          className="bg-button rounded-[10rem] w-1/2 py-2 mx-auto font-bold transition-colors duration-200"
        >
          Register
        </button>
      </form>
    </main>
  );
}
