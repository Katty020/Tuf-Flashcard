import "./css/OverlayWindow.css"
import "./css/Utility.css"

import OverlayWindowMcOption from "./OverlayWindowMcOption.jsx"
import { useEffect, useRef, useState } from "react";

export default function OverlayWindow(props) {
    // Initial splash screen
    function splashWindow() {
        localStorage.setItem("newUser", "notNew");

        return (
            <>
                <p className="text-white ft-2 my-1">Made by <a className="text-white" href="">Aryan Katiyar</a></p>
                <p className="text-white ft-2 my-1">The program automatically saves your changes to local storage</p>
                <p className="text-white ft-2 my-1">To fully save your flashcards, click the save button to download</p>
                <p className="text-white ft-2 my-1">This JSON file can then be used through the load button, allowing you to have multiple sets of cards</p>
                <p className="text-white ft-2 my-1">To see this information again, click about</p>


                <p className="text-white ft-2">Load a set to continue</p>
                <button className="ft-2" onClick={() => { props.defaultCards(); props.resetOverlay() }}>Load example set of flashcards</button>
                <button className="ft-2" onClick={() => { props.emptyCards(); props.resetOverlay() }}>Load empty set of flashcards</button>
                {props.loadFileControls()}
            </>
        )
    }

    // From the create cards button
    function createEditCardWindow() {
        // Create or edit mode
        const [createOrEdit, updateCreateOrEdit] = useState("Create")
        // References for front and back
        const frontRef = useRef(null);
        const backRef = useRef(null);
        // If multiple choice is checked
        const [mcChecked, updateMcChecked] = useState(false);
        // Number for key of multiple choices
        const [mcCounter, updateMcCounter] = useState(0);
        // The multiple choice options added by the user
        const [mcOptions, updateMcOptions] = useState([]);
        // Used to track the text of all multiple choice options, provides controlled input for options
        // The multiple choice option the user checks as correct
        const [correctChecked, updateCorrectChecked] = useState(false);

        let existingAnswers = [];
        let localFlashcards = props.stateFlashcards
        let localFlashcardNum = props.flashcardNum
        let currentFlashcard = localFlashcards[localFlashcardNum];

        // This is used when deleting options as a means of acessing the current version of state, previously the callback was using outdated state
        const optionsRef = useRef();
        optionsRef.current = mcOptions;

        // Create and edit modes
        function callCreateOrEdit() {
            let args = []
            // If mcChecked then more data is sent as an arg
            if (mcChecked) {
                // Assigning correctAnswer to the index matching correctChecked, if there is no match assign it to 1 to prevent errors
                let correctAnswer = 1;
                for (let i in mcOptions) {
                    if (mcOptions[i].key == correctChecked) {
                        // +1 because the logic for multiple choice is not zero indexed
                        correctAnswer = Number(i) + 1;
                    }
                }

                const multipleChoiceAnswers = [];
                for (let i in mcOptions) {
                    multipleChoiceAnswers.push({ "mca": mcOptions[i].text });
                }

                args = [frontRef.current.value, backRef.current.value, mcChecked.toString(), multipleChoiceAnswers, correctAnswer]
            } else {
                args = [frontRef.current.value, backRef.current.value]
            }
            createOrEdit === "Create" ? props.createCards(...args) : props.editCard(...args)
        }

        function editMode(localFlashcardNum) {
            // So that if a bad number is passed in, it does not crash
            if (localFlashcardNum < localFlashcards.length) {
                currentFlashcard = localFlashcards[localFlashcardNum];
            }
            else {
                currentFlashcard = localFlashcards[0];
            }

            let blankOptions = resetMultipleChoice();
            updateCreateOrEdit("Edit");
            frontRef.current.value = currentFlashcard.front;
            backRef.current.value = currentFlashcard.back;
            updateMcChecked(() => currentFlashcard.multipleChoice === "true");
            addExistingMultipleChoiceOptions("Edit", blankOptions);
        }

        function createMode() {
            resetMultipleChoice();
            updateCreateOrEdit("Create");
            frontRef.current.value = "";
            backRef.current.value = "";
        }

        // Navigation
        function localNextCard() {
            localFlashcardNum = props.next(null, localFlashcardNum, true);
            currentFlashcard = localFlashcards[localFlashcardNum]
            // Resets values for next card
            resetMultipleChoice();
            editMode(localFlashcardNum);
        }

        function localPrevCard() {
            localFlashcardNum = props.prev(null, localFlashcardNum, true);
            currentFlashcard = localFlashcards[localFlashcardNum]
            // Resets values for next card
            resetMultipleChoice();
            editMode(localFlashcardNum);
        }

        function editNavigation() {
            if (createOrEdit === "Edit") {
                return (
                    <div className="horizontal-container">
                        <button className="ft-3" aria-label="Previous card" onClick={localPrevCard}>{"<"}</button>
                        <button className="ft-3" aria-label="Next card" onClick={localNextCard}>{">"}</button>
                    </div>
                )
            }
        }

        // Multiple choice related functions
        // For controlled input of textarea in OverlayWindowMcOption
        function onMcTextChange(iKey, iValue) {
            // Updates mcOptions, if the key matches the input key then the text is set to the input value
            updateMcOptions((prevMcText) =>
                prevMcText.map((input) => input.key === iKey ? { ...input, text: iValue } : input));
        }

        function addMcOption(e, keyCounter = mcCounter, initialText = "") {
            updateMcOptions((prevOptions) => [...prevOptions, { key: keyCounter, text: initialText }])
            updateMcCounter(keyCounter + 1);
        }

        // Delete an option based on index
        function deleteMcOption(key) {
            // Remove from options if it matches key
            updateMcOptions((prevOptions) => prevOptions.filter((input) => input.key !== key))
        }

        function addExistingMultipleChoiceOptions(editMode = createOrEdit, latestOptions = mcOptions) {
            if (editMode === "Edit" && currentFlashcard.multipleChoice === "true" && currentFlashcard.multipleChoiceAnswers != undefined) {
                if (latestOptions === undefined || latestOptions.length < currentFlashcard.multipleChoiceAnswers.length) {
                    resetMultipleChoice();
                    updateMcChecked(() => true);

                    existingAnswers = currentFlashcard.multipleChoiceAnswers;

                    // can't rely on state
                    let tempCounter = 0;
                    for (let i in existingAnswers) {
                        addMcOption(null, tempCounter, existingAnswers[i]["mca"]);
                        tempCounter += 1;
                    }
                    updateMcCounter(() => tempCounter);
                }
            }
        }

        function resetMultipleChoice() {
            updateMcOptions(() => []);
            updateMcCounter(() => 0);
            updateMcChecked(() => false);
            updateCorrectChecked(() => false)
            return ([]);
        }

        function getComponentOptions() {
            const displayVersion =
                mcOptions.map((input) => {
                    return <OverlayWindowMcOption
                        key={input.key}
                        counter={input.key}
                        text={input.text}
                        deleteMcOption={deleteMcOption}
                        checkAction={() => { updateCorrectChecked(() => input.key) }}
                        onMcTextChange={(e) => { onMcTextChange(input.key, e.target.value) }}
                    />
                });
            return (displayVersion)
        }

        function addMcControls() {
            if (mcChecked) {
                if (currentFlashcard.multipleChoiceAnswers != undefined) {
                    existingAnswers = currentFlashcard.multipleChoiceAnswers;
                }

                if (existingAnswers.length < 2 && mcOptions.length < 2 || createOrEdit === "Create" && mcOptions.length < 2) {
                    // Negative numbers to fix an issue where the latest state was not displaying. I think because the keys were the same it did not update.
                    addMcOption(null, 0);
                    addMcOption(null, 1);
                }

                return (
                    <>
                        <fieldset>
                            <legend className="text-white ft-1 allign-left" >Check the button of the correct answer</legend>
                            {getComponentOptions()}
                        </fieldset>

                        <button className="ft-3 overlay-button responsive-width self-center" onClick={addMcOption}>Add option</button>
                    </>
                )
            }
        }

        function checkedMc(e) {
            resetMultipleChoice();
            updateMcChecked(e.target.checked)
            addExistingMultipleChoiceOptions();
        }

        // UI functions
        function deleteButtonIfEdit() {
            if (createOrEdit === "Edit") {
                return (
                    <button className="ft-3 responsive-width self-center" onClick={localDeleteCard}>Delete</button>
                )
            }
        }

        function localDeleteCard() {
            const deleteReturn = props.deleteCard(localFlashcardNum, localFlashcards);
            localFlashcardNum -= 1;
            // Not false (Delete happened)
            if (deleteReturn) {
                localFlashcards = deleteReturn;
                localNextCard();
            }
        }



        return (
            <>
                <div className="horizontal-container">
                    <button className="ft-2" aria-label="Create mode" onClick={createMode}>Create mode</button>
                    <span className="text-white ft-2"> | </span>
                    <button className="ft-2" aria-label="Edit mode" onClick={() => editMode(localFlashcardNum)}>Edit mode</button>
                </div>

                <div className="overlay-input-section">
                    <label className="text-white ft-3">Front</label>
                    <textarea className="ft-3 overlay-textarea" aria-label="Card front input" id="create-front-input" ref={frontRef}></textarea>

                    <label className="text-white ft-3">Back</label>
                    <textarea className="ft-3 overlay-textarea" aria-label="Card back input" id="create-back-input" ref={backRef}></textarea>

                    {/* adds navigation for when in edit mode */}
                    {editNavigation()}

                    {/* edit mode button for deleting card */}
                    {deleteButtonIfEdit()}

                    <div className="horizontal-container">
                        <label className="text-white ft-3" htmlFor="mc-checkbox">Multiple choice?</label>
                        <input type="checkbox" id="mc-checkbox" checked={mcChecked} onChange={checkedMc} className="wh-1 overlay-checkbox" />
                    </div>

                    {/* adds controls for adding multiple choice questions */}
                    {addMcControls()}

                    <button className="ft-3 overlay-button responsive-width self-center" onClick={callCreateOrEdit}>{createOrEdit} card</button>
                </div>
            </>
        )
    }

    function loadWindow() {
        return (
            <>
                <button className="ft-2 overlay-load-button" onClick={props.emptyCards}>Load Empty Set</button>
                <button className="ft-2 overlay-load-button" onClick={props.defaultCards}>Load Example Set</button>
                {props.loadFileControls()}
            </>
        )
    }


    // No close button during splash screen, a set has to be loaded to close it
    function displayCloseButton() {
        if (props.overlayMode != "splash") {
            return (
                <button className="overlay-close ft-3" aria-label="Close window" onClick={props.resetOverlay}>X</button>
            )
        }
    }

    function setOverlayContent() {
        switch (props.overlayMode) {
            case "splash":
                return splashWindow();
            case "create":
                return createEditCardWindow();
            case "load":
                return loadWindow();
            case "stats":
                return statsWindow();
            case "about":
                return aboutWindow();
            default:
                break;
        }
    }

    return (
        <>
            <div className="background-blur" />
            <section className="overlay-window responsive-width">
                {displayCloseButton()}
                {setOverlayContent()}
            </section>
        </>
    )
}