import type { IconType } from 'react-icons'
import {
  SiReact, SiNextdotjs, SiTypescript, SiJavascript, SiTailwindcss, SiMui,
  SiHtml5, SiCss, SiRedux, SiGreensock, SiNodedotjs, SiExpress, SiMongodb,
  SiMysql, SiJsonwebtokens, SiRazorpay, SiGit, SiGithub, SiPostman,
  SiRender, SiCloudinary, SiVercel, SiLeetcode,
} from 'react-icons/si'
import { TbApi } from 'react-icons/tb'

export interface Skill {
  label: string
  icon?: IconType
}

export interface SkillGroupIconed {
  title: string
  items: Skill[]
}

export const skillGroups: SkillGroupIconed[] = [
  {
    title: 'Frontend',
    items: [
      { label: 'React.js', icon: SiReact },
      { label: 'Next.js', icon: SiNextdotjs },
      { label: 'TypeScript', icon: SiTypescript },
      { label: 'JavaScript', icon: SiJavascript },
      { label: 'Tailwind CSS', icon: SiTailwindcss },
      { label: 'Material UI', icon: SiMui },
      { label: 'Redux', icon: SiRedux },
      { label: 'GSAP', icon: SiGreensock },
      { label: 'HTML5', icon: SiHtml5 },
      { label: 'CSS3', icon: SiCss },
    ],
  },
  {
    title: 'Backend',
    items: [
      { label: 'Node.js', icon: SiNodedotjs },
      { label: 'Express.js', icon: SiExpress },
      { label: 'MongoDB', icon: SiMongodb },
      { label: 'SQL', icon: SiMysql },
      { label: 'REST APIs', icon: TbApi },
      { label: 'JWT Auth', icon: SiJsonwebtokens },
      { label: 'Razorpay', icon: SiRazorpay },
    ],
  },
  {
    title: 'Tools',
    items: [
      { label: 'Git', icon: SiGit },
      { label: 'GitHub', icon: SiGithub },
      { label: 'Postman', icon: SiPostman },
      { label: 'MongoDB Atlas', icon: SiMongodb },
      { label: 'Render', icon: SiRender },
      { label: 'Cloudinary', icon: SiCloudinary },
      { label: 'Vercel', icon: SiVercel },
      { label: 'LeetCode', icon: SiLeetcode },
    ],
  },
]
