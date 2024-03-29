import { useEffect, useState } from 'react'
import {nanoid} from 'nanoid'
import Editor from './components/Editor'
import Sidebar from './components/Sidebar'
import Split from "react-split"
import './App.css'

function App() {
  /**
   * Lazily initialization of `notes` state so it doesn't
   * reach into localStorage on every single re-render
   * of the App component
   * uncomment to see difference between both lines
   */ 
  // const [state, setState] = useState(console.log('init'))
  // const [state, setState] = useState(() => console.log('init'))

  // relying on localStorage
  const [notes, setNotes] = useState( function(){
    return JSON.parse(localStorage.getItem('notes')) || []
  })
  const [currentNoteId, setCurrentNoteId] = useState(
    // (notes[0] && notes[0].id) || ""
    (notes[0]?.id) || ""
  )

  const currentNote = 
    notes.find(note => note.id === currentNoteId) 
    || notes[0]

  /** effect runs when notes are changed */ 
  useEffect(()=>{
    localStorage.setItem('notes', JSON.stringify(notes))
  }, [notes]) 

  function createNewNote() {
    const newNote = {
      id: nanoid(),
      body: "# Type your markdown note's title here"
    }
    setNotes(prevNotes => [newNote, ...prevNotes])
    setCurrentNoteId(newNote.id)
    localStorage.setItem(newNote.id, JSON.stringify(newNote))
  }
  
  function updateNote(text) {    
    // setNotes(oldNotes => {
    //   /** this does not rearrange the notes */ 
    //   oldNotes.map(oldNote => {
    //     return oldNote.id === currentNoteId
    //       ? { ...oldNote, body: text }
    //       : oldNote
    //   })
    // })

    /** rearranging edited note to the top */
    // setNotes(oldNotes => { 
    //   let j = 1
    //   const newArr = []
    //   for (let i = 0; i < oldNotes.length; i++) {
    //     if(oldNotes[i].id === currentNoteId) {
    //       newArr[0] = oldNotes[i]
    //       newArr[0].body = text
    //     }else {
    //       newArr[j] = oldNotes[i]
    //       j++
    //     }
    //   }
    //   return newArr
    // })
    
    setNotes(oldNotes => {
      const newArray = []
      for(let i = 0; i < oldNotes.length; i++) {
          if(oldNotes[i].id === currentNoteId) {
              newArray.unshift({ ...oldNotes[i], body: text })
          } else {
            newArray.push(oldNotes[i])
          }
      }
      return newArray
    })
      
  }

  
  function deleteNote(event, noteId){
    /** stop propogating event to the parent */
    event.stopPropagation()
    setNotes(oldNotes => {
      return oldNotes.filter((note)=> note.id !== noteId)
    })
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
