'use client';

import Logo from '../logo/logo';
import { useContext } from 'react';
import Slider from '../slider/slider';
import ListComponent from './list/list';
import BoardForm from './form/board-form';
import { SwiperSlide } from 'swiper/react';
import { Settings } from '@mui/icons-material';
import { StateGlobals } from '@/shared/global-context';
import { constants } from '@/shared/scripts/constants';
import Icon_Button from '../buttons/icon-button/icon-button';

export default function Board() {
    const { width } = useContext<any>(StateGlobals);

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

        return slidesInView;
    }

    return <>
        <div className={`boardComponent`}>
            <div className={`boardTopComponent`}>
                <div className={`boardTopRow boardFormContainer boardListTitle spaceBetween`}>
                    <div className={`boardTopStart fitMin`}>
                        <Logo label={`Board`} />
                    </div>
                    <div className={`boardTopMid fullWidth`}>
                        <BoardForm boardSearch={true} />
                    </div>
                    <div className={`boardTopEnd fitMin flexCenter gap5`}>
                        <Icon_Button title={`Board Settings`} style={{ marginRight: 5 }}>
                            <Settings className={`settingsIcon`} style={{ fontSize: 20 }} />
                        </Icon_Button>
                        {width > 768 && <>
                            <span className={`main`}>
                                {4}
                            </span> List(s)
                        </>}
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
                <SwiperSlide>
                    <ListComponent />
                </SwiperSlide>
                <SwiperSlide>
                    <ListComponent title={`Active`} />
                </SwiperSlide>
                <SwiperSlide>
                    <ListComponent title={`Blocked`} />
                </SwiperSlide>
                <SwiperSlide>
                    <ListComponent title={`Complete`} />
                </SwiperSlide>
            </Slider>
        </div>
    </>
}