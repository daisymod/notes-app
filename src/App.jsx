import { useEffect, useState } from 'react'
import {nanoid} from 'nanoid'
import Editor from './components/Editor'
import Sidebar from './components/Sidebar'
import Split from "react-split"
import './App.css'
import { notesCollection, db } from '../firebase'
import { addDoc, onSnapshot, doc, deleteDoc, setDoc } from 'firebase/firestore'

/** onSnapshot listens changes in firestore and update local notes */
function App() {
  const [notes, setNotes] = useState([])
  const [currentNoteId, setCurrentNoteId] = useState("")

  const currentNote = 
    notes.find(note => note.id === currentNoteId) 
    || notes[0]

  useEffect(()=>{
    // snapShot is the most updated version of notesCollection from the database
    const unsubscribe = onSnapshot(notesCollection, function(snapShot){
      // Sync up local notes arr with the snapshot data
      const notesArr = snapShot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }))
      setNotes(notesArr)
    })
    return unsubscribe
  }, []) 

  useEffect(() => {
    if(!currentNoteId){
      setCurrentNoteId(notes[0]?.id)
    }
  }, [notes])
  
  async function createNewNote() {
    const newNote = {
      body: "# Type your markdown note's title here"
    }
    const newNoteRef = await addDoc(notesCollection, newNote)
    setCurrentNoteId(newNoteRef.id)
  }
  
  async function updateNote(text) {    
    const docRef = doc(db, "notes", currentNoteId)
    await setDoc(docRef, {body: text}, {merge: true})
  }

  async function deleteNote(noteId){
    const docRef = doc(db, "notes", noteId)
    await deleteDoc(docRef)
  }
  
  return (
    <main>
    {
      notes.length > 0 
      ?
      <Split 
        sizes={[30, 70]} 
        direction="horizontal" 
        className="split"
      >
        <Sidebar
          notes={notes}
          currentNote={currentNote}
          setCurrentNoteId={setCurrentNoteId}
          newNote={createNewNote}
          deleteNote={deleteNote}
        />
        <Editor 
          currentNote={currentNote} 
          updateNote={updateNote} 
        />
        
      </Split>
      :
      <div className="no-notes">
        <h1>You have no notes</h1>
        <button 
          className="first-note" 
          onClick={createNewNote}
        >
          Create one now
        </button>
      </div>  
    }
    </main>
  )
}

export default App
