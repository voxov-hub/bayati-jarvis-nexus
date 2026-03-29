export interface LovableProject {
  id: string;
  name: string;
  url: string;
  description: string;
}

const STORAGE_KEY = "bayati-lovable-projects";

const DEFAULT_PROJECTS: LovableProject[] = [
  {
    id: "voxov-storefront",
    name: "Voxov Design Storefront",
    url: "https://lovable.dev/projects/voxov-storefront",
    description: "Premium Scandinavian lighting e-commerce storefront",
  },
  {
    id: "bayati-os",
    name: "Voxov Admin / Bayati OS",
    url: "https://lovable.dev/projects/1960e3e0-8f41-4787-8733-76f5e1f36b1d",
    description: "Internal command center, Jarvis AI, business tools",
  },
];

export function getProjects(): LovableProject[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return DEFAULT_PROJECTS;
}

export function saveProjects(projects: LovableProject[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function addProject(project: Omit<LovableProject, "id">): LovableProject {
  const projects = getProjects();
  const newProject: LovableProject = {
    ...project,
    id: project.name.toLowerCase().replace(/\s+/g, "-"),
  };
  projects.push(newProject);
  saveProjects(projects);
  return newProject;
}

export function removeProject(id: string) {
  const projects = getProjects().filter((p) => p.id !== id);
  saveProjects(projects);
}

export function updateProject(id: string, updates: Partial<Omit<LovableProject, "id">>) {
  const projects = getProjects().map((p) =>
    p.id === id ? { ...p, ...updates } : p
  );
  saveProjects(projects);
}
