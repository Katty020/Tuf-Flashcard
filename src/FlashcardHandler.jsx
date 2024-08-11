import { useState, useEffect, useRef } from "react"

import "./css/FlashcardHandler.css"
import "./css/Utility.css"

import Flashcard from "./Flashcard.jsx"
import OverlayWindow from "./OverlayWindow.jsx"

const defaultFlashcards = [
    {
        "front": "How is TUF+ different from TUF?",
        "back": "TUF is a fantastic resource, but TUF+ offers a completely different experience. TUF+ is a comprehensive course with an integrated platform, whereas TUF aggregates resources from various platforms",
    },
    {
        "front": "Which Platform Is Best For Coding?",
        "back": "Every platform Is Best. It is Up to you and your efforts to learn things",
        "multipleChoice": "true",
        "multipleChoiceAnswers": [
            { "mca": "TUF+" },
            { "mca": "Code-Help" },
            { "mca": "AlgoPrepX" },
            { "mca": "All the above" }
        ],
        "correctAnswer": "4"
    },
    {
        "front": "Do we have support for TUF+ users?",
        "back": "Yes, we offer dedicated support for TUF+ users. There is a separate section for reporting bugs, and our dedicated team resolves issues within 24-72 hours."
    },
    {
        "front": "Can a beginner with no prior knowledge use TUF+?",
        "back": "Absolutely! We have a dedicated section to help beginners build the foundational knowledge needed to tackle the 300-question list."
    },
    {
        "front": "Is TUF+ suitable for working professionals looking to upskill quickly?",
        "back": "Yes, the curated list of 300 questions is ideal for working professionals. The approach breakdown section wise in the videos and editorials allows you to skip over well-known concepts and focus on the areas that matter most to you. Shorter videos are easier to complete."
    },
    {
        "front": "Does TUF+ cover everything in the A2Z series?",
        "back": "Yes, TUF+ includes everything from the A2Z series and more. We have ensured that all problems are properly aligned with our learning approach, unlike some third-party platforms."
    },
    {
        "front": "Will future features be available to existing TUF+ users?",
        "back": "Yes, we have several new features planned for release over the next few months, and they will be available at no additional cost to our existing users."
    }
]

const emptyFlashcards = [
    {
        "front": "Your Question?",
        "back": "Answer"
    },
    {
        "front": "Front",
        "back": "Back"
    }
]

export default function FlashcardHandler() {
    const [flashcardNum, updateFlashcardNum] = useState(0);
    const errorMsgRef = useRef(null);
    // can be none, splash, create, save, load, stats, about
    const [stateOverlayMode, updateOverlayMode] = useState("none");
    let overlayMode = "";
    // 0 by default (Sequential navigation, changes when overlay is opened)
    let overlayTabIndex = 0;

    function initialFlashcards() {
        let validFlashcards = true;
        try {
            JSON.parse(localStorage.getItem("flashcards"))[0].front;
        }
        catch (error) {
            validFlashcards = false;
        }

        if (validFlashcards) {
            return JSON.parse(localStorage.getItem("flashcards"));
        }
        return emptyFlashcards;
    }

    const [stateFlashcards, updateStateFlashcards] = useState(initialFlashcards());

    let amountOfFlashcards = stateFlashcards.length;

    // If no newUser in local storage
    if (localStorage.getItem("newUser") === null) {
        overlayMode = "splash"
    }
    else {
        overlayMode = stateOverlayMode;
    }

    // Function for updating stats
    // Stats are created, edited, viewed, correctAnswers
    function statUpdate(stat, change = 1) {
        if (localStorage.getItem(stat) === null) {
            localStorage.setItem(stat, change);
        }
        else {
            localStorage.setItem(stat, Number(localStorage.getItem(stat)) + change)
        }
    }

    // Navigation functions
    function prevCard(e, iNum = flashcardNum, editMode = false) {
        if (!editMode) {
            statUpdate("viewed")
        }
        amountOfFlashcards = stateFlashcards.length;
        if (iNum > 0) {
            iNum -= 1;
        }
        else {
            iNum = amountOfFlashcards - 1;
        }
        updateFlashcardNum(() => iNum)
        return iNum;
    }

    function nextCard(e, iNum = flashcardNum, editMode = false) {
        if (!editMode) {
            statUpdate("viewed")
        }
        amountOfFlashcards = stateFlashcards.length;
        if (iNum < amountOfFlashcards - 1) {
            iNum += 1;
        }
        else {
            iNum = 0;
        }
        updateFlashcardNum(() => iNum)
        return iNum;
    }

    // Create/edit functions
    function createCards(iFront, iBack, iMultipleChoice = false, iMultipleChoiceAnswers = [], iCorrectAnswer = 1) {
        statUpdate("created")
        let extraArgs = {};
        if (iMultipleChoice) {
            extraArgs = {
                multipleChoice: iMultipleChoice,
                multipleChoiceAnswers: iMultipleChoiceAnswers,
                correctAnswer: iCorrectAnswer
            }
        }
        updateStateFlashcards(
            [...stateFlashcards, {
                front: iFront,
                back: iBack,
                ...extraArgs
            }]
        )
    }

    function editCard(iFront, iBack, iMultipleChoice = false, iMultipleChoiceAnswers = [], iCorrectAnswer = 1) {
        statUpdate("edited")
        updateStateFlashcards(prevState => {
            const tempArr = [...prevState];
            tempArr[flashcardNum].front = iFront;
            tempArr[flashcardNum].back = iBack;
            if (iMultipleChoice) {
                tempArr[flashcardNum].multipleChoice = iMultipleChoice;
                tempArr[flashcardNum].multipleChoiceAnswers = iMultipleChoiceAnswers;
                tempArr[flashcardNum].correctAnswer = iCorrectAnswer;
            }
            return tempArr;
        });
    }

    function deleteCard(num, childFlashcards) {
        let amountOfFlashcards = childFlashcards.length;

        if (amountOfFlashcards > 2 && num <= amountOfFlashcards - 1) {
            childFlashcards.splice(num, 1);
            updateStateFlashcards((stateFlashcards) => childFlashcards);
            if (flashcardNum < stateFlashcards.length) {
                updateFlashcardNum((flashcardNum) => flashcardNum - 1)
            }
            else {
                updateFlashcardNum(() => 0);
            }
            localStorageCardSave();
            return childFlashcards
        } else {
            console.log("Can not go below 2 flashcards")
            return false
        }
    }

    // Save function
    function saveCards() {
        const a = document.createElement("a");
        const file = new Blob([JSON.stringify(stateFlashcards)]);
        a.href = URL.createObjectURL(file);
        a.download = "flashcards.json";
        a.click();
    }

    // Load functions
    function defaultCards() {
        updateFlashcardNum(0);
        updateStateFlashcards([...defaultFlashcards]);
    }

    function emptyCards() {
        updateFlashcardNum(0);
        // Spread operator to create a copy, otherwise it is not seen as different from the default and no re-render happens
        updateStateFlashcards([...emptyFlashcards]);
    }

    function loadFromFile(event) {
        // Prevents page refresh
        event.preventDefault();

        const fileInput = event.target.elements.fileInput;
        const file = fileInput.files[0];

        // If there's a file, use FileReader api to parse the data
        if (file) {
            const reader = new FileReader();
            let syntaxValid = true;
            let contentValid = true;

            reader.onload = (e) => {
                let data = "";
                try {
                    data = JSON.parse(e.target.result);
                    console.log('Loaded data:', data);
                } catch (error) {
                    console.log(error);
                    errorMsgRef.current.style = ("color: rgb(255, 56, 56)");
                    errorMsgRef.current.textContent = error;
                    syntaxValid = false;
                }

                if (syntaxValid) {
                    try {
                        data[0].front;
                    }
                    catch (error) {
                        console.log(error);
                        contentValid = false;
                        errorMsgRef.current.style = ("color: rgb(255, 56, 56)");
                        errorMsgRef.current.textContent = "Invalid data in JSON file";
                    }
                }

                if (syntaxValid && contentValid) {
                    updateStateFlashcards(data);
                    errorMsgRef.current.style = ("color: white");
                    errorMsgRef.current.textContent = "Loaded file";
                }
            };
            reader.readAsText(file);
        }
    };

    // controls for the loading file windows
    function loadFileControls() {
        return (
            <>
                <form name="load-file-form" className="load-file-form" onSubmit={loadFromFile}>
                    <input className="ft-2 text-white load-file-form-element" aria-label="Choose file" id="fileInput" name="fileInput" type="file" accept=".json"></input>
                    <button className="ft-2 overlay-load-button load-file-form-element" type="submit">Load From File</button>
                </form>
                <p className="ft-2" ref={errorMsgRef}></p>
            </>)
    };

    // General overlay functions
    function resetOverlay() {
        updateOverlayMode("none");
        overlayMode = stateOverlayMode;
    }

    function localStorageCardSave() {
        localStorage.setItem("flashcards", JSON.stringify(stateFlashcards));
    }

    function renderOverlay() {
        // if overlay mode is not none, return the overlayWindow component, else return empty fragment
        if (overlayMode != "none") {
            overlayTabIndex = -1;
            return (
                <OverlayWindow overlayMode={overlayMode} updateOverlayMode={updateOverlayMode} deleteCard={deleteCard} resetOverlay={resetOverlay} flashcardContent={stateFlashcards[flashcardNum]} stateFlashcards={stateFlashcards} flashcardNum={flashcardNum} editCard={editCard} createCards={createCards} defaultCards={defaultCards} emptyCards={emptyCards} loadFileControls={loadFileControls} prev={prevCard} next={nextCard} />
            )
        }
        overlayTabIndex = 0;
    }


    // Autosave when stateFlashcards changes
    useEffect(() => {
        localStorageCardSave();
    }, [stateFlashcards]);

    return (
        <main>
            {renderOverlay()}

            {/* functions for program control are passed into the component */}
            <section className="flashcard-handler">
                <Flashcard extraClasses={``} prev={prevCard} next={nextCard} flashcardContent={stateFlashcards[flashcardNum]} flashcardNum={flashcardNum} amountOfFlashcards={amountOfFlashcards} statUpdate={statUpdate} overlayTabIndex={overlayTabIndex} />
            </section>

            {/* these buttons should have labels going upwards and open a centered large closable window over the rest of the content */}
            <section className="control-bar responsive-width">
                <button className="control-button ft-3" tabIndex={overlayTabIndex} onClick={() => updateOverlayMode("create")}>Create/Edit</button>
                <button className="control-button ft-3" tabIndex={overlayTabIndex} onClick={saveCards}>Save</button>
                <button className="control-button ft-3" tabIndex={overlayTabIndex} onClick={() => updateOverlayMode("load")}>Load</button>
            </section>
        </main>
    )
}