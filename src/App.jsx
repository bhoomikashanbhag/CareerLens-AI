
import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useNavigate,
  Navigate
} from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  ChartNoAxesColumn,
  Lightbulb,
  Menu,
  X,
  Upload,
  CheckCircle,
  AlertCircle,
  Target,
  ArrowRight
} from "lucide-react";

const jobSkills = {
  "Java Developer": ["Java", "OOP", "SQL", "HTML", "CSS", "Git"],
  "Web Developer": ["HTML", "CSS", "JavaScript", "React", "Git"],
  "Python Developer": ["Python", "SQL", "OOP", "Git", "Problem Solving"],
  "Frontend Developer": ["HTML", "CSS", "JavaScript", "React", "Git"]
};

function Sidebar({ fileName }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/upload", label: "Resume Upload", icon: FileText },
    { to: "/job-details", label: "Job & Skills", icon: Briefcase },
    { to: "/results", label: "Analysis Results", icon: ChartNoAxesColumn },
    { to: "/suggestions", label: "Suggestions", icon: Lightbulb }
  ];

  return (
    <>
      <button className="mobile-menu" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X /> : <Menu />}
      </button>

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="side-brand">
          <div className="brand-mark">C</div>
          <div>
            <strong>CareerLens</strong>
            <small>Career Companion</small>
          </div>
        </div>

        <div className="side-label">WORKSPACE</div>

        <nav className="side-nav">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => isActive ? "side-link active" : "side-link"}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-box">
            <div className="profile-avatar">S</div>
            <div>
              <strong>Student Workspace</strong>
              <small>{fileName || "Resume not uploaded"}</small>
            </div>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />
      )}
    </>
  );
}

function PageHeader({ title, subtitle }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    </div>
  );
}

function Dashboard({ file, result }) {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Your resume and career progress at a glance."
      />

      <div className="welcome-panel">
        <div>
          <span className="eyebrow">CAREER WORKSPACE</span>
          <h2>Build a stronger profile.</h2>
          <p>Review your skills and understand how they fit your chosen job role.</p>
          <NavLink to="/upload" className="primary-btn">
            Get Started <ArrowRight size={16} />
          </NavLink>
        </div>
        <div className="welcome-icon"><Target size={65} /></div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon purple"><FileText /></div>
          <span>Resume Status</span>
          <strong>{file ? "Uploaded" : "Not uploaded"}</strong>
          <small>{file ? file.name : "Upload your resume to begin"}</small>
        </div>

        <div className="stat-card">
          <div className="stat-icon blue"><Briefcase /></div>
          <span>Selected Job</span>
          <strong>{result ? result.role : "Not selected"}</strong>
          <small>Your preferred career role</small>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><ChartNoAxesColumn /></div>
          <span>Latest Skill Match</span>
          <strong>{result ? `${result.percentage}%` : "--"}</strong>
          <small>{result ? "Based on your entered skills" : "Complete an analysis first"}</small>
        </div>
      </div>

      <div className="content-card">
        <div className="card-heading">
          <div>
            <h3>Getting Started</h3>
            <p>Follow these steps to complete your profile analysis.</p>
          </div>
        </div>

        <div className="getting-started">
          <div><span>01</span><div><strong>Upload your resume</strong><p>Select your resume in PDF format.</p></div></div>
          <div><span>02</span><div><strong>Choose a job role</strong><p>Select the position you are interested in.</p></div></div>
          <div><span>03</span><div><strong>Enter your skills</strong><p>Add the skills you currently know.</p></div></div>
          <div><span>04</span><div><strong>View your results</strong><p>Check matching and missing skills.</p></div></div>
        </div>
      </div>
    </>
  );
}

function UploadPage({ file, setFile }) {
  return (
    <>
      <PageHeader
        title="Resume Upload"
        subtitle="Add your resume to your CareerLens workspace."
      />

      <div className="content-card narrow-card">
        <div className="form-title">
          <div className="stat-icon purple"><Upload /></div>
          <div>
            <h3>Upload your resume</h3>
            <p>Choose a PDF file from your computer.</p>
          </div>
        </div>

        <label className="upload-area">
          <div className="upload-symbol"><FileText size={30} /></div>
          <strong>{file ? file.name : "Select your resume"}</strong>
          <span>{file ? "File selected successfully" : "PDF format only"}</span>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={(e) => {
              const selected = e.target.files?.[0];
              if (!selected) return;

              if (selected.type !== "application/pdf") {
                alert("Please select a PDF file.");
                e.target.value = "";
                return;
              }

              setFile(selected);
            }}
          />
        </label>

        {file && (
          <div className="file-details">
            <CheckCircle size={18} />
            <div><strong>{file.name}</strong><small>{(file.size / 1024).toFixed(1)} KB</small></div>
            <button onClick={() => setFile(null)}>Remove</button>
          </div>
        )}

        <div className="info-note">
          <AlertCircle size={18} />
          <p>This version stores the selected file only in the current browser session. It does not extract resume text yet.</p>
        </div>

        <NavLink to="/job-details" className="primary-btn">
          Continue <ArrowRight size={16} />
        </NavLink>
      </div>
    </>
  );
}

function JobDetails({ role, setRole, skills, setSkills, onAnalyze }) {
  const navigate = useNavigate();

  function handleAnalyze() {
    if (!skills.trim()) {
      alert("Please enter your skills.");
      return;
    }
    onAnalyze();
    navigate("/results");
  }

  return (
    <>
      <PageHeader
        title="Job & Skills"
        subtitle="Choose your preferred job and enter your current skills."
      />

      <div className="content-card narrow-card">
        <div className="form-group">
          <label>Preferred Job Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {Object.keys(jobSkills).map(item => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <small>Select the role you want to prepare for.</small>
        </div>

        <div className="form-group">
          <label>Your Current Skills</label>
          <textarea
            rows="5"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            placeholder="Example: Java, HTML, CSS, SQL, Git"
          />
          <small>Enter skills separated by commas.</small>
        </div>

        <div className="info-note">
          <Lightbulb size={18} />
          <p>Include only the skills you know or have practised. This helps make your comparison more useful.</p>
        </div>

        <button className="primary-btn full-btn" onClick={handleAnalyze}>
          Analyze Skills <ArrowRight size={16} />
        </button>
      </div>
    </>
  );
}

function Results({ result }) {
  if (!result) {
    return (
      <div className="empty-state">
        <ChartNoAxesColumn size={40} />
        <h2>No analysis available</h2>
        <p>Enter your skills and complete an analysis first.</p>
        <NavLink to="/job-details" className="primary-btn">Start Analysis</NavLink>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Analysis Results"
        subtitle={`Your skill comparison for the ${result.role} position.`}
      />

      <div className="result-overview">
        <div className="content-card score-card">
          <span>OVERALL SKILL MATCH</span>
          <div className="big-score">{result.percentage}%</div>
          <div className="score-track"><div style={{ width: `${result.percentage}%` }} /></div>
          <p>{result.matched.length} out of {result.required.length} required skills matched.</p>
        </div>

        <div className="content-card result-summary">
          <h3>Comparison Summary</h3>
          <div><span>Matched skills</span><strong className="green-text">{result.matched.length}</strong></div>
          <div><span>Missing skills</span><strong className="red-text">{result.missing.length}</strong></div>
          <div><span>Selected role</span><strong>{result.role}</strong></div>
        </div>
      </div>

      <div className="result-columns">
        <div className="content-card">
          <h3 className="result-heading"><CheckCircle /> Matching Skills</h3>
          {result.matched.length ? result.matched.map(skill => (
            <div className="skill-item" key={skill}><span>{skill}</span><span className="skill-status good">Matched</span></div>
          )) : <p className="muted">No matching skills found yet.</p>}
        </div>

        <div className="content-card">
          <h3 className="result-heading missing-heading"><AlertCircle /> Skills to Improve</h3>
          {result.missing.length ? result.missing.map(skill => (
            <div className="skill-item" key={skill}><span>{skill}</span><span className="skill-status needs">Missing</span></div>
          )) : <p className="muted">All listed skills are matched.</p>}
        </div>
      </div>

      <div className="page-actions">
        <NavLink to="/suggestions" className="primary-btn">View Suggestions <ArrowRight size={16} /></NavLink>
      </div>
    </>
  );
}

function Suggestions({ result }) {
  return (
    <>
      <PageHeader
        title="Improvement Suggestions"
        subtitle="A few practical steps to strengthen your job profile."
      />

      {!result ? (
        <div className="empty-state">
          <Lightbulb size={40} />
          <h2>Complete your analysis first</h2>
          <p>Your suggestions will appear after you compare your skills.</p>
          <NavLink to="/job-details" className="primary-btn">Start Analysis</NavLink>
        </div>
      ) : (
        <div className="content-card narrow-card">
          <div className="suggestion-intro">
            <div className="stat-icon purple"><Lightbulb /></div>
            <div>
              <h3>Your next learning steps</h3>
              <p>Suggestions based on your {result.role} skill comparison.</p>
            </div>
          </div>

          {result.missing.length ? (
            result.missing.map((skill, index) => (
              <div className="suggestion-item" key={skill}>
                <span className="suggestion-number">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>Learn {skill}</strong>
                  <p>Spend time understanding {skill} and practise it with a small project.</p>
                </div>
              </div>
            ))
          ) : (
            <div className="info-note">
              <CheckCircle size={19} />
              <p>You have matched all the skills listed for this role. Continue practising and build projects to strengthen your experience.</p>
            </div>
          )}

          <div className="info-note">
            <Lightbulb size={18} />
            <p>Try building one small project related to your selected job role and add it to your resume.</p>
          </div>

          <NavLink to="/job-details" className="secondary-btn">Update My Skills</NavLink>
        </div>
      )}
    </>
  );
}

function Workspace() {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("Java Developer");
  const [skills, setSkills] = useState("");
  const [result, setResult] = useState(null);

  function analyze() {
    const enteredSkills = skills.split(",")
      .map(skill => skill.trim().toLowerCase())
      .filter(Boolean);

    const required = jobSkills[role];
    const matched = required.filter(skill =>
      enteredSkills.includes(skill.toLowerCase())
    );
    const missing = required.filter(skill =>
      !enteredSkills.includes(skill.toLowerCase())
    );

    setResult({
      role,
      required,
      matched,
      missing,
      percentage: Math.round((matched.length / required.length) * 100)
    });
  }

  return (
    <div className="workspace">
      <Sidebar fileName={file?.name} />

      <main className="main-area">
        <div className="topbar">
          <span>CareerLens / Workspace</span>
          <span className="topbar-status">Student Project</span>
        </div>

        <div className="page-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard file={file} result={result} />} />
            <Route path="/upload" element={<UploadPage file={file} setFile={setFile} />} />
            <Route path="/job-details" element={
              <JobDetails role={role} setRole={setRole} skills={skills} setSkills={setSkills} onAnalyze={analyze} />
            } />
            <Route path="/results" element={<Results result={result} />} />
            <Route path="/suggestions" element={<Suggestions result={result} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Workspace />
    </BrowserRouter>
  );
}
