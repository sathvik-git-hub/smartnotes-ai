import { useState, useEffect } from "react"

function Dashboard() {
    const [activeView, setActiveView] = useState("all")
    const [notes, setNotes] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [title, setTitle] = useState("")
    const [content, setContent] = useState("")
    const [loading, setLoading] = useState(true)
    const [editingNote, setEditingNote] = useState(null)
    const [editTitle, setEditTitle] = useState("")
    const [editContent, setEditContent] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [summary, setSummary] = useState(null)
    const [summarizingId, setSummarizingId] = useState(null)



    useEffect(() => {
        fetch("http://127.0.0.1:8000/notes/trash")
            .then(res => res.json())
            .then(trashData => {
                const trashNotes = trashData.map(n => ({ ...n, deleted: true }))
                fetch("http://127.0.0.1:8000/notes")
                    .then(res => res.json())
                    .then(data => {
                        setNotes([...data, ...trashNotes])
                        setLoading(false)
                    })
            })
            .catch(err => {
                console.error("Failed to load notes:", err)
                setLoading(false)
            })
    }, [])

    async function addNote() {
        if (!title || !content) return

        try {
            const res = await fetch("http://127.0.0.1:8000/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, content })
            })
            const savedNote = await res.json()
            setNotes([...notes, savedNote])
            setTitle("")
            setContent("")
            setShowForm(false)
        } catch (err) {
            console.error("Failed to save note:", err)
        }
    }
    async function deleteNote(id) {
        await fetch(`http://127.0.0.1:8000/notes/${id}`, { method: "DELETE" })
        setNotes(notes.map(note => note.id === id ? { ...note, deleted: true } : note))
    }
    async function restoreNote(id) {
        await fetch(`http://127.0.0.1:8000/notes/${id}/restore`, { method: "PATCH" })
        setNotes(notes.map(note => note.id === id ? { ...note, deleted: false } : note))
    }
    async function emptyTrash() {
        await fetch("http://127.0.0.1:8000/notes/trash/empty", { method: "DELETE" })
        setNotes(notes.filter(note => !note.deleted))
    }
    async function summarizeNote(id) {
        setSummarizingId(id)
        setSummary(null)
        const res = await fetch(`http://127.0.0.1:8000/notes/${id}/summarize`, {
            method: "POST"
        })
        const data = await res.json()
        setSummary(data.summary)
        setSummarizingId(null)
    }
    async function toggleFavourite(id) {
        const res = await fetch(`http://127.0.0.1:8000/notes/${id}/favourite`, { method: "PATCH" })
        const data = await res.json()
        setNotes(notes.map(note => note.id === id ? { ...note, isFavourite: data.isFavourite } : note))
    }
    async function saveEdit() {
        const res = await fetch(`http://127.0.0.1:8000/notes/${editingNote.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: editTitle, content: editContent })
        })
        const updatedNote = await res.json()
        setNotes(notes.map(note => note.id === editingNote.id ? { ...note, ...updatedNote } : note))
        setEditingNote(null)
    }

    if (loading) return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
            <p className="text-xl">Loading notes...</p>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-900 text-white flex">

            {/* SIDEBAR */}
            <div className="w-64 bg-gray-800 p-6 flex flex-col">
                <h2 className="text-xl font-bold text-blue-400 mb-8">
                    SmartNotes AI 🧠
                </h2>

                <button
                    onClick={() => setShowForm(true)}
                    className="bg-blue-600 hover:bg-blue-700 py-2 px-4 rounded-lg mb-6 transition">
                    + New Note
                </button>

                <nav className="flex flex-col gap-2">
                    <button onClick={() => setActiveView("all")}
                        className="text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-lg cursor-pointer">
                        📄 All Notes
                    </button>
                    <button onClick={() => setActiveView("favourites")}
                        className="text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-lg cursor-pointer">
                        ⭐ Favourites
                    </button>
                    <button onClick={() => setActiveView("trash")}
                        className="text-gray-300 hover:text-white hover:bg-gray-700 px-3 py-2 rounded-lg cursor-pointer">
                        🗑️ Trash
                    </button>
                </nav>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 p-8">
                <h1 className="text-2xl font-bold mb-6">
                    {activeView === "all" ? "All Notes" : activeView === "favourites" ? "Favourites" : "Trash"}
                </h1>
                {activeView === "trash" && (
                    <button onClick={emptyTrash}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-smmb-4">
                        Empty Trash
                    </button>
                )}
                <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-800 rounded-lg px-4 py-2 mb-6 outline-none focus:ring-2 focus:ring-blue-500"
                />


                {/* NEW NOTE FORM - only shows when showForm is true */}
                {showForm && (
                    <div className="bg-gray-800 p-6 rounded-xl mb-6">
                        <h2 className="text-lg font-semibold mb-4">New Note</h2>
                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-gray-700 rounded-lg px-4 py-2 mb-3 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <textarea
                            placeholder="Write your note..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full bg-gray-700 rounded-lg px-4 py-2 mb-3 outline-none focus:ring-2 focus:ring-blue-500 h-32"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={addNote}
                                className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition">
                                Save Note
                            </button>
                            <button
                                onClick={() => setShowForm(false)}
                                className="bg-gray-600 hover:bg-gray-500 px-6 py-2 rounded-lg transition">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
                {editingNote && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 p-6 rounded-xl w-96">
                            <h2 className="text-lg font-semibold mb-4">Edit Note</h2>
                            <input value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full bg-gray-700 rounded-lg px-4 py-2 mb-3 outline-none" />
                            <textarea value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                className="w-full bg-gray-700 rounded-lg px-4 py-2 mb-3 outline-none h-32" />
                            <div className="flex gap-3">
                                <button onClick={saveEdit}
                                    className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg">Save</button>
                                <button onClick={() => setEditingNote(null)}
                                    className="bg-gray-600 hover:bg-gray-500 px-6 py-2 rounded-lg">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
                {summary && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 p-6 rounded-xl w-96">
                            <h2 className="text-lg font-semibold mb-4">✨ AI Summary</h2>
                            <p className="text-gray-300 text-sm leading-relaxed">{summary}</p>
                            <button onClick={() => setSummary(null)}
                                className="mt-4 bg-gray-600 hover:bg-gray-500 px-6 py-2 rounded-lg w-full">
                                Close
                            </button>
                        </div>
                    </div>
                )}

                {/* NOTES GRID */}
                <div className="grid grid-cols-3 gap-4">
                    {notes
                        .filter(note => {
                            const matchesView =
                                activeView === "favourites" ? (note.isFavourite && !note.deleted) :
                                    activeView === "trash" ? note.deleted :
                                        !note.deleted
                            const matchesSearch =
                                note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                note.content.toLowerCase().includes(searchQuery.toLowerCase())
                            return matchesView && matchesSearch
                        })
                        .map((note) => (
                            <div key={note.id} className="bg-gray-800 p-4 rounded-xl hover:bg-gray-700 transition">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold">{note.title}</h3>
                                    <div className="flex gap-2">
                                        {activeView === "trash" ? (
                                            <button onClick={() => restoreNote(note.id)}
                                                className="text-green-400 hover:text-green-300 text-sm">↩️ Restore</button>
                                        ) : (
                                            <>
                                                <button onClick={() => toggleFavourite(note.id)}
                                                    className="text-xl">{note.isFavourite ? "⭐" : "☆"}
                                                </button>
                                                <button onClick={() => {
                                                    setEditingNote(note)
                                                    setEditTitle(note.title)
                                                    setEditContent(note.content)
                                                }}
                                                    className="text-blue-400 hover:text-blue-300 text-sm">✏️</button>
                                                <button onClick={() => deleteNote(note.id)}
                                                    className="text-red-400 hover:text-red-300 text-sm">🗑️</button>
                                                <button onClick={() => summarizeNote(note.id)}
                                                    className="text-yellow-400 hover:text-yellow-300 text-sm">
                                                    {summarizingId === note.id ? "..." : "✨"} </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <p className="text-gray-400 text-sm">{note.content}</p>
                                <p className="text-gray-500 text-xs mt-3">
                                    {new Date(note.createdAt).toLocaleString()}
                                </p>
                            </div>
                        ))}
                </div>
            </div>

        </div>
    )
}

export default Dashboard