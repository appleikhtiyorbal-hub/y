import { useState, type FormEvent } from 'react'
import type { Listing, ListingType } from '../types'
import {
  fileToJpegBase64,
  getSavedToken,
  decodeGitHubContent,
  readRepoFile,
  saveToken,
  slugify,
  textToBase64,
  writeRepoFile,
} from '../lib/github'
import { AdminMap } from './AdminMap'
import { typeLabel } from '../lib/format'

type RoomDraft = {
  key: string
  title: string
  file: File | null
  existingUrl?: string
}

type AdminViewProps = {
  listings: Listing[]
  onClose: () => void
}

const LISTINGS_PATH = 'src/data/listings.json'

const emptyRooms: RoomDraft[] = [{ key: 'zal', title: 'Zal', file: null }]

export function AdminView({ listings, onClose }: AdminViewProps) {
  const [items, setItems] = useState(listings)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [token, setToken] = useState(getSavedToken)
  const [type, setType] = useState<ListingType>('sale')
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState<'USD' | 'UZS'>('USD')
  const [rooms, setRooms] = useState('2')
  const [area, setArea] = useState('')
  const [address, setAddress] = useState('')
  const [lat, setLat] = useState(37.2242)
  const [lng, setLng] = useState(67.2783)
  const [phone, setPhone] = useState('')
  const [telegram, setTelegram] = useState('')
  const [cover, setCover] = useState<File | null>(null)
  const [existingCover, setExistingCover] = useState('')
  const [panos, setPanos] = useState<RoomDraft[]>(emptyRooms)
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')

  function resetForm() {
    setEditingId(null)
    setType('sale')
    setTitle('')
    setPrice('')
    setCurrency('USD')
    setRooms('2')
    setArea('')
    setAddress('')
    setLat(37.2242)
    setLng(67.2783)
    setPhone('')
    setTelegram('')
    setCover(null)
    setExistingCover('')
    setPanos(emptyRooms)
  }

  function fillForm(listing: Listing) {
    setEditingId(listing.id)
    setType(listing.type)
    setTitle(listing.title)
    setPrice(String(listing.price))
    setCurrency(listing.currency)
    setRooms(String(listing.rooms))
    setArea(String(listing.area))
    setAddress(listing.address)
    setLat(listing.lat)
    setLng(listing.lng)
    setPhone(listing.phone)
    setTelegram(listing.telegram)
    setCover(null)
    setExistingCover(listing.cover)
    setPanos(
      listing.panoramas.map((pano) => ({
        key: pano.id,
        title: pano.title,
        file: null,
        existingUrl: pano.url,
      })),
    )
    setStatus(`${listing.title} tahrirlanmoqda`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function addRoom() {
    setPanos((current) => [
      ...current,
      { key: `xona-${current.length + 1}`, title: '', file: null },
    ])
  }

  async function onDelete(listing: Listing) {
    const trimmedToken = token.trim()
    if (!trimmedToken) {
      setStatus('Avval GitHub token kiriting.')
      return
    }
    if (!window.confirm(`“${listing.title}” o‘chirilsinmi?`)) return

    setBusy(true)
    setStatus('O‘chirilmoqda…')
    saveToken(trimmedToken)
    try {
      const current = await readRepoFile(trimmedToken, LISTINGS_PATH)
      const parsed = JSON.parse(decodeGitHubContent(current.content)) as Listing[]
      const nextItems = parsed.filter((item) => item.id !== listing.id)
      await writeRepoFile(
        trimmedToken,
        LISTINGS_PATH,
        textToBase64(`${JSON.stringify(nextItems, null, 2)}\n`),
        `Delete listing ${listing.title}`,
        current.sha,
      )
      setItems(nextItems)
      if (editingId === listing.id) resetForm()
      setStatus('O‘chirildi. 1–2 daqiqada xaritadan ham yo‘qoladi.')
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Xatolik')
    } finally {
      setBusy(false)
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedToken = token.trim()
    if (!trimmedToken) {
      setStatus('GitHub token kiriting.')
      return
    }
    if (!title.trim() || !price || !address.trim()) {
      setStatus('Nom, narx va manzil majburiy.')
      return
    }
    if (!editingId && !cover) {
      setStatus('Yangi e’lon uchun oddiy rasm kerak.')
      return
    }

    const readyPanos = panos.filter(
      (item) => item.title.trim() && (item.file || item.existingUrl),
    )
    if (readyPanos.length === 0) {
      setStatus('Kamida bitta 360° xona kerak.')
      return
    }

    setBusy(true)
    setStatus('Saqlanmoqda…')
    saveToken(trimmedToken)

    try {
      const id = editingId ?? `${slugify(title)}-${Date.now().toString(36)}`
      let coverPath = existingCover

      if (cover) {
        const coverName = `${id}-cover.jpg`
        const coverBase64 = await fileToJpegBase64(cover, 1600)
        await writeRepoFile(
          trimmedToken,
          `public/images/${coverName}`,
          coverBase64,
          `Update cover ${coverName}`,
        )
        coverPath = `/images/${coverName}`
      }

      const uploadedPanos = []
      for (const room of readyPanos) {
        const roomId = slugify(room.title)
        if (room.file) {
          const fileName = `${id}-${roomId}.jpg`
          const panoBase64 = await fileToJpegBase64(room.file, 2048)
          await writeRepoFile(
            trimmedToken,
            `public/pano/${fileName}`,
            panoBase64,
            `Update 360 ${fileName}`,
          )
          uploadedPanos.push({
            id: roomId,
            title: room.title.trim(),
            url: `/pano/${fileName}`,
          })
        } else if (room.existingUrl) {
          uploadedPanos.push({
            id: roomId,
            title: room.title.trim(),
            url: room.existingUrl.replace(/\?.*$/, ''),
          })
        }
      }

      const current = await readRepoFile(trimmedToken, LISTINGS_PATH)
      const parsed = JSON.parse(decodeGitHubContent(current.content)) as Listing[]
      const next: Listing = {
        id,
        type,
        title: title.trim(),
        price: Number(price),
        currency,
        rooms: Number(rooms),
        area: Number(area) || 0,
        address: address.trim(),
        lat,
        lng,
        cover: coverPath,
        panoramas: uploadedPanos,
        phone: phone.trim(),
        telegram: telegram.trim().replace(/^@/, ''),
      }

      const nextItems = editingId
        ? parsed.map((item) => (item.id === editingId ? next : item))
        : [...parsed, next]

      await writeRepoFile(
        trimmedToken,
        LISTINGS_PATH,
        textToBase64(`${JSON.stringify(nextItems, null, 2)}\n`),
        editingId ? `Update listing ${next.title}` : `Add listing ${next.title}`,
        current.sha,
      )
      setItems(nextItems)
      resetForm()
      setStatus(
        'Saqlandi. 1–2 daqiqada sayt yangilanadi: https://appleikhtiyorbal-hub.github.io/y/',
      )
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Xatolik')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin">
      <header className="admin-top">
        <h2>{editingId ? 'Admin — e’lonni o‘zgartirish' : 'Admin — yangi uy'}</h2>
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Yopish
        </button>
      </header>

      <p className="admin-hint">
        Token: GitHub → Settings → Developer settings → Personal access tokens
        (classic), <strong>repo</strong> huquqi.
      </p>

      <label className="admin-field">
        GitHub token
        <input
          type="password"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          autoComplete="off"
        />
      </label>

      <h3>Mavjud e’lonlar</h3>
      <ul className="admin-list">
        {items.map((item) => (
          <li key={item.id} className="admin-listing">
            <span>
              {typeLabel(item.type)} — {item.title}
            </span>
            <div className="admin-listing-actions">
              <button
                type="button"
                className="btn btn-ghost"
                disabled={busy}
                onClick={() => fillForm(item)}
              >
                O‘zgartirish
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                disabled={busy}
                onClick={() => void onDelete(item)}
              >
                O‘chirish
              </button>
            </div>
          </li>
        ))}
      </ul>

      <form className="admin-form" onSubmit={onSubmit}>
        {editingId && (
          <button type="button" className="btn btn-ghost" onClick={resetForm}>
            Yangi e’longa qaytish
          </button>
        )}

        <div className="admin-row">
          <label className="admin-field">
            Turi
            <select
              value={type}
              onChange={(event) => setType(event.target.value as ListingType)}
            >
              <option value="sale">Sotuv</option>
              <option value="rent">Ijara</option>
            </select>
          </label>
          <label className="admin-field">
            Valyuta
            <select
              value={currency}
              onChange={(event) =>
                setCurrency(event.target.value as 'USD' | 'UZS')
              }
            >
              <option value="USD">USD</option>
              <option value="UZS">so‘m</option>
            </select>
          </label>
        </div>

        <label className="admin-field">
          Nomi
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="3 xonali, Markaz"
          />
        </label>

        <div className="admin-row">
          <label className="admin-field">
            Narx
            <input
              type="number"
              min="0"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </label>
          <label className="admin-field">
            Xonalar
            <input
              type="number"
              min="1"
              value={rooms}
              onChange={(event) => setRooms(event.target.value)}
            />
          </label>
          <label className="admin-field">
            m²
            <input
              type="number"
              min="0"
              value={area}
              onChange={(event) => setArea(event.target.value)}
            />
          </label>
        </div>

        <label className="admin-field">
          Manzil
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="MFY, Termiz"
          />
        </label>

        <div className="admin-row">
          <label className="admin-field">
            Telefon
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+99890..."
            />
          </label>
          <label className="admin-field">
            Telegram
            <input
              value={telegram}
              onChange={(event) => setTelegram(event.target.value)}
              placeholder="username"
            />
          </label>
        </div>

        <h3>Uy joyi — xaritadan belgilang</h3>
        <p className="admin-hint">
          Xaritani bosing yoki pinni ushlab kerakli uyga sudrang.
        </p>
        <AdminMap
          lat={lat}
          lng={lng}
          type={type}
          onPick={(nextLat, nextLng) => {
            setLat(nextLat)
            setLng(nextLng)
          }}
        />
        <p className="admin-status">
          Belgilangan joy: {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>

        <label className="admin-field">
          Oddiy rasm {editingId ? '(bo‘sh qoldirsangiz eski rasm qoladi)' : ''}
          <input
            type="file"
            accept="image/*"
            onChange={(event) => setCover(event.target.files?.[0] ?? null)}
          />
        </label>

        <h3>360° xonalar</h3>
        {panos.map((room, index) => (
          <div key={room.key} className="admin-row">
            <label className="admin-field">
              Xona nomi
              <input
                value={room.title}
                onChange={(event) => {
                  const titleValue = event.target.value
                  setPanos((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, title: titleValue } : item,
                    ),
                  )
                }}
                placeholder="Zal"
              />
            </label>
            <label className="admin-field">
              360° rasm {room.existingUrl ? '(ixtiyoriy)' : ''}
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null
                  setPanos((current) =>
                    current.map((item, itemIndex) =>
                      itemIndex === index ? { ...item, file } : item,
                    ),
                  )
                }}
              />
            </label>
          </div>
        ))}
        <button type="button" className="btn btn-ghost" onClick={addRoom}>
          Yana xona
        </button>

        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? 'Saqlanmoqda…' : editingId ? 'O‘zgarishni saqlash' : 'E’lonni saqlash'}
        </button>
        {status && <p className="admin-status">{status}</p>}
      </form>
    </div>
  )
}
