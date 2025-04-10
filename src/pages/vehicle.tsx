import Car3D from '../assets/images/3d-truck.png';
import './css/vehicle.css';
import AgvImg from '../assets/images/plyagvmirror.png';
import BatteryDonutChart from './chart/batteryDonut.tsx';
import VelocityChart from './velocityChart.tsx';
import { CiWifiOn } from "react-icons/ci";
import { RiBusWifiLine } from "react-icons/ri";
import { BsFillGearFill } from "react-icons/bs";
import { PiPath } from "react-icons/pi";
import { BsFillRocketTakeoffFill } from "react-icons/bs";
import { HiOutlineStatusOffline,HiOutlineStatusOnline  } from "react-icons/hi";

import { useEffect, useState, useRef } from 'react';
import { IVehicles, IPayload } from './home.tsx';
import { axiosGet } from "../api/axiosFetch";


export default function Vehicle() {
    const colorAgv: { [key: string]: string } = { "AGV1": "#001494", "AGV2": "#cc0000", "AGV3": "#006a33", "AGV4": "#d7be00", "AGV5": "#94008d", "AGV6": "#0097a8" };

    const timerInterval = useRef<NodeJS.Timeout>(null);
    const [agvAll, setAgvAll] = useState<IPayload[]>([]);
    const [loadSuccess, setLoadSuccess] = useState(false);

    useEffect(() => {
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
        const pairMissionStatusHome = function (state: number,transport_state:number): string {
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
        const getAgv = async () => {
            try {
                const res: IVehicles = await axiosGet(
                    "/vehicle/vehicles?vehicle_name=ALL&state=ALL",
                );
                const agv = res.payload.map((data) => ({
                    ...data, str_state: pairAgvState(data.state),
                    str_mission: pairMissionStatusHome(data.mission?.status??0,data.mission?.transport_state??0), btn_pick_drop_code: `${data.state}${data.mission?.status}${data.mission?.transport_state}`
                }));
                console.log(agv);
                setAgvAll(agv);
            } catch (e) {
                console.log(e);
            } finally {
                if (!loadSuccess) {
                    setLoadSuccess(true);
                }
            }

        }

        if (sessionStorage.getItem("token")) {
            getAgv();
            timerInterval.current = setInterval(() => {
                getAgv();
            }, 3000);
        }
        return () => {
            clearInterval(timerInterval.current as NodeJS.Timeout);
        };
    }, []);
    return (
        <div>
            {!loadSuccess && <div className='loading-background'>
                <div id="loading"></div>
            </div>}
            <div className="velocity-title-box">
                <h1>AUTONOMOUS VEHICLE</h1>
                <p className="title1">
                    <img src={Car3D} alt="Logo agv" className="me-3" width="32" height="32" />
                    Information about each vehicle</p>
            </div>
            <div className="velocity-content-box">
                {agvAll.map((agv) => <div className='vehicle-card' key={agv.name}>
                    <div className="v-content-top-box">
                        <div className="v-content-image">
                            <div className="border-of-image">
                                <img src={AgvImg} alt="agv" width="238" height='180' />
                            </div>
                            <div className="v-content-name">
                                <h6>{agv.name}</h6>
                                <hr className='hr-name-agv' style={{ background: colorAgv[agv.name] }}></hr>
                                <div className='d-flex align-items-center'>
                                    <div className='circle-bg-icon color-icon-1'>
                                        <CiWifiOn size={28} />
                                    </div>
                                    <span className='ms-2 fs-6' style={{ color: '#646464', fontWeight: '500' }}>{agv.ip_address}:{agv.port}</span>
                                </div>
                                <p className='ms-2 fs-6' style={{ color: '#8F8F8F' }}>in process 60%</p>
                            </div>
                        </div>
                        <div className="v-content-chart">
                            <section className='battery-chart'>
                                <BatteryDonutChart level={agv.battery}></BatteryDonutChart>
                            </section>
                            <section className="velocity-chart">
                                <VelocityChart level={(agv.velocity)}></VelocityChart>
                            </section>
                        </div>
                    </div>
                    <div className="v-content-middle-box">

                        <div className='d-flex align-items-center w-50'>
                            <div className='circle-bg-icon color-icon-3'>
                                <BsFillGearFill size={24} />
                            </div>
                            <div className='d-flex flex-column'>
                                <p className='ms-2 fs-6 my-0' style={{ color: '#646464', fontWeight: '500' }}>{agv.mode}</p>
                                <p className='ms-2 my-0' style={{ color: '#c2c2c2', fontSize: '12px' }}>truck system</p>

                            </div>
                        </div>
                        <div className='d-flex align-items-center w-50'>
                            <div className='circle-bg-icon color-icon-2'>
                                <RiBusWifiLine size={24} />
                            </div>
                            <div className='d-flex flex-column'>
                                <p className='ms-2 fs-6 my-0' style={{ color: '#646464', fontWeight: '500' }}>{agv.str_state}</p>
                                <p className='ms-2  my-0' style={{ color: '#c2c2c2', fontSize: '12px' }}>status</p>

                            </div>
                        </div>
                        <div className='d-flex align-items-center w-50'>
                            <div className='circle-bg-icon color-icon-4'>
                                <PiPath size={24} />
                            </div>
                            <div className='d-flex flex-column'>
                                <p className='ms-2 fs-6 my-0' style={{ color: '#646464', fontWeight: '500' }}>{agv.mode} </p>
                                <p className='ms-2 my-0' style={{ color: '#c2c2c2', fontSize: '12px' }}>distance km</p>

                            </div>
                        </div>
                        <div className='d-flex align-items-center w-50'>
                            <div className='circle-bg-icon color-icon-5'>
                                <BsFillRocketTakeoffFill size={20} />
                            </div>
                            <div className='d-flex flex-column'>
                                <p className='ms-2 fs-6 my-0' style={{ color: '#646464', fontWeight: '500' }}>#{agv.mission_id}</p>
                                <p className='ms-2 my-0' style={{ color: '#c2c2c2', fontSize: '12px' }}>mission id</p>

                            </div>
                        </div>
                    </div>
                    <div>
                        <div className='v-content-bottom2'>
                            {/* <div className='trapezoid' style={{borderBottom:`72px solid ${colorAgv[agv.name]}`}}><MdOnlinePrediction size={50} color='#0dff20' style={{margin:'12px 16px 0'}} /></div> */}
                            <div className='trapezoid' >
                                <h3 style={{ margin: '16px 32px 0', fontWeight: '600' }}>{agv.name}</h3>
                                <div className="agvColorBoxIcon" style={{ margin: '14px 0px 0', background: colorAgv[agv.name] }}></div>
                            </div>
                            {agv.state == 0 ? <HiOutlineStatusOffline size={50} color={'#5b5b5b'} style={{ margin: '0px 28px 0 0' }} /> : <div className ='onlineneon'><HiOutlineStatusOnline  size={32} color='#0dff20' /></div>}
                        </div>
                    </div>

                </div>)}
            </div>
        </div>
    );
}