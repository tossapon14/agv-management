import Json1 from "../assets/locales/main.json";
import { BsPersonFill } from "react-icons/bs";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
// import { RiLockPasswordFill } from "react-icons/ri";
import './css/login.css';

import { useState, useEffect, FormEvent } from "react";
import { axiosPost } from "../api/axiosFetch";


interface ILogin {
  access_token: string
  message: string
  token_type: string
  user: IUser
}

interface IUser {
  employee_no: string
  name: string
  position: string
  status: boolean
  username: string
}

export default function Login() {
  const text = Json1["Signin"]["en"];
  const [showPass, setShowPass] = useState(false);
  const [user,setUser] = useState<IUser|null>(null);

  const postLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const params = new URLSearchParams();
      params.append('username', 'admin');
      params.append('password', 'admin');
      const response: ILogin = await axiosPost("/authentication/login", params);
      sessionStorage.setItem("token", `${response.token_type} ${response.access_token}`);
      setUser(response.user);
      console.log(response);
    } catch (error) {
      console.error(error);
    }
  };
  const onLogout = async () => {
    
  };

  useEffect(() => {
    
  }, []);


  return (
    <section id='login'>
      {user ? <div className='profile'>
        <h1>{text["imfor"]}</h1>
        <div className="subprofile-box">
          <div className='d-flex justify-content-between'>
            <div className='mb-4'>{text["user"]}</div><h3 className='ms-4 d-inline'>{user.employee_no}</h3>
          </div>
          <div className='d-flex justify-content-between'>
            <div className='mb-4'>{text["name"]}</div><h3 className='ms-4 d-inline'>{user.name}</h3>
          </div>
          <div className='d-flex justify-content-between'>
            <div className='mb-4'>{text["posi"]}</div><h3 className='ms-4 d-inline'>{user.position}</h3>
          </div>
          <div className='d-flex justify-content-between'>
            <div className='mb-4'>{text["status"]}</div><h3 className='ms-4 d-inline text-warning fw-bold'>{text["on"]}</h3>
          </div>

          <button type="button" className='btn btn-signout fw-bold' onClick={onLogout} >{text["logout"]}</button>
        </div>
        {user.position === "admin" && <p className="signup mt-3">
          {text["des"]}&nbsp;
          <a href='#' >{text["singup"]}</a></p>}
      </div> : <div className="formBx">
        <form onSubmit={postLogin}>
          <h1>{text["signin"]}</h1>
          <div className="input-textbox">
            <span><BsPersonFill  ></BsPersonFill></span>
            <input autoFocus type="text" placeholder=' ' name="username" required />
            <label>Username</label>
          </div>
          <div className="input-textbox">
            <span onClick={() => setShowPass(prev => !prev)}>
              {showPass ? <FaRegEyeSlash ></FaRegEyeSlash> : <FaRegEye></FaRegEye>}</span>
            <input type={showPass ? "text" : "password"} name="password" placeholder=' ' required />
            <label>Password</label>
          </div>
          <button type="submit" className='btn btn-login fw-bold'>{text["login"]}</button>
        </form>
      </div>}

    </section>
  )
}