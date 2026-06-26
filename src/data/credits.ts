export interface ProjectCredit {
  name: string;
  url: string;
  displayUrl: string;
  isOwner?: boolean;
}

export const PROJECT_CREDITS: ProjectCredit[] = [
  {
    name: "StartupVen",
    url: "https://startupven.com",
    displayUrl: "startupven.com",
    isOwner: true,
  },
  {
    name: "Zackness",
    url: "https://pages.zackness.dev",
    displayUrl: "pages.zackness.dev",
  },
];

export const PROJECT_OWNER: ProjectCredit =
  PROJECT_CREDITS.find((credit) => credit.isOwner) ?? PROJECT_CREDITS[0];

/** Public repository URL when published; leave undefined until available. */
export const PROJECT_REPOSITORY_URL: string | undefined =
  "https://github.com/Zackness/emergency-center";

export const PROJECT_IS_OPEN_SOURCE = true;
