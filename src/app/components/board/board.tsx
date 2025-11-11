'use client';

import Logo from '../logo/logo';
import Slider from '../slider/slider';
import Loader from '../loaders/loader';
import { toast } from 'react-toastify';
import ListComponent from './list/list';
import BoardForm from './form/board-form';
import { SwiperSlide } from 'swiper/react';
import { Types } from '@/shared/types/types';
import { List } from '@/shared/types/models/List';
import { Delete, Settings } from '@mui/icons-material';
import { StateGlobals } from '@/shared/global-context';
import { useContext, useEffect, useState } from 'react';
import Icon_Button from '../buttons/icon-button/icon-button';
import { generateModel } from '@/shared/types/models/Properties';
import { Board as BoardModel } from '@/shared/types/models/Board';
import { constants, countPropertiesInObject, errorToast, logToast } from '@/shared/scripts/constants';
import { addBoardToDatabase, addListToDatabase, deleteBoardFromDatabase } from '@/shared/server/firebase';

export default function Board() {
    const { user, width, loaded, usersLoading, boardForm, setSelected } = useContext<any>(StateGlobals);

    let [loading, setLoading] = useState(false);
    let [lists, setLists] = useState<List[]>([]);
    let [board, setBoard] = useState(user?.data?.board);
    let [showAddLists, setShowAddLists] = useState(false);

    useEffect(() => {
        if (user != null) {
            let brd = user?.data?.board;
            if (brd) {
                setBoard(brd);
                if (brd?.lists) {
                    let lsts = brd?.lists;
                    let hasLists = lsts && lsts?.length > 3;
                    setShowAddLists(!hasLists);
                    setLists(lsts);
                }
            }
        }
    }, [user?.data?.board, user?.data?.lists])

    const getSlidesPerView = (wd: number = width): number => {
        let slidesInView = 1;
        let { desktop, tabletMed, pc } = constants?.breakpoints ?? {};
        
        if (wd >= pc) {
            if (wd > desktop) {
                slidesInView = 4;
            } else {
                slidesInView = 3;
            }
        } else {
            if (wd >= tabletMed) {
                slidesInView = 2;
            }
        }

        if (slidesInView > lists?.length) {
            slidesInView = lists?.length;
        }

        return slidesInView;
    }

    const addBoard = async (e?: any) => {
        let { name } = boardForm;
        let newBoard: BoardModel = generateModel(name, Types.Board, user, user?.data?.boards, BoardModel);
        newBoard.boardID = newBoard?.id;
        newBoard.properties = countPropertiesInObject(newBoard);
        await addBoardToDatabase(newBoard, user).then(async response => {
            setTimeout(() => {
                toast?.dismiss();
                logToast(`Added Board`, newBoard);
            }, 500);
            return response;
        }).catch(error => {
            let errorMessage = `Error on Create Board`;
            errorToast(errorMessage, error);
            return;
        });
    }

    const deleteBoard = async (brd: BoardModel) => {
        setLoading(true);
        logToast(`Deleting Board`, brd, undefined, undefined, undefined, true);
        await deleteBoardFromDatabase(brd, user).then(async response => {
            setTimeout(() => {
                toast?.dismiss();
                setLists([]);
                setBoard(null);
                setLoading(false);
                logToast(`Deleted Board`, brd);
            }, 500);
            return response;
        }).catch(error => {
            let errorMessage = `Error on Delete Board`;
            errorToast(errorMessage, error);
            setLoading(false);
            return;
        });
    }

    const addList = async (e?: any) => {
        let { name } = boardForm;
        if (!showAddLists) return;
        logToast(`Adding List`, name, undefined, undefined, undefined, true);
        let newList: List = generateModel(name, Types.List, user, lists, List);
        newList.boardID = board?.id;
        newList.boardIDs = [board?.id];
        newList.properties = countPropertiesInObject(newList);
        await addListToDatabase(newList, user).then(async response => {
            setTimeout(() => {
                toast?.dismiss();
                logToast(`Added List`, newList);
            }, 500);
            return response;
        }).catch(error => {
            let errorMessage = `Error on Create List`;
            errorToast(errorMessage, error);
            return;
        });
    }

    const manageBoard = (e?: any) => {
        setSelected({...board, delete: deleteBoard});
        console.log(`Manage Board`, board);
    }

    return <>
        <div className={`boardComponent ${user != null ? `boardLists_${lists?.length}` : ``} ${(!loading && lists?.length > 0) ? `hasLists` : `noLists`}`}>
            {(!loading && (user?.data?.boards?.length == 0 && lists?.length == 0)) && (
                <div className={`addBoardFormContainer boardTopComponent`}>
                    <div className={`boardTopRow boardFormContainer boardListTitle spaceBetween`}>
                        <div className={`boardTopStart fitMin`}>
                            <Logo label={`New Board`} />
                        </div>
                        <div className={`boardTopMid fullWidth`}>
                            <BoardForm 
                                onClick={addBoard} 
                                newDataForm={true} 
                                className={`addBoardForm`} 
                                showIconButton={width >= constants?.breakpoints?.mobile} 
                            />
                        </div>
                    </div>
                </div>
            )}
            {(loading || usersLoading || !loaded) ? (
                <Loader height={450} label={`Board Loading`} style={{ maxWidth: `calc(var(--wdth) + 1%)`, margin: `0 auto` }} />
            ) : (
                <>
                    {(user != null && board?.userID) ? <>
                        <div className={`boardTopComponent`}>
                            <div className={`boardTopRow boardFormContainer boardListTitle spaceBetween`}>
                                <div className={`boardTopStart fitMin`}>
                                    <Logo label={board?.name} />
                                </div>
                                <div className={`boardTopMid fullWidth`}>
                                    <BoardForm 
                                        autoFocus={true} 
                                        onClick={addList} 
                                        newDataForm={showAddLists} 
                                        boardSearch={!showAddLists} 
                                        disabled={!boardForm?.form?.includes(`listForm`)} 
                                        placeholder={showAddLists ? `List Name` : undefined} 
                                        showIconButton={width >= constants?.breakpoints?.mobile} 
                                        className={`listForm ${showAddLists ? `addListForm` : `listSearch`}`} 
                                    />
                                </div>
                                <div className={`boardTopEnd fitMin flexCenter gap5`}>
                                    <Icon_Button title={`Board Settings`} style={{ marginRight: 5 }} onClick={manageBoard}>
                                        <Settings className={`settingsIcon`} style={{ fontSize: 20 }} />
                                    </Icon_Button>
                                    {width > 768 && <>
                                        <span className={`main`}>
                                            {lists?.length}
                                        </span> List(s)
                                    </>}
                                    <Icon_Button 
                                        size={25}  
                                        title={`Delete Board`}  
                                        onClick={() => deleteBoard(board)}  
                                        style={{ marginLeft: 5, marginRight: 5, }} 
                                    >
                                        <Delete className={`deleteIcon`} style={{ fontSize: 16 }} />
                                        {/* <ArrowDropDownTwoTone className={`arrowIcon`} style={{ fontSize: 20 }} /> */}
                                    </Icon_Button>
                                </div>
                            </div>
                        </div>
                        <Slider 
                            spaceBetween={1}
                            showButtons={false} 
                            className={`boardsListsSlider`} 
                            showPaginationDots={width >= 501} 
                            slidesPerView={getSlidesPerView()}
                            paginationClass={`boardListPaginationDots`}
                        >
                            {lists?.map((l: List, li: number) => (
                                <SwiperSlide key={li}>
                                    <ListComponent list={l} title={l?.name} />
                                </SwiperSlide>
                            ))}
                        </Slider>
                    </> : <></>}
                </>
            )}
        </div>
    </>
}