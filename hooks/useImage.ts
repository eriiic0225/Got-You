import { useRef, useState } from "react"

interface UploadedImage {
  name: string
  url: string
  file: File
}

function useImage() {
  const inputRef = useRef<HTMLInputElement>(null) // ref是用來直接操縱 DOM 元素(file inupt)用的
  const [image, setImage] = useState<UploadedImage|null>(null)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return  // 沒選到檔案就跳出

    const imageURL = URL.createObjectURL(file)
    setImage({ name: file.name, url: imageURL, file: file })
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
    const imageURL = URL.createObjectURL(file)
    // 跟 handleUpload 做一樣的事，但來源是剪貼簿
    setImage({ name: file.name, url: imageURL, file: file })
  }

  return {
    image,
    handleUpload,
    handlePaste,
    handleRemove,
    clearImage,
    inputRef,
  }
}

export default useImage