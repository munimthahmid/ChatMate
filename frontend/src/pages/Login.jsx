import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";
import PageNav from "../components/PageNav";
import { motion } from "framer-motion";

const BASE_URL = "http://localhost:8000";
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  function handleCrossClick(e) {
    e.preventDefault();
    navigate("/");
  }
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { username, password } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = new URLSearchParams();
      body.append("username", username);
      body.append("password", password);

      const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (response.ok) {
        const data = await response.json();

        const userResponse = await fetch(`${BASE_URL}/users/me`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.access_token}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          login(data.access_token, userData);
          navigate("/dashboard");
        } else {
          setError("Failed to fetch user details");
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Login Failed");
      }
    } catch (err) {
      console.log(err);
      setError("An unexpected error occured");
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
            <h2 className="font-mono mb-5 text-4xl font-bold">Log In</h2>
            <p className="max-w-sm mb-4 text-md font-sans text-gray-600">
              Log in to your account to continue sky rocketing your career
              growth!
            </p>

            <motion.input
              type="username"
              className="w-full p-3 rounded-md placeholder:font-serif placeholder:font-light placeholder:text-sm text-sm mb-4 bg-white border-gray-300 border"
              placeholder="Enter your username"
              id="username"
              name="username"
              onChange={(e) => handleChange(e)}
              value={username}
              variants={itemVariants}
            />
            <motion.input
              type="password"
              className="w-full p-3 rounded-md placeholder:font-serif placeholder:font-light placeholder:text-sm text-sm mb-4 bg-white border-gray-300 border"
              placeholder="Enter your password"
              id="password"
              name="password"
              onChange={(e) => handleChange(e.target.value)}
              value={password}
              variants={itemVariants}
            />

            <motion.div
              className="flex flex-col items-center justify-between mt-6 space-y-6 md:flex-row md:space-y-0"
              variants={itemVariants}
            >
              <div className="font-light text-cyan-850">Forgot password?</div>

              <button
                className="w-full md:w-auto flex justify-center items-center px-5 py-3 space-x-4 font-sans font-bold text-white rounded-md shadow-lg px-9 careercompass-bg shadow-cyan-100 hover:bg-opacity-90 hover:shadow-lg border transition hover:-translate-y-0.5 duration-150"
                onClick={handleSubmit}
              >
                <span>Login</span>
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
export default Login;
