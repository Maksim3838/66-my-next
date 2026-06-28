import axios from "axios";
import type { Note } from "../types/note";


axios.defaults.baseURL = "https://notehub-public.goit.study/api";
const TOKEN = process.env.NEXT_PUBLIC_NOTEHUB_TOKEN;


export interface NotesResponse {
  notes: Note[];
  totalPages: number;
}

const api = axios.create({
  baseURL: "https://notehub-public.goit.study/api",
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_NOTEHUB_TOKEN}`,
    "Content-Type": "application/json",
  },
});

export const fetchNotes = async (
  page = 1,
  search = " "
): Promise<NotesResponse> => {
  const res = await api.get<NotesResponse>(`/notes`, {
    params: {page, search, },
  });

  return res.data;
};

export const createNote = async (
  note: Omit<Note, "id" | "createdAt" | "updatedAt">
): Promise<Note> => {
  const res = await api.post<Note>("/notes", note);
  return res.data;
};

export const updateNote = async (note: Note): Promise<Note> => {
  const res = await api.put<Note>(`/notes/${note.id}`, note);
  return res.data;
};

export const deleteNote = async (id: string): Promise<Note> => {
  const res = await api.delete<Note>(`/notes/${id}`);
  return res.data;
};

export async function fetchNoteById(id: string): Promise<Note> {
  const { data } = await axios.get(`/notes/${id}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
  });
  return data;
}