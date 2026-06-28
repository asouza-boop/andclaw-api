import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PageHeader, Card } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import {
  getMeeting,
  deleteMeeting,
  attachAudio,
  transcribeMeeting,
  analyzeMeeting,
  convertMeetingToKnowledge,
  updateMeeting,
} from "@/lib/meetings.functions";
import { IntelligenceEditor, type IntelligenceDraft } from "@/components/meetings/IntelligenceEditor";
import {
  ArrowLeft, Upload, Mic, Square, FileText, Sparkles, Trash2, Loader2,
  Users, Clock, Plus, BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/reunioes/$id")({
  head: ({ params }) => ({ meta: [{ title: `Reunião — AndClaw` }, { name: "description", content: `Detalhe da reunião ${params.id}` }] }),
  component: MeetingDetail,
});

function MeetingDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const qc = useQueryClient();
  const get = useServerFn(getMeeting);
  const del = useServerFn(deleteMeeting);
  const attach = useServerFn(attachAudio);
  const transcribe = useServerFn(transcribeMeeting);
  const analyze = useServerFn(analyzeMeeting);
  const convert = useServerFn(convertMeetingToKnowledge);
  const update = useServerFn(updateMeeting);

  const { data: m, isLoading } = useQuery({
    queryKey: ["meeting", id],
    queryFn: () => get({ data: { id } }),
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["meeting", id] });

  const deleteMut = useMutation({
    mutationFn: () => del({ data: { id } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["meetings"] }); nav({ to: "/reunioes" }); },
  });
  const transcribeMut = useMutation({ mutationFn: () => transcribe({ data: { id } }), onSuccess: refresh });
  const analyzeMut = useMutation({ mutationFn: () => analyze({ data: { id } }), onSuccess: refresh });
  const convertMut = useMutation({ mutationFn: () => convert({ data: { id } }), onSuccess: refresh });

  // Recording state
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [uploading, setUploading] = useState(false);
  const mediaRecRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(file: Blob, ext: string) {
    setUploading(true);
    try {
      const path = `${id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("meeting-audio").upload(path, file, {
        contentType: file.type || `audio/${ext}`,
        upsert: true,
      });
      if (error) throw error;
      await attach({ data: { id, path } });
      refresh();
    } catch (e) {
      console.error(e);
      alert("Falha ao enviar áudio: " + (e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function startRec() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await handleUpload(blob, "webm");
      };
      mr.start();
      mediaRecRef.current = mr;
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch (e) {
      alert("Microfone indisponível: " + (e as Error).message);
    }
  }
  function stopRec() {
    mediaRecRef.current?.stop();
    setRecording(false);
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }

  if (isLoading || !m) {
    return <div className="text-sm text-muted-foreground">Carregando reunião…</div>;
  }

  const alerts = ((m as any).alerts as { text: string; severity: "low" | "medium" | "high" }[]) ?? [];
  const keyPoints = ((m as any).key_points as string[]) ?? [];
  const actions = ((m as any).action_items as { title: string; owner?: string; due?: string }[]) ?? [];
  const decisions = ((m as any).decisions as string[]) ?? [];
  const ideas = ((m as any).ideas as string[]) ?? [];
  const skills = ((m as any).skills as string[]) ?? [];

  return (
    <>
      <div className="mb-4">
        <Link to="/reunioes" className="text-xs text-muted-foreground inline-flex items-center gap-1 hover:text-foreground">
          <ArrowLeft size={12} /> Reuniões
        </Link>
      </div>
      <PageHeader
        title={(m as any).title}
        description={`${new Date((m as any).occurred_at).toLocaleString("pt-BR")} · ${((m as any).status as string)}`}
        actions={
          <>
            <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate()} disabled={deleteMut.isPending}>
              <Trash2 size={14} className="mr-1" /> Excluir
            </Button>
          </>
        }
      />

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div>
          <Tabs defaultValue="resumo">
            <TabsList>
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              <TabsTrigger value="transcricao">Transcrição</TabsTrigger>
              <TabsTrigger value="inteligencia">Inteligência</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
            </TabsList>

            <TabsContent value="resumo" className="space-y-3">
              <Card>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <Users size={12} /> {(m as any).participants?.length ?? 0} participantes
                  {(m as any).duration_minutes && <><span>·</span><Clock size={12} /> {(m as any).duration_minutes} min</>}
                </div>
                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                  {(m as any).summary || <span className="text-muted-foreground">Sem resumo. Transcreva e analise para gerar.</span>}
                </p>
              </Card>
              {keyPoints.length > 0 && (
                <Card>
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Pontos-chave</h3>
                  <ul className="text-sm space-y-1.5">
                    {keyPoints.map((p, i) => <li key={i} className="flex gap-2"><span className="text-primary">•</span>{p}</li>)}
                  </ul>
                </Card>
              )}
              <Card>
                <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Conversão</h3>
                <Button size="sm" variant="outline" onClick={() => convertMut.mutate()} disabled={convertMut.isPending || !(m as any).summary}>
                  {convertMut.isPending ? <Loader2 size={14} className="mr-1 animate-spin" /> : <BookOpen size={14} className="mr-1" />}
                  {(m as any).knowledge_item_id ? "Atualizar no conhecimento" : "Publicar no conhecimento"}
                </Button>
              </Card>
            </TabsContent>

            <TabsContent value="transcricao">
              <Card>
                {(m as any).transcript_text ? (
                  <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{(m as any).transcript_text}</pre>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma transcrição. Anexe áudio e use "Transcrever".
                  </p>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="inteligencia" className="space-y-3">
              {alerts.length > 0 && (
                <Card>
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1"><AlertTriangle size={12} /> Alertas</h3>
                  <ul className="space-y-2">
                    {alerts.map((a, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Badge className={
                          a.severity === "high" ? "bg-destructive/20 text-destructive border-destructive/40" :
                          a.severity === "medium" ? "bg-warning/15 text-warning border-warning/30" :
                          "bg-muted text-muted-foreground"
                        }>{a.severity}</Badge>
                        <span>{a.text}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
              {actions.length > 0 && (
                <Card>
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1"><CheckSquare size={12} /> Ações</h3>
                  <ul className="space-y-2 text-sm">
                    {actions.map((a, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckSquare size={14} className="mt-0.5 text-primary" />
                        <div>
                          <p>{a.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {a.owner && <>@{a.owner}</>}{a.owner && a.due && " · "}{a.due}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
              {decisions.length > 0 && (
                <Card>
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1"><Gavel size={12} /> Decisões</h3>
                  <ul className="text-sm space-y-1.5">
                    {decisions.map((d, i) => <li key={i} className="flex gap-2"><span className="text-cyan">•</span>{d}</li>)}
                  </ul>
                </Card>
              )}
              {ideas.length > 0 && (
                <Card>
                  <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1"><Lightbulb size={12} /> Ideias</h3>
                  <ul className="text-sm space-y-1.5">
                    {ideas.map((d, i) => <li key={i} className="flex gap-2"><span className="text-warning">•</span>{d}</li>)}
                  </ul>
                </Card>
              )}
              {alerts.length + actions.length + decisions.length + ideas.length === 0 && (
                <Card className="text-sm text-muted-foreground">
                  Sem inteligência ainda. Transcreva e analise para extrair ações, decisões, ideias e alertas.
                </Card>
              )}
            </TabsContent>

            <TabsContent value="skills">
              <Card>
                <SkillsEditor
                  skills={skills}
                  onChange={async (next) => {
                    await update({ data: { id, skills: next } });
                    refresh();
                  }}
                />
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Side panel */}
        <aside className="space-y-3">
          <Card>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Áudio</h3>
            {(m as any).audioSignedUrl ? (
              <audio controls src={(m as any).audioSignedUrl} className="w-full mb-3" />
            ) : (
              <p className="text-xs text-muted-foreground mb-3">Nenhum áudio anexado.</p>
            )}

            <div className="space-y-2">
              {!recording ? (
                <Button size="sm" variant="outline" className="w-full" onClick={startRec} disabled={uploading}>
                  <Mic size={14} className="mr-1" /> Gravar
                </Button>
              ) : (
                <Button size="sm" variant="destructive" className="w-full" onClick={stopRec}>
                  <Square size={14} className="mr-1" /> Parar ({Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")})
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/mp3,audio/wav,audio/webm,audio/ogg,audio/m4a,audio/mp4,audio/mpeg"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    if (f.size > 100 * 1024 * 1024) return alert("Máx. 100MB");
                    const ext = f.name.split(".").pop() || "webm";
                    handleUpload(f, ext);
                  }
                }}
              />
              <Button size="sm" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={uploading || recording}>
                {uploading ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Upload size={14} className="mr-1" />}
                Upload de áudio
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Processamento IA</h3>
            <div className="space-y-2">
              <Button size="sm" variant="outline" className="w-full" onClick={() => transcribeMut.mutate()} disabled={transcribeMut.isPending || !(m as any).audio_url}>
                {transcribeMut.isPending ? <Loader2 size={14} className="mr-1 animate-spin" /> : <FileText size={14} className="mr-1" />}
                Transcrever
              </Button>
              <Button size="sm" className="w-full" onClick={() => analyzeMut.mutate()} disabled={analyzeMut.isPending || !(m as any).transcript_text}>
                {analyzeMut.isPending ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Sparkles size={14} className="mr-1" />}
                Analisar inteligência
              </Button>
            </div>
            {(transcribeMut.error || analyzeMut.error) && (
              <p className="text-xs text-destructive mt-2">{(transcribeMut.error || analyzeMut.error)?.message}</p>
            )}
          </Card>

          {(m as any).participants?.length > 0 && (
            <Card>
              <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Participantes</h3>
              <div className="flex flex-wrap gap-1.5">
                {((m as any).participants as string[]).map((p) => <Badge key={p} variant="secondary">{p}</Badge>)}
              </div>
            </Card>
          )}
        </aside>
      </div>
    </>
  );
}

function SkillsEditor({ skills, onChange }: { skills: string[]; onChange: (next: string[]) => void }) {
  const [val, setVal] = useState("");
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Skills vinculadas</h3>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {skills.length === 0 && <p className="text-xs text-muted-foreground">Nenhuma skill.</p>}
        {skills.map((s) => (
          <Badge key={s} variant="secondary" className="cursor-pointer" onClick={() => onChange(skills.filter((x) => x !== s))}>
            {s} ×
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Nova skill" onKeyDown={(e) => {
          if (e.key === "Enter" && val.trim() && !skills.includes(val.trim())) {
            onChange([...skills, val.trim()]);
            setVal("");
          }
        }} />
        <Button size="sm" variant="outline" onClick={() => {
          if (val.trim() && !skills.includes(val.trim())) {
            onChange([...skills, val.trim()]);
            setVal("");
          }
        }}><Plus size={14} /></Button>
      </div>
    </div>
  );
}
