import { useState } from "react";

export default function Register({ setCurrentPage, userData, setUserData }) {
  const [name, setName] = useState(userData.name);
  const [phone, setPhone] = useState(userData.phone);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Update the user data in the main component
    setUserData({
      name: name.trim(),
      phone: phone.trim(),
    });

    // Move to next page
    setCurrentPage((prevState) => prevState + 1);
  };

  return (
    <main className="register-bg uppercase flex flex-col items-center pt-[26.5rem] h-screen text-[5em] text-white">
      <h1 className="font-black">fast!</h1>
      <h1 className="font-black">and get the price</h1>

      <form
        onSubmit={handleSubmit}
        className="text-black w-[75%] flex flex-col gap-6 text-[.5em]"
      >
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
          type="phone"
          name="phone"
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number"
          required
          minLength="10"
          maxLength="15"
          className="bg-white/90 rounded-[10rem] pl-10 pr-6 py-2 mx-auto w-full font-medium placeholder-black border-none outline-none"
        />

        <button className="bg-button rounded-[10rem] w-1/2 py-2 mx-auto font-bold transition-colors duration-200">
          Register
        </button>
      </form>
    </main>
  );
}
