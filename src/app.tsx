import { ChangeEvent, useState } from "react"
import logo from "./assets/logo-nlw-expert.svg"
import { NewNoteCard } from "./components/new-note-card"
import { NoteCard } from "./components/note-card"


export function App() {
  const [search, setSearch] = useState<string>("")
  const [notes, setNotes] = useState<NotesType[]>(() => {
    const notesOnStorage = localStorage.getItem("notes");


    if (notesOnStorage) {
      return JSON.parse(notesOnStorage)
    }

    return [];
  })

  // useEffect(() => {
  //   const notesOnStorage = localStorage.getItem("notes");

  //   if (notesOnStorage) {
  //     setNotes(JSON.parse(notesOnStorage))
  //   }

  // }, [])

  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    const query = event.target.value

    setSearch(query)
  }

  function onNoteDelete(id: string) {
    const notesArray = notes.filter(note => {
      return note.id !== id
    })

    setNotes(notesArray)
    localStorage.setItem("notes", JSON.stringify(notesArray))

  }

  const filteredNotes = search !== ""
    ? notes.filter(note => note.content.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
    : notes

  return (
    <div className="mx-auto max-w-6xl my-12 space-y-6 px-5">
      <img
        src={logo}
        alt="logo"
      />

      <form className="w-full">
        <input
          type="text"
          placeholder="Busque suas notas"
          className="w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-slate-500"
          onChange={handleSearch}
        />
      </form>

      <div className="h-px bg-slate-700" />


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
        <NewNoteCard
          notes={{
            notes: notes,
            setNotes: setNotes
          }}
        />


        {
          filteredNotes.map(note =>
            <>
              <NoteCard
                key={note.id}
                note={{
                  id: note.id,
                  date: new Date(note.date),
                  content: note.content
                }}
                onNoteDelete={onNoteDelete}
              />
            </>
          )
        }

      </div>
    </div>
  )
}