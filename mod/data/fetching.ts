import useSWR, { Fetcher, SWRConfiguration } from "swr"

import { URLs } from "./config"
import { Campaign, Image, LoginData, Report, TokenData, User } from "./models"
import { getToken } from "./store"

export class FetchError extends Error {
  message: string
  response: Response
  data: { detail: [] }

  constructor(msg: string, resp: Response, data: { detail: [] }) {
    super(msg)

    this.name = "FetchError"
    this.message = msg
    this.response = resp
    this.data = data ?? { detail: msg }
  }
}

export const fetchTokenData: Fetcher<TokenData, LoginData> = async creds => {
  const resp = await fetch(URLs.API.LOGIN, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `username=${creds.username}&password=${creds.password}`,
  })

  if (!resp.ok) {
    throw new FetchError(resp.statusText, resp, await resp.json())
  }

  return resp.json()
}

const fetcher: Fetcher<any, string> = async <T>(url: string): Promise<T> => {
  const resp = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  })

  if (!resp.ok) {
    throw new FetchError(resp.statusText, resp, await resp.json())
  }

  return resp.json()
}

type Config = SWRConfiguration

const useFetch = <T>(key: string, cfg?: Config): [T | undefined, boolean] => {
  const { data, error } = useSWR<T, FetchError>(key, fetcher, cfg)

  return [data, error !== undefined]
}

export const useUser = (cfg?: Config) => useFetch<User>(URLs.API.CURRENT, cfg)

export const useImage = (id: number, cfg?: Config) =>
  useFetch<Image>(URLs.API.IMAGE(id), cfg)

export const useSupers = (limit = 10, offset = 0, cfg?: Config) =>
  useFetch<User[]>(URLs.API.SUPERS(limit, offset), cfg)

export const useCampaigns = (limit = 10, offset = 0, cfg?: Config) =>
  useFetch<Campaign[]>(URLs.API.ENDED(limit, offset), cfg)

export const useReports = (limit = 10, offset = 0, cfg?: Config) =>
  useFetch<Report[]>(URLs.API.REPORTS(limit, offset), cfg)

const mutator = async <T = void>(
  url: string,
  method: "POST" | "PUT" | "DELETE" = "POST"
): Promise<T> => {
  const resp = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  })
  const data = await resp.json()

  if (!resp.ok) {
    throw new FetchError(resp.statusText, resp, data)
  }

  return data as T
}

export const greenlight = (campaignID: number) =>
  mutator(URLs.API.GREENLIGHT(campaignID, true))
export const ungreenlight = (campaignID: number) =>
  mutator(URLs.API.GREENLIGHT(campaignID, false))

export const lock = (campaignID: number) =>
  mutator(URLs.API.LOCK(campaignID, true))
export const unlock = (campaignID: number) =>
  mutator(URLs.API.LOCK(campaignID, false))

export const promote = (userID: number) =>
  mutator(URLs.API.GREENLIGHT(userID, true))
export const demote = (userID: number) =>
  mutator(URLs.API.GREENLIGHT(userID, false))

export const ban = (userID: number) => mutator(URLs.API.LOCK(userID, true))
export const unban = (userID: number) => mutator(URLs.API.LOCK(userID, false))

export const dismiss = (reportID: number) =>
  mutator(URLs.API.REPORTS(reportID), "DELETE")
