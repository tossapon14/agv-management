import BgMap from '../assets/images/bg_map.png';
import AGV1 from '../assets/images/carmodel_blue.png';
import AGV2 from '../assets/images/carmodel.webp';
import AGV3 from '../assets/images/carmodel_green.png';
import AGV4 from '../assets/images/carmodel_yellow.png';
import Pin from '../assets/images/pin2.png';

import Location from "../assets/images/location.png";
import Switch from './switch';
import { useState, useRef, useMemo } from 'react'
import './css/map.css';

interface MapAnimateProps {
  data: string[][] // Optional prop to toggle station visibility initially
  paths: {paths: number[][],drop:number[][]}|null
 }
const AGV: { [key: string]: string } = { AGV1: AGV1, AGV2: AGV2, AGV3: AGV3, AGV4: AGV4 }
function MapAnimate({ data, paths}: MapAnimateProps) {
  const [stationshow, setStationshow] = useState(true);
  const [sw, setSwitch] = useState(true);
 
  const mapID = useRef<HTMLDivElement>(null);
  const setSwitchShow = () => {
    setSwitch(!sw);
    setStationshow(!stationshow);
  };
  
  const calPathAgv = useMemo(():{paths:string,drop:{ x: string, y: string }[]}=>{
     if ( mapID.current!=null&&paths!==null&& paths?.paths.length != 0) {
      const positionsPoint = (point:number[]):string[]=>{
         const x = point[0] * -0.9966398834184859 - point[1] * 0.08190813622337459;
          const y = point[0] * 0.08190813622337459 + point[1] * -0.9966398834184859;
          const positionX = (((x + 52) / 1005) * mapID.current!.clientWidth).toFixed(2);
          const positionY = ((1 - ((y + 280) / 586.10)) * mapID.current!.clientHeight).toFixed(2);
          return [positionX,positionY]
      }; 
        let d = "M";
        paths!.paths.forEach(point => {
          const [positionX,positionY] = positionsPoint(point);
          d = d + ' ' + positionX + ' ' + positionY;
        });
        const drop: { x: string, y: string }[] = [];
        paths!.drop.forEach((point) => {
          const [positionX,positionY] = positionsPoint(point);
          drop.push({ x: positionX, y: positionY })
        });
        return {paths:d,drop:drop};
      } else {
       return {paths:"",drop:[]};
      }
     
},[paths]);
  

  return (
    <div id="map" ref={mapID}>
      <img src={BgMap} className="map-img" alt="map" loading="lazy" />
      {stationshow && <img src={Location} className="map-img" alt="location" loading="lazy" />}
      <svg className="svg">
        <path
          d={calPathAgv.paths}
          fill="none"
          stroke="red"           // Line color
          strokeWidth={4}        // Line thickness
          strokeLinejoin="round"
          strokeLinecap="round"  // Makes the line edges rounded
        />

        {calPathAgv.drop.map((drop, index) => (
          <g key={index}>
            <circle
              cx={drop.x}
              cy={drop.y}
              r="10"
              fill="white"
              stroke="black"
              strokeWidth="2"
            />
            <image
              x={Number(drop.x) - 20}  // Center the pin image if needed
              y={Number(drop.y) - 40}
              href={Pin}
              className="pin-animate"
            />
          </g>
        ))}
      </svg>
      {data.map((agv,i) => <img key={i} src={AGV[agv[0]]} className='carmodel-position' style={{ left: `${agv[1]}`, bottom: `${agv[2]}`, transform: `rotate(${agv[3]}deg)` }} alt={`${agv[0]}`}></img>)}
      <div className="switch-map-pick">
         <h6>{sw ? "show" : "hide"}</h6>
        <Switch isOn={sw} handleToggle={setSwitchShow} />
      </div>
    </div>
  );
}

export default  MapAnimate;