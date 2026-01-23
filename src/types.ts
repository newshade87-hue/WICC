export const WICC_MEMBERS = [
    "Member 1", "Member 2", "Member 3", "Member 4", "Member 5"
].sort();

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
    created_at?: string;
}

export const calculatePoints = (format: MatchFormat, score1: number, score2: number): { pts1: number; pts2: number } => {
    if (score1 > score2) return { pts1: format === '1-Inning' ? 2 : 3, pts2: 0 };
    if (score2 > score1) return { pts1: 0, pts2: format === '1-Inning' ? 2 : 3 };
    return { pts1: 1, pts2: 1 };
};
