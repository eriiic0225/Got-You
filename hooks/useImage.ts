import { useRef, useState } from "react"

interface UploadedImage {
  name: string
  url: string
  file: File
}

// 允許的 MIME 類型（與 accept="image/*" 對應，但更精準）
const ALLOWED_TYPES = /^image\/(jpeg|png|webp|gif)$/
const MAX_SIZE_MB = 5

function useImage() {
  const inputRef = useRef<HTMLInputElement>(null) // ref是用來直接操縱 DOM 元素(file inupt)用的
  const [image, setImage] = useState<UploadedImage|null>(null)
  // 驗證失敗訊息（檔案類型 / 大小錯誤）；上傳到 Storage 失敗是呼叫端各自管的另一種 error
  const [error, setError] = useState<string | null>(null)

  // 共用：驗證檔案 + 建立預覽 URL + 寫入 state
  // handleUpload 與 handlePaste 都走這條路，DRY 且驗證只寫一處
  const setImageFromFile = (file: File) => {
    if (!ALLOWED_TYPES.test(file.type)) {
      setError('僅支援 jpg / png / webp / gif 格式')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`檔案大小不能超過 ${MAX_SIZE_MB} MB`)
      return
    }
    setError(null)
    setImage({ name: file.name, url: URL.createObjectURL(file), file })
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return  // 沒選到檔案就跳出
    setImageFromFile(file)
  }

  // 使用者主動移除圖片（按叉叉 / Backspace）：revoke object URL 釋放記憶體
  const handleRemove = () => {
    URL.revokeObjectURL(image!.url)  // handleRemove 只在 image 有值時呼叫，所以 ! 斷言安全
    setImage(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  // 送出後程式化清空：不 revoke object URL
  // 原因：樂觀更新的 MessageBubble 還在用這個 URL 顯示預覽，revoke 會讓圖片破圖
  const clearImage = () => {
    setImage(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const file = e.clipboardData.files[0]
    if (!file || !file.type.startsWith('image/')) return
    e.preventDefault()
    // 跟 handleUpload 做一樣的事，但來源是剪貼簿
    setImageFromFile(file)
  }

  return {
    image,
    error,
    handleUpload,
    handlePaste,
    handleRemove,
    clearImage,
    inputRef,
  }
}

export default useImage