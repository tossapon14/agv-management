import './css/home.css';
import MapAnimate from './map_animation.tsx';
import AgvImg from '../assets/images/plyagvmirror.png';
import AgvImg2 from '../assets/images/plyagv.png';
import Map_btn from '../assets/images/bg_btn.webp';
import MissionImage from '../assets/images/mission.png';
import Forkliift from '../assets/images/forklift.png'
import { useTranslation } from 'react-i18next';
import { TbCancel } from "react-icons/tb";

import { CiBatteryFull } from "react-icons/ci";
import { FaRegTrashCan } from "react-icons/fa6";
import { IoMdSettings, IoMdClose } from "react-icons/io";
import { FaMapMarkerAlt } from "react-icons/fa";
import { axiosGet, axiosPost, axiosPut } from "../api/axiosFetch";
import { useState, useRef, useEffect, Fragment, useCallback } from 'react';
import { BiSolidError } from "react-icons/bi";
import StatusOnline from './statusOnline';
import { pairMissionStatus, colorAgv } from '../utils/centerFunction';
import ResponseAPI from './responseAPI.tsx';
import NotAuthenticated from './not_authenticated.tsx';



interface IagvDataModel {
  agv: string
  id?: number
  agvCode: string
  state: number
  mode: string
  pickup?: string
  drop?: string[]
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
  node_idx: number | null
  mission: IMission | null
  processMission: { percents?: number, dropList: string[], numProcess?: number, dropNumber?: number } | null;
  timestamp?: string
}

interface IMission {
  id: number
  requester: string
  type: number
  nodes: string
  nodes_idx: string
  paths: string
  paths_coordinate: number[][][]
  status: number
  transport_state: number
  vehicle_name: string
  timestamp: string
  dispatch_time: any
  arriving_time: string | null
  duration: any
  nodes_coordinate: number[][]
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

interface IdialogConfirm {
  show: boolean
  name?: string
  id?: number
  agvCode?: string
  dropOne?: string
  dropAll?: string[]
  pickupName?: string
}


export default function Home() {

  const [missionModel, setMissionModel] = useState<IagvDataModel>({ agv: "", agvCode: '', state: 0, mode: '' });
  const [showModal, setShowModal] = useState<string>("");
  const [selectedAgv, setSelectedAgv] = useState("");
  const [agvAll, setAgvAll] = useState<IPayload[] | { state: number, name: string }[]>([{
    name: "AGV",
    state: 0
  }
  ]);
  const [pickup, setPickup] = useState<string | null>(null);
  const [selectWarehouse, setselectWarehouse] = useState<string[]>([])
  const [missionTable, setMissionTable] = useState<IPayloadMission[]>([]);
  const timerInterval = useRef<NodeJS.Timeout>(null);
  const missionLoop = useRef(0);
  const [loadSuccess, setLoadSuccess] = useState(false);
  const [buttonDropList, setButtonDropList] = useState<number[]>([]);
  const [agvPosition, setAgvPosition] = useState<string[][]>([])
  const prev_deg = useRef<{ [key: string]: number }>({});
  const [agvPath, setAgvPath] = useState<{ paths: number[][], drop: number[][] } | null>(null);
  const [onlineBar, setOnlineBar] = useState<null | boolean>(null);
  const onlineRef = useRef<boolean | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const confirmModalRef = useRef<HTMLDivElement>(null);
  const selectAgv = useRef<string>('');
  const firstInit = useRef(false);
  const loadSave = useRef(false);
  const [btnAGVName, setBtnAGVName] = useState<string[] | null>(null);
  const [waitMode, setWaitMode] = useState<boolean>(false);
  const [dialogSummary, setDialogSummary] = useState<IdialogConfirm>({ show: false });
  const [responseData, setResponseData] = useState<{ error: boolean | null, message?: string }>({ error: null });
  const [currentMission, setCurrentMission] = useState<number | null>(null);
  const trigger = useRef(false);
  const myUser = useRef<string>("");
  const [notauthenticated, setNotAuthenticated] = useState(false);
  const { t } = useTranslation('home'); // using the 'home' namespace

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
  const btnCancelMission = useCallback(async (id: number | undefined, name: string | undefined) => {
    if (!id || !name) return;
    setDialogSummary({ show: false });
    setResponseData({ error: null, message: "loading" });
    try {
      await axiosPut(`/mission/update/status?mission_id=${id}&vehicle_name=${name}&command=cancel`);
      setResponseData({ error: false, message: "Cancel success" })
      trigger.current = true;
    } catch (e: any) {
      console.error(e);
      setResponseData({ error: true, message: e?.message })
    }

  }, []);

  const showDialogSummary = useCallback((id: number, name: string, agvCode: string, pickup: string | undefined, dropall?: string[]) => {
    setShowModal("hidden-modal");
    setDialogSummary({ show: true, id, name, agvCode, pickupName: pickup, dropAll: dropall });
  }, []);


  const btnDialogConfirm = (id: number, name: string, agvCode: string | undefined, pick?: string | undefined, drop?: string[] | undefined) => {
    setDialogSummary({ show: false });
    setResponseData({ error: null, message: "loading" });
    if (agvCode === '721' && pick != undefined && drop != undefined) {
      const nodeCommand = pick + "," + drop.join(",");
      APIPutMissionGoal(id, name, nodeCommand);
    } else if (agvCode === '724' && name != undefined) {
      APIPutDropProduct(name!)
    }
    else if (pick != undefined) {
      APIPostPickupMission(name, pick);
    }
  }


  const getCanDrop = useCallback(async (pick: string): Promise<string[]> => {
    const response = await axiosGet(`/node/unloading_points?pickup_point=${pick}`);
    return response.payload;
  }, []);


  const APIPutDropProduct = useCallback(async (name: string) => {
    setResponseData({ error: null, message: "loading" });
    try {
      await axiosPut(`fleet/command?command=next&vehicle_name=${name}`);
      setResponseData({ error: false, message: "drop success" })
    } catch (e: any) {
      console.error("drop product", e)
      setResponseData({ error: true, message: e?.message })
    }
  }, []);


  const sendCommand = useCallback(async (agv: string, command: string) => {
    setResponseData({ error: null, message: "loading" });
    try {
      await axiosPut(`fleet/command?command=${command}&vehicle_name=${agv}`);
      setResponseData({ error: false, message: `${command} send success` })
    } catch (e: any) {
      console.error('send stop or continue', e)
      setResponseData({ error: true, message: e?.message })
    }
  }, []);

  const APIPutMissionGoal = useCallback(async (id: number, agv: string, nodeCommand: string) => {

    const dataMission: IMissionDrop = {
      id: id,
      nodes: nodeCommand,
      status: 2,
      transport_state: 2,
      vehicle_name: agv
    }
    try {
      await axiosPut("/mission/update", dataMission);
      setResponseData({ error: false, message: "send command success" })
    } catch (e: any) {
      console.error(e?.message);
      setResponseData({ error: true, message: e?.message })
    }

  }, []);


  const APIPostPickupMission = useCallback(async (agv: string, pickup: string) => {
    const dataMission: IMissionCreate = {
      "nodes": pickup,
      "requester": myUser.current,
      "type": 1,
      "vehicle_name": agv
    }
    try {
      await axiosPost("/mission/create", dataMission);
      setResponseData({ error: false, message: "send command success" })
    } catch (e: any) {
      console.error(e?.message);
      setResponseData({ error: true, message: e?.message })
    }
  }, []);


  const btnCallModal = useCallback(async (data: IagvDataModel) => {
    try {
      setMissionModel(data);
      setShowModal("show-modal");
      setPickup(null);
      setselectWarehouse([]);  // show when select button drop
      setButtonDropList([]);  // button drop on image bgc
      if (data.agvCode !== "721") {
        return;
      }
      else if (data.agvCode === "721" && data.pickup) {
        data.pickup = data.pickup!.split(",")[0] ?? "";
        const btnDropList = await getCanDrop(data.pickup!);
        const index_drop = btnDropList.map((drop) => Number(drop.substring(1, 3)) - 1);
        setButtonDropList(index_drop);
      } else {
        console.log("can't find pickup", data.pickup);
      }

    } catch (e) {
      console.error(e);
    }
  }, []);

  const deleteDrop = useCallback((node: string) => {
    const element = document.getElementById(node);
    if (element) {
      element.classList.add("slide-out");
      setTimeout(() => {
        setselectWarehouse((prev) => prev.filter((item) => item !== node));
      }, 500);
    }
  }, []);

  const clickDrop = useCallback((index: string) => {
    if (!selectWarehouse.includes(`D${index}S`)) {
      setselectWarehouse(prev => [...prev, `D${index}S`]);
    }

  }, [selectWarehouse])

  const clickPickup = (index: number) => {
    const PS = ["P01S", "P02S", "P03S", "P04S", "P05S", "P06S", "P07S", "P08S"];
    setPickup(null);
    setTimeout(() => {
      setPickup(PS[index]);
    }, 200);

  };

  const selectAgvFunction = useCallback((agvName: string) => {
    selectAgv.current = agvName;
    trigger.current = true;
    loadSave.current = false;
    setSelectedAgv(agvName);
    setWaitMode(true);
    setLoadSuccess(false);
  }, []);

  useEffect(() => {
    myUser.current = sessionStorage.getItem("user")?.split(",")[2] ?? "";
    selectAgv.current = myUser.current === "admin" ? "ALL" : myUser.current;
    if (selectAgv.current === "") return;
    const calProcessMission = (agvCurrent_index: number | null, missionNodes_index: string | undefined, nodes: string): { percents?: number, dropList: string[], numProcess?: number, dropNumber?: number } | null => {
      if (missionNodes_index == undefined || missionNodes_index == "") {
        return null;
      }
      else if (!agvCurrent_index) return { dropList: nodes.split(',') };
      const mission_index_list = JSON.parse(missionNodes_index!); //[4,11,13,21]
      var numProcess = 0;
      var dropNumber = 0;
      var percents = 0;
      for (let i = 0; i < mission_index_list.length; i++) {
        if (mission_index_list[i] <= agvCurrent_index) {
          numProcess = i;
          if (i < mission_index_list.length - 1) {
            percents = Math.round((((agvCurrent_index - mission_index_list[i]) / (mission_index_list[i + 1] - mission_index_list[i])) + i) * 100 / (mission_index_list.length - 1))
          }
        } if (mission_index_list[i] < agvCurrent_index) {
          dropNumber = i
        }
      }

      return { percents: percents, dropList: nodes.split(','), numProcess, dropNumber };
    };

    const calPositionAGV = (coor: string, name: string): string[] => {
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
      if (delta > 180) {
        delta = delta - 360;
      } else if (delta < -180) {
        delta = delta + 360
      }
      prev_deg.current[name] = prev_deg.current[name] + delta;
      return [name, positionX, positionY, prev_deg.current[name].toString()];
    }

    const _date = new Date().toISOString().substring(0, 10)

    const getMission = async () => {
      try {
        const res: IMissionData = await axiosGet(
          `/mission/missions?vehicle_name=${selectAgv.current}&status=ALL&start_date=${_date}&end_date=${_date}&page=1&page_size=10`
        );

        setMissionTable(res.payload.slice(0, 4).map(ele => ({
          ...ele, str_status: pairMissionStatus(ele.status),
          drop: ele.nodes.substring(5), pick: ele.nodes.substring(0, 4)
        })));
      } catch (e: any) {
        if (e.response?.status === 404) {
          setMissionTable([]);
        }
        else if (e.response?.data?.detail) {
          console.log('mission', e.response.data.detail);
        }
        return e.response?.data || { message: "Unknown error occurred" };
      } finally {
        if (!loadSave.current) {
          loadSave.current = true;
          setLoadSuccess(true);
        }
      }
    };

    const getAgv = async () => {
      try {
        const res: IVehicles = await axiosGet(
          `/vehicle/vehicles?vehicle_name=${selectAgv.current}&state=ALL`,
        );
        if (onlineRef.current == false) {
          setOnlineBar(true);
          onlineRef.current = true;
        }
        const _agvPosition: string[][] = [];
        const _agv: IPayload[] = [];
        const agvName: string[] = [];
        if (myUser.current === "admin") {
          agvName.push("ALL");
        }
        res.payload.forEach((data: IPayload) => {
          agvName.push(data.name)

          var _agvData: IPayload;
          if (data.state > 0) {
            _agvPosition.push(calPositionAGV(data.coordinate, data.name));
            if (data.mission) {
              let _processMission = calProcessMission(data.node_idx, data.mission.nodes_idx, data.mission.nodes);
              if (_processMission?.dropNumber != undefined && data.state > 2 && selectAgv.current !== 'ALL') {  // condition find path color   
                if (_processMission.dropList.length > 1) {
                  data.mission?.nodes_coordinate.shift()
                }
                var drop = data.mission?.nodes_coordinate.slice(_processMission.dropNumber);
                setAgvPath({ paths: data.mission!.paths_coordinate[1], drop });
              } else {
                setAgvPath(null);
              }
              _agvData = {
                ...data,
                processMission: _processMission,
                agv_code_status: `${data.state}${data.mission.status}${data.mission.transport_state}`,
                timestamp: data.mission.dispatch_time?.substring(11, 16),
              }
              setCurrentMission(data.mission.id);
            }
            else {

              _agvData = data;
              setAgvPath(null);
              setCurrentMission(null);
            }

          } else {
            _agvData = data;
          }
          _agv.push(_agvData);
        });

        if (!firstInit.current) {
          firstInit.current = true;
          setBtnAGVName(agvName);
        }
        setSelectedAgv(selectAgv.current);
        setAgvPosition(_agvPosition);
        setAgvAll(_agv);
      } catch (e: any) {
        if (e.message === "Network Error") {
          setOnlineBar(false);
          onlineRef.current = false;
        } else  if (e.response.status === 401||e.response?.data?.detail==="Invalid token or Token has expired.") {
          setNotAuthenticated(true)
          if (timerInterval.current) {
            clearInterval(timerInterval.current as NodeJS.Timeout);
          }
        }
        else if (e.response?.data?.detail) {
          console.log('getAGV', e.response.data.detail);
        }
        else {
          console.error(e.message)
        }
      } finally {
        if (!loadSave.current) {
          loadSave.current = true;
          setLoadSuccess(true);

        }
      }

    }
    getAgv();
    getMission();
    timerInterval.current = setInterval(() => {
      missionLoop.current++;
      getAgv();
      if (missionLoop.current === 5 || trigger.current) {
        missionLoop.current = 0;
        trigger.current = false;
        getMission();
      }
    }, 3000);

    const handleClickOutside = (event: any) => {
      if (modalRef.current === event.target) {
        setShowModal("hidden-modal");
      }
    };
    const handleClickOutsideConfirm = (event: any) => {
      if (confirmModalRef.current === event.target) {
        setDialogSummary({ show: false })
      }
    };
    if (modalRef.current) {
      modalRef.current.addEventListener("mouseup", handleClickOutside);
    }
    if (confirmModalRef.current) {
      confirmModalRef.current.addEventListener("mouseup", handleClickOutsideConfirm)
    }

    return () => {
      modalRef.current!.removeEventListener("mouseup", handleClickOutside);
      confirmModalRef.current!.removeEventListener("mouseup", handleClickOutsideConfirm);
      clearInterval(timerInterval.current as NodeJS.Timeout);
    };
  }, []);
  return (
    <section className='home'>
      {!loadSuccess && <div className={`loading-background ${waitMode ? 'bg-opacity' : ''}`}>
        <div id="loading"></div>
      </div>}
      {onlineBar !== null && <StatusOnline online={onlineBar}></StatusOnline>}
      {notauthenticated && <NotAuthenticated />}
      <section className="col1">
        <MapAnimate data={agvPosition} paths={agvPath}  ></MapAnimate>
        <div className="mt-4 px-0">
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
                      <th>{t("tb_jobid")}</th>
                      <th>{t("tb_car")}</th>
                      <th><div className='head-table-flex'>
                        <div className='pick-circle-icon'>
                        </div>{t("tb_pickup")}
                      </div></th>
                      <th><div className="head-table-flex">
                        <div className='mission-circle-icon color-blue'>
                          <FaMapMarkerAlt color='#003092' />
                        </div>
                        {t("tb_drop")}</div></th>
                      <th><div className="head-table-flex">
                        <div className='mission-circle-icon'>
                          <IoMdSettings color='#E9762B' />
                        </div>
                        {t("tb_status")}</div></th>
                      <th>{t("tb_date")}</th>
                      <th>{t("tb_time")}</th>
                      <th>{t("tb_cancel")}</th>
                    </tr>
                  </thead>
                  <tbody className='text-center'>
                    {missionTable.map((data, i) => <tr key={i} className={`${currentMission === data.id ? "row-misstion-background" : ""}`}>
                      <td>#{data.id}</td>
                      <td><div className='td-vehicle-name'><div className='circle-vehicle-icon' style={{ background: `${colorAgv[data.vehicle_name]}` }}></div><span className="dot dot-blue"></span>{data.vehicle_name}</div></td>
                      <td>{data.pick}</td>
                      <td>{data.drop}</td>
                      <td><div className='box-status' style={{ background: data.str_status.bgcolor, color: data.str_status.color }}>{t(`m_status_${data.status}`)}</div></td>
                      <td>{data.timestamp.substring(0, 10)}</td>
                      <td>{data.timestamp.substring(11, 19)}</td>
                      <td>{data.status == 0 && <button className="btn-cancel" onClick={() => setDialogSummary({ show: true, name: data.vehicle_name, id: data.id, agvCode: "001" })}>cancel</button>}</td>
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
          {btnAGVName?.map((name) => <button key={name} onClick={() => selectAgvFunction(name)} className={`btn-agv ${selectedAgv === name ? 'active' : ''}`}>{name}</button>)}
        </div>
        {agvAll.map((agv, index) => (agv.state === 0) ? <section key={index} className='box-agv-data'
        >
          <div className='top-box-data'>
            <img className='image-agv' src={AgvImg}></img>
            <div className='box-name-agv'>
              <div className='box-name-battery'>
                <div className='agv-name-text' style={{ backgroundColor: "#ccc" }}>{agv.name}</div>
                <div className='agv-battery'><CiBatteryFull size={36} /><span>{93}%</span></div>
              </div>
              <div className='agv-state-offline'>{t("state_0")}</div>
            </div>
            <div className='velocity'>
              <h1 className='velocity-number'>0.0</h1>
              <p className="km-h">km/h</p>
              <button className='button-agv' >{t("stop")}</button>
            </div>
          </div>
          <div className="box-no-mossion">
            <div className='circle-1'></div>
            <div className='circle-2'></div>
          </div>
          <div className='mission-container'>
            <div className='mission-status'></div>
            <button className='mission-btn'>
              {t("btn_create")}
            </button>

          </div>
        </section> : <section key={index} className='box-agv-data'>
          <div className='top-box-data'>
            <img className='image-agv' src={AgvImg}></img>
            <div className='box-name-agv'>
              <div className='box-name-battery'>
                <div className='agv-name-text' style={{ backgroundColor: colorAgv[agv.name] }}>{agv.name}</div>
                <div className='agv-battery'><CiBatteryFull size={36} /><span>{(agv as IPayload).battery}%</span></div>
              </div>

              <div className={`auto-manual ${(agv as IPayload).mode}`}>{(agv as IPayload).mode}</div>
              {((agv as IPayload).emergency_state || (agv as IPayload).state == 6) ? <div className='EmergencyBtn'><BiSolidError size={20} color='red' />&nbsp;&nbsp;{(agv as IPayload).emergency_state ? t("emer") : t("state_6")}</div>
                : <div className='agv-state'>{t(`state_${agv.state}`)}</div>}
            </div>
            <div className='velocity'>
              <h1 className='velocity-number'>{(agv as IPayload).velocity.toFixed(1)}</h1>
              <p className="km-h">km/h</p>
              {(agv as IPayload).state == 4 ? <button className='button-agv' onClick={() => sendCommand((agv as IPayload).name, 'continue')}>{t("continue")}</button>
                : <button className='button-agv' onClick={() => sendCommand((agv as IPayload).name, 'pause')}>{t("stop")}</button>}
            </div>
          </div>

          {(agv as IPayload).processMission ?
            <div className='box-dotted-mission'>
              <div className='circle-1'></div>
              <div className='circle-2'></div>
              <div className='circle-3'></div>
              <div className='circle-4'></div>
              <div className="mission-text-box">
                <img src={MissionImage} alt="logo rocket" className="me-1" width="24" height="24" />
                <p className="fs-6 mb-1">mission <span className="fw-bolder">#{(agv as IPayload).mission_id}</span></p>
              </div>
              {(agv as IPayload).processMission!.dropList!.length > 1 ? <div className='pickup-process-line'>
                <div className="mission-process-box" >
                  <div className="pickup-box">
                    <div className='pickup-text'>{(agv as IPayload).processMission!.dropList[0]}</div>
                    <div className='pickup-time'>{(agv as IPayload).timestamp ?? ""}</div>
                  </div>
                  <div className='center-line-box'>
                    <hr className="line-process-gray"></hr>
                    <div className="line-process" style={{ width: `${(agv as IPayload).processMission!.percents}%` }}></div>
                    <div className="circle-pickup"></div>
                    <div className={`circle-goal ${(agv as IPayload).processMission?.numProcess === (agv as IPayload).processMission!.dropList.length - 1 ? 'active' : ''}`}></div>
                    {(agv as IPayload).processMission!.dropList.slice(1, -1).map((drop, i) => <div key={i} className={`stations-box ${(agv as IPayload).processMission?.numProcess! >= i + 1 ? 'active' : ''}`} style={{ left: `${(i + 1) * 100 / ((agv as IPayload).processMission!.dropList.length - 1)}%` }}>
                      <div className={`circle-top-stations ${(agv as IPayload).processMission?.numProcess! >= i + 1 ? 'active' : ''}`}></div>
                      <div className={`label-station ${(agv as IPayload).processMission?.numProcess! >= i + 1 ? 'active' : ''}`}>{drop}</div>
                    </div>)}

                  </div>
                  <div className="goal-box">
                    <div className='pickup-text'>{(agv as IPayload).processMission!.dropList[(agv as IPayload).processMission!.dropList.length - 1]}</div>
                  </div>
                </div>
                {(agv as IPayload).agv_code_status === "724" && <div className='alert-pickup'><BiSolidError size={28} color={'#ffce03'} />&nbsp;&nbsp;{t("sign_drop")}</div>}

              </div> :
                <div className='pickup-process-line'>

                  <div className='pickup-data'><div className='circle88'></div>
                    <div>{t("pick")} <span>{(agv as IPayload).processMission!.dropList[0]}</span></div></div>
                  {(agv as IPayload).agv_code_status === "721" && <div className='alert-pickup'><BiSolidError size={28} color={'#ffce03'} />{t("sign_pick")}</div>}

                </div>}
            </div> : <div className="box-no-mossion">

              <div className='circle-1'></div>
              <div className='circle-2'></div>
            </div>}
          <div className='mission-container'>
            <div className={`${(agv as IPayload).agv_code_status === "724" || (agv as IPayload).agv_code_status === "721" ? 'd-none' : 'mission-status'}`}>
              {((agv as IPayload).mission?.status != 2) ? t(`m_status_${(agv as IPayload).mission?.status}`) : t(`t_state_${(agv as IPayload).mission?.transport_state}`)}
            </div>
            {(agv as IPayload).agv_code_status === "724" ? <button className='drop-btn' onClick={() => setDialogSummary({ show: true, id: 0, name: (agv as IPayload).name, agvCode: '724', dropOne: (agv as IPayload).node })}>{t("btn_drop")}</button> :
              (agv as IPayload).agv_code_status === "721" ? <button className='mission-btn miss-animate'
                onClick={() => btnCallModal({ agv: agv.name, agvCode: "721", id: (agv as IPayload).mission?.id, state: (agv as IPayload).state, mode: (agv as IPayload).mode, pickup: (agv as IPayload).mission!.nodes })}>
                {t("btn_pick")}
              </button> :
                <button className='mission-btn' onClick={() => btnCallModal({ agv: agv.name, agvCode: (agv as IPayload).agv_code_status, id: (agv as IPayload).mission?.id, state: agv.state, mode: (agv as IPayload).mode })}>
                  {t("btn_create")}
                </button>}
          </div>
        </section>)}
      </section>
      <ResponseAPI response={responseData} />
      <div ref={confirmModalRef} className={`modal-summaryCommand ${!dialogSummary.show && 'd-none'}`}>
        <div className='card-summaryCommand'>
          {dialogSummary.agvCode === "001" ? <> {/*  dialog cancel   */}
            <div className='card-summaryCommand-header'>
              <div className="icon-name-agv">
                <div className='bg-img' style={{ background: 'rgb(255, 244, 244)' }}>
                  <TbCancel size={32} color={'rgb(254, 0, 0)'} />
                </div>
                <h5>{t("md_cancel")} {dialogSummary.name}</h5>
              </div>
              <button className='btn-close-summary' onClick={() => setDialogSummary({ show: false })}><IoMdClose size={16} /></button>
            </div>
            <div className='summary-command-pickup'>
              <div className='h1 px-1' style={{ borderBottom: '4px solid red' }}>{dialogSummary.id}</div>
            </div>
            <p>job id</p>
            <p style={{ color: '#ccc' }}>{t("md_confirm_cancel")}</p>
            <button className='btn w-100 mt-3 py-3 btn-danger' onClick={() => btnCancelMission(dialogSummary.id, dialogSummary.name)}>{t("tb_cancel")}</button>

          </> :
            dialogSummary.agvCode === "724" ? <> {/*  dialog drop   */}
              <div className='card-summaryCommand-header'>
                <div className="icon-name-agv">
                  <div className='bg-img' style={{ background: '#FFF1EA' }}>
                    <img src={Forkliift} alt="Logo forklift" width="40" height="40" />
                  </div>
                  <h5>{dialogSummary.name} <span className='h6'>{t("md_head")}</span></h5>
                </div>
                <button className='btn-close-summary' onClick={() => setDialogSummary({ show: false })}><IoMdClose size={16} /></button>
              </div>
              <div className='summary-command-pickup'>
                <div className='pickup-name-box' style={{ borderBottom: '2px solid red' }}>{dialogSummary.dropOne}</div>
              </div>
              <p>{t("md_pick")}</p>
              <p style={{ color: '#ccc' }}>{t("md_confirm")}</p>
              <button className='btn-confirm' onClick={() => btnDialogConfirm(dialogSummary.id!, dialogSummary.name!, dialogSummary.agvCode)}>{t("btn_confirm")}</button>
            </> : <>                         {/*721 or all code  pickup and drop   */}
              <div className='card-summaryCommand-header'>
                <div className="icon-name-agv">
                  <div className='bg-img'>
                    <img src={MissionImage} alt="Logo rocket" width="40" height="40" />
                  </div>
                  <h5>{dialogSummary.name}</h5>
                </div>
                <button className='btn-close-summary' onClick={() => setDialogSummary({ show: false })}><IoMdClose size={16} /></button>
              </div>
              <div className='summary-command-pickup'>
                <div className='pickup-name-box border-bottom-color'>{dialogSummary.pickupName}</div>
              </div>
              <p>{t("tb_pickup")}</p>
              <div className='summary-command-pickup'>
                {dialogSummary.dropAll?.map((drop, index) => <Fragment key={drop}>
                  <div className='pickup-name-box drop-name-box border-bottom-color'>{drop}</div>
                  {(index < dialogSummary.dropAll!.length - 1) && <div className='border-bottom-color'>
                    <hr style={{ width: '20px', border: '1px solid black' }} />
                  </div>}
                </Fragment>
                )}
              </div>
              {dialogSummary.dropAll?.length && <p>{t("tb_drop")}</p>}
              <p style={{ color: '#ccc' }}>{t("md_confirm")}</p>
              <button className='btn-confirm' onClick={() => btnDialogConfirm(dialogSummary.id!, dialogSummary.name!, dialogSummary.agvCode, dialogSummary.pickupName, dialogSummary.dropAll)}>{t("btn_confirm")}</button>
            </>}
        </div>
      </div>
      <div ref={modalRef} className={`modal ${showModal} `}>
        <div className='modal-content-home'>
          <div className='box-map-and-btn'>
            {buttonDropList.length === 0 && missionModel.agvCode === "721" && <div className='modal-loading-background'>
              <div id="loading"></div>
            </div>}
            <img src={Map_btn} className="map-img" alt='map' loading="lazy"></img>
            {missionModel.agvCode === "721" ?
              <>
                {buttonDropList.length === 0 && <div className='modal-loading-background'>
                  <div id="loading"></div>
                </div>}
                {buttonDropList.map((i) => (
                  <button
                    key={i}
                    className="btn-pickup-agv color-btn-warehouse"
                    onClick={() => clickDrop(buttonsDrop[i].id)}
                    style={{ top: buttonsDrop[i].top, left: buttonsDrop[i].left }}
                  >
                    {`D${buttonsDrop[i].id}`}
                  </button>
                ))}
              </>
              : <>
                <button className="btn-pickup-agv" onClick={() => clickPickup(0)} style={{ top: "74%", left: "66%" }}>P1</button>
                <button className="btn-pickup-agv" onClick={() => clickPickup(1)} style={{ top: "74%", left: "60%" }}>P2</button>
                <button className="btn-pickup-agv" onClick={() => clickPickup(2)} style={{ top: "74%", left: "54%" }}>P3</button>
                <button className="btn-pickup-agv" onClick={() => clickPickup(3)} style={{ top: "34%", left: "40%" }}>P4</button>
                <button className="btn-pickup-agv" onClick={() => clickPickup(4)} style={{ top: "74%", left: "48%" }}>P5</button>
                <button className="btn-pickup-agv" onClick={() => clickPickup(5)} style={{ top: "34%", left: "80%" }}>P6</button>
                <button className="btn-pickup-agv" onClick={() => clickPickup(6)} style={{ top: "54%", left: "36%" }}>P7</button>
                <button className="btn-pickup-agv" onClick={() => clickPickup(7)} style={{ top: "66%", left: "36%" }}>P8</button>
              </>}



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
                  <div className='agv-state'>{t(`state_${missionModel.state}`)}</div>
                </div>
                <img className='image-agv-modal' src={AgvImg2}></img>
              </div>
              <div className="position-relative">
                {!!selectWarehouse.length && <div className='dotted-mission-line'></div>}
                <div className='box-selected-drop'>
                  {missionModel.agvCode !== "721" && <h6>Select your pickup</h6>}
                  {(pickup || missionModel.pickup) ? <div className='data-warehouse-box'>
                    <div className='circle-pickup-outline green-circle-bg'>
                      <div className='circle-pickup-inner'></div>
                    </div>
                    <div className='warehouse-from-to-box'>
                      <p style={{ color: '#838383' }}>from</p>
                      <h5>{pickup || missionModel.pickup}</h5>
                    </div>
                  </div> : null}
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
              {missionModel.agvCode === '721' ? <button className='btn-send-command mt-4' disabled={!(selectWarehouse.length > 0)} onClick={() => showDialogSummary(missionModel.id ?? 0, missionModel.agv, '721', missionModel.pickup, selectWarehouse)}>{t("command")}</button> :
                <button className='btn-send-command mt-4' disabled={!(pickup)} onClick={() => showDialogSummary(missionModel.id ?? 0, missionModel.agv, missionModel.agvCode ?? '', pickup ?? "",)}>{t("command")}</button>
              }
            </div>
            <button className='close-modal' onClick={() => setShowModal("hidden-modal")}>{t("back")}</button>
          </div>
        </div>
      </div>
    </section >
  );
}