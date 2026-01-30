import { CallStatus } from "@/types/call";

export type GetCallStatusResponseModel = {
  status: CallStatus;
  timestamp: Date;
};
