import { BiError } from "react-icons/bi";
import { IoMdSettings } from "react-icons/io";
import { useEffect, useState } from 'react';
import { axiosGet } from "../api/axiosFetch";
import { useSearchParams, useNavigate } from "react-router-dom";
import { BsConeStriped } from "react-icons/bs";
import { colorAgv } from '../utils/centerFunction';
import NetworkError from './networkError';
import DatePicker from "react-datepicker";

interface IAlarm {
    message: string
    payload: IAlarmPayload[]
    structure: IStructure
}

interface IAlarmPayload {
    code: string
    description: string
    id: number
    timestamp: string
    vehicle_name: string
}
interface IAlarmTable {
    id: number
    code: string
    date: string
    time: string
    vehicle_name: string
    th: string
    en: string
}

interface IStructure {
    page: number
    page_size: number
    total_items: number
    total_pages: number
}
const downloadCSV = async (vehicle: string, start_date: string, end_date: string) => {
    const fetchData: string = await axiosGet(
        `/alarm/export_alarm_report?vehicle_name=${vehicle}&start_date=${start_date}&end_date=${end_date}`)
    const BOM = "\uFEFF"; // UTF-8 BOM for proper encoding
    const csvContent = BOM + fetchData; // Prepend BOM to data

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `alarm-vehicle-${vehicle} ${start_date} ${end_date}.csv`;
    link.click();

    URL.revokeObjectURL(url);
};

const getAlarm = async (url: string | null): Promise<IAlarm> => {
    if (!url) {
        const _date = new Date().toISOString().substring(0, 10)
        url = `/alarm/alarms?vehicle_name=ALL&start_date=${_date}&end_date=${_date}&page=1&page_size=10`
    }
    const res: IAlarm = await axiosGet(url);
    return res;
};


export default function Alarm() {


    const [alarmTable, setalarmTable] = useState<IAlarmTable[]>([]);
    const [pagination, setPagination] = useState<React.ReactElement | null>(null);
    const [btnAGV, setbtnAGV] = useState<string[]>([])


    const [vehicle, setVehicle] = useState<string>("ALL"); // Default to "desc"
    const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10))
    const [endDate, setEndDate] = useState(new Date().toISOString().substring(0, 10))
    const [pageSize, setPageSize] = useState('10');
    const [loadSuccess, setLoadSuccess] = useState(false);
    const [checkNetwork, setCheckNetwork] = useState(true);


    const reloadPage = async (data: { v?: string, s?: string, d?: Date, de?: Date, p?: number, ps?: string }) => {

        try {
            var url: string | null = null;
            if (data.v) {
                url = `/alarm/alarms?vehicle_name=${data.v}&start_date=${startDate}&end_date=${endDate}&page=1&page_size=${pageSize}`
                setVehicle(data.v);
            }
            else if (data.d) {
                if (data.d > new Date(endDate)) {
                    return;
                }
                const bangkokOffsetMs = 7 * 60 * 60 * 1000;
                const localTime = data.d!.getTime() + bangkokOffsetMs;
                const _date: string = new Date(localTime).toISOString().substring(0, 10);
                url = `/alarm/alarms?vehicle_name=${vehicle}&start_date=${_date}&end_date=${endDate}&page=1&page_size=${pageSize}`
                setStartDate(_date);

            }
            else if (data.de) {
                if (new Date(data.de) < new Date(startDate)) {
                    return;
                }
                const bangkokOffsetMs = 7 * 60 * 60 * 1000;
                const localTime = data.de!.getTime() + bangkokOffsetMs;
                const _date: string = new Date(localTime).toISOString().substring(0, 10);
                url = `/alarm/alarms?vehicle_name=${vehicle}&start_date=${startDate}&end_date=${_date}&page=1&page_size=${pageSize}`
                setEndDate(_date);

            }
            else if (data.p) {
                url = `/alarm/alarms?vehicle_name=${vehicle}&start_date=2025-03-01&end_date=${endDate}&page=${data.p}&page_size=${pageSize}`
            }
            else if (data.ps) {
                url = `/alarm/alarms?vehicle_name=${vehicle}&start_date=${startDate}&end_date=${endDate}&page=1&page_size=${data.ps}`
                setPageSize(data.ps);
            }
            const res = await getAlarm(url);
            const alert: IAlarmTable[] = [];
            const _btnAGV: string[] = [];
            for (let i = 0; i < res.payload.length; i++) {
                const descript = res.payload[i].description.split("|");
                const _date = res.payload[i].timestamp?.substring(0, 10);
                const _time = res.payload[i].timestamp?.substring(11, 19);
                alert.push({ id: res.payload[i].id, code: res.payload[i].code, vehicle_name: res.payload[i].vehicle_name, date: _date, time: _time, th: descript[1], en: descript[0] });

                if (!_btnAGV.includes(res.payload[i].vehicle_name)) {
                    _btnAGV.push(res.payload[i].vehicle_name);
                }
            }
            setPagination(_pagination(res.structure?.total_pages, data.p));
            setalarmTable(alert);
            setbtnAGV(_btnAGV);

        } catch (e) {
            console.log(e);
        } finally {
            if (!loadSuccess) {
                setLoadSuccess(true);
            }
        }

    }


    const _pagination = (ttp: number, p: number | undefined): React.ReactElement | null => {
        const page = p ?? 1;
        if (ttp <= 5) {
            return (<div className='pagination'>

                {[...Array(ttp)].map((_, index) => {
                    const pageNumber = index + 1;
                    return (
                        <a
                            key={pageNumber}
                            onClick={() => reloadPage({ p: pageNumber })}
                            className={pageNumber === page ? "active" : ""}
                        >
                            {pageNumber}
                        </a>
                    );
                })}

            </div>);
        }
        else if (ttp > 5) {
            let intial: number;
            if (ttp - page < 5) {// last page
                intial = ttp - 4
            } else if (page > 2) {
                intial = page - 2
            } else if (page > 1) {
                intial = page - 1
            } else {
                intial = page
            }
            return (<div className="pagination">

                <a
                    onClick={() => reloadPage({ p: page > 1 ? page - 1 : 1 })}
                    className={page === 1 ? "disabled" : ""}
                >
                    &laquo;
                </a>

                {/* Page Numbers */}
                {

                    [...Array(5)].map((_, index) => {
                        const pageNumber = intial + index;
                        return (
                            <a
                                key={pageNumber}
                                onClick={() => reloadPage({ p: pageNumber })}
                                className={pageNumber === page ? "active" : ""}
                            >
                                {pageNumber}
                            </a>
                        );
                    })}

                {/* Next Button */}
                <a
                    onClick={() => reloadPage({ p: page + 1 })}
                    className={page === ttp ? "disabled" : ""}
                >
                    &raquo;
                </a>
            </div>);
        }
        else return null
    };


    useEffect(() => {

        const checkNetwork = async () => {
            try {
                const response = await fetch(import.meta.env.VITE_REACT_APP_API_URL, { method: "GET" });
                if (response.ok) {
                    reloadPage({});
                }
            } catch (e: any) {
                console.error(e);
                setCheckNetwork(false);
            } finally {
                setLoadSuccess(true);
            }
        };
        checkNetwork();

    }, []);
    return <>
        {!loadSuccess && <div className='loading-background'>
            <div id="loading"></div>
        </div>}
        <section className='mission-box-page'>
            <div className='mission-title-box mb-3'>
                <h1>SHOW ERROR</h1>
                <div className='box-title'>
                    <p className="title1">
                        <BsConeStriped size={36} color={"#ff6900"} />
                        <span>error of vehicle on running</span></p>
                </div>

            </div>
            {!checkNetwork ? <NetworkError /> : <div className='container-card'>
                <div className='mission-header'>
                    <div className='selected-mission-btn'>
                        <button onClick={() => reloadPage({ v: "ALL" })} className={`${vehicle === "ALL" ? "active" : ""}`}>All</button>
                        {btnAGV.map((name) => <button onClick={() => reloadPage({ v: name })} className={`${vehicle === name ? "active" : ""}`}>{name}</button>)}

                    </div>
                    <div className='input-date-box'>
                        <div className="form-group">
                            <label >From</label>
                            <div className='box-of-text-date'>
                                <div className='ps-2'>{startDate}</div>
                                <DatePicker selected={new Date(startDate)} onChange={(e) => reloadPage({ d: e ?? undefined })} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label >To</label>
                            <div className='box-of-text-date'>
                                <div className='ps-2'>{endDate}</div>
                                <DatePicker selected={new Date(endDate)} onChange={(e) => reloadPage({ de: e ?? undefined })} />
                            </div>
                        </div>
                        <button className="export-btn" onClick={() => downloadCSV(vehicle, startDate, endDate)}>export</button>
                    </div>
                </div>
                <div className='table-container overflow-auto'>
                    <table className="table table-hover">
                        <thead className='text-center'>
                            <tr>
                                <th scope="col" style={{ width: "100px" }}>#</th>
                                <th scope="col" style={{ width: "150px" }}>รถ</th>
                                <th scope="col"><div className="head-table-flex">
                                    <div className='mission-circle-icon' style={{ background: "#ffe6e6" }}>
                                        <IoMdSettings color='red' />
                                    </div>
                                    code</div>
                                </th>
                                <th scope="col"><div className="head-table-flex">
                                    <div className='mission-circle-icon'>
                                        <BiError color='#E9762B' size={16} />
                                    </div>
                                    status</div>
                                </th>
                                <th scope="col" style={{ width: "150px" }}>วัน</th>
                                <th scope="col" style={{ width: "150px" }}>เวลา</th>

                            </tr>
                        </thead>
                        <tbody className='text-center'>
                            {alarmTable.map((data, i) => <tr key={i}>
                                <td scope="row">#{i + 1}</td>
                                <td><div className='td-vehicle-name'><div className='circle-vehicle-icon' style={{ background: `${colorAgv[data.vehicle_name]}` }}></div><span>{data.vehicle_name}</span></div></td>
                                <td><div className='box-status' style={{ background: "#f5f5f5", color: "#444444", }}>{data.code}</div></td>
                                <td>{data["th"]}</td>
                                <td>{data.date}</td>
                                <td>{data.time}</td>
                            </tr>)}

                        </tbody>
                    </table>

                </div>
                <div className='page-number-d-flex'>

                    <div className="tooltip-container">
                        <button type="button" onClick={() => { }}>{pageSize}</button>
                        <div className="box-tooltip">
                            <button className='btn-page-size' onClick={() => reloadPage({ ps: '10' })}>10</button>
                            <button className='btn-page-size' onClick={() => reloadPage({ ps: '50' })}>50</button>
                            <button className='btn-page-size' onClick={() => reloadPage({ ps: '100' })}>100</button>
                        </div>
                    </div>
                    <span className='ms-1 me-3'>emergency/page</span>
                    {pagination}
                </div>
            </div>}
        </section>

    </>;
}