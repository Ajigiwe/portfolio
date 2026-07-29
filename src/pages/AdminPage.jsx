import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContent } from "../context/ContentContext";

const PASSWORD = "admin123";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (pass === PASSWORD) {
      setAuthed(true);
      setErr("");
    } else {
      setErr("Access denied: incorrect password");
    }
  };

  if (!authed) {
    return (
      <div className="admin-page">
        <div className="admin-box">
          <div className="admin-term-header">
            <span className="term-dot red" />
            <span className="term-dot yellow" />
            <span className="term-dot green" />
            <span className="admin-term-title">admin — login</span>
          </div>
          <div className="admin-body-inner">
            <div className="admin-line">
              <span className="admin-prompt">portfolio@admin:~$ </span>
              <span className="admin-cmd">su -</span>
            </div>
            <div className="admin-line dim">Password required</div>
            <form onSubmit={handleLogin} className="admin-login-form">
              <div className="admin-line">
                <span className="admin-prompt">password: </span>
                <input
                  type="password"
                  className="admin-input-inline"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  autoFocus
                />
              </div>
              {err && <div className="admin-line admin-err">{err}</div>}
              <button type="submit" className="admin-submit">[Login]</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("profile");

  return (
    <div className="admin-page">
      <div className="admin-box admin-box-wide">
        <div className="admin-term-header">
          <span className="term-dot red" />
          <span className="term-dot yellow" />
          <span className="term-dot green" />
          <span className="admin-term-title">admin — editing portfolio</span>
          <button
            className="admin-header-btn"
            onClick={() => navigate("/")}
          >
            [View Site]
          </button>
        </div>

        <div className="admin-layout">
          <div className="admin-sidebar">
            {["profile", "about", "services", "skills", "projects", "experience", "achievements", "marquee"].map((t) => (
              <button
                key={t}
                className={`admin-sidebar-btn ${tab === t ? "active" : ""}`}
                onClick={() => setTab(t)}
              >
                {t}/
              </button>
            ))}
          </div>
          <div className="admin-main">
            {tab === "profile" && <ProfileEditor />}
            {tab === "about" && <AboutEditor />}
            {tab === "services" && <ServicesEditor />}
            {tab === "skills" && <SkillsEditor />}
            {tab === "projects" && <ProjectsEditor />}
            {tab === "experience" && <ExperienceEditor />}
            {tab === "achievements" && <AchievementsEditor />}
            {tab === "marquee" && <MarqueeEditor />}
          </div>
        </div>
      </div>
    </div>
  );
}

function useField(initial) {
  const [val, setVal] = useState(initial);
  return { val, setVal, bind: (k) => ({ value: val[k] ?? "", onChange: (e) => setVal((p) => ({ ...p, [k]: e.target.value })) })};
}

function Section({ title, onSave, onReset, children }) {
  return (
    <div>
      <div className="admin-line" style={{ marginBottom: 16 }}>
        <span className="admin-prompt">$ </span>
        <span className="admin-cmd">edit --section={title.toLowerCase()}</span>
      </div>
      <div style={{ marginBottom: 16 }}>{children}</div>
      <div className="admin-actions">
        <button className="admin-submit" onClick={onSave}>[Save]</button>
        <button className="admin-submit admin-reset" onClick={onReset}>[Reset]</button>
      </div>
    </div>
  );
}

function ProfileEditor() {
  const { data, updateData, resetData } = useContent();
  const [vals, setVals] = useState({ name: data.name, title: data.title, email: data.email, location: data.location, github: data.github, linkedin: data.linkedin, twitter: data.twitter, clients: data.clients });
  const save = () => updateData((prev) => ({ ...prev, ...vals }));

  return (
    <Section title="profile" onSave={save} onReset={resetData}>
      {Object.entries(vals).map(([k]) => (
        <AdminField key={k} label={k} value={vals[k]} onChange={(v) => setVals((p) => ({ ...p, [k]: v }))} />
      ))}
    </Section>
  );
}

function AboutEditor() {
  const { data, updateData, resetData } = useContent();
  const [p1, setP1] = useState(data.about[0] ?? "");
  const [p2, setP2] = useState(data.about[1] ?? "");
  const save = () => updateData((prev) => ({ ...prev, about: [p1, p2] }));

  return (
    <Section title="about" onSave={save} onReset={resetData}>
      <AdminField label="paragraph_1" value={p1} onChange={setP1} textarea />
      <AdminField label="paragraph_2" value={p2} onChange={setP2} textarea />
    </Section>
  );
}

function SkillsEditor() {
  const { data, updateData, resetData } = useContent();
  const [skills, setSkills] = useState(data.skills.map((s) => ({ ...s })));

  const upd = (i, v) => setSkills((prev) => prev.map((s, j) => (j === i ? { ...s, ...v } : s)));
  const add = () => setSkills((prev) => [...prev, { name: "", level: "" }]);
  const remove = (i) => setSkills((prev) => prev.filter((_, j) => j !== i));
  const save = () => updateData((prev) => ({ ...prev, skills: skills.map((s) => ({ ...s })) }));

  return (
    <Section title="skills" onSave={save} onReset={resetData}>
      {skills.map((s, i) => (
        <div key={i} className="admin-array-row">
          <input className="admin-input" value={s.name} onChange={(e) => upd(i, { name: e.target.value })} placeholder="skill name" />
          <input className="admin-input admin-input-sm" value={s.level} onChange={(e) => upd(i, { level: e.target.value })} placeholder="e.g. ████ 80%" />
          <button className="admin-submit admin-remove-btn" onClick={() => remove(i)}>[-]</button>
        </div>
      ))}
      <button className="admin-submit" onClick={add}>[+ Add]</button>
    </Section>
  );
}

function ProjectsEditor() {
  const { data, updateData, resetData } = useContent();
  const [projects, setProjects] = useState(data.projects.map((p) => ({ ...p })));

  const upd = (i, v) => setProjects((prev) => prev.map((p, j) => (j === i ? { ...p, ...v } : p)));
  const add = () => setProjects((prev) => [...prev, { name: "", desc: "", tech: "", live: "", github: "" }]);
  const remove = (i) => setProjects((prev) => prev.filter((_, j) => j !== i));
  const save = () => updateData((prev) => ({ ...prev, projects: projects.map((p) => ({ ...p })) }));

  return (
    <Section title="projects" onSave={save} onReset={resetData}>
      {projects.map((p, i) => (
        <div key={i} className="admin-array-card">
          <input className="admin-input" value={p.name} onChange={(e) => upd(i, { name: e.target.value })} placeholder="project name" />
          <input className="admin-input" value={p.desc} onChange={(e) => upd(i, { desc: e.target.value })} placeholder="description" />
          <input className="admin-input" value={p.tech} onChange={(e) => upd(i, { tech: e.target.value })} placeholder="tech (e.g. React · Node.js)" />
          <div className="admin-array-row">
            <input className="admin-input" value={p.live} onChange={(e) => upd(i, { live: e.target.value })} placeholder="live demo URL" />
            <input className="admin-input" value={p.github} onChange={(e) => upd(i, { github: e.target.value })} placeholder="github URL" />
            <button className="admin-submit admin-remove-btn" onClick={() => remove(i)}>[-]</button>
          </div>
        </div>
      ))}
      <button className="admin-submit" onClick={add}>[+ Add]</button>
    </Section>
  );
}

function ExperienceEditor() {
  const { data, updateData, resetData } = useContent();
  const [exp, setExp] = useState(data.experience.map((e) => ({ ...e })));

  const upd = (i, v) => setExp((prev) => prev.map((e, j) => (j === i ? { ...e, ...v } : e)));
  const add = () => setExp((prev) => [...prev, { role: "", company: "", period: "", desc: "" }]);
  const remove = (i) => setExp((prev) => prev.filter((_, j) => j !== i));
  const save = () => updateData((prev) => ({ ...prev, experience: exp.map((e) => ({ ...e })) }));

  return (
    <Section title="experience" onSave={save} onReset={resetData}>
      {exp.map((e, i) => (
        <div key={i} className="admin-array-card">
          <div className="admin-array-row">
            <input className="admin-input" value={e.role} onChange={(v) => upd(i, { role: v.target.value })} placeholder="role" />
            <input className="admin-input" value={e.company} onChange={(v) => upd(i, { company: v.target.value })} placeholder="company" />
          </div>
          <input className="admin-input" value={e.period} onChange={(v) => upd(i, { period: v.target.value })} placeholder="period (e.g. Jan 2024 – Present)" />
          <div className="admin-array-row">
            <input className="admin-input" value={e.desc} onChange={(v) => upd(i, { desc: v.target.value })} placeholder="description" />
            <button className="admin-submit admin-remove-btn" onClick={() => remove(i)}>[-]</button>
          </div>
        </div>
      ))}
      <button className="admin-submit" onClick={add}>[+ Add]</button>
    </Section>
  );
}

function ServicesEditor() {
  const { data, updateData, resetData } = useContent();
  const [services, setServices] = useState(data.services.map((s) => ({ ...s })));

  const upd = (i, v) => setServices((prev) => prev.map((s, j) => (j === i ? { ...s, ...v } : s)));
  const add = () => setServices((prev) => [...prev, { icon: "\u2728", title: "", desc: "", color: "#00ff6a" }]);
  const remove = (i) => setServices((prev) => prev.filter((_, j) => j !== i));
  const save = () => updateData((prev) => ({ ...prev, services: services.map((s) => ({ ...s })) }));

  return (
    <Section title="services" onSave={save} onReset={resetData}>
      {services.map((s, i) => (
        <div key={i} className="admin-array-card">
          <div className="admin-array-row">
            <input className="admin-input" value={s.icon} onChange={(e) => upd(i, { icon: e.target.value })} placeholder="icon (emoji)" style={{ maxWidth: 60 }} />
            <input className="admin-input" value={s.color} onChange={(e) => upd(i, { color: e.target.value })} placeholder="color hex" style={{ maxWidth: 100 }} />
            <button className="admin-submit admin-remove-btn" onClick={() => remove(i)}>[-]</button>
          </div>
          <input className="admin-input" value={s.title} onChange={(e) => upd(i, { title: e.target.value })} placeholder="service title" />
          <textarea className="admin-input admin-textarea" value={s.desc} onChange={(e) => upd(i, { desc: e.target.value })} placeholder="description" rows={2} />
        </div>
      ))}
      <button className="admin-submit" onClick={add}>[+ Add]</button>
    </Section>
  );
}

function AchievementsEditor() {
  const { data, updateData, resetData } = useContent();
  const [achs, setAchs] = useState(data.achievements.map((a) => ({ ...a })));

  const upd = (i, v) => setAchs((prev) => prev.map((a, j) => (j === i ? { ...a, ...v } : a)));
  const add = () => setAchs((prev) => [...prev, { icon: "\uD83C\uDFC6", label: "", detail: "" }]);
  const remove = (i) => setAchs((prev) => prev.filter((_, j) => j !== i));
  const save = () => updateData((prev) => ({ ...prev, achievements: achs.map((a) => ({ ...a })) }));

  return (
    <Section title="achievements" onSave={save} onReset={resetData}>
      {achs.map((a, i) => (
        <div key={i} className="admin-array-row">
          <input className="admin-input" value={a.icon} onChange={(e) => upd(i, { icon: e.target.value })} placeholder="icon" style={{ maxWidth: 50 }} />
          <input className="admin-input" value={a.label} onChange={(e) => upd(i, { label: e.target.value })} placeholder="label" />
          <input className="admin-input" value={a.detail} onChange={(e) => upd(i, { detail: e.target.value })} placeholder="detail" />
          <button className="admin-submit admin-remove-btn" onClick={() => remove(i)}>[-]</button>
        </div>
      ))}
      <button className="admin-submit" onClick={add}>[+ Add]</button>
    </Section>
  );
}

function MarqueeEditor() {
  const { data, updateData, resetData } = useContent();
  const [items, setItems] = useState([...data.marquee]);

  const upd = (i, v) => setItems((prev) => prev.map((it, j) => (j === i ? v : it)));
  const add = () => setItems((prev) => [...prev, ""]);
  const remove = (i) => setItems((prev) => prev.filter((_, j) => j !== i));
  const save = () => updateData((prev) => ({ ...prev, marquee: items.map((i) => i) }));

  return (
    <Section title="marquee" onSave={save} onReset={resetData}>
      {items.map((item, i) => (
        <div key={i} className="admin-array-row">
          <input className="admin-input" value={item} onChange={(e) => upd(i, e.target.value)} placeholder="technology name" />
          <button className="admin-submit admin-remove-btn" onClick={() => remove(i)}>[-]</button>
        </div>
      ))}
      <button className="admin-submit" onClick={add}>[+ Add]</button>
    </Section>
  );
}

function AdminField({ label, value, onChange, textarea }) {
  const Tag = textarea ? "textarea" : "input";
  return (
    <div className="admin-field">
      <div className="admin-label">{label}</div>
      <Tag
        className={`admin-input ${textarea ? "admin-textarea" : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={textarea ? 3 : undefined}
      />
    </div>
  );
}
