export enum IssueStatusType {
  none = 0,
  new = 1,
  inProcess = 2,
  completed = 3,
  cancelled = 4,
  onHold = 5,
  requested = 6,
}

export interface Issue {
  ID: number;
  title: string;
  responsible: any;
  statusName: string;
  statusTypeID: IssueStatusType;
  priorityName: string;
  categoryName: string;
  modifiedDate: string;
}