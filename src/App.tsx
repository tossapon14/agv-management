import './App.css';
import Header from './header';
import Home from './pages/home';
import Vehicle from './pages/vehicle';
import Login from './pages/login';
import NotFound from './pages/NotFound';
import Mission from './pages/mission';
import { BiHomeAlt, BiError } from "react-icons/bi";
import { BiFile } from "react-icons/bi";
import { TbTruckDelivery } from "react-icons/tb";
import { PiChartDonutLight } from "react-icons/pi";
import { IoIosLogIn } from "react-icons/io";
import { useEffect, useState } from 'react';
import Alarm from './pages/alarm';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  const [linkFocused, setlinkfocused] = useState<string[]>(Array(6).fill(""));
  useEffect(() => {
    let path = window.location.pathname;
    let index = 5;
    switch (path) {
      case '/home':
        index = 0;
        break;
      case '/':
        index = 4;
        break;
      case '/mission':
        index = 1;
        break;
      case '/vehicle':
        index = 2;
        break;
      case '/statistics':
        index = 3;
        break;
      case '/alarms':
        index = 4;
        break;
      case '/login':
        index = 5;
        break;
      default:
        index = 6;
        break;
    }
    const _linkfocused = Array(6).fill("");
    _linkfocused[index] = 'link-focused';
    setlinkfocused(_linkfocused);
  }, []);
  return (
    // <Home></Home>
    <Router>
      <div className='container-fluid px-0'>
        <Header />
        <section className='content'>
          <div className="drawer">
            <ul>
              <li><a href="/home" className={linkFocused[0]}>
                <BiHomeAlt size='32'></BiHomeAlt>
                หน้าหลัก</a></li>
              <li><a href="/mission" className={linkFocused[1]}><BiFile size='32'></BiFile>งานขนส่ง</a></li>
              <li><a href="/vehicle" className={linkFocused[2]}><TbTruckDelivery size='32'></TbTruckDelivery>รถยนต์</a></li>
              <li><a href="/vehicle" className={linkFocused[3]}><PiChartDonutLight size='32'></PiChartDonutLight>สถิติ</a></li>
              <li><a href="/alarms" className={linkFocused[4]}><BiError size='32'></BiError>ขัดข้อง</a></li>
              <li><a href="/login" className={linkFocused[5]}><IoIosLogIn size='32'></IoIosLogIn>เข้าสู่ระบบ</a></li>
            </ul>

          </div>

          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<Home />} />
            <Route path="/mission" element={<Mission />} />
            <Route path="/vehicle" element={<Vehicle />} />
            <Route path="/alarms" element={<Alarm />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </section>
      </div>
    </Router>
  );
}

export default App;
