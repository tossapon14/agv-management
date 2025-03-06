import Car3D from '../assets/images/3d-truck.png';
import './css/vehicle.css';
import AgvImg from '../assets/images/plyagvmirror.png';
import BatteryDonutChart from './batteryDonut.tsx';
import VelocityChart from './velocityChart.tsx';
import { CiWifiOn } from "react-icons/ci";
import { RiBusWifiLine } from "react-icons/ri";
import { BsFillGearFill } from "react-icons/bs";
import { PiPath } from "react-icons/pi";
import { BsFillRocketTakeoffFill } from "react-icons/bs";
import { MdOnlinePrediction } from "react-icons/md";


export default function Vehicle() {
    return (
        <div>

            <div className="velocity-title-box">
                <h1>AUTONOMOUS VEHICLE</h1>
                <p className="title1">
                    <img src={Car3D} alt="Logo agv" className="me-3" width="32" height="32" />
                    Information about each vehicle</p>
            </div>
            <div className="velocity-content-box">
                <div className='vehicle-card'>
                    <div className="v-content-top-box">
                        <div className="v-content-image">
                            <div className="border-of-image">
                                <img src={AgvImg} alt="agv" width="238" height='180' />
                            </div>
                            <div className="v-content-name">
                                <h6>AGV 1</h6>
                                <hr className='hr-name-agv'></hr>
                                <div className='d-flex align-items-center'>
                                    <div className='circle-bg-icon color-icon-1'>
                                        <CiWifiOn size={28} />
                                    </div>
                                    <span className='ms-2 fs-6' style={{ color: '#646464', fontWeight: '500' }}>192.168.22.6:3000</span>
                                </div>
                                <p className='ms-2 fs-6' style={{ color: '#8F8F8F' }}>in process 60%</p>
                            </div>
                        </div>
                        <div className="v-content-chart">
                            <section className='battery-chart'>
                                <BatteryDonutChart level={70}></BatteryDonutChart>
                            </section>
                            <section className="velocity-chart">
                                <VelocityChart level={5.5}></VelocityChart>
                            </section>
                        </div>
                    </div>
                    <div className="v-content-middle-box">
                        <div className='d-flex align-items-center w-50'>
                            <div className='circle-bg-icon color-icon-2'>
                                <RiBusWifiLine size={24} />
                            </div>
                            <div className='d-flex flex-column'>
                                <p className='ms-2 fs-6 my-0' style={{ color: '#646464', fontWeight: '500' }}>ลงสินค้า</p>
                                <p className='ms-2  my-0' style={{ color: '#c2c2c2', fontSize: '12px' }}>status</p>

                            </div>
                        </div>
                        <div className='d-flex align-items-center w-50'>
                            <div className='circle-bg-icon color-icon-3'>
                                <BsFillGearFill size={24} />
                            </div>
                            <div className='d-flex flex-column'>
                                <p className='ms-2 fs-6 my-0' style={{ color: '#646464', fontWeight: '500' }}>Manaul</p>
                                <p className='ms-2 my-0' style={{ color: '#c2c2c2', fontSize: '12px' }}>truck system</p>

                            </div>
                        </div>
                        <div className='d-flex align-items-center w-50'>
                            <div className='circle-bg-icon color-icon-4'>
                                <PiPath size={24} />
                            </div>
                            <div className='d-flex flex-column'>
                                <p className='ms-2 fs-6 my-0' style={{ color: '#646464', fontWeight: '500' }}>155.5 </p>
                                <p className='ms-2 my-0' style={{ color: '#c2c2c2', fontSize: '12px' }}>distance km</p>

                            </div>
                        </div>
                        <div className='d-flex align-items-center w-50'>
                            <div className='circle-bg-icon color-icon-5'>
                                <BsFillRocketTakeoffFill size={20} />
                            </div>
                            <div className='d-flex flex-column'>
                                <p className='ms-2 fs-6 my-0' style={{ color: '#646464', fontWeight: '500' }}>#120</p>
                                <p className='ms-2 my-0' style={{ color: '#c2c2c2', fontSize: '12px' }}>mission id</p>

                            </div>
                        </div>
                    </div>
                    <div className='v-content-bottom2'>
                        <MdOnlinePrediction size={50} color='#0dff20' />
                        <h2>AGV 1</h2>
                    </div>
                </div>
                <div className='vehicle-card'>
                    <div className="v-content-top-box">
                        <div className="v-content-image">
                            <div className="border-of-image">
                                <img src={AgvImg} alt="agv" width="238" height='180' />
                            </div>
                            <div className="v-content-name">
                                <h6>AGV 2</h6>
                                <hr className='hr-name-agv'></hr>
                                <div className='d-flex align-items-center'>
                                    <div className='circle-bg-icon color-icon-1'>
                                        <CiWifiOn size={28} />
                                    </div>
                                    <span className='ms-2 fs-6' style={{ color: '#646464', fontWeight: '500' }}>192.168.22.1:3000</span>
                                </div>
                                <p className='ms-2 fs-6' style={{ color: '#8F8F8F' }}>in process 0%</p>
                            </div>
                        </div>
                        <div className="v-content-chart">
                            <section className='battery-chart'>
                                <BatteryDonutChart level={20}></BatteryDonutChart>
                            </section>
                            <section className="velocity-chart">
                                <VelocityChart level={0}></VelocityChart>
                            </section>
                        </div>
                    </div>
                    <div className="v-content-middle-box">
                        <div className='d-flex align-items-center w-50'>
                            <div className='circle-bg-icon color-icon-2'>
                                <RiBusWifiLine size={24} />
                            </div>
                            <div className='d-flex flex-column'>
                                <p className='ms-2 fs-6 my-0' style={{ color: '#646464', fontWeight: '500' }}>ลงสินค้า</p>
                                <p className='ms-2  my-0' style={{ color: '#c2c2c2', fontSize: '12px' }}>status</p>

                            </div>
                        </div>
                        <div className='d-flex align-items-center w-50'>
                            <div className='circle-bg-icon color-icon-3'>
                                <BsFillGearFill size={24} />
                            </div>
                            <div className='d-flex flex-column'>
                                <p className='ms-2 fs-6 my-0' style={{ color: '#646464', fontWeight: '500' }}>AUTO</p>
                                <p className='ms-2 my-0' style={{ color: '#c2c2c2', fontSize: '12px' }}>truck system</p>

                            </div>
                        </div>
                        <div className='d-flex align-items-center w-50'>
                            <div className='circle-bg-icon color-icon-4'>
                                <PiPath size={24} />
                            </div>
                            <div className='d-flex flex-column'>
                                <p className='ms-2 fs-6 my-0' style={{ color: '#646464', fontWeight: '500' }}>230.5 </p>
                                <p className='ms-2 my-0' style={{ color: '#c2c2c2', fontSize: '12px' }}>distance km</p>

                            </div>
                        </div>
                        <div className='d-flex align-items-center w-50'>
                            <div className='circle-bg-icon color-icon-5'>
                                <BsFillRocketTakeoffFill size={20} />
                            </div>
                            <div className='d-flex flex-column'>
                                <p className='ms-2 fs-6 my-0' style={{ color: '#646464', fontWeight: '500' }}>#123</p>
                                <p className='ms-2 my-0' style={{ color: '#c2c2c2', fontSize: '12px' }}>mission id</p>

                            </div>
                        </div>
                    </div>
                    <div className='v-content-bottom2' style={{background:'rgb(65, 1, 1)'}}>
                        <MdOnlinePrediction size={50} color='#0dff20' />
                        <h2>AGV 2</h2>
                    </div>
                </div>
            </div>
        </div>
    );
}