import { axiosGet } from "../api/axiosFetch";
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from "react-router-dom";
import { FcChargeBattery } from "react-icons/fc";
import BatteryAreaChart from "./chart/BatteryAreaChart";
import { IoMdDownload } from "react-icons/io";
import { RiBatteryChargeLine } from "react-icons/ri";
import BatteryDonutChart2 from "./chart/batteryDonus2.tsx";
import BatteryAreaChart2 from "./chart/BatteryAreaChart2.tsx";
import NetworkError from './networkError';


import './css/battery.css';

interface IBattery {
  [key: string]: number[][]
}
export interface IDataSeries {
  series: { name: string; data: { x: number, y: number }[] }[]
}

const colorLine = ['#2E93fA', '#66DA26', '#546E7A', '#E91E63', '#FF9800']
const Battery = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loadSuccess, setLoadSuccess] = useState(false);
  const start_date = searchParams.get("start_date") || new Date().toISOString().substring(0, 10)
  const end_date = searchParams.get("end_date") || new Date().toISOString().substring(0, 10)
  const [battery, setBattery] = useState<IDataSeries>({ series: [] });
  const [checkNetwork, setCheckNetwork] = useState(true);


  const reloadDataByDate = async (data: { d?: string, de?: string }) => {
    try {
      var params = "";
      if (data.d) {
        if (new Date(data.d) > new Date(end_date)) {
          return;
        }
        params = `?vehicle_name=ALL&start_date=${data.d}&end_date=${end_date}`
      }
      else if (data.de) {
        if (new Date(data.de) < new Date(start_date)) {
          return;
        }
        params = `?vehicle_name=ALL&start_date=${start_date}&end_date=${data.de}`

      }
      navigate(params, { replace: true });
      window.location.reload(); // Force reload if needed
    } catch (e: any) {
      console.error(e);
    }
  };
  useEffect(() => {

    const getBattery = async () => {
      try {
        const res: IBattery = await axiosGet(
          // `/mission/missions?vehicle_name=ALL&status=ALL&start_date=${getDate}&end_date=${getDate}&page=1&page_size=10`
          `/vehicle/battery_level?vehicle_name=ALL&start_date=${start_date}&end_date=${end_date}`
        );
        const _series: { name: string; data: { x: number, y: number }[] }[] = [];
        for (var agv in res) {
          const dataBattery: { x: number, y: number }[] = [];
          for (var i = 0; i < res[agv].length; i += 3) {
            dataBattery.push({ x: res[agv][i][2] * 1000, y: res[agv][i][1] });
          }
          _series.push({ name: agv, data: dataBattery });
        }
        setBattery({ series: _series });


      } catch (e: any) {
        console.error(e);
      } finally {
        if (!loadSuccess) {
          setLoadSuccess(true);
        }
      }
    };
    const checkNetwork = async () => {
      try {
          const response = await fetch(import.meta.env.VITE_REACT_APP_API_URL, { method: "GET" });
          if(response.ok) {
            getBattery(); 
          }
      } catch (e: any) {
          console.error(e);
          setCheckNetwork(false);
      }finally {
          if (!loadSuccess) {
              setLoadSuccess(true);
          }
      }
  };
      checkNetwork();
  }, []);
  return <div className="statistics-box">
    {!loadSuccess && <div className='loading-background'>
      <div id="loading"></div>
    </div>}
    <div className='d-flex align-items-center justify-content-between mb-3'>
      <div>
        <h1>Battery</h1>
        <p> <FcChargeBattery size={32} style={{ transform: ' rotate(45deg)' }} />
          <span className='ms-3'>Battery cost of each vehicle</span></p>
      </div>

      {checkNetwork&&<div className='input-date-box ms-5'>
        <div className="form-group">
          <label >From</label>
          <input type="text" value={start_date} readOnly></input>
          <input
            type="date"
            onChange={(e) => {
              const date = e.target.value;
              if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
                reloadDataByDate({ d: date });
              }
            }} />
        </div>

        <div className="form-group">
          <label >To</label>
          <input type="text" value={end_date} readOnly></input>
          <input type="date"
            onChange={(e) => {
              const date = e.target.value;
              if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
                reloadDataByDate({ de: date });
              }
            }} />
        </div>
        <button className="export-btn2" onClick={() => { }}><IoMdDownload /> <span>export</span> </button>
      </div>}
    </div>
    {!checkNetwork?<NetworkError/>:<>
    <div className='chart-all-agv'>
      <h5>All AGV</h5>
      <p className='p-subtitle'>แสดงข้อมูลแบตเตอรี ในช่วงเวลาที่เลือก</p>
      <div className='chart'>
        <BatteryAreaChart data={battery} />
      </div>

    </div>

    {battery.series.map((agv,i)=><div className="agv-one-box" key={agv.name}>
      <div className="battery-current">
       <h5><RiBatteryChargeLine size={32} color='red' /><span className="ms-2">{agv.name}</span></h5> 
        <p className="p-subtitle">ระดับแบตเตอรี</p>
        <div className="d-flex w-100 h-100 justify-content-center align-items-center">
          <BatteryDonutChart2 level={agv.data[agv.data.length-1].y}></BatteryDonutChart2>
        </div>
      </div>
      <div className='agv-one-chart'>
        <h5>{agv.name}</h5>
        <p className='p-subtitle'>แสดงข้อมูลแบตเตอรี</p>
        <div className='chart'>
          <BatteryAreaChart2 data={agv} color={colorLine[i]}/>
        </div>
      </div>

    </div>)}
    </>}
    
  </div>;
}
export default Battery;