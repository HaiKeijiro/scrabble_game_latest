import { useState } from "react";

export default function Register({ currentPage, setCurrentPage }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handleRegister = async () => {
    const userdata = {
      name: name.trim(),
      phone: phone.trim(),
    };

    if (!userdata.name || !userdata.phone) {
      return false;
    }

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
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error registering user:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentPage === 1) {
      const success = await handleRegister();
      if (!success) {
        return; // Don't proceed to next page if registration failed
      }
    }

    setCurrentPage((prevState) => prevState + 1);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-md p-2 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border-2 border-gray-300 rounded-md p-2 focus:border-blue-500 focus:outline-none"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
