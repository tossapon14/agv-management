import Json1 from "../assets/locales/main.json";
import { BsPersonFill } from "react-icons/bs";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa";
// import { RiLockPasswordFill } from "react-icons/ri";
import './css/login.css';

import { useState, useEffect, FormEvent } from "react";
import { axiosLogin } from "../api/axiosFetch";


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
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const postLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const params = new URLSearchParams();
      params.append('username', name);
      params.append('password', password);
      const response: ILogin = await axiosLogin("/authentication/login", params);
      if(response.token_type ){
       sessionStorage.setItem("token", `${response.token_type} ${response.access_token}`);
       sessionStorage.setItem("user",`${response.user.employee_no}, ${response.user.name}, ${response.user.position}, ${response.user.status},${response.user.username}`);
       setUser(response.user);
      }else{
        alert(response.message);
      }
    } catch (error) {
      console.error(error);
    }
  };
  const onLogout = async () => {
    sessionStorage.removeItem("token");
    setUser(null);
    sessionStorage.removeItem("user");
  };

  useEffect(() => {
    if(sessionStorage.getItem("user")){
      const [employee_no, name, position, status,username] = sessionStorage.getItem("user")!.split(", ");
      const user:IUser = {
        employee_no: employee_no,
        name: name,
        position: position,
        status: status==="true"?true:false,
        username: username
      };
    console.log(user);
    setUser(user);
    }
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
            <div className='mb-4'>{text["status"]}</div><h3 className='ms-4 d-inline text-warning fw-bold'>{user.status?"ON":"OFFLINE"}</h3>
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
            <input autoFocus type="text" onChange={(e) => setName(e.target.value)} placeholder=' '  required />
            <label>Username</label>
          </div>
          <div className="input-textbox">
            <span onClick={() => setShowPass(prev => !prev)}>
              {showPass ? <FaRegEyeSlash ></FaRegEyeSlash> : <FaRegEye></FaRegEye>}</span>
            <input type={showPass ? "text" : "password"}   onChange={(e) => setPassword(e.target.value)} placeholder=' '  required />
            <label>Password</label>
          </div>
          <button type="submit" className='btn btn-login fw-bold'>{text["login"]}</button>
        </form>
      </div>}

    </section>
  )
}