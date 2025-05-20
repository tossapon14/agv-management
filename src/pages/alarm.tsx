import { BiError } from "react-icons/bi";
import { IoMdSettings } from "react-icons/io";
import { useCallback, useEffect, useState, useRef } from 'react';
import { axiosGet } from "../api/axiosFetch";
import { BsConeStriped } from "react-icons/bs";
import { colorAgv } from '../utils/centerFunction';
import NetworkError from './networkError';
import DatePicker from "react-datepicker";
import { useTranslation } from 'react-i18next';

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

const getAPI = async (url: string): Promise<IAlarm> => {
    const res: IAlarm = await axiosGet(url);
    return res;
};


export default function Alarm() {


    const [alarmTable, setalarmTable] = useState<IAlarmTable[]>([]);
    const [pagination, setPagination] = useState<React.ReactElement | null>(null);
    const [btnAGV, setbtnAGV] = useState<string[]>([]);
    const btnAGVSet = useRef(false);


    const [vehicle, setVehicle] = useState<string>("ALL"); // Default to "desc"
    const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10))
    const [endDate, setEndDate] = useState(new Date().toISOString().substring(0, 10))
    const [pageSize, setPageSize] = useState('10');
    const [loadSuccess, setLoadSuccess] = useState(false);
    const [checkNetwork, setCheckNetwork] = useState(true);
    const saveUrl = useRef<string>("");
    const savePage = useRef<number>(1);

    const { t } = useTranslation("mission");


    const reloadPage = useCallback(async (data: { v?: string, s?: string, d?: Date, de?: Date, p?: number, ps?: string }) => {
        var url: string | null = null;
        if (data.v) {
             url = `/alarm/alarms?vehicle_name=${data.v}&start_date=${startDate}&end_date=${endDate}&page=1&page_size=${pageSize}`;
             savePage.current = 1;
             setVehicle(data.v);
        }
        else if (data.d) {
            if (data.d > new Date(endDate)) {
                return;
            }
            const bangkokOffsetMs = 7 * 60 * 60 * 1000;
            const localTime = data.d!.getTime() + bangkokOffsetMs;
            const _date: string = new Date(localTime).toISOString().substring(0, 10);
            url = `/alarm/alarms?vehicle_name=${vehicle}&start_date=${_date}&end_date=${endDate}&page=1&page_size=${pageSize}`;
            savePage.current = 1;
            setStartDate(_date);

        }
        else if (data.de) {
            if (new Date(data.de) < new Date(startDate)) {
                return;
            }
            const bangkokOffsetMs = 7 * 60 * 60 * 1000;
            const localTime = data.de!.getTime() + bangkokOffsetMs;
            const _date: string = new Date(localTime).toISOString().substring(0, 10);
            url = `/alarm/alarms?vehicle_name=${vehicle}&start_date=${startDate}&end_date=${_date}&page=1&page_size=${pageSize}`;
            savePage.current = 1;
            setEndDate(_date);

        }
        else if (data.p) {
            url = `/alarm/alarms?vehicle_name=${vehicle}&start_date=2025-03-01&end_date=${endDate}&page=${data.p}&page_size=${pageSize}`;
            savePage.current = data.p;
        }
        else if (data.ps) {
            url = `/alarm/alarms?vehicle_name=${vehicle}&start_date=${startDate}&end_date=${endDate}&page=1&page_size=${data.ps}`;
            savePage.current = 1;
            setPageSize(data.ps);
        }
        if (url != null) {
            saveUrl.current = url;
            alarmSetPage(url);
        }
    }, [vehicle, startDate, endDate, pageSize]);



    const alarmSetPage = useCallback(async (url: string) => {
         try {
            const res = await getAPI(url);
            const alert: IAlarmTable[] = [];
            const _btnAGV: string[] = ["ALL"];
            for (let i = 0; i < res.payload?.length; i++) {
                const descript = res.payload[i].description.split("|");
                const _date = res.payload[i].timestamp?.substring(0, 10);
                const _time = res.payload[i].timestamp?.substring(11, 19);
                alert.push({ id: res.payload[i].id, code: res.payload[i].code, vehicle_name: res.payload[i].vehicle_name, date: _date, time: _time, th: descript[1], en: descript[0] });

                if (!_btnAGV.includes(res.payload[i].vehicle_name)) {
                    _btnAGV.push(res.payload[i].vehicle_name);
                }
            }
            setPagination(_pagination(res.structure?.total_pages, savePage.current));
            setalarmTable(alert);
            if (!btnAGVSet.current) {
                setbtnAGV(_btnAGV);  // for button AGV
                btnAGVSet.current = true;
            }

        } catch (e) {
            console.log(e);
        }
    }, []);


    const _pagination = useCallback((ttp: number, page: number): React.ReactElement | null => {
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
    }, []);


    useEffect(() => {
        var timer: NodeJS.Timeout | null = null;
        const checkNetwork = async () => {
            try {
                const response = await fetch(import.meta.env.VITE_REACT_APP_API_URL, { method: "GET" });
                if (response.ok) {
                    const _date = new Date().toISOString().substring(0, 10)
                    saveUrl.current = `/alarm/alarms?vehicle_name=ALL&start_date=${_date}&end_date=${_date}&page=1&page_size=10`
                    alarmSetPage(saveUrl.current);
                    timer = setInterval(() => alarmSetPage(saveUrl.current), 10000);
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
    return <>
        {!loadSuccess && <div className='loading-background'>
            <div id="loading"></div>
        </div>}
        <section className='mission-box-page'>
            <div className='mission-title-box mb-3'>
                <h1>{t("al_title")}</h1>
                <div className='box-title'>
                    <p className="title1">
                        <BsConeStriped size={36} color={"#ff6900"} />
                        <span className="ms-3">{t("al_subtitle")}</span></p>
                </div>

            </div>
            {!checkNetwork ? <NetworkError /> : <div className='container-card'>
                <div className='mission-header'>
                    <div className='selected-mission-btn'>
                        {btnAGV.map((name) => <button onClick={() => reloadPage({ v: name })} className={`${vehicle === name ? "active" : ""}`}>{name}</button>)}
                    </div>
                    <div className='input-date-box'>
                        <div className="form-group">
                            <label >{t("from")}</label>
                            <div className='box-of-text-date'>
                                <div className='ps-2'>{startDate}</div>
                                <DatePicker selected={new Date(startDate)} onChange={(e) => reloadPage({ d: e ?? undefined })} />
                            </div>
                        </div>

                        <div className="form-group">
                            <label >{t("to")}</label>
                            <div className='box-of-text-date'>
                                <div className='ps-2'>{endDate}</div>
                                <DatePicker selected={new Date(endDate)} onChange={(e) => reloadPage({ de: e ?? undefined })} />
                            </div>
                        </div>
                        <button className="export-btn" onClick={() => downloadCSV(vehicle, startDate, endDate)}>{t("downloadBtn")}</button>
                    </div>
                </div>
                <div className='table-container overflow-auto'>
                    <table className="table table-hover">
                        <thead className='text-center'>
                            <tr>
                                <th scope="col" style={{ width: "100px" }}>#</th>
                                <th scope="col" style={{ width: "150px" }}>{t("tb_car")}</th>
                                <th scope="col"><div className="head-table-flex">
                                    <div className='mission-circle-icon' style={{ background: "#ffe6e6" }}>
                                        <IoMdSettings color='red' />
                                    </div>
                                    {t("al_code")}</div>
                                </th>
                                <th scope="col"><div className="head-table-flex">
                                    <div className='mission-circle-icon'>
                                        <BiError color='#E9762B' size={16} />
                                    </div>
                                    {t("al_status")}</div>
                                </th>
                                <th scope="col" style={{ width: "150px" }}>{t("tb_date")}</th>
                                <th scope="col" style={{ width: "150px" }}>{t("al_time")}</th>

                            </tr>
                        </thead>
                        <tbody className='text-center'>
                            {alarmTable.map((data, i) => <tr key={i}>
                                <td scope="row">#{data.id}</td>
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
                    <span className='ms-1 me-3'>{t("alarm")}</span>
                    {pagination}
                </div>
            </div>}
        </section>

    </>;
}