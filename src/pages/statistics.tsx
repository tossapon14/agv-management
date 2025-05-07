import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from "react-router-dom";
import './css/statistics.css';
import { FcComboChart } from "react-icons/fc";
import { IoMdDownload } from "react-icons/io";
import { AiFillSetting } from "react-icons/ai";
import { IoCheckmarkCircle } from "react-icons/io5";
import { MdCancel } from "react-icons/md";
import { axiosGet } from "../api/axiosFetch";
import BGBarChart from './chart/barChart2';
import DatePicker from "react-datepicker";



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

export default function Statistics() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const start_date = searchParams.get("start_date") || new Date().toISOString().substring(0, 10)
  const end_date = searchParams.get("end_date") || new Date().toISOString().substring(0, 10)
  const [loadSuccess, setLoadSuccess] = useState(false);
  const [dataDrop, setDataDrop] = useState<IStatisticsData>();
  const [dataPickup, setDataPickup] = useState<IStatisticsData>();
  const [dataMission, setDataMission] = useState<IStatisticsData>();
  const [totalMission, setTotalMission] = useState<{ mission: number, complete: number, cancel: number, other: number }>();


  const reloadDataByDate = async (data: { d?: Date, de?: Date, }) => {
    try {
      var params = "";
      if (data.d) {
        if (data.d > new Date(end_date)) {
          return;
        }
        const bangkokOffsetMs = 7 * 60 * 60 * 1000;
        const localTime = data.d!.getTime() + bangkokOffsetMs;
        const _date: string = new Date(localTime).toISOString().substring(0, 10);
        params = `?start_date=${_date}&end_date=${end_date}`
      }
      else if (data.de) {
        if (data.de < new Date(start_date)) {
          return;
        }
        const bangkokOffsetMs = 7 * 60 * 60 * 1000;
        const localTime = data.de!.getTime() + bangkokOffsetMs;
        const _date: string = new Date(localTime).toISOString().substring(0, 10);
        params = `?start_date=${start_date}&end_date=${_date}`

      }
      navigate(params, { replace: true });
      window.location.reload(); // Force reload if needed
    } catch (e: any) {
      console.error(e);
    }
  };
  useEffect(() => {

    const getData = async () => {
      try {
        const res: IStatistics = await axiosGet(
          // `/mission/missions?vehicle_name=ALL&status=ALL&start_date=${getDate}&end_date=${getDate}&page=1&page_size=10`
          `/statistics/report?start_date=${start_date}&end_date=${end_date}`
        );
        console.log(res);
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
      } finally {
        if (!loadSuccess) {
          setLoadSuccess(true);
        }
      }
    };
    getData();
  }, []);
  return (
    <div className="statistics-box">
      {!loadSuccess && <div className='loading-background'>
        <div id="loading"></div>
      </div>}
      <div className='d-flex align-items-center justify-content-between'>
        <div className='mb-4'>
          <h1>Statistics Page</h1>
          <p><FcComboChart size={32} />  <span className='ms-3'>This is the statistics page.</span></p>
        </div>

        <div className='input-date-box ms-5'>
          <div className="form-group">
            <label >From</label>
            <div className='box-of-text-date'>
              <div className='ps-2'>{start_date}</div>
              <DatePicker selected={new Date(start_date)} onChange={(e) => reloadDataByDate({ d: e ?? undefined })} />
            </div>
          </div>

          <div className="form-group">
            <label >To</label>
            <div className='box-of-text-date'>
              <div className='ps-2'>{end_date}</div>
              <DatePicker selected={new Date(end_date)} onChange={(e) => reloadDataByDate({ de: e ?? undefined })} />
            </div>
          </div>
          <button className="export-btn2" onClick={() => { }}><IoMdDownload /> <span>export</span> </button>
        </div>
      </div>
      <div className='stat-card-box'>
        <div className='stat-card' style={{ boxShadow: "rgba(179, 179, 179, 0.65) 0px 7px 16px 0px" }}>
          <div className='d-flex align-items-center'>
            <div className='box-icon' style={{ backgroundColor: "#cacaff" }}>
              <AiFillSetting color="#5600ff" size={24} />
            </div>
            <p>งานทั้งหมด</p>
          </div>
          <div className='stat-number'>{totalMission?.mission ?? 0}</div>
        </div>
        <div className='stat-card' style={{ boxShadow: "rgba(179, 179, 179, 0.65) 0px 7px 16px 0px" }}>
          <div className='d-flex align-items-center'>
            <div className='box-icon' style={{ backgroundColor: "#e4ffd8" }}>
              <IoCheckmarkCircle color="#4fff00" size={24} />
            </div>
            <p>สำเร็จ</p>
          </div>
          <div className='stat-number'>{totalMission?.complete ?? 0}</div>
        </div>
        <div className='stat-card' style={{ boxShadow: "rgba(179, 179, 179, 0.65) 0px 7px 16px 0px" }}>
          <div className='d-flex align-items-center'>
            <div className='box-icon' style={{ backgroundColor: "#ffdcdc" }}>
              <MdCancel color="#ff6d6d" size={24} />
            </div>
            <p>ยกเลิก</p>
          </div>
          <div className='stat-number'>{totalMission?.cancel ?? 0}</div>
        </div>
        <div className='stat-card' style={{ boxShadow: "rgba(179, 179, 179, 0.65) 0px 7px 16px 0px" }}>
          <div className='d-flex align-items-center'>
            <div className='box-icon' style={{ backgroundColor: "#e8e8e8" }}>
              <IoCheckmarkCircle color="#999999" size={24} />
            </div>
            <p>อื่นๆ</p>
          </div>
          <div className='stat-number'>{totalMission?.other ?? 0}</div>
        </div>
      </div>

      <div className='stat-chart-pickup'>
        <div className='col-8'>
          <div className='pickup-chart'>
            <h4>Pickup</h4>
            <p>แสดงข้อมูลการ pickup ของ AGV ในช่วงเวลาที่เลือก</p>
            <BGBarChart data={dataPickup} />
          </div>
        </div>
        <div className='col-4'>
          <div className='chart-donus-box'>
            <h4>Mission</h4>
            <p>แสดงข้อมูลผลลัพท์ของ การขนส่ง</p>
            <BGBarChart data={dataMission} />
          </div>
        </div>

      </div>
      <div className='stat-chart-drop'>
        <h4>Drop point</h4>
        <p>แสดงข้อมูลการ Drop ของ AGV ในช่วงเวลาที่เลือก</p>
        <BGBarChart data={dataDrop} />
      </div>

    </div>
  );
}