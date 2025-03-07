import './css/home.css';
import MapAnimate from './map_animation.tsx';
import AgvImg from '../assets/images/plyagvmirror.png';
import AgvImg2 from '../assets/images/plyagv.png';

import { CiBatteryFull } from "react-icons/ci";
import { FaArrowDown } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { FaMapMarkerAlt } from "react-icons/fa";
import MissionImage from '../assets/images/mission.png';
import Map_bg from '../assets/images/bgc5_1min7.webp';
import { axiosGet } from "../api/axiosFetch";

import { useState, useRef, useEffect } from 'react';

interface IagvDataModel {
  agvName: string;
  status: number;
  state: string;
  mode: string;
}
interface IVehicles {
  message: string
  payload: IPayload[]
}
interface IPayload {
  battery: number
  coordinate: string
  emergency_state: boolean
  home: string
  ip_address: string
  mission_id: number
  mode: string
  name: string
  node: string
  port: string
  state: number
  velocity: number
  str_state?:string
}
const colorAgv:{[key:string]:string}={"AGV1":"#001494","AGV2":"#420000","AGV3":"#006a33","AGV4":"#d7be00","AGV5":"#94008d","AGV6":"#0097a8"};

export default function Home() {
  const modelRef = useRef<HTMLDivElement>(null);

  const [missionModel, setMissionModel] = useState<IagvDataModel>({ agvName: "", status: 0, state: '', mode: ''});
  const [showModel, setShowModel] = useState<string>("");
  const [selectedAgv, setSelectedAgv] = useState(0);
  const [agvAll, setAgvAll] = useState<IPayload[]>([]);
  const [btnAgv, setBtnAgv] = useState<string[]>([]);
  const [selectPickup, setSelectedPickup] = useState<React.ReactNode>(<h3 className="selectPickup">Select your pickup</h3>)
  const [selectWarehouse, setselectWarehouse] = useState<string[]>([])
  const showMission = useRef<HTMLDivElement>(null);
  const clickWarehouse = (i: string) => {
    setselectWarehouse((prev) => [...prev, `warehouse ${i}`]);
  }
  const clickPickup = (index: number) => {
    const pickup = ["Pickup 1", "Pickup 2", "Pickup 3", "Pickup 4", "Pickup 5", "Pickup 6", "Pickup 7", "Pickup 8"];
    setSelectedPickup(<></>);
    setTimeout(() => {
      setSelectedPickup(
        <div className='data-warehouse-box' style={{ top: '24px' }}>
          <div className='circle-pickup-outline green-circle-bg'>
            <div className='circle-pickup-inner'></div>
          </div>
          <div className='warehouse-from-to-box'>
            <p style={{ color: '#838383' }}>from</p>
            <h5>{pickup[index]}</h5>
          </div>
        </div>
      );
    }, 200);

  };
  const selectAgvFunction = (agvNumber: number) => {
    setSelectedAgv(agvNumber);
  }
  const clickMission = (data: IagvDataModel, showorhide: string) => {
    setMissionModel(data);
    setShowModel(showorhide);
  }
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      if (e.target === modelRef.current) {
        setShowModel("hidden-model");
      }
    };
    const scrollToBottom = () => {
      if (showMission.current) {
        showMission.current.scrollTop = showMission.current.scrollHeight;
      }
    };
    const observer = new MutationObserver(scrollToBottom);
    if (showMission.current) {
      observer.observe(showMission.current, { childList: true, subtree: true });
    }
    const pairAgvState = function(state:number):string{
      switch(state){
        case 0: return "ไม่เชื่อมต่อ";
        case 1: return "เชื่อมต่อ";
        case 2: return "พร้อมรับงาน";
        case 3: return "ปฏิบัติงาน";
        case 4: return "หยุด";
        case 5: return "มีสิ่งกีดขวาง";
        case 6: return "ระบบพบปัญหา";
        case 7: return "รอคำสั่ง";
        default: return "";
      }
    }
    const getAgv = async () => {
      try {
        const res: IVehicles = await axiosGet(
          "https://2514-110-164-87-31.ngrok-free.app/vehicle/vehicles?vehicle_name=ALL&state=ALL",
        );
        const agv = res.payload.map((data)=>({...data,str_state:pairAgvState(data.state)}));
        console.log(agv);
        setAgvAll(agv);
        setBtnAgv(res.payload.map(agvItem => agvItem.name));
      } catch (e) {
        console.log(e);
      }

    }

    if (modelRef != null) {
      modelRef.current!.addEventListener("mouseup", handleMouseUp);
    }
    if (sessionStorage.getItem("token")) {
      getAgv();
    }
    return () => { observer.disconnect(); 
      modelRef.current!.removeEventListener("mouseup", handleMouseUp); };
  }, []);
  return (
    <section className='home'>
      <section className="col1">
        <MapAnimate></MapAnimate>
        <div className="container mt-5">
          <div className="card">
            <div className="card-body">
              <div className="d-flex align-items-center mb-4">
                <img src={MissionImage} alt="Logo with a yellow circle and blue border" className="me-3" width="32" height="32" />
                <h1 className="h4 mb-0">mission</h1>
              </div>
              <div className="table-responsive">
                <table className="table">
                  <thead className="thead-light text-center">
                    <tr className='home-table-head'>
                      <th>job id</th>
                      <th>รถ</th>
                      <th><div className='head-table-flex'>
                        <div className='pick-circle-icon'>
                          <div className='pick-circle-icon-inner'></div>
                        </div>จุดจอด
                      </div></th>
                      <th><div className="head-table-flex">
                        <div className='mission-circle-icon'>
                          <IoMdSettings color='#E9762B' />
                        </div>
                        status</div></th>
                      <th><div className="head-table-flex">
                        <div className='mission-circle-icon color-blue'>
                          <FaMapMarkerAlt color='#003092' />
                        </div>
                        จุดหมาย</div></th>
                      <th>วัน</th>
                      <th>เวลา</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody className='text-center'>
                    <tr>
                      <td>#152</td>
                      <td><span className="dot dot-blue"></span>AGV 1</td>
                      <td>pick up 1</td>
                      <td><span className="status-badge status-in-process">in process</span></td>
                      <td>w10,w5,s2</td>
                      <td>12/12/2024</td>
                      <td>13.54</td>
                      <td><button className="btn-pause">pause</button></td>
                    </tr>
                    <tr>
                      <td>#153</td>
                      <td><span className="dot dot-red"></span>AGV 2</td>
                      <td>pick up 1</td>
                      <td><span className="status-badge status-reserved">reserved</span></td>
                      <td></td>
                      <td>12/12/2024</td>
                      <td>13.54</td>
                      <td><button className="btn-cancel">cancel</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="col2">
        <div className='box-agv-btn'>
          <button onClick={() => selectAgvFunction(0)} className='btn-agv'>ทั้งหมด</button>
          {btnAgv.map((name, index) => <button onClick={() => selectAgvFunction(index + 1)} className='btn-agv'>{name}</button>)}
        </div>
        {agvAll.map((agv,index)=><section className={`box-agv-data ${(selectedAgv === index+1 || selectedAgv === 0)?"":"d-none"}`}>
          <div className='top-box-data'>
            <img className='image-agv' src={AgvImg}></img>
            <div className='box-name-agv'>
              <div className='box-name-battery'>
                <div className='agv-name-text'  style={{ backgroundColor: colorAgv[agv.name] || "red" }}>{agv.name}</div>
                <div className='agv-battery'><CiBatteryFull size={36} /><span>{agv.battery}%</span></div>
              </div>

              <div className={`auto-manual ${agv.mode}`}>{agv.mode}</div>
              <div className='agv-state'>{agv.str_state}</div>
            </div>
            <div className='velocity'>
              <h1 className='velocity-number'>{agv.velocity}</h1>
              <p className="km-h">km/h</p>
              <button className='button-agv'>หยุด</button>
            </div>
          </div>
          <div className='mission-line-container'>

          </div>
          {agv.mission_id == null ? <div className="box-no-mossion">
            <div className='button-center' ><FaArrowDown size={24} /></div>
            <div className='circle-1'></div>
            <div className='circle-2'></div>
          </div> :
            <div className='box-dotted-mission'>
              <div className='button-center'><FaArrowDown size={24} /></div>
              <div className='circle-1'></div>
              <div className='circle-2'></div>
              <div className='circle-3'></div>
              <div className='circle-4'></div>
              <div className="mission-text-box">
                {/* <img src={MissionImage} alt="Logo with a yellow circle and blue border" className="me-1" width="28" height="28" /> */}
                <p className="fs-5 mb-0">mission <span className="fw-bolder">#{agv.mission_id}</span></p>
              </div>
              <div className="mission-process-box" >
                <div className="pickup-box">
                  <div className='pickup-text'>P3</div>
                  <div className='pickup-time'>09.53</div>
                </div>
                <div className='center-line-box'>
                  <hr className="line4"></hr>
                  <div className="circle-pickup"></div>
                  <div className="circle-goal"></div>
                  <div className="stations-box left10">
                    <div className='circle-top-stations'></div>
                    <div className='label-station'>W10</div>
                  </div>
                  <div className="stations-box" style={{ left: '36%' }}>
                    <div className='circle-top-stations'></div>
                    <div className='label-station'>W10</div>
                  </div>
                  <div className="stations-box" style={{ left: '63%' }}>
                    <div className='circle-top-stations'></div>
                    <div className='label-station'>W10</div>
                  </div>
                  <div className="stations-box" style={{ left: '90%' }}>
                    <div className='circle-top-stations'></div>
                    <div className='label-station'>W10</div>
                  </div>
                </div>
                <div className="goal-box">
                  <div className='pickup-text'>W4</div>
                  <div className='pickup-time'>10.32</div>
                </div>
              </div>
            </div>}
          <div className='mission-container'>
            <div className='mission-status'>จุดลงสินค้า</div>
            <button className='misstion-btn' onClick={() => clickMission({ agvName: agv.name, status: 2, state: agv.str_state!, mode: agv.mode}, "show-model")}>จองที่จอด</button>
          </div>
        </section>)}
      </section>
      <div ref={modelRef} className={`model ${showModel}`}>
        <div className='model-content'>
          <div className='box-map-and-btn'>
            <img src={Map_bg} className="map-img" alt='map' loading="lazy"></img>
            {missionModel.status == 2 ? (
              <>
                <button className="btn-pickup-agv" onClick={() => clickPickup(0)} style={{ top: "75%", left: "68%" }}>P1</button>
                <button className="btn-pickup-agv" onClick={() => clickPickup(1)} style={{ top: "75%", left: "62%" }}>P2</button>
                <button className="btn-pickup-agv" onClick={() => clickPickup(2)} style={{ top: "75%", left: "56%" }}>P3</button>
                <button className="btn-pickup-agv" onClick={() => clickPickup(3)} style={{ top: "30%", left: "35%" }}>P4</button>
                <button className="btn-pickup-agv" onClick={() => clickPickup(4)} style={{ top: "75%", left: "50%" }}>P5</button>
                <button className="btn-pickup-agv" onClick={() => clickPickup(5)} style={{ top: "27%", left: "82%" }}>P6</button>
                <button className="btn-pickup-agv" onClick={() => clickPickup(6)} style={{ top: "50%", left: "35%" }}>P7</button>
                <button className="btn-pickup-agv" onClick={() => clickPickup(7)} style={{ top: "60%", left: "35%" }}>P8</button>
              </>
            ) : null}
            {missionModel.status != 2 ? (<>
              <button className='btn-pickup-agv color-btn-warehouse' onClick={() => clickWarehouse("1")} style={{ top: '80%', left: '25%' }}>D1</button>
              <button className='btn-pickup-agv color-btn-warehouse' onClick={() => clickWarehouse("2")} style={{ top: '88%', left: '18%' }}>D2</button>
              <button className='btn-pickup-agv color-btn-warehouse' onClick={() => clickWarehouse("3")} style={{ top: '88%', left: '10%' }}>D3</button>
              <button className='btn-pickup-agv color-btn-warehouse' onClick={() => clickWarehouse("4")} style={{ top: '80%', left: '2%' }}>D4</button>
              <button className='btn-pickup-agv color-btn-warehouse' onClick={() => clickWarehouse("5")} style={{ top: '70%', left: '9%' }}>D5</button>
              <button className='btn-pickup-agv color-btn-warehouse' onClick={() => clickWarehouse("6")} style={{ top: '70%', left: '18%' }}>D6</button>
              <button className='btn-pickup-agv color-btn-warehouse' onClick={() => clickWarehouse("7")} style={{ top: '65%', left: '2%' }}>D7</button>
              <button className='btn-pickup-agv color-btn-warehouse' onClick={() => clickWarehouse("8")} style={{ top: '52%', left: '2%' }}>D8</button>
              <button className='btn-pickup-agv color-btn-warehouse' onClick={() => clickWarehouse("9")} style={{ top: '42%', left: '9%' }}>D9</button>
              <button className='btn-pickup-agv color-btn-warehouse' onClick={() => clickWarehouse("10")} style={{ top: '42%', left: '18%' }}>D10</button>
              <button className='btn-pickup-agv color-btn-warehouse' onClick={() => clickWarehouse("11")} style={{ top: '65%', left: '25%' }}>D11</button>
              <button className='btn-pickup-agv color-btn-warehouse' onClick={() => clickWarehouse("12")} style={{ top: '52%', left: '25%' }}>D12</button>
              <button className='btn-pickup-agv color-btn-warehouse' onClick={() => clickWarehouse("13")} style={{ top: '30%', left: '45%' }}>D13</button>
              <button className='btn-pickup-agv color-btn-warehouse' onClick={() => clickWarehouse("14")} style={{ top: '38%', left: '45%' }}>D14</button>
              <button className='btn-pickup-agv color-btn-warehouse' onClick={() => clickWarehouse("15")} style={{ top: '68%', left: '53%' }}>D15</button>
              <button className='btn-pickup-agv color-btn-warehouse' onClick={() => clickWarehouse("16")} style={{ top: '70%', left: '80%' }}>D16</button>
              <button className='btn-pickup-agv color-btn-warehouse' onClick={() => clickWarehouse("17")} style={{ top: '84%', left: '40%' }}>D17</button>
              <button className='btn-pickup-agv color-btn-warehouse' onClick={() => clickWarehouse("18")} style={{ top: '50%', left: '38%' }}>D18</button>
              <button className='btn-pickup-agv color-btn-warehouse' onClick={() => clickWarehouse("19")} style={{ top: '60%', left: '38%' }}>D19</button>
              <button className='btn-pickup-agv color-btn-warehouse' onClick={() => clickWarehouse("20")} style={{ top: '65%', left: '46%' }}>D20</button>
              <button className='btn-pickup-agv color-btn-warehouse' onClick={() => clickWarehouse("21")} style={{ top: '65%', left: '62%' }}>D21</button>
              <button className='btn-pickup-agv color-btn-warehouse' onClick={() => clickWarehouse("22")} style={{ top: '65%', left: '70%' }}>D22</button>
            </>) : null}


          </div>
          <div className='agv-mission-box'>
            <div className='agv-mission-card' style={{borderTop:`16px solid ${colorAgv[missionModel.agvName]}`}}>
              <div className='agv-top-name-box'>
                <div className='agv-name-state'>
                  <div className='box-name-battery'>
                    <div className='agv-name-text'  style={{ backgroundColor: colorAgv[missionModel.agvName] || "red" }}>{missionModel.agvName}</div>
                    <div className='agv-battery'><CiBatteryFull size={36} /><span>100%</span></div>
                  </div>
                  <div className={`auto-manual ${missionModel.mode}`}>{missionModel.mode}</div>
                  <div className='agv-state'>{missionModel.state}</div>
                </div>
                <img className='image-agv-model' src={AgvImg2}></img>
              </div>
              <div className="position-relative">
                {missionModel.status != 2 && <div className='dotted-mission-line'></div>}
                <div ref={showMission} className='box-selected-warehouse'>
                  <div className='button-center' ><FaArrowDown size={24} /></div>

                  {selectPickup}
                  {selectWarehouse.map((warehouse, index) => <div className='data-warehouse-box'>
                    <div className='circle-goal-outline blue-circle-bg'>
                      <FaMapMarkerAlt size={32} color='#003092' />
                    </div>
                    <div className='warehouse-from-to-box'>
                      <p style={{ color: '#838383' }}>to</p>
                      <h5>{warehouse}</h5>
                    </div>
                  </div>)}


                </div>
              </div>

              <button className='send-command mt-3' onClick={() => setMissionModel((prev) => ({ ...prev, status: 3 }))}>สั่งงาน</button>
            </div>
            <button className='close-model' onClick={() => { setShowModel("hidden-model") }}>ย้อนกลับ</button>
          </div>
        </div>
      </div>
    </section >
  );
}