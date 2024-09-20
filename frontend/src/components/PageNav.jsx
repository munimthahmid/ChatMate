import { useState } from "react";
import { NavLink } from "react-router-dom";

function PageNav({ isHome = false }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const homeClass = !isHome ? "text-sky-950" : "text-white";
  const baseLinkClasses =
    "block text-inherit no-underline font-lato font-bold text-base py-2 px-4 rounded-md text-lg transition-all duration-300 " +
    homeClass;
  const activeLinkClasses = "bg-var-color-dark--0";
  const hoverClass = "hover:careercompass-text";
  const logoClass =
    "font-bold py-2 px-2 rounded-md text-xl md:text-2xl lg:text-3xl xl:text-3xl font-lato";

  return (
    <nav className="pt-4 mb-8 flex flex-row justify-around items-center relative">
      <NavLink to="/" className="flex items-center justify-start space-x-4">
        <img
          src="/public/assets/images/botIcon.jpg"
          alt="ChatMate logo"
          className="rounded-md"
          width={50}
          height={50}
        />
        <h1
          className={`${logoClass} ${
            isHome ? "careercompass-text" : "text-sky-950"
          }`}
        >
          ChatMate
        </h1>
      </NavLink>
      <button
        className="md:hidden text-white"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
          ></path>
        </svg>
      </button>
      <div
        className={`${
          isMenuOpen ? "block" : "hidden"
        } md:block absolute top-full right-0 w-48 md:w-auto bg-var-color-dark--2 md:bg-transparent rounded-lg md:rounded-none md:static md:flex md:space-x-4 z-50`}
      >
        <ul className="list-none flex flex-col md:flex-row">
          <li>
            <NavLink
              to="/dashboard/chat"
              className={({ isActive }) =>
                `${baseLinkClasses} ${hoverClass} ${
                  isActive ? activeLinkClasses : ""
                }`
              }
            >
              Chat
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/resources"
              className={({ isActive }) =>
                `${baseLinkClasses} ${hoverClass} ${
                  isActive ? activeLinkClasses : ""
                }`
              }
            >
              Resources
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/train-chatbot"
              className={({ isActive }) =>
                `${baseLinkClasses} ${hoverClass} ${
                  isActive ? activeLinkClasses : ""
                }`
              }
            >
              Train Chatbot
            </NavLink>
          </li>
        </ul>
      </div>
      <ul className="hidden md:flex space-x-2">
        <li>
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `${baseLinkClasses} ${
                isActive ? activeLinkClasses : ""
              } careercompass-bg text-white hover:bg-black mr-2 active:bg-black`
            }
          >
            Login
          </NavLink>
        </li>
        <li>
          <NavLink
            to="/signup"
            className={({ isActive }) =>
              `${baseLinkClasses} ${
                isActive ? activeLinkClasses : ""
              } bg-gray-600 hover:bg-black active:bg-black ${
                !isHome ? "text-sky-950 hover:text-white" : ""
              }`
            }
          >
            Signup
          </NavLink>
        </li>
      </ul>
      )
    </nav>
  );
}

export default PageNav;
