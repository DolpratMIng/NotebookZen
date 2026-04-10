"use client";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import Navbar from "@/components/Navbar";

type Note = {
  id: number;
  title: string;
  content?: string;
  createdAt: string;
};

type SelectedNote = {
  id: number;
  title: string;
  content?: string;
  createdAt: string;
};
export default function RealShowList() {
  const { getToken } = useAuth();
  const searchParams = useSearchParams();

  const [noteList, setNoteList] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<SelectedNote>({
    id: 0,
    title: "",
    content: "",
    createdAt: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken();

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/notes`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        if (!response.ok) {
          throw new Error("failed to fetch");
        }

        const result = await response.json();
        setNoteList(result);

        const noteId = searchParams.get("noteId");
        if (noteId) {
          const targetNote = result.find(
            (note: Note) => note.id === Number(noteId),
          );
          if (targetNote) {
            setSelectedNote(targetNote);
          }
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
      }
    };

    fetchData();
  }, [getToken, searchParams]);

  function handleSelectedNote(note: Note) {
    setSelectedNote(note);
    setIsEditing(false);
  }

  function handleEditNote() {
    setIsEditing(true);
    setEditTitle(selectedNote.title);
    setEditContent(selectedNote.content || "");
  }

  function handleCancel() {
    setIsEditing(false);
  }

  async function handleSaveUpdate() {
    const token = await getToken();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/notes`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: selectedNote.id,
            title: editTitle,
            content: editContent,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update note");
      }

      const result = await response.json();
      const updatedNote = result.data;

      setNoteList((prev) =>
        prev.map((note) => (note.id === updatedNote.id ? updatedNote : note)),
      );

      setSelectedNote(updatedNote);
      setIsEditing(false);

      alert("Note updated successfully");
    } catch (error) {
      console.error("Error updating note:", error);
      alert("Failed to update note.");
    }
  }

  async function handleDeleteButton() {
    const token = await getToken();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/notes`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: selectedNote.id,
          }),
        },
      );
      const result = await response.json();

      const deletedNote = result.data;

      setNoteList((prev) => prev.filter((note) => note.id !== deletedNote.id));

      setSelectedNote({
        id: 0,
        title: "",
        content: "",
        createdAt: "",
      });
      setIsEditing(false);
      alert("Note deleted successfully");
    } catch (error) {
      console.error("Error deleting note:", error);
      alert("failed to delete note.");
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex">
          <div className="w-[30%] border-r-2 border-gray-700 h-screen">
            <div className="border-b-2 border-gray-500">
              <div className="p-4 flex flex-col gap-2">
                <div>
                  <button type="button" className="flex gap-2">
                    <ArrowLeft />
                    Menu
                  </button>
                </div>
                <div>
                  <h1>Your Notes</h1>
                </div>
              </div>
            </div>
            <div className="p-4 flex flex-col gap-2">
              {noteList.map((note) => (
                <div
                  key={note.id}
                  className="bg-green-500 p-4 cursor-pointer"
                  onClick={() => handleSelectedNote(note)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSelectedNote(note);
                  }}
                >
                  <div className="flex w-full h-full">
                    <div>{note.title}</div>
                  </div>
                  <div>{new Date(note.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="w-[70%] p-4">
            {selectedNote.title ? (
              isEditing ? (
                <div className="bg-gray-700 w-full">
                  <div className="border-b-2 border-white">
                    <div className="p-2">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full text-xl"
                      />
                      <div className="flex justify-between">
                        <div>
                          {new Date(selectedNote.createdAt).toLocaleString()}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="bg-green-500 p-2"
                            onClick={handleSaveUpdate}
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            className="bg-gray-400 p-2"
                            onClick={handleCancel}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <textarea
                      className="w-full"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-gray-700">
                  <div className=" border-b-2 border-white">
                    <div className="p-2">
                      <div className="text-xl">{selectedNote.title}</div>
                      <div className="flex justify-between">
                        <div>
                          {new Date(selectedNote.createdAt).toLocaleString()}
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleEditNote}
                            className="p-2 bg-green-500"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="p-2 bg-red-500"
                            onClick={handleDeleteButton}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <div>{selectedNote.content}</div>
                  </div>
                </div>
              )
            ) : (
              <div className="flex flex-col gap-4 h-full justify-center items-center">
                <div className="text-2xl">Select a Note to review</div>
                <div>Choose a note from the sidebar to see its content</div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
