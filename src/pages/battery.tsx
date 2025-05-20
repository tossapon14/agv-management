import { axiosGet } from "../api/axiosFetch";
import { useCallback, useEffect, useRef, useState } from 'react';
import { FcChargeBattery } from "react-icons/fc";
import BatteryAreaChart from "./chart/BatteryAreaChart";
import { IoMdDownload } from "react-icons/io";
import { RiBatteryChargeLine } from "react-icons/ri";
import BatteryDonutChart2 from "./chart/batteryDonus2.tsx";
import BatteryAreaChart2 from "./chart/BatteryAreaChart2.tsx";
import NetworkError from './networkError';
import DatePicker from "react-datepicker";
import { useTranslation } from 'react-i18next';
import './css/battery.css';

interface IBattery {
  [key: string]: number[][]
}
export interface IDataSeries {
  series: { name: string; data: { x: number, y: number }[] }[]
} const getBattery = async (url: string): Promise<IBattery> => {
  const res: IBattery = await axiosGet(url);
  return res;
};
const downloadCSV = async (start_date: string, end_date: string) => {
  const fetchData: string = await axiosGet(
    `/vehicle/export_battery_report?vehicle_name=ALL&start_date=${start_date}&end_date=${end_date}`);
  const blob = new Blob([fetchData], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `battery-${start_date} ${end_date}.csv`;
  link.click();

  URL.revokeObjectURL(url);
};

const colorLine = ['#2E93fA', '#66DA26', '#546E7A', '#E91E63', '#FF9800']
const Battery = () => {
  const [loadSuccess, setLoadSuccess] = useState(false);
  const [vehicle, setVehicle] = useState<string>("ALL"); // Default to "desc"
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().substring(0, 10))
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().substring(0, 10))
  const [battery, setBattery] = useState<IDataSeries>({ series: [] });
  const [checkNetwork, setCheckNetwork] = useState(true);
  const saveUrl = useRef<string>("");
  const [btnAGV, setbtnAGV] = useState<string[]>([]);
  const btnAGVSet = useRef(false);
  const { t } = useTranslation("mission");


  const reloadDataByDate = useCallback(async (data: { v?: string, d?: Date, de?: Date, }) => {
    var url: string | null = null;
    console.log(data);
    if (data.v) {
      url = `/vehicle/battery_level?vehicle_name=${data.v}&start_date=${startDate}&end_date=${endDate}`;
      saveUrl.current = url;
      setVehicle(data.v);
      batterySetPage(url);
    }
    else if (data.d) {
      if (data.d > new Date(endDate)) {
        return;
      }
      const bangkokOffsetMs = 7 * 60 * 60 * 1000;
      const localTime = data.d!.getTime() + bangkokOffsetMs;
      const _date: string = new Date(localTime).toISOString().substring(0, 10);
      url = `/vehicle/battery_level?vehicle_name=${vehicle}&start_date=${_date}&end_date=${endDate}`;
      saveUrl.current = url;
      setStartDate(_date);
      batterySetPage(url);
    }
    else if (data.de) {
      if (data.de < new Date(startDate)) {
        return;
      }
      const bangkokOffsetMs = 7 * 60 * 60 * 1000;
      const localTime = data.de!.getTime() + bangkokOffsetMs;
      const _date: string = new Date(localTime).toISOString().substring(0, 10);
      url = `/vehicle/battery_level?vehicle_name=${vehicle}&start_date=${startDate}&end_date=${_date}`;
      saveUrl.current = url;
      setEndDate(_date);
      batterySetPage(url);

    }
  }, [vehicle, startDate, endDate]);

  const batterySetPage = useCallback(async (url: string) => {
    try {
       const res = await getBattery(url);
      const _series: { name: string; data: { x: number, y: number }[] }[] = [];
      const _btnAGV = ['ALL'];
      for (var agv in res) {
        const dataBattery: { x: number, y: number }[] = [];
        for (var i = 0; i < res[agv].length; i += 3) {
          dataBattery.push({ x: res[agv][i][2] * 1000, y: res[agv][i][1] });
        }
        _series.push({ name: agv, data: dataBattery });
        _btnAGV.push(agv);
      }
      if (!btnAGVSet.current) {
        setbtnAGV(_btnAGV);  // for button AGV
        btnAGVSet.current = true;
      }
      setBattery({ series: _series });
    } catch (error: any) {
      console.error(error);
    }
  }, []);
  useEffect(() => {

    var timer: NodeJS.Timeout | null = null;

    const checkNetwork = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_REACT_APP_API_URL, { method: "GET" });
        if (response.ok) {
          const _date = new Date().toISOString().substring(0, 10)
          saveUrl.current = `/vehicle/battery_level?vehicle_name=ALL&start_date=${_date}&end_date=${_date}`;
          batterySetPage(saveUrl.current);
          timer = setInterval(() => {
            batterySetPage(saveUrl.current);
          }, 10000);
        }
      } catch (e: any) {
        console.error(e);
        setCheckNetwork(false);
      } finally {
        setLoadSuccess(true);
      }
    };
    checkNetwork();
    return () => {
      if (timer != null) {
        clearInterval(timer! as NodeJS.Timeout);
      }
    }
  }, []);
  return <div className="statistics-box">
    {!loadSuccess && <div className='loading-background'>
      <div id="loading"></div>
    </div>}
    <div className='d-flex align-items-center justify-content-between mb-3'>
      <div>
        <h1>{t("bt_title")}</h1>
        <p> <FcChargeBattery size={32} style={{ transform: ' rotate(45deg)' }} />
          <span className='ms-3'>{t("bt_subtitle")}</span>
        </p>
      </div>

      {checkNetwork && <div className='input-date-box ms-5'>
        <div className="form-group">
          <label>{t("from")}</label>
          <div className='box-of-text-date'>
            <div className='ps-2'>{startDate}</div>
            <DatePicker selected={new Date(startDate)} onChange={(e) => reloadDataByDate({ d: e ?? undefined })} />
          </div>
        </div>

        <div className="form-group">
          <label >{t("to")}</label>
          <div className='box-of-text-date'>
            <div className='ps-2'>{endDate}</div>
            <DatePicker selected={new Date(endDate)} onChange={(e) => reloadDataByDate({ de: e ?? undefined })} />
          </div>
        </div>
        <button className="export-btn2" onClick={() => downloadCSV(startDate, endDate)}><IoMdDownload /> <span>{t("downloadBtn")}</span> </button>
      </div>}
    </div>
    {!checkNetwork ? <NetworkError /> : <>
      <div className="selected-agv-box mt-2">
        {btnAGV.map((name) => <button key={name} onClick={() => reloadDataByDate({ v: name })} className={`${vehicle === name ? "active" : ""}`}>{name}</button>)}
      </div>
      <div className='chart-all-agv'>

        <h5>{t("bt_all_agv")}</h5>
        <p className='p-subtitle'>{t("bt_sub1")}</p>
        <div className='chart'>
          <BatteryAreaChart data={battery} />
        </div>

      </div>

      {battery.series.map((agv, i) => <div className="agv-one-box" key={agv.name}>
        <div className="battery-current">
          <h5><RiBatteryChargeLine size={32} color='red' /><span className="ms-2">{agv.name}</span></h5>
          <p className='p-subtitle'>{t("bt_sub2")}</p>
          <div className="d-flex w-100 h-100 justify-content-center align-items-center">
            <BatteryDonutChart2 level={agv.data[agv.data.length - 1].y}></BatteryDonutChart2>
          </div>
        </div>
        <div className='agv-one-chart'>
          <h5>{agv.name}</h5>
          <p className='p-subtitle'>{t("bt_sub3")}</p>
          <div className='chart'>
            <BatteryAreaChart2 data={agv} color={colorLine[i]} />
          </div>
        </div>

      </div>)}
    </>}

  </div>;
}
export default Battery;