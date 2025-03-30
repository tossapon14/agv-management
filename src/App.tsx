import "./App.css";
import Header from "./header";
import Home from "./pages/home";
import Vehicle from "./pages/vehicle";
import Login from "./pages/login";
import NotFound from "./pages/NotFound";
import Mission from "./pages/mission";
import Alarm from "./pages/alarm";
import { BiHomeAlt, BiError, BiFile } from "react-icons/bi";
import { TbTruckDelivery } from "react-icons/tb";
import { PiChartDonutLight } from "react-icons/pi";
import { IoIosLogIn } from "react-icons/io";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, } from "react-router-dom";

// Helper function to protect routes
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  return sessionStorage.getItem("token") ? children : <Navigate to="/login" replace />;
};

function App() {
  const [linkFocused, setLinkFocused] = useState<string[]>(Array(6).fill(""));

  useEffect(() => {
    let path = window.location.pathname;
    let index = 5; // Default to "login"

    switch (path) {
      case "/home":
        index = 0;
        break;
      case "/mission":
        index = 1;
        break;
      case "/vehicle":
        index = 2;
        break;
      case "/statistics":
        index = 3;
        break;
      case "/alarms":
        index = 4;
        break;
      case "/login":
        index = 5;
        break;
      default:
        index = 5; // Redirect unknown paths to login
        break;
    }

    const _linkFocused = Array(6).fill("");
    _linkFocused[index] = "link-focused";
    setLinkFocused(_linkFocused);
  }, []);

  return (
    <Router>
      <div className="container-fluid px-0">
        <Header />
        <section className="content">
          <div className="drawer">
            <ul>
              <li>
                <a href="/home" className={linkFocused[0]}>
                  <BiHomeAlt size="32" />
                  หน้าหลัก
                </a>
              </li>
              <li>
                <a href="/mission" className={linkFocused[1]}>
                  <BiFile size="32" />
                  งานขนส่ง
                </a>
              </li>
              <li>
                <a href="/vehicle" className={linkFocused[2]}>
                  <TbTruckDelivery size="32" />
                  รถยนต์
                </a>
              </li>
              <li>
                <a href="/statistics" className={linkFocused[3]}>
                  <PiChartDonutLight size="32" />
                  สถิติ
                </a>
              </li>
              <li>
                <a href="/alarms" className={linkFocused[4]}>
                  <BiError size="32" />
                  ขัดข้อง
                </a>
              </li>
              <li>
                <a href="/login" className={linkFocused[5]}>
                  <IoIosLogIn size="32" />
                  เข้าสู่ระบบ
                </a>
              </li>
            </ul>
          </div>

          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/mission" element={<PrivateRoute><Mission /></PrivateRoute>} />
            <Route path="/vehicle" element={<PrivateRoute><Vehicle /></PrivateRoute>} />
            <Route path="/statistics" element={<PrivateRoute><Home /></PrivateRoute>} />
            <Route path="/alarms" element={<PrivateRoute><Alarm /></PrivateRoute>} />

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </section>
      </div>
    </Router>
  );
}

export default App;
