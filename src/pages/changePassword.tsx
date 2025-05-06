import NetworkError from './networkError';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import './css/changepassword.css';
import { axiosPut } from "../api/axiosFetch";
import Lock_img from '../assets/images/lock.png';


export default function ChangePassword() {
    const [errorMessage, setErrorMessage] = useState(false);
    const [checkNetwork, setCheckNetwork] = useState(true);
    const [load, setLoad] = useState(false);


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
            }finally{
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
                            <h1>Reset your Password</h1>
                            <p>Enter the new password and confirm password</p>
                            <p>{ searchParams.get("username") || ""}</p>
                            {response.show ? <h5 className={`text-response mt-0 ${response.error ? 'bg-error' : 'bg-ok'}`}>{response.message}</h5> :
                                <form onSubmit={submitChangePasswordForm}>
                                    {errorMessage && <p className="box-text-error">Password not match</p>}
                                    <div className="mb-2">
                                        <label htmlFor="password">
                                            <b>New Password</b>
                                        </label><br />
                                        <input type="password" name="password" id="password" required className='input-user' />
                                    </div>
                                    <div className="mb-2">
                                        <label htmlFor="confirm" className="block text-gray-700 text-sm font-bold mb-2">
                                            <b>Confirm Password</b>
                                        </label><br />
                                        <input type="password" name="confirm" id="confirm" onChange={() => setErrorMessage(false)} required className='input-user' />
                                    </div>
                                    <button type="submit" className="btn-change-password">Change Password</button>
                                </form>}
                        </div>

                    </div>)}
        </>
    )
}