export interface ApiFormResponse {
  responses: {
    submissionId: string;
    submissionTime: string;
    lastUpdatedAt: string;
    questions: {
      id: string;
      name: string;
      type:
        | "LongAnswer"
        | "ShortAnswer"
        | "DatePicker"
        | "NumberInput"
        | "MultipleChoice"
        | "EmailInput";
      value: number | string | null;
    }[];
    calculations: [];
    urlParameters: [];
    quiz: {};
    documents: [];
  }[];
  totalResponses: number;
  pageCount: number;
}
