export const RESUME_DATA = {
  personal: {
    name: "Rudy Chen",
    title: "Data Scientist & Full Stack Engineer",
    location: "Brisbane, Australia",
    email: "rudy871211@gmail.com",
    phone: "+61 xxxxxx",
    github: "https://github.com/AAAZZZR", // 根據你提供的 repo 推斷
    linkedin: "https://www.linkedin.com/in/rudy1211/", // 建議填入你的 LinkedIn ID
    website: "https://sportodd.xyz", // 使用你的 Project 連結作為展示
    bio: "Fresh graduate in Data Science with experience across software engineering and data analytics. Skilled in SQL and Python for data analysis, with hands-on machine learning project experience. Experienced in cloud computing (AWS, GCP, Azure), bridging the gap between engineering and data to deliver practical solutions.",
  },
  
  skills: [
    "Python",
    "JavaScript / TypeScript",
    "SQL",
    "Next.js",
    "FastAPI",
    "AWS / Azure / GCP",
    "Databricks",
    "PowerBI",
    "n8n Automation",
    "LangChain / LLMs",
    "PyTorch",
    "Docker",
    "CAD"
  ],

  languages: [
    "Mandarin (Native)",
    "English (Professional)"
  ],

  experience: [
    {
      company: "Contract (Australia)",
      role: "Robotics Engineer",
      period: "Sep 2025 - Nov 2025",
      description: "Developed Python scripts to convert workpiece dimensions from database into robot arm drilling coordinates. Designed and optimized robot tasks using flow-based control blocks within Omron's HMI environment.",
      tags: ["Python", "Robotics", "HMI", "Automation"],
    },
    {
      company: "Private Crypto Fund",
      role: "Crypto Analyst (Operation)",
      period: "Oct 2021 - Apr 2023",
      description: "Discovered market hot spots and authored analyst reports. Managed and operated protocol events.",
      tags: ["Data Analysis", "Market Research", "Crypto"],
    },
  ],

  projects: [
    {
      title: "Sport Betting Website (off line)",
      description: "A full-stack web application with automated data ingestion. Designed an ETL pipeline that retrieves sports odds from APIs every hour and stores them in Azure SQL Database.",
      link: "https://sportodd.xyz/",
      tech: ["Next.js", "FastAPI", "Azure Functions", "Azure SQL", "ETL"],
    },
    {
      title: "LLM Automation Application",
      description: "Built prototype applications leveraging Ollama (Llama, DeepSeek) and OpenAI API. Integrated LLM workflows with n8n for text generation and automation tasks.",
      link: "https://github.com/AAAZZZR/RAG_assistance_v1/tree/main", 
      tech: ["Ollama", "OpenAI API"],
    },
    {
      title: "Forecasting QLD Electricity Price (Capstone)",
      description: "Collected large-scale electricity market data (AEMO) and weather records. Designed an end-to-end ETL pipeline and implemented XGBoost, Transformer, and LSTM models to forecast prices.",
      link: "https://github.com/AAAZZZR/Capstone_UQ",
      tech: ["Python", "XGBoost", "Web Scraping","Machine Learning"],
    },
    {
      title: "Human Anatomy Interaction Interface",
      description: "Developed an interactive human anatomy interface using SVG graphics. Collaborated with healthcare coaches to integrate FHIR-compliant APIs for connecting anatomy interfaces with standardized healthcare data.",
      link: "https://github.com/comp3820/2024-smart-health",
      tech: ["SVG", "FHIR API", "Healthcare Data"],
    },
  ],

  education: [
    {
      school: "University of Queensland",
      degree: "Master of Data Science", // 根據 UQ 學制推斷，若為學士請改為 Bachelor
      year: "2025",
    },
    {
      school: "National Taiwan University",
      degree: "Bachelor in Mechanical Engineering",
      year: "2021",
    },
  ],
};