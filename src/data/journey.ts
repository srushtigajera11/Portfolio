export interface JourneyStop {
  period: string
  title: string
  place: string
  points: string[]
}

export const journey: JourneyStop[] = [
  {
    period: 'Currently',
    title: 'Building something new',
    place: 'Classified. Even from her.',
    points: [
      'A side project that hasn\'t decided what it wants to be yet — updates when it confesses',
    ],
  },
  {
    period: 'Currently',
    title: 'MERN Stack Developer',
    place: 'Working full-stack, professionally',
    points: [
      'Building production MERN applications — where "it works on my machine" is no longer a valid defense',
      'Shipping features across the stack: React frontends, Node/Express APIs, MongoDB schemas',
    ],
  },
  {
    period: '3 months',
    title: 'Node.js Developer Intern',
    place: 'Backend engineering',
    points: [
      'Built REST APIs with Node.js and Express; designed MongoDB schemas and CRUD operations',
      'Implemented authentication and middleware; tested APIs with Postman',
    ],
  },
  {
    period: '1.5 months',
    title: 'React Developer Intern',
    place: 'Frontend engineering',
    points: [
      'Built reusable UI components with React, hooks, and REST API integration',
      'Enhanced UI with Material UI and CSS',
    ],
  },
]
