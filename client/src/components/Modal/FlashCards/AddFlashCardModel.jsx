import { useState } from "react";
import { useFlashCardsContext } from "../../../contexts/flashcardContext";
import { useUrl } from "../../../contexts/urlContext";
import { useAsyncFn } from "../../../hooks/useAsync";
import { createFlashCard } from "../../../services/flashCards";

export default function AddFlashCardModal({
  handleModalOpen,
  initialValue = "",
}) {
  const { cardIdParam, subjectIdParam } = useUrl();
  const [question, setQuestion] = useState(initialValue);
  const [solution, setSolution] = useState(initialValue);

  const {
    loading,
    error,
    execute: createFlashCardFn,
  } = useAsyncFn(createFlashCard);
  const { createLocalFlashCard } = useFlashCardsContext();

  function onFlashCardCreate(e) {
    e.preventDefault();
    return createFlashCardFn({
      cardId: cardIdParam,
      subjectId: subjectIdParam,
      question,
      solution,
    }).then((result) => {
      createLocalFlashCard(result);
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
          onClick={onFlashCardCreate}
        >
          Create
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
