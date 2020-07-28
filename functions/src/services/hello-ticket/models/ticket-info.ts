import { firestore } from 'firebase/app';

export type ticketInfo = {
  id?: string;
  title: string | null;
  applicationPeriod: string | null;
  confirmPeriodForWinAndLose: string | null;
  depositDeadline: string | null;
  performanceDay: string | null;
  meetingPlace: string | null;
  openingTime: string | null;
  startTime: string | null;
  fetchedAt: firestore.Timestamp | null;
  createdAt: firestore.Timestamp | null;
};

// export const blankFeedMemo: FeedMemo = {
//   title: null,
//   author: null,
//   publisher: null,
//   releaseDate: null,
//   isbn: null,
//   fetchedAt: null,
//   createdAt: null,
// };
