import Table from '../table/table';
// import { useContext } from 'react';
// import { StateGlobals } from '@/shared/global-context';

export default function Store({ className = `storeComponent` }) {
    // const { user, width } = useContext<any>(StateGlobals);
    return (
        <div className={`stocksContainer w95 ${className}`}>
            <Table />
        </div>
    )
}