export interface Project {
  title: string
  description: string
  stack: string[]
  repoLink: string
  liveLink?: string
  image: string
  featured?: boolean
}

export interface SkillGroup {
  title: string
  items: string[]
}

export interface SocialLink {
  label: string
  href: string
}
