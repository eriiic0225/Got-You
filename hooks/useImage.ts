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

  const handleRemove = () => {
    URL.revokeObjectURL(image!.url)  // handleRemove 只在 image 有值時呼叫，所以 ! 斷言安全
    setImage(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  return {
    image,
    handleUpload,
    handleRemove,
    inputRef,
  }
}

export default useImage