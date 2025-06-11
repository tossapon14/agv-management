import { useCallback, useEffect, useRef, useState } from 'react';
import './css/statistics.css';
import { FcComboChart } from "react-icons/fc";
import { IoMdDownload } from "react-icons/io";
import { AiFillSetting } from "react-icons/ai";
import { IoCheckmarkCircle } from "react-icons/io5";
import { MdCancel } from "react-icons/md";
import { axiosGet } from "../api/axiosFetch";
import BGBarChart from './chart/barChart2';
import DatePicker from "react-datepicker";
import NetworkError from './networkError';
import _default from 'react-bootstrap/esm/Alert';
import { useTranslation } from 'react-i18next';
import NotAuthenticated from './not_authenticated';
import StatusOnline from './statusOnline';



interface IStatistics {
  [key: string]: {
    [key: string]: number
    total_mission: number
    total_mission_complete: number
    total_mission_cancel: number
    total_mission_other: number
  }
}
export type IStatisticsData = {
  series?: ISeries
  barName?: string[]
}
type ISeries = { name: string, data: number[] }[]

const getData = async (url: string): Promise<IStatistics> => {

  const res: IStatistics = await axiosGet(url);
  return res;
};
const downloadCSV = async (start_date: string, end_date: string) => {
  const fetchData: string = await axiosGet(
    `/statistics/export_mission_report?start_date=${start_date}&end_date=${end_date}`);
  const blob = new Blob([fetchData], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `statistics-${start_date} ${end_date}.csv`;
  link.click();

  URL.revokeObjectURL(url);
};
export default function Statistics() {

  const [startDate, setStartDate] = useState<string>(new Date().toISOString().substring(0, 10))
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().substring(0, 10))
  const [loadSuccess, setLoadSuccess] = useState(false);
  const [dataDrop, setDataDrop] = useState<IStatisticsData>();
  const [dataPickup, setDataPickup] = useState<IStatisticsData>();
  const [dataMission, setDataMission] = useState<IStatisticsData>();
  const [totalMission, setTotalMission] = useState<{ mission: number, complete: number, cancel: number, other: number }>();
  const [checkNetwork, setCheckNetwork] = useState(true);
  const saveUrl = useRef<string>("");
  const saveDateStart = useRef<string>("");
  const saveDateEnd = useRef<string>("");
  const timerInterval = useRef<NodeJS.Timeout>(null);
  const [notauthenticated, setNotAuthenticated] = useState(false);
  const [onlineBar, setOnlineBar] = useState<null | boolean>(null);
  const [loadingWhenClick, setLoadingWhenClick] = useState<boolean>(false);
  const onlineRef = useRef<boolean | null>(null);

  const { t } = useTranslation("mission");

  const reloadDataByDate = useCallback(async (data: { d?: Date, de?: Date, }) => {
    if (data.d) {
      if (data.d > new Date(saveDateEnd.current)) {
        return;
      }
      const bangkokOffsetMs = 7 * 60 * 60 * 1000;
      const localTime = data.d!.getTime() + bangkokOffsetMs;
      const _date: string = new Date(localTime).toISOString().substring(0, 10);
      saveDateStart.current = _date;
      setStartDate(_date);
    }
    else if (data.de) {
      if (data.de < new Date(saveDateStart.current)) {
        return;
      }
      const bangkokOffsetMs = 7 * 60 * 60 * 1000;
      const localTime = data.de!.getTime() + bangkokOffsetMs;
      const _date: string = new Date(localTime).toISOString().substring(0, 10);
      saveDateEnd.current = _date;
      setEndDate(_date);

    }
    saveUrl.current = `/statistics/report?start_date=${saveDateStart.current}&end_date=${saveDateEnd.current}`;
    setLoadingWhenClick(true);

    statisticsSetPage(saveUrl.current);
  }, []);

  const statisticsSetPage = useCallback(async (url: string) => {
    try {

      const res = await getData(url);
      if (onlineRef.current == false) {
        setOnlineBar(true);
        onlineRef.current = true;
      }
      const _drop: IStatisticsData = {};
      const _pickup: IStatisticsData = {};
      const _miss: IStatisticsData = {};
      const _missSeries: ISeries = [];
      const _dataSeries: ISeries = [];
      const _dataSeriesPick: ISeries = [];
      const _barNameDrop: string[] = [];
      const _barNamePick: string[] = [];
      for (var k in res) {
        if (k.includes('AGV')) {   // AGV
          for (var d in res[k]) {
            if (d.includes('D')) {  // D1,D2,D3,D4
              if (_barNameDrop.findIndex((item) => item === d) === -1) {
                _barNameDrop.push(d);
              }
            } else if (d.includes('P')) {  // P1,P2,P3,P4
              if (_barNamePick.findIndex((item) => item === d) === -1) {
                _barNamePick.push(d);
              }
            }
          }

        }
      }
      for (var k in res) {
        if (k.includes('AGV')) {   // AGV
          const _data: number[] = [];
          for (var dropName of _barNameDrop) {
            if (res[k][dropName]) {
              _data.push(res[k][dropName]);
            } else {
              _data.push(0);
            }
          }
          _dataSeries.push({ name: k, data: _data });
          const _dataPick: number[] = [];
          for (var pickName of _barNamePick) {
            if (res[k][pickName]) {
              _dataPick.push(res[k][pickName]);
            } else {
              _dataPick.push(0);
            }
          }
          _dataSeriesPick.push({ name: k, data: _dataPick });
          _missSeries.push({ name: k, data: [res[k]["total_mission_complete"], res[k]["total_mission_cancel"], res[k]["total_mission_other"]] });
        }
      }
      _drop["series"] = _dataSeries;
      _drop["barName"] = _barNameDrop;
      _pickup["series"] = _dataSeriesPick;
      _pickup["barName"] = _barNamePick;
      _miss["series"] = _missSeries;
      _miss["barName"] = ["Complete", "Cancel", "Other"];
      setDataMission(_miss);
      setDataDrop(_drop);
      setDataPickup(_pickup);
      setTotalMission({
        mission: res["ALL"]?.total_mission ?? 0,
        complete: res["ALL"]?.total_mission_complete ?? 0,
        cancel: res["ALL"]?.total_mission_cancel ?? 0,
        other: res["ALL"]?.total_mission_other ?? 0
      });
    } catch (e: any) {
      console.error(e);
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
    } finally {
      setLoadingWhenClick(false);
    }
  }, []);


  useEffect(() => {

    const checkNetwork = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_REACT_APP_API_URL, { method: "GET" });
        if (response.ok) {
          const _date = new Date().toISOString().substring(0, 10)
          saveUrl.current = `/statistics/report?start_date=${_date}&end_date=${_date}`;
          saveDateStart.current = _date;
          saveDateEnd.current = _date;
          statisticsSetPage(saveUrl.current);
          timerInterval.current = setInterval(() => {
            statisticsSetPage(saveUrl.current);
          }, 20000);
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
      if (timerInterval.current != null) {
        clearInterval(timerInterval.current);
      }

    }
  }, []);
  return (
    <div className="statistics-box">
      {!loadSuccess && <div className='loading-background'>
        <div id="loading"></div>
      </div>}
      {loadingWhenClick && <div className="fixed-top w-100 h-100 d-flex justify-content-center align-items-center z-2" style={{ background: "rgb(5,5,5,0.2)" }}>
        <div id="loading"></div>
      </div>}
      {onlineBar !== null && <StatusOnline online={onlineBar}></StatusOnline>}
      {notauthenticated && <NotAuthenticated />}
      <div className='mb-2 mb-md-4 d-flex align-items-center justify-content-between flex-wrap'>
        <div>
          <h1>{t("st_title")}</h1>
          <p><FcComboChart size={32} />  <span className='ms-3 me-5'>{t("st_subtitle")}</span></p>
        </div>

        {checkNetwork && <div className='input-date-box m-0'>
          <div className="form-group">
            <label >{t("from")}</label>
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
          <button className="export-btn2" onClick={() => downloadCSV(startDate, endDate)}><IoMdDownload /> <span className='d-none d-sm-inline'>{t("downloadBtn")}</span> </button>
        </div>}
      </div>
      {!checkNetwork ? <NetworkError /> : <>
        <div className='stat-card-box flex-wrap flex-md-nowrap'>
          <div className='stat-card'>
            <div className='d-flex align-items-center'>
              <div className='box-icon' style={{ backgroundColor: "rgb(210, 246, 255)" }}>
                <AiFillSetting color="rgb(0, 153, 255)" size={24} />
              </div>
              <p>{t("st_all")}</p>
            </div>
            <div className='stat-number'>{totalMission?.mission ?? 0}</div>
          </div>
          <div className='stat-card'>
            <div className='d-flex align-items-center'>
              <div className='box-icon' style={{ backgroundColor: "#e4ffd8" }}>
                <IoCheckmarkCircle color="#4fff00" size={24} />
              </div>
              <p>{t("success")}</p>
            </div>
            <div className='stat-number'>{totalMission?.complete ?? 0}</div>
          </div>
          <div className='stat-card'>
            <div className='d-flex align-items-center'>
              <div className='box-icon' style={{ backgroundColor: "#ffdcdc" }}>
                <MdCancel color="#ff6d6d" size={24} />
              </div>
              <p>{t("cancel")}</p>
            </div>
            <div className='stat-number'>{totalMission?.cancel ?? 0}</div>
          </div>
          <div className='stat-card'>
            <div className='d-flex align-items-center'>
              <div className='box-icon' style={{ backgroundColor: "#e8e8e8" }}>
                <IoCheckmarkCircle color="#999999" size={24} />
              </div>
              <p>{t("other")}</p>
            </div>
            <div className='stat-number'>{totalMission?.other ?? 0}</div>
          </div>
        </div>

        <div className='stat-chart-pickup flex-lg-row flex-column-reverse'>
          <div className='col-12 col-lg-8'>
            <div className='pickup-chart'>
              <h5>{t("st_title_pick")}</h5>
              <p className='p-subtitle'>{t("st_subtitle_pick")}</p>
              <BGBarChart data={dataPickup} />
            </div>
          </div>
          <div className='col-12 col-lg-4'>
            <div className='chart-donus-box'>
              <h5>{t("st_all")}</h5>
              <p className='p-subtitle'>{t("st_subtitle_miss")}</p>
              <BGBarChart data={dataMission} />
            </div>
          </div>

        </div>
        <div className='stat-chart-drop'>
          <h5>{t("st_title_drop")}</h5>
          <p className='p-subtitle'>{t("st_subtitle_drop")}</p>
          <BGBarChart data={dataDrop} />
        </div>
      </>}
    </div>
  );
}