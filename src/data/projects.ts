import type { Project } from '@/types'

export const projects: Project[] = [
  {
    title: 'Learnify – LMS',
    description:
      'Full-stack Learning Management System built with the MERN stack featuring authentication, course enrollment, wishlist, and payment integration using Razorpay.',
    stack: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'JWT', 'Razorpay'],
    repoLink: 'https://github.com/srushtigajera11/Learnify-lms',
    image: '/projects/lms.jpg',
    featured: true,
  },
  {
    title: 'TaskFlow – Task Manager API',
    description:
      'REST API inspired by Jira for managing projects and tasks with JWT authentication, role-based authorization, priority levels, and due dates.',
    stack: ['Node.js', 'Express.js', 'MongoDB', 'JWT', 'MVC'],
    repoLink: 'https://github.com/srushtigajera11/TaskFlow',
    image: '/projects/task.webp',
    featured: true,
  },
  {
    title: 'ShopEase – React Cart App',
    description:
      'E-commerce frontend with cart functionality including add, remove, quantity update, and dynamic pricing using React Hooks and reusable components.',
    stack: ['React.js', 'JavaScript', 'Tailwind CSS', 'React Hooks'],
    repoLink: 'https://github.com/srushtigajera11/ShopEase',
    image: '/projects/shop.jpg',
  },
  {
    title: 'Weather App',
    description:
      'React application that fetches real-time weather data from an API with search functionality and responsive UI.',
    stack: ['React.js', 'JavaScript', 'API', 'CSS'],
    repoLink: 'https://github.com/srushtigajera11/Weather-App',
    image: '/projects/weather.png',
  },
  {
    title: 'Portfolio Website',
    description:
      'Personal developer portfolio built using React and Tailwind CSS showcasing projects, skills, and GitHub profile.',
    stack: ['React.js', 'Tailwind CSS', 'JavaScript'],
    repoLink: 'https://github.com/srushtigajera11/Portfolio',
    image: '/projects/code.jpg',
  },
  {
    title: 'Airline Reservation System',
    description:
      'A Java desktop application for managing flight bookings, customer profiles, and ticketing using Swing UI and MySQL.',
    stack: ['Java', 'MySQL', 'Swing'],
    repoLink: 'https://github.com/srushtigajera11/Airline-Reservation-System',
    image: '/projects/air.webp',
  },
]
