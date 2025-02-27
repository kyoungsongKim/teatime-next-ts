import type {ReportItem} from "src/types/report";

import axios, {endpoints} from "src/utils/axios";

export async function sendReport(reportData: ReportItem) {
  const URL = `${endpoints.report.email}`;
  const res = await axios.post(URL, reportData);

  return res;
}
