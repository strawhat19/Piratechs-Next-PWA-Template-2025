'use client';

import Logo from '../logo/logo';
import Slider from '../slider/slider';
import Loader from '../loaders/loader';
import { toast } from 'react-toastify';
import ListComponent from './list/list';
import BoardForm from './form/board-form';
import { SwiperSlide } from 'swiper/react';
import { Types } from '@/shared/types/types';
import { StateGlobals } from '@/shared/global-context';
import { useContext, useEffect, useState } from 'react';
import Icon_Button from '../buttons/icon-button/icon-button';
import { createData } from '@/shared/types/models/Properties';
import { Board as BoardModel } from '@/shared/types/models/Board';
import { ArrowDropDownTwoTone, Settings } from '@mui/icons-material';
import { addBoardToDatabase, deleteBoardFromDatabase } from '@/shared/server/firebase';
import { constants, countPropertiesInObject, logToast } from '@/shared/scripts/constants';

export default function Board() {
    const { user, width, loaded, usersLoading, boardForm } = useContext<any>(StateGlobals);

    let [lists, setLists] = useState([]);

    useEffect(() => {
        if (user != null) {
            if (user?.data?.board?.lists) {
                setLists(user?.data?.board?.lists);
            }
        }
    }, [user?.data?.board])

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
        let data = createData(name, Types.Board, user, user?.data?.boards);
        let newBoard = new BoardModel(data);
        logToast(`Adding Board`, newBoard);
        newBoard.properties = countPropertiesInObject(newBoard);
        await addBoardToDatabase(newBoard, user).then(async response => {
            return response;
        }).catch(signUpAndSeedError => {
            let errorMessage = `Error on Create Board`;
            console.log(errorMessage, signUpAndSeedError);
            toast.error(errorMessage);
            return;
        });
    }

    const deleteBoard = async (brd: BoardModel) => {
        logToast(`Deleting Board`, brd);
        await deleteBoardFromDatabase(brd, user).then(async response => {
            return response;
        }).catch(signUpAndSeedError => {
            let errorMessage = `Error on Delete Board`;
            console.log(errorMessage, signUpAndSeedError);
            toast.error(errorMessage);
            return;
        });
    }

    return <>
        <div className={`boardComponent ${user != null ? `boardLists_${lists?.length}` : ``}`}>
            {(usersLoading || !loaded) ? (
                <Loader height={450} label={`Board Loading`} style={{ maxWidth: `calc(var(--wdth) + 1%)`, margin: `0 auto` }} />
            ) : (
                <>
                    {(user != null && user?.data?.board?.userID) ? <>
                        <div className={`boardTopComponent`}>
                            <div className={`boardTopRow boardFormContainer boardListTitle spaceBetween`}>
                                <div className={`boardTopStart fitMin`}>
                                    <Logo label={user?.data?.board?.name} />
                                </div>
                                <div className={`boardTopMid fullWidth`}>
                                    <BoardForm boardSearch={true} showIconButton={width >= constants?.breakpoints?.mobile} />
                                </div>
                                <div className={`boardTopEnd fitMin flexCenter gap5`}>
                                    <Icon_Button title={`Board Settings`} style={{ marginRight: 5 }}>
                                        <Settings className={`settingsIcon`} style={{ fontSize: 20 }} />
                                    </Icon_Button>
                                    {width > 768 && <>
                                        <span className={`main`}>
                                            {lists?.length}
                                        </span> List(s)
                                    </>}
                                    <Icon_Button onClick={() => deleteBoard(user?.data?.board)} size={25} title={`Boards`} style={{ marginLeft: 5, marginRight: 5, }}>
                                        <ArrowDropDownTwoTone className={`arrowIcon`} style={{ fontSize: 20 }} />
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
                            {lists?.map((l: any, li: number) => (
                                <SwiperSlide key={li}>
                                    <ListComponent title={l?.name} />
                                </SwiperSlide>
                            ))}
                        </Slider>
                    </> : <></>}
                    <div className={`boardBottomComponent boardTopComponent`}>
                        <div className={`boardTopRow boardFormContainer boardListTitle spaceBetween`}>
                            <div className={`boardTopStart fitMin`}>
                                <Logo label={`New Board`} />
                            </div>
                            <div className={`boardTopMid fullWidth`}>
                                <BoardForm onClick={addBoard} newBoardForm={true} showIconButton={width >= constants?.breakpoints?.mobile} />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    </>
}