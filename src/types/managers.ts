export interface Managers {
  home: string;
  away: string;
}

export interface Manager {
  id: string
  homeManager?: string
  awayManager?: string 
}