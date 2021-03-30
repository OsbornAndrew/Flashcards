import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router";
import Breadcrumb from "./breadcrumb";
import {
  readDeck,
  readCard,
  updateCard,
  updateDeck,
  createCard,
  createDeck,
} from "../utils/api";

export default function Form(props) {
  const history = useHistory();
  const { deckId, cardId } = useParams();
  const { newItem, isDeck } = props;
  const [deck, setDeck] = useState({ cards: [], name: "", description: "" });
  const [card, setCard] = useState({ front: "", back: ""});
  const [inputsFromForm, setInputsFromForm] = useState({
    nameInput: "",
    descriptionInput: "",
  });
  const [formNames, setFormNames] = useState({
    labelFirst: "",
    labelSecond: "",
    titleNewOrEdit: "",
    titleCardOrDeck: "",
  });

  useEffect(() => {
    const abortController = new AbortController();
    if (deckId) {
      try {
        readDeck(deckId, abortController.signal).then((element) => {
          setDeck(element);
        });
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Aborted", deck);
        } else {
          throw error;
        }
      }
    }
    if (cardId) {
      try {
        readCard(cardId, abortController.signal).then((element) => {
          setCard(element);
        });
      } catch (error) {
        if (error.name === "AbortError") {
          console.log("Aborted", card);
        } else {
          throw error;
        }
      }
    }
  }, []);

  useEffect(() => {
    isDeck
      ? newItem
        ? setFormNames({
            titleNewOrEdit: "Create",
            labelFirst: "Name",
            labelSecond: "Description",
            titleCardOrDeck: "Deck",
          })
        : setFormNames({
            titleNewOrEdit: "Edit",
            labelFirst: "Name",
            labelSecond: "Description",
            titleCardOrDeck: "Deck",
          })
      : newItem
      ? setFormNames({
          titleNewOrEdit: "New",
          labelFirst: "Front",
          labelSecond: "Back",
          titleCardOrDeck: "Card",
        })
      : setFormNames({
          titleNewOrEdit: "Edit",
          labelFirst: "Front",
          labelSecond: "Back",
          titleCardOrDeck: "Card",
        });
  }, [isDeck, newItem]);

  useEffect(() => {
    if (isDeck && !newItem)
      setInputsFromForm({
        nameInput: deck.name,
        descriptionInput: deck.description,
      });
    if (!isDeck && !newItem)
      setInputsFromForm({ nameInput: card.front, descriptionInput: card.back });
  }, [isDeck, newItem, deck, card]);

  function submitHandler(event) {
    event.preventDefault();
    if (newItem && isDeck) {
      createDeck({
        name: inputsFromForm.nameInput,
        description: inputsFromForm.descriptionInput,
      });
      history.go(`/`);
    } else if (!newItem && isDeck) {
      updateDeck({
        ...deck,
        name: inputsFromForm.nameInput,
        description: inputsFromForm.descriptionInput,
        id: deckId,
      });
       history.go(`/decks/${deckId}`);
    } else if (newItem && !isDeck) {
      createCard(deckId, {
        front: inputsFromForm.nameInput,
        back: inputsFromForm.descriptionInput,
      });
      history.go(0);
    } else {
      updateCard({
        ...card,
        front: inputsFromForm.nameInput,
        back: inputsFromForm.descriptionInput,
      });
      history.go(`/decks/${deckId}`);
    }
  }

function handleChange(event){
  event.preventDefault()
  setInputsFromForm({
    ...inputsFromForm,
    [event.target.name]: event.target.value,
  })
}

  function textAreaOrNot(whatIsIt, formNames) {
    if (whatIsIt) {
      return (
        <div className="form-group">
          <label htmlFor="deckName">{formNames.labelFirst}</label>
          <input
            placeholder="Deck Name"
            className="form-control"
            type="text"
            id="deckName"
            name="nameInput"
            value={inputsFromForm.nameInput}
            onChange={handleChange}
          ></input>
        </div>
      );
    } else {
      return (
        <div className="form-group">
          <label htmlFor="firstTextArea">{formNames.labelFirst}</label>
          <textarea
            className="form-control"
            id="firstTextArea"
            name="nameInput"
            placeholder="Front side of card"
            value={inputsFromForm.nameInput}
            onChange={handleChange}
          ></textarea>
        </div>
      );
    }
  }
  return (
    <section className="container">
      <Breadcrumb
        newItem={newItem}
        isDeck={isDeck}
        deckId={deckId}
        cardId={cardId}
        deck={deck}
      />
      <h1>{`${formNames.titleNewOrEdit} ${formNames.titleCardOrDeck}`}</h1>
      <form>
        {textAreaOrNot(isDeck, formNames)}
        <div className="form-group">
          <label htmlFor="secondTextArea">{formNames.labelSecond}</label>
          <textarea
            className="form-control"
            id="secondTextArea"
            name="descriptionInput"
            placeholder={isDeck ? "Description of deck" : "Back side of card"}
            value={inputsFromForm.descriptionInput}
            onChange={handleChange}
          ></textarea>
        </div>
        <div>
          <button
            className="btn btn-secondary"
            onClick={() =>
              isDeck ? history.go("/") : history.go(`/decks/${deckId}`)
            }
          >
            {newItem ? "Done" : "Cancel"}
          </button>
          <button
            className="btn btn-primary mx-2"
            onClick={(event) => submitHandler(event)}
          >
            {newItem ? "Save" : "Submit"}
          </button>
        </div>
      </form>
    </section>
  );
}
