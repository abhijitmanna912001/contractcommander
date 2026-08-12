import type { ApiErrorBody, ContractReport, UploadResponse } from "./types";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    if (body?.error) return body.error;
  } catch {
    // response body wasn't JSON — fall through to the generic message below.
  }
  return `Request failed with status ${response.status}`;
}

export async function uploadContract(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/contracts/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }

  return (await response.json()) as UploadResponse;
}

export async function getContractReport(contractId: string): Promise<ContractReport> {
  const response = await fetch(`${API_BASE_URL}/api/contracts/${contractId}/report`);

  if (!response.ok) {
    throw new ApiError(await parseErrorMessage(response), response.status);
  }

  return (await response.json()) as ContractReport;
}
