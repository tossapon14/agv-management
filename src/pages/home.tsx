import './css/home.css';
import MapAnimate from './map_animation.tsx';
import AgvImg from '../assets/images/plyagvmirror.png';
import AgvImg2 from '../assets/images/plyagv.png';

import { CiBatteryFull } from "react-icons/ci";
import { FaArrowDown, FaWarehouse } from "react-icons/fa6";
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
  auto: string;
  colorBoxName: string;
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
}


export default function Home() {
  const modelRef = useRef<HTMLDivElement>(null);

  const [missionModel, setMissionModel] = useState<IagvDataModel>({ agvName: "", status: 0, state: '', auto: '', colorBoxName: '', });
  const [showModel, setShowModel] = useState<string>("");
  const [selectedAgv, setSelectedAgv] = useState(0);
  const [agv, setAgv] = useState<IPayload[]>([]);
  const [btnAgv, setBtnAgv] = useState<string[]>([]);
  const [selectPickup, setSelectedPickup] = useState<React.ReactNode>(<h3 className="selectPickup">Select your pickup</h3>)
  const [selectWarehouse, setSelectWarehouse] = useState<string[]>([]);

  const clickWarehouse = (i: string) => {
    setSelectWarehouse((prev) => [...prev, `warehouse ${i}`]);
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
    const getAgv = async () => {
      try {
        const res: IVehicles = await axiosGet(
          "https://2514-110-164-87-31.ngrok-free.app/vehicle/vehicles?vehicle_name=ALL&state=ALL",
        );
        setAgv(res.payload);
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
        {(selectedAgv === 1 || selectedAgv === 0) ? <section className='box-agv-data'>
          <div className='top-box-data'>
            <img className='image-agv' src={AgvImg}></img>
            <div className='box-name-agv'>
              <div className='box-name-battery'>
                <div className='agv-name-text AGV1'>AGV 1</div>
                <div className='agv-battery'><CiBatteryFull size={36} /><span>100%</span></div>
              </div>

              <div className='auto-manual MANUAL'>MANUAL</div>
              <div className='agv-state'>กำลังทำงาน</div>
            </div>
            <div className='velocity'>
              <h1 className='velocity-number'>3.4</h1>
              <p className="km-h">km/h</p>
              <button className='button-agv'>หยุด</button>
            </div>
          </div>
          <div className='mission-line-container'>

          </div>
          <div className='box-dotted-mission'>
            <div className='button-center'  ><FaArrowDown size={24} /></div>
            <div className='circle-1'></div>
            <div className='circle-2'></div>
            <div className='circle-3'></div>
            <div className='circle-4'></div>
            <div className="mission-text-box">
              {/* <img src={MissionImage} alt="Logo with a yellow circle and blue border" className="me-1" width="28" height="28" /> */}
              <p className="fs-5 mb-0">mission <span className="fw-bolder">#12</span></p>
            </div>
            <div className="mission-process-box">
              <div className="pickup-box">
                <div className='pickup-text'>P3</div>
                <div className='pickup-time'>12.22</div>
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
                <div className='pickup-time'>12.48</div>
              </div>
            </div>
          </div>
          <div className='mission-container'>
            <div className='mission-status'>จุดลงสินค้า</div>
            <button className='misstion-btn' onClick={() => clickMission({ agvName: "AGV 1", status: 2, state: 'รับสินค้า', auto: 'MANUAL', colorBoxName: 'AGV1' }, "show-model")}>จองที่จอด</button>
          </div>
        </section> : <div></div>}
        {(selectedAgv === 2 || selectedAgv === 0) ? <section className='box-agv-data'>
          <div className='top-box-data'>
            <img className='image-agv' src={AgvImg}></img>
            <div className='box-name-agv'>
              <div className='box-name-battery'>
                <div className='agv-name-text AGV2'>AGV 2</div>
                <div className='agv-battery'><CiBatteryFull size={36} /><span>100%</span></div>
              </div>

              <div className='auto-manual AUTO'>AUTO</div>
              <div className='agv-state'>กำลังทำงาน</div>
            </div>
            <div className='velocity'>
              <h1 className='velocity-number'>5.2</h1>
              <p className="km-h">km/h</p>
              <button className='button-agv'>หยุด</button>
            </div>
          </div>
          {true ? <div className="box-no-mossion">
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
                <p className="fs-5 mb-0">mission <span className="fw-bolder">#12</span></p>
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
            <div className='mission-status'>รับสินค้า</div>
            <button className='misstion-btn' onClick={() => clickMission({ agvName: "AGV 2", status: 2, state: 'รับสินค้า', auto: 'AUTO', colorBoxName: 'AGV2' }, "show-model")}>จองที่จอด</button>
          </div>
        </section> : <div></div>}
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
              <button className='btn-pickup-agv color-btn-warehouse'  onClick={() => clickWarehouse("1")} style={{ top: '80%', left: '25%' }}>D1</button>
              <button className='btn-pickup-agv color-btn-warehouse'  onClick={() => clickWarehouse("2")} style={{ top: '88%', left: '18%' }}>D2</button>
              <button className='btn-pickup-agv color-btn-warehouse'  onClick={() => clickWarehouse("3")} style={{ top: '88%', left: '10%' }}>D3</button>
              <button className='btn-pickup-agv color-btn-warehouse'  onClick={() => clickWarehouse("4")} style={{ top: '80%', left: '2%' }}>D4</button>
              <button className='btn-pickup-agv color-btn-warehouse'  onClick={() => clickWarehouse("5")} style={{ top: '70%', left: '9%' }}>D5</button>
              <button className='btn-pickup-agv color-btn-warehouse'  onClick={() => clickWarehouse("6")} style={{ top: '70%', left: '18%' }}>D6</button>
              <button className='btn-pickup-agv color-btn-warehouse'  onClick={() => clickWarehouse("7")} style={{ top: '65%', left: '2%' }}>D7</button>
              <button className='btn-pickup-agv color-btn-warehouse'  onClick={() => clickWarehouse("8")} style={{ top: '52%', left: '2%' }}>D8</button>
              <button className='btn-pickup-agv color-btn-warehouse'  onClick={() => clickWarehouse("9")} style={{ top: '42%', left: '9%' }}>D9</button>
              <button className='btn-pickup-agv color-btn-warehouse'  onClick={() => clickWarehouse("10")} style={{ top: '42%', left: '18%' }}>D10</button>
              <button className='btn-pickup-agv color-btn-warehouse'  onClick={() => clickWarehouse("11")} style={{ top: '65%', left: '25%' }}>D11</button>
              <button className='btn-pickup-agv color-btn-warehouse'  onClick={() => clickWarehouse("12")} style={{ top: '52%', left: '25%' }}>D12</button>
              <button className='btn-pickup-agv color-btn-warehouse'  onClick={() => clickWarehouse("13")} style={{ top: '30%', left: '45%' }}>D13</button>
              <button className='btn-pickup-agv color-btn-warehouse'  onClick={() => clickWarehouse("14")} style={{ top: '38%', left: '45%' }}>D14</button>
              <button className='btn-pickup-agv color-btn-warehouse'  onClick={() => clickWarehouse("15")} style={{ top: '68%', left: '53%' }}>D15</button>
              <button className='btn-pickup-agv color-btn-warehouse'  onClick={() => clickWarehouse("16")} style={{ top: '70%', left: '80%' }}>D16</button>
              <button className='btn-pickup-agv color-btn-warehouse'  onClick={() => clickWarehouse("17")} style={{ top: '84%', left: '40%' }}>D17</button>
              <button className='btn-pickup-agv color-btn-warehouse'  onClick={() => clickWarehouse("18")} style={{ top: '50%', left: '38%' }}>D18</button>
              <button className='btn-pickup-agv color-btn-warehouse'  onClick={() => clickWarehouse("19")} style={{ top: '60%', left: '38%' }}>D19</button>
              <button className='btn-pickup-agv color-btn-warehouse'  onClick={() => clickWarehouse("20")} style={{ top: '65%', left: '46%' }}>D20</button>
              <button className='btn-pickup-agv color-btn-warehouse'  onClick={() => clickWarehouse("21")} style={{ top: '65%', left: '62%' }}>D21</button>
              <button className='btn-pickup-agv color-btn-warehouse'  onClick={() => clickWarehouse("22")} style={{ top: '65%', left: '70%' }}>D22</button>
            </>) : null}


          </div>
          <div className='agv-mission-box'>
            <div className={`agv-mission-card bt${missionModel.colorBoxName}`}>
              <div className='agv-top-name-box'>
                <div className='agv-name-state'>
                  <div className='box-name-battery'>
                    <div className={`agv-name-text ${missionModel.colorBoxName}`}>{missionModel.agvName}</div>
                    <div className='agv-battery'><CiBatteryFull size={36} /><span>100%</span></div>
                  </div>
                  <div className={`auto-manual ${missionModel.auto}`}>{missionModel.auto}</div>
                  <div className='agv-state'>{missionModel.state}</div>
                </div>
                <img className='image-agv-model' src={AgvImg2}></img>
              </div>
              <div className='box-selected-warehouse' style={{ height: missionModel.status === 2 ? "100px" : "0px" }}>
                <div className='button-center' ><FaArrowDown size={24} /></div>
                {missionModel.status != 2 && <div className='model-mission-line'></div>}
                {selectPickup}
                {selectWarehouse.map((wh) => <div className='data-warehouse-box' style={{ top: '24px' }}>
                  <div className='circle-pickup-outline green-circle-bg'>
                    <div className='circle-pickup-inner'></div>
                  </div>
                  <div className='warehouse-from-to-box'>
                    <p style={{ color: '#838383' }}>to</p>
                    <h5>{wh}</h5>
                  </div>
                </div>)}

              </div>
              <button className='send-command' onClick={()=>setMissionModel((prev)=>({...prev,status:3}))}>สั่งงาน</button>
            </div>
            <button className='close-model' onClick={() => { setShowModel("hidden-model") }}>ย้อนกลับ</button>
          </div>
        </div>
      </div>
    </section >
  );
}