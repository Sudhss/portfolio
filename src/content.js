/* Everything the site says, in one place. `stops` holds the sections;
 * `tour` is the order you visit them in, and where the camera is for each:
 * a layer of the zoom (src/zoom/layers) and, optionally, a shot inside it. */

export const person = {
  name: "Sudhanshu Shukla",
  born: "2005-04-23",
  place: "Greater Noida, India",
  email: "shuklasudhanshu230405@gmail.com",
  resume: "https://drive.google.com/file/d/1FsrJ9cA7nbWRvG7sRwN89J9b9El06dzE/view?usp=sharing",
  links: {
    github: "https://github.com/Sudhss",
    linkedin: "https://www.linkedin.com/in/Sudhss/",
    instagram: "https://instagram.com/sudh.sss",
    youtube: "https://www.youtube.com/channel/UCDJvfrnOpYxnVdWuJpP-5Mw",
    leetcode: "https://leetcode.com/u/Sudhss/",
    codeforces: "https://codeforces.com/profile/OnCallGuy",
    codechef: "https://www.codechef.com/users/sudhsss",
  },
  // Formspree form the old site used.
  form: "https://formspree.io/f/manjgokj",
};

/* Ratings as of the last build; the CP stop refreshes them from the GitHub
 * profile's data.json (rebuilt every 6 hours) when it can. */
export const ratings = {
  source: "https://raw.githubusercontent.com/Sudhss/Sudhss/output/data.json",
  leetcode: { rating: 2176, badge: "Guardian", top: 1.05, contests: 26, solved: 987 },
  codeforces: { rating: 1604, rank: "Expert", peak: 1604, contests: 8 },
  codechef: { rating: 2050, stars: 5, peak: 2080, solved: 200 },
  contributions: 1043,
};

export function age(now = new Date()) {
  const b = new Date(person.born);
  let a = now.getFullYear() - b.getFullYear();
  if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) a -= 1;
  return a;
}

export const stops = [
  {
    id: "home",
    kicker: "Start",
    title: "Sudhanshu Shukla",
    hero: true,
    body: [
      "Systems and backend engineer, and a competitive programmer. Final year at NIET, Greater Noida.",
      "This is a bike ride along a coast road. Scroll and I'll pedal; each stop along the way is a part of what I do.",
    ],
  },
  {
    id: "about",
    kicker: "The viewpoint",
    title: "Hi, I'm Sudhanshu",
    body: [
      () => `I'm ${age()}, based in Greater Noida, and most of what I build is the part nobody sees: servers, databases, the machinery under an editor.`,
      "I like knowing how a thing works all the way down, so I usually end up writing it myself. So far that's a code editor, a SQL database, a railway traffic system and, slowly, a browser engine.",
      "The rest of the time it's competitive programming, and chess (1800+) when I want to think slower.",
    ],
  },
  {
    id: "skills",
    kicker: "The market",
    title: "What I work with",
    groups: [
      ["Languages", ["C++", "Python", "C", "JavaScript", "Java"]],
      ["Backend", ["Node.js", "Express", "FastAPI", "REST", "WebSockets", "Next.js"]],
      ["Data", ["MySQL", "MongoDB", "Redis"]],
      ["Systems", ["Qt 6", "CMake", "API design", "Microservices", "High-level design"]],
      ["Front", ["React", "Three.js", "WebGL", "HTML and CSS"]],
      ["Tooling", ["Git", "GitHub Actions", "GitLab", "Docker", "Linux"]],
    ],
  },
  {
    id: "education",
    kicker: "School and college",
    title: "Education",
    entries: [
      {
        head: "B.Tech, Artificial Intelligence and Machine Learning",
        where: "NIET, Greater Noida",
        when: "2023 to 2027",
        text: "Final year, graduating in 2027.",
      },
      {
        head: "Higher Secondary, Computer Science",
        where: "Army Public School No. 2, Jabalpur",
        when: "2020 to 2022",
        text: "Computer science with Python and C, and mathematics.",
      },
    ],
  },
  {
    id: "experience",
    kicker: "Two offices",
    title: "Work",
    entries: [
      {
        head: "Frontend Developer Intern",
        where: "ScholarRank AI",
        href: "https://www.scholarrank.com/",
        when: "Jul to Sep 2025, remote",
        points: [
          "Designed the architecture for an applicant intake platform built for 10 to 20 thousand applicants a cycle. Proposed RabbitMQ as the buffer between submission and ATS scoring; the senior engineers kept it in the final build.",
          "Built the applicant portal in Next.js, front and back: the forms, the API routes and the database layer, with a target under 2 seconds at load.",
          "Put the HR-facing server behind its own ingress, with read replicas and Gmail API notifications for accept and reject.",
        ],
        note: "The title says frontend. It was a startup, and I took the whole thing end to end.",
      },
      {
        head: "SDE Intern",
        where: "Infera AI Labs",
        when: "Apr to Jun 2025, Delhi",
        points: [
          "Built the frontend, the backend, and probably part of the internet in the process.",
          "Designed UIs, wrote APIs, managed databases, and silently panicked through deployments.",
          "Stack: React, Node.js, MongoDB, duct tape and sheer willpower.",
        ],
        note: "A friend's startup, so it isn't on my resume. Still waiting for someone to tell me what my role actually was.",
      },
    ],
  },
  {
    id: "valence",
    kicker: "Project",
    title: "Valence",
    project: {
      line: "A code editor written from nothing in C++ and Qt: its own text buffer, tokenizer, renderer and undo, plus a built-in judge for competitive programming.",
      detail: "It redraws only what's on screen, so it holds 60 frames a second whatever the file size.",
      tech: ["C++", "Qt 6", "QPainter"],
      site: "https://valence-website.vercel.app/",
      repo: "https://github.com/Sudhss/Valence",
    },
  },
  {
    id: "railflow",
    kicker: "Project",
    title: "RailFlow",
    project: {
      line: "Traffic control for 500 km of railway. Dijkstra routes every train, a reinforcement-learning agent handles congestion, and when a section closes, trains are rerouted around it.",
      detail: "Down there, one line is closed, and the trains take the long way round.",
      tech: ["Python", "React", "Three.js", "WebSockets", "OpenAI Gym"],
      site: "https://rail-flow-website.vercel.app/",
      repo: "https://github.com/Sudhss/RailFlow",
    },
  },
  {
    id: "axios",
    kicker: "Project, in progress",
    title: "Axios-Sovereign",
    project: {
      line: "An autonomous SRE. A C++ sentinel catches failures in under 10 ms, agents argue about the root cause, and the fix runs with an audit trail in Jira.",
      detail: "Watch the scoring cluster: it fails every ten seconds, and gets fixed without anyone touching it.",
      tech: ["C++", "Python", "FastAPI", "LLMs", "Jira API"],
      repo: "https://github.com/Sudhss/Axios-Sovereign",
    },
  },
  {
    id: "moodmate",
    kicker: "Project",
    title: "MoodMate",
    project: {
      line: "An AI companion that runs entirely on your machine: LLaMA 3 through Ollama, with personalities you can switch between (sarcastic, honest, supportive) and memory kept in SQLite.",
      detail: "Nothing leaves the laptop.",
      tech: ["React", "Flask", "Ollama", "LLaMA 3", "SQLite"],
      site: "https://mood-mate-pi.vercel.app/",
      repo: "https://github.com/Sudhss/moodmate",
    },
  },
  {
    id: "workshop",
    kicker: "The workshop",
    title: "On the bench",
    list: [
      ["Mini SQL RDB", "A relational database with a hand-written SQL parser, B+Tree storage and a volcano executor.", "https://github.com/Sudhss/fromScratch---Mini-SQL-RDB-"],
      ["Mini Chromium", "A browser engine from scratch: HTML tokenizer, DOM, layout and paint. In progress.", "https://github.com/Sudhss/fromScratch---Mini-Chromium-Engine"],
      ["EducredChain", "Academic credentials on Polygon, stored on IPFS, signed in with MetaMask. A team project.", "https://github.com/thechessguy2400-design/EducredChain"],
    ],
  },
  {
    id: "cp",
    kicker: "Three peaks",
    title: "Competitive programming",
    cp: true,
    body: ["This is where algorithms actually run. Mine, lately:", "The numbers update from my GitHub profile every six hours."],
  },
  {
    id: "achievements",
    kicker: "The chess plaza",
    title: "A few results",
    entries: [
      { head: "Google BigCode 2026, semi-finalist", text: "Top 1% of the field." },
      { head: "HackIndia 2025, finalist", text: "One of India's larger Web3 hackathons." },
      { head: "Chess, 1800+", text: "Rated over 1800." },
      { head: "LeetCode Guardian", text: "Top 1% by contest rating." },
    ],
  },
  {
    id: "contributions",
    kicker: "The free library",
    title: "Things I've put out",
    list: [
      ["Company-wise LeetCode problems", "Problems grouped by the company that asks them, 40+ companies, for interview prep.", "https://github.com/Sudhanshu-shukl/Company-Wise-LeetCode-Problems"],
      ["DSA and low-level tutorials", "A YouTube channel on data structures, algorithms and systems programming.", "https://www.youtube.com/channel/UCDJvfrnOpYxnVdWuJpP-5Mw"],
      ["Resume template", "The ATS-friendly template I use, free to copy.", "https://docs.google.com/document/d/1dNqwYXKRNK7tn2BxECBUKymcS9OBEfkh/edit?usp=sharing&ouid=110849747074630112692&rtpof=true&sd=true"],
      ["A roadmap to FAANG-ready", "From second-year fundamentals to interviews: DSA, CP, CS basics, projects, system design.", "https://drive.google.com/file/d/1tIRzrBOchXwopHkSzDiRiJSNIjlLNjEG/view?usp=sharing"],
    ],
  },
  {
    id: "contact",
    kicker: "End of the road",
    title: "Say hello",
    contact: true,
    body: ["Work, a collaboration, or just a hello."],
  },
];

/* The tour, innermost first. */
export const tour = [
  {
    id: "intro",
    layer: "transistor",
    title: "Sudhanshu Shukla",
    hero: true,
    body: [
      "Systems and backend engineer, competitive programmer. Final year at NIET, Greater Noida.",
      "You're looking at one transistor. From here we zoom out through every layer of a computer, all the way to the planet it's wired across. My work is on the way.",
    ],
  },
  { id: "about", layer: "gates", include: ["about"] },
  { id: "cp", layer: "core", include: ["cp"] },
  { id: "skills", layer: "die", include: ["skills"] },
  { id: "bench", layer: "board", focus: "bench", include: ["workshop"] },
  { id: "valence", layer: "laptop", focus: "valence", include: ["valence"] },
  { id: "moodmate", layer: "laptop", focus: "moodmate", include: ["moodmate"] },
  {
    id: "experience",
    layer: "datacenter",
    title: "Work",
    body: ["The four halls down there are the pipeline I designed at ScholarRank: intake, a queue, scoring, and read replicas."],
    include: ["experience"],
  },
  { id: "axios", layer: "datacenter", focus: "axios", include: ["axios"] },
  { id: "railflow", layer: "city", focus: "railflow", include: ["railflow"] },
  { id: "education", layer: "city", focus: "education", include: ["education"] },
  { id: "achievements", layer: "planet", include: ["achievements"] },
  { id: "contributions", layer: "planet", focus: "cables", include: ["contributions"] },
  { id: "contact", layer: "planet", focus: "home", include: ["contact"], last: true },
];

/* Said when you try to go past either end. */
export const edges = {
  end: "That's as far as I go. I don't really get out much, so the solar system will have to wait.",
  start: "Smaller than this and it's physics, not software.",
};
