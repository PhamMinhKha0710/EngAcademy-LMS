/** Unwrap Spring Page { content: T[] } or legacy plain array from ApiResponse.data */
export function unwrapPageData<T>(data: T[] | { content?: T[] } | null | undefined): T[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && Array.isArray(data.content)) return data.content
  return []
}
