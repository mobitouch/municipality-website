export interface HomeCard {
  title: string;
  desc: string;
  href: string;
}

export interface TimelineItem {
  title: string;
  desc: string;
}

export interface CouncilMember {
  name: string;
  role: string;
  avatarSeed: string;
  avatarBg: string;
}

export interface ServiceCategory {
  title: string;
  desc: string;
}

export interface GuideStep {
  title: string;
  desc: string;
}

export interface ComplaintTypeOption {
  value: string;
  label: string;
}

export interface TrackStep {
  title: string;
  status: string;
}

export interface NewsArticle {
  title: string;
  desc: string;
  date: string;
  image: string;
  category?: string;
  readMinutes?: number;
}

export type ProjectStatus = "done" | "progress";

export interface ProjectItem {
  title: string;
  desc: string;
  status: ProjectStatus;
  progress: number;
  image: string;
  aspect: string;
}

export interface DigitalCard {
  title: string;
  desc: string;
}

export interface DigitalStat {
  value: number;
  prefix: string;
  suffix: string;
  label: string;
}
