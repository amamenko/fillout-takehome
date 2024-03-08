import axios from "axios";
import { Request, Response } from "express";
import { ResponseFilter } from "../interfaces/ResponseFilter.interface";
import { safeJsonParse } from "./utils/safeJsonParse";
import { ApiFormResponse } from "../interfaces/ApiFormResponse.interface";

export const getFilteredResponses = async (req: Request, res: Response) => {
  // Form ID from path params
  const formId = req.params.formId;

  // Query params, same as responses endpoint but with filters
  const filters = req.query.filters
    ? (safeJsonParse(req.query.filters as string) as
        | ResponseFilter[]
        | undefined)
    : undefined;
  const limit = req.query.limit as string | undefined;
  const afterDate = req.query.afterDate as string | undefined;
  const beforeDate = req.query.beforeDate as string | undefined;
  const offset = req.query.offset as string | undefined;
  const status = req.query.status as "in_progress" | undefined;
  const includeEditLink = req.query.includeEditLink as
    | "true"
    | "false"
    | undefined;
  const sort = req.query.sort as "asc" | "desc" | undefined;

  const finalQueryParamsArr = [
    filters ? `filters=${req.query.filters}` : "",
    // Custom limiting implementation for filters to account for new pages
    limit ? (filters ? "" : `limit=${limit}`) : "",
    afterDate ? `afterDate=${afterDate}` : "",
    beforeDate ? `beforeDate=${beforeDate}` : "",
    // Custom offset implementation for filters to account for new pages
    offset ? (filters ? "" : `offset=${offset}`) : "",
    status ? `status=${status}` : "",
    includeEditLink ? `includeEditLink=${includeEditLink}` : "",
    sort ? `sort=${sort}` : "",
  ].filter((param) => param);
  const finalQueryParams =
    finalQueryParamsArr.length > 0 ? `?${finalQueryParamsArr.join("&")}` : "";

  let formResponses = (await axios
    .get(
      `https://api.fillout.com/v1/api/forms/${formId}/submissions${finalQueryParams}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FILLOUT_API_KEY}`,
        },
      }
    )
    .then((res) => res.data)
    .catch((e) => console.error(e))) as ApiFormResponse | undefined;

  if (filters?.length > 0 && formResponses) {
    const filteredResponses = formResponses.responses.filter((response) => {
      const allQuestions = response.questions;
      const filteredQuestions = allQuestions.filter((question) => {
        const applicableFilter = filters.find(
          (filter) => filter.id === question.id
        );
        if (applicableFilter) {
          // If a filter is found for the question, check whether it meets the filter requirements
          // Else filter it out
          if (applicableFilter.condition === "equals") {
            return applicableFilter.value === question.value;
          } else if (applicableFilter.condition === "does_not_equal") {
            return applicableFilter.value !== question.value;
          } else if (applicableFilter.condition === "greater_than") {
            return applicableFilter.value < question.value;
          } else {
            if (applicableFilter.condition === "less_than") {
              return applicableFilter.value > question.value;
            }
          }
          return true;
        } else {
          // If no filter is found for the question, filter it out
          return false;
        }
      });
      // If there are any questions that meet the filter requirements, keep the response
      return filteredQuestions.length > 0;
    });

    const startingIndex = offset ? Number(offset) : 0;
    formResponses.responses = limit
      ? filteredResponses.slice(startingIndex, startingIndex + Number(limit))
      : filteredResponses;
    formResponses.totalResponses = filteredResponses.length;
    formResponses.pageCount = Math.ceil(
      filteredResponses.length /
        (typeof limit === "undefined" ? 150 : Number(limit))
    );
  }

  res.send(formResponses);
};
