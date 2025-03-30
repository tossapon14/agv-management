import './css/mission.css'
import { IoMdSettings } from "react-icons/io";
import { FaMapMarkerAlt } from "react-icons/fa";
import MissionImage from '../assets/images/mission.png';
import { useEffect, useState } from 'react';
import { axiosGet } from "../api/axiosFetch";
import { IMissionData } from './home';
import { useSearchParams, useNavigate } from "react-router-dom";

interface IMissionTables {
    arriving_time: string
    dispatch_time: string
    duration: string
    id: number
    nodes: string
    paths: string
    requester: string
    status: number
    str_status: { txt: string, color: string, bgcolor: string }
    timestamp: string
    transport_state: number
    vehicle_name: string
    tpick: string
    tstart: string
    tend: string
    drop: string
    pick: string
}
export const pairMissionStatus = function (state: number): { txt: string, color: string, bgcolor: string } {
    switch (state) {
        case 0: return { txt: "รออนุมัติ", color: "#444444", bgcolor: "#eeeeee" };
        case 1: return { txt: "อนุมัติ", color: '#3d85c6', bgcolor: "#ebf6ff" };
        case 2: return { txt: "เริ่มงาน", color: "#ffc000", bgcolor: "#fff9e6" };
        case 3: return { txt: "สำเร็จ", color: "#58dd1e", bgcolor: "#e7ffe0" };
        case 4: return { txt: "ปฏิเสธ", color: '#a64d79', bgcolor: "#ffeef8" };
        case 5: return { txt: "ยกเลิก", color: "#cc0000", bgcolor: "#ffeeee" };
        case 6: return { txt: "ไม่สำเร็จ", color: '#cc0000', bgcolor: "#ffeeee" };
        default: return { txt: "รออนุมัติ", color: "#444444", bgcolor: "#fff" };
    }
}
const colorAgv: { [key: string]: string } = { "AGV1": "#001494", "AGV2": "#cc0000", "AGV3": "#006a33", "AGV4": "#d7be00", "AGV5": "#94008d", "AGV6": "#0097a8" };

export default function Mission() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [missionTable, setMissionTable] = useState<IMissionTables[]>([]);
    const page: number = Number(searchParams.get("page") || 1); // Default to 1 if not found
    const vehicle = searchParams.get("vehicle_name") || "ALL"; // Default to "desc"
    const status = searchParams.get("status") || "ALL"; // Default to "asc"
    const start_date = searchParams.get("start_date") || new Date().toISOString().substring(0, 10)
    const end_date = searchParams.get("end_date") || new Date().toISOString().substring(0, 10)
    const [pagination, setPagination] = useState<React.ReactElement | null>(null);
    const [loadSuccess, setLoadSuccess] = useState(false);
    const [btnAGV, setbtnAGV] = useState<string[]>([])


    const reloadMissionByButton = async (data: { v?: string, s?: string, d?: string, de?: string, p?: number }) => {
        try {
            var params = "?";
            if (data.v) {
                params = `?vehicle_name=${data.v}&status=${status}&start_date=${start_date}&end_date=${end_date}&page=1&page_size=10`
            }
            else if (data.s) {
                params = `?vehicle_name=${vehicle}&status=${data.s}&start_date=${start_date}&end_date=${end_date}&page=1&page_size=10`
            }
            else if (data.d) {
                if (new Date(data.d) > new Date(end_date)) {
                    return;
                }
                params = `?vehicle_name=${vehicle}&status=${status}&start_date=${data.d}&end_date=${end_date}&page=1&page_size=10`

            }
            else if (data.de) {
                if (new Date(data.de) < new Date(start_date)) {
                    return;
                }
                params = `?vehicle_name=${vehicle}&status=${status}&start_date=${start_date}&end_date=${data.de}&page=1&page_size=10`

            }
            else if (data.p) {
                params = `?vehicle_name=${vehicle}&status=${status}&start_date=${start_date}&end_date=${end_date}&page=${data.p.toString()}&page_size=10`

            }
            navigate(params, { replace: true });
            window.location.reload(); // Force reload if needed
        } catch (e: any) {
            console.error(e);
        }
    }

    const downloadCSV = async () => {
        const fetchData: string = await axiosGet(
            `/mission/export_mission_report?vehicle_name=${vehicle}&status=${status}&start_date=${start_date}&end_date=${end_date}`)
        const blob = new Blob([fetchData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `mission-vehicle ${vehicle} status ${status} date ${start_date} ${end_date}.csv`;
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
                                onClick={() => reloadMissionByButton({ p: pageNumber })}
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
                } else if (page > 1) {
                    intial = page - 1
                } else {
                    intial = page
                }
                return <div className="pagination">
                    {/* Previous Button */}
                    <a
                        onClick={() => reloadMissionByButton({ p: page > 1 ? page - 1 : 1 })}
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
                                    onClick={() => reloadMissionByButton({ p: pageNumber })}
                                    className={pageNumber === page ? "active" : ""}
                                >
                                    {pageNumber}
                                </a>
                            );
                        })}

                    {/* Next Button */}
                    <a
                        onClick={() => reloadMissionByButton({ p: page + 1 })}
                        className={page === ttp ? "disabled" : ""}
                    >
                        &raquo;
                    </a>
                </div>
            }
            else return null
        };

        const getMission = async () => {
            try {
                const res: IMissionData = await axiosGet(
                    // `/mission/missions?vehicle_name=ALL&status=ALL&start_date=${getDate}&end_date=${getDate}&page=1&page_size=10`
                    `/mission/missions?vehicle_name=${vehicle}&status=${status}&start_date=${start_date}&end_date=${end_date}&page=${page}&page_size=10`

                );
                setPagination(_pagination(res.structure?.total_pages));
                const _mission:IMissionTables[]  = []
                const _btnAGV:string[] = []
                res.payload.forEach((ele)=>{
                    _mission.push({...ele, str_status: pairMissionStatus(ele.status),
                        drop: ele.nodes.substring(5),
                        pick: ele.nodes.substring(0, 4),
                        timestamp: ele.timestamp?.substring(0, 10),
                        tpick: ele.timestamp?.substring(11, 19),
                        tstart: ele.dispatch_time?.substring(11, 19),
                        tend: ele.arriving_time?.substring(11, 19),})
                        if (!_btnAGV.includes(ele.vehicle_name)) {
                            _btnAGV.push(ele.vehicle_name);
                        }                
                }); 
                setbtnAGV(_btnAGV);  // for button AGV
                setMissionTable(_mission);

            } catch (e: any) {
                console.error(e);
            } finally {
                if (!loadSuccess) {
                    setLoadSuccess(true);
                }
            }
        };
        getMission();
    }, []);
    return <>
        <section className='mission-box'>
        {!loadSuccess&&<div className='loading-background'>
        <div id="loading"></div>
      </div>}
            <div className='mission-title-box'>
                <h1>MISSION</h1>
                <div className='box-title'>
                    <p className="title1">
                        <img src={MissionImage} alt="Logo with a yellow circle and blue border" className="me-3" width="32" height="32" />
                        <span>view and manage your mission</span></p>
                    <div className="selected-agv-box">
                        <button onClick={() => reloadMissionByButton({ v: "ALL" })} className={`${vehicle === "ALL" ? "active" : ""}`}>ทั้งหมด</button>
                        {btnAGV.map((name)=><button onClick={() => reloadMissionByButton({ v: name })} className={`${vehicle === name ? "active" : ""}`}>{name}</button>)}
                    </div>
                </div>

            </div>
            <div className='container-card'>
                <div className='mission-header'>
                    <div className='selected-mission-btn'>
                        <button onClick={() => reloadMissionByButton({ s: "ALL" })} className={`${status === "ALL" ? "active" : ""}`}>All</button>
                        <button onClick={() => reloadMissionByButton({ s: "RUNNING" })} className={`${status === "RUNNING" ? "active" : ""}`}>Running</button>
                        <button onClick={() => reloadMissionByButton({ s: "SUCCESS" })} className={`${status === "SUCCESS" ? "active" : ""}`}>Success</button>
                        <button onClick={() => reloadMissionByButton({ s: "FAILED" })} className={`${status === "FAILED" ? "active" : ""}`}>Failed</button>
                        <button onClick={() => reloadMissionByButton({ s: "CANCEL" })} className={`${status === "CANCEL" ? "active" : ""}`}>Cancel</button>

                    </div>
                    <div className='input-date-box'>
                        <div className="form-group">
                            <label >From</label>
                            <input type="text" value={start_date} readOnly></input>
                            <input
                                type="date"
                                onChange={(e) => reloadMissionByButton({ d: e.target.value })} />
                        </div>

                        <div className="form-group">
                            <label >To</label>
                            <input type="text" value={end_date} readOnly></input>
                            <input type="date"
                                onChange={(e) => reloadMissionByButton({ de: e.target.value })} />
                        </div>
                        <button className="export-btn" onClick={downloadCSV}>export</button>
                    </div>
                </div>
                <div className='table-container overflow-auto'>
                    <table className="table table-hover">
                        <thead className='text-center'>
                            <tr>
                                <th scope="col">job id</th>
                                <th scope="col" >รถ</th>
                                <th scope="col">ผู้สั่ง</th>
                                <th scope="col"><div className='head-table-flex'>
                                    <div className='pick-circle-icon'>
                                    </div>จุดจอด
                                </div>
                                </th>
                                <th scope="col"><div className="head-table-flex">
                                    <div className='mission-circle-icon'>
                                        <IoMdSettings color='#E9762B' />
                                    </div>
                                    status</div>
                                </th>
                                <th scope="col">
                                    <div className="head-table-flex">
                                        <div className='mission-circle-icon color-blue'>
                                            <FaMapMarkerAlt color='#003092' />
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
                            {missionTable.map((miss) => <tr key={miss.id}>
                                <td scope="row">#{miss.id}</td>
                                <td><div className='td-vehicle-name'><div className='circle-vehicle-icon' style={{ background: `${colorAgv[miss.vehicle_name]}` }}></div><span>{miss.vehicle_name}</span></div></td>
                                <td>{miss.requester}</td>
                                <td>{miss.pick}</td>
                                <td><div className='box-status' style={{ background: miss.str_status.bgcolor, color: miss.str_status.color }}>{miss.str_status.txt}</div></td>
                                <td>{miss.drop}</td>
                                <td>{miss.timestamp}</td>
                                <td>{miss.tpick}</td>
                                <td>{miss.tstart}</td>
                                <td>{miss.tend}</td>
                                <td>{miss.duration}</td>

                                <td><button className='btn-cancel'>cancel</button></td>
                            </tr>)}

                        </tbody>
                    </table>

                    {
                        pagination
                    }

                </div>

            </div>
        </section>

    </>;
}