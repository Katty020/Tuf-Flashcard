
import "./css/OverlayWindow.css"
import "./css/Utility.css"

export default function OverlayWindowMcOption(props) {

    function closeButton() {
        if (props.counter > 1) {
            return (
                <button className="ft-3 mcoption-close" onClick={() => props.deleteMcOption(props.counter)}>X</button>
            )
        }
    }

    function radioChecked(e) {
        props.checkAction()
    }

    let firstChecked = false;
    if (props.counter == 0) {
        firstChecked = true;
    }

    return (
        <div className="horizontal-container ">
            <input className="mcoption-radio wh-4" aria-label="Tick if correct answer" type="radio" name="mc-option-radio" onClick={radioChecked} defaultChecked={firstChecked}></input>
            <textarea className="ft-3 overlay-textarea mcoption-textarea" aria-label="Multiple choice text input" onChange={(e) => { props.onMcTextChange(e) }} value={props.text}></textarea>
            {closeButton()}
        </div>
    )
}