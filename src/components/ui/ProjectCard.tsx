import Image from "next/image";
import type { Project } from "@/types";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="border rounded-xl overflow-hidden">
      <Image
        src={project.image}
        alt={project.title}
        width={640}
        height={360}
        className="w-full aspect-video object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg">{project.title}</h3>
        <p className="text-sm mt-2">{project.description}</p>
        <ul className="flex flex-wrap gap-2 mt-3 text-xs">
          {project.stack.map((tech) => (
            <li key={tech} className="border rounded-full px-2 py-0.5">
              {tech}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex gap-4 text-sm">
          <a href={project.repoLink} target="_blank" rel="noopener noreferrer">
            Repository
          </a>
          {project.liveLink && (
            <a href={project.liveLink} target="_blank" rel="noopener noreferrer">
              Live demo
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
