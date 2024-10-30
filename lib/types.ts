export interface About {
  eTag: string;
  schemaVersion: string;
  server: string;
  serverVersion: string;
  serverTimeStamp: string;
}

export interface AbsenceReason {
  color?: string;
  description?: string;
}

export interface Timeframe {}

export interface DisplaySchedule {
  scheduleID: string;
  scheduleDescription: string;
  session: {
    startDate: string;
    endDate: string;
  };
  effectivity: {
    startDate: string;
    endDate: string;
  };
  weekspan: {
    weekdayStart: number;
    weekdayEnd: number;
  };
  display: {
    todayHeaderColor: string;
  };
  lessonTimes: any[];
  supervisionTimes: any[];
  eventTimes: any[];
}

export interface Absence {
  reasonRef?: string;
  roomRef?: string;
  teacherRef?: string;
}

export interface Course {
  courseTypeRef?: string;
  remarks?: string;
  studentRefs?: string[];
  subjectRef?: string;
}

export interface Teacher {
    id:string,
    code:string,
  lastName?: string;
  teamRefs?: string[];
  color?: string;
}

export interface Room {
  teamRefs?: string[];
  description?: string;
}

export interface Subject {
  id?: string;
  code?: string;
  description?: string;
}

export interface Result {
  teacherAbsenceReasons: AbsenceReason[];
  classAbsenceReasons: AbsenceReason[];
  roomAbsenceReasons: AbsenceReason[];
  timeframes: Timeframe[];
  firstLesson: string;
  displaySchedule: DisplaySchedule;
  classAbsences: Absence[];
  roomAbsences: Absence[];
  teacherAbsences: Absence[];
  courses: Course[];
  teachers: Teacher[];
  rooms: Room[];
  subjects: Subject[];
  teams: any[];
  buildings: any[];
  classes: any[];
}

export interface User {
  profile: string;
  policy: number;
  logbutton: boolean;
}

export interface DemoJson {
  about: About;
  result: Result;
  user: User;
}
