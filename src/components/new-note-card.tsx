import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { ChangeEvent, FormEvent, useState } from "react"
import { toast } from "sonner"

interface Props {
    notes: {
        notes: NotesType[]
        setNotes: (state: NotesType[]) => void
    }
}

const SpeechRecognitionAPI =
    window.SpeechRecognition || window.webkitSpeechRecognition;

const speechRecognition = new SpeechRecognitionAPI();

export function NewNoteCard({ notes }: Props) {

    const [shouldOnBoaring, setShouldOnBoaring] = useState<boolean>(true);
    const [content, setContent] = useState<string>("")
    const [isRecording, setIsRecording] = useState<boolean>(false)

    function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
        setContent(event.target.value)
        if (event.target.value == "")
            setShouldOnBoaring(true)
    }

    function handleSaveNote(event: FormEvent) {
        event.preventDefault()

        if (content === "") {
            toast.info("Escreva uma nota antes de salvar")
            return
        }


        const newNote: NotesType = {
            id: crypto.randomUUID(),
            date: new Date(),
            content: content
        }
        const notesArray = [newNote, ...notes.notes]
        notes.setNotes(notesArray)
        toast.success("Nota criada com sucesso")

        localStorage.setItem("notes", JSON.stringify(notesArray))

        setContent("")
        setShouldOnBoaring(true)
    }

    function handleStartRecording() {


        const isSpeechRecognitionAPIAvailable =
            "SpeechRecognition" in window || "webkitSpeechRecognition" in window

        if (!isSpeechRecognitionAPIAvailable) {
            toast.info("Infelizmente seu navegador não suporta a API de gravação!")
            return
        }

        setIsRecording(true)
        setShouldOnBoaring(false)

        // const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

        // const speechRecognition = new SpeechRecognitionAPI()

        speechRecognition.lang = "pt-BR"
        speechRecognition.continuous = true
        speechRecognition.maxAlternatives = 1 // caso o interpretador nao entenda a palavra que voce falou, ele ira retornar a mais provavel em vez de retornar a que ele achou
        speechRecognition.interimResults = true // traz os resultados conforme você for falando

        speechRecognition.onresult = (event) => {
            const transcription = Array.from(event.results).reduce((text, result) => {

                return text.concat(result[0].transcript)
            }, '')

            setContent(transcription)
        }

        speechRecognition.onerror = (event) => {
            console.error(event)
            toast.error("Erro ao captar voz na API")
            return
        }

        speechRecognition.start()
    }

    function handleStopRecording() {
        setIsRecording(false)

        if (speechRecognition !== null) {
            speechRecognition.stop();
        }
    }

    return (
        <>
            <Dialog.Root>
                <Dialog.Trigger className="rounded-md flex flex-col bg-slate-700 text-left p-5 gap-5 outline-none hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
                    <span
                        className="text-sm font-medium text-slate-200"
                    >
                        Adicionar nota
                    </span>
                    <p
                        className="text-sm leading-6 text-slate-400"
                    >
                        Grave uma nota em áudio que será convertida para texto automaticamente.
                    </p>

                </Dialog.Trigger>

                <Dialog.Portal>
                    <Dialog.Overlay className="inset-0 fixed bg-black/50" />
                    <Dialog.Content
                        className="fixed inset-0 md:inset-auto overflow-hidden md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] md:h-[60vh] w-full bg-slate-700 md:rounded-md flex flex-col outline-none"
                    >
                        <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400">
                            <X className="size-5 hover:text-slate-100" />
                        </Dialog.Close>

                        <form className="flex flex-1 flex-col">
                            <div className="flex flex-1 flex-col gap-5 p-5">

                                <span
                                    className="text-sm font-medium text-slate-300"
                                >
                                    Adicionar nota
                                </span>

                                {
                                    shouldOnBoaring === true ? (
                                        <>
                                            <p
                                                className="text-sm leading-6 text-slate-400"
                                            >
                                                Comece <button
                                                    className="font-medium text-lime-400 hover:underline"
                                                    onClick={handleStartRecording}
                                                    type="button"
                                                >
                                                    gravando uma nota
                                                </button> em áudio ou se preferir <button
                                                    className="font-medium text-lime-400 hover:underline"
                                                    onClick={() => setShouldOnBoaring(false)}
                                                    type="button"
                                                >
                                                    apenas texto
                                                </button>
                                            </p>
                                        </>
                                    ) : (
                                        <textarea
                                            autoFocus
                                            className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                                            onChange={handleContentChange}
                                            value={content}
                                        />
                                    )
                                }


                            </div>

                            {
                                isRecording ? (
                                    <button
                                        className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm font-medium text-slate-300 outline-none hover:text-slate-100"
                                        type="button"
                                        onClick={handleStopRecording}
                                    >
                                        <div className="size-3 rounded-full bg-red-500 animate-pulse" />
                                        Gravando! (clique p/ interomper)
                                    </button>
                                ) : (
                                    <button
                                        className="w-full bg-lime-400 py-4 text-center text-sm font-medium text-lime-950 outline-none hover:bg-lime-500"
                                        type="button"
                                        onClick={handleSaveNote}
                                    >
                                        Salvar Nota
                                    </button>
                                )
                            }
                        </form>
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </>
    )
}