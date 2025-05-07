import Json1 from "../assets/locales/main.json";
import { BsPersonFill } from "react-icons/bs";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
// import { RiLockPasswordFill } from "react-icons/ri";
import './css/login.css';
import { IoInformationCircleOutline } from "react-icons/io5";

import { useState, useEffect, FormEvent } from "react";
import { axiosLogin,axiosPost } from "../api/axiosFetch";


interface ILogin {
  access_token: string
  message: string
  token_type: string
  user: IUser
  status?: number
  response?: any
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
  const [user, setUser] = useState<IUser | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [responses, setResponse] = useState<string>("")
  const [load, setLoad] = useState(false);


  const postLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setLoad(true)
      const params = new URLSearchParams();
      params.append('username', name);
      params.append('password', password);
      const response: ILogin = await axiosLogin("/authentication/login", params);

      if (response.token_type) {
        sessionStorage.setItem("token", `${response.token_type} ${response.access_token}`);
        sessionStorage.setItem("user", `${response.user.employee_no},${response.user.name},${response.user.position},${response.user.status},${response.user.username}`);
        // setUser(response.user);
        window.location.reload();
      }
      else if (response.status === 401) {
        setResponse(response.response?.data.detail)
      }
      else if (response.message) {
        setResponse(response.message)
      }
 
    } catch (error: any) {
      console.error(error);
      setResponse(error.message)
    }finally{
      setLoad(false);
    }
  };
  const onLogout = async () => {
    try {
      sessionStorage.removeItem("token");
      const body = {username:user?.username}
      setUser(null);
      sessionStorage.removeItem("user");
      setLoad(true);
      await axiosPost("/authentication/logout",body );
      

    } catch (e: any) { 
      console.error(e);
    }finally{
      setLoad(false);
      window.location.reload();
    }

  };

  useEffect(() => {
    if (sessionStorage.getItem("user")) {
      const [employee_no, name, position, status, username] = sessionStorage.getItem("user")!.split(",");
      const user: IUser = {
        employee_no: employee_no,
        name: name,
        position: position,
        status: status === "true" ? true : false,
        username: username
      };
      setUser(user);
    }
  }, []);


  return (
    <section id='login'>
      {load && <div className='loading-background'>
        <div id="loading"></div>
      </div>}
      <div className="about-version"><IoInformationCircleOutline size={24} /><span> power by BGC v.1.5.6</span>
      </div>
      {user ? <div className='profile'>
        <h1>{text["imfor"]}</h1>
        <div className="subprofile-box">
          <div className='d-flex justify-content-between'>
            <div className='mb-4'>{text["name"]}</div><h3 className='ms-4 d-inline'>{user.name}</h3>
          </div>
          <div className='d-flex justify-content-between'>
            <div className='mb-4'>{text["username"]}</div><h3 className='ms-4 d-inline'>{user.username}</h3>
          </div>
          <div className='d-flex justify-content-between'>
            <div className='mb-4'>{text["employee_no"]}</div><h3 className='ms-4 d-inline'>{user.employee_no}</h3>
          </div>
          <div className='d-flex justify-content-between'>
            <div className='mb-4'>{text["position"]}</div><h3 className='ms-4 d-inline'>{user.position}</h3>
          </div>
          <div className='d-flex justify-content-between'>
            <div className='mb-4'>{text["status"]}</div><h3 className='ms-4 d-inline fw-bold' style={{ color: 'rgb(82, 255, 8)' }}>{user.status ? "ONLINE" : "OFFLINE"}</h3>
          </div>

          <button type="button" className='btn btn-signout fw-bold' onClick={onLogout} >{text["logout"]}</button>
          {user.position === "admin" && <p className="signup mt-3">
            {text["des"]}&nbsp;
            <a href='/signup-admin'>{text["singup"]}</a></p>}
        </div>
      </div> : <div className="formBx">
        <form onSubmit={postLogin}>
          <h1>{text["signin"]}</h1>

          <div className="input-textbox">
            <span><BsPersonFill  ></BsPersonFill></span>
            <input autoFocus type="text" onChange={(e) => setName(e.target.value)} autoComplete="off" required />
            <label>Username</label>
          </div>
          <div className="input-textbox">
            <span onClick={() => setShowPass(prev => !prev)}>
              {showPass ? <FaRegEyeSlash ></FaRegEyeSlash> : <FaRegEye></FaRegEye>}</span>
            <input type={showPass ? "text" : "password"} onChange={(e) => setPassword(e.target.value)} autoComplete="off" required />
            <label>Password</label>
          </div>
          <button type="submit" className='btn btn-login fw-bold'>{text["login"]}</button>
          {responses && <h5 className='text-error-login'>{responses}</h5>}

        </form>

      </div>}

    </section>
  )
}