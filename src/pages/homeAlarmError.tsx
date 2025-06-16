import { useEffect, useState } from "react";
import { BiSolidError } from "react-icons/bi";
import { axiosGet } from "../api/axiosFetch";
import { IAlarm } from "./alarm";
import { useTranslation } from 'react-i18next';

function HomeAlarmError({ agvName }: { agvName: string }) {
    const [alarm, setAlarm] = useState<{ [agv: string]: { [lang:string]: string}[] } | null>(null);
    const { t, i18n } = useTranslation("home");
    useEffect(() => {
        const _date = new Date().toISOString().substring(0, 10)
        const getAlarm = async () => {
            const res: IAlarm = await axiosGet(`/alarm/alarms?vehicle_name=${agvName}&start_date=${_date}&end_date=${_date}&page=1&page_size=10`);
            const agv: { [agv: string]: {[lang:string]: string }[] } = {};
            res.payload.forEach((pay) => {
                const descript = pay.description.split("|");
                if (agv[pay.vehicle_name] === undefined) {
                    agv[pay.vehicle_name] = [];
                }
                agv[pay.vehicle_name!].push({ th: pay.timestamp.substring(11, 19) + " " + descript[1], en: pay.timestamp.substring(11, 19) + " " + descript[0] });
            });
            setAlarm(agv)
        }
        getAlarm();
        const timerID = setInterval(getAlarm, 3000);
        return () => {
            clearInterval(timerID);
        }
    }, [agvName]);
    return <div className="error-card position-fixed overflow-hidden  text-white ">
        <div className="pb-3 ps-2 d-flex align-items-end w-100 bg-dark" style={{ height: "50px" }}>
            <BiSolidError size={28} color={'rgb(254, 0, 0)'} />
            <span className="h5 ms-3 mb-0">ERROR</span>
        </div>
        {alarm ? <div className='overflow-auto' style={{ height: "460px" }}>
            {Object.entries(alarm!).map(([key, value]) => (
                <div className="bg-secondary" key={key} style={{ padding: "1rem", marginBottom: '1rem' }}>
                    <h5 style={{ color: 'rgb(255, 85, 85)' }}>{key}</h5>
                    {value.map((error, i) => (
                        <p key={i}>{error[i18n.language] }</p>
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