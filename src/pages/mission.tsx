import './css/mission.css'
import { IoMdSettings } from "react-icons/io";
import { FaMapMarkerAlt } from "react-icons/fa";
import MissionImage from '../assets/images/mission.png';


export default function Mission() {
    return <>
        <section className='mission-box'>
            <div className='mission-title-box'>
                <h1>MISSION</h1>
                <p className="title1">
                     <img src={MissionImage} alt="Logo with a yellow circle and blue border" className="me-3" width="32" height="32" />
                    <span>view and manage your mission</span></p>
            </div>
            <div className='container-card'>
                <div className='mission-header'>
                    <div className='selected-mission-btn'>
                        <button>All</button>
                        <button>Running</button>
                        <button>Success</button>
                        <button>Failed</button>
                        <button>Cencel</button>
                    </div>
                    <div className='input-date-box'>
                        <input type="date" className="form-control mr-2" />
                        <h5 className="mx-2 fw-narmal">to</h5>
                        <input type="date" className="form-control" />
                        <button className="export-btn">export</button>
                    </div>
                </div>
                <div className='table-container overflow-auto'>
                    <table className="table table-hover">
                        <thead className='text-center'>
                            <tr>
                                <th scope="col">job id</th>
                                <th scope="col" >รถ</th>
                                <th scope="col"><div className='head-table-flex'>
                                    <div className='pick-circle-icon'>
                                        <div className='pick-circle-icon-inner'></div>
                                    </div>จุดจอด
                                </div>
                                </th>
                                <th scope="col"><div className="head-table-flex">
                                    <div className='mission-circle-icon'>
                                        <IoMdSettings style={{ transform: "translateY(-4px)" }} color='#E9762B' />
                                    </div>
                                    status</div>
                                </th>
                                <th scope="col">
                                    <div className="head-table-flex">
                                        <div className='mission-circle-icon color-blue'>
                                            <FaMapMarkerAlt style={{ transform: "translateY(-4px)" }} color='#003092' />
                                        </div>
                                        จุดหมาย</div>
                                </th>
                                <th scope="col">วัน</th>
                                <th scope="col">เวลาจอง</th>
                                <th scope="col">เริ่มวิ่ง</th>
                                <th scope="col">จบงาน</th>
                                <th scope="col">ใช้เวลา</th>
                                <th scope="col" style={{ width: "120px" }}></th>

                            </tr>
                        </thead>
                        <tbody className='text-center'>
                            <tr>
                                <th scope="row">#113</th>
                                <td><div className='td-vehicle-name'><div className='circle-vehicle-icon color-agv1'></div><span>AGV 1</span></div></td>
                                <td>pickup 1</td>
                                <td><div className='box-status' style={{ background: '#EDEEEC', color: "#000000" }}>in process</div></td>
                                <td>w10,w5,s2</td>
                                <td>12/12/2024</td>
                                <td>13.54</td>
                                <td>13.54</td>
                                <td>13.54</td>
                                <td>10.20</td>
                                <td><button className='tb-mission-btn' style={{ background: 'black' }}>pause</button></td>
                            </tr>
                            <tr>
                                <th scope="row">#114</th>
                                <td><div className='td-vehicle-name'><div className='circle-vehicle-icon color-agv2'></div><span>AGV 1</span></div></td>
                                <td>pickup 1</td>
                                <td><div className='box-status' style={{ background: '#F1FFEA', color: "#009F05" }}>success</div></td>
                                <td>w10,w5,s2</td>
                                <td>12/12/2024</td>
                                <td>13.54</td>
                                <td>13.54</td>
                                <td>13.54</td>
                                <td>10.20</td>
                                <td><button className='tb-mission-btn' style={{ background: 'black' }}>pause</button></td>
                            </tr>
                            <tr>
                                <th scope="row">#115</th>
                                <td><div className='td-vehicle-name'><div className='circle-vehicle-icon color-agv1'></div><span>AGV 2</span></div></td>
                                <td>pickup 1</td>
                                <td><div className='box-status' style={{ background: '#FFE2E2', color: "#D30000" }}>canceled</div></td>
                                <td>w10,w5,s2</td>
                                <td>12/12/2024</td>
                                <td>13.54</td>
                                <td>13.54</td>
                                <td>13.54</td>
                                <td>10.20</td>
                                <td><button className='tb-mission-btn' style={{ background: 'red' }}>cancel</button></td>
                            </tr>
                            <tr>
                                <th scope="row">#116</th>
                                <td><div className='td-vehicle-name'><div className='circle-vehicle-icon color-agv1'></div><span>AGV 2</span></div></td>
                                <td>pickup 1</td>
                                <td><div className='box-status' style={{ background: '#E2E3FF', color: "#0800FF" }}>reserved</div></td>
                                <td>w10,w5,s2</td>
                                <td>12/12/2024</td>
                                <td>13.54</td>
                                <td>13.54</td>
                                <td>13.54</td>
                                <td>10.20</td>
                                <td><button className='tb-mission-btn' style={{ background: 'red' }}>cancel</button></td>
                            </tr>

                        </tbody>
                    </table>
                </div>
            </div>
        </section>

    </>;
}