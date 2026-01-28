export interface PlayerProfile {
    name: string;
    department: string;
    sports: string[]; // ['cricket', 'tennis']
    role: 'Bowler' | 'Batsman' | 'All-rounder';
    skill: number; // 1-10 for balancing
}

export const PLAYER_DATA: Record<string, PlayerProfile> = {
    'Manthan': { name: 'Manthan', department: 'Batsman', sports: ['cricket', 'tennis'], role: 'Batsman', skill: 8 },
    'Prince': { name: 'Prince', department: 'All-rounder', sports: ['cricket', 'tennis'], role: 'All-rounder', skill: 9 },
    'Kabi': { name: 'Kabi', department: 'All-rounder', sports: ['cricket', 'tennis'], role: 'All-rounder', skill: 8 },
    'Feroz': { name: 'Feroz', department: 'Bowler', sports: ['cricket', 'tennis'], role: 'Bowler', skill: 7 },
    'Nitin': { name: 'Nitin', department: 'Batsman', sports: ['cricket', 'tennis'], role: 'Batsman', skill: 7 },
    'Yash': { name: 'Yash', department: 'Bowler', sports: ['cricket', 'tennis'], role: 'Bowler', skill: 8 },
    'Prasath': { name: 'Prasath', department: 'Specialist Bowler', sports: ['cricket'], role: 'Bowler', skill: 10 },
    'Samir': { name: 'Samir', department: 'Specialist Batsman', sports: ['cricket'], role: 'Batsman', skill: 9 },
    'Anshul': { name: 'Anshul', department: 'Tennis Pro', sports: ['tennis'], role: 'All-rounder', skill: 7 },
    'Vijay': { name: 'Vijay', department: 'Bowler', sports: ['cricket'], role: 'Bowler', skill: 6 },
    'Vivek': { name: 'Vivek', department: 'All-rounder', sports: ['cricket', 'tennis'], role: 'All-rounder', skill: 8 },
    'Shree': { name: 'Shree', department: 'All-rounder', sports: ['cricket', 'tennis'], role: 'All-rounder', skill: 9 },
    'Karthik': { name: 'Karthik', department: 'Batsman', sports: ['cricket'], role: 'Batsman', skill: 8 },
    'Adithya': { name: 'Adithya', department: 'Bowler', sports: ['cricket'], role: 'Bowler', skill: 7 },
    'Shubha': { name: 'Shubha', department: 'All-rounder', sports: ['cricket', 'tennis'], role: 'All-rounder', skill: 8 },
    'Atul': { name: 'Atul', department: 'All-rounder', sports: ['cricket', 'tennis'], role: 'All-rounder', skill: 7 }
};

export const WICC_MEMBERS = Object.keys(PLAYER_DATA).sort();

export type MatchFormat = '1-Inning' | '2-Innings';

export interface MatchData {
    id?: string;
    date: string;
    matchnumber: string;
    innings: MatchFormat;
    teamonename: string;
    teamtwoname: string;
    teamonescore: string;
    teamtwoscore: string;
    teamoneinn1: string;
    teamoneinn2: string;
    teamtwoinn1: string;
    teamtwoinn2: string;
    overs: string;
    resulttype: string;
    teamonepoints: string;
    teamtwopoints: string;
    moi1: string;
    moi2: string;
    mom: string;
    mos: string;
    winmargin: string;
    is_archived?: boolean;
}

export interface TeamMember {
    id: string;
    name: string;
    team: 'blue' | 'orange';
    department?: string;
    created_at?: string;
}

export const calculatePoints = (format: MatchFormat, score1: number, score2: number): { pts1: number; pts2: number } => {
    if (score1 > score2) return { pts1: format === '1-Inning' ? 2 : 3, pts2: 0 };
    if (score2 > score1) return { pts1: 0, pts2: format === '1-Inning' ? 2 : 3 };
    return { pts1: 1, pts2: 1 };
};
