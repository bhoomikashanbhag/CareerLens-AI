
import React, { useState } from "react";
import { extractPdfText } from "./utils/pdfExtractor";
import "./App.css";

const defaultJobs = [
  {
    name: "Software Developer",
    skills: ["Java", "Python", "C++", "JavaScript", "Data Structures", "OOP", "SQL", "Git"]
  },
  {
    name: "Frontend Developer",
    skills: ["HTML", "CSS", "JavaScript", "React", "Responsive Design", "Git"]
  },
  {
    name: "Backend Developer",
    skills: ["Java", "Python", "Node.js", "SQL", "MongoDB", "REST API", "Git"]
  },
  {
    name: "Full Stack Developer",
    skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "SQL", "MongoDB", "Git"]
  },
  {
    name: "Data Analyst",
    skills: ["Python", "SQL", "Excel", "Power BI", "Statistics", "Data Visualization"]
  },
  {
    name: "AI/ML Engineer",
    skills: ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "Data Science", "SQL"]
  }
];

function App() {
  const [page, setPage] = useState("home");
  const [jobType, setJobType] = useState("default");
  const [selectedJob, setSelectedJob] = useState("Software Developer");
  const [customTitle, setCustomTitle] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleFile = (e) => {
    const selected = e.target.files[0];
    setError("");

    if (!selected) return;

    if (selected.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      setFile(null);
      return;
    }

    if (selected.size > 15 * 1024 * 1024) {
      setError("Maximum PDF size is 15 MB.");
      setFile(null);
      return;
    }

    setFile(selected);
  };

  const analyzeResume = async () => {
    if (!file) {
      setError("Please upload a resume.");
      return;
    }

    if (jobType === "custom" &&
      (!customTitle.trim() || !customDescription.trim())) {
      setError("Enter both the job title and job description.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const text = await extractPdfText(file);

      let jobName;
      let requiredSkills;

      if (jobType === "default") {
        const job = defaultJobs.find(
          item => item.name === selectedJob
        );

        jobName = job.name;
        requiredSkills = job.skills;
      } else {
        jobName = customTitle.trim();

        // Extract skill keywords from the recruiter's description.
        const skillDictionary = [
          "Java", "Python", "C", "C++", "JavaScript",
          "React", "Angular", "Vue", "Node.js", "HTML",
          "CSS", "SQL", "MySQL", "MongoDB", "AWS",
          "Azure", "Docker", "Kubernetes", "Git", "GitHub",
          "Machine Learning", "Deep Learning", "TensorFlow",
          "PyTorch", "Data Science", "Power BI", "Excel",
          "Statistics", "Data Visualization", "REST API",
          "Networking", "Linux", "Cybersecurity",
          "Communication", "Problem Solving", "Data Structures",
          "OOP", "Figma", "UI/UX", "Testing", "Agile",
          "Spring Boot", "Django", "Flask", "PHP",
          "TypeScript", "Next.js", "PostgreSQL", "Tableau",
          "Leadership", "Project Management"
        ];

        const description = customDescription.toLowerCase();

        requiredSkills = skillDictionary.filter(skill => {
          const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          return new RegExp(`(^|[^a-z0-9+#])${escaped.toLowerCase()}($|[^a-z0-9+#])`, "i")
            .test(description);
        });

        // Include the title as an additional source of skill keywords.
        const title = customTitle.toLowerCase();

        skillDictionary.forEach(skill => {
          if (
            title.includes(skill.toLowerCase()) &&
            !requiredSkills.includes(skill)
          ) {
            requiredSkills.push(skill);
          }
        });

        if (requiredSkills.length === 0) {
          throw new Error(
            "No supported skills were identified in the job description. Add technical skills such as Python, Java, SQL or React."
          );
        }
      }

      const normalize = value => value.toLowerCase();

      const matchedSkills = requiredSkills.filter(skill => {
        const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`(^|[^a-z0-9+#])${escaped.toLowerCase()}($|[^a-z0-9+#])`, "i")
          .test(text);
      });

      const missingSkills = requiredSkills.filter(
        skill => !matchedSkills.includes(skill)
      );

      const percentage = Math.round(
        matchedSkills.length / requiredSkills.length * 100
      );

      const suggestions = [];

      if (missingSkills.length > 0) {
        suggestions.push(
          "Consider developing these skills: " +
          missingSkills.join(", ") + "."
        );
      }

      if (!/project/i.test(text)) {
        suggestions.push(
          "Include a Projects section with practical work."
        );
      }

      if (!/education/i.test(text)) {
        suggestions.push(
          "Add a clearly structured Education section."
        );
      }

      if (!/internship|experience/i.test(text)) {
        suggestions.push(
          "Include relevant internship or practical experience, if available."
        );
      }

      if (!/github|linkedin|portfolio/i.test(text)) {
        suggestions.push(
          "Add your professional profile or portfolio links."
        );
      }

      if (suggestions.length === 0) {
        suggestions.push(
          "Your resume covers the identified job requirements. Continue improving your practical experience and projects."
        );
      }

      setResult({
        jobName,
        percentage,
        matchedSkills,
        missingSkills,
        requiredSkills,
        suggestions,
        text
      });

      setPage("results");

    } catch (err) {
      setError(err.message || "Resume analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">

      <nav className="navbar">
        <h2 className="logo" onClick={() => setPage("home")}>
          CareerLens<span>.</span>
        </h2>

        <div className="navlinks">
          <button onClick={() => setPage("home")}>Home</button>
          <button onClick={() => setPage("analyze")}>Screen Resume</button>
          <button onClick={() => setPage("about")}>About</button>
        </div>
      </nav>

      {page === "home" && (
        <section className="hero">
          <div className="hero-content">
            <p className="tag">RESUME SCREENING SYSTEM</p>

            <h1>
              Find the right match
              <br />
              <span>for every opportunity.</span>
            </h1>

            <p className="description">
              Upload a resume, choose a job role or enter
              your own job requirements. Evaluate skills
              and discover areas for improvement.
            </p>

            <button
              className="primary-btn"
              onClick={() => setPage("analyze")}
            >
              Start Screening →
            </button>
          </div>

          <div className="hero-card">
            <h3>CareerLens Features</h3>
            <div className="feature-row">✓ PDF Resume Reading</div>
            <div className="feature-row">✓ Six Default Job Roles</div>
            <div className="feature-row">✓ Custom Job Requirements</div>
            <div className="feature-row">✓ Skills Matching</div>
            <div className="feature-row">✓ Match Percentage</div>
            <div className="feature-row">✓ Improvement Suggestions</div>
          </div>
        </section>
      )}

      {page === "analyze" && (
        <section className="content-page">
          <p className="tag">RECRUITER WORKSPACE</p>
          <h1>Resume Screening</h1>
          <p className="description">
            Select a job role or enter your own requirements
            to evaluate the candidate's resume.
          </p>

          <div className="section-card">
            <h3>1. Select Job Type</h3>

            <div className="choice-row">
              <button
                className={jobType === "default" ? "choice active" : "choice"}
                onClick={() => {
                  setJobType("default");
                  setError("");
                }}
              >
                Default Jobs
              </button>

              <button
                className={jobType === "custom" ? "choice active" : "choice"}
                onClick={() => {
                  setJobType("custom");
                  setError("");
                }}
              >
                Custom Job
              </button>
            </div>

            {jobType === "default" ? (
              <>
                <label>Select Job Role</label>

                <div className="job-grid">
                  {defaultJobs.map(job => (
                    <button
                      key={job.name}
                      className={
                        selectedJob === job.name
                          ? "job-card selected"
                          : "job-card"
                      }
                      onClick={() => setSelectedJob(job.name)}
                    >
                      <strong>{job.name}</strong>
                      <span>{job.skills.length} required skills</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="custom-form">
                <label>Job Title</label>
                <input
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="Example: Cybersecurity Analyst"
                />

                <label>Job Description</label>
                <textarea
                  value={customDescription}
                  onChange={e => setCustomDescription(e.target.value)}
                  placeholder="Enter job responsibilities and required skills..."
                  rows={6}
                />
              </div>
            )}
          </div>

          <div className="section-card">
            <h3>2. Upload Candidate Resume</h3>

            <div className="upload-box">
              <div className="upload-icon">↑</div>
              <h3>Upload PDF Resume</h3>
              <p>Normal and scanned PDFs supported · Maximum 15 MB</p>

              <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFile}
              />

              {file && (
                <p className="file-name">
                  ✓ {file.name}
                </p>
              )}
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <button
            className="primary-btn"
            onClick={analyzeResume}
            disabled={loading}
          >
            {loading ? "Analyzing Resume..." : "Analyze Candidate →"}
          </button>

          {loading && (
            <p className="loading-text">
              Extracting resume information and checking skills.
              Please wait...
            </p>
          )}
        </section>
      )}

      {page === "results" && result && (
        <section className="content-page">
          <p className="tag">SCREENING REPORT</p>
          <h1>Candidate Analysis</h1>
          <p className="description">
            Job Position: <strong>{result.jobName}</strong>
          </p>

          <div className="score-card">
            <p>Resume Match Percentage</p>
            <div className="score">{result.percentage}%</div>
            <p>
              {result.matchedSkills.length} of{" "}
              {result.requiredSkills.length} required skills matched
            </p>
          </div>

          <div className="section-card">
            <h3>Matching Skills</h3>
            <div className="skill-list">
              {result.matchedSkills.length ? (
                result.matchedSkills.map(skill => (
                  <span className="skill found" key={skill}>
                    ✓ {skill}
                  </span>
                ))
              ) : (
                <p>No matching skills detected.</p>
              )}
            </div>
          </div>

          <div className="section-card">
            <h3>Missing Skills</h3>
            <div className="skill-list">
              {result.missingSkills.length ? (
                result.missingSkills.map(skill => (
                  <span className="skill missing" key={skill}>
                    + {skill}
                  </span>
                ))
              ) : (
                <p>All identified skills were found.</p>
              )}
            </div>
          </div>

          <div className="section-card">
            <h3>Suggestions for Improvement</h3>
            {result.suggestions.map((suggestion, index) => (
              <p className="suggestion" key={index}>
                {index + 1}. {suggestion}
              </p>
            ))}
          </div>

          <div className="section-card">
            <h3>Extracted Resume Content</h3>
            <div className="extracted-text">{result.text}</div>
          </div>

          <button
            className="primary-btn"
            onClick={() => {
              setResult(null);
              setFile(null);
              setPage("analyze");
            }}
          >
            Screen Another Candidate
          </button>
        </section>
      )}

      {page === "about" && (
        <section className="content-page">
          <p className="tag">ABOUT CAREERLENS</p>
          <h1>About the Project</h1>
          <p className="description">
            CareerLens is a resume screening system that
            compares candidate resumes with job requirements.
            It helps recruiters identify matching skills,
            missing skills and areas for improvement.
          </p>

          <div className="section-card">
            <h3>Technology and Features</h3>
            <p>• React.js interface</p>
            <p>• PDF.js for PDF text extraction</p>
            <p>• Tesseract.js for OCR</p>
            <p>• Resume skill matching</p>
            <p>• Custom job requirement analysis</p>
          </div>
        </section>
      )}

      <footer>
        <h3>CareerLens.</h3>
        <p>Resume Screening and Analysis System</p>
        <p>© 2026 CareerLens</p>
      </footer>

    </div>
  );
}

export default App;
