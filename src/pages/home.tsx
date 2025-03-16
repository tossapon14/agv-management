import './css/home.css';
import MapAnimate from './map_animation.tsx';
import AgvImg from '../assets/images/plyagvmirror.png';
import AgvImg2 from '../assets/images/plyagv.png';

import { CiBatteryFull } from "react-icons/ci";
import { FaArrowDown } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { FaMapMarkerAlt } from "react-icons/fa";
import MissionImage from '../assets/images/mission.png';
import Map_btn from '../assets/images/bg_btn.webp';
import { axiosGet, axiosPost, axiosPut } from "../api/axiosFetch";

import { useState, useRef, useEffect } from 'react';
import { FaRegTrashCan } from "react-icons/fa6";

interface IagvDataModel {
  agv: string;
  id?: number;
  codePickup: string;
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
  btn_pick_drop_code: string
  mission: IMission
  str_state?: string
  str_mission?: string;
  pick?: string;
  drop?: string[];
}
interface IMission {
  id: number
  requester: string
  type: number
  nodes: string
  paths: string
  status: number
  transport_state: number
  vehicle_name: string
  timestamp: string
  dispatch_time: string
  arriving_time: any
  duration: any
}

interface IMissionCreate {
  nodes: string
  requester: string
  type: number
  vehicle_name: string
}
interface IMissionDrop {
  id: number
  nodes: string
  status: number
  transport_state: number
  vehicle_name: string
}
export interface IMissionData {
  message: string
  payload: IPayloadMission[]
  structure: Structure
}
export interface IPayloadMission {
  arriving_time: string
  dispatch_time: string
  duration: string
  id: number
  nodes: string
  paths: string
  requester: string
  status: number
  str_status: string
  timestamp: string
  transport_state: number
  vehicle_name: string
  drop: string
  pick: string
}
interface Structure {
  page: number
  page_size: number
  total_items: number
  total_pages: number
}
interface IAgvSelected {
  [key: string]: { pickup?: string; }
}


export const colorAgv: { [key: string]: string } = { "AGV1": "#001494", "AGV2": "#cc0000", "AGV3": "#006a33", "AGV4": "#d7be00", "AGV5": "#94008d", "AGV6": "#0097a8" };
var misstion_loop = 0;
export default function Home() {
  const modelRef = useRef<HTMLDivElement>(null);

  const [missionModel, setMissionModel] = useState<IagvDataModel>({ agv: "", codePickup: '', state: '', mode: '' });
  const [showModel, setShowModel] = useState<string>("");
  const [selectedAgv, setSelectedAgv] = useState(0);
  const [agvAll, setAgvAll] = useState<IPayload[]>([]);
  const [btnAgv, setBtnAgv] = useState<string[]>([]);
  const [pickup, setPickup] = useState<string | null>(null);
  const [selectWarehouse, setselectWarehouse] = useState<string[]>([])
  const [missionTable, setMissionTable] = useState<IPayloadMission[]>([]);
  const agvselectedMission = useRef<IAgvSelected>({});
  const current_agv = useRef<string>("AGV");
  const showMission = useRef<HTMLDivElement>(null);
  const timerInterval = useRef<NodeJS.Timeout>(null);

  const sendMissionDrop = async (agv: string) => {
    const endpoint = `fleet/command?command=next&vehicle_name=${agv}`;
    const response = await axiosPut(endpoint);
    console.log(response);
  }
  const sendCommand = async (agv: string, command: string) => {
    const endpoint = `fleet/command?command=${command}&vehicle_name=${agv}`;
    const response = await axiosPut(endpoint);
    console.log(response);
  }
  const modelPostMission = async (agv: string, id: number) => {
    if (selectWarehouse.length > 0 && agvselectedMission.current[agv]?.pickup) { //select drop
      const dataMission: IMissionDrop = {
        id: id,
        nodes: `${agvselectedMission.current[agv]?.pickup},${selectWarehouse.join(",")}`,
        status: 2,
        transport_state: 2,
        vehicle_name: agv
      }
      console.log(dataMission);
      const response = await axiosPut("/mission/update", dataMission);
      console.log(response);
    } else if (agvselectedMission.current[agv]?.pickup||pickup) {
      const dataMission: IMissionCreate = {
        "nodes":  pickup||agvselectedMission.current[agv]?.pickup!,
        "requester": "admin",
        "type": 1,
        "vehicle_name": agv
      }
      console.log(dataMission);
      const response = await axiosPost("/mission/create", dataMission);
    }
  }
 
  const btnCallDrop = (data: IagvDataModel) => {
    setMissionModel(data);
    setShowModel("show-model");
  }
  const btnCallModal = (data: IagvDataModel) => {
    setMissionModel(data);
    setShowModel("show-model");
    setPickup(null);
    current_agv.current = data.agv;
  }
  const deleteDrop = (node:string) => {
    const element = document.getElementById(node);
    if (element) {
      element.classList.add("slide-out");
      setTimeout(() => {
        setselectWarehouse((prev) => prev.filter((item) => item !== node));
      }, 400);
    }
  };

  const clickDrop = (index: string) => {
    if(!selectWarehouse.includes(`D${index}S`)){
      setselectWarehouse(prev=>[...prev,`D${index}S`]);
    }
      
  }

  const clickPickup = (index: number) => {
    const PS = ["P01S", "P02S", "P03S", "P04S", "P05S", "P06S", "P07S", "P08S"];
    setPickup(null);
    setTimeout(() => {
      setPickup(PS[index]);
    }, 200);

  };
  const selectAgvFunction = (agvNumber: number) => {
    setSelectedAgv(agvNumber);
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
    const pairAgvState = function (state: number): string {
      switch (state) {
        case 0: return "ออฟไลน์";
        case 1: return "ออนไลน์";
        case 2: return "พร้อมรับงาน";
        case 3: return "กำลังทำงาน";
        case 4: return "หยุด";
        case 5: return "พบสิ่งกีดขวาง";
        case 6: return "ระบบพบปัญหา";
        case 7: return "รอคำสั่ง";
        case 8: return "กำลังจอง";
        default: return "";
      }
    }
    const pairMissionStatus = function (state: number): string {
      switch (state) {
        case 0: return "รออนุมัติ";
        case 1: return "อนุมัติ";
        case 2: return "เริ่มงาน";
        case 3: return "สำเร็จ";
        case 4: return "ปฏิเสธ";
        case 5: return "ยกเลิก";
        case 6: return "ไม่สำเร็จ";
        default: return "";
      }
    }
    // const pairTransportState = function (state: number): string {
    //   switch (state) {
    //     case 0: return "-";
    //     case 1: return "กำลังขึ้นสินค้า";
    //     case 2: return "ขึ้นสินค้า";
    //     case 3: return "ขนส่ง";
    //     case 4: return "กำลังลงสินค้า";
    //     case 5: return "สำเร็จ";
    //     default: return "";
    //   }
    // }
    const now = new Date();
    const getDate = `${now.getFullYear()}-${("0" + (now.getMonth() + 1)).slice(-2)}-${("0" + now.getDate()).slice(-2)}`;

    const getMission = async () => {
      try {
        const res: IMissionData = await axiosGet(
          `/mission/missions?vehicle_name=ALL&status=ALL&start_date=${getDate}&end_date=${getDate}&page=1&page_size=10`
        );
        // console.log(res.payload);
        setMissionTable(res.payload.slice(0, 4).map(ele => ({
          ...ele, str_status: pairMissionStatus(ele.status),
          drop: ele.nodes.substring(5), pick: ele.nodes.substring(0, 4)
        })));
      } catch (e: any) {
        if (e.response?.data?.detail) {
          console.log(e.response.data.detail);
        }
        return e.response?.data || { message: "Unknown error occurred" };
      }
    };

    const getAgv = async () => {
      try {
        const res: IVehicles = await axiosGet(
          "/vehicle/vehicles?vehicle_name=ALL&state=ALL",
        );
        const agv = res.payload.map((data) => ({
          ...data, str_state: pairAgvState(data.state),
          str_mission: pairMissionStatus(data.mission?.status), btn_pick_drop_code: `${data.state}${data.mission?.status}${data.mission?.transport_state}`
        }));
        // console.log(agv);
        setAgvAll(agv);
        setBtnAgv(res.payload.map(agvItem => agvItem.name));
        res.payload.forEach((data) => {
          if (data.name&&!agvselectedMission.current[data.name]?.pickup) {
            if (data.mission?.nodes?.split(",").length >= 1) {
              agvselectedMission.current[data.name] = { pickup: data.node.split(",")[0] }
            }
          }
        });
      } catch (e) {
        console.log(e);
      }

    }

    if (modelRef != null) {
      modelRef.current!.addEventListener("mouseup", handleMouseUp);
    }
    if (sessionStorage.getItem("token")) {
      getAgv();
      getMission();
      timerInterval.current = setInterval(() => {
        misstion_loop++;
        getAgv();
        if (misstion_loop == 2) {
          misstion_loop = 0;
          getMission();
        }
      }
        , 3000);
    }
    return () => {
      observer.disconnect();
      modelRef.current!.removeEventListener("mouseup", handleMouseUp);
      clearInterval(timerInterval.current as NodeJS.Timeout);
    };
  }, []);
  return (
    <section className='home'>
      <section className="col1">
        <MapAnimate></MapAnimate>
        <div className="container mt-4 px-0">
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
                    {missionTable.map((data) => <tr key={data.id}>
                      <td>#{data.id}</td>
                      <td><span className="dot dot-blue"></span>{data.vehicle_name}</td>
                      <td>{data.pick}</td>
                      <td><span className="status-badge status-in-process">{data.str_status}</span></td>
                      <td>{data.drop}</td>
                      <td>{data.timestamp.substring(0, 10)}</td>
                      <td>{data.timestamp.substring(11, 16)}</td>
                      {data.status === 0 && <td><button className="btn-cancel">cancel</button></td>}
                    </tr>
                    )}
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
          {btnAgv.map((name, index) => <button key={index} onClick={() => selectAgvFunction(index + 1)} className='btn-agv'>{name}</button>)}
        </div>
        {agvAll.map((agv, index) => <section key={agv.name} className={`box-agv-data ${(selectedAgv === index + 1 || selectedAgv === 0) ? "" : "d-none"}`}
        >
          <div className='top-box-data'>
            <img className='image-agv' src={AgvImg}></img>
            <div className='box-name-agv'>
              <div className='box-name-battery'>
                <div className='agv-name-text' style={{ backgroundColor: colorAgv[agv.name] || "red" }}>{agv.name}</div>
                <div className='agv-battery'><CiBatteryFull size={36} /><span>{agv.battery}%</span></div>
              </div>

              <div className={`auto-manual ${agv.mode}`}>{agv.mode}</div>
              <div className='agv-state'>{agv.str_state}</div>
            </div>
            <div className='velocity'>
              <h1 className='velocity-number'>{agv.velocity.toFixed(1)}</h1>
              <p className="km-h">km/h</p>
              {agv.state == 4 ? <button className='button-agv' onClick={() => sendCommand(agv.name, 'continue')}>วิ่งต่อ</button> : <button className='button-agv' onClick={() => sendCommand(agv.name, 'pause')}>หยุด</button>}
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
            <div className='mission-status'>{agv.str_mission}</div>
            {agv.btn_pick_drop_code === "724" ? <button className='drop-btn' onClick={() => sendMissionDrop(agv.name)}>ลงสินค้า</button> :
              agv.btn_pick_drop_code === "721" ? <button className='mission-btn' onClick={() => btnCallDrop({ agv: agv.name, codePickup: "721", id: agv.mission?.id, state: agv.str_state!, mode: agv.mode })}>
                จองจุดลง
              </button> :
                <button className='mission-btn' onClick={() => btnCallModal({ agv: agv.name, codePickup: agv.btn_pick_drop_code, id: agv.mission?.id, state: agv.str_state!, mode: agv.mode })}>
                  สร้างคิวงาน
                </button>}

          </div>
        </section>)}
      </section>
      <div ref={modelRef} className={`model ${showModel}`}>
        <div className='model-content'>
          <div className='box-map-and-btn'>
            <img src={Map_btn} className="map-img" alt='map' loading="lazy"></img>
            {missionModel.codePickup !== "721" ? (
              <>
                <button className="btn-pickup-agv" onClick={() => clickPickup(0)} style={{ top: "74%", left: "66%" }}>P1</button>
                <button className="btn-pickup-agv" onClick={() => clickPickup(1)} style={{ top: "74%", left: "60%" }}>P2</button>
                <button className="btn-pickup-agv" onClick={() => clickPickup(2)} style={{ top: "74%", left: "54%" }}>P3</button>
                <button className="btn-pickup-agv" onClick={() => clickPickup(3)} style={{ top: "34%", left: "40%" }}>P4</button>
                <button className="btn-pickup-agv" onClick={() => clickPickup(4)} style={{ top: "74%", left: "48%" }}>P5</button>
                <button className="btn-pickup-agv" onClick={() => clickPickup(5)} style={{ top: "34%", left: "80%" }}>P6</button>
                <button className="btn-pickup-agv" onClick={() => clickPickup(6)} style={{ top: "54%", left: "36%" }}>P7</button>
                <button className="btn-pickup-agv" onClick={() => clickPickup(7)} style={{ top: "66%", left: "36%" }}>P8</button>
              </>
            ) : null}
            {missionModel.codePickup === "721"||true ? (<>
              <button className='btn-pickup-agv  color-btn-warehouse' onClick={() => clickDrop("01")} style={{ top: '80%', left: '26%' }}>D1</button>
              <button className='btn-pickup-agv  color-btn-warehouse' onClick={() => clickDrop("02")} style={{ top: '86%', left: '19%' }}>D2</button>
              <button className='btn-pickup-agv  color-btn-warehouse' onClick={() => clickDrop("03")} style={{ top: '86%', left: '10%' }}>D3</button>
              <button className='btn-pickup-agv  color-btn-warehouse' onClick={() => clickDrop("04")} style={{ top: '80%', left: '3%' }}>D4</button>
              <button className='btn-pickup-agv  color-btn-warehouse' onClick={() => clickDrop("05")} style={{ top: '75%', left: '10%' }}>D5</button>
              <button className='btn-pickup-agv  color-btn-warehouse' onClick={() => clickDrop("06")} style={{ top: '75%', left: '19%' }}>D6</button>
              <button className='btn-pickup-agv  color-btn-warehouse' onClick={() => clickDrop("07")} style={{ top: '68%', left: '3%' }}>D7</button>
              <button className='btn-pickup-agv  color-btn-warehouse' onClick={() => clickDrop("08")} style={{ top: '55%', left: '3%' }}>D8</button>
              <button className='btn-pickup-agv  color-btn-warehouse' onClick={() => clickDrop("09")} style={{ top: '50%', left: '10%' }}>D9</button>
              <button className='btn-pickup-agv  color-btn-warehouse' onClick={() => clickDrop("10")} style={{ top: '50%', left: '20%' }}>D10</button>
              <button className='btn-pickup-agv  color-btn-warehouse' onClick={() => clickDrop("11")} style={{ top: '68%', left: '25%' }}>D11</button>
              <button className='btn-pickup-agv  color-btn-warehouse' onClick={() => clickDrop("12")} style={{ top: '56%', left: '25%' }}>D12</button>
              <button className='btn-pickup-agv  color-btn-warehouse' onClick={() => clickDrop("13")} style={{ top: '35%', left: '42%' }}>D13</button>
              <button className='btn-pickup-agv  color-btn-warehouse' onClick={() => clickDrop("14")} style={{ top: '43%', left: '42%' }}>D14</button>
              <button className='btn-pickup-agv  color-btn-warehouse' onClick={() => clickDrop("15")} style={{ top: '70%', left: '52%' }}>D15</button>
              <button className='btn-pickup-agv  color-btn-warehouse' onClick={() => clickDrop("16")} style={{ top: '72%', left: '78%' }}>D16</button>
              <button className='btn-pickup-agv  color-btn-warehouse' onClick={() => clickDrop("17")} style={{ top: '86%', left: '40%' }}>D17</button>
              <button className='btn-pickup-agv  color-btn-warehouse' onClick={() => clickDrop("18")} style={{ top: '53%', left: '32%' }}>D18</button>
              <button className='btn-pickup-agv  color-btn-warehouse' onClick={() => clickDrop("19")} style={{ top: '65%', left: '32%' }}>D19</button>
              <button className='btn-pickup-agv  color-btn-warehouse' onClick={() => clickDrop("20")} style={{ top: '68%', left: '44%' }}>D20</button>
              <button className='btn-pickup-agv  color-btn-warehouse' onClick={() => clickDrop("21")} style={{ top: '68%', left: '60%' }}>D21</button>
              <button className='btn-pickup-agv  color-btn-warehouse' onClick={() => clickDrop("22")} style={{ top: '68%', left: '69%' }}>D22</button>
            </>) : null}


          </div>
          <div className='agv-mission-box'>
            <div className='agv-mission-card' style={{ borderTop: `16px solid ${colorAgv[missionModel.agv]}` }}>
              <div className='agv-top-name-box'>
                <div className='agv-name-state'>
                  <div className='box-name-battery'>
                    <div className='agv-name-text' style={{ backgroundColor: colorAgv[missionModel.agv] || "red" }}>{missionModel.agv}</div>
                    <div className='agv-battery'><CiBatteryFull size={36} /><span>100%</span></div>
                  </div>
                  <div className={`auto-manual ${missionModel.mode}`}>{missionModel.mode}</div>
                  <div className='agv-state'>{missionModel.state}</div>
                </div>
                <img className='image-agv-model' src={AgvImg2}></img>
              </div>
              <div className="position-relative">
                {false && <div className='dotted-mission-line'></div>}
                <div ref={showMission} className='box-selected-drop'>
                  <div className='button-center' ><FaArrowDown size={24} /></div>

                  {agvselectedMission.current[missionModel.agv]?.pickup || pickup ? <div className='data-warehouse-box' style={{ top: '24px' }}>
                    <div className='circle-pickup-outline green-circle-bg'>
                      <div className='circle-pickup-inner'></div>
                    </div>
                    <div className='warehouse-from-to-box'>
                      <p style={{ color: '#838383' }}>from</p>
                      <h5>{agvselectedMission.current[missionModel.agv]?.pickup || pickup}</h5>
                    </div>
                  </div> : <h3 className="selectPickup">Select your pickup</h3>}
                  {selectWarehouse.map((warehouse) => <div key={warehouse} id={warehouse} className='data-warehouse-box data-drop-box'>
                    <div className='circle-goal-outline blue-circle-bg'>
                      <FaMapMarkerAlt size={32} color='#003092' />
                    </div>
                    <div className='warehouse-from-to-box'>
                      <p style={{ color: '#838383' }}>to</p>
                      <h5>{warehouse}</h5>
                    </div>
                    <div className="trash" onClick={()=>deleteDrop(warehouse)}><FaRegTrashCan size={24} color='gray'/></div>
                  </div>)}


                </div>
              </div>

              <button className='btn-send-command mt-3' onClick={() => modelPostMission(missionModel.agv, missionModel.id ?? 0)}>สั่งงาน</button>
            </div>
            <button className='close-model' onClick={() => setShowModel("hidden-model")}>ย้อนกลับ</button>
          </div>
        </div>
      </div>
    </section >
  );
}