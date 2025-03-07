// import { FaWarehouse, FaClipboardList, FaPoll, FaUser, FaBars, FaHive, FaRegEdit, FaFolderOpen } from 'react-icons/fa';
import BGClogo from './assets/images/bgc-logo.png';
// import Json1 from "./assets/locales/main.json";
import "./pages/css/header.css";
import { useEffect, useState } from "react";

export default function Headers() {
    // const htext = Json1["main"];
    // const lang = "en"
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    return (
        <nav className="px-2 py-0  bg-primary-bg d-flex justify-content-between w-100">
            <div className='float-end my-0 my-xl-3 my-lg-1 mx-lg-2'>
                <img src={BGClogo} className='img-logo' alt='logo'></img>
            </div>

            <div className='nav-end'>
                <div className='timer-clock'>
                    <p>{time.toLocaleTimeString()}</p> <p>@ BGC อยุธยากล๊าส</p>
                </div>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
            </button>
            </div>

        </nav>


    )
}