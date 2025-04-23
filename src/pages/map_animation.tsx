import BgMap from '../assets/images/bg_map.png';
import AGV1 from '../assets/images/carmodel_blue.png';
import AGV2 from '../assets/images/carmodel.webp';
import AGV3 from '../assets/images/carmodel_green.png';
import AGV4 from '../assets/images/carmodel_yellow.png';
import Pin from '../assets/images/pin2.png';

import Location from "../assets/images/location.png";
import Switch from './switch';
import { useState, useEffect, useRef } from 'react'
import './css/map.css';

interface MapAnimateProps {
  data: { agv: string, online: boolean, position: string[] }[] // Optional prop to toggle station visibility initially
  paths: number[][]
  positionDrop: number[][]
}
const AGV: { [key: string]: string } = { AGV1: AGV1, AGV2: AGV2, AGV3: AGV3, AGV4: AGV4 }
function MapAnimate({ data, paths, positionDrop }: MapAnimateProps) {
  const [stationshow, setStationshow] = useState(true);
  const [sw, setSwitch] = useState(true);
  const [agvPath, setAgvPath] = useState<string>("")
  const [dropPose, setDropPose] = useState<{ x: string, y: string }[]>([])
  const mapID = useRef<HTMLDivElement>(null);
  const setSwitchShow = () => {
    setSwitch(!sw);
    setStationshow(!stationshow);
  };

  useEffect(() => {

    const calPath = (arrPoint: number[][]) => {
      if (arrPoint.length != 0) {
        let d = "M";
        arrPoint.forEach(point => {
          const x = point[0] * -0.9966398834184859 - point[1] * 0.08190813622337459;
          const y = point[0] * 0.08190813622337459 + point[1] * -0.9966398834184859;
          const positionX = (((x + 54) / 996.782) * mapID.current!.clientWidth).toFixed(2);
          const positionY = ((1 - ((y + 280) / 586.10)) * mapID.current!.clientHeight).toFixed(2);
          d = d + ' ' + positionX + ' ' + positionY;
        });
        const drop: { x: string, y: string }[] = [];
        positionDrop.forEach((point) => {
          const x = point[0] * -0.9966398834184859 - point[1] * 0.08190813622337459;
          const y = point[0] * 0.08190813622337459 + point[1] * -0.9966398834184859;
          const positionX = (((x + 54) / 996.782) * mapID.current!.clientWidth).toFixed(2);
          const positionY = ((1 - ((y + 280) / 586.10)) * mapID.current!.clientHeight).toFixed(2);
          drop.push({ x: positionX, y: positionY })
        });
        setAgvPath(d);
        setDropPose(drop);
      } else {
        setAgvPath('');
        setDropPose([]);
      }

    };

    // function handleResize() {
    calPath(paths);
    // }

    // handleResize();
    // mapID.current?.addEventListener("resize", handleResize);
    // return () => {
    //   mapID.current?.removeEventListener("resize", handleResize);
    // };
  }, [paths]);

  return (
    <div id="map" ref={mapID}>
      <img src={BgMap} className="map-img" alt="map" loading="lazy" />
      {stationshow && <img src={Location} className="map-img" alt="location" loading="lazy" />}

      <svg className="svg">
  <path
    d={agvPath}
    fill="none"
    stroke="red"           // Line color
    strokeWidth={8}        // Line thickness
    strokeLinejoin="round"
    strokeLinecap="round"  // Makes the line edges rounded
  />

  {dropPose.map((drop, index) => (
    <g key={index}>
      <circle 
        cx={drop.x} 
        cy={drop.y} 
        r="12" 
        fill="white" 
        stroke="black" 
        strokeWidth="3" 
      />
      <image 
        x={Number(drop.x) - 20}  // Center the pin image if needed
        y={Number(drop.y) - 40} 
        href={Pin} 
        // width="40" 
        // height="40" 
        className="pin-animate" 
      />
    </g>
  ))}
</svg>
      {/* {positionDrop.map((drop, index) => <img key={index} src={Pin} width={48} height={48} className='pin-animate' alt='pin' style={{ position: 'absolute', left: drop.x, bottom: drop.y }} />)} */}
      {data.map(agv => agv.online && <img key={agv.agv} src={AGV[agv.agv]} className='carmodel-position' style={{ left: `${agv.position[0]}`, bottom: `${agv.position[1]}`, transform: `rotate(${agv.position[2]}deg)` }} alt={`${agv.agv}`}></img>)}
      <div className="switch-map-pick">
        <h5>{sw ? "show" : "hide"}</h5>
        <Switch isOn={sw} handleToggle={setSwitchShow} />
      </div>
    </div>
  );
}

export default MapAnimate;