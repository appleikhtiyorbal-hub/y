const API = 'https://api.github.com'
const REPO = 'appleikhtiyorbal-hub/y'
const BRANCH = 'main'

export const TOKEN_KEY = 'uy360_github_token'

export function getSavedToken(): string {
  return localStorage.getItem(TOKEN_KEY) ?? ''
}

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token.trim())
}

function headers(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

type RepoFile = {
  sha: string
  content: string
}

export async function readRepoFile(token: string, path: string): Promise<RepoFile> {
  const response = await fetch(
    `${API}/repos/${REPO}/contents/${path}?ref=${BRANCH}`,
    { headers: headers(token) },
  )
  if (!response.ok) {
    throw new Error(`Fayl o‘qilmadi: ${path} (${response.status})`)
  }
  return (await response.json()) as RepoFile
}

export async function writeRepoFile(
  token: string,
  path: string,
  contentBase64: string,
  message: string,
  sha?: string,
) {
  const response = await fetch(`${API}/repos/${REPO}/contents/${path}`, {
    method: 'PUT',
    headers: {
      ...headers(token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: contentBase64,
      branch: BRANCH,
      sha,
    }),
  })
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Yozilmadi: ${path} (${response.status}) ${body}`)
  }
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

export function textToBase64(text: string): string {
  return bytesToBase64(new TextEncoder().encode(text))
}

export function decodeGitHubContent(content: string): string {
  const binary = atob(content.replace(/\n/g, ''))
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

export async function fileToJpegBase64(file: File, maxWidth: number): Promise<string> {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxWidth / bitmap.width)
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Rasm qisqartirilmadi')
  context.drawImage(bitmap, 0, 0, width, height)
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => (value ? resolve(value) : reject(new Error('JPEG yozilmadi'))),
      'image/jpeg',
      0.82,
    )
  })
  return bytesToBase64(new Uint8Array(await blob.arrayBuffer()))
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32) || 'uy'
}
