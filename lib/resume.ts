// Resume Builder data model. One generic shape renders in either template:
//   • 'classic' — small-caps headings, LaTeX look (the Prachi Shetty layout)
//   • 'bold'    — big bold serif name, UPPERCASE headings (the Deepak layout)
// Entries have a left/right line pair so education ("School · Place" /
// "Degree · Years") and jobs ("Role · Dates" / "Company · City") both fit.

export type ResumeTemplate = 'classic' | 'bold';

export interface ResumeEntry {
  id: string;
  title: string;
  titleRight: string;
  subtitle: string;
  subtitleRight: string;
  /** Shown after the title as "Title | tech" — for projects. */
  tech: string;
  /** One bullet per line. **bold** is supported. */
  bullets: string;
}

export interface ResumeLine {
  id: string;
  label: string;
  value: string;
}

export interface ResumeSection {
  id: string;
  title: string;
  kind: 'entries' | 'lines';
  entries: ResumeEntry[];
  lines: ResumeLine[];
  /** Joins label and value in 'lines' sections: "Backend: Node.js" or "Head – Club". */
  sep: ':' | '–';
}

export interface ResumeData {
  label: string;
  template: ResumeTemplate;
  name: string;
  /** One contact per line (email, phone, links). */
  contacts: string;
  sections: ResumeSection[];
  createdAt: number;
}

export const uid = () => Math.random().toString(36).slice(2, 10);

export const emptyEntry = (): ResumeEntry => ({
  id: uid(), title: '', titleRight: '', subtitle: '', subtitleRight: '', tech: '', bullets: '',
});

export const emptySection = (kind: ResumeSection['kind'], title = 'New Section'): ResumeSection => ({
  id: uid(), title, kind, entries: kind === 'entries' ? [emptyEntry()] : [], lines: kind === 'lines' ? [{ id: uid(), label: '', value: '' }] : [], sep: ':',
});

const entry = (e: Partial<ResumeEntry>): ResumeEntry => ({ ...emptyEntry(), ...e });
const line = (label: string, value: string): ResumeLine => ({ id: uid(), label, value });

export function blankResume(template: ResumeTemplate = 'bold'): ResumeData {
  return {
    label: 'New resume',
    template,
    name: 'Your Name',
    contacts: 'you@example.com\n+91 00000 00000\nlinkedin.com/in/you',
    sections: [
      { ...emptySection('entries', 'Education') },
      { ...emptySection('entries', 'Experience') },
      { ...emptySection('entries', 'Projects') },
      { ...emptySection('lines', 'Technical Skills') },
    ],
    createdAt: Date.now(),
  };
}

// Starting point: the user's own resume.
export function defaultResume(): ResumeData {
  return {
    label: 'My resume',
    template: 'bold',
    name: 'Deepak Poojary',
    contacts: [
      'poojarydeepak15@gmail.com',
      '+91 6361673801',
      'https://github.com/deepakpoojary',
      'LeetCode: https://leetcode.com/u/deepakpoojary/',
      'https://deepakpoojary.netlify.app/',
    ].join('\n'),
    sections: [
      {
        id: uid(), title: 'Education', kind: 'entries', lines: [], sep: ':',
        entries: [entry({ title: 'NMAM Institute of Technology', subtitle: 'B.E. — Information Science Engineering', subtitleRight: '2020 – 2024' })],
      },
      {
        id: uid(), title: 'Experience', kind: 'entries', lines: [], sep: ':',
        entries: [
          entry({
            title: 'Backend Developer', titleRight: 'Dec 2025 – Present', subtitle: 'Chipsy', subtitleRight: 'Udupi',
            bullets: [
              'Developed and maintained Node.js backend APIs and server-side business logic for production applications.',
              'Built asynchronous backend workflows using AWS Lambda and SQS, reducing image indexing time by 60%.',
              'Developed geo-location APIs and optimized MongoDB/database queries and indexing for low-latency data retrieval.',
              'Built backend recommendation workflows using AWS Bedrock and Redis, improving API performance through caching and asynchronous processing.',
              'Integrated third-party services and implemented reliable backend workflows with appropriate error handling and asynchronous processing.',
              'Diagnosed and resolved backend issues while improving API performance and application reliability.',
            ].join('\n'),
          }),
          entry({
            title: 'Full Stack Developer', titleRight: 'Apr 2024 – Nov 2025', subtitle: 'Krishitantra', subtitleRight: 'Mangalore',
            bullets: [
              'Built backend services using Node.js, GraphQL, Apollo Gateway, and MongoDB for microservice-based applications.',
              'Developed APIs and integrated frontend components with server-side business logic and data services.',
              'Designed and optimized MongoDB aggregation pipelines and database queries for efficient data retrieval.',
              'Worked with authentication, API integrations, asynchronous operations, and communication between backend services.',
              'Containerized applications using Docker and deployed backend services on GCP.',
            ].join('\n'),
          }),
        ],
      },
      {
        id: uid(), title: 'Projects', kind: 'entries', lines: [], sep: ':',
        entries: [
          entry({
            title: 'WorkOutFast — Backend / Full Stack', tech: 'Node.js | Express.js | MongoDB | JWT | Docker',
            bullets: [
              'Built reusable and scalable REST APIs using Node.js and Express.js for a workout management platform.',
              'Implemented JWT authentication and protected API endpoints for secure user access.',
              'Designed database models and backend business logic using MongoDB.',
              'Implemented background jobs and asynchronous processing to improve application reliability.',
              'Containerized the application using Docker and deployed cloud-ready backend services.',
            ].join('\n'),
          }),
        ],
      },
      {
        id: uid(), title: 'Technical Skills', kind: 'lines', entries: [], sep: ':',
        lines: [
          line('Backend', 'Node.js, Express.js, TypeScript, JavaScript, REST APIs, GraphQL, Microservices'),
          line('Databases', 'MongoDB, PostgreSQL, SQL, Prisma, Database Schema Design, Query Optimization'),
          line('Security & APIs', 'JWT, Authentication, Authorization, Third-Party API Integration, Postman'),
          line('Cloud & DevOps', 'AWS (Lambda, SQS, EC2), Docker, GitHub Actions, Linux, CI/CD'),
          line('Development', 'Git, Async Programming, Background Jobs, Caching, API Optimization, Testing Fundamentals'),
          line('Frontend', 'React, HTML5, CSS3'),
        ],
      },
    ],
    createdAt: Date.now(),
  };
}
