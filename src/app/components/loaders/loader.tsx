import './loader.scss';

import { CircularProgress, LinearProgress, Skeleton } from '@mui/material';

export default function Loader(props: any) {

    let { 
        style, 
        label, 
        children, 
        width = `100%`, 
        labelSize = 14, 
        height = `100%`, 
        animation = `wave`, 
        showLoading = true,
        labelColor = `white`, 
        skeletonContainerGap = 25,
        skeletonContainerPadding = 0,
        className = `loaderComponent`, 
        skeletonContainerWidth = `97%`,
    } = props;

    return (
        <Skeleton width={width} height={height} animation={animation} className={`${className}_container loader`} style={style}>
           <div className={`${className} loader_content`}>
                {label ? (
                    <div className={`loader_label_container`} style={{ gap: skeletonContainerGap, width: skeletonContainerWidth, padding: skeletonContainerPadding }}>
                        {showLoading ? <>
                            <CircularProgress size={15} style={{ color: `var(--gameBlue)` }} />
                        </> : <></>}
                        <span className={`loader_label`}>
                            <i className={`skeleton_label ${label?.length > 45 ? `textOverflow` : ``}`} style={{ color: labelColor, fontSize: labelSize }}>
                                {label}
                            </i>
                        </span>
                        {showLoading ? <>
                            <LinearProgress style={{ width: `100%` }} color={`info`} />
                        </> : <></>}
                    </div>
                ) : children}
           </div>
        </Skeleton>
    )
}