import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
const BASE_URL = "http://localhost:8000";
import { motion } from "framer-motion";
import PageNav from "../components/PageNav";
const Signup = () => {
  const { login } = useContext(AuthContext); // Access the login function from context
  const navigate = useNavigate(); // Hook for navigation

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  function handleCrossClick(e) {
    e.preventDefault();
    navigate("/");
  }
  const [error, setError] = useState(""); // To handle and display errors
  const [loading, setLoading] = useState(false); // To handle loading state

  const { username, email, password } = formData;

  // Handle input changes
  const handleChange = (e) => {
    console.log("Inside handle change");
    console.log(e);
    console.log(e.target.name);
    console.log(e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Send POST request to FastAPI /users/ endpoint for signup
      const response = await fetch(`${BASE_URL}/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Send data as JSON
      });

      if (response.ok || response.status === 201) {
        const data = await response.json();

        // Automatically log in the user after signup
        const loginResponse = await fetch(`${BASE_URL}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            username: data.username,
            password: formData.password,
          }).toString(), // Send login data as URL-encoded
        });

        if (loginResponse.ok) {
          const loginData = await loginResponse.json();
          login(loginData.access_token, data); // Update auth context
          navigate("/dashboard"); // Redirect to protected route
        } else {
          setError("Signup successful, but failed to log in.");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Signup failed.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };
  const containerVariants = {
    hidden: { opacity: 1 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.42, 0, 0.58, 1],
      },
    },
  };

  return (
    <motion.main
      className="page-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      <PageNav />
      <div className="flex items-center justify-center text-black">
        <motion.div
          className="relative flex flex-col m-6 space-y-10 bg-white shadow-2xl rounded-2xl md:flex-row md:space-y-0 md:m-0"
          variants={containerVariants}
        >
          <motion.div className="p-6 md:p-10" variants={itemVariants}>
            <h2 className="font-mono mb-5 text-4xl font-bold">Sign Up</h2>
            <p className="max-w-sm mb-4 text-md font-sans text-gray-600">
              Please Register an account!
            </p>

            <motion.input
              type="username"
              className="w-full p-3 rounded-md placeholder:font-serif placeholder:font-light placeholder:text-sm text-sm mb-4 bg-white border-gray-300 border"
              placeholder="Enter your username"
              id="username"
              name="username"
              onChange={handleChange}
              value={username}
              variants={itemVariants}
            />
            <motion.input
              type="email"
              className="w-full p-3 rounded-md placeholder:font-serif placeholder:font-light placeholder:text-sm text-sm mb-4 bg-white border-gray-300 border"
              placeholder="Enter your email"
              id="email"
              name="email"
              onChange={handleChange}
              value={email}
              variants={itemVariants}
            />
            <motion.input
              type="password"
              className="w-full p-3 rounded-md placeholder:font-serif placeholder:font-light placeholder:text-sm text-sm mb-4 bg-white border-gray-300 border"
              placeholder="Enter your password"
              id="password"
              name="password"
              onChange={handleChange}
              value={password}
              variants={itemVariants}
            />

            <motion.div
              className="w-full mt-6 space-y-6 md:flex-row md:space-y-0"
              variants={itemVariants}
            >
              <button
                className="w-full md:w-full flex justify-center items-center px-5 py-3 space-x-4 font-sans font-bold text-white rounded-md shadow-lg px-9 careercompass-bg shadow-cyan-100 hover:bg-opacity-90 hover:shadow-lg border transition hover:-translate-y-0.5 duration-150"
                onClick={handleSubmit}
              >
                <span className="w-full uppercase">Sign Up</span>
              </button>
            </motion.div>

            <motion.div
              className="mt-12 border-b border-b-gray-300"
              variants={itemVariants}
            ></motion.div>

            <motion.p
              className="py-6 text-lg text-center text-gray-800"
              variants={itemVariants}
            >
              or log in with
            </motion.p>

            <motion.div
              className="flex flex-col space-x-0 space-y-6 md:flex-row md:space-x-4 md:space-y-0"
              variants={itemVariants}
            >
              <button className="flex items-center justify-center py-2 space-x-3 border rounded shadow-sm hover:bg-opacity-30 hover:shadow-lg hover:-translate-y-0.5 transition duration-150 md:w-1/2">
                <img
                  src="public/assets/images/facebook.png"
                  alt=""
                  className="w-9"
                />
                <span className="font-semibold">Facebook</span>
              </button>
              <button className="flex items-center justify-center py-2 space-x-3 border border-gray-300 rounded shadow-sm hover:bg-opacity-30 hover:shadow-lg hover:-translate-y-0.5 transition duration-150 md:w-1/2">
                <img
                  src="public/assets/images/google.png"
                  alt=""
                  className="w-9"
                />
                <span className="font-semibold">Google</span>
              </button>
            </motion.div>
          </motion.div>

          <motion.img
            src="public/assets/images/loginSideBarImage2.jpg"
            alt=""
            className="w-[390px] hidden md:block"
            variants={itemVariants}
          />

          <motion.div
            className="group absolute -top-5 right-4 flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full md:bg-white md:top-4 hover:cursor-pointer hover:-translate-y-0.5 transition duration-150"
            onClick={handleCrossClick}
            variants={itemVariants}
          >
            <img src="public/assets/Icons/cross.svg" alt="Close" />
          </motion.div>
        </motion.div>
      </div>
    </motion.main>
  );
};

export default Signup;
