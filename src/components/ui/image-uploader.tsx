import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react";
import { useRef } from "react"

export default function ImageUploader({ onFilesSelected, loading = false,
}: {
  onFilesSelected: (files: FileList) => void, loading?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const handleClick = () => {
    fileInputRef.current?.click() // programmatically trigger hidden input
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesSelected(e.target.files)
    }
  }

  return (
    <div>
      {/* Hidden file input */}
      <Input
        id="files"
        type="file"
        multiple
        accept="image/*"
        capture={undefined}
        ref={fileInputRef}
        className="hidden"
        onChange={handleChange}
      />

      {/* Custom Button */}
      <Button
        type="button"
        disabled={loading}
        className="bg-yellow-900 text-yellow-200 text-sm px-4 py-2 rounded-lg shadow hover:bg-yellow-800"
        onClick={handleClick}
      >
        {loading ? (
          <span className="flex w-full items-center">
            <Loader2 className="h-4 w-4 animate-spin" />
          </span>
        ) : (
          "Upload Images"
        )}
      </Button>
    </div>
  )
}
