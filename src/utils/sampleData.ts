import { EventItem } from '../types/event';

export const SAMPLE_EVENTS: EventItem[] = [
  {
    id: 101,
    title: 'Inaugural Ceremony & Tech Keynote',
    description: 'Welcome address by University Chancellor and invited chief guest from Microsoft Research on future computing.',
    date: '2026-10-26',
    startTime: '08:30',
    endTime: '09:30',
    venue: 'Auditorium A',
    category: 'Academic',
    organizer: 'Dept. of Computer Science & Engg',
    priority: 'High',
    status: 'Upcoming',
    maxParticipants: 500,
  },
  {
    id: 102,
    title: 'Keynote: Next-Gen Autonomous AI Systems',
    description: 'Deep dive into multimodal foundation models, self-supervised reasoning, and distributed robotics.',
    date: '2026-10-26',
    startTime: '09:30',
    endTime: '11:30',
    venue: 'Auditorium A',
    category: 'Technical',
    organizer: 'AI & Data Science Student Chapter',
    priority: 'High',
    status: 'Upcoming',
    maxParticipants: 450,
  },
  {
    id: 103,
    title: 'Hands-on Cloud Microservices Workshop',
    description: 'Building resilient containerized architectures using Kubernetes, gRPC, and distributed caching.',
    date: '2026-10-26',
    startTime: '10:00',
    endTime: '13:00',
    venue: 'Tech Lab 102',
    category: 'Workshop',
    organizer: 'Cloud Computing Club',
    priority: 'Medium',
    status: 'Upcoming',
    maxParticipants: 60,
  },
  {
    id: 104,
    title: 'Robotics & Drone Systems Live Expo',
    description: 'Hardware demonstration of autonomous navigation drones and robotic arms. (Scheduled overlapping with Keynote in Auditorium A for demo!)',
    date: '2026-10-26',
    startTime: '10:30',
    endTime: '12:30',
    venue: 'Auditorium A', // INTENTIONAL CONFLICT WITH EVENT 102!
    category: 'Technical',
    organizer: 'Robotics Society',
    priority: 'High',
    status: 'Upcoming',
    maxParticipants: 300,
  },
  {
    id: 105,
    title: '24-Hour CodeSprint Hackathon: Round 1',
    description: 'Sprint ideation and architecture pitch for smart campus, climate tech, and healthcare problems.',
    date: '2026-10-26',
    startTime: '13:00',
    endTime: '18:00',
    venue: 'Innovation Hub',
    category: 'Hackathon',
    organizer: 'ACM Student Chapter',
    priority: 'High',
    status: 'Upcoming',
    maxParticipants: 150,
  },
  {
    id: 106,
    title: 'Cybersecurity Capture the Flag (CTF)',
    description: 'Jeopardy-style binary exploitation, web security penetration testing, and reverse engineering contest.',
    date: '2026-10-27',
    startTime: '09:00',
    endTime: '12:00',
    venue: 'Tech Lab 102',
    category: 'Technical',
    organizer: 'Information Security Guild',
    priority: 'Medium',
    status: 'Upcoming',
    maxParticipants: 80,
  },
  {
    id: 107,
    title: 'Algorithms in Industry: Graph & Greedy Systems',
    description: 'Special guest lecture from Uber routing engineer on real-time graph algorithms and shortest-path heuristics.',
    date: '2026-10-27',
    startTime: '14:00',
    endTime: '16:00',
    venue: 'Seminar Hall B',
    category: 'Academic',
    organizer: 'IEEE Computer Society',
    priority: 'Medium',
    status: 'Upcoming',
    maxParticipants: 200,
  },
  {
    id: 108,
    title: 'Cultural Evening: Symphony & Battle of Bands',
    description: 'Inter-college musical evening, acoustic performances, fusion bands, and theatrical performances.',
    date: '2026-10-27',
    startTime: '18:00',
    endTime: '21:30',
    venue: 'Amphitheatre',
    category: 'Cultural',
    organizer: 'Student Cultural Council',
    priority: 'Low',
    status: 'Upcoming',
    maxParticipants: 800,
  },
  {
    id: 109,
    title: 'Inter-Department Chess Championship',
    description: 'Rapid swiss tournament with FIDE time control: 15 minutes + 10 seconds increment.',
    date: '2026-10-28',
    startTime: '10:00',
    endTime: '15:00',
    venue: 'Main Sports Complex',
    category: 'Sports',
    organizer: 'Sports & Wellness Board',
    priority: 'Low',
    status: 'Upcoming',
    maxParticipants: 64,
  },
  {
    id: 110,
    title: '24-Hour CodeSprint Hackathon: Grand Finale & Demos',
    description: 'Top 10 shortlisted finalist teams pitch live working prototypes before venture capital judges.',
    date: '2026-10-28',
    startTime: '14:00',
    endTime: '17:00',
    venue: 'Auditorium A',
    category: 'Hackathon',
    organizer: 'ACM Student Chapter',
    priority: 'High',
    status: 'Upcoming',
    maxParticipants: 400,
  },
  {
    id: 111,
    title: 'Web3 & Decentralized Storage Bootcamp',
    description: 'Interactive tutorial on cryptographic hashing, Merkle trees, and IPFS distributed file indexing.',
    date: '2026-10-28',
    startTime: '09:00',
    endTime: '12:00',
    venue: 'Seminar Hall B',
    category: 'Workshop',
    organizer: 'Blockchain Research Lab',
    priority: 'Medium',
    status: 'Upcoming',
    maxParticipants: 120,
  },
  {
    id: 112,
    title: 'Valedictory & Awards Ceremony',
    description: 'Distribution of prizes, certificates, best project accolades, and formal symposium conclusion.',
    date: '2026-10-28',
    startTime: '17:30',
    endTime: '19:30',
    venue: 'Auditorium A',
    category: 'Academic',
    organizer: 'Organizing Secretariat',
    priority: 'High',
    status: 'Upcoming',
    maxParticipants: 500,
  },
  {
    id: 113,
    title: 'Symposium Lab Pre-Briefing & Check-in',
    description: 'Faculty briefing for organizing committees, student badge distribution, and lab hardware test runs.',
    date: '2026-10-24',
    startTime: '09:00',
    endTime: '11:30',
    venue: 'Innovation Hub',
    category: 'Academic',
    organizer: 'Faculty Advisory Board',
    priority: 'Medium',
    status: 'Completed',
    maxParticipants: 120,
  },
  {
    id: 114,
    title: 'DSA Micro-Project Collaborative Hack Night',
    description: 'Live coding session for competitive teams finalizing tree and graph benchmark implementations.',
    date: '2026-10-24',
    startTime: '21:00',
    endTime: '23:15',
    venue: 'Tech Lab 102',
    category: 'Technical',
    organizer: 'ACM Student Chapter',
    priority: 'High',
    status: 'Ongoing',
    maxParticipants: 80,
  },
  {
    id: 115,
    title: 'Late-Night Algorithm Complexity Optimization',
    description: 'Peer code reviews on space-time efficiency for Merge Sort and BST balanced rotation heuristics.',
    date: '2026-10-24',
    startTime: '23:30',
    endTime: '23:59',
    venue: 'Tech Lab 102',
    category: 'Workshop',
    organizer: 'Competitive Coding Club',
    priority: 'Medium',
    status: 'Upcoming',
    maxParticipants: 45,
  }
];

export const VENUE_LIST = [
  'Auditorium A',
  'Seminar Hall B',
  'Tech Lab 102',
  'Innovation Hub',
  'Amphitheatre',
  'Main Sports Complex'
];

export const CATEGORY_LIST = [
  'Technical',
  'Workshop',
  'Cultural',
  'Hackathon',
  'Academic',
  'Sports'
] as const;

/**
 * Safely ensures the intentional demonstration conflict exists in the event list.
 * Modifies event #104 to collide with event #102 on Auditorium A, 2026-10-26 (10:30–12:30 vs 09:30–11:30).
 * If either event is missing, it adds them safely without modifying any other user events.
 */
export function ensureDemoConflict(currentEvents: EventItem[]): { updated: EventItem[]; message: string } {
  let updatedList = [...currentEvents];
  const event102 = updatedList.find(e => e.id === 102);
  const event104 = updatedList.find(e => e.id === 104);

  if (event102 && event104) {
    // Both exist: re-align #104 to create the intentional 60-min overlap with #102
    updatedList = updatedList.map(e => {
      if (e.id === 104) {
        return {
          ...e,
          venue: event102.venue,
          date: event102.date,
          startTime: '10:30',
          endTime: '12:30',
          status: 'Upcoming' as const
        };
      }
      return e;
    });
    return {
      updated: updatedList,
      message: `Demonstration conflict loaded between Event #102 ("${event102.title}") and Event #104 ("${event104.title}") in ${event102.venue} on ${event102.date}.`
    };
  }

  // If one or both are missing, restore the sample conflict pair
  const default102 = SAMPLE_EVENTS.find(e => e.id === 102)!;
  const default104 = SAMPLE_EVENTS.find(e => e.id === 104)!;

  if (!event102) updatedList.push(default102);
  if (!event104) updatedList.push(default104);

  return {
    updated: updatedList,
    message: 'Demonstration conflict restored in Auditorium A (60-minute interval overlap between #102 and #104).'
  };
}
