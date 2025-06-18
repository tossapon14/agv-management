import { useEffect, useState } from "react";
import { BiSolidError } from "react-icons/bi";
import { axiosGet } from "../api/axiosFetch";
import { IAlarm } from "./alarm";
import { useTranslation } from 'react-i18next';

function HomeAlarmError({ agvName }: { agvName: string }) {
    const [alarm, setAlarm] = useState<{ [agv: string]: { [lang: string]: string }[] } | null>(null);
    const { t, i18n } = useTranslation("home");
    useEffect(() => {
        const _date = new Date().toISOString().substring(0, 10)
        const getAlarm = async () => {
            const res: IAlarm = await axiosGet(`/alarm/alarms?vehicle_name=${agvName}&start_date=${_date}&end_date=${_date}&page=1&page_size=10`);
            const agv: { [agvKey: string]: { [_: string]: string }[] } = {};
            for (let i = 0; i < res.payload.length; i++) {
                const pay = res.payload[i];
                const descript = res.payload[i].description.split("|");
                if (agv[pay.vehicle_name] === undefined) {
                    agv[pay.vehicle_name] = [];
                    agv[pay.vehicle_name].push({ time: pay.timestamp, th:  descript[1], en: descript[0] });

                } else if (agv[pay.vehicle_name][0]['time'] === pay.timestamp) {
                    agv[pay.vehicle_name].push({ time: pay.timestamp, th:  descript[1], en: descript[0] });

                }

            }
             setAlarm(agv)
        }
        const timeOut = setTimeout(()=>getAlarm(),2000);
        return ()=>{
            clearTimeout(timeOut);
        };
    }, [agvName]);
    return <div className="error-card position-fixed overflow-hidden  text-white ">
        <div className="pb-3 ps-2 d-flex align-items-end w-100 bg-dark" style={{ height: "50px" }}>
            <BiSolidError size={28} color={'rgb(254, 0, 0)'} />
            <span className="h5 ms-2 mb-0">{t("errorTitle")}</span>
        </div>
        {alarm ? <div className='overflow-auto' style={{ height: "460px" }}>
            {Object.entries(alarm!).map(([key, value]) => (
                <div className="bg-secondary" key={key} style={{ padding: "1rem", marginBottom: '1rem' }}>
                    <h5 style={{ color: 'rgb(255, 85, 85)' }}>{key}</h5>
                    {value.map((error, i) => (
                        <p key={i}>{error['time'].substring(11,19)} {i18n.language === "th" ? error.th : error.en}</p>
                    ))}
                </div>
            ))}
            <a href="/alarms" className="position-absolute  btn btn-primary" style={{ bottom: "20px", right: '16px' }}>{t("alarmlink")}</a>
        </div> : <div>
            <div className="placeholder-wave bg-secondary" style={{ padding: "1rem" }}>
                <div className="placeholder col-3"></div><br />
                <span className="placeholder col-12"></span>
                <span className="placeholder col-10"></span>
                <span className="placeholder col-12"></span>
            </div>
            <div className="position-absolute placeholder-wave" style={{ bottom: "20px", right: '16px' }}>
                <div className="placeholder" style={{ width: '90px', height: '32px' }}></div>
            </div>
        </div>}

    </div>
}
export default HomeAlarmError;