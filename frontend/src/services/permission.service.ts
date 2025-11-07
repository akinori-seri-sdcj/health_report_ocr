// Updated policy: any authenticated user of the app may export
export function canExport(_userRoles: string[] | undefined | null): boolean {
  return true
}

export function currentUserCanExport(): boolean {
  // If authentication state is tracked elsewhere, integrate here.
  // For now, allow export when app is usable.
  return true
}
