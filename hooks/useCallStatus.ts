import { GetCallStatusResponseModel } from "@/models/GetCallStatusResponseModel";
import { useEffect, useState } from "react";

export type UseCallStatusResult = {
  status?: GetCallStatusResponseModel;
  history: GetCallStatusResponseModel[];
  setStatus: (status: GetCallStatusResponseModel) => void;
};

export function useCallStatus({
  callSid,
}: {
  callSid?: string;
}): UseCallStatusResult {
  const [status, setStatus] = useState<GetCallStatusResponseModel>({
    status: "idle",
    timestamp: new Date(),
  });
  const [history, setHistory] = useState<GetCallStatusResponseModel[]>([]);

  useEffect(() => {
    if (!callSid) return;
    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/call/status?callSid=${callSid}`);
        const data: GetCallStatusResponseModel = await res.json();
        setStatus(data);
        setHistory((val) => [...val, data]);
      } catch (e) {
        console.log("--- fetch status error", e);
      }
    };
    const intervalId = setInterval(fetchStatus, 1000);
    return () => clearInterval(intervalId);
  }, [callSid]);

  return { status, history, setStatus };
}
