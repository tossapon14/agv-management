import { BiError } from "react-icons/bi";
import { IoMdSettings } from "react-icons/io";
import { useEffect, useState } from 'react';
import { axiosGet } from "../api/axiosFetch";
import { useSearchParams, useNavigate } from "react-router-dom";
import { BsConeStriped } from "react-icons/bs";
import { colorAgv} from '../utils/centerFunction';

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

export default function Alarm() {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [alarmTable, setalarmTable] = useState<IAlarmTable[]>([]);
    const [pagination, setPagination] = useState<React.ReactElement | null>(null);
    const [btnAGV, setbtnAGV] = useState<string[]>([])


    const page: number = Number(searchParams.get("page") || 1);
    const vehicle = searchParams.get("vehicle_name") || "ALL"; // Default to "desc"
    const start_date = searchParams.get("start_date") || new Date().toISOString().substring(0, 10)
    const end_date = searchParams.get("end_date") || new Date().toISOString().substring(0, 10)
    const [loadSuccess,setLoadSuccess] = useState(false);


    const reloadPage = function (data: { v?: string, s?: string, d?: string, de?: string, p?: number }) {

        try {
            var params = "/";
            if (data.p) {
                params = `/alarms?vehicle_name=${vehicle}&start_date=2025-03-01&end_date=${end_date}&page=${data.p}&page_size=10`
            }
            else if (data.d) {
                if (new Date(data.d) > new Date(end_date)) {
                    return;
                }
                params = `/alarms?vehicle_name=${vehicle}&start_date=${data.d}&end_date=${end_date}&page=1&page_size=10`
            }
            else if (data.de) {
                if (new Date(data.de) < new Date(start_date)) {
                    return;
                }
                params = `/alarms?vehicle_name=${vehicle}&start_date=${start_date}&end_date=${data.de}&page=1&page_size=10`
            }
            else if (data.v) {
                params = `/alarms?vehicle_name=${data.v}&start_date=${start_date}&end_date=${end_date}&page=1&page_size=10`

            }
            navigate(params, { replace: true });
            window.location.reload(); // Force reload if needed
        } catch (e) {
            console.log(e);
        }

    }

    const downloadCSV = async () => {
        const fetchData: string = await axiosGet(
            `/alarm/export_alarm_report?vehicle_name=${vehicle}&start_date=${start_date}&end_date=${end_date}`)
        const BOM = "\uFEFF"; // UTF-8 BOM for proper encoding
        const csvContent = BOM + fetchData; // Prepend BOM to data

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `alarm-vehicle ${vehicle} date ${start_date} ${end_date}.csv`;
        link.click();

        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        const _pagination = (ttp: number): React.ReactElement | null => {
            if (ttp == 1) {
                return null;
            } else if (ttp <= 5) {
                return <div className='pagination'>
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

                </div>
            }
            else if (ttp > 5) {
                let intial: number;
                if (ttp - page < 5) {// last page
                    intial = ttp - 4
                } else if (page > 2) {
                    intial = page - 2
                }else if (page > 1) {
                    intial = page - 1
                }else{
                    intial = page
                }
                return <div className="pagination">
                    {/* Previous Button */}
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
                </div>
            }
            else return null
        };
        const getAlarm = async () => {
            try {
                const res: IAlarm = await axiosGet(
                    `/alarm/alarms?vehicle_name=${vehicle}&start_date=${start_date}&end_date=${end_date}&page=${page}&page_size=10`
                    // `/alarm/alarms?vehicle_name=${vehicle}&start_date=${start_date}&end_date=${end_date}&page=${page}&page_size=10`
                );
                const alert: IAlarmTable[] = [];
                const _btnAGV:string[] = [];
                for (let i = 0; i < res.payload.length; i++) {
                    const descript = res.payload[i].description.split("|");
                    const _date = res.payload[i].timestamp?.substring(0, 10);
                    const _time = res.payload[i].timestamp?.substring(11, 19);
                    alert.push({ id: res.payload[i].id, code: res.payload[i].code, vehicle_name: res.payload[i].vehicle_name, date: _date, time: _time, th: descript[1], en: descript[0] });
                    
                    if (!_btnAGV.includes(res.payload[i].vehicle_name)) {
                        _btnAGV.push(res.payload[i].vehicle_name);
                    }
                }
                setPagination(_pagination(res.structure?.total_pages));
                setalarmTable(alert);
                setbtnAGV(_btnAGV);

            } catch (e: any) {
                console.error(e);
            }finally {
                if (!loadSuccess) {
                    setLoadSuccess(true);
                }
            }
        };
        getAlarm();
    }, []);
    return <>
    {!loadSuccess&&<div className='loading-background'>
        <div id="loading"></div>
      </div>}
        <section className='mission-box'>
            <div className='mission-title-box'>
                <h1>SHOW ERROR</h1>
                <div className='box-title'>
                    <p className="title1">
                        <BsConeStriped size={36} color={"#ff6900"} />
                        <span>error of vehicle on running</span></p>
                </div>

            </div>
            <div className='container-card'>
                <div className='mission-header'>
                    <div className='selected-mission-btn'>
                        <button onClick={() => reloadPage({ v: "ALL" })} className={`${vehicle === "ALL" ? "active" : ""}`}>All</button>
                        {btnAGV.map((name)=><button onClick={() => reloadPage({ v: name })} className={`${vehicle === name ? "active" : ""}`}>{name}</button>)}

                    </div>
                    <div className='input-date-box'>
                        <div className="form-group">
                            <label >From</label>
                            <input type="text" value={start_date} readOnly></input>
                            <input
                                type="date"
                                onChange={(e) => reloadPage({ d: e.target.value })} />
                        </div>

                        <div className="form-group">
                            <label >To</label>
                            <input type="text" value={end_date} readOnly></input>
                            <input type="date"
                                onChange={(e) => reloadPage({ de: e.target.value })} />
                        </div>
                        <button className="export-btn" onClick={downloadCSV}>export</button>
                    </div>
                </div>
                <div className='table-container overflow-auto'>
                    <table className="table table-hover">
                        <thead className='text-center'>
                            <tr>
                                <th scope="col" style={{ width: "100px" }}>#</th>
                                <th scope="col" style={{ width: "150px" }}>รถ</th>
                                <th scope="col"><div className="head-table-flex">
                                    <div className='mission-circle-icon' style={{ background: "#ffe6e6"}}>  
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
                    {pagination}
                </div>

            </div>
        </section>

    </>;
}