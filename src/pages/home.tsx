import './css/home.css';
import MapAnimate from './map_animation.tsx';
import AgvImg from '../assets/images/plyagvmirror.png';
import AgvImg2 from '../assets/images/plyagv.png';
import Map_btn from '../assets/images/bg_btn.webp';
import MissionImage from '../assets/images/mission.png';

import { CiBatteryFull } from "react-icons/ci";
import { FaArrowDown,FaRegTrashCan } from "react-icons/fa6";
import { IoMdSettings } from "react-icons/io";
import { FaMapMarkerAlt } from "react-icons/fa";
import { axiosGet, axiosPost, axiosPut } from "../api/axiosFetch";
import { useState, useRef, useEffect } from 'react';
import { pairMissionStatus } from './mission.tsx';
import { BiError } from "react-icons/bi";

interface IagvDataModel {
  agv: string;
  id?: number;
  codePickup: string;
  str_state: string;
  state: number;
  mode: string;
}
export interface IVehicles {
  message: string
  payload: IPayload[]
}
export interface IPayload {
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
  agv_code_status: string
  mission: IMission | null
  str_state?: string
  str_mission: string | null;
  processMission: { percents: number, nodesList: string[], numProcess: number } | null;
  havePickup?: string | null;
}
interface IMission {
  id: number
  requester: string
  type: number
  nodes: string
  paths: string
  paths_coordinate: number[][]
  status: number
  transport_state: number
  vehicle_name: string
  timestamp: string
  dispatch_time: any
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
  str_status: { txt: string, color: string, bgcolor: string }
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
interface IMapData { agv: string, online: boolean, position: string[] }


export default function Home() {
  const colorAgv: { [key: string]: string } = { "AGV1": "#001494", "AGV2": "#cc0000", "AGV3": "#006a33", "AGV4": "#d7be00", "AGV5": "#94008d", "AGV6": "#0097a8" };

  const modalRef = useRef<HTMLDivElement>(null);

  const [missionModel, setMissionModel] = useState<IagvDataModel>({ agv: "", codePickup: '', state: 0, str_state: '', mode: '' });
  const [showModal, setShowModal] = useState<string>("");
  const [selectedAgv, setSelectedAgv] = useState(0);
  const [agvAll, setAgvAll] = useState<IPayload[]>([]);
  const [pickup, setPickup] = useState<string | null>(null);
  const [selectWarehouse, setselectWarehouse] = useState<string[]>([])
  const [missionTable, setMissionTable] = useState<IPayloadMission[]>([]);
  const agvselectedMission = useRef<IAgvSelected>({});
  const timerInterval = useRef<NodeJS.Timeout>(null);
  const missionLoop = useRef(0);
  const [loadSuccess, setLoadSuccess] = useState(false);
  const [buttonDropList, setButtonDropList] = useState<number[]>([]);
  const [mapData, setMapData] = useState<IMapData[]>([])
  const prev_deg = useRef<{ [key: string]: number }>({});
  const [agvPath, setAgvPath] = useState<number[][][]>([]);
  const [positionDrop, setPositionDrop] = useState<{ x: string, y: string }[]>([]);





  const buttonsDrop = [
    { id: "01", top: "80%", left: "26%" },
    { id: "02", top: "86%", left: "19%" },
    { id: "03", top: "86%", left: "10%" },
    { id: "04", top: "80%", left: "3%" },
    { id: "05", top: "75%", left: "10%" },
    { id: "06", top: "75%", left: "19%" },
    { id: "07", top: "68%", left: "3%" },
    { id: "08", top: "55%", left: "3%" },
    { id: "09", top: "50%", left: "10%" },
    { id: "10", top: "50%", left: "19%" },
    { id: "11", top: "68%", left: "25%" },
    { id: "12", top: "56%", left: "25%" },
    { id: "13", top: "35%", left: "42%" },
    { id: "14", top: "43%", left: "42%" },
    { id: "15", top: "70%", left: "52%" },
    { id: "16", top: "72%", left: "78%" },
    { id: "17", top: "86%", left: "40%" },
    { id: "18", top: "53%", left: "32%" },
    { id: "19", top: "65%", left: "32%" },
    { id: "20", top: "68%", left: "44%" },
    { id: "21", top: "68%", left: "60%" },
    { id: "22", top: "68%", left: "69%" },
  ];

  const getCanDrop = async (pick: string): Promise<string[]> => {
    // console.log("444444", pick);
    const response = await axiosGet(`/node/unloading_points?pickup_point=${pick}`);
    return response.payload;
  };

  const sendMissionDrop = async (agv: string) => {
    const response = await axiosPut(`fleet/command?command=next&vehicle_name=${agv}`);
    console.log(response);
  }
  const sendCommand = async (agv: string, command: string) => {
    const response = await axiosPut(`fleet/command?command=${command}&vehicle_name=${agv}`);
    console.log(response);
  }
  const modalPutDropMission = async (agv: string, id: number) => {
    if (selectWarehouse.length > 0 && agvselectedMission.current[agv]?.pickup) { //select drop
      const dataMission: IMissionDrop = {
        id: id,
        nodes: `${agvselectedMission.current[agv]?.pickup},${selectWarehouse.join(",")}`,
        status: 2,
        transport_state: 2,
        vehicle_name: agv
      }
      // console.log(dataMission);
      const response = await axiosPut("/mission/update", dataMission);
      console.log(response);
    }
  }
  const modalPostMissionPickup = async (agv: string) => {
    if (agvselectedMission.current[agv]?.pickup || pickup) {
      const dataMission: IMissionCreate = {
        "nodes": pickup || agvselectedMission.current[agv]?.pickup!,
        "requester": "admin",
        "type": 1,
        "vehicle_name": agv
      }
      // console.log(dataMission);
      // const response = 
      await axiosPost("/mission/create", dataMission);
    }
  }


  const btnCallModal = async (data: IagvDataModel) => {
    try {
      setMissionModel(data);
      setShowModal("show-modal");
      setPickup(null);
      setselectWarehouse([]);
      setButtonDropList([]);
      if (data.codePickup !== "721") {
        return;
      }
      else if (agvselectedMission.current[data.agv]?.pickup && data.codePickup === "721") {
        const btnDropList = await getCanDrop(agvselectedMission.current[data.agv].pickup!);
        const index_drop = btnDropList.map((drop) => Number(drop.substring(1, 3)) - 1);
        // console.log(index_drop);
        setButtonDropList(index_drop);
      } else {
        console.log("can't find pickup", agvselectedMission.current[data.agv]);
      }

    } catch (e) {
      console.error(e);
    } finally { }
  }
  const deleteDrop = (node: string) => {
    const element = document.getElementById(node);
    if (element) {
      element.classList.add("slide-out");
      setTimeout(() => {
        setselectWarehouse((prev) => prev.filter((item) => item !== node));
      }, 500);
    }
  };

  const clickDrop = (index: string) => {
    if (!selectWarehouse.includes(`D${index}S`)) {
      setselectWarehouse(prev => [...prev, `D${index}S`]);
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
      if (e.target === modalRef.current) {
        setShowModal("hidden-modal");
      }
    };
    const calProcessMission = (missNode: string | undefined, path: string | undefined, curr: string | undefined, transport_state: number | undefined): { percents: number, nodesList: string[], numProcess: number } | null => {
      if (missNode === undefined || path === undefined || curr === undefined || transport_state === undefined) return null;
      // path = "D15S, P02S, P03S, P05S, P0504N, P0505N, D11S, D12S, D1201N, P04S, D13S, D14S, D1401N, D1402N, D20S, D15S, D21S, D1501N, D22S";
      // curr = "D15S";
      // missNode = "P04S,D20S,D15S,D21S,D22S";
      const nodesList = missNode.split(",");
      if (nodesList.length == 1) return { percents: 0, nodesList: nodesList, numProcess: 0 };
      const pathList = path.split(", ");
      const dropIndex: number[] = []
      nodesList.forEach(node => {
        if (pathList.lastIndexOf(node) != -1) {
          dropIndex.push(pathList.lastIndexOf(node));
        }

      });

      const nodeCurrent = pathList.lastIndexOf(curr);
      var numProcess = 0;
      var percents: number = 0;

      for (let i = 0; i < dropIndex.length; i++) {
        if (dropIndex[i] <= nodeCurrent) {
          numProcess = i;
          if (i < dropIndex.length - 1) {
            percents = Math.round((((nodeCurrent - dropIndex[i]) / (dropIndex[i + 1] - dropIndex[i])) + i) * 100 / (nodesList.length - 1))
          }
        }
      }
      return { percents: percents, nodesList: nodesList, numProcess: numProcess };
    };
    const calPositionXY = (rawPose: number[]): { x: string, y: string } => {
      const x = Number(rawPose[0]) * -Math.cos(-0.082) - Number(rawPose[1]) * -Math.sin(-0.082);
      const y = Number(rawPose[0]) * -Math.sin(-0.082) + Number(rawPose[1]) * -Math.cos(-0.082);
      const positionX = (((x + 20) / 996.782) * 100).toFixed(3) + '%'; //width :1016.8 height: 598.9952
      const positionY = (((y + 280) / 586.10) * 100).toFixed(3) + '%';
      return { x: positionX, y: positionY };
    }
    const calPositionAGV = (coor: string, name: string): string[] => {
      // const pre_degree = this.state.robotModel.positionNum[2];
      // coor= '-186.87,-8.32,0.57'
      // // coor= '0,0,0'

      // console.log(this.imageHeightY,y);
      const rawPose = coor.split(",");
      const x = Number(rawPose[0]) * -Math.cos(-0.082) - Number(rawPose[1]) * -Math.sin(-0.082);
      const y = Number(rawPose[0]) * -Math.sin(-0.082) + Number(rawPose[1]) * -Math.cos(-0.082);
      const positionX = (((x + 45) / 996.782) * 100).toFixed(3) + '%'; //width :1016.8 height: 598.9952
      const positionY = (((y + 270) / 586.10) * 100).toFixed(3) + '%';
      const degree = ((Number(rawPose[2]) - 0.082) * -180) / Math.PI;
      if (prev_deg.current[name] === undefined) {
        prev_deg.current[name] = 0.0;
      }
      let delta = degree - prev_deg.current[name];
      if (delta >= 180) {
        delta = delta - 360;
      } else if (delta <= -180) {
        delta = delta + 360
      }
      prev_deg.current[name] = prev_deg.current[name] + delta;
      // console.log([positionX, positionY, newDegree]);
      // return ["0%","0%", prev_deg.current.toString()];

      return [positionX, positionY, prev_deg.current[name].toString()];
    }

    const pairAgvState = function (state: number): string {
      switch (state) {
        case 0: return "ไม่ออฟไลน์";
        case 1: return "ออนไลน์";
        case 2: return "พร้อมรับงาน"
        case 3: return "กำลังทำงาน";
        case 4: return "หยุด";
        case 5: return "พบสิ่งกีดขวาง";
        case 6: return "ระบบพบปัญหา";
        case 7: return "รอคำสั่ง";
        case 8: return "กำลังจอง";
        default: return "";
      }
    }
    const pairMissionStatusHome = function (state: number, transport_state: number): string {
      if (state === undefined) return "";
      switch (state) {
        case 0: return "รออนุมัติ";
        case 1: return "อนุมัติ";
        case 2: return pairTransportState(transport_state);
        case 3: return "สำเร็จ";
        case 4: return "ปฏิเสธ";
        case 5: return "ยกเลิก";
        case 6: return "ไม่สำเร็จ";
        default: return "";
      }
    }

    const pairTransportState = function (state: number): string {
      switch (state) {
        case 0: return "";
        case 1: return "กำลังขึ้นสินค้า";
        case 2: return "ขึ้นสินค้า";
        case 3: return "ขนส่ง";
        case 4: return "กำลังลงสินค้า";
        case 5: return "สำเร็จ";
        default: return "";
      }
    }
    const now = new Date();
    const getDate = `${now.getFullYear()}-${("0" + (now.getMonth() + 1)).slice(-2)}-${("0" + now.getDate()).slice(-2)}`;

    const getMission = async () => {
      try {
        const res: IMissionData = await axiosGet(
          // `/mission/missions?vehicle_name=ALL&status=ALL&start_date=${"2025-03-06"}&end_date=${getDate}&page=1&page_size=10`
          `/mission/missions?vehicle_name=ALL&status=ALL&start_date=${getDate}&end_date=${getDate}&page=1&page_size=10`
        );
        // console.log(pairMissionStatus(1));

        setMissionTable(res.payload.slice(0, 4).map(ele => ({
          ...ele, str_status: pairMissionStatus(ele.status),
          drop: ele.nodes.substring(5), pick: ele.nodes.substring(0, 4)
        })));
      } catch (e: any) {
        if (e.response?.data?.detail) {
          console.log(e.response.data.detail);
        }
        return e.response?.data || { message: "Unknown error occurred" };
      } finally {
        if (!loadSuccess) {
          setLoadSuccess(true);
        }
      }
    };

    const getAgv = async () => {
      try {
        const res: IVehicles = await axiosGet(
          '/vehicle/vehicles?vehicle_name=ALL&state=ALL',
        );

        const _mapData: IMapData[] = [];
        const _agv: IPayload[] = [];
        const _paths: number[][][] = [];
        const _positionDrop: { x: string, y: string }[] = [];
        res.payload.forEach((data: IPayload) => {
          const _data: IMapData = {
            agv: data.name,
            online: data.state != 0,
            position: calPositionAGV(data.coordinate, data.name),
          };
          if (data.mission?.paths_coordinate && data.state > 2) {
            _paths.push(data.mission.paths_coordinate);
            const drop = data.mission?.nodes.split(',');
            if (drop.length > 1) {
              drop.shift();
            }
            const path = data.mission?.paths.split(', ');
            drop.forEach(d => {
              const indexDrop = path.indexOf(d);
              if (indexDrop != -1) {
                _positionDrop.push(calPositionXY(data.mission!.paths_coordinate[indexDrop]));
              }
            });
          }

          const _agvData = {
            ...data,

            processMission: calProcessMission(data.mission?.nodes, data.mission?.paths, data.node, data.mission?.transport_state),
            str_state: pairAgvState(data.state),
            str_mission: pairMissionStatusHome(data.mission?.status ?? 0, data.mission?.transport_state ?? 0),
            agv_code_status: `${data.state}${data.mission?.status}${data.mission?.transport_state}`,
            havePickup: (data.mission?.nodes.split(',').length == 1) ? data.mission?.nodes : null,
          }
          // console.log(_agvData)
          if (data.mission?.nodes && data.name && `${data.state}${data.mission?.status}${data.mission?.transport_state}` == "721") {
            if (data.mission.nodes.split(",").length >= 1) {
              agvselectedMission.current[data.name] = { pickup: data.mission.nodes.split(",")[0] }
            }
          }
          _agv.push(_agvData);
          _mapData.push(_data);
        });
        setAgvAll(_agv);

        setMapData(_mapData);
        setAgvPath(_paths);
        setPositionDrop(_positionDrop);

      } catch (e: any) {
        if (e.message === "Network Error") {

        }
      }

    }

    if (modalRef.current) {
      modalRef.current.addEventListener("mouseup", handleMouseUp);
    }
    if (sessionStorage.getItem("token")) {
      getAgv();
      getMission();
      timerInterval.current = setInterval(() => {
        missionLoop.current++;
        getAgv();
        if (missionLoop.current === 5) {
          missionLoop.current = 0;
          getMission();
        }
      }, 3000);
    }
    return () => {
      if (modalRef.current) {
        modalRef.current.removeEventListener("mouseup", handleMouseUp);
      }
      clearInterval(timerInterval.current as NodeJS.Timeout);
    };
  }, []);
  return (
    <section className='home'>
      {!loadSuccess && <div className='loading-background'>
        <div id="loading"></div>
      </div>}
      <section className="col1">
        <MapAnimate data={mapData} paths={agvPath} positionDrop={positionDrop}></MapAnimate>
        <div className="container mt-4 px-0">
          <div className="card mb-3">
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
                      <td><div className='td-vehicle-name'><div className='circle-vehicle-icon' style={{ background: `${colorAgv[data.vehicle_name]}` }}></div><span className="dot dot-blue"></span>{data.vehicle_name}</div></td>
                      <td>{data.pick}</td>
                      <td><div className='box-status' style={{ background: data.str_status.bgcolor, color: data.str_status.color }}>{data.str_status.txt}</div></td>
                      <td>{data.drop}</td>
                      <td>{data.timestamp.substring(0, 10)}</td>
                      <td>{data.timestamp.substring(11, 19)}</td>
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
          <button onClick={() => selectAgvFunction(0)} className={`btn-agv ${selectedAgv === 0 ? 'active' : ''}`}>ทั้งหมด</button>
          {agvAll.map((agv, index) => <button key={agv.name} onClick={() => selectAgvFunction(index + 1)} className={`btn-agv ${selectedAgv === index + 1 ? 'active' : ''}`}>{agv.name}</button>)}
        </div>
        {agvAll.map((agv, index) => (agv.state === 0) ? <section key={index} className={`box-agv-data ${(selectedAgv === index + 1 || selectedAgv === 0) ? "" : "d-none"}`}
        >
          <div className='top-box-data'>
            <img className='image-agv' src={AgvImg}></img>
            <div className='box-name-agv'>
              <div className='box-name-battery'>
                <div className='agv-name-text' style={{ backgroundColor: "#ccc" }}>{agv.name}</div>
                <div className='agv-battery'><CiBatteryFull size={36} /><span>{93}%</span></div>
              </div>
              <div className='agv-state-offline'>{agv.str_state}</div>
            </div>
            <div className='velocity'>
              <h1 className='velocity-number'>0.0</h1>
              <p className="km-h">km/h</p>
              <button className='button-agv' >หยุด</button>
            </div>
          </div>
          <div className="box-no-mossion">
            <div className='button-center' ><FaArrowDown size={24} /></div>
            <div className='circle-1'></div>
            <div className='circle-2'></div>
          </div>
          <div className='mission-container'>
            <div className='mission-status'></div>
            <button className='mission-btn' onClick={() => btnCallModal({ agv: agv.name, codePickup: agv.agv_code_status, id: agv.mission?.id, str_state: agv.str_state!, state: agv.state, mode: agv.mode })}>
              สร้างคิวงาน
            </button>

          </div>
        </section> : <section key={index} className={`box-agv-data ${(selectedAgv === index + 1 || selectedAgv === 0) ? "" : "d-none"}`}
        >
          <div className='top-box-data'>
            <img className='image-agv' src={AgvImg}></img>
            <div className='box-name-agv'>
              <div className='box-name-battery'>
                <div className='agv-name-text' style={{ backgroundColor: colorAgv[agv.name] }}>{agv.name}</div>
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

          {agv.processMission ?
            <div className='box-dotted-mission'>
              <div className='button-center'><FaArrowDown size={24} /></div>
              <div className='circle-1'></div>
              <div className='circle-2'></div>
              <div className='circle-3'></div>
              <div className='circle-4'></div>
              <div className="mission-text-box">
                <img src={MissionImage} alt="Logo with a yellow circle and blue border" className="me-1" width="24" height="24" />
                <p className="fs-6 mb-1">mission <span className="fw-bolder">#{agv.mission_id}</span></p>
              </div>
              {agv.processMission.nodesList.length > 1 ? <div className="mission-process-box" >
                <div className="pickup-box">
                  <div className='pickup-text'>{agv.processMission!.nodesList[0]}</div>
                  {/* <div className='pickup-time'>09.53</div> */}
                </div>
                <div className='center-line-box'>
                  <hr className="line4"></hr>
                  <div className="line-process" style={{ width: `${agv.processMission!.percents}%` }}></div>
                  <div className="circle-pickup"></div>
                  <div className={`circle-goal ${agv.processMission?.numProcess === agv.processMission!.nodesList.length - 1 ? 'active' : ''}`}></div>
                  {/* <div className='list-drop-box-flex'> */}
                  {agv.processMission!.nodesList.slice(1, -1).map((drop, i) => <div key={i} className={`stations-box ${agv.processMission?.numProcess! >= i + 1 ? 'active' : ''}`} style={{ left: `${(i + 1) * 100 / (agv.processMission!.nodesList.length - 1)}%` }}>
                    <div className={`circle-top-stations ${agv.processMission?.numProcess! >= i + 1 ? 'active' : ''}`}></div>
                    <div className={`label-station ${agv.processMission?.numProcess! >= i + 1 ? 'active' : ''}`}>{drop}</div>
                  </div>)}
                  {/* </div> */}

                </div>
                <div className="goal-box">
                  <div className='pickup-text'>{agv.processMission!.nodesList[agv.processMission!.nodesList.length - 1]}</div>
                  {/* <div className='pickup-time'>10.32</div> */}
                </div>
              </div> : <div className='only-pickup-box'>

                <div className='pickup-data'><div className='circle88'></div>
                <div>จอดจุด <span>{agv.processMission!.nodesList[0]}</span></div></div>
                {agv.agv_code_status === "721"&&<div className='alert-pickup'><BiError size={28} color={'#ffa100'} /> &nbsp;&nbsp;เลือกจุดลงสินค้า</div>}

                </div>}
            </div> : <div className="box-no-mossion">
              <div className='button-center' ><FaArrowDown size={24} /></div>
              <div className='circle-1'></div>
              <div className='circle-2'></div>
            </div>}
          <div className='mission-container'>
            <div className='mission-status'>{agv.str_mission}</div>
            {agv.agv_code_status === "724" ? <button className='drop-btn' onClick={() => sendMissionDrop(agv.name)}>ลงสินค้า</button> :
              agv.agv_code_status === "721" ? <button className='mission-btn miss-animate' onClick={() => btnCallModal({ agv: agv.name, codePickup: "721", id: agv.mission?.id, str_state: agv.str_state!, state: agv.state, mode: agv.mode })}>
                จองจุดลง
              </button> :
                <button className='mission-btn' onClick={() => btnCallModal({ agv: agv.name, codePickup: agv.agv_code_status, id: agv.mission?.id, str_state: agv.str_state!, state: agv.state, mode: agv.mode })}>
                  สร้างคิวงาน
                </button>}

          </div>
        </section>)}
      </section>
      <div ref={modalRef} className={`modal ${showModal}`}>
        <div className='modal-content-home'>
          <div className='box-map-and-btn'>
            {buttonDropList.length === 0 && missionModel.codePickup === "721" ? <div className='modal-loading-background'>
              <div id="loading"></div>
            </div> :
              <img src={Map_btn} className="map-img" alt='map' loading="lazy"></img>}
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
            {buttonDropList.map((i) => (
              <button
                key={buttonsDrop[i].id}
                className="btn-pickup-agv color-btn-warehouse"
                onClick={() => clickDrop(buttonsDrop[i].id)}
                style={{ top: buttonsDrop[i].top, left: buttonsDrop[i].left }}
              >
                {`D${buttonsDrop[i].id}`}
              </button>
            ))}


          </div>
          <div className='agv-mission-box'>
            <div className='agv-mission-card' style={{ borderTop: `16px solid ${colorAgv[missionModel.agv]}` }}>
              <div className='agv-top-name-box'>
                <div className='agv-name-state'>
                  <div className='box-name-battery'>
                    <div className='agv-name-text' style={{ backgroundColor: colorAgv[missionModel.agv] || "red" }}>{missionModel.agv}</div>
                    <div className='agv-battery'><CiBatteryFull size={36} /><span>100%</span></div>
                  </div>
                  {(missionModel.state != 0) && <div className={`auto-manual ${missionModel.mode}`}>{missionModel.mode}</div>}
                  <div className='agv-state'>{missionModel.str_state}</div>
                </div>
                <img className='image-agv-modal' src={AgvImg2}></img>
              </div>
              <div className="position-relative">
                {!!selectWarehouse.length && <div className='dotted-mission-line'></div>}
                <div className='box-selected-drop'>
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
                    <div className="trash" onClick={() => deleteDrop(warehouse)}><FaRegTrashCan size={24} color='gray' /></div>
                  </div>)}


                </div>
              </div>

              <button className='btn-send-command mt-4' onClick={() => missionModel.codePickup === "721" ? modalPutDropMission(missionModel.agv, missionModel.id ?? 0) : modalPostMissionPickup(missionModel.agv)}>สั่งงาน</button>
            </div>
            <button className='close-modal' onClick={() => setShowModal("hidden-modal")}>ย้อนกลับ</button>
          </div>
        </div>
      </div>
    </section >
  );
}