import { useState } from "react";
import { useFlashCardsContext } from "../../../contexts/flashcardContext";
import { useUrl } from "../../../contexts/urlContext";
import { useAsyncFn } from "../../../hooks/useAsync";
import { updateFlashCard } from "../../../services/flashCards";

export default function UpdateFlashCardModel({
  handleModalOpen,
  initialQuestion = "",
  initialSolution = "",
}) {
  const { cardIdParam, subjectIdParam, flashCardIdParam } = useUrl();
  const [question, setQuestion] = useState(initialQuestion);
  const [solution, setSolution] = useState(initialSolution);

  const {
    loading,
    error,
    execute: updateFlashCardFn,
  } = useAsyncFn(updateFlashCard);
  const { updateLocalFlashCard } = useFlashCardsContext();

  function onFlashCardUpdate(e) {
    e.preventDefault();
    return updateFlashCardFn({
      cardId: cardIdParam,
      subjectId: subjectIdParam,
      flashCardId: flashCardIdParam,
      question,
      solution,
    }).then((result) => {
      updateLocalFlashCard(flashCardIdParam, result);
      handleModalOpen();
    });
  }

  return (
    <div className="modal__wrapper large">
      <div className="modal__titlebar_wrapper">
        <button className="modal__btn btn" onClick={handleModalOpen}>
          Cancel
        </button>
        <div className="modal_titlebar">New FlashCard</div>
        <button
          className="modal__btn btn"
          disabled={loading}
          onClick={onFlashCardUpdate}
        >
          Update
        </button>
      </div>
      <div className="modal__content_container">
        <div className="modal__textarea_container">
          <label htmlFor="question">Question</label>
          <textarea
            id="question"
            className="modal__textarea question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Your Question"
            autoFocus
          />
          <label htmlFor="solution">Solution</label>
          <textarea
            id="solution"
            className="modal__textarea solution"
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Your Solution"
            type="text"
          />
          {error && error}
        </div>
      </div>
    </div>
  );
}
