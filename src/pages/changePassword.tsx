import NetworkError from './networkError';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import './css/changepassword.css';
import { axiosPut } from "../api/axiosFetch";
import Lock_img from '../assets/images/lock.png';
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { useTranslation } from 'react-i18next';

export default function ChangePassword() {
    const [errorMessage, setErrorMessage] = useState(false);
    const [checkNetwork, setCheckNetwork] = useState(true);
    const [load, setLoad] = useState(false);
    const [passBind, setPassBind] = useState(false);
    const [passBind2, setPassBind2] = useState(false);
    const { t } = useTranslation("user");

    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [response, setResponse] = useState<{ show: boolean, error: boolean | null, message: string }>({ show: false, error: false, message: '' });

    const submitChangePasswordForm = async (e: React.FormEvent) => {
        e.preventDefault(); // Prevent the default form submission behavior
        setErrorMessage(false); // Reset error message
        const form = e.target; // or document.getElementById('myForm');
        const formData = new FormData(form as HTMLFormElement); // Create a FormData object from the form element
        const data = Object.fromEntries(formData.entries()); // Convert FormData to a plain object
        if (data.confirm !== data.password) {
            setErrorMessage(true);
            return;
        } else {
            try {
                setLoad(true);
                const body = {
                    employee_no: searchParams.get("employee_no") || "",
                    username: searchParams.get("username") || "",
                    name: searchParams.get("name") || "",
                    position: searchParams.get("position") || "0",
                    password: data.confirm,
                }
                const res = await axiosPut('/user/edit_pwd', body);
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
    };

    useEffect(() => {
        const checkNetwork = async () => {
            try {
                const response = await fetch(import.meta.env.VITE_REACT_APP_API_URL, { method: "GET" });
                if (response.ok) {
                    // Network is available
                }
            } catch (e: any) {
                console.error(e);
                setCheckNetwork(false);
            }
        };
        checkNetwork();
    }, []);

    return (
        <>
            {!checkNetwork ?
                <div className='w-100 mt-5'><NetworkError /></div> : (
                    <div className='user-modal-bg'>
                        {load && <div className='loading-background top-positio-0'>
                            <div id="loading"></div>
                        </div>}
                        <div className="card-change-password">
                            <img src={Lock_img} alt="lock" width={54} height={54} />
                            <br />
                            <h1>{t("reset_title")}</h1>
                            <p>{t("reset_subtitle")}</p>
                            <p>{searchParams.get("username") || ""}</p>
                            {response.show ? <h5 className={`text-response mt-0 ${response.error ? 'bg-error' : 'bg-ok'}`}>{response.message}</h5> :
                                <form onSubmit={submitChangePasswordForm}>
                                    {errorMessage && <p className="box-text-error">{t("err_pass")}</p>}
                                    <div className="mb-2" style={{ height: "90px" }}>
                                        <label htmlFor="password">
                                            {t("new_pass")}
                                        </label>
                                        <div className="position-relative">
                                            <input type={passBind ? "text" : "password"} name="password" id="password" required className='input-user position-absolute' />
                                            <button onClick={(e) => {
                                                e.preventDefault(); // Prevent the default form submission behavior
                                                setPassBind(prev => !prev);
                                            }} className='btn-eye'>
                                                {passBind ? <FaRegEyeSlash ></FaRegEyeSlash> : <FaRegEye></FaRegEye>}</button>
                                        </div>
                                    </div>
                                    <div className="mb-2" style={{ height: "90px" }}>
                                        <label htmlFor="confirm">
                                            {t("comfirm")}
                                        </label>
                                        <div className="position-relative">
                                            <input type={passBind2 ? "text" : "password"} name="confirm" id="confirm" onChange={() => setErrorMessage(false)} required className='input-user position-absolute' />
                                            <button onClick={(e) => {
                                                e.preventDefault(); // Prevent the default form submission behavior
                                                setPassBind2(prev => !prev);
                                            }} className='btn-eye'>
                                                {passBind2 ? <FaRegEyeSlash ></FaRegEyeSlash> : <FaRegEye></FaRegEye>}</button>
                                        </div>
                                    </div>
                                    <button type="submit" className="btn-change-password">{t("btn_change")}</button>
                                </form>}
                        </div>

                    </div>)}
        </>
    )
}