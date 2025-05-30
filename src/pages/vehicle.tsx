import Car3D from '../assets/images/3d-truck.png';
import './css/vehicle.css';
import AgvImg from '../assets/images/plyagvmirror.png';
import BatteryDonutChart from './chart/batteryDonut.tsx';
import VelocityChart from './chart/velocityChart.tsx';
import { CiWifiOn } from "react-icons/ci";
import { RiBusWifiLine } from "react-icons/ri";
import { GoGear } from "react-icons/go";
import { PiPath } from "react-icons/pi";
import { BsFillRocketTakeoffFill } from "react-icons/bs";
import { HiOutlineStatusOnline } from "react-icons/hi";

import { useEffect, useState, useRef } from 'react';
import { IVehicles, IPayload } from './home.tsx';
import { axiosGet } from "../api/axiosFetch";
import { colorAgv } from '../utils/centerFunction';
import StatusOnline from './statusOnline';
import NetworkError from './networkError';
import { BiSolidError } from "react-icons/bi";
import { useTranslation } from 'react-i18next';
import NotAuthenticated from './not_authenticated.tsx';


export default function Vehicle() {

    const timerInterval = useRef<NodeJS.Timeout>(null);
    const [agvAll, setAgvAll] = useState<IPayload[]>([]);
    const [loadSuccess, setLoadSuccess] = useState(false);
    const [onlineBar, setOnlineBar] = useState<null | boolean>(null);
    const onlineRef = useRef<boolean | null>(null);
    const [checkNetwork, setCheckNetwork] = useState(true);
    const [agvDataExtend, setAgvDataExtend] = useState<IPayload | null>(null)
    const [notauthenticated, setNotAuthenticated] = useState(false);

    const { t } = useTranslation("vehicle");

    const btnChooseAGV = (index: number) => {
        setAgvDataExtend(agvAll[index]);
    }
    const closeModal = () => {
        setAgvDataExtend(null);
    }

    useEffect(() => {
        const myUser = sessionStorage.getItem("user")?.split(",")[2] ?? "";
        const vehicle = myUser === "admin" ? "ALL" : myUser;
        const getAgv = async () => {
            try {
                const res: IVehicles = await axiosGet(
                    `/vehicle/vehicles?vehicle_name=${vehicle}&state=ALL`,
                );
                if (onlineRef.current == false) {
                    setOnlineBar(true);
                    onlineRef.current = true;
                }
                const agv = res.payload;
                setAgvAll(agv);
            } catch (e: any) {
                console.log(e);
                if (e.message === "Network Error") {
                    setOnlineBar(false);
                    onlineRef.current = false;
                }
                else if (e.response?.status === 401 || e.response?.data?.detail === "Invalid token or Token has expired.") {
                    setNotAuthenticated(true)
                    if (timerInterval.current) {
                        clearInterval(timerInterval.current as NodeJS.Timeout);
                    }
                }
            }

        }
        const checkNetwork = async () => {
            try {
                const response = await fetch(import.meta.env.VITE_REACT_APP_API_URL, { method: "GET" });
                if (response.ok) {
                    getAgv();
                    timerInterval.current = setInterval(() => {
                        getAgv();
                    }, 5000);
                }
            } catch (e: any) {
                console.error(e);
                setCheckNetwork(false);
            } finally {
                if (!loadSuccess) {
                    setLoadSuccess(true);
                }
            }
        };
        checkNetwork();
        return () => {
            clearInterval(timerInterval.current as NodeJS.Timeout);
        };
    }, []);
    return (
        <div className='vehicle-box-page'>
            {!loadSuccess && <div className='loading-background'>
                <div id="loading"></div>
            </div>}
            {onlineBar !== null && <StatusOnline online={onlineBar}></StatusOnline>}
            {notauthenticated && <NotAuthenticated />}

            <div className="velocity-title-box">
                <h1>{t("title")}</h1>
                <p className="title1">
                    <img src={Car3D} alt="Logo agv" className="me-3" width="32" height="32" />
                    {t("subtitle")}</p>
            </div>
            {!checkNetwork ? <NetworkError /> : <div className="velocity-content-box">
                {agvDataExtend && <div className='fix-bg-info-vehicle' onClick={closeModal}>
                    <div className='box-vehicle-info'>
                        <h4 className='name-sticky'>{agvDataExtend.name.toUpperCase()}</h4>
                        <div className='px-3'>
                            <p>{t('state')}: <b>{t(`state_${agvDataExtend!.state}`)} {agvDataExtend!.state}</b></p>
                            <p>{t('trucksys')}: <b>{agvDataExtend!.mode ? "AUTO" : "MANUAL"}</b></p>
                            <p>{t('coordi')}: <b>{agvDataExtend!.coordinate}</b></p>
                            <p>{t('node')}: <b>{agvDataExtend!.node}</b></p>
                            <p>{t('battery')}: <b>{agvDataExtend!.battery}</b></p>
                            <p>{t('velocity')}: <b>{agvDataExtend!.velocity}</b></p>
                            <p>{t("home")}: <b>{agvDataExtend!.home}</b></p>
                            <p>{t("emerbtn")}: <b>{agvDataExtend!.emergency_state ? t('emer') : ""}</b></p>
                            {agvDataExtend!.mission && <div className='box-vehicle-info-misstion'>
                                <h5>misstion</h5>
                                <p>mission id: <b>{agvDataExtend!.mission!.id}</b></p>
                                <p>{t('timestamp')}: <b>{agvDataExtend!.mission!.timestamp}</b></p>
                                <p>{t("req")}: <b>{agvDataExtend!.mission!.requester}</b></p>
                                <p>{t('status')}: <b>{t(`m_status_${agvDataExtend!.mission.status}`)} {agvDataExtend!.mission.status}</b></p>
                                <p>{t('trans')}: <b>{t(`t_state_${agvDataExtend!.mission.transport_state}`)} {agvDataExtend!.mission.transport_state}</b></p>
                                <p>{t('node')}: <b>{agvDataExtend!.mission!.nodes}</b></p>
                                <p>{t("paths")}: <b>{agvDataExtend!.mission!.paths}</b></p>

                            </div>}
                        </div>

                    </div>
                </div>}
                {agvAll.map((agv, index) => <div className='vehicle-card' key={agv.name}>
                    <div className="v-content-top-box">
                        <div className="v-content-image">
                            <div className={`border-of-image ${(agv.state === 0) && 'agv-offline'}`}>
                                <img src={AgvImg} alt="agv" width="238" height='180' />
                            </div>
                            <div className="v-content-name">
                                <h6>{agv.name}</h6>
                                <div className='hr-name-agv' style={{ background: colorAgv[agv.name] }}></div>
                                <div className='d-flex align-items-center'>
                                    <div className='circle-bg-icon color-icon-1'>
                                        <CiWifiOn size={28} />
                                    </div>
                                    <span className='ms-2 fs-6' style={{ color: '#646464', fontWeight: '500' }}>{agv.ip_address}:{agv.port}</span>
                                </div>
                                {(agv.emergency_state || agv.state == 6) && <div className='EmergencyBtn'><BiSolidError size={20} color='red' />&nbsp;&nbsp;{agv.emergency_state ? t("emer") : t("state_6")}</div>}
                            </div>
                        </div>
                        <div className="v-content-chart">
                            <section className='battery-chart'>
                                <BatteryDonutChart level={agv.state===0?0:agv.battery}></BatteryDonutChart>
                            </section>
                            <section className="velocity-chart">
                                <VelocityChart level={(agv.velocity)}></VelocityChart>
                            </section>
                        </div>
                    </div>
                    <div className="v-content-middle-box">

                        <div className='d-flex align-items-center w-50'>
                            <div className='circle-bg-icon color-icon-3'>
                                <GoGear size={24} />
                            </div>
                            <div className='d-flex flex-column'>
                                <p className='ms-2 fs-6 my-0' style={{ color: '#646464', fontWeight: '500' }}>{agv.mode}</p>
                                <p className='ms-2 my-0' style={{ color: 'rgb(194, 194, 194)', fontSize: '12px' }}>{t('trucksys')}</p>

                            </div>
                        </div>
                        <div className='d-flex align-items-center w-50'>
                            <div className='circle-bg-icon color-icon-2'>
                                <RiBusWifiLine size={24} />
                            </div>
                            <div className='d-flex flex-column'>
                                <p className='ms-2 fs-6 my-0' style={{ color: '#646464', fontWeight: '500' }}>{t(`state_${agv.state}`)}</p>
                                <p className='ms-2  my-0' style={{ color: 'rgb(194, 194, 194)', fontSize: '12px' }}>{t('state')}</p>

                            </div>
                        </div>
                        <div className='d-flex align-items-center w-50'>
                            <div className='circle-bg-icon color-icon-4'>
                                <PiPath size={24} />
                            </div>
                            <div className='d-flex flex-column'>
                                <p className='ms-2 fs-6 my-0' style={{ color: '#646464', fontWeight: '500' }}>{agv.mode} </p>
                                <p className='ms-2 my-0' style={{ color: 'rgb(194, 194, 194)', fontSize: '12px' }}>{t('distance')}</p>

                            </div>
                        </div>
                        <div className='d-flex align-items-center w-50'>
                            <div className='circle-bg-icon color-icon-5'>
                                <BsFillRocketTakeoffFill size={20} />
                            </div>
                            <div className='d-flex flex-column'>
                                <p className='ms-2 fs-6 my-0' style={{ color: '#646464', fontWeight: '500' }}>#{agv.mission_id}</p>
                                <p className='ms-2 my-0' style={{ color: 'rgb(194, 194, 194)', fontSize: '12px' }}>mission id</p>

                            </div>
                            <button className='btn-extend' onClick={() => btnChooseAGV(index)}>เพิ่มเติม</button>
                        </div>
                    </div>
                    <div>
                        <div className='v-content-bottom2'>
                            {/* <div className='trapezoid' style={{borderBottom:`72px solid ${colorAgv[agv.name]}`}}><MdOnlinePrediction size={50} color='#0dff20' style={{margin:'12px 16px 0'}} /></div> */}
                            <div className='trapezoid' >
                                <h3 style={{ color: 'white', margin: '16px 32px 0', fontWeight: '500' }}>{agv.name}</h3>
                                <div className="agvColorBoxIcon" style={{ margin: '14px 0px 0', background: colorAgv[agv.name] }}></div>
                            </div>
                            {agv.state == 0 ? <HiOutlineStatusOnline size={40} color={'#cccc'} style={{ margin: '0px 28px 0 0' }} />
                                : <div className='onlineneon'><HiOutlineStatusOnline size={32} color='#0dff20' /></div>}
                        </div>
                    </div>

                </div>)}
            </div>}
        </div>
    );
}