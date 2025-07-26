'use client';

import { useContext } from 'react';
import { Button } from '@mui/material';
import Slider from '../../slider/slider';
import Loader from '../../loaders/loader';
import { SwiperSlide } from 'swiper/react';
import { State } from '../../container/container';
import { constants } from '@/shared/scripts/constants';

export default function Styles() {
    let { width, loaded, menuExpanded } = useContext<any>(State);

    const fonts = () => {
        return <>
            <h3 className={`center main`}>
                <i>Font: {constants?.fonts?.sansSerif?.plusJakartaSans}</i>
            </h3>

            <div className={`headers grid gap15`} style={{ gridTemplateColumns: `repeat(2, 1fr)` }}>
                <h1 className={`center`}>
                    Header 1
                </h1>
                <h2 className={`center`}>
                    Header 2
                </h2>
                <h3 className={`center`}>
                    Header 3
                </h3>
                <h4 className={`center`}>
                    Header 4
                </h4>
                <h5 className={`center`}>
                    Header 5
                </h5>
                <h6 className={`center`}>
                    Header 6
                </h6>
            </div>
        </>
    }

    const buttonsLinks = () => {
        return <>
            <div className={`buttons grid gridRow gap5 alignCenter`}>
                <button>Button</button>
                <button>Button</button>
                <button>Button</button>
            </div>

            <div className={`links grid gridRow gap5 alignCenter`}>
                <a href={`#`} className={`center`}>
                    Link
                </a>
                <a href={`#`} className={`center`}>
                    Link
                </a>
                <a href={`#`} className={`center`}>
                    Link
                </a>
            </div>

            <div className={`buttons grid gridRow gap5 alignCenter`}>
                <Button>Button</Button>
                <Button>Button</Button>
                <Button>Button</Button>
            </div>
        </>
    }

    const paragraph = () => {
        return <>
            <p className={`center textAlignCenter ${menuExpanded ? `lineClamp3` : `lineClamp5`}`}>
                This is a paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                <strong> Strong text</strong>, <em>emphasized text</em>. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Impedit obcaecati ea sed pariatur! Nihil corporis et sapiente pariatur! Tempore qui nostrum provident!
            </p>
        </>
    }

    return (
        <section className={`typography flex column gap15 ${width > constants?.breakpoints?.mobile ? `w75` : `w90`} mxauto`}>
            {loaded ? (
                <Slider showButtons={width > constants?.breakpoints?.mobile}>
                    <SwiperSlide>{fonts()}</SwiperSlide>
                    <SwiperSlide>{buttonsLinks()}</SwiperSlide>
                    <SwiperSlide>{paragraph()}</SwiperSlide>
                </Slider>
            ) : (
                <Loader height={150} label={`Styles Loading`} style={{ [`--animation-delay`]: `${4 * 0.15}s` }} />
            )}
        </section>
    )
}