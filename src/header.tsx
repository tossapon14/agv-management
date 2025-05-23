// import { FaWarehouse, FaClipboardList, FaPoll, FaUser, FaBars, FaHive, FaRegEdit, FaFolderOpen } from 'react-icons/fa';
import BGClogo from './assets/images/bgc-logo.png';
// import Json1 from "./assets/locales/main.json";
import "./pages/css/header.css";
import { useEffect, useState, useRef } from "react";
import TH_language_img from './assets/images/thailand.png';
import EN_language_img from './assets/images/united.png';
import { useTranslation } from 'react-i18next';


export default function Headers() {
    const { i18n } = useTranslation();
    const user = (sessionStorage.getItem("user")?.split(",")[4] || "");
    const [lang, setLang] = useState<string>(localStorage.getItem('BGLanguage')??"en");
    const [open, setOpen] = useState<boolean>(false);
    const languageBlockRef = useRef<HTMLDivElement>(null)
     
    const changeLanguage = (lng:string) => {
        i18n.changeLanguage(lng);
        setLang(lng);
    };
    useEffect(() => {
       
        const handle = (e: any) => {
            if (!languageBlockRef.current?.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('click', handle);
        return () => document.removeEventListener('click', handle); // Cleanup on unmount
    }, []);

    return (
        <nav className="headder-nav-bar">
            <div className='float-end my-0 my-xl-3 my-lg-1 mx-lg-2'>
                <img src={BGClogo} className='img-logo' alt='logo'></img>
            </div>

            <div className='nav-end'>
                <div ref={languageBlockRef} className='language-box' onClick={() => setOpen(prev => !prev)}>
                    <button className='btn-language'>
                        {lang == 'th' ? <>
                            <img src={TH_language_img} alt='th'></img>
                            <h6 className='ms-2'>Thai</h6>
                        </> : <>
                            <img src={EN_language_img} alt='en' width={20} height={20}></img>
                            <h6 className='ms-2'>English</h6>
                        </>}
                    </button>
                    <div className={`select-language-box ${!open ? 'd-none' : ''}`}>
                        <button className='btn-language mb-2' onClick={() => changeLanguage('th')}>
                            <img src={TH_language_img} alt='th' width={20} height={20}></img>
                            <h6 className='ms-2'>Thai</h6>
                        </button>
                        <button className='btn-language' onClick={() => changeLanguage('en')}>
                            <img src={EN_language_img} alt='en' width={20} height={20}></img>
                            <h6 className='ms-2'>English</h6>
                        </button>
                    </div>
                </div>
                <div className='timer-clock'>
                    <div className="d-flex align-items-center" >
                        {user && <div className="rounded-circle d-flex  align-items-center justify-content-center me-2" style={{ fontWeight: 'bold', width: "32px", height: "32px", backgroundColor: "rgb(89, 238, 255)", color: 'white' }}>{user[0].toUpperCase()}</div>}
                        <span className='h5 m-0 pe-1'>{user} </span> <span>@ BGC อยุธยากล๊าส</span>
                    </div>
                </div>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
            </div>

        </nav>


    )
}