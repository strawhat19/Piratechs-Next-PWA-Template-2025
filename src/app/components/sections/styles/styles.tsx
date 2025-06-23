'use client';

import { useContext } from 'react';
import { Button } from '@mui/material';
import { State } from '../../container/container';
import { constants } from '@/shared/scripts/constants';

export default function Styles() {
    let { menuExpanded } = useContext<any>(State);
    return (
        <section className={`typography flex column gap15 w75 mxauto`}>
            <h2 className={`center main`}>
                <i>Styles</i>
            </h2>

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

            <p className={`center textAlignCenter ${menuExpanded ? `lineClamp3` : `lineClamp5`}`}>
                This is a paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                <strong> Strong text</strong>, <em>emphasized text</em>. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Impedit obcaecati ea sed pariatur! Nihil corporis et sapiente pariatur! Tempore qui nostrum provident!
            </p>

            {/* <small>This is small text.</small> */}

            {/* <ul>
                <li>Unordered list item 1</li>
                <li>Unordered list item 2</li>
            </ul>

            <ol>
                <li>Ordered list item 1</li>
                <li>Ordered list item 2</li>
            </ol>

            <blockquote>
                This is a blockquote. “Typography is the craft of endowing human language with a durable visual form.” - Robert Bringhurst
            </blockquote>

            <pre>
                <code>
                    {`
                        CODE BLOCKS

                        const greeting = "Hello, world!";
                        console.log(greeting);
                    `}
                </code>
            </pre>

            <hr /> */}
        </section>
    )
}