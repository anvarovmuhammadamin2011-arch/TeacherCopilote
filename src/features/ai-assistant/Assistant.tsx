import { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Send,
  Copy,
  RefreshCw,
  Trash2,
  Pencil,
  MessageSquare,
  BookOpen,
  ClipboardList,
  Lightbulb,
  NotebookPen,
} from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/stores/useStore";
import { aiService } from "@/services/ai/service";
import { uid } from "@/utils/cn";
import {
  PageHead,
  Button,
  SearchInput,
  Confirm,
  Modal,
  Field,
  DemoNote,
  copy,
} from "@/components/common";
const prompts = [
  { icon: BookOpen, text: "Chiziqli tenglama mavzusini tushuntir" },
  { icon: ClipboardList, text: "Kvadrat tenglamaning ildizlarini tushuntir" },
  { icon: Lightbulb, text: "Pifagor teoremasini misol bilan tushuntir" },
  { icon: Sparkles, text: "Oddiy kasrlar bo‘yicha mashq taklif qil" },
  { icon: NotebookPen, text: "Foizlar mavzusida uy vazifasi yarat" },
];
export default function Assistant() {
  const { db, mutate } = useStore();
  const [active, setActive] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [rename, setRename] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const end = useRef<HTMLDivElement>(null);
  const conversation = db.conversations.find((c) => c.id === active);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [conversation?.messages.length, loading]);
  const send = async (text: string, regenerate = false) => {
    if (!text.trim() || loading) return;
    const id = active || uid();
    if (!active) {
      mutate((d) =>
        d.conversations.unshift({ id, title: text.slice(0, 40), messages: [] }),
      );
      setActive(id);
    }
    if (!regenerate)
      mutate((d) => {
        d.conversations
          .find((c) => c.id === id)
          ?.messages.push({ id: uid(), role: "user", content: text });
      });
    setInput("");
    setLoading(true);
    try {
      const response = await aiService.sendChatMessage(text);
      mutate((d) => {
        const c = d.conversations.find((c) => c.id === id);
        if (c) {
          if (regenerate && c.messages.at(-1)?.role === "assistant")
            c.messages.pop();
          c.messages.push({ id: uid(), role: "assistant", content: response });
        }
      });
    } catch {
      toast.error("Javob olinmadi. Qayta urinib ko‘ring.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <PageHead
        title="Matematika AI yordamchisi"
        description="Formulalar, yechim bosqichlari va dars uchun matematik g‘oyalar."
      />
      <div className="chat-layout">
        <aside className="chat-sidebar">
          <Button
            variant="outline"
            className="full"
            onClick={() => {
              setActive(null);
              setInput("");
            }}
            disabled={loading}
          >
            <Plus size={16} />
            Yangi suhbat
          </Button>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Suhbatni qidirish…"
          />
          <p className="overline">SUHBATLAR</p>
          {db.conversations
            .filter((c) => c.title.toLowerCase().includes(query.toLowerCase()))
            .map((c) => (
              <div
                className={`conversation-row ${active === c.id ? "active" : ""}`}
                key={c.id}
              >
                <button disabled={loading} onClick={() => setActive(c.id)}>
                  <MessageSquare size={15} />
                  <span>{c.title}</span>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Qayta nomlash"
                  onClick={() => {
                    setRename(c.id);
                    setTitle(c.title);
                  }}
                >
                  <Pencil size={12} />
                </Button>
                <Confirm
                  onConfirm={() => {
                    mutate((d) => {
                      d.conversations = d.conversations.filter(
                        (x) => x.id !== c.id,
                      );
                    });
                    if (active === c.id) setActive(null);
                  }}
                >
                  <Button
                    disabled={loading}
                    variant="ghost"
                    size="icon"
                    title="Suhbatni o‘chirish"
                  >
                    <Trash2 size={12} />
                  </Button>
                </Confirm>
              </div>
            ))}
          {!db.conversations.length && (
            <p className="muted">Suhbatlaringiz shu yerda saqlanadi.</p>
          )}
          <div className="chat-demo">
            <Sparkles size={18} />
            <strong>MockAIService</strong>
            <p>Bu demo yordamchi. Haqiqiy AI keyingi bosqichda ulanadi.</p>
          </div>
        </aside>
        <section className="chat-main">
          <div className="chat-top">
            <span>
              <span className="status-dot" />
              TeacherCopilot AI
            </span>
            <span className="badge blue">Namoyish</span>
          </div>
          <div className="chat-messages">
            {!conversation?.messages.length ? (
              <div className="chat-welcome">
                <div className="big-ai">
                  <Sparkles size={34} />
                </div>
                <h2>Bugun nimani birga yaratamiz?</h2>
                <p>
                  Yaxshi dars uchun bitta g‘oya yetarli.
                  <br />
                  Boshlash uchun quyidagilardan birini tanlang.
                </p>
                <div className="prompt-grid">
                  {prompts.map((p) => (
                    <button
                      key={p.text}
                      onClick={() => {
                        void send(p.text);
                      }}
                    >
                      <p.icon size={19} />
                      <span>{p.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              conversation.messages.map((m) => (
                <div className={"chat-message " + m.role} key={m.id}>
                  {m.role === "assistant" && (
                    <span className="ai-avatar">
                      <Sparkles size={18} />
                    </span>
                  )}
                  <div>
                    <strong>
                      {m.role === "assistant" ? "TeacherCopilot AI" : "Siz"}
                    </strong>
                    <p>{m.content}</p>
                    {m.role === "assistant" && (
                      <div className="message-actions">
                        <button
                          onClick={() => {
                            void copy(m.content);
                          }}
                        >
                          <Copy size={13} />
                          Nusxalash
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => {
                            const last = conversation.messages
                              .filter((x) => x.role === "user")
                              .at(-1);
                            if (last) void send(last.content, true);
                          }}
                        >
                          <RefreshCw size={13} />
                          Qayta yaratish
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div className="chat-message assistant">
                <span className="ai-avatar">
                  <Sparkles size={18} />
                </span>
                <p className="typing">
                  Javob tayyorlanmoqda <i />
                  <i />
                  <i />
                </p>
              </div>
            )}
            <div ref={end} />
          </div>
          <form
            className="chat-composer"
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Masalan, Pifagor teoremasini misol bilan tushuntir…"
              aria-label="Xabar"
              rows={2}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(input);
                }
              }}
            />
            <Button
              size="icon"
              aria-label="Xabarni yuborish"
              disabled={loading || !input.trim()}
            >
              <Send size={18} />
            </Button>
          </form>
          <DemoNote>Demo javoblar. Muhim ma’lumotlarni tekshiring.</DemoNote>
        </section>
      </div>
      <Modal
        open={!!rename}
        onOpenChange={() => setRename(null)}
        title="Suhbat nomi"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            mutate((d) => {
              const c = d.conversations.find((c) => c.id === rename);
              if (c) c.title = title;
            });
            setRename(null);
          }}
        >
          <Field label="Nomi">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Field>
          <Button>Saqlash</Button>
        </form>
      </Modal>
    </>
  );
}
