import { constants } from "@/shared/scripts/constants";

export default function Styles() {
    return (
        <section className={`typography flex column gap15 w75 mxauto`}>
            <h1 className={`center main`}>
                <i>Styles</i>
            </h1>

            <h2 className={`center main`}>
                <i>Font: {constants?.fonts?.sansSerif?.plusJakartaSans}</i>
            </h2>

            <h1>Header 1</h1>
            <h2>Header 2</h2>
            <h3>Header 3</h3>
            <h4>Header 4</h4>
            <h5>Header 5</h5>
            <h6>Header 6</h6>

            <a href={`#`}>
                Link
            </a>

            <p>
                This is a paragraph. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                <strong> Strong text</strong>, <em>emphasized text</em>. Lorem ipsum dolor sit, amet consectetur adipisicing elit. Impedit obcaecati ea sed pariatur! Nihil corporis et sapiente pariatur! Tempore qui nostrum provident!
            </p>

            {/* <small>This is small text.</small> */}

            <div className={`buttons grid gridRow gap5 alignCenter`}>
                <button>Button</button>
                <button>Button</button>
                <button>Button</button>
            </div>

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