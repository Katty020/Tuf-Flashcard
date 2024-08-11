import "./css/Utility.css"
import "./css/Flashcard.css"

export default function (props) {
    function radioChecked(counter) {
        props.checkAction(counter)
    }

    // So that one option always appears checked, default answer in the logic is 1
    let startChecked = props.counter === 1 ? true : false

    return (
        <div className="horizontal-container-njs">
            <input className="wh-1 self-center " tabIndex={props.tabIndex} aria-label="Check if correct" defaultChecked={startChecked} onClick={() => radioChecked(props.counter)} type="radio" name="mc-option-radio"></input>
            <p>{props.iText}</p>
        </div>
    )
}
