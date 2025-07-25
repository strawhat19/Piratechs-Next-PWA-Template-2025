import './stock.scss';

import Img from '../../image/image';
import IconText from '../../icon-text/icon-text';

export default function Stock({ 
    symbol = `AAPL`, 
    price = 99999.99, 
    className = `stockComponent`, 
    logo = `https://images.financialmodelingprep.com/symbol/${symbol}.png`, 
}: any) {
    return (
        <div className={`stockContainer ${className}_container`}>
            <div className={`stock ${className}`}>
                <div className={`stockSymbol`}>
                    {symbol}
                </div>
                <div className={`stockImage`}>
                    <Img className={`logo`} src={logo} alt={name} width={`auto`} height={25} />
                </div>
                <div className={`stockPrice`}>
                    <IconText dollarSign number={price} />
                </div>
            </div>
        </div>
    )
}