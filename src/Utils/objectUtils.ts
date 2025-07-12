export function removeNulls(obj: Record<string, any>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value !== null && value !== undefined
    )
  );
}
