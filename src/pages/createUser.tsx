import { useState, useEffect } from 'react';
import './css/createuser.css';
import AddUserImage from '../assets/images/add-user.png';
import { FaCircleUser } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';

import CreateUserImg from '../assets/images/creat-user.jpg';
import NetworkError from './networkError';
import { axiosPost } from "../api/axiosFetch";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useTranslation } from 'react-i18next';
import { IoMdClose } from "react-icons/io";

 
interface ICreateUser {
    message: string,
    detail?: string,
    payload: {
        employee_no: string
        name: string
        password: string
        position: string
        username: string
    }
}
export default function CreateUser() {
    const navigate = useNavigate();

    const [errorMessage, setErrorMessage] = useState(false);
    const [position, setPosition] = useState<string[]>([]);
    const [checkNetwork, setCheckNetwork] = useState(true);
    const [errorPosition, setErrorPosition] = useState(false);
    const [response, setResponse] = useState<{ show: boolean, error: boolean | null, message: string }>({ show: false, error: false, message: '' });
    const [load, setLoad] = useState(false);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const { t } = useTranslation("user");



    const submitUserForm = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent the default form submission behavior
        setErrorMessage(false); // Reset error message
        const form = e.target; // or document.getElementById('myForm');
        const formData = new FormData(form as HTMLFormElement); // Create a FormData object from the form element
        const data = Object.fromEntries(formData.entries()); // Convert FormData to a plain object
        if (data.confirm !== data.password) {
            setErrorMessage(true);

        } if (data.position === '0') {
            setErrorPosition(true);
            return
        }
        else {
            try {
                setLoad(true)
                const res: ICreateUser = await axiosPost(
                    '/user/create_user', data
                );
                if (res.message) {
                    setResponse({ show: true, error: false, message: res.message });
                    setTimeout(() => {
                        navigate(-1);
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
    const buttonBackLogin =() => {
        window.location.href = "/signup-admin";
    };

    useEffect(() => {
        if (sessionStorage.getItem('user')!.split(",")[2] !== "admin") {
            window.location.href = "/login";
        }
        const checkNetwork = async () => {
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
                <div id='modal55' className="card-modal">
                    <button className="button-close" onClick={buttonBackLogin}><IoMdClose size={18} color={'#000000'}></IoMdClose></button>
                    <img src={CreateUserImg} alt="edit" className='img-create-user' />
                    <div className="card-user">
                        <h4>
                            <img src={AddUserImage} alt="edit" width={32} height={32} />
                            <span className='text-primary fw-bold mx-2'>BGC</span>{t("create")}</h4>

                        {response.show ? <h5 className={`text-response ${response.error ? 'bg-error' : 'bg-ok'}`}>{response.message}</h5>
                            : <form onSubmit={submitUserForm}>
                                <label htmlFor='employee'>{t("empl")}</label>
                                <input type="text" id='employee' name='employee_no' className='input-user' required />
                                <br></br>
                                <label htmlFor="username">{t("user")}</label>
                                <input type="text" id='username' name='username' className='input-user' autoComplete="off" />
                                <br></br>
                                <label htmlFor='name'>{t("name2")}</label>
                                <input type="text" id='name' name='name' className='input-user' required />
                                <br></br>
                                <label htmlFor='password'>{t("pass")}</label>
                                <div className="create-user-password-box">
                                    <input type={showPassword ? "text" : "password"} id='password' name='password' className='input-user' autoComplete="new-password" required />
                                    <button onClick={() => setShowPassword(prev => !prev)}>
                                        {showPassword ? <FaRegEyeSlash ></FaRegEyeSlash> : <FaRegEye></FaRegEye>}</button>
                                </div>

                                <br></br>
                                <label htmlFor='confirm'>{t("confirm")}</label>
                                <input type="password" id='confirm' name='confirm' className='input-user' onClick={() => setErrorMessage(false)} required />
                                {errorMessage && <div style={{ color: "red", height: '16px' }}>{t("err_pass")}</div>}
                                <br></br>
                                <label>{t("position")}</label>
                                <select className="form-select option-font-size mt-3" name='position' defaultValue='0' onChange={() => setErrorPosition(false)} aria-label="Default select example" >
                                    <option value='0'>{t("option0")}</option>
                                     {position.map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                                {errorPosition && <div style={{ color: "red", height: '16px' }}>{t("err_posi")}Select your position</div>}
                                <br></br>
                                <button type="submit"
                                ><FaCircleUser size={24} /><span className='ms-2 '>{t("add")}Add</span></button>
                            </form>}

                    </div>
                </div>
            </div>}
    </>
    );
}