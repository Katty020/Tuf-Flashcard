import { useState, useEffect } from "react"

import MultipleChoiceOption from "./MultipleChoiceOption.jsx";

import "./css/Flashcard.css"
import "./css/Utility.css"

export default function Flashcard(props) {
    const flashcardContent = props.flashcardContent;
    const [cardSide, updateCardSide] = useState("front");
    const [flipClass, updateFlipClass] = useState("notFlipped");
    const [fadeIn, updateFadeIn] = useState("");
    const [guessChecked, updateGuessChecked] = useState(1);
    const [gotCorrect, updateGotCorrect] = useState(false);
    const [lastNum, updateLastNum] = useState(0);

    // So that it doesn't show correct/wrong between cards
    if (props.flashcardNum != lastNum) {
        updateLastNum(() => props.flashcardNum);
        updateGotCorrect(false);
    }

    let answerFlip = "";

    function flipCard() {
        if (cardSide == "front" && flashcardContent.multipleChoice === "true") {
            if (guessChecked == flashcardContent.correctAnswer) {
                props.statUpdate("correctAnswers")
                updateGotCorrect(() => "correct");
                updateGuessChecked(() => 1)
            }
            else {
                props.statUpdate("wrongAnswers")
                updateGotCorrect(() => "wrong");
                updateGuessChecked(() => 1)
            }
        }

        flipClass === "notFlipped" ? updateFlipClass("flipped") : updateFlipClass("notFlipped");
        cardSide === "front" ? updateCardSide("back") : updateCardSide("front");
        fadeIn === "" || fadeIn === "fadeIn" ? updateFadeIn("fadeIn2") : updateFadeIn("fadeIn")
    }

    function getContent() {
        return cardSide === "front" ? flashcardContent.front : flashcardContent.back;
    }

    // Returns correct or incorrect based on state
    function MultipleChoiceStatus() {
        if (cardSide == "back") {
            if (gotCorrect === "correct") {
                return (<p className="ft-4 text-green"> Correct! </p>)
            }
            else if (gotCorrect === "wrong") {
                return (<p className="ft-4 text-red"> Wrong </p>)
            }
        }
    }

    // Coniditional return if multiple choice
    function multipleChoiceForm() {
        if (cardSide != "front") { return }
        let choices = [];

        if (flashcardContent.multipleChoice === "true") {
            answerFlip = " to check answer"

            let tempKey = 1;
            for (let i in props.flashcardContent.multipleChoiceAnswers) {
                choices.push(
                    <MultipleChoiceOption tabIndex={props.overlayTabIndex} checkAction={(guess) => updateGuessChecked(() => guess)} counter={tempKey} key={tempKey} iText={flashcardContent.multipleChoiceAnswers[i]["mca"]} />
                )
                tempKey += 1;
            }

            return (
                <>
                    <span className="divider-line"></span>
                    <fieldset className="text-white ft-3 mutliple-choice">
                        <legend className="ft-1 my-1">Tick the correct Option</legend>
                        {choices}
                    </fieldset>
                </>)
        }
    }

    function localPrevCard() {
        props.prev();
        cardSide === "back" ? flipCard() : null
        updateGuessChecked(() => 1)
    }

    function localNextCard() {
        props.next()
        cardSide === "back" ? flipCard() : null
        updateGuessChecked(() => 1)
    }

    return (
        (<div id="active-flashcard" className={`flashcard active responsive-width ${props.extraClasses} ${flipClass} ${cardSide}`}>
            <div className={`main-group ${flipClass} ${fadeIn}`}>
                {/* Multiple choice status text (Correct/Wrong) */}
                <MultipleChoiceStatus />

                {/* Main text of the flashcard, front or back*/}
                <p className="text-white ft-3 flashcard-main-text">{getContent()}</p>

                {/* Multiple choices conditionally render based on property within the flashcard, not a component because that caused refresh issues */}
                {multipleChoiceForm()}

                <p className="text-white ft-1 card-indicator">{`< ${props.flashcardNum + 1} / ${props.amountOfFlashcards} >`}</p>
            </div>

            {/* Flashcard controls */}
            <div className={`button-group ${flipClass}`}>
                <span className="divider-line"></span>
                <div className="horizontal-container">
                    <button className="ft-3" aria-label="Previous card" tabIndex={props.overlayTabIndex} onClick={localPrevCard}>{"<"}</button>
                    <button className="ft-3" aria-label="Next card" tabIndex={props.overlayTabIndex} onClick={localNextCard}>{">"}</button>
                </div>

                {/* Flip card reveals the answer on the other side */}
                <button onClick={flipCard} tabIndex={props.overlayTabIndex} className={`ft-3`}> {`Flip card${answerFlip}`}</button>
            </div>
        </div>)

    )
}