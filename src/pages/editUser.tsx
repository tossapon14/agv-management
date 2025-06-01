import { useState, useEffect, useCallback } from 'react';
import './css/createuser.css';
import AddUserImage from '../assets/images/add-user.png';
import { FaUserGear } from "react-icons/fa6";
import CreateUserImg from '../assets/images/creat-user.jpg';
import NetworkError from './networkError';
import { axiosPut } from "../api/axiosFetch";
import { useSearchParams, useNavigate } from "react-router-dom";
import { IoMdClose } from "react-icons/io";
import { useTranslation } from 'react-i18next';


interface IUserInfo {
    message: string,
    details?: string,
    payload: {
        name: string,
        username: string,
        employee_no: string,
        position: string,
        status: boolean
    }
}

export default function EditUser() {
    const navigate = useNavigate();

    const [errorPosition, setErrorPosition] = useState(false);
    const [position, setPosition] = useState<string[]>([]);
    const [checkNetwork, setCheckNetwork] = useState(true);
    const [response, setResponse] = useState<{ show: boolean, error: boolean | null, message: string }>({ show: false, error: false, message: '' });
    const [load, setLoad] = useState(false);
    const { t } = useTranslation("user");

    const [searchParams] = useSearchParams();
    const [userInfo, setUserInfo] = useState({
        employee_no: searchParams.get("employee_no") || "",
        username: searchParams.get("username") || "",
        name: searchParams.get("name") || "",
        position: searchParams.get("position") || "0",
    });


    const submitUserForm = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent the default form submission behavior
        const form = e.target; // or document.getElementById('myForm');
        const formData = new FormData(form as HTMLFormElement); // Create a FormData object from the form element
        const data = Object.fromEntries(formData.entries()); // Convert FormData to a plain object
        if (data.position === '0') {
            setErrorPosition(true)
            return
        } else {
            try {
                setLoad(true);
                const res: IUserInfo = await axiosPut('/user/edit_user', data);
                console.log(res);
                if (res.message) {
                    setResponse({ show: true, error: false, message: res.message });
                    setTimeout(() => {
                        navigate(-1)
                    }, 3000);
                }
            } catch (e: any) {
                console.error(e);
                if (e.response?.data?.detail) {
                    setResponse({ show: true, error: true, message: e.response.data.detail });
                } else {
                    setResponse({ show: true, error: true, message: e.message });
                }
            } finally {
                setLoad(false);

            }
        }

    }
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserInfo({ ...userInfo, [name]: value });
    };
    const buttonBackLogin = useCallback(() => {
        window.location.href = "/signup-admin";
    }, [])

    useEffect(() => {

        const checkNetwork = async () => {
            if (sessionStorage.getItem('user')!.split(",")[2] !== "admin") {
                window.location.href = "/login";
            }
            try {
                const response = await fetch(import.meta.env.VITE_REACT_APP_API_URL, { method: "GET" });
                if (response.ok) {
                    if (sessionStorage.getItem('vehicle')) {
                        const listvehicle: string[] = JSON.parse(sessionStorage.getItem('vehicle') as string)
                        const vehicle = listvehicle.map((ele) => {
                            if (ele === "ALL") {
                                return "admin"; // Modify the value if condition is met
                            }
                            return ele;
                        });
                        setPosition(vehicle);
                    };
                }
            } catch (e: any) {
                console.error(e);
                setCheckNetwork(false);
            }
        };
        checkNetwork();
    }, []);

    return (<>
        {!checkNetwork ?
            <div className='w-100 mt-5'><NetworkError /></div> :
            <div className='user-modal-bg'>
                {load && <div className='loading-background top-positio-0'>
                    <div id="loading"></div>
                </div>}
                <div id='modal55' className="card-modal height-card-modal-edit">
                    <button className="button-close" onClick={buttonBackLogin}><IoMdClose size={18} color={'#000000'}></IoMdClose></button>
                    <img src={CreateUserImg} alt="edit" className='img-create-user' />
                    <div className="card-user">
                        <div>
                            <h4>
                                <img src={AddUserImage} alt="edit" width={32} height={32} />
                                <span className='text-primary fw-bold mx-2'>BGC</span>{t('edit_us')}
                            </h4>
                            {response.show ? <h5 className={`text-response ${response.error ? 'bg-error' : 'bg-ok'}`}>{response.message}</h5>
                                : <form onSubmit={submitUserForm}>

                                    <label htmlFor="username">{t('user')}</label>
                                    <input type="text" id="username" name="username" className='input-user' value={userInfo.username} onChange={handleChange} autoComplete="off" readOnly />
                                    <br />

                                    <label htmlFor="employee_no">{t('empl')}</label>
                                    <input type="text" id="employee_no" name="employee_no" className='input-user' value={userInfo.employee_no} onChange={handleChange} required />
                                    <br />

                                    <label htmlFor="name">{t("name2")}</label>
                                    <input type="text" id="name" name="name" className='input-user' value={userInfo.name} onChange={handleChange} required />
                                    <br />

                                    <label htmlFor="position">{t("position")}</label>
                                    <select className="form-select option-font-size mt-3" id="position" name="position" value={userInfo.position} onChange={(e) => {
                                        handleChange(e);
                                        setErrorPosition(false);
                                    }}>
                                        <option value='0'>Click this select Position</option>
                                        {position.map((item) => (
                                            <option key={item} value={item}>{item}</option>
                                        ))}
                                    </select>
                                    {errorPosition && <div style={{ color: "red", height: '16px' }}>Select your position</div>}
                                    <br />

                                    <button type="submit">
                                        <FaUserGear size={24} /><span className='ms-2'>submit</span>
                                    </button>
                                </form>}

                        </div>



                    </div>
                </div>
            </div>}
    </>
    );

}