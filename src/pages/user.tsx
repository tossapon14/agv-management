import UserImage from '../assets/images/user.png';
import NetworkError from './networkError';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from "react-router-dom";
import { axiosDelete, axiosGet } from "../api/axiosFetch";
import './css/user_style.css';
import { BsThreeDotsVertical } from "react-icons/bs";
import Lock_img from '../assets/images/lock.png';
import Delete_img from '../assets/images/bin.png';
import ResponseAPI from './responseAPI';
import { useTranslation } from 'react-i18next';
import NotAuthenticated from './not_authenticated';

interface IUser {
    message: string
    payload: IuserPayload[]
    structure: IStructure
}
interface IStructure {
    total_items: number
    total_pages: number
    page: number
    page_size: number
}

interface IuserPayload {
    name: string
    username: string
    password: string
    employee_no: string
    position: string
    access_token?: string
    status: boolean
    bg?: string
}
export default function User() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const page_size = searchParams.get('page_size') || '10';

    const [checkNetwork, setCheckNetwork] = useState(true);
    const [pagination, setPagination] = useState<React.ReactElement | null>(null);
    const [loadSuccess, setLoadSuccess] = useState(false);
    const [UserList, setUserList] = useState<IuserPayload[]>([]);
    const [showOption, setShowOption] = useState<{ show: boolean, top?: string, left?: string, indexRow?: number }>({ show: false, });
    const [showConfirmDelete, setShowconfirmDelete] = useState<{ show: boolean, username?: string }>({ show: false, username: '' });
    const saveUserIndex = useRef<number | null>(null); // Initialize with null
    const [responseData, setResponseData] = useState<{ error: boolean | null, message?: string }>({ error: null });
    const userRef = useRef<IuserPayload[]>([]);
    const searchName = useRef<HTMLInputElement>(null);
    const checkAdmin = useRef<HTMLInputElement>(null);
    const checkNormal = useRef<HTMLInputElement>(null);
    const [notauthenticated, setNotAuthenticated] = useState(false);
    const Debounce = useRef<NodeJS.Timeout | null>(null); // Use NodeJS.Timeout for TypeScript
    const { t } = useTranslation("user");

    const searchUser = () => {

        if (Debounce.current)  // Clear the previous timeout if it exists          
            clearTimeout(Debounce.current);
        Debounce.current = setTimeout(() => {
            const data = {
                text: searchName.current?.value.trim().toLowerCase(),
                admin: checkAdmin.current?.checked,
                normal: checkNormal.current?.checked
            };

            const userSearch = userRef.current.filter((u: IuserPayload) => {
                // Check position filter
                const matchAdmin = data.admin && u.position === 'admin';
                const matchNormal = data.normal && u.position !== 'admin';
                const matchPosition = data.admin || data.normal ? (matchAdmin || matchNormal) : true;

                // Check name filter
                const matchName = data.text ? u.name.toLowerCase().includes(data.text) : true;

                return matchPosition && matchName;
            });

            setUserList(userSearch);
        }, 500); // Debounce delay

    };
    const btnForOption = (index: number) => {
        setShowOption({ show: false });
        if (index === 0) { // edit user
            if (saveUserIndex.current !== null) {
                const user = UserList[saveUserIndex.current!];
                navigate(`/edit-user?employee_no=${user.employee_no}&username=${user.username}&name=${user.name}&position=${user.position}`);
            } // Check if the index is valid

        } else if (index === 1) { // edit password
            const user = UserList[saveUserIndex.current!];
            navigate(`/change-password?employee_no=${user.employee_no}&username=${user.username}&name=${user.name}&position=${user.position}`);

        } else if (index === 2) { //
            if (saveUserIndex.current === null) return; // Check if the index is valid
            setShowconfirmDelete({ show: true, username: UserList[saveUserIndex.current!].username });
        }
    }

    const handleCloseModalDelete = () => {
        setShowconfirmDelete({ show: false });
        saveUserIndex.current = null; // Reset the index when closing the option
    };

    const openOption = (e: React.MouseEvent, index: number) => {
        const rect = e.currentTarget.getBoundingClientRect();
        saveUserIndex.current = index; // Save the index of the clicked user
        setShowOption({ show: true, left: `${rect.left}px`, top: `${rect.top}px`, indexRow: index });
    }

    const handleOpenInNewTab = () => {
        navigate('/create-User');
    };
    const reloadPage = async (data: { p?: number, ps?: string }) => {
        try {
            var params = '';
            if (data.p) {
                params = `?username=ALL&page=${data.p?.toString()}&page_size=${page_size}`
            } else if (data.ps) {
                params = `?username=ALL&page=1&page_size=${page_size}`

            }

            navigate(params);
            window.location.reload(); // Force reload if needed
        } catch (e: any) {
            console.error(e);
        }
    }

    const onConfirmDelete = async () => {
        try {
            if (saveUserIndex.current === null) return; // Check if the index is valid
            const user = UserList[saveUserIndex.current!];
            const data = {
                employee_no: user.employee_no,
                name: user.name,
                position: user.position,
                username: user.username,
            }

            saveUserIndex.current = null; // Reset the index when closing the option
            setResponseData({ error: null, message: "loading" });
            const delres: IUser = await axiosDelete(
                '/user/delete_user?page=1&page_size=10', data
            );
            console.log(delres)
            if (delres.message ===
                "Payload of all available users.") {
                setShowconfirmDelete({ show: false });
                setResponseData({ error: false, message: "delete user success" })
                setTimeout(() => {
                    window.location.reload(); // Force reload if needed
                }, 3100);
            }
        } catch (e: any) {
            console.error(e);
            if (e.response?.data?.detail) {
                setResponseData({ error: true, message: e.response.data.detail })
            } else {
                setResponseData({ error: true, message: e?.message })
            }

        }
    }



    useEffect(() => {

        const _pagination = (ttp: number): React.ReactElement | null => {
            const page: number = Number(searchParams.get("page") || 1); // Default to 1 if not found

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
        const getRandomRgba = () => {
            const r = Math.floor(Math.random() * 256); // 0-255
            const g = Math.floor(Math.random() * 256);
            const b = Math.floor(Math.random() * 256);
            return `rgba(${r}, ${g}, ${b}, 0.8)`;
        }
        const getUser = async () => {
            try {
                const res: IUser = await axiosGet(
                    '/user/users?username=ALL&page=1&page_size=10'
                );
                const userList: IuserPayload[] = [];
                res.payload.forEach((user) => {
                    const _user = { ...user, bg: getRandomRgba() };
                    userList.push(_user);
                });
                setPagination(_pagination(res.structure?.total_pages));
                setUserList(userList);
                userRef.current = userList;
            } catch (e: any) {
                console.error(e?.message);
                if (e.response?.status === 401 || e.response?.data?.detail === "Invalid token or Token has expired.") {
                    setNotAuthenticated(true)
                }
            }
        }

        const checkNetwork = async () => {
            try {
                const response = await fetch(import.meta.env.VITE_REACT_APP_API_URL, { method: "GET" });
                if (response.ok) {
                    getUser();
                }
            } catch (e: any) {
                console.error(e);
                setCheckNetwork(false);
            } finally {
                if (!loadSuccess) {
                    setLoadSuccess(true);
                }
            }
        };
        checkNetwork();


    }, []);
    return (
        <div className='mission-box-page'>
            {!loadSuccess && <div className='loading-background'>
                <div id="loading"></div>
            </div>}
            {notauthenticated && <NotAuthenticated />}
            <div className='mission-title-box'>
                <h1>{t("us_title")}</h1>
                <p className="title1">
                    <img src={UserImage} alt="Logo user" className="me-3" width="24" height="24" />
                    <span>{t("us_subtitle")}</span></p>
            </div>
            {!checkNetwork ? <NetworkError /> :

                <div className='px-4'>
                    <ResponseAPI response={responseData} />
                    <div className={`fixed-bg-delete ${showConfirmDelete.show ? "" : "d-none"}`}>
                        <div className='box-confirm-delete'>
                            <img src={Delete_img} alt="delete icon" width={40} height={40} />
                            <h4 className='mt-2'>Do you want delete this account?</h4>
                            <p className='text-center'>un.  <span className='name-user'>{showConfirmDelete.username}</span></p>
                            <div className='box-confirm-delete-btn'>
                                <button className='btn btn-danger' onClick={handleCloseModalDelete}>close</button>
                                <button className='btn btn-primary' onClick={() => onConfirmDelete()}>confirm</button>
                            </div>
                        </div>
                    </div>
                    {showOption.show && <div className='display-option-bg' onClick={() => setShowOption({ show: false })}>
                        <div className='display-option' style={{ left: showOption.left, top: showOption.top }}>
                            <div className='btn-mode-option' onClick={() => btnForOption(0)}>
                                <img src={UserImage} alt="edit" width={20} height={20} />
                                <p>{t("edit_us")}</p>
                            </div>
                            <div className='btn-mode-option' onClick={() => btnForOption(1)}>
                                <img src={Lock_img} alt="lock" width={20} height={20} />

                                <p>{t("edit_pass")}</p>
                            </div>
                            <div className='btn-mode-option' onClick={() => { btnForOption(2) }}>
                                <img src={Delete_img} alt="delete icon" width={20} height={20} />

                                <p>{t("del")}</p>
                            </div>
                        </div>

                    </div>}
                    <div className='user-card d-flex '>
                        <div className='box-of-search'>
                            <h5>{t("search")}</h5>
                            <div className='box-of-search-content'>
                                <div className='box-of-search-content-item'>
                                    <label htmlFor="username">{t("name")}</label><br></br>
                                    <input ref={searchName} type="text" id="username" placeholder={t("inp_name")} onChange={() => searchUser()} />
                                </div>

                                <div className='box-of-search-content-item mt-3'>
                                    <h6>{t("other")}</h6>
                                    <div className='d-flex align-items-center'>
                                        <input ref={checkAdmin} type="checkbox" id="admin" onChange={() => searchUser()} />
                                        <label htmlFor="admin">{t("admin")}</label>
                                    </div>
                                    <div className='d-flex align-items-center'>
                                        <input ref={checkNormal} type="checkbox" id="user" onChange={() => searchUser()} />
                                        <label htmlFor="user">{t("nor_us")}</label>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div className='col-10'>
                            <button className='btn btn-outline-primary mt-2' onClick={handleOpenInNewTab}>{t("create")}</button>
                            <button className='btn btn-outline-dark mt-2 ms-2' onClick={() => window.location.reload()}>{t("reload")}</button>
                            <div className='table-user'>
                                <table className="table table-hover mt-2 ">
                                    <thead className='bg-light'>
                                        <tr>
                                            <th scope="col">{t("tb_id")}</th>
                                            <th scope="col">{t("name")}</th>
                                            <th scope="col">{t("tb_user")}</th>
                                            <th scope="col">{t("tb_empl")}</th>
                                            <th scope="col">{t("tb_position")}</th>
                                            <th scope="col">{t("tb_status")}</th>
                                            <th scope="col" ></th>

                                        </tr>
                                    </thead>
                                    <tbody  >
                                        {UserList.map((user, index) => <tr key={index}>
                                            <td scope="row">#{index + 1}</td>
                                            <td>
                                                <div className="d-flex align-items-center" >
                                                    <div className="rounded-circle d-flex  align-items-center justify-content-center me-2" style={{ fontWeight: 'bold', width: "32px", height: "32px", backgroundColor: user.bg, color: 'white' }}>{user.name[0].toUpperCase()}</div>
                                                    {user.name}
                                                </div>
                                            </td>
                                            <td>{user.username}</td>
                                            <td>{user.employee_no}</td>
                                            <td>{user.position}</td>
                                            <td>
                                                {user.status ? <div className='boxonline'>
                                                    {t('online')}
                                                </div> : <div className='boxonline' style={{ backgroundColor: "rgb(250, 216, 216)", color:"rgb(255, 0, 0)" }}>
                                                    {t('offline')}
                                                </div>}
                                            </td>
                                            <td>
                                                <button className="btn-bg-none" onClick={(e) => openOption(e, index)}><BsThreeDotsVertical /></button>
                                            </td>
                                        </tr>)}

                                    </tbody>
                                </table>



                            </div>
                            <div className='page-number-d-flex'>

                                <div className="tooltip-container">
                                    <button type="button" onClick={() => { }}>{page_size}</button>
                                    <div className="box-tooltip">
                                        <button className='btn-page-size' onClick={() => reloadPage({ ps: '10' })}>10</button>
                                        <button className='btn-page-size' onClick={() => reloadPage({ ps: '50' })}>50</button>
                                        <button className='btn-page-size' onClick={() => reloadPage({ ps: '100' })}>100</button>
                                    </div>
                                </div>
                                <span className='ms-1 me-3'>{t("user/page")}</span>
                                {pagination}
                            </div>
                        </div>

                    </div>
                </div>
            }
        </div>
    );
}