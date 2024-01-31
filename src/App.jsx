import { useEffect, useState } from 'react'
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
  const [tempNoteText, setTempNoteText] = useState("")

  const currentNote = 
    notes.find(note => note.id === currentNoteId) 
    || notes[0]

  const sortedNotes = notes.sort(function(a, b){
    // a - one note obj and b - other note obj
    return b.updatedAt - a.updatedAt;
  })

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

  useEffect(() => {
    if(currentNote){
      setTempNoteText(currentNote.body)
    }
  }, [currentNote])

  /**
   * Effect runs any time the tempNoteText changes
   * Delaying requests to the Firestore
   * setTimeout(f(), how long to wait)
   * clearTimeout to cancel the timeout to eliminate
   * side effects, so new timeout will be created 
   * when the tempNoteText changes
   */
  useEffect(()=>{
    const timeoutId = setTimeout(()=>{
      if(tempNoteText !== currentNote.body){
        updateNote(tempNoteText)
      }
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [tempNoteText])

  
  async function createNewNote() {
    const newNote = {
      body: "# Note",
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    const newNoteRef = await addDoc(notesCollection, newNote)
    setCurrentNoteId(newNoteRef.id)
  }
  
  async function updateNote(text) {  
    // db request is being triggered on every keystroke thus need debiuncing
    const docRef = doc(db, "notes", currentNoteId)
    await setDoc(
      docRef, 
      {body: text, updatedAt: Date.now()}, 
      {merge: true}
    )
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
          notes={sortedNotes}
          currentNote={currentNote}
          setCurrentNoteId={setCurrentNoteId}
          newNote={createNewNote}
          deleteNote={deleteNote}
        />
        <Editor 
          tempNoteText={tempNoteText} 
          setTempNoteText={setTempNoteText} 
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
